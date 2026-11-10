import type { PhaseId, PrincipleId } from "./types";

export type Phase = { id: PhaseId; name: string };

export type Principle = {
  id: PrincipleId;
  phase: PhaseId;
  /** 解説で必ずこの言葉を使う。 */
  name: string;
  summary: string;
};

export const PHASES: Phase[] = [
  { id: "attack", name: "{攻|こう}げき" },
  { id: "defense", name: "守り" },
  { id: "toDefense", name: "取られた時" },
  { id: "toAttack", name: "取った時" },
];

export const PRINCIPLES: Principle[] = [
  {
    id: "goal",
    phase: "attack",
    name: "ゴールを目指す",
    summary: "前が空いていたら、まず前へ。",
  },
  {
    id: "width",
    phase: "attack",
    name: "{幅|はば}と深さを作る",
    summary: "広がって、相手の守る場所を広くする。",
  },
  {
    id: "support",
    phase: "attack",
    name: "サポートする",
    summary: "ボールを持つ味方が、パスを出せる位置に動く。",
  },
  {
    id: "space",
    phase: "attack",
    name: "空いている所を使う",
    summary: "相手のいない所へ、ボールと人を運ぶ。",
  },
  {
    id: "protect",
    phase: "defense",
    name: "ゴールを守る位置に立つ",
    summary: "ボールと自分のゴールの間に立つ。",
  },
  {
    id: "cover",
    phase: "defense",
    name: "行く人とカバー",
    summary: "1人がボールに行ったら、もう1人はその後ろを守る。",
  },
  {
    id: "delay",
    phase: "defense",
    name: "よせておくらせる",
    summary: "すぐに飛びこまず、相手を前に進ませない。",
  },
  {
    id: "compact",
    phase: "defense",
    name: "みんなでちぢまる",
    summary: "ボールのある側に集まって、間を通させない。",
  },
  {
    id: "regain",
    phase: "toDefense",
    name: "すぐ取り返す",
    summary: "取られたしゅん間に、近くの人がよせる。",
  },
  {
    id: "recover",
    phase: "toDefense",
    name: "急いでもどる",
    summary: "よせられない時は、ゴールの方へ急いでもどる。",
  },
  {
    id: "lookForward",
    phase: "toAttack",
    name: "まず前を見る",
    summary: "取ったら、最初に前の味方と空いた場所を見る。",
  },
  {
    id: "quickPass",
    phase: "toAttack",
    name: "空いた味方に早くつなぐ",
    summary: "相手がもどる前に、フリーの味方へ。",
  },
];

export function getPrinciple(id: PrincipleId): Principle {
  const found = PRINCIPLES.find((p) => p.id === id);
  if (!found) throw new Error(`unknown principle: ${id}`);
  return found;
}

export function getPhase(id: PhaseId): Phase {
  const found = PHASES.find((p) => p.id === id);
  if (!found) throw new Error(`unknown phase: ${id}`);
  return found;
}
