import type { Metadata } from "next";
import { Notebook } from "@/components/Notebook";

export const metadata: Metadata = { title: "原則ノート | サッカーの原則" };

export default function Page() {
  return <Notebook />;
}
