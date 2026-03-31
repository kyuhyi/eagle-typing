'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScreenFlashProps {
  trigger: boolean;
  color?: string;
  duration?: number;  // ms
  className?: string;
}

export default function ScreenFlash({
  trigger,
  color = 'rgba(255, 255, 255, 0.6)',
  duration = 300,
  className = '',
}: ScreenFlashProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration / 1000, ease: 'easeOut' }}
          className={`pointer-events-none fixed inset-0 z-[60] ${className}`}
          style={{ backgroundColor: color }}
        />
      )}
    </AnimatePresence>
  );
}
