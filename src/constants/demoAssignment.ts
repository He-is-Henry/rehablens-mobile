export const DEMO_ASSIGNMENT: Assignment = {
  _id: "demo-001",
  status: "active",
  customReps: 5,
  customHoldSeconds: 1,
  notes: "Focus on full extension. Keep elbow close to your body.",
  assignedBy: "Dr. Chidi Okafor",
  exerciseId: {
    _id: "exercise-001",
    name: "Left Bicep Curl",
    description: "Curl your left arm up toward your shoulder and hold briefly.",
    instructions:
      "Stand or sit upright. Start with your arm fully extended downward. Curl your left forearm up toward your shoulder, hold for 1 second, then lower back down. That is one rep.",
    targetReps: 5,
    holdSeconds: 1,
    angleChecks: [
      {
        label: "Left elbow angle",
        a: "leftShoulderPosition",
        b: "leftElbowPosition",
        c: "leftWristPosition",
      },
    ],
    repTriggers: [
      {
        a: "leftShoulderPosition",
        b: "leftElbowPosition",
        c: "leftWristPosition",
        targetAngle: 60, // fully curled — elbow angle should be ~60°
        targetDirection: "below",
        resetAngle: 150, // fully extended — elbow angle should be ~150°+
        resetDirection: "above",
      },
    ],
    repTriggerCombinator: "all",
    repStateInstructions: {
      rest: "Curl your left arm up toward your shoulder",
      triggered: "Good — hold it there",
      holding: "Keep holding...",
      returning: "Slowly lower your arm back down until it is fully extended",
    },
    cameraOrientation: "side",
    cameraOrientationTip:
      "Turn so your left side faces the camera. Your elbow and shoulder should be clearly visible.",
  },
};
