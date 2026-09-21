const fs = require("fs");
const path = require("path");

const bumpType = process.argv[2] || "patch"; // 'patch', 'minor', or 'major'

// Smart path resolution (checks current directory, then parent if inside /scripts)
let rootDir = __dirname;
if (
  !fs.existsSync(path.join(rootDir, "package.json")) &&
  fs.existsSync(path.join(rootDir, "../package.json"))
) {
  rootDir = path.join(__dirname, "..");
}

const packageJsonPath = path.join(rootDir, "package.json");
const appJsonPath = path.join(rootDir, "app.json");

if (!fs.existsSync(packageJsonPath) || !fs.existsSync(appJsonPath)) {
  console.error(`Error: package.json or app.json not found in ${rootDir}`);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const app = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));

// Use package.json version as source, fallback to app.json version
const currentVersion = pkg.version || app.expo?.version || "1.0.0";

// Strip non-numeric prefixes (e.g. "v1.0.2" -> "1.0.2")
const cleanVersion = currentVersion.replace(/^v/, "");
let [major, minor, patch] = cleanVersion
  .split(".")
  .map((n) => parseInt(n, 10) || 0);

if (bumpType === "major") {
  major += 1;
  minor = 0;
  patch = 0;
} else if (bumpType === "minor") {
  minor += 1;
  patch = 0;
} else {
  patch += 1;
}

const newVersion = `${major}.${minor}.${patch}`;

// 1. Write to package.json
pkg.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + "\n");

// 2. Write to app.json (Expo)
if (app.expo) {
  app.expo.version = newVersion;

  if (app.expo.android) {
    app.expo.android.versionCode = (app.expo.android.versionCode || 0) + 1;
  }

  if (app.expo.ios) {
    const currentBuild = parseInt(app.expo.ios.buildNumber || "0", 10);
    app.expo.ios.buildNumber = String(currentBuild + 1);
  }

  fs.writeFileSync(appJsonPath, JSON.stringify(app, null, 2) + "\n");
}

console.log(`Bumped version: ${currentVersion} -> v${newVersion}`);
console.log(`Updated both package.json & app.json`);
if (app.expo?.android?.versionCode) {
  console.log(`Android versionCode: ${app.expo.android.versionCode}`);
}
if (app.expo?.ios?.buildNumber) {
  console.log(`iOS buildNumber: ${app.expo.ios.buildNumber}`);
}
