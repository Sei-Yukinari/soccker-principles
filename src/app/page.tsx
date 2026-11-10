import { Home } from "@/components/Home";
import { isProduction } from "@/lib/env";

export default function Page() {
  return <Home showDevLink={!isProduction} />;
}
