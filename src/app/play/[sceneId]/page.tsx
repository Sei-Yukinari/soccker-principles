import { notFound } from "next/navigation";
import { Quiz } from "@/components/Quiz";
import { SCENES, getScene } from "@/scenes";

export const dynamicParams = false;

export function generateStaticParams() {
  return SCENES.map((scene) => ({ sceneId: scene.id }));
}

export default async function Page({ params }: PageProps<"/play/[sceneId]">) {
  const { sceneId } = await params;
  const scene = getScene(sceneId);
  if (!scene) notFound();

  return <Quiz key={scene.id} scene={scene} />;
}
