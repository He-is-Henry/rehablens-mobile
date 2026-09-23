const fs = require("fs");
const path = require("path");

const type = process.argv[2] || "patch"; // 'patch', 'minor', or 'major'

const pkgPath = path.resolve(__dirname, "../package.json");
const appJsonPath = path.resolve(__dirname, "../app.json");

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const app = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));

// Parse semver
const parts = pkg.version.split(".").map(Number);
let [major, minor, patch] = parts;

if (type === "major") {
  major += 1;
  minor = 0;
  patch = 0;
} else if (type === "minor") {
  minor += 1;
  patch = 0;
} else {
  patch += 1;
}

const newVersion = `${major}.${minor}.${patch}`;

// 1. Update version strings
pkg.version = newVersion;
app.expo.version = newVersion;

// Reset OTA version for the new native build
if (!app.expo.extra) app.expo.extra = {};
app.expo.extra.otaVersion = 0;

// 2. Increment Android versionCode
if (!app.expo.android) app.expo.android = {};
const currentCode = app.expo.android.versionCode || 0;
app.expo.android.versionCode = currentCode + 1;

// 3. Increment iOS buildNumber
if (!app.expo.ios) app.expo.ios = {};
const currentBuild = parseInt(app.expo.ios.buildNumber || "0", 10);
app.expo.ios.buildNumber = String(currentBuild + 1);

// Write back to files
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
fs.writeFileSync(appJsonPath, JSON.stringify(app, null, 2) + "\n");

console.log(`✅ Bumped to v${newVersion}`);
console.log(`   Android versionCode: ${app.expo.android.versionCode}`);
console.log(`   iOS buildNumber:     ${app.expo.ios.buildNumber}`);
