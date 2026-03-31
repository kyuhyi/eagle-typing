'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const BGM_TRACKS = [
  '/BSD1.mp3',
  '/BSD2.mp3',
  '/BSD3.mp3',
  '/BSD4.mp3',
  '/BSD5.mp3',
  '/BSD6.mp3',
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useBgm() {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [trackIndex, setTrackIndex] = useState(0);
  const [trackName, setTrackName] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playlistRef = useRef<string[]>(shuffle(BGM_TRACKS));
  const userInteractedRef = useRef(false);

  // Create audio element once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audio = new Audio();
    audio.volume = 0.3;
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Load and play track
  const playTrack = useCallback((index: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const playlist = playlistRef.current;
    const src = playlist[index % playlist.length];
    audio.src = src;
    setTrackName(`BGM ${src.match(/BSD(\d)/)?.[1] ?? ''}`);
    audio.play().catch(() => {});
  }, []);

  // When track ends, play next
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      const nextIdx = trackIndex + 1;
      if (nextIdx >= playlistRef.current.length) {
        // Reshuffle
        playlistRef.current = shuffle(BGM_TRACKS);
        setTrackIndex(0);
        if (playing) playTrack(0);
      } else {
        setTrackIndex(nextIdx);
        if (playing) playTrack(nextIdx);
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [trackIndex, playing, playTrack]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      if (!userInteractedRef.current) {
        // First play — shuffle and start
        playlistRef.current = shuffle(BGM_TRACKS);
        setTrackIndex(0);
        playTrack(0);
        userInteractedRef.current = true;
      } else {
        audio.play().catch(() => {});
      }
      setPlaying(true);
    }
  }, [playing, playTrack]);

  const skip = useCallback(() => {
    const nextIdx = trackIndex + 1;
    if (nextIdx >= playlistRef.current.length) {
      playlistRef.current = shuffle(BGM_TRACKS);
      setTrackIndex(0);
      if (playing) playTrack(0);
    } else {
      setTrackIndex(nextIdx);
      if (playing) playTrack(nextIdx);
    }
  }, [trackIndex, playing, playTrack]);

  const changeVolume = useCallback((v: number) => {
    setVolume(Math.max(0, Math.min(1, v)));
  }, []);

  return { playing, volume, trackName, toggle, skip, changeVolume };
}
