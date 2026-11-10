/**
 * 場面の文章に使う、小さな書き方の決まり。
 * - {you}        … 入力された名前。未入力なら「君」
 * - {漢字|よみ}  … ふりがな付きの言葉
 */

export type TextPart =
  | { type: "text"; value: string }
  | { type: "ruby"; base: string; reading: string };

const TOKEN = /\{([^{}|]+)(?:\|([^{}]+))?\}/g;

export function parseText(source: string, youName: string): TextPart[] {
  const parts: TextPart[] = [];
  const push = (value: string) => {
    if (!value) return;
    const last = parts[parts.length - 1];
    if (last?.type === "text") last.value += value;
    else parts.push({ type: "text", value });
  };

  let cursor = 0;
  for (const m of source.matchAll(TOKEN)) {
    push(source.slice(cursor, m.index));
    const [whole, head, reading] = m;
    if (reading !== undefined) parts.push({ type: "ruby", base: head, reading });
    else if (head === "you") push(youName);
    else push(whole);
    cursor = m.index + whole.length;
  }
  push(source.slice(cursor));
  return parts;
}

/** ふりがなを外した、見た目の文字だけ。文字数の検査に使う。 */
export function plainText(source: string, youName = "君"): string {
  return parseText(source, youName)
    .map((p) => (p.type === "text" ? p.value : p.base))
    .join("");
}

export const DEFAULT_YOU = "君";
