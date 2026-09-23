const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const spawn = require("cross-spawn"); // npm install cross-spawn
const readline = require("readline");

const appConfigPath = path.join(__dirname, "../app.json");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

// Central place to translate raw failures into something you can actually act on.
// Each stage tags its own errors so the catch block doesn't have to guess.
class StageError extends Error {
  constructor(stage, message, cause) {
    super(message);
    this.stage = stage; // e.g. "config-read", "eas-spawn", "eas-exit", "git"
    this.cause = cause;
  }
}

const VALID_PLATFORMS = ["android", "ios", "all"];
const VALID_ENVIRONMENTS = ["development", "preview", "production"];

async function runOta() {
  let otaPublished = false;
  let configWritten = false;
  let nextOtaVersion; // hoisted: catch block needs this even if a later step throws
  let previousOtaVersion;
  let otaVersionTag;
  let currentVersion;
  let message;
  let branch;
  let platform;
  let environment;
  let appConfig;

  try {
    console.log("\n========================================");
    console.log("       🚀 REHABLENS OTA DEPLOYER        ");
    console.log("========================================\n");

    // 1. Read app.json metadata
    try {
      appConfig = JSON.parse(fs.readFileSync(appConfigPath, "utf8"));
    } catch (err) {
      throw new StageError(
        "config-read",
        `Could not read/parse app.json at ${appConfigPath}`,
        err,
      );
    }

    currentVersion = appConfig.expo.version || "1.1.0";
    const currentOtaVersion = appConfig.expo.extra?.otaVersion || 0;
    previousOtaVersion = currentOtaVersion; // snapshot, used to revert if EAS publish fails
    nextOtaVersion = currentOtaVersion + 1;
    otaVersionTag = `v${currentVersion}-ota.${nextOtaVersion}`;

    console.log(
      `📌 Native Version: ${currentVersion} | OTA: ${nextOtaVersion} | Target Tag: ${otaVersionTag}`,
    );

    // 2. Prompt for update description, branch, platform, and environment
    message = await askQuestion(
      "❯ Enter update description (e.g., added notifications): ",
    );

    if (!message.trim()) {
      console.error("\n❌ Update message is required. Aborting.");
      rl.close();
      process.exit(1);
    }

    const branchInput = await askQuestion(
      "❯ Enter branch (Press ENTER to pick interactively in EAS): ",
    );
    branch = branchInput.trim();

    const platformInput = await askQuestion(
      "❯ Enter platform (android/ios/all) [default: android]: ",
    );
    platform = platformInput.trim().toLowerCase() || "android";

    if (!VALID_PLATFORMS.includes(platform)) {
      console.error(
        `\n❌ Invalid platform "${platform}". Must be one of: ${VALID_PLATFORMS.join(", ")}. Aborting.`,
      );
      rl.close();
      process.exit(1);
    }

    const environmentInput = await askQuestion(
      "❯ Enter environment (development/preview/production) [default: preview]: ",
    );
    environment = environmentInput.trim().toLowerCase() || "preview";

    if (!VALID_ENVIRONMENTS.includes(environment)) {
      console.error(
        `\n❌ Invalid environment "${environment}". Must be one of: ${VALID_ENVIRONMENTS.join(", ")}. Aborting.`,
      );
      rl.close();
      process.exit(1);
    }

    rl.close();

    // Give stdin back to the process cleanly so the child can inherit
    // a normal TTY (readline puts stdin in a mode that can confuse
    // a child's raw-mode prompts if not released first).
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    process.stdin.pause();

    // 3. Write the new otaVersion into app.json BEFORE publishing.
    // `eas update` snapshots the current app.json into the update's
    // manifest at publish time — writing this after publish (the old
    // order) meant the published manifest always carried the STALE
    // otaVersion, which is why the in-app footer stayed at 0.
    try {
      appConfig.expo.extra = {
        ...appConfig.expo.extra,
        otaVersion: nextOtaVersion,
      };
      fs.writeFileSync(
        appConfigPath,
        JSON.stringify(appConfig, null, 2) + "\n",
      );
      configWritten = true;
      console.log(`📝 Updated app.json: otaVersion = ${nextOtaVersion}`);
    } catch (err) {
      throw new StageError(
        "config-write",
        `Failed to write app.json before publishing: ${err.message}`,
        err,
      );
    }

    // 4. Run EAS Update — fully interactive (arrow keys, branch picker, etc. all work)
    console.log("\n📤 Launching EAS Update...\n");

    // --environment forces EAS to pull EXPO_PUBLIC_* vars from EAS-hosted
    // environment variables instead of whatever local .env happens to be
    // present at deploy time.
    const easArgs = [
      "eas",
      "update",
      "--message",
      message.trim(),
      "--platform",
      platform,
      "--environment",
      environment,
    ];

    if (branch) {
      easArgs.push("--branch", branch);
    }

    let easResult;
    try {
      easResult = await new Promise((resolve, reject) => {
        // cross-spawn handles Windows .cmd resolution AND correct arg
        // quoting without needing shell:true — which was the actual
        // cause of both the EINVAL and the mangled message.
        const child = spawn("npx", easArgs, {
          stdio: "inherit",
        });

        child.on("error", (err) => {
          // This fires when the OS fails to even launch the process
          // (bad path, EINVAL, permissions) — distinct from EAS running
          // and then failing internally.
          reject(
            new StageError(
              "eas-spawn",
              `Failed to launch EAS process: ${err.message}`,
              err,
            ),
          );
        });

        child.on("close", (code) => resolve(code));
      });
    } catch (err) {
      revertConfigWrite();
      throw err;
    }

    if (easResult !== 0) {
      revertConfigWrite();
      throw new StageError(
        "eas-exit",
        `EAS Update exited with code ${easResult}. app.json was reverted — nothing was published.`,
      );
    }

    otaPublished = true;
    console.log("\n✅ EAS Update completed successfully.");
    // From this point on, app.json's otaVersion matches what's already
    // live in the published manifest — it must NOT be reverted even if
    // a later step (git) fails, or the local file would lie about
    // what's actually deployed.

    // 5. Construct Git commit message and tag
    const commitScope = branch ? `ota(${branch})` : "ota";
    const commitMsg = `${commitScope}: ${message.trim()} [${otaVersionTag}] [${platform}/${environment}]`;

    console.log("\n🏷️  Creating Git commit and tag...");

    try {
      execSync("git add app.json", { stdio: "inherit" });
      execSync(`git commit -m "${commitMsg}"`, { stdio: "inherit" });
      execSync(`git tag -a "${otaVersionTag}" -m "${message.trim()}"`, {
        stdio: "inherit",
      });
    } catch (err) {
      throw new StageError(
        "git-commit",
        `Published OTA (app.json otaVersion=${nextOtaVersion} is correct and already live), but git commit/tag failed: ${err.message}`,
        err,
      );
    }

    // 6. Push commit and tag
    console.log("\n⬆️  Pushing commit and tag to remote repository...");
    try {
      execSync("git push origin HEAD --follow-tags", { stdio: "inherit" });
    } catch (err) {
      throw new StageError(
        "git-push",
        `Published OTA and committed locally, but push failed: ${err.message}`,
        err,
      );
    }

    console.log("\n========================================");
    console.log("       ✅ DEPLOYMENT COMPLETE           ");
    console.log("========================================");
    console.log(`   • Native Version : ${currentVersion}`);
    console.log(`   • OTA Version    : ${nextOtaVersion}`);
    console.log(`   • Platform       : ${platform}`);
    console.log(`   • Environment    : ${environment}`);
    console.log(`   • Git Tag        : ${otaVersionTag}`);
    console.log(`   • Commit Message : "${commitMsg}"`);
    console.log("========================================\n");
  } catch (error) {
    const stage = error instanceof StageError ? error.stage : "unknown";
    console.error(`\n❌ Deployment failed at stage [${stage}]:`, error.message);
    if (error.cause) {
      console.error("   Underlying cause:", error.cause.message || error.cause);
    }

    if (otaPublished) {
      console.error(
        "\n⚠️  IMPORTANT: The OTA was successfully published to EAS.",
      );
      console.error(
        "   app.json's otaVersion is correct and matches what's live —",
      );
      console.error(
        "   do NOT re-run this script. Just fix and finish the git steps manually:",
      );
      console.error(`   git add app.json`);
      console.error(`   git commit -m "..."`);
      console.error(`   git tag -a "${otaVersionTag}" -m "..."`);
      console.error(`   git push origin HEAD --follow-tags`);
      console.error(`   • OTA version already live: ${nextOtaVersion}`);
      console.error(`   • Expected tag: ${otaVersionTag}`);
    } else {
      console.error(
        "\nℹ️  EAS did not complete successfully — nothing was published.",
      );
      console.error("   app.json was reverted to its previous state.");
      if (nextOtaVersion !== undefined) {
        console.error(`   OTA ${nextOtaVersion} remains available for retry.`);
      }
    }

    process.exit(1);
  }

  function revertConfigWrite() {
    if (!configWritten) return;
    try {
      appConfig.expo.extra = {
        ...appConfig.expo.extra,
        otaVersion: previousOtaVersion,
      };
      fs.writeFileSync(
        appConfigPath,
        JSON.stringify(appConfig, null, 2) + "\n",
      );
      console.error(
        `↩️  Reverted app.json otaVersion back to ${previousOtaVersion}`,
      );
    } catch (revertErr) {
      console.error(
        "⚠️  Also failed to revert app.json — fix manually:",
        revertErr.message,
      );
    }
  }
}

runOta();
