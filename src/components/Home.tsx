"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PRINCIPLES } from "@/lib/principles";
import { principleProgress } from "@/lib/progress";
import { startSession, useAppState } from "@/lib/store";
import { TODAY_COUNT, pickToday } from "@/lib/today";
import { SCENES } from "@/scenes";
import { ProfileForm } from "./ProfileForm";

export function Home({ showDevLink }: { showDevLink: boolean }) {
  const state = useAppState();
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  const profile = state?.profile ?? null;
  const askFirst = state !== null && !state.profileAsked;
  const progress = PRINCIPLES.map((p) => principleProgress(state, SCENES, p.id));
  const complete = progress.filter((p) => p.complete).length;
  const count = Math.min(TODAY_COUNT, SCENES.length);

  const startToday = () => {
    const ids = pickToday(SCENES, state?.attempts ?? {}, count);
    startSession(ids);
    router.push(`/play/${ids[0]}`);
  };

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

      <button
        type="button"
        onClick={startToday}
        disabled={state === null}
        className="rounded-2xl bg-blue-700 px-6 py-5 text-center text-xl font-black text-white shadow-lg active:scale-[0.98] disabled:opacity-60"
      >
        今日の{count}問
        <span className="mt-1 block text-sm font-bold text-blue-100">
          まだの場面と、もう一度やりたい場面が出るよ
        </span>
      </button>

      <Link
        href="/principles"
        className="rounded-2xl bg-white px-4 py-4 shadow hover:ring-2 hover:ring-blue-600"
      >
        <span className="flex items-center justify-between">
          <span className="text-lg font-black">原則ノート</span>
          <span className="text-sm font-bold text-slate-600">
            できた原則 {complete} / {PRINCIPLES.length}
          </span>
        </span>
        <span className="mt-3 grid grid-cols-12 gap-1" aria-hidden>
          {progress.map((p, i) => (
            <span
              key={PRINCIPLES[i].id}
              className={`flex aspect-square items-center justify-center rounded-md text-xs font-black ${
                p.complete
                  ? "bg-emerald-500 text-white"
                  : p.tried > 0
                    ? "bg-amber-200 text-amber-900"
                    : "bg-slate-200 text-slate-400"
              }`}
            >
              {p.complete ? "★" : ""}
            </span>
          ))}
        </span>
        <span className="mt-2 block text-sm text-slate-600">
          原則ごとに場面を選んで、見直せるよ →
        </span>
      </Link>

      {showDevLink && (
        <Link href="/dev/preview" className="text-center text-xs text-slate-400 underline">
          場面のプレビュー(開発用)
        </Link>
      )}
    </main>
  );
}
