import {
  AWAY_IDS,
  HOME_IDS,
  PITCH,
  type HomeId,
  type PlayerId,
  type Pos,
  type Positions,
  type Zone,
} from "@/lib/types";

const W = PITCH.width;
const L = PITCH.length;
const MARGIN_X = 2.5;
const MARGIN_Y = 3.5;
const PIECE = 1.6;
const PIECE_YOU = 1.9;

/** 8 人制の目安の寸法(m)。 */
const PENALTY = { depth: 12, width: 29 };
const GOAL_AREA = { depth: 4, width: 13 };
const GOAL = { width: 5, depth: 1.6 };
const CENTER_R = 7;
const PENALTY_MARK = 8;

/** データの座標(攻める方向が y の正)を、画面の座標(上が攻める方向)に直す。 */
const sx = (x: number) => x;
const sy = (y: number) => L - y;

export type PitchProps = {
  positions: Positions;
  you: HomeId;
  focus: readonly PlayerId[];
  /** 「君」の駒に出す背番号。なければ星印。 */
  youNumber?: number | null;
  /** 「君」の輪を点めつさせる(選ぶ時)。 */
  pulseYou?: boolean;
  zones?: Zone[];
  /** 開発用: 全員の id と目もりを出す。 */
  debug?: boolean;
  /** 開発用: 押した場所の座標を受け取る。 */
  onPick?: (pos: Pos) => void;
  className?: string;
};

function Markings() {
  const line = { fill: "none", stroke: "#ffffff", strokeOpacity: 0.85, strokeWidth: 0.28 };
  const box = (depth: number, width: number, top: boolean) => (
    <rect
      x={(W - width) / 2}
      y={top ? 0 : L - depth}
      width={width}
      height={depth}
      {...line}
    />
  );
  return (
    <g>
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x={0}
          y={(L / 8) * i}
          width={W}
          height={L / 8}
          fill={i % 2 === 0 ? "#2f8552" : "#2a7a4a"}
        />
      ))}
      <rect x={0} y={0} width={W} height={L} {...line} />
      <line x1={0} y1={L / 2} x2={W} y2={L / 2} {...line} />
      <circle cx={W / 2} cy={L / 2} r={CENTER_R} {...line} />
      <circle cx={W / 2} cy={L / 2} r={0.4} fill="#ffffff" fillOpacity={0.85} />
      {box(PENALTY.depth, PENALTY.width, true)}
      {box(PENALTY.depth, PENALTY.width, false)}
      {box(GOAL_AREA.depth, GOAL_AREA.width, true)}
      {box(GOAL_AREA.depth, GOAL_AREA.width, false)}
      <circle cx={W / 2} cy={PENALTY_MARK} r={0.35} fill="#ffffff" fillOpacity={0.85} />
      <circle cx={W / 2} cy={L - PENALTY_MARK} r={0.35} fill="#ffffff" fillOpacity={0.85} />
      <rect x={(W - GOAL.width) / 2} y={-GOAL.depth} width={GOAL.width} height={GOAL.depth} {...line} strokeWidth={0.4} />
      <rect x={(W - GOAL.width) / 2} y={L} width={GOAL.width} height={GOAL.depth} {...line} strokeWidth={0.4} />
    </g>
  );
}

function Grid() {
  const xs = Array.from({ length: W / 5 + 1 }, (_, i) => i * 5);
  const ys = Array.from({ length: Math.floor(L / 5) + 1 }, (_, i) => i * 5);
  const text = { fontSize: 1.5, fill: "#ffffff", fillOpacity: 0.8 };
  return (
    <g pointerEvents="none">
      {xs.map((x) => (
        <g key={`x${x}`}>
          <line x1={sx(x)} y1={0} x2={sx(x)} y2={L} stroke="#fff" strokeOpacity={0.2} strokeWidth={0.1} />
          <text x={sx(x)} y={L + 3} textAnchor="middle" {...text}>{x}</text>
        </g>
      ))}
      {ys.map((y) => (
        <g key={`y${y}`}>
          <line x1={0} y1={sy(y)} x2={W} y2={sy(y)} stroke="#fff" strokeOpacity={0.2} strokeWidth={0.1} />
          <text x={-0.4} y={sy(y) + 0.5} textAnchor="end" {...text}>{y}</text>
        </g>
      ))}
    </g>
  );
}

function ZoneMark({ zone }: { zone: Zone }) {
  const color = zone.kind === "space" ? "#fde047" : "#f87171";
  return (
    <g pointerEvents="none">
      <ellipse
        cx={sx(zone.at[0])}
        cy={sy(zone.at[1])}
        rx={zone.rx}
        ry={zone.ry}
        fill={color}
        fillOpacity={0.22}
        stroke={color}
        strokeWidth={0.3}
        strokeDasharray="1.2 0.8"
      />
      {zone.label && (
        <text
          x={sx(zone.at[0])}
          y={sy(zone.at[1]) - zone.ry - 0.8}
          textAnchor="middle"
          fontSize={2.1}
          fontWeight={700}
          fill="#ffffff"
          stroke="#0f172a"
          strokeWidth={0.5}
          paintOrder="stroke"
        >
          {zone.label}
        </text>
      )}
    </g>
  );
}

export function Pitch({
  positions,
  you,
  focus,
  youNumber,
  pulseYou = false,
  zones = [],
  debug = false,
  onPick,
  className,
}: PitchProps) {
  const dim = (id: PlayerId) => (debug || focus.includes(id) ? 1 : 0.5);
  const label = { textAnchor: "middle" as const, dominantBaseline: "central" as const, fontWeight: 700 };
  const youPos = positions[you];

  return (
    <svg
      viewBox={`${-MARGIN_X} ${-MARGIN_Y} ${W + MARGIN_X * 2} ${L + MARGIN_Y * 2}`}
      className={className}
      role="img"
      aria-label="ピッチの図。上が相手のゴール。"
      onClick={
        onPick
          ? (e) => {
              const svg = e.currentTarget;
              const m = svg.getScreenCTM();
              if (!m) return;
              const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
              onPick([Math.round(pt.x * 2) / 2, Math.round((L - pt.y) * 2) / 2]);
            }
          : undefined
      }
    >
      <rect x={-MARGIN_X} y={-MARGIN_Y} width={W + MARGIN_X * 2} height={L + MARGIN_Y * 2} fill="#1f5c3a" />
      <Markings />
      {debug && <Grid />}
      {zones.map((z, i) => (
        <ZoneMark key={i} zone={z} />
      ))}

      {AWAY_IDS.map((id) => {
        const [x, y] = positions[id];
        return (
          <g key={id} opacity={dim(id)} transform={`translate(${sx(x)} ${sy(y)})`}>
            <rect
              x={-PIECE * 0.9}
              y={-PIECE * 0.9}
              width={PIECE * 1.8}
              height={PIECE * 1.8}
              rx={0.5}
              fill="#dc2626"
              stroke="#ffffff"
              strokeWidth={0.3}
            />
            {debug && <text {...label} fontSize={1.5} fill="#fff">{id}</text>}
          </g>
        );
      })}

      {HOME_IDS.filter((id) => id !== you).map((id) => {
        const [x, y] = positions[id];
        return (
          <g key={id} opacity={dim(id)} transform={`translate(${sx(x)} ${sy(y)})`}>
            <circle r={PIECE} fill="#1d4ed8" stroke="#ffffff" strokeWidth={0.3} />
            {debug && <text {...label} fontSize={1.4} fill="#fff">{id}</text>}
          </g>
        );
      })}

      <g transform={`translate(${sx(youPos[0])} ${sy(youPos[1])})`}>
        <circle
          r={PIECE_YOU + 0.9}
          fill="none"
          stroke="#fde047"
          strokeWidth={0.5}
          className={pulseYou ? "you-pulse" : undefined}
        />
        <circle r={PIECE_YOU} fill="#fde047" stroke="#0f172a" strokeWidth={0.3} />
        <text {...label} fontSize={youNumber && youNumber > 9 ? 2 : 2.3} fill="#0f172a">
          {debug ? you : (youNumber ?? "★")}
        </text>
      </g>

      <circle
        cx={sx(positions.ball[0])}
        cy={sy(positions.ball[1])}
        r={0.85}
        fill="#ffffff"
        stroke="#0f172a"
        strokeWidth={0.3}
      />
    </svg>
  );
}
