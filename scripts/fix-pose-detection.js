const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "../node_modules/@scottjgilroy/react-native-vision-camera-v4-pose-detection/android/src/main/java/com/visioncamerav3posedetection/VisionCameraV3PoseDetectionModule.kt",
);

let content = fs.readFileSync(filePath, "utf8");

content = content.replace(
  "return map.toHashMap() as HashMap<String, Any?>",
  "return map.toHashMap() as HashMap<String, Any>",
);

fs.writeFileSync(filePath, content, "utf8");
console.log("✓ Patch applied successfully");
