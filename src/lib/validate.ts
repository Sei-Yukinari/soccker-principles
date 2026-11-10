import { freezePositions, positionsAt } from "./engine";
import { PRINCIPLES } from "./principles";
import { plainText } from "./text";
import {
  ENTITY_IDS,
  HOME_IDS,
  PITCH,
  PLAYER_IDS,
  type Clip,
  type Pos,
  type Positions,
  type Scene,
} from "./types";

export const LABEL_MAX = 15;
/** 選手どうしがこれより近いと、駒が半分以上重なる(m)。競り合いの近さは許す。 */
const MIN_GAP = 1.6;
/** ゴールに入ったボールは、ゴールラインを少しこえてよい(m)。 */
const GOAL_DEPTH = 1.2;

const inPitch = (p: Pos) =>
  p[0] >= 0 && p[0] <= PITCH.width && p[1] >= 0 && p[1] <= PITCH.length;
const ballInPlay = (p: Pos) =>
  p[0] >= 0 &&
  p[0] <= PITCH.width &&
  p[1] >= -GOAL_DEPTH &&
  p[1] <= PITCH.length + GOAL_DEPTH;

function checkClip(name: string, clip: Clip, base: Positions): string[] {
  const out: string[] = [];
  if (!(clip.duration > 0)) out.push(`${name}: duration が 0 以下`);

  for (const [id, frames] of Object.entries(clip.tracks)) {
    if (!ENTITY_IDS.includes(id as never)) {
      out.push(`${name}: 知らない id ${id}`);
      continue;
    }
    let prev = 0;
    for (const k of frames ?? []) {
      if (k.t < prev) out.push(`${name}/${id}: 時刻が戻っている (t=${k.t})`);
      if (k.t > clip.duration) out.push(`${name}/${id}: t=${k.t} が長さをこえている`);
      if (k.p && !(id === "ball" ? ballInPlay(k.p) : inPitch(k.p))) out.push(`${name}/${id}: ピッチの外 (${k.p})`);
      if (k.on && id !== "ball") out.push(`${name}/${id}: on はボール専用`);
      if (k.on && k.p) out.push(`${name}/${id}: on と p を同時に書いている`);
      prev = k.t;
    }
  }

  const ball = clip.tracks.ball;
  if (ball && ball.length > 0 && ball[0].t !== 0) {
    out.push(`${name}/ball: 最初のキーフレームは t=0 にする`);
  }

  for (const z of clip.zones ?? []) {
    if (!inPitch(z.at)) out.push(`${name}: 印がピッチの外`);
    if (z.from < 0 || z.from > clip.duration) out.push(`${name}: 印の時刻が範囲外`);
  }

  const reported = new Set<string>();
  for (let t = 0; t <= clip.duration + 1e-9; t += 0.1) {
    const pos = positionsAt(base, clip, t);
    for (let i = 0; i < PLAYER_IDS.length; i++) {
      for (let j = i + 1; j < PLAYER_IDS.length; j++) {
        const a = pos[PLAYER_IDS[i]];
        const b = pos[PLAYER_IDS[j]];
        const key = `${PLAYER_IDS[i]}-${PLAYER_IDS[j]}`;
        if (Math.hypot(a[0] - b[0], a[1] - b[1]) < MIN_GAP && !reported.has(key)) {
          reported.add(key);
          out.push(`${name}: ${key} が重なっている (t=${t.toFixed(1)})`);
        }
      }
    }
    if (!ballInPlay(pos.ball)) {
      if (!reported.has("ball")) out.push(`${name}: ボールがピッチの外 (t=${t.toFixed(1)})`);
      reported.add("ball");
    }
  }
  return out;
}

/** 場面データの誤りを文で返す。空なら問題なし。 */
export function validateScene(scene: Scene): string[] {
  const out: string[] = [];
  const principle = PRINCIPLES.find((p) => p.id === scene.principle);
  if (!principle) out.push(`原則 ${scene.principle} がない`);

  for (const id of ENTITY_IDS) {
    const p = scene.start[id];
    if (!p) out.push(`start に ${id} がない`);
    else if (!inPitch(p)) out.push(`start の ${id} がピッチの外`);
  }
  if (out.length > 0) return out;

  if (!HOME_IDS.includes(scene.you)) out.push("you が味方ではない");
  if (!scene.focus.includes(scene.you)) out.push("focus に you が入っていない");

  if (scene.options.length !== 3) out.push("選択肢が 3 つではない");
  if (scene.options.filter((o) => o.rating === "best").length !== 1) {
    out.push("「いちばんいい」が 1 つではない");
  }
  if (new Set(scene.options.map((o) => o.id)).size !== scene.options.length) {
    out.push("選択肢の id が重なっている");
  }

  out.push(...checkClip("intro", scene.intro, scene.start));
  const freeze = freezePositions(scene);

  for (const o of scene.options) {
    const label = plainText(o.label);
    if (label.length > LABEL_MAX) {
      out.push(`${o.id}: 選択肢が ${LABEL_MAX} 字をこえている (${label.length} 字)`);
    }
    const explain = plainText(o.explain);
    const sentences = explain.split("。").filter((s) => s.trim().length > 0);
    if (sentences.length < 2 || sentences.length > 3) {
      out.push(`${o.id}: 解説は 2〜3 文にする (${sentences.length} 文)`);
    }
    if (!o.explain.split("。")[0].includes("{you}")) {
      out.push(`${o.id}: 解説の 1 文目に {you} がない`);
    }
    if (o.rating === "best" && principle) {
      const name = plainText(principle.name);
      if (!explain.includes(`「${name}」`)) {
        out.push(`${o.id}: いちばんいい解説に原則の名前「${name}」がない`);
      }
    }
    out.push(...checkClip(o.id, o.clip, freeze));
  }
  return out;
}
