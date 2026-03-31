'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface WpmDataPoint {
  time: number; // seconds elapsed
  wpm: number;
}

interface SpeedGraphProps {
  /** WPM samples over time */
  data: WpmDataPoint[];
  /** Optional target WPM line */
  targetWpm?: number;
  /** Graph height in px */
  height?: number;
}

export default function SpeedGraph({
  data,
  targetWpm,
  height = 120,
}: SpeedGraphProps) {
  const { points, maxWpm, maxTime, targetY } = useMemo(() => {
    if (data.length === 0) {
      return { points: [], maxWpm: 60, maxTime: 10, targetY: null };
    }

    const mW = Math.max(
      ...data.map((d) => d.wpm),
      targetWpm ?? 0,
      20
    );
    // Add 20% headroom
    const ceilWpm = Math.ceil(mW * 1.2);
    const mT = Math.max(...data.map((d) => d.time), 5);

    const pts = data.map((d) => ({
      x: (d.time / mT) * 100,
      y: 100 - (d.wpm / ceilWpm) * 100,
      wpm: d.wpm,
    }));

    const tY = targetWpm != null ? 100 - (targetWpm / ceilWpm) * 100 : null;

    return { points: pts, maxWpm: ceilWpm, maxTime: mT, targetY: tY };
  }, [data, targetWpm]);

  // Y-axis labels
  const yLabels = useMemo(() => {
    const count = 4;
    return Array.from({ length: count + 1 }, (_, i) =>
      Math.round((maxWpm * (count - i)) / count)
    );
  }, [maxWpm]);

  return (
    <div className="w-full rounded-xl bg-gray-800/60 border border-white/10 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-400">WPM</span>
        {targetWpm != null && (
          <span className="text-xs text-amber-400/80">
            Target: {targetWpm} WPM
          </span>
        )}
      </div>

      <div className="relative" style={{ height }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] text-gray-500 pointer-events-none">
          {yLabels.map((v) => (
            <span key={v}>{v}</span>
          ))}
        </div>

        {/* Graph area */}
        <div className="ml-9 relative h-full overflow-hidden rounded-md bg-gray-900/40">
          {/* Horizontal grid lines */}
          {yLabels.map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-white/5"
              style={{ top: `${(i / (yLabels.length - 1)) * 100}%` }}
            />
          ))}

          {/* Target WPM line */}
          {targetY != null && (
            <div
              className="absolute left-0 right-0 border-t-2 border-dashed border-amber-500/40"
              style={{ top: `${targetY}%` }}
            />
          )}

          {/* WPM line using stacked div segments */}
          {points.length > 1 && (
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Area fill */}
              <motion.path
                d={`M ${points[0].x} ${points[0].y} ${points
                  .slice(1)
                  .map((p) => `L ${p.x} ${p.y}`)
                  .join(' ')} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`}
                fill="url(#wpmGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              {/* Line */}
              <motion.path
                d={`M ${points[0].x} ${points[0].y} ${points
                  .slice(1)
                  .map((p) => `L ${p.x} ${p.y}`)
                  .join(' ')}`}
                fill="none"
                stroke="#60a5fa"
                strokeWidth={0.8}
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              />
              <defs>
                <linearGradient
                  id="wpmGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.02} />
                </linearGradient>
              </defs>
            </svg>
          )}

          {/* Current WPM dot */}
          {points.length > 0 && (
            <motion.div
              className="absolute w-2.5 h-2.5 rounded-full bg-blue-400 border-2 border-blue-300 shadow-lg shadow-blue-500/30"
              style={{
                left: `${points[points.length - 1].x}%`,
                top: `${points[points.length - 1].y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
          )}

          {/* Current WPM value overlay */}
          {points.length > 0 && (
            <div className="absolute top-1 right-2 text-lg font-bold text-blue-400">
              {Math.round(points[points.length - 1].wpm)}
            </div>
          )}
        </div>
      </div>

      {/* X-axis label */}
      <div className="ml-9 flex justify-between mt-1 text-[10px] text-gray-500">
        <span>0s</span>
        <span>{Math.round(maxTime)}s</span>
      </div>
    </div>
  );
}
