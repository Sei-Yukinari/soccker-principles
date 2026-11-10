import { describe, expect, it } from "vitest";
import { pickToday } from "./today";
import type { Scene } from "./types";

const scene = (id: string, level: 1 | 2 | 3) => ({ id, level }) as Scene;
const scenes = [scene("a", 2), scene("b", 1), scene("c", 1), scene("d", 1)];
const at = (day: number) => `2026-11-${String(day).padStart(2, "0")}T00:00:00.000Z`;

describe("pickToday", () => {
  it("まだ解いていない場面を、やさしい順に出す", () => {
    expect(pickToday(scenes, {}, 3)).toEqual(["b", "c", "d"]);
  });

  it("解いていない → まちがえた → できた の順に出す", () => {
    const attempts = {
      a: [{ rating: "best" as const, at: at(1) }],
      b: [{ rating: "bad" as const, at: at(2) }],
    };
    expect(pickToday(scenes, attempts, 4)).toEqual(["c", "d", "b", "a"]);
  });

  it("まちがえた場面は、前に解いたのが古い順", () => {
    const attempts = {
      a: [{ rating: "ok" as const, at: at(5) }],
      b: [{ rating: "bad" as const, at: at(3) }],
      c: [{ rating: "bad" as const, at: at(4) }],
      d: [{ rating: "bad" as const, at: at(1) }],
    };
    expect(pickToday(scenes, attempts, 4)).toEqual(["d", "b", "c", "a"]);
  });

  it("一度できた場面は、後でまちがえても「できた」のまま", () => {
    const attempts = {
      a: [
        { rating: "best" as const, at: at(1) },
        { rating: "bad" as const, at: at(2) },
      ],
    };
    expect(pickToday(scenes, attempts, 4).at(-1)).toBe("a");
  });
});
