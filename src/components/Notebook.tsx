"use client";

import Link from "next/link";
import { PHASES, PRINCIPLES } from "@/lib/principles";
import { principleProgress } from "@/lib/progress";
import { sceneStatus, useAppState, type SceneStatus } from "@/lib/store";
import { SCENES } from "@/scenes";
import { RichText } from "./RichText";

const STATUS: Record<SceneStatus, { text: string; tone: string }> = {
  new: { text: "まだ", tone: "bg-slate-200 text-slate-600" },
  tried: { text: "もう一度", tone: "bg-amber-200 text-amber-900" },
  done: { text: "★ できた", tone: "bg-emerald-200 text-emerald-900" },
};

/** 原則ノート。4 つの局面ごとに原則を並べ、場面を選んで見直せる。 */
export function Notebook() {
  const state = useAppState();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-6">
      <header>
        <Link href="/" className="text-sm font-bold text-slate-600 underline-offset-4 hover:underline">
          ← トップ
        </Link>
        <h1 className="mt-1 text-3xl font-black tracking-tight">原則ノート</h1>
        <p className="mt-1 text-slate-600">
          最初に「いちばんいい」を選べたら ★。全部の原則に ★ をつけよう。
        </p>
      </header>

      {PHASES.map((phase) => (
        <section key={phase.id} className="flex flex-col gap-2">
          <h2 className="text-lg font-black text-emerald-800">
            <RichText text={phase.name} />
          </h2>
          {PRINCIPLES.filter((p) => p.phase === phase.id).map((principle) => {
            const progress = principleProgress(state, SCENES, principle.id);
            return (
              <article key={principle.id} className="rounded-2xl bg-white p-4 shadow">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black">
                      <RichText text={principle.name} />
                    </h3>
                    <p className="text-sm text-slate-600">
                      <RichText text={principle.summary} />
                    </p>
                  </div>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-black ${
                      progress.complete ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                    }`}
                    aria-label={progress.complete ? "できた" : "まだ"}
                  >
                    ★
                  </span>
                </div>
                <ul className="mt-3 flex flex-col gap-2">
                  {progress.scenes.map((scene) => {
                    const status = STATUS[sceneStatus(state, scene.id)];
                    return (
                      <li key={scene.id}>
                        <Link
                          href={`/play/${scene.id}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-300 px-3 py-2.5 font-bold hover:border-blue-600"
                        >
                          <span>{scene.title}</span>
                          <span className={`shrink-0 rounded-full px-3 py-1 text-xs ${status.tone}`}>
                            {status.text}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </section>
      ))}
    </main>
  );
}
