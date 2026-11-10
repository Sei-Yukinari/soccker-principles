import {
  PLAYER_IDS,
  type Clip,
  type EntityId,
  type Keyframe,
  type PlayerId,
  type Pos,
  type Positions,
  type Scene,
} from "./types";

/** ボールを足元に置く時の、選手の中心からのずれ(m)。駒の背番号にかぶらない位置。 */
export const BALL_OFFSET: Pos = [1.5, 1.5];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (u: number) => u * u * (3 - 2 * u);
const lerp = (a: Pos, b: Pos, u: number): Pos => [
  a[0] + (b[0] - a[0]) * u,
  a[1] + (b[1] - a[1]) * u,
];

/** 選手の、時刻 t の位置。区間ごとにゆっくり動き出してゆっくり止まる。 */
export function playerPosAt(
  base: Pos,
  frames: Keyframe[] | undefined,
  t: number,
): Pos {
  if (!frames || frames.length === 0) return base;
  let prevT = 0;
  let prevP = base;
  for (const k of frames) {
    const p = k.p ?? prevP;
    if (t <= k.t) {
      const span = k.t - prevT;
      const u = span <= 0 ? 1 : clamp01((t - prevT) / span);
      return lerp(prevP, p, easeInOut(u));
    }
    prevT = k.t;
    prevP = p;
  }
  return prevP;
}

const atFeet = (p: Pos): Pos => [p[0] + BALL_OFFSET[0], p[1] + BALL_OFFSET[1]];

/** ボールの、時刻 t の位置。パスは等速、足元にある間は選手についていく。 */
function ballPosAt(
  base: Pos,
  frames: Keyframe[] | undefined,
  t: number,
  playerAt: (id: PlayerId, t: number) => Pos,
): Pos {
  if (!frames || frames.length === 0) return base;
  const resolve = (k: Keyframe, fallback: Pos): Pos =>
    k.on ? atFeet(playerAt(k.on, k.t)) : (k.p ?? fallback);

  let prevT = 0;
  let prevP = base;
  let prevOn: PlayerId | undefined;
  for (const k of frames) {
    const p = resolve(k, prevP);
    if (t <= k.t) {
      if (k.on && k.on === prevOn) return atFeet(playerAt(k.on, t));
      const span = k.t - prevT;
      const u = span <= 0 ? 1 : clamp01((t - prevT) / span);
      return lerp(prevP, p, u);
    }
    prevT = k.t;
    prevP = p;
    prevOn = k.on;
  }
  return prevOn ? atFeet(playerAt(prevOn, t)) : prevP;
}

/** base の位置から clip を時刻 t まで進めた時の、全員とボールの位置。 */
export function positionsAt(base: Positions, clip: Clip, t: number): Positions {
  const time = Math.min(Math.max(t, 0), clip.duration);
  const playerAt = (id: PlayerId, at: number) =>
    playerPosAt(base[id], clip.tracks[id], at);

  const out = {} as Record<EntityId, Pos>;
  for (const id of PLAYER_IDS) out[id] = playerAt(id, time);
  out.ball = ballPosAt(base.ball, clip.tracks.ball, time, playerAt);
  return out;
}

/** 導入が終わって止まった瞬間の位置。選択肢の動きはここから始まる。 */
export function freezePositions(scene: Scene): Positions {
  return positionsAt(scene.start, scene.intro, scene.intro.duration);
}
