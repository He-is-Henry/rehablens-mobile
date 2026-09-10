const fs = require("fs");
const path = require("path");

const src = path.join(
  __dirname,
  "../patches-manual/VisionCameraV3PoseDetectionModule.kt",
);
const dest = path.join(
  __dirname,
  "../node_modules/@scottjgilroy/react-native-vision-camera-v4-pose-detection/android/src/main/java/com/visioncamerav3posedetection/VisionCameraV3PoseDetectionModule.kt",
);

fs.copyFileSync(src, dest);
console.log("✓ Patch applied successfully");
