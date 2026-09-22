// A gentle 12-second visual loop, not a planned or validated robot trajectory.
export function getYamDemoJointValues(
  elapsedSeconds: number,
  side: "left" | "right",
) {
  const phase =
    (elapsedSeconds * Math.PI * 2 * (side === "left" ? 1 : -1)) / 12;
  const degreesToRadians = Math.PI / 180;
  const slowWave = Math.sin(phase);
  const fastWave = Math.sin(phase * 2);
  const fingerTravel = -0.02 - 0.012 * fastWave;
  return {
    joint1: 10 * degreesToRadians * slowWave,
    joint2: Math.PI / 3 + 8 * degreesToRadians * slowWave,
    joint3: Math.PI / 3 + 12 * degreesToRadians * slowWave,
    joint4: 12 * degreesToRadians * fastWave,
    joint5: 8 * degreesToRadians * slowWave,
    joint6: 10 * degreesToRadians * fastWave,
    joint7: fingerTravel,
    joint8: fingerTravel,
  };
}
