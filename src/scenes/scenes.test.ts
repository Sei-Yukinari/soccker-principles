import { describe, expect, it } from "vitest";
import { freezePositions } from "@/lib/engine";
import { PRINCIPLES } from "@/lib/principles";
import { validateScene } from "@/lib/validate";
import { SCENES } from ".";

describe("場面データ", () => {
  it("id が重なっていない", () => {
    expect(new Set(SCENES.map((s) => s.id)).size).toBe(SCENES.length);
  });

  it.each(SCENES.map((s) => [s.id, s] as const))("%s に誤りがない", (_id, scene) => {
    expect(validateScene(scene)).toEqual([]);
  });
});

describe("場面のそろい方", () => {
  it("どの原則にも場面が 1 つ以上ある", () => {
    for (const principle of PRINCIPLES) {
      expect(SCENES.some((s) => s.principle === principle.id), principle.id).toBe(true);
    }
  });

  it("ボールを持っていない場面が 6 割以上", () => {
    const offBall = SCENES.filter((scene) => {
      const freeze = freezePositions(scene);
      const you = freeze[scene.you];
      return Math.hypot(freeze.ball[0] - you[0], freeze.ball[1] - you[1]) > 2;
    });
    expect(offBall.length / SCENES.length).toBeGreaterThanOrEqual(0.6);
  });
});

describe("検査そのもの", () => {
  const scene = SCENES.find((s) => s.id === "width-01")!;

  it("「いちばんいい」が 2 つあると見つける", () => {
    const broken = {
      ...scene,
      options: scene.options.map((o) => ({ ...o, rating: "best" as const })),
    };
    expect(validateScene(broken).join()).toContain("いちばんいい");
  });

  it("ピッチの外の位置を見つける", () => {
    const broken = { ...scene, start: { ...scene.start, GK: [60, 5] as const } };
    expect(validateScene(broken).join()).toContain("ピッチの外");
  });

  it("長すぎる選択肢を見つける", () => {
    const broken = {
      ...scene,
      options: scene.options.map((o, i) =>
        i === 0 ? { ...o, label: "あ".repeat(16) } : o,
      ),
    };
    expect(validateScene(broken).join()).toContain("字をこえている");
  });
});
