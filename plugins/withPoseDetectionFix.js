const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function withPoseDetectionFix(config) {
  return withDangerousMod(config, [
    "android",
    (config) => {
      const filePath = path.join(
        config.modRequest.projectRoot,
        "node_modules/@scottjgilroy/react-native-vision-camera-v4-pose-detection/android/src/main/java/com/visioncamerav3posedetection/VisionCameraV3PoseDetectionModule.kt",
      );
      let content = fs.readFileSync(filePath, "utf8");

      const target = "      return map.toHashMap()";
      if (!content.includes(target)) {
        throw new Error(
          "[withPoseDetectionFix] Expected string not found — the package may have updated. Check the file manually.",
        );
      }

      content = content.replace(
        target,
        "      return map.toHashMap() as HashMap<String, Any>",
      );
      fs.writeFileSync(filePath, content, "utf8");
      console.log("[withPoseDetectionFix] ✓ Patch applied");
      return config;
    },
  ]);
};
