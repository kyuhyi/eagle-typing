'use client';

import { useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypingStore } from '@/stores/typing-store';

interface TypingAreaProps {
  targetText: string;
}

type CharStatus = 'correct' | 'incorrect' | 'current' | 'composing' | 'upcoming';

interface CharInfo {
  char: string;
  status: CharStatus;
}

const VISIBLE_LINES = 5;
const LINE_HEIGHT_PX = 56; // matches leading-loose at text-2xl/3xl

export default function TypingArea({ targetText }: TypingAreaProps) {
  const { currentIndex, keystrokes, composingText } = useTypingStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  // Hidden input: gives the browser an actual focused element so Korean IME can activate
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the hidden input on mount so IME is ready immediately
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Clear accumulated IME text after each composition so input stays empty
  const handleCompositionEnd = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  // Build a set of positions that had errors (last keystroke for that position was incorrect)
  const errorPositions = useMemo(() => {
    const errors = new Set<number>();
    let pos = 0;
    for (const ks of keystrokes) {
      if (ks.correct) {
        pos++;
      } else {
        errors.add(pos);
      }
    }
    return errors;
  }, [keystrokes]);

  // Determine status of each character
  const chars: CharInfo[] = useMemo(() => {
    return targetText.split('').map((char, i) => {
      let status: CharStatus;
      if (i < currentIndex) {
        status = 'correct';
      } else if (i === currentIndex && composingText) {
        status = 'composing';
      } else if (i === currentIndex) {
        status = 'current';
      } else {
        status = 'upcoming';
      }
      return { char, status };
    });
  }, [targetText, currentIndex, composingText]);

  // Check if the most recent keystroke at current position was an error
  const currentHasError = errorPositions.has(currentIndex);

  // Line-by-line scrolling: keep cursor line visible
  useEffect(() => {
    if (cursorRef.current && containerRef.current) {
      const container = containerRef.current;
      const cursor = cursorRef.current;
      const cursorTop = cursor.offsetTop;
      const scrollTarget = Math.max(0, cursorTop - LINE_HEIGHT_PX);

      if (Math.abs(container.scrollTop - scrollTarget) > LINE_HEIGHT_PX) {
        container.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      }
    }
  }, [currentIndex, composingText]);

  return (
    // Clicking anywhere in the typing area re-focuses the hidden input
    <div
      className="relative rounded-2xl border border-[#494456]/50 p-8 shadow-2xl shadow-black/30 cursor-text"
      style={{
        background: 'rgba(29, 31, 41, 0.85)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 0 60px rgba(92, 31, 222, 0.08), 0 4px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(205, 189, 255, 0.05)',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/*
        Hidden input — exists solely so the browser has a focusable element
        that can receive Korean IME composition events. compositionupdate /
        compositionend bubble from here to the window listeners in
        useTypingSession. readOnly is intentionally NOT set so IME can compose.
      */}
      <input
        ref={inputRef}
        className="sr-only"
        tabIndex={0}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        onCompositionEnd={handleCompositionEnd}
        onBlur={() => {
          // 포커스 잃으면 즉시 다시 포커스 (한글 IME 유지)
          setTimeout(() => inputRef.current?.focus(), 10);
        }}
        onKeyDown={(e) => {
          if (!e.nativeEvent.isComposing) e.preventDefault();
        }}
      />
      <div
        ref={containerRef}
        className="text-2xl md:text-3xl select-none whitespace-pre-wrap break-words overflow-hidden"
        style={{ fontFamily: "'Pretendard', sans-serif", maxHeight: `${VISIBLE_LINES * LINE_HEIGHT_PX}px`, lineHeight: '2.4', letterSpacing: '0.08em', wordSpacing: '0.3em' }}
        role="textbox"
        aria-label="Typing area"
      >
        {chars.map((c, i) => (
          <CharacterSpan
            key={i}
            char={c.char}
            status={c.status}
            hasError={c.status === 'current' && currentHasError}
            composingText={c.status === 'composing' ? composingText : undefined}
            cursorRef={
              c.status === 'current' || c.status === 'composing'
                ? cursorRef
                : undefined
            }
          />
        ))}
      </div>
      {/* Fade overlays for top/bottom scroll edges */}
      <div className="pointer-events-none absolute top-8 left-8 right-8 h-6 bg-gradient-to-b from-[#1d1f29]/90 to-transparent rounded-t-xl" />
      <div className="pointer-events-none absolute bottom-8 left-8 right-8 h-6 bg-gradient-to-t from-[#1d1f29]/90 to-transparent rounded-b-xl" />
    </div>
  );
}

interface CharacterSpanProps {
  char: string;
  status: CharStatus;
  hasError: boolean;
  composingText?: string;
  cursorRef?: React.Ref<HTMLSpanElement>;
}

function CharacterSpan({ char, status, hasError, composingText, cursorRef }: CharacterSpanProps) {
  const baseClasses = 'relative inline-block transition-colors duration-100';

  if (status === 'correct') {
    return (
      <span className={`${baseClasses} text-[#4ade80]`}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    );
  }

  if (status === 'composing') {
    return (
      <span ref={cursorRef} className={`${baseClasses} relative`}>
        {/* Floating preview above the character */}
        <AnimatePresence>
          {composingText && (
            <motion.span
              className="absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-white text-base font-bold shadow-xl whitespace-nowrap z-10"
              style={{ background: '#5c1fde', boxShadow: '0 0 15px rgba(92,31,222,0.5)' }}
              initial={{ opacity: 0, y: 4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.9 }}
              transition={{ duration: 0.12 }}
            >
              {composingText}
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#5c1fde]" />
            </motion.span>
          )}
        </AnimatePresence>
        {/* Character with composing highlight */}
        <span className="text-[#cdbdff] bg-[#5c1fde]/30 rounded-md px-1 border-b-2 border-[#cdbdff]">
          {composingText || (char === ' ' ? '\u00A0' : char)}
        </span>
        {/* Blinking cursor pipe */}
        <motion.span
          className="absolute -right-px top-0 bottom-0 w-0.5 bg-[#cdbdff]"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      </span>
    );
  }

  if (status === 'current') {
    return (
      <motion.span
        ref={cursorRef}
        className={`${baseClasses} ${
          hasError
            ? 'text-[#ffb4ab] bg-[#93000a]/30'
            : 'text-[#e1e1ef] bg-[#cdbdff]/15'
        } rounded-md px-0.5`}
        animate={
          hasError
            ? { x: [0, -3, 3, -2, 2, 0] }
            : undefined
        }
        transition={hasError ? { duration: 0.3 } : undefined}
      >
        {char === ' ' ? '\u00A0' : char}
        {/* Blinking cursor pipe on the left edge */}
        <motion.span
          className={`absolute left-0 top-1 bottom-1 w-0.5 rounded-full ${
            hasError ? 'bg-[#ffb4ab]' : 'bg-[#fabd00]'
          }`}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
        {/* Underline indicator */}
        <motion.span
          className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full ${
            hasError ? 'bg-[#ffb4ab]' : 'bg-[#fabd00]'
          }`}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </motion.span>
    );
  }

  // upcoming
  return (
    <span className={`${baseClasses} text-[#958da2]/60`}>
      {char === ' ' ? '\u00A0' : char}
    </span>
  );
}
