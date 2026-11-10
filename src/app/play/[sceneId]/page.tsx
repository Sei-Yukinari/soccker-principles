import { notFound } from "next/navigation";
import { Quiz } from "@/components/Quiz";
import { SCENES, getScene, nextSceneId } from "@/scenes";

export const dynamicParams = false;

export function generateStaticParams() {
  return SCENES.map((scene) => ({ sceneId: scene.id }));
}

export default async function Page({ params }: PageProps<"/play/[sceneId]">) {
  const { sceneId } = await params;
  const scene = getScene(sceneId);
  if (!scene) notFound();

  const next = nextSceneId(scene.id);
  const index = SCENES.findIndex((s) => s.id === scene.id);

  return (
    <Quiz
      key={scene.id}
      scene={scene}
      nextHref={next ? `/play/${next}` : null}
      position={`${index + 1} / ${SCENES.length}`}
    />
  );
}
