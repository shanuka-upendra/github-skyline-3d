import React, { useEffect, useMemo, useState } from 'react';
import { fetchContributions } from './api';
import { buildSkylineGrid, computeActivityStats } from './stats';
import type { ContributionDay, GitHubActivity3DProps } from './types';
import './GitHubActivity3D.css';

const ArrowUpRightIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
  </svg>
);

export const GitHubActivity3D: React.FC<GitHubActivity3DProps> = ({
  username,
  weeks = 24,
  theme = 'emerald',
  accentColor,
  title = 'GitHub Activity',
  subtitle,
  showStats = true,
  showInspector = true,
  showProfileLink = true,
  data,
  apiUrl,
  className = '',
}) => {
  const [fetchedDays, setFetchedDays] = useState<ContributionDay[] | null>(null);
  const [loading, setLoading] = useState<boolean>(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchContributions(username, controller.signal, apiUrl)
      .then((days) => {
        setFetchedDays(days);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Unable to load GitHub activity.');
        setLoading(false);
      });

    return () => controller.abort();
  }, [username, data, apiUrl]);

  const rawDays = data ?? fetchedDays ?? [];
  const cells = useMemo(() => buildSkylineGrid(rawDays, weeks), [rawDays, weeks]);
  const stats = useMemo(() => computeActivityStats(cells), [cells]);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Default selection to a prominent peak cell when data loads
  useEffect(() => {
    if (cells.length === 0) return;
    const defaultCell = stats.peakCells[1] ?? stats.peakCells[0] ?? cells[cells.length - 1];
    setSelectedId(defaultCell?.id ?? null);
  }, [cells, stats.peakCells]);

  const selectedCell =
    cells.find((c) => c.id === selectedId) ?? cells[cells.length - 1] ?? null;

  const jumpToNextPeak = () => {
    if (stats.peakCells.length === 0) return;
    const currentIdx = stats.peakCells.findIndex((c) => c.id === selectedId);
    const next = stats.peakCells[(currentIdx + 1) % stats.peakCells.length];
    if (next) setSelectedId(next.id);
  };

  const customStyle = useMemo(() => {
    const vars: Record<string, string> = {
      '--gha3d-weeks': String(Math.max(1, Math.min(52, Math.floor(weeks)))),
    };
    if (accentColor) {
      vars['--gha3d-accent'] = accentColor;
      vars['--gha3d-accent-bright'] = accentColor;
      vars['--gha3d-accent-mid'] = accentColor;
    }
    return vars as React.CSSProperties;
  }, [weeks, accentColor]);

  return (
    <div
      className={`gha3d-root ${className}`.trim()}
      data-theme={theme}
      style={customStyle}
    >
      <div className="gha3d-card">
        <div aria-hidden="true" className="gha3d-ambient" />

        {/* Header & KPI Stats */}
        <div className="gha3d-header">
          <div>
            {subtitle && <div className="gha3d-subtitle">{subtitle}</div>}
            <h2 className="gha3d-title">{title}</h2>
          </div>

          {showStats && !loading && !error && (
            <div className="gha3d-stats">
              <div>
                <div className="gha3d-stat-value gha3d-stat-value--accent">
                  {stats.totalContributions}
                </div>
                <div className="gha3d-stat-label">Contributions</div>
              </div>
              <div>
                <div className="gha3d-stat-value gha3d-stat-value--secondary">
                  {stats.activeDaysPct}%
                </div>
                <div className="gha3d-stat-label">Days Active</div>
              </div>
              <div>
                <div className="gha3d-stat-value gha3d-stat-value--white">
                  {stats.longestStreak}d
                </div>
                <div className="gha3d-stat-label">Best Streak</div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="gha3d-status">Loading @{username}&apos;s skyline...</div>
        ) : error ? (
          <div className="gha3d-status gha3d-status--error">{error}</div>
        ) : (
          <div
            className={`gha3d-body ${showInspector ? 'gha3d-body--with-inspector' : ''}`}
          >
            {/* 3D Isometric Skyline */}
            <div className="gha3d-stage">
              <div className="gha3d-perspective">
                <div className="gha3d-grid" role="grid" aria-label="GitHub contribution skyline">
                  {cells.map((cell) => {
                    const isSelected = cell.id === selectedCell?.id;
                    const heightPx =
                      cell.count === 0 ? 4 : Math.min(8 + cell.count * 3.4, 72);
                    const level =
                      cell.count >= 12 ? 3 : cell.count >= 5 ? 2 : cell.count > 0 ? 1 : 0;

                    return (
                      <button
                        key={cell.id}
                        type="button"
                        onClick={() => setSelectedId(cell.id)}
                        onMouseEnter={() => setSelectedId(cell.id)}
                        onFocus={() => setSelectedId(cell.id)}
                        aria-label={`${cell.dateLabel}: ${cell.count} contributions`}
                        data-level={level}
                        data-selected={isSelected ? 'true' : 'false'}
                        className="gha3d-cell"
                      >
                        <span className="gha3d-face-base" />
                        <span
                          className="gha3d-face-top"
                          style={{ transform: `translateZ(${heightPx}px)` }}
                        />
                        <span
                          className="gha3d-face-front"
                          style={{ height: `${heightPx}px` }}
                        />
                        <span
                          className="gha3d-face-right"
                          style={{ width: `${heightPx}px` }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Floating Inspector */}
            {showInspector && selectedCell && (
              <div className="gha3d-inspector-col">
                <div className="gha3d-inspector-card">
                  <div className="gha3d-inspector-head">
                    <div>
                      <div className="gha3d-inspector-date">{selectedCell.dateLabel}</div>
                      <div className="gha3d-inspector-year">
                        {selectedCell.year} COMMIT LOG
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={jumpToNextPeak}
                      className="gha3d-peak-btn"
                    >
                      Next peak →
                    </button>
                  </div>

                  <div className="gha3d-inspector-rows">
                    <div className="gha3d-inspector-row">
                      <span className="gha3d-inspector-key">
                        <span className="gha3d-dot gha3d-dot--accent" />
                        CONTRIBUTIONS
                      </span>
                      <span className="gha3d-inspector-val-accent">
                        {selectedCell.count}
                      </span>
                    </div>
                    <div className="gha3d-inspector-row">
                      <span className="gha3d-inspector-key">
                        <span className="gha3d-dot gha3d-dot--secondary" />
                        EST. CODED
                      </span>
                      <span className="gha3d-inspector-val-secondary">
                        {selectedCell.hours}h
                      </span>
                    </div>
                  </div>
                </div>

                <div className="gha3d-footer">
                  <span className="gha3d-window-label">LAST {weeks} WEEKS</span>
                  {showProfileLink && (
                    <a
                      href={`https://github.com/${encodeURIComponent(username)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="gha3d-profile-link"
                    >
                      GitHub Profile <ArrowUpRightIcon />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
