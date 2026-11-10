import type { Scene } from "@/lib/types";
import { cover01 } from "./cover-01";
import { regain01 } from "./regain-01";
import { width01 } from "./width-01";

/** 出題する順番。 */
export const SCENES: Scene[] = [width01, cover01, regain01];

export function getScene(id: string): Scene | undefined {
  return SCENES.find((s) => s.id === id);
}

export function nextSceneId(id: string): string | null {
  const i = SCENES.findIndex((s) => s.id === id);
  return i >= 0 && i < SCENES.length - 1 ? SCENES[i + 1].id : null;
}
