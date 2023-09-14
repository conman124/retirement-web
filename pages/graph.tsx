import { useRef, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import {
    graph,
    getSimulationFromSettings,
    graphSizes,
} from "../graph/index.js";
import { useAppDispatch, useAppSelector } from "../store/hooks.js";
import { useRouter } from "next/router";
import { isSimulationReady, setSeed } from "../store/simulator.js";

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
            const dispatch = useAppDispatch();

            const seedReady = !(typeof simulationState.seed === "undefined");
            if (!seedReady) {
                dispatch(setSeed(Math.floor(Math.random() * 100000)));
            }

            useEffect(() => {
                if (!readyToRun) {
                    router.replace("/calculator");
                    return;
                }

                if (!seedReady) {
                    return;
                }

                const simulation = getSimulationFromSettings(
                    RetirementModule,
                    simulationState
                );

                svgs.forEach((svg, i) => {
                    svg.current.replaceChildren([]);
                    graph(simulation, svg.current, ...graphSizes[i], {
                        ANIMATION_RUNWAY_TIME: 4000,
                        ANIMATION_TIME: 3000,
                    });
                });
            }, [readyToRun, simulationState, seedReady]);

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
