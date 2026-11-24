export interface ContributionDay {
  /** ISO date string in YYYY-MM-DD format */
  date: string;
  /** Number of contributions on that day */
  count: number;
  /** Optional intensity level (0-4) */
  level?: number;
}

export interface DayCell {
  id: number;
  week: number;
  day: number;
  date: string;
  count: number;
  hours: number;
  dateLabel: string;
  year: number;
}

export type ThemePreset = 'emerald' | 'sky' | 'violet' | 'amber' | 'rose';

export interface GitHubActivity3DProps {
  /** GitHub username to fetch live contributions for */
  username: string;
  /** Number of recent weeks to display in the 3D skyline (default: 24) */
  weeks?: number;
  /** Built-in color theme preset (default: 'emerald') */
  theme?: ThemePreset;
  /** Optional custom hex/CSS color overriding the theme accent */
  accentColor?: string;
  /** Main heading text (default: 'GitHub Activity') */
  title?: string;
  /** Optional eyebrow label above the heading */
  subtitle?: string;
  /** Show top KPI summary stats (default: true) */
  showStats?: boolean;
  /** Show floating day inspector card (default: true) */
  showInspector?: boolean;
  /** Show link to the GitHub profile (default: true) */
  showProfileLink?: boolean;
  /** Optional pre-fetched or custom contribution data (skips network fetch) */
  data?: ContributionDay[];
  /** Optional custom contributions API URL */
  apiUrl?: string;
  /** Additional CSS class for the outer wrapper */
  className?: string;
}
