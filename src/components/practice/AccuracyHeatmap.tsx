'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { PerKeyStats } from '@/types';
import { QWERTY_LAYOUT } from '@/components/keyboard/layouts/qwerty';

interface AccuracyHeatmapProps {
  /** Per-key stats from the completed session */
  keyStats: PerKeyStats[];
}

/** Interpolate from green (high accuracy) to red (low accuracy). */
function accuracyColor(accuracy: number): string {
  // accuracy 0..100
  // 100 = green (#22c55e), 80 = yellow (#eab308), <60 = red (#ef4444)
  if (accuracy >= 95) return '#22c55e'; // green-500
  if (accuracy >= 85) return '#84cc16'; // lime-500
  if (accuracy >= 75) return '#eab308'; // yellow-500
  if (accuracy >= 65) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
}

function accuracyOpacity(totalPresses: number): number {
  if (totalPresses === 0) return 0.15;
  if (totalPresses <= 2) return 0.5;
  return 1;
}

// Rows for the visual layout
const ROWS = [0, 1, 2, 3, 4] as const;

export default function AccuracyHeatmap({ keyStats }: AccuracyHeatmapProps) {
  const statsMap = useMemo(() => {
    const map = new Map<string, PerKeyStats>();
    for (const s of keyStats) {
      map.set(s.key.toLowerCase(), s);
    }
    return map;
  }, [keyStats]);

  const rowKeys = useMemo(() => {
    const groups: Record<number, typeof QWERTY_LAYOUT> = {};
    for (const r of ROWS) groups[r] = [];
    for (const k of QWERTY_LAYOUT) {
      if (groups[k.row]) groups[k.row].push(k);
    }
    return groups;
  }, []);

  const worstKeys = useMemo(() => {
    return [...keyStats]
      .filter((s) => s.totalPresses >= 3 && s.accuracy < 90)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);
  }, [keyStats]);

  return (
    <div className="w-full rounded-xl bg-gray-800/60 border border-white/10 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">Accuracy Heatmap</h3>
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#22c55e' }} />
            95%+
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#eab308' }} />
            75%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ef4444' }} />
            &lt;65%
          </span>
        </div>
      </div>

      {/* Keyboard heatmap */}
      <div className="flex flex-col items-center gap-1">
        {ROWS.map((row) => (
          <div key={row} className="flex gap-1 justify-center">
            {(rowKeys[row] ?? []).map((keyDef) => {
              const label = keyDef.label.toLowerCase();
              const stat = statsMap.get(label);
              const acc = stat?.accuracy ?? 100;
              const presses = stat?.totalPresses ?? 0;
              const color = accuracyColor(acc);
              const opacity = accuracyOpacity(presses);
              const w = (keyDef.width ?? 1) * 36;

              return (
                <motion.div
                  key={keyDef.code}
                  className="relative flex items-center justify-center rounded-md border text-[10px] font-medium select-none"
                  style={{
                    width: w,
                    height: 36,
                    backgroundColor: `${color}${Math.round(opacity * 0.25 * 255)
                      .toString(16)
                      .padStart(2, '0')}`,
                    borderColor: `${color}${Math.round(opacity * 0.4 * 255)
                      .toString(16)
                      .padStart(2, '0')}`,
                    color: presses > 0 ? color : '#6b728080',
                    opacity,
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity }}
                  transition={{ delay: row * 0.05 + (keyDef.col ?? 0) * 0.01 }}
                  title={
                    stat
                      ? `${keyDef.label}: ${stat.accuracy.toFixed(0)}% accuracy (${stat.totalPresses} presses, ${stat.errorCount} errors)`
                      : keyDef.label
                  }
                >
                  {keyDef.label.length <= 3 ? keyDef.label : ''}
                  {/* Error count badge */}
                  {stat && stat.errorCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-red-500 text-white text-[8px] font-bold leading-none px-0.5">
                      {stat.errorCount}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Worst keys summary */}
      {worstKeys.length > 0 && (
        <div className="pt-2 border-t border-white/5">
          <p className="text-xs text-gray-500 mb-2">Most Errors</p>
          <div className="flex flex-wrap gap-2">
            {worstKeys.map((s) => (
              <div
                key={s.key}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: `${accuracyColor(s.accuracy)}18`,
                  color: accuracyColor(s.accuracy),
                }}
              >
                <span className="font-bold text-sm">{s.key.toUpperCase()}</span>
                <span className="text-[10px] opacity-70">
                  {s.accuracy.toFixed(0)}% ({s.errorCount} err)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
