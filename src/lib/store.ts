"use client";

import { useSyncExternalStore } from "react";
import type { Rating } from "./types";

/**
 * 名前、背番号、進み具合。この端末の中(localStorage)だけに保存する。
 * サーバーには送らない。
 */

export type Profile = { name: string; number: number | null };

export type Attempt = { rating: Rating; at: string };

export type AppState = {
  /** 入力画面を一度出したか(「あとで」も含む)。 */
  profileAsked: boolean;
  profile: Profile | null;
  /** 場面ごとの、最初に選んだ答えの記録。 */
  attempts: Record<string, Attempt[]>;
};

const KEY = "soccer-principles:v1";
const EMPTY: AppState = { profileAsked: false, profile: null, attempts: {} };

export const NAME_MAX = 8;
export const NUMBER_MIN = 1;
export const NUMBER_MAX = 99;

export function normalizeProfile(name: string, number: string): Profile | null {
  const trimmed = name.trim().slice(0, NAME_MAX);
  const n = Number.parseInt(number, 10);
  const valid = Number.isInteger(n) && n >= NUMBER_MIN && n <= NUMBER_MAX;
  if (!trimmed && !valid) return null;
  return { name: trimmed, number: valid ? n : null };
}

function parse(raw: string | null): AppState {
  if (!raw) return EMPTY;
  try {
    const data = JSON.parse(raw) as Partial<AppState>;
    return {
      profileAsked: Boolean(data.profileAsked),
      profile: data.profile ?? null,
      attempts: data.attempts ?? {},
    };
  } catch {
    return EMPTY;
  }
}

let cachedRaw: string | null | undefined;
let cachedState: AppState = EMPTY;
const listeners = new Set<() => void>();

function read(): AppState {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    // 保存が使えない端末でも、そのまま使えるようにする。
    return cachedState;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedState = parse(raw);
  }
  return cachedState;
}

function write(next: AppState) {
  const raw = JSON.stringify(next);
  cachedRaw = raw;
  cachedState = next;
  try {
    window.localStorage.setItem(KEY, raw);
  } catch {
    // 保存できなくても、開いている間は動く。
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** 保存された状態。サーバーでの描画中と読みこみ前は null。 */
export function useAppState(): AppState | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function saveProfile(profile: Profile | null) {
  write({ ...read(), profileAsked: true, profile });
}

export function recordAttempt(sceneId: string, rating: Rating) {
  const state = read();
  const list = state.attempts[sceneId] ?? [];
  write({
    ...state,
    attempts: {
      ...state.attempts,
      [sceneId]: [...list, { rating, at: new Date().toISOString() }],
    },
  });
}

export type SceneStatus = "new" | "tried" | "done";

/** 一度でも「いちばんいい」を最初に選べたら達成。 */
export function sceneStatus(state: AppState | null, sceneId: string): SceneStatus {
  const list = state?.attempts[sceneId];
  if (!list || list.length === 0) return "new";
  return list.some((a) => a.rating === "best") ? "done" : "tried";
}
