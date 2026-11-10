import { describe, expect, it } from "vitest";
import { playerPosAt, positionsAt } from "./engine";
import { ENTITY_IDS, type Clip, type Pos, type Positions } from "./types";

const base = Object.fromEntries(
  ENTITY_IDS.map((id, i) => [id, [i * 2, i * 3] as Pos]),
) as Positions;

describe("playerPosAt", () => {
  it("トラックがなければ動かない", () => {
    expect(playerPosAt([3, 4], undefined, 2)).toEqual([3, 4]);
  });

  it("開始位置から最初のキーフレームへ動き、中間はちょうど半分", () => {
    const frames = [{ t: 2, p: [10, 20] as Pos }];
    expect(playerPosAt([0, 0], frames, 0)).toEqual([0, 0]);
    expect(playerPosAt([0, 0], frames, 1)).toEqual([5, 10]);
    expect(playerPosAt([0, 0], frames, 2)).toEqual([10, 20]);
    expect(playerPosAt([0, 0], frames, 9)).toEqual([10, 20]);
  });

  it("位置のないキーフレームまでは動かない", () => {
    const frames = [{ t: 1 }, { t: 2, p: [10, 0] as Pos }];
    expect(playerPosAt([0, 0], frames, 0.9)).toEqual([0, 0]);
    expect(playerPosAt([0, 0], frames, 1.5)).toEqual([5, 0]);
  });

  it("動き出しはゆっくり", () => {
    const frames = [{ t: 1, p: [10, 0] as Pos }];
    expect(playerPosAt([0, 0], frames, 0.25)[0]).toBeLessThan(2.5);
  });
});

describe("positionsAt", () => {
  const clip: Clip = {
    duration: 4,
    tracks: {
      CM: [{ t: 2, p: [20, 20] }],
      ball: [
        { t: 0, on: "CM" },
        { t: 2, on: "CM" },
        { t: 3, on: "FW" },
      ],
    },
  };

  it("足元にある間、ボールは選手についていく", () => {
    for (const t of [0, 0.7, 1.3, 2]) {
      const pos = positionsAt(base, clip, t);
      expect(pos.ball[0] - pos.CM[0]).toBeCloseTo(0.9);
      expect(pos.ball[1] - pos.CM[1]).toBeCloseTo(0.9);
    }
  });

  it("パスは等速でまっすぐ進み、受け手の足元に着く", () => {
    const from = positionsAt(base, clip, 2).ball;
    const mid = positionsAt(base, clip, 2.5).ball;
    const to = positionsAt(base, clip, 3).ball;
    expect(mid[0]).toBeCloseTo((from[0] + to[0]) / 2);
    expect(mid[1]).toBeCloseTo((from[1] + to[1]) / 2);
    expect(to[0]).toBeCloseTo(base.FW[0] + 0.9);
  });

  it("最後のキーフレームの後も、持っている選手についていく", () => {
    const pos = positionsAt(base, clip, 4);
    expect(pos.ball[0]).toBeCloseTo(pos.FW[0] + 0.9);
  });

  it("時刻は 0 から長さの間に丸める", () => {
    expect(positionsAt(base, clip, -1)).toEqual(positionsAt(base, clip, 0));
    expect(positionsAt(base, clip, 99)).toEqual(positionsAt(base, clip, 4));
  });

  it("書かれていない選手は動かない", () => {
    expect(positionsAt(base, clip, 3).GK).toEqual(base.GK);
  });
});
