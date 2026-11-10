"use client";

import Link from "next/link";
import { useState } from "react";
import { getPhase, getPrinciple } from "@/lib/principles";
import { sceneStatus, useAppState, type SceneStatus } from "@/lib/store";
import { SCENES } from "@/scenes";
import { ProfileForm } from "./ProfileForm";
import { RichText } from "./RichText";

const STATUS: Record<SceneStatus, { text: string; tone: string }> = {
  new: { text: "まだ", tone: "bg-slate-200 text-slate-600" },
  tried: { text: "もう一度", tone: "bg-amber-200 text-amber-900" },
  done: { text: "★ できた", tone: "bg-emerald-200 text-emerald-900" },
};

export function Home({ showDevLink }: { showDevLink: boolean }) {
  const state = useAppState();
  const [editing, setEditing] = useState(false);

  const profile = state?.profile ?? null;
  const askFirst = state !== null && !state.profileAsked;
  const start = SCENES.find((s) => sceneStatus(state, s.id) !== "done") ?? SCENES[0];
  const doneCount = SCENES.filter((s) => sceneStatus(state, s.id) === "done").length;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
      <header>
        <p className="text-sm font-bold text-emerald-700">8人制サッカー</p>
        <h1 className="text-3xl font-black tracking-tight">サッカーの原則</h1>
        <p className="mt-1 text-slate-600">この場面、どう動く？ 動きを見て考えよう。</p>
      </header>

      {askFirst || editing ? (
        <ProfileForm
          initial={profile}
          firstTime={askFirst}
          onDone={() => setEditing(false)}
        />
      ) : (
        state !== null && (
          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow">
            <p className="flex items-center gap-3 font-bold">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-900 bg-yellow-300 text-lg font-black">
                {profile?.number ?? "★"}
              </span>
              {profile?.name || "名前はまだ"}
            </p>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-lg px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50"
            >
              変える
            </button>
          </div>
        )
      )}

      <Link
        href={`/play/${start.id}`}
        className="rounded-2xl bg-blue-700 px-6 py-5 text-center text-xl font-black text-white shadow-lg active:scale-[0.98]"
      >
        {doneCount === 0 ? "はじめる" : doneCount === SCENES.length ? "もう一度やる" : "つづきから"}
        <span className="mt-1 block text-sm font-bold text-blue-100">
          {SCENES.length}つの場面 ・ できた {doneCount} / {SCENES.length}
        </span>
      </Link>

      <ul className="flex flex-col gap-2">
        {SCENES.map((scene, i) => {
          const principle = getPrinciple(scene.principle);
          const status = STATUS[sceneStatus(state, scene.id)];
          return (
            <li key={scene.id}>
              <Link
                href={`/play/${scene.id}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow hover:ring-2 hover:ring-blue-600"
              >
                <span>
                  <span className="block text-xs font-bold text-slate-500">
                    {i + 1}. <RichText text={getPhase(principle.phase).name} />
                  </span>
                  <span className="font-bold">{scene.title}</span>
                </span>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${status.tone}`}>
                  {status.text}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {showDevLink && (
        <Link href="/dev/preview" className="text-center text-xs text-slate-400 underline">
          場面のプレビュー(開発用)
        </Link>
      )}
    </main>
  );
}
