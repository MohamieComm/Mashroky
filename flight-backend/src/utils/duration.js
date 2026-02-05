export function parseISODurationToMinutes(iso) {
  if (!iso) return 0;
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(String(iso));
  const hours = match && match[1] ? Number(match[1]) : 0;
  const minutes = match && match[2] ? Number(match[2]) : 0;
  return hours * 60 + minutes;
}
