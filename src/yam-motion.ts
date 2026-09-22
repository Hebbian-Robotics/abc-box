type ArmAngles = readonly [number, number, number, number, number, number];

interface DemoKeyframe {
  seconds: number;
  anglesDegrees: ArmAngles;
  fingerTravel: number;
}

const rest: ArmAngles = [0, 60, 60, 0, 0, 0];
// Downward-facing pickup and placement poses fitted to the pinned YAM URDF.
// Coordinates are approximate display poses, not commands for a real robot.
const abovePick: ArmAngles = [-20.21, 130.19, 131.22, -91.03, 0, -20.21];
const pick: ArmAngles = [-20.21, 128.93, 105.07, -66.13, 0, -20.21];
const lifted: ArmAngles = [-10, 80, 100, -75, 0, -10];
const transferred: ArmAngles = [20, 75, 95, -70, 0, 20];
const abovePlace: ArmAngles = [34.01, 85.46, 76.92, -81.45, 0, 34.01];
const place: ArmAngles = [34.01, 90, 52.17, -52.16, 0, 34.01];
const openFingers = -0.004;
const closedFingers = -0.03;
const playbackSpeed = 2;

const keyframes: readonly DemoKeyframe[] = [
  { seconds: 0, anglesDegrees: rest, fingerTravel: -0.02 },
  { seconds: 2, anglesDegrees: abovePick, fingerTravel: openFingers },
  { seconds: 4, anglesDegrees: pick, fingerTravel: openFingers },
  { seconds: 5, anglesDegrees: pick, fingerTravel: closedFingers },
  { seconds: 7, anglesDegrees: lifted, fingerTravel: closedFingers },
  { seconds: 9, anglesDegrees: transferred, fingerTravel: closedFingers },
  { seconds: 10, anglesDegrees: abovePlace, fingerTravel: closedFingers },
  { seconds: 12, anglesDegrees: place, fingerTravel: closedFingers },
  { seconds: 13, anglesDegrees: place, fingerTravel: openFingers },
  { seconds: 14.5, anglesDegrees: abovePlace, fingerTravel: openFingers },
  { seconds: 16, anglesDegrees: lifted, fingerTravel: openFingers },
  { seconds: 18, anglesDegrees: rest, fingerTravel: -0.02 },
];

export function getYamDemoJointValues(
  elapsedSeconds: number,
  side: "left" | "right",
) {
  const timelineSeconds = elapsedSeconds * playbackSpeed;
  const loopSeconds = ((timelineSeconds % 18) + 18) % 18;
  const destinationIndex = keyframes.findIndex(
    (keyframe) => keyframe.seconds > loopSeconds,
  );
  const start = keyframes[destinationIndex - 1];
  const end = keyframes[destinationIndex];
  if (!start || !end) throw new Error("Missing YAM animation keyframe.");
  const progress =
    (loopSeconds - start.seconds) / (end.seconds - start.seconds);
  // Zero velocity and acceleration at each waypoint, including the loop seam.
  const easedProgress =
    progress ** 3 * (10 - 15 * progress + 6 * progress ** 2);
  const interpolate = (first: number, second: number) =>
    first + (second - first) * easedProgress;
  const angle = (index: 0 | 1 | 2 | 3 | 4 | 5) =>
    (interpolate(start.anglesDegrees[index], end.anglesDegrees[index]) *
      Math.PI) /
    180;
  // Each arm transfers from an outer/deeper pickup to an inner/nearer placement.
  const mirroredDirection = side === "left" ? 1 : -1;
  const fingerTravel = interpolate(start.fingerTravel, end.fingerTravel);
  return {
    joint1: mirroredDirection * angle(0),
    joint2: angle(1),
    joint3: angle(2),
    joint4: angle(3),
    joint5: angle(4),
    joint6: mirroredDirection * angle(5),
    joint7: fingerTravel,
    joint8: fingerTravel,
  };
}
