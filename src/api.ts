import type { ContributionDay } from './types';

interface JogruberResponse {
  total?: Record<string, number>;
  contributions?: Array<{
    date: string;
    count: number;
    level?: number;
  }>;
}

const DEFAULT_API_BASE = 'https://github-contributions-api.jogruber.de/v4';

/**
 * Fetches the last year of public GitHub contributions for a given username.
 */
export async function fetchContributions(
  username: string,
  signal?: AbortSignal,
  apiUrl?: string
): Promise<ContributionDay[]> {
  const cleanUser = username.trim();
  if (!cleanUser) {
    throw new Error('A GitHub username is required.');
  }

  const endpoint =
    apiUrl ?? `${DEFAULT_API_BASE}/${encodeURIComponent(cleanUser)}?y=last`;

  const response = await fetch(endpoint, { signal });
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`GitHub user "${cleanUser}" was not found.`);
    }
    throw new Error(`Failed to fetch contributions (HTTP ${response.status}).`);
  }

  const json = (await response.json()) as JogruberResponse;
  if (!Array.isArray(json.contributions)) {
    throw new Error('Unexpected response format from contributions API.');
  }

  return json.contributions.map((entry) => ({
    date: entry.date,
    count: Number(entry.count) || 0,
    level: entry.level,
  }));
}
