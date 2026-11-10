/** 本番(息子さんが使う URL)かどうか。確認用 URL と手元では false。 */
export const isProduction = process.env.VERCEL_ENV === "production";
