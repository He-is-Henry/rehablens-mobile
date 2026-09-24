export const FRAME_W = 480;
export const FRAME_H = 640;

export function mapX(x: number, scaleX: number): number {
  "worklet";
  return (FRAME_W - x) * scaleX;
}

export function getAngle(
  pose: Pose | any,
  check: { a: LandmarkKey; b: LandmarkKey; c: LandmarkKey },
): number | null {
  "worklet";
  if (!pose || !check) return null;

  const rawLandmarks = pose.landmarks ?? pose.keypoints ?? pose;

  // Safe landmark resolver for snake_case / camelCase
  const getPoint = (key: string) => {
    if (!key || !rawLandmarks) return undefined;
    if (Array.isArray(rawLandmarks)) {
      return rawLandmarks.find((p: any) => p.name === key || p.id === key);
    }
    const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase(),
    );
    return rawLandmarks[key] ?? rawLandmarks[camelKey];
  };

  const p1 = getPoint(check.a);
  const p2 = getPoint(check.b);
  const p3 = getPoint(check.c);

  if (
    (p1.x === 0 && p1.y === 0) ||
    (p2.x === 0 && p2.y === 0) ||
    (p3.x === 0 && p3.y === 0)
  ) {
    return null;
  }

  const rad1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
  const rad2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
  let angle = Math.abs(((rad1 - rad2) * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;

  if (isNaN(angle)) return null;

  const finalAngle = Math.round(angle);

  return finalAngle;
}
export function meetsTrigger(
  pose: Pose,
  trigger: RepTrigger,
  phase: "target" | "reset",
): boolean {
  "worklet";
  const currentAngle = getAngle(pose, {
    a: trigger.a,
    b: trigger.b,
    c: trigger.c,
  });
  if (currentAngle === null) return false;

  const targetAngle =
    phase === "target" ? trigger.targetAngle : trigger.resetAngle;
  const direction =
    phase === "target" ? trigger.targetDirection : trigger.resetDirection;

  if (direction === "below") return currentAngle <= targetAngle;
  if (direction === "above") return currentAngle >= targetAngle;
  return false;
}

export function meetsAllOrAny(
  pose: Pose,
  triggers: RepTrigger[],
  combinator: RepTriggerCombinator,
  phase: "target" | "reset",
): boolean {
  "worklet";
  if (!triggers || triggers.length === 0) return false;
  if (combinator === "any") {
    return triggers.some((t) => meetsTrigger(pose, t, phase));
  }
  return triggers.every((t) => meetsTrigger(pose, t, phase));
}
