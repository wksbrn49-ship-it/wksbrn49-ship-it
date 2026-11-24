export function calculateOnDemandRideFare(
  distanceKm: number,
  durationMinutes: number
): number {
  const baseFare = 200;
  const distanceFare = distanceKm * 50;
  const timeFare = durationMinutes * 5;

  return Math.round((baseFare + distanceFare + timeFare) * 1.1);
}
