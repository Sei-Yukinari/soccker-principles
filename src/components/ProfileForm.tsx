"use client";

import { useState } from "react";
import {
  NAME_MAX,
  NUMBER_MAX,
  NUMBER_MIN,
  normalizeProfile,
  saveProfile,
  type Profile,
} from "@/lib/store";

/** 名前と背番号の入力。どちらも入れなくても使える。 */
export function ProfileForm({
  initial,
  onDone,
  firstTime,
}: {
  initial: Profile | null;
  onDone: () => void;
  firstTime: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [number, setNumber] = useState(initial?.number?.toString() ?? "");

  const input =
    "mt-1 w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-lg font-bold focus:border-blue-600 focus:outline-none";

  return (
    <form
      className="rounded-2xl bg-white p-4 shadow"
      onSubmit={(e) => {
        e.preventDefault();
        saveProfile(normalizeProfile(name, number));
        onDone();
      }}
    >
      <p className="text-lg font-black">
        {firstTime ? "名前と背番号を教えて" : "名前と背番号を変える"}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        図の中の「君」に背番号が出るよ。このスマホやパソコンの中だけに保存されて、ほかの人には見えない。
      </p>

      <div className="mt-3 grid grid-cols-[1fr_6rem] gap-3">
        <label className="text-sm font-bold text-slate-600">
          名前({NAME_MAX}文字まで)
          <input
            className={input}
            value={name}
            maxLength={NAME_MAX}
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="text-sm font-bold text-slate-600">
          背番号
          <input
            className={input}
            value={number}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            placeholder={`${NUMBER_MIN}〜${NUMBER_MAX}`}
            autoComplete="off"
            onChange={(e) => setNumber(e.target.value.replace(/[^0-9]/g, ""))}
          />
        </label>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-xl bg-blue-700 px-4 py-3 font-bold text-white active:scale-[0.98]"
        >
          これでOK
        </button>
        <button
          type="button"
          onClick={() => {
            if (firstTime) saveProfile(null);
            onDone();
          }}
          className="rounded-xl border-2 border-slate-300 px-4 py-3 font-bold text-slate-600"
        >
          {firstTime ? "あとで" : "やめる"}
        </button>
      </div>
    </form>
  );
}
