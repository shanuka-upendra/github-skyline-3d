import type { ContributionDay, DayCell } from './types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function parseLocalDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return new Date(isoDate);
  return new Date(y, m - 1, d);
}

/**
 * Normalizes a flat array of daily contributions into a (weeks x 7) grid.
 */
export function buildSkylineGrid(days: ContributionDay[], weeks: number): DayCell[] {
  const safeWeeks = Math.max(1, Math.min(52, Math.floor(weeks)));
  const totalSlots = safeWeeks * 7;

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const sliced = sorted.slice(-totalSlots);

  // Pad front if fewer days than totalSlots were provided
  const padCount = Math.max(0, totalSlots - sliced.length);
  const padded: ContributionDay[] = [];

  if (padCount > 0) {
    const firstDate = sliced[0] ? parseLocalDate(sliced[0].date) : new Date();
    for (let i = padCount; i > 0; i--) {
      const d = new Date(firstDate);
      d.setDate(firstDate.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      padded.push({ date: `${yyyy}-${mm}-${dd}`, count: 0 });
    }
  }

  const combined = [...padded, ...sliced];

  return combined.map((entry, idx) => {
    const week = Math.floor(idx / 7);
    const day = idx % 7;
    const parsed = parseLocalDate(entry.date);
    const dateLabel = `${parsed.getDate()} ${MONTHS[parsed.getMonth()]} · ${DAYS[parsed.getDay()]}`;
    const hours = entry.count === 0 ? 0 : Math.max(1, Math.round(entry.count * 0.45));

    return {
      id: idx,
      week,
      day,
      date: entry.date,
      count: entry.count,
      hours,
      dateLabel,
      year: parsed.getFullYear(),
    };
  });
}

export interface ActivityStats {
  totalContributions: number;
  activeDaysPct: number;
  longestStreak: number;
  peakCells: DayCell[];
}

export function computeActivityStats(cells: DayCell[]): ActivityStats {
  let totalContributions = 0;
  let activeDays = 0;
  let currentStreak = 0;
  let longestStreak = 0;

  for (const cell of cells) {
    totalContributions += cell.count;
    if (cell.count > 0) {
      activeDays += 1;
      currentStreak += 1;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  }

  const activeDaysPct = cells.length === 0 ? 0 : Math.round((activeDays / cells.length) * 100);

  let peakCells = cells.filter((c) => c.count >= 10);
  if (peakCells.length === 0) {
    peakCells = [...cells]
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .sort((a, b) => a.id - b.id);
  }

  return {
    totalContributions,
    activeDaysPct,
    longestStreak,
    peakCells,
  };
}
