import { sceneStatus, type AppState } from "./store";
import type { PrincipleId, Scene } from "./types";

/** 原則ごとの進み具合。その原則の場面がすべて「できた」なら達成。 */
export function principleProgress(
  state: AppState | null,
  scenes: Scene[],
  principle: PrincipleId,
) {
  const own = scenes.filter((s) => s.principle === principle);
  const done = own.filter((s) => sceneStatus(state, s.id) === "done").length;
  const tried = own.filter((s) => sceneStatus(state, s.id) !== "new").length;
  return {
    scenes: own,
    done,
    /** 一度でも解いた場面の数。 */
    tried,
    total: own.length,
    complete: own.length > 0 && done === own.length,
  };
}
