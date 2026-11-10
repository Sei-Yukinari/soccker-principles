# サッカーの原則

8 人制サッカー(3-3-1)の場面を動きで見せ、「君ならどうする？」を 3 つから選んで原則を学ぶアプリ。小学 6 年生が 1 人で使う想定。

- 場面が再生されて止まる → 選ぶ → 選んだ動きの結果が再生される → 評価(いちばんいい / 悪くない / よくない)と解説
- 名前と背番号を入れると、「君」の駒に背番号が出て、名前で問いかける
- ログインなし。名前、背番号、進み具合はその端末の中(localStorage)だけに保存する
- 検索には載せない(noindex)

## 開発

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # 再生の計算と、全場面データの検査
pnpm lint
pnpm typecheck
pnpm build
```

## 場面を足す

1. `src/scenes/` に 1 場面 1 ファイルで書く(`width-01.ts` が見本)
2. `src/scenes/index.ts` の `SCENES` に足す
3. `pnpm dev` で `/dev/preview` を開き、再生、コマ送りで確かめる。図を押すとその場所の座標が出る
4. `pnpm test` でデータの誤り(人数、ピッチの外、駒の重なり、文の長さなど)を検査する

座標はメートル。x は 0(左)〜50(右)、y は 0(自分のゴール)〜68(相手のゴール)。図は常に攻める方向が上。

文章の決まり:

- 選択肢は行動で書き、15 字以内
- 解説は 2〜3 文。1 文目に `{you}`(名前に置きかわる)を入れ、「いちばんいい」の解説には原則の名前を「」で入れる
- 小学 6 年生までに習わない漢字は `{幅|はば}` の形でふりがなを付けるか、ひらがなにする

## 構成

| 場所 | 中身 |
|---|---|
| `src/lib/types.ts` | 場面データの型 |
| `src/lib/engine.ts` | 時刻から全員とボールの位置を求める計算 |
| `src/lib/validate.ts` | 場面データの検査 |
| `src/lib/principles.ts` | 4 局面と 12 原則 |
| `src/lib/store.ts` | 名前、背番号、進み具合の保存 |
| `src/components/Pitch.tsx` | ピッチ図(SVG) |
| `src/components/Quiz.tsx` | 1 問の流れ |
| `src/components/Preview.tsx` | 開発用プレビュー |

## デプロイ

Vercel の GitHub 連携。PR ごとに確認用 URL ができ、main に入ると本番に反映される。
`/dev/preview` は確認用 URL と手元でだけ開け、本番(`VERCEL_ENV=production`)では 404 になる。
