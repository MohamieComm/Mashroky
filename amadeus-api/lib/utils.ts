/** Format price with currency */
export function formatPrice(amount: string | number, currency = 'SAR'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

/** Format duration from ISO 8601 (PT2H30M) to human readable */
export function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const hours = match[1] ? `${match[1]}س` : '';
  const minutes = match[2] ? `${match[2]}د` : '';
  return `${hours} ${minutes}`.trim();
}

/** Format date to Arabic locale */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Format time from ISO datetime */
export function formatTime(datetime: string): string {
  return new Date(datetime).toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Calculate number of stops */
export function getStopsLabel(stops: number): string {
  if (stops === 0) return 'مباشر';
  if (stops === 1) return 'توقف واحد';
  if (stops === 2) return 'توقفان';
  return `${stops} توقفات`;
}

/** Truncate text */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/** CN classname helper */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
