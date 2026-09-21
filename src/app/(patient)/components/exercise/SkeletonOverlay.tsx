import React from 'react';
import { StyleSheet, View } from 'react-native';
import { mapX } from './exerciseMath';

type Props = {
  pose: Pose;
  scaleX: number;
  scaleY: number;
  color: string;
};

export function SkeletonOverlay({ pose, scaleX, scaleY, color }: Props) {
  const linePairs: [string, string][] = [
    ['leftShoulderPosition', 'leftElbowPosition'],
    ['leftElbowPosition', 'leftWristPosition'],
    ['rightShoulderPosition', 'rightElbowPosition'],
    ['rightElbowPosition', 'rightWristPosition'],
    ['leftShoulderPosition', 'rightShoulderPosition'],
    ['leftShoulderPosition', 'leftHipPosition'],
    ['rightShoulderPosition', 'rightHipPosition'],
    ['leftHipPosition', 'rightHipPosition'],
    ['leftHipPosition', 'leftKneePosition'],
    ['leftKneePosition', 'leftAnklePosition'],
    ['rightHipPosition', 'rightKneePosition'],
    ['rightKneePosition', 'rightAnklePosition'],
  ];

  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];

  for (const [a, b] of linePairs) {
    const pa = pose[a as keyof Pose];
    const pb = pose[b as keyof Pose];
    if (pa && pb && (pa.x !== 0 || pa.y !== 0) && (pb.x !== 0 || pb.y !== 0)) {
      lines.push({
        x1: mapX(pa.x, scaleX),
        y1: pa.y * scaleY,
        x2: mapX(pb.x, scaleX),
        y2: pb.y * scaleY,
      });
    }
  }

  const validPoints = Object.values(pose).filter(
    (p): p is Point => Boolean(p) && (p.x !== 0 || p.y !== 0)
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {lines.map((line, i) => {
        const dx = line.x2 - line.x1;
        const dy = line.y2 - line.y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0) return null;

        const cx = (line.x1 + line.x2) / 2;
        const cy = (line.y1 + line.y2) / 2;
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

        return (
          <View
            key={`line-${i}`}
            style={[
              styles.skeletonLine,
              {
                width: length,
                left: cx - length / 2,
                top: cy - 2,
                backgroundColor: color,
                transform: [{ rotate: `${angle}deg` }],
              },
            ]}
          />
        );
      })}

      {validPoints.map((p, i) => {
        const px = mapX(p.x, scaleX);
        const py = p.y * scaleY;
        const outerSize = 16;
        const innerSize = 8;

        return (
          <React.Fragment key={`dot-${i}`}>
            <View
              style={[
                styles.dotHalo,
                {
                  width: outerSize,
                  height: outerSize,
                  borderRadius: outerSize / 2,
                  left: px - outerSize / 2,
                  top: py - outerSize / 2,
                  backgroundColor: color,
                },
              ]}
            />
            <View
              style={[
                styles.dotCore,
                {
                  width: innerSize,
                  height: innerSize,
                  borderRadius: innerSize / 2,
                  left: px - innerSize / 2,
                  top: py - innerSize / 2,
                },
              ]}
            />
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonLine: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  dotHalo: {
    position: 'absolute',
    opacity: 0.35,
    zIndex: 9,
  },
  dotCore: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
});