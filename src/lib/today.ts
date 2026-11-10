import type { Attempt } from "./store";
import type { Scene } from "./types";

export const TODAY_COUNT = 5;

type Bucket = 0 | 1 | 2;

/**
 * 「今日の 5 問」を選ぶ。
 * 1. まだ解いていない場面(やさしい順)
 * 2. まだ「いちばんいい」を選べていない場面(前に解いたのが古い順)
 * 3. できた場面(前に解いたのが古い順)
 */
export function pickToday(
  scenes: Scene[],
  attempts: Record<string, Attempt[]>,
  count = TODAY_COUNT,
): string[] {
  const ranked = scenes.map((scene, index) => {
    const list = attempts[scene.id] ?? [];
    const bucket: Bucket =
      list.length === 0 ? 0 : list.some((a) => a.rating === "best") ? 2 : 1;
    const last = list.length > 0 ? list[list.length - 1].at : "";
    return { id: scene.id, bucket, level: scene.level, last, index };
  });

  ranked.sort((a, b) => {
    if (a.bucket !== b.bucket) return a.bucket - b.bucket;
    if (a.bucket === 0 && a.level !== b.level) return a.level - b.level;
    if (a.bucket !== 0 && a.last !== b.last) return a.last < b.last ? -1 : 1;
    return a.index - b.index;
  });

  return ranked.slice(0, count).map((r) => r.id);
}
