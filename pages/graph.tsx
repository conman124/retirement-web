import { useRef, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { graph, getSimulationFromSettings } from "../graph";
import { useAppSelector } from "../store/hooks";
import { useRouter } from "next/router";
import { isSimulationReady } from "../store/simulator";

const GraphDynamic = dynamic({
    loader: async () => {
        const RetirementModule = await import("@conman124/retirement");

        return function Graph() {
            const svg = useRef(null);
            const router = useRouter();

            const simulationState = useAppSelector((state) => state.simulation);
            const readyToRun = useAppSelector(isSimulationReady);

            useEffect(() => {
                if (!readyToRun) {
                    router.replace("/calculator");
                    return;
                }

                const simulation = getSimulationFromSettings(
                    RetirementModule,
                    simulationState
                ); // TODO figure out a way to keep seed the same within a session

                svg.current.replaceChildren([]);
                graph(simulation, svg.current, 50, 600, 300, false);
            }, [readyToRun, simulationState]);

            return (
                <div className="flex justify-center">
                    <svg ref={svg} />
                </div>
            );
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
