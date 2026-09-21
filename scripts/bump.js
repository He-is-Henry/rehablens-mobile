const fs = require('fs');
const path = require('path');

const bumpType = process.argv[2] || 'patch'; // 'patch', 'minor', or 'major'

const packageJsonPath = path.join(__dirname, '../package.json');
const appJsonPath = path.join(__dirname, '../app.json');

if (!fs.existsSync(packageJsonPath) || !fs.existsSync(appJsonPath)) {
  console.error('Error: package.json or app.json not found.');
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const app = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Parse semver
let [major, minor, patch] = pkg.version.split('.').map(Number);

if (bumpType === 'major') {
  major += 1;
  minor = 0;
  patch = 0;
} else if (bumpType === 'minor') {
  minor += 1;
  patch = 0;
} else {
  patch += 1;
}

const newVersion = `${major}.${minor}.${patch}`;

// Update package.json
pkg.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');

// Update app.json (Expo)
if (app.expo) {
  app.expo.version = newVersion;

  if (app.expo.android) {
    app.expo.android.versionCode = (app.expo.android.versionCode || 0) + 1;
  }

  if (app.expo.ios) {
    const currentBuild = parseInt(app.expo.ios.buildNumber || '0', 10);
    app.expo.ios.buildNumber = String(currentBuild + 1);
  }

  fs.writeFileSync(appJsonPath, JSON.stringify(app, null, 2) + '\n');
}

console.log(`Successfully bumped to v${newVersion}`);
if (app.expo?.android?.versionCode) {
  console.log(`Android versionCode: ${app.expo.android.versionCode}`);
}
if (app.expo?.ios?.buildNumber) {
  console.log(`iOS buildNumber: ${app.expo.ios.buildNumber}`);
}
