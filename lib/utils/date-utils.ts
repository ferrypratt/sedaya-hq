/**
 * Standard Date Utility for Sedaya HQ
 * Centralized dynamic date resolution for client components,
 * ensuring resilience against Next.js 16 SSR/PPR prerender issues.
 */

export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

export const INDONESIAN_DAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu'
];

/**
 * Returns today's date formatted as YYYY-MM-DD in user's local timezone.
 */
export function getClientTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns yesterday's date formatted as YYYY-MM-DD.
 */
export function getYesterdayString(baseDateStr?: string): string {
  const d = baseDateStr ? new Date(baseDateStr + 'T00:00:00') : new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns tomorrow's date formatted as YYYY-MM-DD (e.g. for Carry Over).
 */
export function getNextDayString(baseDateStr?: string): string {
  const d = baseDateStr ? new Date(baseDateStr + 'T00:00:00') : new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the date range for the current week (Monday to Sunday) in YYYY-MM-DD format.
 */
export function getCurrentWeekRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1 is Monday, ...
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  return {
    start: formatDate(monday),
    end: formatDate(sunday)
  };
}

/**
 * Formats YYYY-MM-DD string to standard Indonesian display format.
 * Example: '2026-10-16' => 'Jumat, 16 Oktober 2026' (or '16 Oktober 2026' if withDayName: false)
 */
/**
 * Formats YYYY-MM-DD string to standard Indonesian display format.
 * Deterministic and pure mathematical (no new Date() invocation during render).
 * Example: '2026-10-16' => 'Jumat, 16 Oktober 2026' (or '16 Oktober 2026' if withDayName: false)
 */
export function formatDisplayDateIndonesian(
  dateStr: string,
  options?: { withDayName?: boolean; shortMonth?: boolean }
): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return dateStr;

    // Sakamoto's algorithm for day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
    const calcYear = m < 3 ? y - 1 : y;
    const dayOfWeek = (calcYear + Math.floor(calcYear / 4) - Math.floor(calcYear / 100) + Math.floor(calcYear / 400) + t[m - 1] + d) % 7;

    const dayName = INDONESIAN_DAYS[dayOfWeek] || '';
    let monthName = INDONESIAN_MONTHS[m - 1] || '';
    if (options?.shortMonth && monthName.length > 3) {
      monthName = monthName.substring(0, 3);
    }

    if (options?.withDayName ?? true) {
      return `${dayName}, ${d} ${monthName} ${y}`;
    }
    return `${d} ${monthName} ${y}`;
  } catch {
    return dateStr;
  }
}
