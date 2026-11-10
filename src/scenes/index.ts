import type { Scene } from "@/lib/types";
import { compact01 } from "./compact-01";
import { cover01 } from "./cover-01";
import { delay01 } from "./delay-01";
import { goal01 } from "./goal-01";
import { lookForward01 } from "./look-forward-01";
import { protect01 } from "./protect-01";
import { quickPass01 } from "./quick-pass-01";
import { recover01 } from "./recover-01";
import { regain01 } from "./regain-01";
import { space01 } from "./space-01";
import { support01 } from "./support-01";
import { width01 } from "./width-01";

/** 原則ノートの並び(4 局面の順)。 */
export const SCENES: Scene[] = [
  goal01,
  width01,
  support01,
  space01,
  protect01,
  cover01,
  delay01,
  compact01,
  regain01,
  recover01,
  lookForward01,
  quickPass01,
];

export function getScene(id: string): Scene | undefined {
  return SCENES.find((s) => s.id === id);
}
