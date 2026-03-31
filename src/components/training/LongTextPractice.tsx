'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSound } from '@/hooks/useSound';
import type { SessionStats } from '@/types';
import type { EngineLanguage } from '@/lib/engine/typing-engine';

// ─────────────────────────────────────────────
// Types & helpers
// ─────────────────────────────────────────────

interface LongTextPracticeProps {
  targetText: string;
  language: EngineLanguage;
  onComplete: (stats: SessionStats) => void;
  onExit: () => void;
}

const LINE_CHARS = 58; // chars per visual line

function buildStats(
  correct: number,
  errors: number,
  elapsedSeconds: number
): SessionStats {
  const total    = correct + errors;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;
  const minutes  = elapsedSeconds / 60;
  const cpm      = minutes > 0 ? Math.round(correct / minutes) : 0;
  const wpm      = Math.round(cpm / 5);
  return {
    wpm, cpm, accuracy,
    duration:          elapsedSeconds,
    totalKeystrokes:   total,
    correctKeystrokes: correct,
    errorCount:        errors,
    longestStreak:     0,
  };
}

function fmtTime(s: number) {
  const m   = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

/** Split text into lines of ~LINE_CHARS chars, breaking at spaces */
function wrapLines(text: string, maxLen: number): string[] {
  const lines: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      lines.push(remaining);
      break;
    }
    let cut = maxLen;
    while (cut > 0 && remaining[cut] !== ' ') cut--;
    if (cut === 0) cut = maxLen; // no space found, hard cut
    lines.push(remaining.slice(0, cut).trimEnd());
    remaining = remaining.slice(cut).trimStart();
  }
  return lines;
}

// ─────────────────────────────────────────────
// Ornate corner SVG
// ─────────────────────────────────────────────

function OrnateCorner({ className, style }: { className: string; style?: React.CSSProperties }) {
  return (
    <svg
      width="32" height="32"
      viewBox="0 0 32 32"
      className={className}
      style={{ position: 'absolute', pointerEvents: 'none', ...style }}
    >
      <path
        d="M2 2 L14 2 L14 4 L4 4 L4 14 L2 14 Z"
        fill="none"
        stroke="rgba(250,189,0,0.55)"
        strokeWidth="1.5"
      />
      <rect x="2" y="2" width="3" height="3" fill="rgba(250,189,0,0.4)" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Progress Map dots
// ─────────────────────────────────────────────

function ProgressMap({
  totalLines,
  currentLine,
}: {
  totalLines: number;
  currentLine: number;
}) {
  const dots = Math.min(totalLines, 20);
  const step = totalLines / dots;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] text-[#cbc3d9]/50 uppercase tracking-wider mb-1">진행 지도</span>
      {Array.from({ length: dots }).map((_, i) => {
        const lineForDot = Math.floor(i * step);
        const done       = lineForDot < currentLine;
        const isCurrent  = lineForDot === currentLine;
        return (
          <div key={i} className="flex items-center gap-2">
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width:      isCurrent ? '10px' : '6px',
                height:     isCurrent ? '10px' : '6px',
                background: done       ? '#cdbdff'
                          : isCurrent  ? '#fabd00'
                          : 'rgba(73,68,86,0.3)',
                boxShadow:  isCurrent ? '0 0 8px rgba(250,189,0,0.5)' : 'none',
                flexShrink: 0,
              }}
            />
            <div
              className="flex-1 h-px"
              style={{
                background: done
                  ? 'rgba(205,189,255,0.3)'
                  : 'rgba(73,68,86,0.15)',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

export default function LongTextPractice({
  targetText,
  language,
  onComplete,
  onExit,
}: LongTextPracticeProps) {
  const lines = useMemo(() => wrapLines(targetText, LINE_CHARS), [targetText]);

  // Flat char index across entire text (tracking in original text)
  const [charIndex, setCharIndex]   = useState(0);
  const [correct, setCorrect]       = useState(0);
  const [errors, setErrors]         = useState(0);
  const [combo, setCombo]           = useState(0);
  const [elapsed, setElapsed]       = useState(0);
  const [started, setStarted]       = useState(false);
  const [shake, setShake]           = useState(false);
  const [errorSet, setErrorSet]     = useState<Set<number>>(new Set());

  const startRef  = useRef<number | null>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { init: initSound, playKeyClick, playError, playSpace, playComboMilestone } = useSound();

  const total    = correct + errors;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;
  const minutes  = elapsed / 60;
  const cpm      = minutes > 0 ? Math.round(correct / minutes) : 0;
  const wpm      = Math.round(cpm / 5);

  // Compute current line
  const currentLine = useMemo(() => {
    let pos = 0;
    for (let i = 0; i < lines.length; i++) {
      const lineEnd = pos + lines[i].length;
      if (charIndex <= lineEnd) return i;
      // account for trimmed spaces between lines
      pos = lineEnd + 1;
    }
    return lines.length - 1;
  }, [charIndex, lines]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Auto-scroll to keep current line visible
  useEffect(() => {
    if (!scrollRef.current) return;
    const lineH   = 52; // approx px per line
    const visible = 4;
    const targetY = Math.max(0, (currentLine - 1) * lineH);
    scrollRef.current.scrollTo({ top: targetY, behavior: 'smooth' });
  }, [currentLine]);

  const ensureTimer = useCallback(() => {
    if (started) return;
    setStarted(true);
    initSound();
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - (startRef.current ?? Date.now())) / 1000));
    }, 500);
  }, [started, initSound]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') { onExit(); return; }
    if (e.key === 'Shift' || e.key === 'CapsLock' || e.key === 'Tab') return;
    if (e.isComposing || e.keyCode === 229) return;

    const ch = e.key === 'Enter' ? '\n' : e.key;
    if (ch.length !== 1) return;
    e.preventDefault();

    ensureTimer();

    const expected = targetText[charIndex] ?? '';
    const isCorrect = ch === expected;

    if (isCorrect) {
      const nc = correct + 1;
      const cb = combo + 1;
      setCorrect(nc);
      setCombo(cb);
      if (ch === ' ') playSpace();
      else            playKeyClick();
      if (cb > 0 && cb % 10 === 0) playComboMilestone(cb);
    } else {
      setErrors(er => er + 1);
      setCombo(0);
      playError();
      setErrorSet(s => new Set(s).add(charIndex));
      setShake(true);
      setTimeout(() => setShake(false), 280);
    }

    // 맞든 틀리든 다음으로 넘어감
    const next = charIndex + 1;
    setCharIndex(next);

    if (next >= targetText.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      const finalElapsed = startRef.current
        ? Math.floor((Date.now() - startRef.current) / 1000)
        : elapsed;
      onComplete(buildStats(isCorrect ? correct + 1 : correct, isCorrect ? errors : errors + 1, finalElapsed));
    }
  }, [charIndex, correct, combo, errors, elapsed, targetText,
      ensureTimer, playKeyClick, playError, playSpace, playComboMilestone, onExit, onComplete]);

  // 한글 IME composition 처리
  const handleCompositionEnd = useCallback((e: CompositionEvent) => {
    if (!e.data) return;
    ensureTimer();
    for (const ch of e.data) {
      const expected = targetText[charIndex] ?? '';
      const isCorrect = ch === expected;

      if (isCorrect) {
        setCorrect(c => c + 1);
        setCombo(cb => {
          const next = cb + 1;
          if (next > 0 && next % 10 === 0) playComboMilestone(next);
          return next;
        });
        playKeyClick();
      } else {
        setErrors(er => er + 1);
        setCombo(0);
        playError();
        setErrorSet(s => new Set(s).add(charIndex));
        setShake(true);
        setTimeout(() => setShake(false), 280);
      }

      // 맞든 틀리든 다음으로
      setCharIndex(idx => {
        const nextIdx = idx + 1;
        if (nextIdx >= targetText.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          const finalElapsed = startRef.current
            ? Math.floor((Date.now() - startRef.current) / 1000)
            : elapsed;
          onComplete(buildStats(correct + (isCorrect ? 1 : 0), errors + (isCorrect ? 0 : 1), finalElapsed));
        }
        return nextIdx;
      });
    }
  }, [charIndex, correct, errors, elapsed, targetText, ensureTimer,
      playKeyClick, playError, playComboMilestone, onComplete]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('compositionend', handleCompositionEnd);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('compositionend', handleCompositionEnd);
    };
  }, [handleKeyDown, handleCompositionEnd]);

  // ─── Render a single line ────────────────────────────────────

  const renderLine = (lineText: string, lineStartIndex: number, lineIdx: number) => {
    const isPast    = lineIdx < currentLine;
    const isCurrent = lineIdx === currentLine;
    const isFuture  = lineIdx > currentLine;

    return (
      <div
        key={lineIdx}
        className={`transition-all duration-500 ${
          isFuture ? 'opacity-25' : isPast ? 'opacity-60' : ''
        }`}
        style={{
          fontSize:     isCurrent ? '1.5rem'  : isPast ? '1.125rem' : '1rem',
          lineHeight:   '1.9',
          fontWeight:   isCurrent ? 700 : 400,
          paddingLeft:  isCurrent ? '0' : '0',
          transition:   'font-size 0.3s, opacity 0.4s',
        }}
      >
        {lineText.split('').map((ch, ci) => {
          const globalIdx = lineStartIndex + ci;
          let color: string;

          if (globalIdx < charIndex) {
            color = errorSet.has(globalIdx)
              ? '#ffb4ab'
              : '#ffffff';
          } else if (globalIdx === charIndex) {
            color = '#fabd00';
          } else if (isCurrent) {
            color = 'rgba(225,225,239,0.45)';
          } else {
            color = 'rgba(225,225,239,0.15)';
          }

          return (
            <span
              key={ci}
              style={{ color, position: 'relative', transition: 'color 60ms' }}
            >
              {ch}
              {globalIdx === charIndex && (
                <span
                  className="animate-pulse"
                  style={{
                    position:   'absolute',
                    left:       '0',
                    bottom:     '-1px',
                    width:      '100%',
                    height:     '2px',
                    background: '#fabd00',
                    borderRadius: '1px',
                  }}
                />
              )}
            </span>
          );
        })}
      </div>
    );
  };

  // Compute line start indices
  const lineStarts = useMemo(() => {
    const starts: number[] = [];
    let pos = 0;
    for (const line of lines) {
      starts.push(pos);
      pos += line.length + 1; // +1 for stripped space
    }
    return starts;
  }, [lines]);

  // ─── Layout ──────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#11131c] text-white flex flex-col select-none">

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[180px]"
          style={{ background: 'rgba(92,31,222,0.05)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[140px]"
          style={{ background: 'rgba(250,189,0,0.04)' }} />
        {/* Concentric ring decoration */}
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-5"
          style={{ border: '1px solid rgba(250,189,0,0.4)' }} />
        <div className="absolute -bottom-16 -right-16 w-[360px] h-[360px] rounded-full opacity-5"
          style={{ border: '1px solid rgba(205,189,255,0.3)' }} />
      </div>

      {/* Hidden input for IME composition */}
      <input
        ref={inputRef}
        className="sr-only"
        tabIndex={0}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        onCompositionEnd={(e) => {
          if (inputRef.current) inputRef.current.value = '';
        }}
        onKeyDown={(e) => {
          if (!e.nativeEvent.isComposing) e.preventDefault();
        }}
        onBlur={() => setTimeout(() => inputRef.current?.focus(), 10)}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-[#494456]/20">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#ffb4ab]"
            style={{ fontVariationSettings: "'FILL' 1" }}>history_edu</span>
          <span className="text-sm font-bold tracking-widest text-[#e1e1ef] uppercase">장문 연습</span>
          <span className="text-xs text-[#494456]">· {language === 'korean' ? '한글' : 'English'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#494456] tabular-nums">
            {charIndex} / {targetText.length}
          </span>
          <button onClick={onExit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#958da2] border border-[#494456]/40 hover:text-[#ffb4ab] hover:border-[#ffb4ab]/40 transition-all">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
            종료
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex gap-5 px-6 pb-6 pt-4 relative z-10 min-h-0">

        {/* ═══ LEFT: Grand Chronicle scroll ═══ */}
        <div className="flex-1 flex flex-col min-w-0 rounded-2xl overflow-hidden relative"
          style={{
            background:     'rgba(22,24,32,0.85)',
            backdropFilter: 'blur(24px)',
            border:         '1px solid rgba(73,68,86,0.3)',
          }}>

          {/* Ornate corners */}
          <OrnateCorner className="top-0 left-0" />
          <OrnateCorner className="top-0 right-0"
            style={{ transform: 'scaleX(-1)' } as React.CSSProperties} />
          <OrnateCorner className="bottom-0 left-0"
            style={{ transform: 'scaleY(-1)' } as React.CSSProperties} />
          <OrnateCorner className="bottom-0 right-0"
            style={{ transform: 'scale(-1)' } as React.CSSProperties} />

          {/* Chapter header */}
          <div className="px-10 pt-8 pb-4 border-b border-[#494456]/20 flex-shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(250,189,0,0.4))' }} />
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#fabd00] uppercase">
                Chapter I
              </span>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(250,189,0,0.4))' }} />
            </div>
            <h2 className="text-center text-xs font-bold tracking-[0.25em] text-[#494456] uppercase">
              The Grand Chronicle
            </h2>
          </div>

          {/* Scroll mask top */}
          <div className="absolute left-0 right-0 h-8 pointer-events-none z-10"
            style={{
              top:        '88px',
              background: 'linear-gradient(to bottom, rgba(22,24,32,0.9), transparent)',
            }} />

          {/* Text content */}
          <motion.div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-10 py-6"
            animate={shake ? { x: [-5, 5, -3, 3, -1, 1, 0] } : {}}
            transition={{ duration: 0.26 }}
            style={{ scrollbarWidth: 'none' }}
          >
            <div className="space-y-1">
              {lines.map((line, i) =>
                renderLine(line, lineStarts[i], i)
              )}
              {/* Padding at bottom */}
              <div className="h-24" />
            </div>
          </motion.div>

          {/* Scroll mask bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10"
            style={{ background: 'linear-gradient(to top, rgba(22,24,32,0.95), transparent)' }} />

          {/* Bottom bar */}
          <div className="px-10 py-4 border-t border-[#494456]/20 flex items-center justify-between flex-shrink-0 relative z-20"
            style={{ background: 'rgba(12,14,23,0.8)' }}>
            <span className="text-[10px] text-[#494456]">
              {!started ? '아무 키나 눌러 시작하세요' : `줄 ${currentLine + 1} / ${lines.length}`}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-[#494456]">{fmtTime(elapsed)}</span>
              <div className="flex items-center gap-1">
                <span className="inline-block w-0.5 h-3.5 bg-[#fabd00] animate-pulse rounded-full" />
                <span className="text-[10px] text-[#cbc3d9]/50 tabular-nums">{wpm} WPM</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT: sidebar ═══ */}
        <div
          className="w-64 flex-shrink-0 flex flex-col gap-5"
        >
          {/* 최종 시련 현황 */}
          <div
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{
              background:     'rgba(29,31,41,0.7)',
              backdropFilter: 'blur(24px)',
              border:         '1px solid rgba(73,68,86,0.2)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffb4ab]"
                style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>
                shield_with_heart
              </span>
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#ffb4ab] uppercase">최종 시련 현황</h3>
            </div>

            {/* Accuracy */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[10px] text-[#cbc3d9]/50 uppercase tracking-wider">정확도</span>
                <span className="text-[10px] font-bold text-[#cdbdff]">{accuracy}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#32343e] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${accuracy}%` }}
                  transition={{ duration: 0.5 }}
                  style={{
                    background: 'linear-gradient(to right, #cdbdff, #fabd00)',
                    boxShadow:  '0 0 8px rgba(205,189,255,0.3)',
                  }}
                />
              </div>
            </div>

            {/* WPM */}
            <div>
              <span className="text-[10px] text-[#cbc3d9]/50 uppercase tracking-wider block mb-1">타수</span>
              <div className="flex items-end gap-1.5">
                <span className="text-2xl font-bold tabular-nums text-[#e1e1ef]">{wpm}</span>
                <span className="text-xs text-[#494456] mb-0.5">WPM</span>
              </div>
            </div>

            {/* Time */}
            <div>
              <span className="text-[10px] text-[#cbc3d9]/50 uppercase tracking-wider block mb-1">경과 시간</span>
              <span className="text-2xl font-bold tabular-nums text-[#e1e1ef]">{fmtTime(elapsed)}</span>
            </div>

            {/* Combo */}
            {combo > 0 && (
              <div className="rounded-xl px-3 py-2 flex items-center gap-2"
                style={{ background: 'rgba(250,189,0,0.07)', border: '1px solid rgba(250,189,0,0.2)' }}>
                <span className="material-symbols-outlined text-[#fabd00]"
                  style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
                <span className="text-xs font-bold text-[#fabd00]">{combo} 콤보</span>
              </div>
            )}

            {/* Overall progress bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-[#cbc3d9]/50 uppercase tracking-wider">완료</span>
                <span className="text-[10px] font-bold text-[#cdbdff]">
                  {Math.round((charIndex / Math.max(targetText.length, 1)) * 100)}%
                </span>
              </div>
              <div className="h-1 rounded-full bg-[#32343e] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${(charIndex / Math.max(targetText.length, 1)) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  style={{ background: 'linear-gradient(to right, #5c1fde, #cdbdff)' }}
                />
              </div>
            </div>
          </div>

          {/* Progress Map */}
          <div
            className="rounded-2xl p-5 flex-1"
            style={{
              background:     'rgba(29,31,41,0.7)',
              backdropFilter: 'blur(24px)',
              border:         '1px solid rgba(73,68,86,0.2)',
            }}
          >
            <ProgressMap totalLines={lines.length} currentLine={currentLine} />
          </div>

          {/* Exit */}
          <button
            onClick={onExit}
            className="w-full py-2.5 rounded-xl text-xs font-bold tracking-widest text-[#494456] border border-[#494456]/25 hover:text-[#ffb4ab] hover:border-[#ffb4ab]/30 transition-all"
            style={{ background: 'rgba(29,31,41,0.5)', backdropFilter: 'blur(24px)' }}>
            ESC  중단
          </button>
        </div>
      </div>
    </div>
  );
}
