'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Charts follow the data-viz rules: thin marks with rounded data ends, one hue for one series,
 * status colors only for statuses (always with a text label), recessive axes, a hover/focus
 * tooltip on every mark, and a table alternative so identity is never color-alone.
 */

function useTooltip() {
  const [tip, setTip] = useState(null);
  return {
    tip,
    show: (label, value) => setTip({ label, value }),
    hide: () => setTip(null),
  };
}

function Tip({ tip }) {
  if (!tip) return <div className="h-6" aria-hidden />;
  return (
    <div
      role="status"
      className="inline-flex h-6 items-center gap-2 self-start rounded-chip border border-border-strong bg-elevated px-2 text-xs"
    >
      <span className="text-muted">{tip.label}</span>
      <span className="font-medium tabular-nums">{tip.value}</span>
    </div>
  );
}

/** Horizontal bars: each row is label, bar, and a direct value label. */
export function BarList({ title, rows, unit = '', emptyText = 'No data yet' }) {
  const { tip, show, hide } = useTooltip();
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <figure className="flex flex-col gap-3" aria-label={title}>
      <figcaption className="text-sm font-medium">{title}</figcaption>
      {rows.length === 0 ? (
        <p className="py-6 text-xs text-muted">{emptyText}</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {rows.map((row) => (
            <li
              key={row.label}
              className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3 text-xs sm:grid-cols-[9rem_1fr_2.5rem]"
            >
              <span className="truncate text-muted">{row.label}</span>
              <span
                tabIndex={0}
                role="img"
                aria-label={`${row.label}: ${row.value}${unit}`}
                onMouseEnter={() => show(row.label, `${row.value}${unit}`)}
                onMouseLeave={hide}
                onFocus={() => show(row.label, `${row.value}${unit}`)}
                onBlur={hide}
                className="flex h-5 items-center rounded-chip focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span
                  className={cn(
                    'h-2 rounded-r-[4px] transition-[width] duration-200',
                    row.className ?? 'bg-primary',
                  )}
                  style={{ width: `${(row.value / max) * 100}%`, minWidth: row.value ? 4 : 0 }}
                />
              </span>
              <span className="text-right font-medium tabular-nums">{row.value}</span>
            </li>
          ))}
        </ul>
      )}
      <Tip tip={tip} />
    </figure>
  );
}

/** Vertical columns over time with a recessive baseline and sparse axis labels. */
export function ColumnChart({ title, points, valueLabel }) {
  const { tip, show, hide } = useTooltip();
  const [asTable, setAsTable] = useState(false);
  const max = Math.max(1, ...points.map((p) => p.value));
  const total = points.reduce((sum, p) => sum + p.value, 0);

  return (
    <figure className="flex flex-col gap-3" aria-label={title}>
      <div className="flex items-center justify-between">
        <figcaption className="text-sm font-medium">{title}</figcaption>
        <button
          type="button"
          aria-pressed={asTable}
          onClick={() => setAsTable((v) => !v)}
          className="rounded-chip px-1.5 py-1 text-xs text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {asTable ? 'View chart' : 'View as table'}
        </button>
      </div>

      {asTable ? (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-muted">
              <th className="py-1 font-medium">Week of</th>
              <th className="py-1 text-right font-medium">{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.label} className="border-t border-border">
                <td className="py-1.5">{p.label}</td>
                <td className="py-1.5 text-right tabular-nums">{p.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : total === 0 ? (
        <p className="py-10 text-center text-xs text-muted">
          Nothing completed in this period yet.
        </p>
      ) : (
        <div className="flex h-40 items-end gap-2 border-b border-border">
          {points.map((p) => (
            <div
              key={p.label}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1"
            >
              <button
                type="button"
                aria-label={`${p.label}: ${p.value} ${valueLabel}`}
                onMouseEnter={() => show(`Week of ${p.label}`, `${p.value} ${valueLabel}`)}
                onMouseLeave={hide}
                onFocus={() => show(`Week of ${p.label}`, `${p.value} ${valueLabel}`)}
                onBlur={hide}
                className="group flex w-full flex-1 items-end justify-center focus-visible:outline-none"
              >
                <span
                  className="w-3 rounded-t-[4px] bg-primary transition-[height,opacity] duration-200 group-hover:opacity-80 group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background sm:w-4"
                  style={{
                    height: `${(p.value / max) * 100}%`,
                    minHeight: p.value ? 4 : 2,
                    opacity: p.value ? 1 : 0.25,
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      )}
      {!asTable && (
        <div className="flex gap-2 text-[11px] text-subtle">
          {points.map((p, i) => (
            <span key={p.label} className="flex-1 text-center">
              {i % 2 === 0 || points.length < 6 ? p.label : ''}
            </span>
          ))}
        </div>
      )}
      <Tip tip={tip} />
    </figure>
  );
}
