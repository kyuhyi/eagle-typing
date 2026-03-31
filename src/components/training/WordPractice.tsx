'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/hooks/useSound';
import type { SessionStats } from '@/types';
import type { EngineLanguage } from '@/lib/engine/typing-engine';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface WordPracticeProps {
  targetWords: string[];
  language: EngineLanguage;
  onComplete: (stats: SessionStats) => void;
  onExit: () => void;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function buildStats(
  correct: number,
  errors: number,
  wordsCompleted: number,
  elapsedSeconds: number
): SessionStats {
  const total = correct + errors;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;
  const minutes = elapsedSeconds / 60;
  const wpm = minutes > 0 ? Math.round(wordsCompleted / minutes) : 0;
  return {
    wpm,
    cpm: Math.round(correct / (minutes || 1)),
    accuracy,
    duration: elapsedSeconds,
    totalKeystrokes: total,
    correctKeystrokes: correct,
    errorCount: errors,
    longestStreak: 0,
  };
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function gradeFor(acc: number) {
  if (acc >= 98) return { label: 'S', color: '#fabd00' };
  if (acc >= 90) return { label: 'A', color: '#cdbdff' };
  if (acc >= 75) return { label: 'B', color: '#4ade80' };
  return { label: 'C', color: '#ffb4ab' };
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function WordPractice({
  targetWords,
  language,
  onComplete,
  onExit,
}: WordPracticeProps) {
  const [wordIndex, setWordIndex]           = useState(0);
  const [input, setInput]                   = useState('');
  const [correct, setCorrect]               = useState(0);
  const [errors, setErrors]                 = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [elapsed, setElapsed]               = useState(0);
  const [started, setStarted]               = useState(false);
  const [combo, setCombo]                   = useState(0);
  const [shake, setShake]                   = useState(false);
  const [flash, setFlash]                   = useState(false);
  const lockedRef  = useRef(false); // 단어 완성 후 입력 차단용

  const startRef   = useRef<number | null>(null);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const prevLen    = useRef(0);

  const { init: initSound, playKeyClick, playError, playSpace, playComboMilestone } = useSound();

  const currentWord = targetWords[wordIndex] ?? '';
  const total       = correct + errors;
  const accuracy    = total > 0 ? Math.round((correct / total) * 100) : 100;
  const minutes     = elapsed / 60;
  const wpm         = minutes > 0 ? Math.round(wordsCompleted / minutes) : 0;
  const grade       = gradeFor(accuracy);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  useEffect(() => { inputRef.current?.focus(); }, [wordIndex]);

  const ensureTimer = useCallback(() => {
    if (started) return;
    setStarted(true);
    initSound();
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - (startRef.current ?? Date.now())) / 1000));
    }, 500);
  }, [started, initSound]);

  // 확정된 글자 수 (composition 완료된 것만)
  const confirmedRef = useRef('');

  // 한글 조합 완성 시 호출
  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    if (lockedRef.current) {
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    // compositionend 후 input value에서 확정된 전체 텍스트 가져옴
    const fullValue = inputRef.current?.value ?? '';
    confirmedRef.current = fullValue;
    setInput(fullValue);

    // 단어 완성 체크
    if (fullValue === currentWord) {
      advanceWord();
    }
  }, [currentWord]);

  // 영문 등 비-IME 입력 처리
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (lockedRef.current) {
      e.target.value = '';
      return;
    }
    ensureTimer();
    const value = e.target.value;
    setInput(value);

    // IME 조합 중이면 아직 확정 아님 — display만 업데이트
    // compositionend에서 최종 처리
    // 영문 입력은 composition 없이 바로 onChange만 호출됨
    // 마지막 글자가 한글 자모인지 확인해서 구분
    const lastChar = value[value.length - 1] ?? '';
    const isKoreanChar = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(lastChar);

    if (!isKoreanChar && value.length > confirmedRef.current.length) {
      // 영문 키 입력
      const typed = lastChar;
      const expected = currentWord[value.length - 1] ?? '';
      if (typed === expected) {
        setCorrect(c => c + 1);
        setCombo(cb => {
          const next = cb + 1;
          if (next > 0 && next % 5 === 0) playComboMilestone(next);
          return next;
        });
        playKeyClick();
      } else {
        setErrors(er => er + 1);
        setCombo(0);
        playError();
        setShake(true);
        setTimeout(() => setShake(false), 300);
      }
      confirmedRef.current = value;
    }

    // 단어 완성 체크 (영문)
    if (!isKoreanChar && value === currentWord) {
      advanceWord();
    }
  }, [currentWord, ensureTimer, playKeyClick, playError, playComboMilestone]);

  const advanceWord = useCallback(() => {
    const newWords = wordsCompleted + 1;
    setWordsCompleted(newWords);
    lockedRef.current = true;
    setFlash(true);
    setInput('');
    confirmedRef.current = '';
    if (inputRef.current) inputRef.current.value = '';
    playKeyClick();

    setTimeout(() => {
      lockedRef.current = false;
      setFlash(false);
      const nextIdx = wordIndex + 1;
      if (nextIdx >= targetWords.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        const finalElapsed = startRef.current
          ? Math.floor((Date.now() - startRef.current) / 1000)
          : elapsed;
        onComplete(buildStats(correct, errors, newWords, finalElapsed));
      } else {
        setWordIndex(nextIdx);
        if (inputRef.current) inputRef.current.focus();
      }
    }, 200);
  }, [wordIndex, wordsCompleted, targetWords.length, correct, errors, elapsed,
      playKeyClick, onComplete]);

  // ─── Render ───────────────────────────────

  return (
    <div className="min-h-screen bg-[#11131c] text-white flex flex-col select-none">

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px]"
          style={{ background: 'rgba(92,31,222,0.05)' }} />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full blur-[120px]"
          style={{ background: 'rgba(250,189,0,0.04)' }} />
      </div>

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-[#494456]/20">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#cdbdff]"
            style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_stories
          </span>
          <span className="text-sm font-bold tracking-widest text-[#cdbdff] uppercase">낱말 연습</span>
          <span className="text-xs text-[#494456]">· {language === 'korean' ? '한글' : 'English'}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Grade pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(29,31,41,0.7)', border: '1px solid rgba(73,68,86,0.25)' }}>
            <span className="text-[10px] font-bold uppercase" style={{ color: grade.color }}>
              {grade.label}
            </span>
            <span className="text-[#494456] text-[10px]">·</span>
            <span className="text-[10px] font-bold text-[#cdbdff]">{accuracy}%</span>
          </div>
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#958da2] border border-[#494456]/40 hover:text-[#ffb4ab] hover:border-[#ffb4ab]/40 transition-all">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
            종료
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex gap-5 px-6 pb-6 pt-4 relative z-10 min-h-0">

        {/* ═══ LEFT: word stage ═══ */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6">

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-sm">
            {targetWords.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width:      i === wordIndex ? '22px' : '8px',
                  height:     '8px',
                  background: i < wordIndex   ? '#cdbdff'
                            : i === wordIndex ? '#fabd00'
                            : 'rgba(73,68,86,0.3)',
                  boxShadow: i === wordIndex ? '0 0 10px rgba(250,189,0,0.55)' : 'none',
                }}
              />
            ))}
          </div>

          {/* Counter */}
          <span className="text-[11px] font-bold text-[#494456] tracking-[0.2em] uppercase">
            {wordIndex + 1}
            <span className="text-[#32343e]"> / </span>
            {targetWords.length}
          </span>

          {/* Big word */}
          <AnimatePresence mode="wait">
            <motion.div
              key={wordIndex}
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{
                opacity: 1,
                scale:   flash ? 1.04 : 1,
                y:       0,
                filter:  flash ? 'brightness(1.7) drop-shadow(0 0 24px rgba(205,189,255,0.6))' : 'brightness(1)',
              }}
              exit={{ opacity: 0, scale: 0.88, y: -20 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            >
              <motion.span
                className="text-[7rem] font-bold leading-none block text-center tracking-tight"
                animate={shake ? { x: [-8, 8, -5, 5, -2, 2, 0] } : {}}
                transition={{ duration: 0.28 }}
              >
                {currentWord.split('').map((ch, i) => {
                  let color: string;
                  if (i < input.length)      color = input[i] === ch ? '#cdbdff' : '#ffb4ab';
                  else if (i === input.length) color = 'rgba(250,189,0,0.4)';
                  else                        color = 'rgba(225,225,239,0.2)';
                  return (
                    <span key={i} style={{ color, transition: 'color 80ms' }}>{ch}</span>
                  );
                })}
              </motion.span>
            </motion.div>
          </AnimatePresence>

          {/* Cursor row */}
          <div className="flex items-center gap-2">
            <span className="inline-block w-0.5 h-5 bg-[#fabd00] animate-pulse rounded-full" />
            <span className="text-xs tabular-nums text-[#494456]">
              {input.length}<span className="text-[#32343e]"> / </span>{currentWord.length}
            </span>
          </div>

          {/* Input field */}
          <div className="w-full max-w-sm">
            <input
              ref={inputRef}
              type="text"
              onChange={handleChange}
              onCompositionEnd={handleCompositionEnd}
              onKeyDown={(e) => { if (e.key === 'Escape') onExit(); if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (input === currentWord) advanceWord(); } }}
              placeholder={started ? '' : '단어를 입력하세요…'}
              className="w-full text-2xl text-center py-4 px-6 rounded-xl outline-none placeholder-[#494456]/40"
              style={{
                background:   '#0c0e17',
                border:       'none',
                borderBottom: `2px solid ${shake ? 'rgba(255,180,171,0.6)' : 'rgba(73,68,86,0.3)'}`,
                color:        '#e1e1ef',
                caretColor:   '#fabd00',
                transition:   'border-color 0.15s',
              }}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>

          {/* Combo badge */}
          <AnimatePresence>
            {combo >= 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full"
                style={{
                  background: 'rgba(250,189,0,0.08)',
                  border:     '1px solid rgba(250,189,0,0.28)',
                }}>
                <span className="material-symbols-outlined text-[#fabd00]"
                  style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
                <span className="text-xs font-bold text-[#fabd00]">{combo} COMBO</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!started && (
            <p className="text-[11px] text-[#494456] tracking-[0.15em] uppercase">
              입력하면 타이머가 자동 시작됩니다
            </p>
          )}
        </div>

        {/* ═══ RIGHT: Battle stats sidebar ═══ */}
        <div
          className="w-80 flex-shrink-0 rounded-3xl p-6 flex flex-col gap-5"
          style={{
            background:     'rgba(29,31,41,0.7)',
            backdropFilter: 'blur(24px)',
            border:         '1px solid rgba(73,68,86,0.2)',
          }}
        >
          {/* Title */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#fabd00]"
              style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
              shield_with_heart
            </span>
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#fabd00] uppercase">전투 통계</h3>
          </div>

          {/* Accuracy */}
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] text-[#cbc3d9]/50 uppercase tracking-wider">정확도</span>
              <span className="text-[10px] font-bold text-[#cdbdff]">{accuracy}%</span>
            </div>
            <div className="h-2 rounded-full bg-[#32343e] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${accuracy}%` }}
                transition={{ duration: 0.5 }}
                style={{
                  background: 'linear-gradient(to right, #cdbdff, #fabd00)',
                  boxShadow:  '0 0 8px rgba(205,189,255,0.4)',
                }}
              />
            </div>
          </div>

          {/* Time */}
          <div>
            <span className="text-[10px] text-[#cbc3d9]/50 uppercase tracking-wider block mb-1">진행 시간</span>
            <span className="text-3xl font-bold tabular-nums text-[#e1e1ef]">{fmtTime(elapsed)}</span>
          </div>

          {/* WPM */}
          <div>
            <span className="text-[10px] text-[#cbc3d9]/50 uppercase tracking-wider block mb-1">타수</span>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold tabular-nums text-[#e1e1ef]">{wpm}</span>
              <span className="text-xs text-[#494456] mb-1">WPM</span>
            </div>
          </div>

          {/* Words */}
          <div>
            <span className="text-[10px] text-[#cbc3d9]/50 uppercase tracking-wider block mb-1">완료 단어</span>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-[#cdbdff]">{wordsCompleted}</span>
              <span className="text-sm text-[#494456] mb-0.5">/ {targetWords.length}</span>
            </div>
          </div>

          {/* Word progress */}
          <div className="h-1 rounded-full bg-[#32343e] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${(wordsCompleted / Math.max(targetWords.length, 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
              style={{ background: 'linear-gradient(to right, #5c1fde, #cdbdff)' }}
            />
          </div>

          <div className="h-px bg-[#494456]/20" />

          {/* Active Buff */}
          <div>
            <span className="text-[10px] text-[#cbc3d9]/50 uppercase tracking-wider block mb-3">Active Buff</span>
            <div className="rounded-xl p-3 flex items-start gap-3"
              style={{ background: 'rgba(92,31,222,0.1)', border: '1px solid rgba(92,31,222,0.2)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(92,31,222,0.15)' }}>
                <span className="material-symbols-outlined text-[#cdbdff]"
                  style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>bolt</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#cdbdff] mb-0.5">집중 강화</p>
                <p className="text-[10px] text-[#958da2] leading-relaxed">연속 정타 시 경험치 +20%</p>
              </div>
            </div>

            <AnimatePresence>
              {combo >= 5 && (
                <motion.div
                  key="fever"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="mt-2 rounded-xl p-3 flex items-start gap-3"
                  style={{ background: 'rgba(250,189,0,0.08)', border: '1px solid rgba(250,189,0,0.25)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(250,189,0,0.1)' }}>
                    <span className="material-symbols-outlined text-[#fabd00]"
                      style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
                      local_fire_department
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#fabd00] mb-0.5">콤보 피버!</p>
                    <p className="text-[10px] text-[#958da2] leading-relaxed">속도 +10% 보너스 발동 중</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Exit */}
          <button
            onClick={onExit}
            className="mt-auto w-full py-2.5 rounded-xl text-xs font-bold tracking-widest text-[#494456] border border-[#494456]/25 hover:text-[#ffb4ab] hover:border-[#ffb4ab]/30 transition-all"
            style={{ background: '#0c0e17' }}>
            ESC  연습 중단
          </button>
        </div>
      </div>
    </div>
  );
}
