/**
 * 場面データの型。
 *
 * 座標はメートル。ピッチは 8 人制の 50m(横) x 68m(縦)。
 * x: 0(左) → 50(右)、y: 0(自分のゴール) → 68(相手のゴール)。
 * 画面では常に攻める方向(y が大きい側)を上に描く。
 */

export const PITCH = { width: 50, length: 68 } as const;

/** 味方(3-3-1)。 */
export const HOME_IDS = ["GK", "LB", "CB", "RB", "LM", "CM", "RM", "FW"] as const;
/** 相手。並びは場面ごとに自由。 */
export const AWAY_IDS = ["o1", "o2", "o3", "o4", "o5", "o6", "o7", "o8"] as const;

export type HomeId = (typeof HOME_IDS)[number];
export type AwayId = (typeof AWAY_IDS)[number];
export type PlayerId = HomeId | AwayId;
export type EntityId = PlayerId | "ball";

export const PLAYER_IDS: readonly PlayerId[] = [...HOME_IDS, ...AWAY_IDS];
export const ENTITY_IDS: readonly EntityId[] = [...PLAYER_IDS, "ball"];

export type Pos = readonly [x: number, y: number];

/**
 * キーフレーム。
 * - p:  その時刻にいる位置
 * - on: (ボール専用)その時刻にこの選手の足元にある
 * - どちらもなし: 直前の位置のまま(その時刻まで動かない)
 */
export type Keyframe = {
  t: number;
  p?: Pos;
  on?: PlayerId;
};

/** 空いた場所、危ない場所を示す印。 */
export type Zone = {
  kind: "space" | "danger";
  at: Pos;
  rx: number;
  ry: number;
  /** この時刻から表示する。 */
  from: number;
  label?: string;
};

/**
 * 動きのひとまとまり。
 * tracks に書かれていない選手、ボールは動かない。
 * 各トラックには時刻 0 に「開始位置」のキーフレームが暗黙に入る。
 */
export type Clip = {
  duration: number;
  tracks: Partial<Record<EntityId, Keyframe[]>>;
  zones?: Zone[];
};

export type Rating = "best" | "ok" | "bad";

export type SceneOption = {
  id: string;
  /** 行動で書く。15 字以内。 */
  label: string;
  rating: Rating;
  clip: Clip;
  /** 2〜3 文。1 文目で結果、2 文目で理由。 */
  explain: string;
};

export type PhaseId = "attack" | "defense" | "toDefense" | "toAttack";

export type PrincipleId =
  | "goal"
  | "width"
  | "support"
  | "space"
  | "protect"
  | "cover"
  | "delay"
  | "compact"
  | "regain"
  | "recover"
  | "lookForward"
  | "quickPass";

export type Level = 1 | 2 | 3;

export type Scene = {
  id: string;
  principle: PrincipleId;
  level: Level;
  title: string;
  /** 「君」。 */
  you: HomeId;
  /** 濃く描く選手。それ以外は薄く描く。 */
  focus: PlayerId[];
  /** 止まった瞬間の状況を一言で。 */
  situation: string;
  /** 全員とボールの開始位置。 */
  start: Record<EntityId, Pos>;
  /** 導入の動き。終わった位置が「止まった瞬間」。 */
  intro: Clip;
  options: SceneOption[];
};

export type Positions = Record<EntityId, Pos>;
