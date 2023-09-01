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
            const svgs = [
                useRef(null),
                useRef(null),
                useRef(null),
                useRef(null),
            ];
            const graphParams: [number, number, number, boolean][] = [
                [30, 360, 300, true],
                [50, 640, 360, true],
                [50, 768, 432, false],
                [70, 1024, 476, false],
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
                    graph(simulation, svg.current, ...graphParams[i], {
                        ANIMATION_RUNWAY_TIME: 2000,
                        ANIMATION_TIME: 0,
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
