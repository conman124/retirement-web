import { useRef, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import {
    graph,
    getSimulationFromSettings,
    graphSizes,
} from "../graph/index.js";
import { useAppSelector } from "../store/hooks.js";
import { useRouter } from "next/router";
import { isSimulationReady } from "../store/simulator.js";

const GraphDynamic = dynamic({
    loader: async () => {
        const RetirementModule = await import("@conman124/retirement");

        return function Graph() {
            const svgs = [
                useRef(null),
                useRef(null),
                useRef(null),
                useRef(null),
            ];
            const svgClasses = [
                ["sm:hidden"],
                ["hidden", "sm:block", "md:hidden"],
                ["hidden", "md:block", "lg:hidden"],
                ["hidden", "lg:block"],
            ];
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

                svgs.forEach((svg, i) => {
                    svg.current.replaceChildren([]);
                    graph(simulation, svg.current, ...graphSizes[i], {
                        ANIMATION_RUNWAY_TIME: 4000,
                        ANIMATION_TIME: 3000,
                    });
                });
            }, [readyToRun, simulationState]);

            return (
                <div className="flex justify-center">
                    {svgs.map((svg, i) => (
                        <svg
                            ref={svg}
                            className={svgClasses[i].join(" ")}
                            key={i}
                        ></svg>
                    ))}
                </div>
            );
        };
    },
    ssr: false,
});

export default function GraphPage() {
    return (
        <Suspense fallback="Loading...">
            <GraphDynamic />
        </Suspense>
    );
}
