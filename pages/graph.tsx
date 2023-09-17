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

function calculateMedianBalance(
    simulation: import("@conman124/retirement").Simulation,
    accountCount: number,
    runCount: number
): number {
    const successfulEndBalances = [];
    for (let i = 0; i < runCount; ++i) {
        if (
            simulation.assets_adequate_periods_for_run(i) >=
            simulation.lifespan_for_run(i).periods()
        ) {
            let balance = 0;
            for (let j = 0; j < accountCount; ++j) {
                balance += simulation
                    .get_account_balance_for_run(i, j)
                    .slice(-1)[0];
            }
            successfulEndBalances.push(balance);
        }
    }
    successfulEndBalances.sort((a, b) => a - b);
    if (successfulEndBalances.length % 2 == 0) {
        return (
            (successfulEndBalances[successfulEndBalances.length / 2 - 1] +
                successfulEndBalances[successfulEndBalances.length / 2]) /
            2
        );
    }
    return successfulEndBalances[
        Math.floor(successfulEndBalances.length / 2) - 1
    ];
}

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
                if (!seedReady) {
                    return;
                }

                if (!readyToRun) {
                    return;
                }

                svgs.forEach((svg, i) => {
                    svg.current.replaceChildren([]);
                    graph(
                        simulation,
                        accountCount,
                        svg.current,
                        ...graphSizes[i],
                        {
                            ANIMATION_RUNWAY_TIME: 4000,
                            ANIMATION_TIME: 3000,
                        }
                    );
                });
            }, [readyToRun, simulationState, seedReady]);

            if (!readyToRun) {
                router.replace("/calculator");
                return;
            }

            const [simulation, accountCount] = getSimulationFromSettings(
                RetirementModule,
                simulationState
            );

            let success = simulation.success_rate();
            let percent = success.num / success.denom;
            if (success.num == success.denom) {
                // never show 100%
                percent = 0.999;
            }
            let formattedPercent = percent.toLocaleString("en-US", {
                style: "percent",
                maximumFractionDigits: 1,
            });

            let endingBalance = calculateMedianBalance(
                simulation,
                accountCount,
                simulationState.count
            );
            let formattedEndingBalance = endingBalance.toLocaleString(
                undefined,
                {
                    currency: "USD",
                    currencyDisplay: "narrowSymbol",
                    style: "currency",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }
            );

            return (
                <div className="flex justify-center">
                    <div className="flex flex-col items-center">
                        {svgs.map((svg, i) => (
                            <svg
                                ref={svg}
                                className={svgClasses[i].join(" ")}
                                key={i}
                            ></svg>
                        ))}
                        <div className="stats shadow mt-12">
                            <div className="stat">
                                <div className="stat-title">
                                    Successful runs
                                </div>
                                <div className="stat-value">
                                    {formattedPercent}
                                </div>
                            </div>
                            <div className="stat">
                                <div className="stat-title">Ending balance</div>
                                <div className="stat-value">
                                    {formattedEndingBalance}
                                </div>
                                <div className="stat-desc">
                                    median of successful runs
                                </div>
                            </div>
                        </div>
                    </div>
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
