import { describe, expect, it } from "vitest";
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

describe("検査そのもの", () => {
  const scene = SCENES[0];

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
