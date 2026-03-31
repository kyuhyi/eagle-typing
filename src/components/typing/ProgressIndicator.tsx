'use client';

import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  /** Progress value from 0 to 1 */
  progress: number;
}

export default function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  const percentage = Math.min(100, Math.max(0, Math.round(progress * 100)));

  return (
    <div className="relative w-full">
      {/* Track */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        {/* Fill with gradient */}
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      {/* Percentage label */}
      <div className="mt-1 text-right">
        <span className="text-xs tabular-nums font-medium text-gray-400 dark:text-gray-500">
          {percentage}%
        </span>
      </div>
    </div>
  );
}
