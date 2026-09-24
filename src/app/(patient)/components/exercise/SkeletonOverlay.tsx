import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { mapX } from './exerciseMath';

type Props = {
  pose: SharedValue<Pose | null>;
  scaleX: number;
  scaleY: number;
  color: string;
};

const LINE_PAIRS: [LandmarkKey, LandmarkKey][] = [
  // Upper Body
  ['leftShoulderPosition', 'leftElbowPosition'],
  ['leftElbowPosition', 'leftWristPosition'],
  ['rightShoulderPosition', 'rightElbowPosition'],
  ['rightElbowPosition', 'rightWristPosition'],
  ['leftShoulderPosition', 'rightShoulderPosition'],

  // Hands / Fingers
  ['leftWristPosition', 'leftIndexPosition'],
  ['rightWristPosition', 'rightIndexPosition'],

  // Torso
  ['leftShoulderPosition', 'leftHipPosition'],
  ['rightShoulderPosition', 'rightHipPosition'],
  ['leftHipPosition', 'rightHipPosition'],

  // Lower Body
  ['leftHipPosition', 'leftKneePosition'],
  ['leftKneePosition', 'leftAnklePosition'],
  ['rightHipPosition', 'rightKneePosition'],
  ['rightKneePosition', 'rightAnklePosition'],

  // Feet
  ['leftAnklePosition', 'leftHeelPosition'],
  ['leftHeelPosition', 'leftFootIndexPosition'],
  ['rightAnklePosition', 'rightHeelPosition'],
  ['rightHeelPosition', 'rightFootIndexPosition'],
];

const ALL_LANDMARKS: LandmarkKey[] = [
  'nosePosition',
  'leftEyePosition',
  'rightEyePosition',
  'leftEarPosition',
  'rightEarPosition',
  'leftShoulderPosition',
  'rightShoulderPosition',
  'leftElbowPosition',
  'rightElbowPosition',
  'leftWristPosition',
  'rightWristPosition',
  'leftIndexPosition',
  'rightIndexPosition',
  'leftHipPosition',
  'rightHipPosition',
  'leftKneePosition',
  'rightKneePosition',
  'leftAnklePosition',
  'rightAnklePosition',
  'leftHeelPosition',
  'rightHeelPosition',
  'leftFootIndexPosition',
  'rightFootIndexPosition',
];

interface BoneLineProps {
  pose: SharedValue<Pose | null>;
  keyA: LandmarkKey;
  keyB: LandmarkKey;
  scaleX: number;
  scaleY: number;
  color: string;
}

function BoneLine({ pose, keyA, keyB, scaleX, scaleY, color }: BoneLineProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const currentPose = pose.value;
    if (!currentPose) return { opacity: 0 };

    const pa = currentPose[keyA];
    const pb = currentPose[keyB];

    if (!pa || !pb || (pa.x === 0 && pa.y === 0) || (pb.x === 0 && pb.y === 0)) {
      return { opacity: 0 };
    }

    const x1 = mapX(pa.x, scaleX);
    const y1 = pa.y * scaleY;
    const x2 = mapX(pb.x, scaleX);
    const y2 = pb.y * scaleY;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return { opacity: 0 };

    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    return {
      opacity: 1,
      width: length,
      left: cx - length / 2,
      top: cy - 2,
      backgroundColor: color,
      transform: [{ rotate: `${angle}deg` }],
    };
  });

  return <Animated.View style={[styles.skeletonLine, animatedStyle]} />;
}

interface NeckLineProps {
  pose: SharedValue<Pose | null>;
  scaleX: number;
  scaleY: number;
  color: string;
}

function NeckLine({ pose, scaleX, scaleY, color }: NeckLineProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const currentPose = pose.value;
    if (!currentPose) return { opacity: 0 };

    const ls = currentPose.leftShoulderPosition;
    const rs = currentPose.rightShoulderPosition;
    const nose = currentPose.nosePosition;

    if (
      !ls ||
      !rs ||
      !nose ||
      (!ls.x && !ls.y) ||
      (!rs.x && !rs.y) ||
      (!nose.x && !nose.y)
    ) {
      return { opacity: 0 };
    }

    const midShoulderX = (ls.x + rs.x) / 2;
    const midShoulderY = (ls.y + rs.y) / 2;

    const x1 = mapX(midShoulderX, scaleX);
    const y1 = midShoulderY * scaleY;
    const x2 = mapX(nose.x, scaleX);
    const y2 = nose.y * scaleY;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return { opacity: 0 };

    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    return {
      opacity: 1,
      width: length,
      left: cx - length / 2,
      top: cy - 2,
      backgroundColor: color,
      transform: [{ rotate: `${angle}deg` }],
    };
  });

  return <Animated.View style={[styles.skeletonLine, animatedStyle]} />;
}

interface JointNodeProps {
  pose: SharedValue<Pose | null>;
  landmarkKey: LandmarkKey;
  scaleX: number;
  scaleY: number;
  color: string;
}

function JointNode({
  pose,
  landmarkKey,
  scaleX,
  scaleY,
  color,
}: JointNodeProps) {
  const outerSize = 14;
  const innerSize = 6;

  const haloAnimatedStyle = useAnimatedStyle(() => {
    const currentPose = pose.value;
    if (!currentPose) return { opacity: 0 };

    const p = currentPose[landmarkKey];
    if (!p || (p.x === 0 && p.y === 0)) {
      return { opacity: 0 };
    }

    const px = mapX(p.x, scaleX);
    const py = p.y * scaleY;

    return {
      opacity: 0.3,
      left: px - outerSize / 2,
      top: py - outerSize / 2,
      backgroundColor: color,
    };
  });

  const coreAnimatedStyle = useAnimatedStyle(() => {
    const currentPose = pose.value;
    if (!currentPose) return { opacity: 0 };

    const p = currentPose[landmarkKey];
    if (!p || (p.x === 0 && p.y === 0)) {
      return { opacity: 0 };
    }

    const px = mapX(p.x, scaleX);
    const py = p.y * scaleY;

    return {
      opacity: 1,
      left: px - innerSize / 2,
      top: py - innerSize / 2,
    };
  });

  return (
    <>
      <Animated.View style={[styles.dotHalo, haloAnimatedStyle]} />
      <Animated.View style={[styles.dotCore, coreAnimatedStyle]} />
    </>
  );
}

export function SkeletonOverlay({ pose, scaleX, scaleY, color }: Props) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Standard Bones */}
      {LINE_PAIRS.map(([a, b]) => (
        <BoneLine
          key={`${a}-${b}`}
          pose={pose}
          keyA={a}
          keyB={b}
          scaleX={scaleX}
          scaleY={scaleY}
          color={color}
        />
      ))}

      {/* Neck Line */}
      <NeckLine
        pose={pose}
        scaleX={scaleX}
        scaleY={scaleY}
        color={color}
      />

      {/* Joint Nodes */}
      {ALL_LANDMARKS.map((key) => (
        <JointNode
          key={key}
          pose={pose}
          landmarkKey={key}
          scaleX={scaleX}
          scaleY={scaleY}
          color={color}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonLine: {
    position: 'absolute',
    height: 3,
    borderRadius: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  dotHalo: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    zIndex: 9,
  },
  dotCore: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
});