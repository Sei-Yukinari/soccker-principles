import { notFound } from "next/navigation";
import { Preview } from "@/components/Preview";
import { isProduction } from "@/lib/env";

/** 開発用。本番では出さない。 */
export default function Page() {
  if (isProduction) notFound();
  return <Preview />;
}
