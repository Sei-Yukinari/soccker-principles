import { describe, expect, it } from "vitest";
import { parseText, plainText } from "./text";

describe("parseText", () => {
  it("{you} を名前に置きかえる", () => {
    expect(parseText("{you}ならどうする？", "ゆうと")).toEqual([
      { type: "text", value: "ゆうとならどうする？" },
    ]);
  });

  it("{漢字|よみ} をふりがなにする", () => {
    expect(parseText("これが「{幅|はば}」だ", "君")).toEqual([
      { type: "text", value: "これが「" },
      { type: "ruby", base: "幅", reading: "はば" },
      { type: "text", value: "」だ" },
    ]);
  });

  it("plainText はふりがなを数えない", () => {
    expect(plainText("{幅|はば}と深さ")).toBe("幅と深さ");
  });
});
