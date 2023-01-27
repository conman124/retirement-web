import { useRef, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { graph } from "../graph";

const GraphDynamic = dynamic({
  loader: async () => {
    const RetirementModule = await import("@conman124/retirement");

    return function Graph() {
      const svg = useRef(null);

      useEffect(() => {
        graph(RetirementModule, svg.current, 50);
      });

      return <svg ref={svg} />;
    };
  },
  ssr: false,
});

export default function Graph() {
  return (
    <Suspense fallback="Loading...">
      <GraphDynamic />
    </Suspense>
  );
}
