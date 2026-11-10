"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { freezePositions, positionsAt } from "@/lib/engine";
import { getPhase, getPrinciple } from "@/lib/principles";
import { recordAttempt, useAppState } from "@/lib/store";
import { DEFAULT_YOU } from "@/lib/text";
import type { Rating, Scene } from "@/lib/types";
import { Pitch } from "./Pitch";
import { RichText } from "./RichText";
import { usePlayback } from "./usePlayback";

type Step = "intro" | "decide" | "result" | "explain";

const RATING: Record<Rating, { title: string; badge: string; tone: string }> = {
  best: {
    title: "ナイス！ いちばんいい動きだ",
    badge: "いちばんいい",
    tone: "border-emerald-400 bg-emerald-50 text-emerald-900",
  },
  ok: {
    title: "悪くない。でも、もっといい動きがある",
    badge: "悪くない",
    tone: "border-amber-400 bg-amber-50 text-amber-900",
  },
  bad: {
    title: "おしい！ こうなりやすい",
    badge: "よくない",
    tone: "border-rose-400 bg-rose-50 text-rose-900",
  },
};

const button =
  "w-full rounded-xl border-2 px-4 py-2.5 text-left text-base font-bold transition active:scale-[0.98]";

export function Quiz({ scene }: { scene: Scene }) {
  const state = useAppState();

  // 「今日の 5 問」の中の場面なら、その順番で次へ進む。原則ノートから開いた時はノートへ戻る。
  const session = state?.session ?? [];
  const index = session.indexOf(scene.id);
  const inSession = index >= 0;
  const nextId = inSession ? (session[index + 1] ?? null) : null;
  const back = inSession ? { href: "/", text: "← トップ" } : { href: "/principles", text: "← 原則ノート" };
  const next = nextId
    ? { href: `/play/${nextId}`, text: "次の場面へ →" }
    : inSession
      ? { href: "/", text: "おわり！ トップへ" }
      : { href: "/principles", text: "原則ノートにもどる" };
  const position = inSession ? `今日の${session.length}問 ${index + 1} / ${session.length}` : "";

  const you = state?.profile?.name || DEFAULT_YOU;
  const youNumber = state?.profile?.number ?? null;

  const [step, setStep] = useState<Step>("intro");
  /** 今、図に出している選択肢。 */
  const [shownId, setShownId] = useState<string | null>(null);
  /** 最初に選んだ答え。記録に残るのはこれだけ。 */
  const [firstId, setFirstId] = useState<string | null>(null);
  const [seen, setSeen] = useState<string[]>([]);

  const playback = usePlayback({
    autoPlay: scene.intro.duration,
    onEnd: () => setStep((s) => (s === "intro" ? "decide" : "explain")),
  });

  const freeze = useMemo(() => freezePositions(scene), [scene]);
  const shown = scene.options.find((o) => o.id === shownId) ?? null;
  const first = scene.options.find((o) => o.id === firstId) ?? null;
  const best = scene.options.find((o) => o.rating === "best")!;
  const principle = getPrinciple(scene.principle);
  const phase = getPhase(principle.phase);

  const showingOption = (step === "result" || step === "explain") && shown;
  const positions = showingOption
    ? positionsAt(freeze, shown.clip, playback.t)
    : positionsAt(scene.start, scene.intro, step === "decide" ? scene.intro.duration : playback.t);
  const zones = showingOption
    ? (shown.clip.zones ?? []).filter((z) => playback.t >= z.from)
    : [];

  /** 図が画面の外にある時は、図まで戻してから再生する。 */
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const replayIntro = () => {
    toTop();
    setStep("intro");
    playback.play(scene.intro.duration);
  };

  const showOption = (id: string) => {
    const option = scene.options.find((o) => o.id === id);
    if (!option) return;
    if (!firstId) {
      setFirstId(id);
      recordAttempt(scene.id, option.rating);
    }
    setShownId(id);
    setSeen((list) => (list.includes(id) ? list : [...list, id]));
    setStep("result");
    toTop();
    playback.play(option.clip.duration);
  };

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-2 px-3 pb-6 pt-2 md:grid-cols-[auto_minmax(0,26rem)] md:items-start md:gap-6 md:pt-4">
      <div className="flex justify-center">
        <Pitch
          positions={positions}
          you={scene.you}
          focus={scene.focus}
          youNumber={youNumber}
          pulseYou={step === "decide"}
          zones={zones}
          className="h-[46dvh] w-auto max-w-full rounded-xl shadow-lg md:h-[86dvh]"
        />
      </div>

      <section className="flex flex-col gap-2 md:gap-3" aria-live="polite">
        <header className="flex items-center justify-between text-sm text-slate-500">
          <Link href={back.href} className="font-bold text-slate-600 underline-offset-4 hover:underline">
            {back.text}
          </Link>
          <span>{position}</span>
        </header>

        {step === "intro" && (
          <div className="rounded-xl bg-white p-4 shadow">
            <p className="text-lg font-bold">{scene.title}</p>
            <p className="mt-1 text-slate-600">動きをよく見よう…</p>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold text-slate-700">
              <li className="flex items-center gap-1.5">
                <span className="inline-block h-3.5 w-3.5 rounded-full border border-slate-900 bg-yellow-300" />
                {you}
              </li>
              <li className="flex items-center gap-1.5">
                <span className="inline-block h-3.5 w-3.5 rounded-full bg-blue-700" />
                味方
              </li>
              <li className="flex items-center gap-1.5">
                <span className="inline-block h-3.5 w-3.5 rounded-sm bg-red-600" />
                相手
              </li>
              <li>▲ 上にせめる</li>
            </ul>
          </div>
        )}

        {step === "decide" && (
          <>
            <div className="rounded-xl bg-white p-3 shadow md:p-4">
              <p className="text-sm leading-snug text-slate-700">
                <RichText text={scene.situation} you={you} />
              </p>
              <p className="mt-1.5 text-xl font-black">
                <span className="rounded bg-yellow-300 px-1.5">{you}</span>
                ならどうする？
              </p>
            </div>
            {scene.options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => showOption(o.id)}
                className={`${button} border-slate-300 bg-white hover:border-blue-600`}
              >
                <RichText text={o.label} you={you} />
              </button>
            ))}
            <button
              type="button"
              onClick={replayIntro}
              className="self-start rounded-lg px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50"
            >
              ↻ もう一度見る
            </button>
          </>
        )}

        {step === "result" && shown && (
          <div className="rounded-xl bg-white p-4 shadow">
            <p className="text-sm text-slate-500">えらんだ動き</p>
            <p className="text-lg font-bold">
              <RichText text={shown.label} you={you} />
            </p>
            <p className="mt-1 text-slate-600">どうなるかな…</p>
          </div>
        )}

        {step === "explain" && shown && first && (
          <>
            <div className={`rounded-xl border-2 p-4 ${RATING[shown.rating].tone}`}>
              <p className="text-sm font-bold">
                {shown.id === first.id ? RATING[shown.rating].title : RATING[shown.rating].badge}
              </p>
              <p className="mt-1 text-lg font-black">
                <RichText text={shown.label} you={you} />
              </p>
              <p className="mt-2 leading-relaxed">
                <RichText text={shown.explain} you={you} />
              </p>
              <p className="mt-3 inline-block rounded-full bg-white/70 px-3 py-1 text-xs font-bold">
                <RichText text={phase.name} />
                {" ・ "}
                <RichText text={principle.name} />
              </p>
            </div>

            <button
              type="button"
              onClick={() => showOption(shown.id)}
              className="self-start rounded-lg px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50"
            >
              ↻ もう一度見る
            </button>

            {first.rating !== "best" && shown.id !== best.id && (
              <button
                type="button"
                onClick={() => showOption(best.id)}
                className={`${button} border-emerald-500 bg-emerald-500 text-center text-white`}
              >
                いちばんいい動きを見る
              </button>
            )}

            <div className="rounded-xl bg-white p-3 shadow">
              <p className="mb-2 text-sm font-bold text-slate-500">ほかの動きも見てみる</p>
              <div className="flex flex-col gap-2">
                {scene.options
                  .filter((o) => o.id !== shown.id)
                  .map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => showOption(o.id)}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-300 px-3 py-2 text-left text-sm font-bold hover:border-blue-600"
                    >
                      <span>
                        <RichText text={o.label} you={you} />
                      </span>
                      {seen.includes(o.id) && (
                        <span className="shrink-0 text-xs text-slate-500">
                          {RATING[o.rating].badge}
                        </span>
                      )}
                    </button>
                  ))}
              </div>
            </div>

            <Link
              href={next.href}
              className={`${button} border-blue-700 bg-blue-700 text-center text-white`}
            >
              {next.text}
            </Link>
          </>
        )}
      </section>
    </div>
  );
}
