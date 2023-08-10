import { useRef, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { graph, getSimulationFromSettings, testingSimulation } from "../graph";
import { useAppSelector } from "../store/hooks";

const GraphDynamic = dynamic({
    loader: async () => {
        const RetirementModule = await import("@conman124/retirement");

        return function Graph() {
            const svg = useRef(null);

            const simulationState = useAppSelector((state) => state.simulation);
            const simulation = getSimulationFromSettings(
                RetirementModule,
                simulationState
            ); // TODO figure out a way to keep seed the same within a session

            useEffect(() => {
                svg.current.replaceChildren([]);
                graph(simulation, svg.current, 50, 600, 300, false);
            }, []);

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
