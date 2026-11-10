import { DEFAULT_YOU, parseText } from "@/lib/text";

/** {you} と {漢字|よみ} を表示用に置きかえる。 */
export function RichText({ text, you = DEFAULT_YOU }: { text: string; you?: string }) {
  return (
    <>
      {parseText(text, you).map((part, i) =>
        part.type === "ruby" ? (
          <ruby key={i}>
            {part.base}
            <rt>{part.reading}</rt>
          </ruby>
        ) : (
          <span key={i}>{part.value}</span>
        ),
      )}
    </>
  );
}
