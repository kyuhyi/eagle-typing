'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BossConfig, SessionStats } from '@/types';
import type { EngineLanguage } from '@/lib/engine/typing-engine';
import { useSound } from '@/hooks/useSound';

// ─── Props ───────────────────────────────────────────────────────────────────

interface BossBattleProps {
  bossConfig: BossConfig;
  targetText: string;
  language: EngineLanguage;
  lessonId: string;
  onVictory: (stats: SessionStats) => void;
  onDefeat: () => void;
  onExit: () => void;
}

// ─── Internal types ───────────────────────────────────────────────────────────

interface FallingWord {
  id: number;
  word: string;
  x: number;     // left % (5–88)
  y: number;     // top px inside the arena
  speed: number; // px per ms
}

interface DmgFloat {
  id: number;
  value: number;
  x: number; // left %
}

type BattlePhase = 'intro' | 'fighting' | 'victory' | 'defeat';

// ─── Constants ────────────────────────────────────────────────────────────────

const ARENA_H = 460;           // arena height in px
const PLAYER_MAX_HP = 3;       // lives
const MAX_ON_SCREEN = 9;       // max concurrent falling words
const SPAWN_BASE_MS = 2000;    // initial spawn interval

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getBossEmoji(name: string): string {
  const map: Record<string, string> = {
    '거대 지렁이': '🐛', '폭풍 구름': '🌩️', '대지의 곰': '🐻',
    '코드 마법사': '🧙', '한글 수호신': '🐉', '전설의 학': '🦢', '하늘의 왕': '🦅',
  };
  return map[name] ?? '👾';
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BossBattle({
  bossConfig,
  targetText,
  language,
  lessonId: _lessonId,
  onVictory,
  onDefeat,
  onExit,
}: BossBattleProps) {

  // ── React render state ──
  const [phase, setPhase] = useState<BattlePhase>('intro');
  const [bossHp, setBossHp] = useState(bossConfig.hp);
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [timeLeft, setTimeLeft] = useState(bossConfig.timeLimit);
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [wordsKilled, setWordsKilled] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [comboLabel, setComboLabel] = useState<string | null>(null);
  const [dmgFloats, setDmgFloats] = useState<DmgFloat[]>([]);
  const [flash, setFlash] = useState<'hit' | 'dmg' | null>(null);

  // ── Authoritative game-loop refs (never stale in rAF) ──
  const phaseRef = useRef<BattlePhase>('intro');
  const bossHpRef = useRef(bossConfig.hp);
  const playerHpRef = useRef(PLAYER_MAX_HP);
  const timeLeftRef = useRef(bossConfig.timeLimit);
  const wordsKilledRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const wordsRef = useRef<FallingWord[]>([]);
  const poolRef = useRef<string[]>([]);
  const poolIdxRef = useRef(0);
  const wordIdRef = useRef(0);
  const dmgIdRef = useRef(0);

  // ── Timing refs ──
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(0);
  const spawnAccRef = useRef(0);
  const timerAccRef = useRef(0);
  const frameRef = useRef(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Sounds via stable ref ──
  const soundInitRef = useRef(false);
  const { init: initSound, playKeyClick, playError, playBossHit, playBossDefeat } = useSound();
  const sfx = useRef({ playKeyClick, playError, playBossHit, playBossDefeat, initSound });
  useEffect(() => {
    sfx.current = { playKeyClick, playError, playBossHit, playBossDefeat, initSound };
  }, [playKeyClick, playError, playBossHit, playBossDefeat, initSound]);

  // damage per word: ~20 hits to kill the boss
  const dmgPerWord = Math.max(1, Math.ceil(bossConfig.hp / 20));

  // ── Build word pool ──
  useEffect(() => {
    const raw = targetText
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z가-힣ㄱ-ㅎㅏ-ㅣ]/g, ''))
      .filter((w) => w.length >= 2);
    const base = raw.length > 0 ? raw : ['attack', 'defend', 'magic', 'spell', 'dark', 'fire', 'ice'];
    const s = [...base].sort(() => Math.random() - 0.5);
    poolRef.current = [...s, ...s, ...s, ...s]; // repeat ×4
  }, [targetText]);

  // ── Spawn one word (called from game loop) ──
  const spawnWord = useCallback(() => {
    if (wordsRef.current.length >= MAX_ON_SCREEN || poolRef.current.length === 0) return;
    const word = poolRef.current[poolIdxRef.current % poolRef.current.length];
    poolIdxRef.current++;

    let x = 5 + Math.random() * 80;
    const xs = wordsRef.current.map((w) => w.x);
    for (let i = 0; i < 10; i++) {
      if (!xs.some((ex) => Math.abs(ex - x) < 13)) break;
      x = 5 + Math.random() * 80;
    }
    const diffMult = bossConfig.hp > 150 ? 1.5 : bossConfig.hp > 80 ? 1.2 : 1.0;
    const speed = (0.032 + Math.random() * 0.022) * diffMult;
    wordsRef.current = [...wordsRef.current, { id: ++wordIdRef.current, word, x, y: -36, speed }];
  }, [bossConfig.hp]);

  // ── Core game loop ──
  const gameLoop = useCallback((ts: number) => {
    if (phaseRef.current !== 'fighting') return;

    const dt = lastTsRef.current === 0 ? 16 : Math.min(ts - lastTsRef.current, 50);
    lastTsRef.current = ts;
    frameRef.current++;

    // 1s timer tick
    timerAccRef.current += dt;
    if (timerAccRef.current >= 1000) {
      timerAccRef.current -= 1000;
      const next = timeLeftRef.current - 1;
      timeLeftRef.current = next;
      setTimeLeft(next);
      if (next <= 0) { phaseRef.current = 'defeat'; setPhase('defeat'); return; }
    }

    // Spawn (accelerates with kills)
    const interval = Math.max(600, SPAWN_BASE_MS - wordsKilledRef.current * 35);
    spawnAccRef.current += dt;
    if (spawnAccRef.current >= interval) { spawnAccRef.current = 0; spawnWord(); }

    // Move + bottom-collision
    let dmg = 0;
    const alive: FallingWord[] = [];
    for (const w of wordsRef.current) {
      const ny = w.y + w.speed * dt;
      if (ny > ARENA_H) { dmg++; }
      else { alive.push({ ...w, y: ny }); }
    }
    wordsRef.current = alive;

    if (dmg > 0) {
      const hp = Math.max(0, playerHpRef.current - dmg);
      playerHpRef.current = hp;
      comboRef.current = 0;
      setPlayerHp(hp);
      setFlash('dmg');
      sfx.current.playError();
      setTimeout(() => setFlash(null), 280);
      if (hp <= 0) { phaseRef.current = 'defeat'; setPhase('defeat'); return; }
    }

    // Sync render at ~30fps
    if (frameRef.current % 2 === 0) setFallingWords([...wordsRef.current]);

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [spawnWord]);

  // ── Start / stop loop ──
  useEffect(() => {
    if (phase === 'fighting') {
      phaseRef.current = 'fighting';
      lastTsRef.current = 0;
      rafRef.current = requestAnimationFrame(gameLoop);
    } else {
      phaseRef.current = phase;
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    }
    return () => { if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };
  }, [phase, gameLoop]);

  // ── Input: auto-match on exact word ──
  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    if (!soundInitRef.current) { sfx.current.initSound(); soundInitRef.current = true; }

    const trimmed = raw.trim().toLowerCase();
    if (!trimmed) return;
    sfx.current.playKeyClick();

    const idx = wordsRef.current.findIndex((w) => w.word.toLowerCase() === trimmed);
    if (idx === -1) return;

    const matched = wordsRef.current[idx];
    wordsRef.current = wordsRef.current.filter((w) => w.id !== matched.id);
    setFallingWords([...wordsRef.current]); // trigger AnimatePresence exit

    // Boss damage
    const newBossHp = Math.max(0, bossHpRef.current - dmgPerWord);
    bossHpRef.current = newBossHp;
    setBossHp(newBossHp);

    // Combo + kills
    const newCombo = comboRef.current + 1;
    comboRef.current = newCombo;
    if (newCombo > maxComboRef.current) { maxComboRef.current = newCombo; setMaxCombo(newCombo); }
    wordsKilledRef.current++;
    setWordsKilled((c) => c + 1);

    // Floating damage number
    const fId = ++dmgIdRef.current;
    setDmgFloats((prev) => [...prev.slice(-6), { id: fId, value: dmgPerWord, x: matched.x }]);
    setTimeout(() => setDmgFloats((prev) => prev.filter((d) => d.id !== fId)), 800);

    // Flash + combo label
    setFlash('hit');
    setTimeout(() => setFlash(null), 130);

    if (newCombo >= 3 && newCombo % 3 === 0) {
      const label =
        newCombo >= 18 ? `${newCombo} LEGENDARY!!` :
        newCombo >= 12 ? `${newCombo} AMAZING!` :
        newCombo >= 6  ? `${newCombo} COMBO!` : `${newCombo} STREAK!`;
      setComboLabel(label);
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      comboTimerRef.current = setTimeout(() => setComboLabel(null), 950);
    }

    sfx.current.playBossHit();
    setInputValue('');

    if (newBossHp <= 0) {
      phaseRef.current = 'victory';
      setPhase('victory');
      sfx.current.playBossDefeat();
    }
  }, [dmgPerWord]);

  // Enter: confirm match (Korean IME ends composition on Enter)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) handleInput({ target: { value: trimmed } } as React.ChangeEvent<HTMLInputElement>);
  }, [inputValue, handleInput]);

  // Focus input on fight start
  useEffect(() => {
    if (phase === 'fighting') setTimeout(() => inputRef.current?.focus(), 80);
  }, [phase]);

  // ── Start / restart ──
  const startFight = useCallback(() => {
    bossHpRef.current = bossConfig.hp;
    playerHpRef.current = PLAYER_MAX_HP;
    timeLeftRef.current = bossConfig.timeLimit;
    wordsKilledRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    wordsRef.current = [];
    spawnAccRef.current = 0;
    timerAccRef.current = 0;
    frameRef.current = 0;
    lastTsRef.current = 0;
    poolIdxRef.current = Math.floor(Math.random() * Math.max(1, poolRef.current.length / 2));

    setBossHp(bossConfig.hp);
    setPlayerHp(PLAYER_MAX_HP);
    setTimeLeft(bossConfig.timeLimit);
    setFallingWords([]);
    setInputValue('');
    setWordsKilled(0);
    setMaxCombo(0);
    setComboLabel(null);
    setDmgFloats([]);
    setFlash(null);
    setPhase('fighting');
  }, [bossConfig]);

  // ── Derived ──
  const bossHpPct = (bossHp / bossConfig.hp) * 100;
  const timerColor = timeLeft > 30 ? '#e1e1ef' : timeLeft > 10 ? '#fabd00' : '#ffb4ab';
  const activeWord = inputValue.trim()
    ? fallingWords.find((w) => w.word.toLowerCase().startsWith(inputValue.trim().toLowerCase()))
    : undefined;

  const buildStats = (): SessionStats => {
    const elapsed = Math.max(1, bossConfig.timeLimit - timeLeft);
    const wk = wordsKilledRef.current;
    return {
      wpm: Math.round((wk * 5) / (elapsed / 60)),
      cpm: Math.round((wk * 25) / (elapsed / 60)),
      accuracy: Math.round((wk / Math.max(1, wk + (PLAYER_MAX_HP - playerHpRef.current) * 3)) * 100),
      duration: elapsed,
      totalKeystrokes: wk,
      correctKeystrokes: wk,
      errorCount: Math.max(0, PLAYER_MAX_HP - playerHpRef.current),
      longestStreak: maxComboRef.current,
    };
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">

        {/* ════════ INTRO ════════ */}
        {phase === 'intro' && (
          <motion.div key="intro" className="flex flex-col items-center gap-8 py-16"
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.4 }}
          >
            <motion.div className="text-8xl"
              animate={{ y: [0, -14, 0], rotate: [0, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
            >
              {getBossEmoji(bossConfig.name)}
            </motion.div>

            <div className="text-center space-y-3">
              <p className="text-xs font-bold tracking-widest" style={{ color: '#ffb4ab' }}>BOSS BATTLE</p>
              <h2 className="text-4xl font-extrabold"
                style={{ color: '#e1e1ef', textShadow: '0 0 24px rgba(239,68,68,0.5)' }}>
                {bossConfig.name}
              </h2>
              <div className="flex gap-6 justify-center text-sm" style={{ color: '#958da2' }}>
                <span>HP {bossConfig.hp}</span>
                <span style={{ color: '#494456' }}>|</span>
                <span>제한 {fmt(bossConfig.timeLimit)}</span>
                <span style={{ color: '#494456' }}>|</span>
                <span>목표 {bossConfig.targetWpm} WPM</span>
              </div>
            </div>

            <div className="px-6 py-4 rounded-2xl border border-[#494456]/60 text-sm text-center space-y-1.5 max-w-sm"
              style={{ background: 'rgba(29,31,41,0.75)', backdropFilter: 'blur(16px)' }}>
              <p style={{ color: '#cdbdff' }}>단어가 화면 아래에 닿으면 ❤️ 1개를 잃습니다</p>
              <p style={{ color: '#958da2' }}>단어를 타이핑하면 자동 파괴 — 보스 HP 감소</p>
              <p style={{ color: '#494456' }}>{language === 'korean' ? '한글: Enter로 확정' : 'English: 자동 매칭'}</p>
            </div>

            <motion.button
              className="px-10 py-4 rounded-xl font-extrabold text-xl border-2"
              style={{
                background: 'linear-gradient(135deg, #7c0404 0%, #5c1fde 100%)',
                borderColor: 'rgba(255,180,171,0.25)', color: '#e1e1ef',
                boxShadow: '0 0 40px rgba(239,68,68,0.25), 0 0 20px rgba(92,31,222,0.2)',
              }}
              whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.95 }} onClick={startFight}
            >
              ⚔️ 전투 시작!
            </motion.button>

            <button className="text-sm hover:underline" style={{ color: '#958da2' }} onClick={onExit}>
              돌아가기
            </button>
          </motion.div>
        )}

        {/* ════════ FIGHTING ════════ */}
        {phase === 'fighting' && (
          <motion.div key="fighting" className="flex flex-col gap-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            {/* ── Top HUD ── */}
            <div className="flex items-center gap-4 px-4 py-3 rounded-2xl border border-[#494456]/50"
              style={{ background: 'rgba(29,31,41,0.9)', backdropFilter: 'blur(20px)' }}>

              <div className="flex items-center gap-2 shrink-0">
                <motion.span className="text-2xl"
                  animate={bossHp < bossConfig.hp * 0.3 ? { rotate: [0, -8, 8, 0] } : { rotate: 0 }}
                  transition={{ repeat: Infinity, duration: 0.6 }}>
                  {getBossEmoji(bossConfig.name)}
                </motion.span>
                <span className="text-xs font-bold max-w-[72px] truncate" style={{ color: '#ffb4ab' }}>
                  {bossConfig.name}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-[10px] mb-1" style={{ color: '#958da2' }}>
                  <span>BOSS HP</span>
                  <span style={{ color: '#ffb4ab' }}>{bossHp} / {bossConfig.hp}</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: '#1d1f29' }}>
                  <motion.div className="h-full rounded-full"
                    style={{
                      background: bossHpPct > 50
                        ? 'linear-gradient(to right,#7f1d1d,#ef4444)'
                        : bossHpPct > 25
                        ? 'linear-gradient(to right,#7c2d12,#f97316)'
                        : 'linear-gradient(to right,#450a0a,#dc2626)',
                    }}
                    animate={{ width: `${bossHpPct}%` }}
                    transition={{ type: 'spring', damping: 18, stiffness: 140 }}
                  />
                </div>
              </div>

              <motion.div className="text-xl font-mono font-bold tabular-nums shrink-0"
                style={{ color: timerColor, minWidth: '3.5rem', textAlign: 'right' }}
                animate={timeLeft <= 10 ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={timeLeft <= 10 ? { duration: 0.75, repeat: Infinity } : {}}>
                {timeLeft <= 10 && timeLeft > 0 && <span className="text-sm mr-0.5">⚠</span>}
                {fmt(timeLeft)}
              </motion.div>

              <div className="flex gap-0.5 shrink-0">
                {Array.from({ length: PLAYER_MAX_HP }).map((_, i) => (
                  <motion.span key={i} className="text-base leading-none"
                    animate={i >= playerHp ? { scale: [1, 1.4, 0.7], opacity: [1, 0.5, 0.35] } : {}}
                    transition={{ duration: 0.35 }}>
                    {i < playerHp ? '❤️' : '🖤'}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* ── Arena ── */}
            <div className="relative w-full overflow-hidden rounded-2xl border"
              style={{
                height: ARENA_H,
                borderColor: flash === 'dmg' ? 'rgba(239,68,68,0.65)' : flash === 'hit' ? 'rgba(250,189,0,0.4)' : 'rgba(73,68,86,0.4)',
                background: 'radial-gradient(ellipse at 50% -10%, rgba(92,31,222,0.14) 0%, #0c0e16 55%)',
                boxShadow: flash === 'dmg'
                  ? 'inset 0 0 80px rgba(239,68,68,0.3), 0 0 0 3px rgba(239,68,68,0.35)'
                  : flash === 'hit' ? 'inset 0 0 40px rgba(250,189,0,0.14)' : 'none',
                transition: 'box-shadow 0.12s ease, border-color 0.12s ease',
              }}>

              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 44px),' +
                  'repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 56px)',
              }} />

              {/* Danger zone */}
              <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-[1]"
                style={{ height: 56, background: 'linear-gradient(to top,rgba(239,68,68,0.15),transparent)' }} />
              <div className="absolute bottom-1 left-0 right-0 text-center text-[9px] tracking-widest pointer-events-none z-[1]"
                style={{ color: 'rgba(239,68,68,0.35)' }}>
                DANGER ZONE
              </div>

              {/* Damage floats */}
              <AnimatePresence>
                {dmgFloats.map((d) => (
                  <motion.div key={d.id}
                    className="absolute pointer-events-none z-20 font-extrabold select-none"
                    style={{ left: `${d.x}%`, top: 12, transform: 'translateX(-50%)', color: '#fabd00', textShadow: '0 0 12px rgba(250,189,0,0.7)', fontSize: '1.25rem' }}
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    animate={{ opacity: 0, y: -80, scale: 1.6 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.75, ease: 'easeOut' }}>
                    -{d.value}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Combo label */}
              <AnimatePresence>
                {comboLabel && (
                  <motion.div className="absolute inset-x-0 top-[30%] flex justify-center pointer-events-none z-30"
                    initial={{ scale: 0.4, opacity: 0, y: 16 }} animate={{ scale: 1.1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.7, opacity: 0, y: -24 }} transition={{ duration: 0.28 }}>
                    <span className="px-5 py-1.5 rounded-xl font-extrabold text-2xl"
                      style={{ color: '#fabd00', textShadow: '0 0 20px rgba(250,189,0,0.9)', background: 'rgba(17,19,28,0.72)', border: '1px solid rgba(250,189,0,0.3)' }}>
                      {comboLabel}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Combo badge */}
              {comboRef.current > 1 && (
                <div className="absolute top-2 right-3 text-xs font-bold px-2 py-1 rounded-lg z-10"
                  style={{ background: 'rgba(250,189,0,0.12)', color: '#fabd00', border: '1px solid rgba(250,189,0,0.25)' }}>
                  {comboRef.current} 연속
                </div>
              )}

              {/* Falling words */}
              <AnimatePresence>
                {fallingWords.map((fw) => {
                  const isActive = activeWord?.id === fw.id;
                  const typed = isActive ? inputValue.trim().length : 0;
                  return (
                    <motion.div key={fw.id}
                      className="absolute pointer-events-none select-none z-10"
                      style={{ left: `${fw.x}%`, top: fw.y, transform: 'translateX(-50%)' }}
                      initial={{ opacity: 0, scale: 0.5, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 2.4, filter: 'blur(10px)', transition: { duration: 0.22 } }}
                      transition={{ duration: 0.18 }}>
                      <div className="px-3 py-1.5 rounded-lg whitespace-nowrap font-bold text-sm border"
                        style={{
                          background: isActive ? 'rgba(92,31,222,0.42)' : 'rgba(29,31,41,0.9)',
                          borderColor: isActive ? '#cdbdff' : 'rgba(73,68,86,0.65)',
                          backdropFilter: 'blur(8px)',
                          boxShadow: isActive ? '0 0 18px rgba(205,189,255,0.45)' : '0 2px 10px rgba(0,0,0,0.6)',
                          fontFamily: "'Pretendard', sans-serif",
                        }}>
                        <span style={{ color: '#fabd00' }}>{fw.word.slice(0, typed)}</span>
                        <span style={{ color: isActive ? '#cdbdff' : '#cbc3d9' }}>{fw.word.slice(typed)}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* ── Input bar ── */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-[#494456]/50"
              style={{ background: 'rgba(29,31,41,0.9)', backdropFilter: 'blur(20px)' }}>
              <span className="material-symbols-outlined shrink-0 text-xl select-none"
                style={{ color: '#cdbdff', lineHeight: 1 }}>keyboard</span>

              <input ref={inputRef} type="text" value={inputValue}
                onChange={handleInput} onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-lg font-bold caret-[#fabd00] placeholder-[#494456]"
                style={{ fontFamily: "'Pretendard', sans-serif", color: '#e1e1ef' }}
                placeholder="단어를 입력하세요…"
                autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false}
              />

              <AnimatePresence>
                {inputValue.trim() && (
                  <motion.div className="text-xs px-2 py-1 rounded font-bold shrink-0"
                    style={{
                      background: activeWord ? 'rgba(92,31,222,0.3)' : 'rgba(239,68,68,0.2)',
                      color: activeWord ? '#cdbdff' : '#ffb4ab',
                      border: `1px solid ${activeWord ? 'rgba(205,189,255,0.3)' : 'rgba(255,180,171,0.3)'}`,
                    }}
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.1 }}>
                    {activeWord ? `↑ ${activeWord.word}` : '없음'}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-xs shrink-0 tabular-nums" style={{ color: '#958da2' }}>
                파괴 <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{wordsKilled}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════════ VICTORY ════════ */}
        {phase === 'victory' && (
          <motion.div key="victory" className="flex flex-col items-center gap-8 py-16"
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 100 }}>
            <motion.div className="text-8xl"
              animate={{ rotate: [0, -12, 12, -6, 6, 0], scale: [1, 1.25, 1] }}
              transition={{ duration: 1.2 }}>🏆</motion.div>

            <div className="text-center space-y-2">
              <h2 className="text-5xl font-extrabold"
                style={{ color: '#fabd00', textShadow: '0 0 32px rgba(250,189,0,0.55)' }}>승리!</h2>
              <p className="text-lg" style={{ color: '#cbc3d9' }}>
                <span style={{ color: '#ffb4ab', fontWeight: 700 }}>{bossConfig.name}</span>을(를) 물리쳤습니다!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 px-8 py-5 rounded-2xl border border-[#494456]/60"
              style={{ background: 'rgba(29,31,41,0.75)', backdropFilter: 'blur(16px)' }}>
              <StatBox label="파괴한 단어" value={`${wordsKilled}개`} color="#fabd00" />
              <StatBox label="최대 연속" value={`${maxCombo}회`} color="#cdbdff" />
              <StatBox label="남은 HP" value={`${playerHp}/${PLAYER_MAX_HP}`} color="#4ade80" />
              <StatBox label="소요 시간" value={`${bossConfig.timeLimit - timeLeft}초`} color="#bdc2ff" />
            </div>

            <div className="flex gap-4">
              <motion.button className="px-8 py-3 rounded-xl font-bold text-lg border"
                style={{ background: 'rgba(250,189,0,0.12)', borderColor: '#fabd00', color: '#fabd00', boxShadow: '0 0 20px rgba(250,189,0,0.18)' }}
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                onClick={() => onVictory(buildStats())}>계속하기</motion.button>
              <motion.button className="px-6 py-3 rounded-xl font-medium border"
                style={{ background: 'rgba(29,31,41,0.7)', borderColor: '#494456', color: '#958da2' }}
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                onClick={onExit}>나가기</motion.button>
            </div>
          </motion.div>
        )}

        {/* ════════ DEFEAT ════════ */}
        {phase === 'defeat' && (
          <motion.div key="defeat" className="flex flex-col items-center gap-8 py-16"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <motion.div className="text-8xl grayscale opacity-50"
              animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 2.8 }}>
              {getBossEmoji(bossConfig.name)}
            </motion.div>

            <div className="text-center space-y-2">
              <h2 className="text-5xl font-extrabold" style={{ color: '#ffb4ab' }}>패배...</h2>
              <p className="text-lg" style={{ color: '#cbc3d9' }}>
                {timeLeft <= 0 ? '시간이 초과되었습니다!' : 'HP를 모두 잃었습니다.'}{' '}다시 도전해보세요.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 px-8 py-5 rounded-2xl border border-[#494456]/60"
              style={{ background: 'rgba(29,31,41,0.75)', backdropFilter: 'blur(16px)' }}>
              <StatBox label="파괴한 단어" value={`${wordsKilled}개`} color="#cdbdff" />
              <StatBox label="남은 보스 HP" value={`${bossHp}/${bossConfig.hp}`} color="#ffb4ab" />
              <StatBox label="최대 연속" value={`${maxCombo}회`} color="#fabd00" />
              <StatBox label="경과 시간" value={`${bossConfig.timeLimit - timeLeft}초`} color="#bdc2ff" />
            </div>

            <div className="flex gap-4">
              <motion.button className="px-8 py-3 rounded-xl font-bold text-lg border"
                style={{ background: 'rgba(239,68,68,0.12)', borderColor: '#ffb4ab', color: '#ffb4ab' }}
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                onClick={startFight}>재도전</motion.button>
              <motion.button className="px-6 py-3 rounded-xl font-medium border"
                style={{ background: 'rgba(29,31,41,0.7)', borderColor: '#494456', color: '#958da2' }}
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                onClick={onDefeat}>나가기</motion.button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <p className="text-xs mb-1" style={{ color: '#958da2' }}>{label}</p>
      <p className="text-lg font-bold" style={{ color }}>{value}</p>
    </div>
  );
}
