"use client";

import { useState } from "react";
import { freezePositions, positionsAt } from "@/lib/engine";
import { getPrinciple } from "@/lib/principles";
import { plainText } from "@/lib/text";
import { ENTITY_IDS, type Pos } from "@/lib/types";
import { validateScene } from "@/lib/validate";
import { SCENES } from "@/scenes";
import { Pitch } from "./Pitch";
import { RichText } from "./RichText";
import { usePlayback } from "./usePlayback";

const STEP = 0.1;
const fmt = (p: Pos) => `${p[0].toFixed(1)}, ${p[1].toFixed(1)}`;

/** 開発用。場面データを再生、コマ送りして確かめる。本番には出さない。 */
export function Preview() {
  const [sceneId, setSceneId] = useState(SCENES[0].id);
  const [clipId, setClipId] = useState("intro");
  const [speed, setSpeed] = useState(1);
  const [debug, setDebug] = useState(true);
  const [picked, setPicked] = useState<Pos | null>(null);
  const playback = usePlayback({ speed });

  const scene = SCENES.find((s) => s.id === sceneId) ?? SCENES[0];
  const option = scene.options.find((o) => o.id === clipId) ?? null;
  const clip = option?.clip ?? scene.intro;
  const base = option ? freezePositions(scene) : scene.start;
  const problems = validateScene(scene);

  const t = Math.min(playback.t, clip.duration);
  const positions = positionsAt(base, clip, t);
  const zones = (clip.zones ?? []).filter((z) => t >= z.from);

  const select = (nextScene: string, nextClip: string) => {
    setSceneId(nextScene);
    setClipId(nextClip);
    playback.seek(0);
  };
  const chip = (active: boolean) =>
    `rounded-lg border px-3 py-1.5 text-sm font-bold ${
      active ? "border-blue-700 bg-blue-700 text-white" : "border-slate-300 bg-white"
    }`;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-4 p-3 md:grid-cols-[auto_minmax(0,1fr)]">
      <div className="flex flex-col items-center gap-2">
        <Pitch
          positions={positions}
          you={scene.you}
          focus={scene.focus}
          zones={zones}
          debug={debug}
          onPick={setPicked}
          className="h-[60dvh] w-auto max-w-full rounded-xl md:h-[88dvh]"
        />
      </div>

      <div className="flex flex-col gap-3 text-sm">
        <h1 className="text-lg font-black">場面のプレビュー(開発用)</h1>

        <div className="flex flex-wrap gap-2">
          {SCENES.map((s) => (
            <button key={s.id} type="button" className={chip(s.id === scene.id)} onClick={() => select(s.id, "intro")}>
              {s.id}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={chip(clipId === "intro")} onClick={() => select(scene.id, "intro")}>
            導入
          </button>
          {scene.options.map((o) => (
            <button key={o.id} type="button" className={chip(clipId === o.id)} onClick={() => select(scene.id, o.id)}>
              {o.rating}: {plainText(o.label)}
            </button>
          ))}
        </div>

        <div className="rounded-xl bg-white p-3 shadow">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={chip(true)}
              onClick={() =>
                playback.playing
                  ? playback.pause()
                  : playback.play(clip.duration, t >= clip.duration ? 0 : t)
              }
            >
              {playback.playing ? "止める" : "再生"}
            </button>
            <button type="button" className={chip(false)} onClick={() => playback.seek(Math.max(0, t - STEP))}>
              −{STEP}s
            </button>
            <button type="button" className={chip(false)} onClick={() => playback.seek(Math.min(clip.duration, t + STEP))}>
              +{STEP}s
            </button>
            {[0.5, 1, 2].map((s) => (
              <button key={s} type="button" className={chip(speed === s)} onClick={() => setSpeed(s)}>
                x{s}
              </button>
            ))}
            <label className="flex items-center gap-1 font-bold">
              <input type="checkbox" checked={debug} onChange={(e) => setDebug(e.target.checked)} />
              id と目もり
            </label>
          </div>
          <input
            type="range"
            className="mt-3 w-full"
            min={0}
            max={clip.duration}
            step={0.05}
            value={t}
            onChange={(e) => playback.seek(Number(e.target.value))}
          />
          <p className="font-mono">
            t = {t.toFixed(2)} / {clip.duration.toFixed(2)} s
            {picked && <span className="ml-4">押した所: [{picked[0]}, {picked[1]}]</span>}
          </p>
        </div>

        <div className="rounded-xl bg-white p-3 shadow">
          <p className="font-bold">
            {scene.title} ・ <RichText text={getPrinciple(scene.principle).name} /> ・ 君 = {scene.you}
          </p>
          <p className="mt-1 text-slate-600"><RichText text={scene.situation} /></p>
          {option && (
            <p className="mt-2 border-t pt-2"><RichText text={option.explain} /></p>
          )}
        </div>

        <div className={`rounded-xl p-3 shadow ${problems.length ? "bg-rose-50" : "bg-emerald-50"}`}>
          <p className="font-bold">データの検査: {problems.length ? `${problems.length} 件` : "問題なし"}</p>
          <ul className="list-disc pl-5">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>

        <table className="rounded-xl bg-white font-mono text-xs shadow">
          <tbody className="grid grid-cols-2 gap-x-4 p-3 sm:grid-cols-3">
            {ENTITY_IDS.map((id) => (
              <tr key={id} className="flex justify-between">
                <th className="text-left">{id}</th>
                <td>{fmt(positions[id])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
