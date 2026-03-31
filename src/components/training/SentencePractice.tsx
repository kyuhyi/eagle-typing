'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/hooks/useSound';
import type { SessionStats } from '@/types';
import type { EngineLanguage } from '@/lib/engine/typing-engine';

// ─────────────────────────────────────────────
// Types & helpers
// ─────────────────────────────────────────────

interface SentencePracticeProps {
  targetText: string;
  language: EngineLanguage;
  onComplete: (stats: SessionStats) => void;
  onExit: () => void;
}

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
    duration:           elapsedSeconds,
    totalKeystrokes:    total,
    correctKeystrokes:  correct,
    errorCount:         errors,
    longestStreak:      0,
  };
}

function fmtTime(s: number) {
  const m   = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function gradeFor(acc: number) {
  if (acc >= 98) return { label: 'S', color: '#fabd00',  bg: 'rgba(250,189,0,0.12)'  };
  if (acc >= 90) return { label: 'A', color: '#cdbdff',  bg: 'rgba(205,189,255,0.12)' };
  if (acc >= 75) return { label: 'B', color: '#4ade80',  bg: 'rgba(74,222,128,0.12)' };
  return             { label: 'C', color: '#ffb4ab',  bg: 'rgba(255,180,171,0.12)' };
}

// Clamp 0-100 for the WPM needle (max display: 200 wpm)
function wpmToAngle(wpm: number) {
  const clamped = Math.min(wpm, 200);
  return -120 + (clamped / 200) * 240; // -120deg (0) → +120deg (200)
}

// ─────────────────────────────────────────────
// WPM Speedometer (arc)
// ─────────────────────────────────────────────

function Speedometer({ wpm }: { wpm: number }) {
  const angle = wpmToAngle(wpm);
  const cx = 60, cy = 60, r = 46;
  // Arc from -120deg to angle (in SVG coords)
  const toRad = (d: number) => (d * Math.PI) / 180;
  const startAngle = -120;
  const endAngle   = angle;

  const arcX1 = cx + r * Math.cos(toRad(startAngle));
  const arcY1 = cy + r * Math.sin(toRad(startAngle));
  const arcX2 = cx + r * Math.cos(toRad(endAngle));
  const arcY2 = cy + r * Math.sin(toRad(endAngle));
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  const needleX = cx + 38 * Math.cos(toRad(angle));
  const needleY = cy + 38 * Math.sin(toRad(angle));

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="120" height="80" viewBox="0 0 120 80">
        {/* Track */}
        <path
          d={`M ${cx + r * Math.cos(toRad(-120))} ${cy + r * Math.sin(toRad(-120))} A ${r} ${r} 0 1 1 ${cx + r * Math.cos(toRad(120))} ${cy + r * Math.sin(toRad(120))}`}
          fill="none" stroke="rgba(73,68,86,0.3)" strokeWidth="5" strokeLinecap="round"
        />
        {/* Fill */}
        {wpm > 0 && (
          <path
            d={`M ${arcX1} ${arcY1} A ${r} ${r} 0 ${largeArc} 1 ${arcX2} ${arcY2}`}
            fill="none"
            stroke="url(#speedGrad)"
            strokeWidth="5"
            strokeLinecap="round"
          />
        )}
        <defs>
          <linearGradient id="speedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#cdbdff" />
            <stop offset="100%" stopColor="#fabd00" />
          </linearGradient>
        </defs>
        {/* Needle */}
        <line x1={cx.toString()} y1={cy.toString()} x2={needleX.toString()} y2={needleY.toString()}
          stroke="#fabd00" strokeWidth="2" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="4" fill="#fabd00" />
      </svg>
      <span className="text-2xl font-bold tabular-nums text-[#e1e1ef]">{wpm}</span>
      <span className="text-[10px] text-[#494456] uppercase tracking-wider">WPM</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Keyboard hint (next 3 chars)
// ─────────────────────────────────────────────

function KeyHints({ text, index }: { text: string; index: number }) {
  const chars = [
    text[index] ?? null,
    text[index + 1] ?? null,
    text[index + 2] ?? null,
  ];
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[#494456] uppercase tracking-wider mr-1">다음</span>
      {chars.map((ch, i) => (
        <div
          key={i}
          className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm transition-all"
          style={{
            background: i === 0
              ? 'rgba(250,189,0,0.12)'
              : 'rgba(29,31,41,0.7)',
            border: i === 0
              ? '1px solid rgba(250,189,0,0.35)'
              : '1px solid rgba(73,68,86,0.25)',
            color: i === 0 ? '#fabd00' : ch ? '#cbc3d9' : 'rgba(73,68,86,0.3)',
            opacity: ch ? 1 : 0.3,
            transform: i === 0 ? 'scale(1.15)' : 'scale(1)',
          }}
        >
          {ch === ' ' ? '⎵' : (ch ?? '')}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

export default function SentencePractice({
  targetText,
  language,
  onComplete,
  onExit,
}: SentencePracticeProps) {
  const [charIndex, setCharIndex]   = useState(0);
  const [correct, setCorrect]       = useState(0);
  const [errors, setErrors]         = useState(0);
  const [combo, setCombo]           = useState(0);
  const [maxCombo, setMaxCombo]     = useState(0);
  const [elapsed, setElapsed]       = useState(0);
  const [started, setStarted]       = useState(false);
  const [shake, setShake]           = useState(false);
  const [flash, setFlash]           = useState<'correct' | null>(null);
  // errored positions (for red underline in display)
  const [errorSet, setErrorSet]     = useState<Set<number>>(new Set());

  const startRef  = useRef<number | null>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const { init: initSound, playKeyClick, playError, playSpace, playComboMilestone } = useSound();

  const total    = correct + errors;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;
  const minutes  = elapsed / 60;
  const cpm      = minutes > 0 ? Math.round(correct / minutes) : 0;
  const wpm      = Math.round(cpm / 5);
  const grade    = gradeFor(accuracy);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const restart = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCharIndex(0); setCorrect(0); setErrors(0);
    setCombo(0); setMaxCombo(0); setElapsed(0);
    setStarted(false); setShake(false); setFlash(null);
    setErrorSet(new Set());
    startRef.current = null;
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

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
      const newCorrect = correct + 1;
      const newCombo   = combo + 1;
      setCorrect(newCorrect);
      setCombo(newCombo);
      setMaxCombo(m => Math.max(m, newCombo));
      if (ch === ' ') playSpace();
      else            playKeyClick();
      if (newCombo > 0 && newCombo % 10 === 0) playComboMilestone(newCombo);
    } else {
      setErrors(e2 => e2 + 1);
      setCombo(0);
      playError();
      setErrorSet(s => new Set(s).add(charIndex));
      setShake(true);
      setTimeout(() => setShake(false), 280);
    }

    // 맞든 틀리든 다음 글자로 넘어감
    const nextIndex = charIndex + 1;
    setCharIndex(nextIndex);

    if (nextIndex >= targetText.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      const finalElapsed = startRef.current
        ? Math.floor((Date.now() - startRef.current) / 1000)
        : elapsed;
      onComplete(buildStats(isCorrect ? correct + 1 : correct, isCorrect ? errors : errors + 1, finalElapsed));
    }
  }, [charIndex, correct, combo, errors, elapsed, targetText, ensureTimer,
      playKeyClick, playError, playSpace, playComboMilestone, onExit, onComplete]);

  // 한글 IME composition 처리
  const handleCompositionEnd = useCallback((e: CompositionEvent) => {
    if (!e.data) return;
    ensureTimer();
    // 한글 조합 완성된 문자를 한 글자씩 처리
    for (const ch of e.data) {
      const expected = targetText[charIndex] ?? '';
      const isCorrect = ch === expected;

      if (isCorrect) {
        setCorrect(c => c + 1);
        setCombo(cb => {
          const next = cb + 1;
          setMaxCombo(m => Math.max(m, next));
          if (next > 0 && next % 10 === 0) playComboMilestone(next);
          return next;
        });
        playKeyClick();
      } else {
        setErrors(e2 => e2 + 1);
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

  // ─── Text render ──────────────────────────────────────────────

  const renderText = () =>
    targetText.split('').map((ch, i) => {
      let color: string;
      let extra = '';
      if (i < charIndex) {
        color = errorSet.has(i) ? '#ffb4ab' : '#ffffff';
      } else if (i === charIndex) {
        color = '#fabd00';
        extra = 'current-char';
      } else {
        color = 'rgba(225,225,239,0.25)';
      }
      return (
        <span
          key={i}
          className={extra}
          style={{ color, transition: 'color 60ms', position: 'relative' }}
        >
          {ch === '\n' ? '↵' : ch}
          {i === charIndex && (
            <span
              className="animate-pulse"
              style={{
                position:   'absolute',
                left:       0,
                bottom:     '-2px',
                width:      '100%',
                height:     '2px',
                background: '#fabd00',
                borderRadius: '1px',
              }}
            />
          )}
        </span>
      );
    });

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#11131c] text-white flex flex-col select-none">

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/3 w-[400px] h-[400px] rounded-full blur-[140px]"
          style={{ background: 'rgba(92,31,222,0.05)' }} />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full blur-[100px]"
          style={{ background: 'rgba(250,189,0,0.04)' }} />
      </div>

      {/* Bracket left/right decorations */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 w-1 h-32 rounded-r-full pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(92,31,222,0.4), transparent)' }} />
      <div className="fixed right-0 top-1/2 -translate-y-1/2 w-1 h-32 rounded-l-full pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(250,189,0,0.3), transparent)' }} />

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
          if (e.nativeEvent.data) {
            // Clear input value after composition
            if (inputRef.current) inputRef.current.value = '';
          }
        }}
        onKeyDown={(e) => {
          if (!e.nativeEvent.isComposing) e.preventDefault();
        }}
        onBlur={() => setTimeout(() => inputRef.current?.focus(), 10)}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-[#494456]/20">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#5c1fde]"
            style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          <span className="text-sm font-bold tracking-widest text-[#e1e1ef] uppercase">단문 연습</span>
          <span className="text-xs text-[#494456]">· {language === 'korean' ? '한글' : 'English'}</span>
        </div>
        <button onClick={onExit}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#958da2] border border-[#494456]/40 hover:text-[#ffb4ab] hover:border-[#ffb4ab]/40 transition-all">
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
          종료
        </button>
      </header>

      <div className="flex-1 flex gap-4 p-6 relative z-10">

        {/* ═══ MAIN: stat cards + typing canvas ═══ */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Top 3 stat cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* Grade */}
            <div className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: grade.bg, border: `1px solid ${grade.color}30` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl"
                style={{ background: grade.bg, color: grade.color }}>
                {grade.label}
              </div>
              <div>
                <p className="text-[10px] text-[#cbc3d9]/50 uppercase tracking-wider">등급</p>
                <p className="text-sm font-bold" style={{ color: grade.color }}>
                  {grade.label === 'S' ? '완벽'
                    : grade.label === 'A' ? '우수'
                    : grade.label === 'B' ? '양호' : '보통'}
                </p>
              </div>
            </div>

            {/* Accuracy */}
            <div className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: 'rgba(29,31,41,0.7)', border: '1px solid rgba(73,68,86,0.2)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(205,189,255,0.08)' }}>
                <span className="material-symbols-outlined text-[#cdbdff]" style={{ fontSize: '20px' }}>
                  target
                </span>
              </div>
              <div>
                <p className="text-[10px] text-[#cbc3d9]/50 uppercase tracking-wider">정확도</p>
                <p className="text-sm font-bold text-[#cdbdff]">{accuracy}%</p>
              </div>
            </div>

            {/* Combo */}
            <div className="rounded-2xl p-4 flex items-center gap-3"
              style={{
                background: combo >= 5 ? 'rgba(250,189,0,0.08)' : 'rgba(29,31,41,0.7)',
                border:     combo >= 5 ? '1px solid rgba(250,189,0,0.25)' : '1px solid rgba(73,68,86,0.2)',
              }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: combo >= 5 ? 'rgba(250,189,0,0.12)' : 'rgba(92,31,222,0.08)' }}>
                <span className="material-symbols-outlined"
                  style={{ fontSize: '20px', color: combo >= 5 ? '#fabd00' : '#cdbdff',
                    fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
              </div>
              <div>
                <p className="text-[10px] text-[#cbc3d9]/50 uppercase tracking-wider">콤보</p>
                <p className="text-sm font-bold" style={{ color: combo >= 5 ? '#fabd00' : '#e1e1ef' }}>
                  {combo}
                  {maxCombo > 0 && <span className="text-xs text-[#494456] font-normal ml-1">최대 {maxCombo}</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Typing canvas */}
          <div className="flex-1 rounded-2xl p-8 flex flex-col gap-6 relative overflow-hidden"
            style={{
              background:     'rgba(29,31,41,0.7)',
              backdropFilter: 'blur(24px)',
              border:         '1px solid rgba(73,68,86,0.2)',
            }}>

            {/* Inner glow */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }} />

            {/* Progress bar */}
            <div className="h-0.5 rounded-full bg-[#32343e] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${(charIndex / Math.max(targetText.length, 1)) * 100}%` }}
                transition={{ duration: 0.2 }}
                style={{ background: 'linear-gradient(to right, #5c1fde, #cdbdff)' }}
              />
            </div>

            {/* Sentence text */}
            <motion.div
              className="flex-1 flex items-center"
              animate={shake ? { x: [-5, 5, -3, 3, -1, 1, 0] } : {}}
              transition={{ duration: 0.26 }}
            >
              <p
                className="text-3xl font-semibold leading-relaxed tracking-wide"
                style={{ lineHeight: '1.8' }}
              >
                {renderText()}
              </p>
            </motion.div>

            {/* Bottom: key hints + speedometer */}
            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-3">
                <KeyHints text={targetText} index={charIndex} />
                {!started && (
                  <p className="text-[11px] text-[#494456] tracking-[0.15em] uppercase">
                    아무 키나 눌러 시작하세요
                  </p>
                )}
                {started && (
                  <p className="text-[10px] text-[#494456]">
                    {charIndex} / {targetText.length} 자 · {fmtTime(elapsed)}
                  </p>
                )}
              </div>
              <Speedometer wpm={wpm} />
            </div>
          </div>
        </div>

        {/* ═══ RIGHT: floating actions ═══ */}
        <div className="w-14 flex-shrink-0 flex flex-col items-center gap-3 pt-[72px]">
          {/* Restart */}
          <button
            onClick={restart}
            title="다시 시작"
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#958da2] border border-[#494456]/30 hover:text-[#cdbdff] hover:border-[#cdbdff]/40 transition-all"
            style={{ background: 'rgba(29,31,41,0.7)', backdropFilter: 'blur(24px)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>restart_alt</span>
          </button>

          {/* Stats (current session summary) */}
          <button
            title="통계 보기"
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#958da2] border border-[#494456]/30 hover:text-[#fabd00] hover:border-[#fabd00]/40 transition-all"
            style={{ background: 'rgba(29,31,41,0.7)', backdropFilter: 'blur(24px)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bar_chart</span>
          </button>

          {/* Spacer */}
          <div className="flex-1 w-px my-2" style={{
            background: 'linear-gradient(to bottom, transparent, rgba(73,68,86,0.2), transparent)'
          }} />

          {/* Exit */}
          <button
            onClick={onExit}
            title="종료"
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-[#958da2] border border-[#494456]/30 hover:text-[#ffb4ab] hover:border-[#ffb4ab]/40 transition-all"
            style={{ background: 'rgba(29,31,41,0.7)', backdropFilter: 'blur(24px)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
