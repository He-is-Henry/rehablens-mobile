const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

const appConfigPath = path.join(__dirname, "../app.json");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

async function runOta() {
  try {
    console.log("\n========================================");
    console.log("       🚀 REHABLENS OTA DEPLOYER        ");
    console.log("========================================\n");

    // 1. Read app.json metadata
    const appConfig = JSON.parse(fs.readFileSync(appConfigPath, "utf8"));
    const currentVersion = appConfig.expo.version || "1.1.0";
    const currentOtaBuild = appConfig.expo.extra?.otaBuild || 0;
    const nextOtaBuild = currentOtaBuild + 1;
    const otaVersionTag = `v${currentVersion}-ota.${nextOtaBuild}`;

    console.log(
      `📌 Native Version: ${currentVersion} | Target Tag: ${otaVersionTag}\n`,
    );

    // 2. Prompt for user description and optional branch
    const message = await askQuestion(
      "❯ Enter update description (e.g., added notifications): ",
    );
    if (!message.trim()) {
      console.error("\n❌ Update message is required. Aborting.");
      process.exit(1);
    }

    const branchInput = await askQuestion(
      "❯ Enter branch (Press ENTER to pick interactively in EAS): ",
    );
    rl.close();

    const branch = branchInput.trim();

    // 3. Update app.json extra field
    appConfig.expo.extra = {
      ...appConfig.expo.extra,
      otaBuild: nextOtaBuild,
      otaVersion: otaVersionTag,
    };
    fs.writeFileSync(appConfigPath, JSON.stringify(appConfig, null, 2));
    console.log("\n📝 Updated app.json with new OTA build info.");

    // 4. Run EAS Update (If branch is omitted, EAS brings up its arrow-key picker)
    const sanitizedMsg = message.trim().replace(/"/g, '\\"');
    let easCmd = `npx eas update --message "${sanitizedMsg}"`;
    if (branch) {
      easCmd += ` --branch ${branch}`;
    }

    console.log("\n📤 Launching EAS Update...");
    execSync(easCmd, { stdio: "inherit" });

    // 5. Construct Git Commit Message & Tag
    const commitScope = branch ? `ota(${branch})` : "ota";
    const commitMsg = `${commitScope}: ${message.trim()} [${otaVersionTag}]`;

    console.log("\n🏷️  Creating Git commit and tag...");
    execSync("git add app.json", { stdio: "inherit" });
    execSync(`git commit -m "${commitMsg}"`, { stdio: "inherit" });
    execSync(`git tag -a "${otaVersionTag}" -m "${message.trim()}"`, {
      stdio: "inherit",
    });

    // 6. Push Commit and Tag to Remote Repository
    console.log("\n⬆️  Pushing tags to remote repository...");
    execSync("git push origin HEAD --follow-tags", { stdio: "inherit" });

    console.log(`\n========================================`);
    console.log(`✅ DEPLOYMENT COMPLETE`);
    console.log(`   • Commit Message : "${commitMsg}"`);
    console.log(`   • Git Tag        : ${otaVersionTag}`);
    console.log(`========================================\n`);
  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message || error);
    process.exit(1);
  }
}

runOta();
