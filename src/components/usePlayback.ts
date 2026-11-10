"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Run = { from: number; duration: number };

/**
 * 時刻を 1 つ持ち、再生、停止、好きな時刻への移動ができる。
 * 位置は時刻から計算するので、ここは時刻だけを進める。
 */
export function usePlayback(options: {
  /** 開いた時にすぐ再生する長さ。 */
  autoPlay?: number;
  speed?: number;
  onEnd?: () => void;
}) {
  const { autoPlay, speed = 1, onEnd } = options;
  const [t, setT] = useState(0);
  const [run, setRun] = useState<Run | null>(
    autoPlay ? { from: 0, duration: autoPlay } : null,
  );

  const onEndRef = useRef(onEnd);
  useEffect(() => {
    onEndRef.current = onEnd;
  });

  useEffect(() => {
    if (!run) return;
    let raf = 0;
    let last = performance.now();
    let current = run.from;
    const tick = (now: number) => {
      // 画面を離れていた間の時間は進めない。
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      current = Math.min(run.duration, current + dt * speed);
      setT(current);
      if (current >= run.duration) {
        setRun(null);
        onEndRef.current?.();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, speed]);

  const play = useCallback((duration: number, from = 0) => {
    setT(from);
    setRun({ from, duration });
  }, []);

  const pause = useCallback(() => setRun(null), []);

  const seek = useCallback((time: number) => {
    setRun(null);
    setT(time);
  }, []);

  return { t, playing: run !== null, play, pause, seek };
}
