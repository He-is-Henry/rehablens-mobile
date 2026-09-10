type LandmarkKey =
  | "leftShoulderPosition"
  | "leftElbowPosition"
  | "leftWristPosition"
  | "rightShoulderPosition"
  | "rightElbowPosition"
  | "rightWristPosition"
  | "leftHipPosition"
  | "rightHipPosition"
  | "leftKneePosition"
  | "rightKneePosition"
  | "leftAnklePosition"
  | "rightAnklePosition"
  | "nosePosition"
  | "leftEyePosition"
  | "rightEyePosition"
  | "leftEarPosition"
  | "rightEarPosition"
  | "leftMouthPosition"
  | "rightMouthPosition"
  | "leftIndexPosition"
  | "rightIndexPosition"
  | "leftPinkyPosition"
  | "rightPinkyPosition"
  | "leftThumbPosition"
  | "rightThumbPosition"
  | "leftFootIndexPosition"
  | "rightFootIndexPosition"
  | "leftHeelPosition"
  | "rightHeelPosition";

type Point = { x: number; y: number };
type Pose = Partial<Record<LandmarkKey, Point>>;

type AngleCheck = {
  label: string;
  a: LandmarkKey;
  b: LandmarkKey;
  c: LandmarkKey;
};

type RepTrigger = {
  a: LandmarkKey;
  b: LandmarkKey;
  c: LandmarkKey;
  targetAngle: number;
  targetDirection: "above" | "below";
  resetAngle: number;
  resetDirection: "above" | "below";
};

type RepTriggerCombinator = "all" | "any";

type RepStateInstructions = {
  rest: string;
  triggered: string;
  holding: string;
  returning: string;
};

type Exercise = {
  _id: string;
  name: string;
  description: string;
  instructions: string;
  targetReps: number;
  holdSeconds: number;
  angleChecks: AngleCheck[];
  repTriggers: RepTrigger[]; // ← was repTrigger (single)
  repTriggerCombinator: RepTriggerCombinator; // ← new, defaults to 'all'
  repStateInstructions: RepStateInstructions;
  cameraOrientation: "front" | "side";
  cameraOrientationTip: string;
};

type AssignmentStatus = "active" | "completed" | "paused" | "archived";

type Assignment = {
  _id: string;
  exerciseId: Exercise;
  assignedBy: { _id: string; name: string; customId: string } | string;
  patientId?: { _id: string; name: string; customId: string };
  hospitalId?: { _id: string; name: string; customId: string };
  status: AssignmentStatus;
  customReps?: number;
  customHoldSeconds?: number;
  notes?: string;
};

type RepState = "rest" | "triggered" | "holding" | "returning";

type CreateSessionResultPayload = {
  assignmentId: string;
  repsCompleted: number;
  targetReps: number;
  durationSeconds: number;
  status: "completed" | "abandoned";
};

type SessionResult = {
  _id: string;
  assignmentId: string;
  patientId: string;
  repsCompleted: number;
  targetReps: number;
  durationSeconds: number;
  status: "completed" | "abandoned";
  completedAt: string;
};

type PopulatedSessionResult = SessionResult & {
  assignmentId: Assignment;
};
