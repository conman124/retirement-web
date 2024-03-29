import Link from "next/link";
import { graphSizes } from "../graph/index.js";
import screens from "../screens.js";

export default function Home() {
    function loader(w) {
        const heights = { 360: 300, 640: 360, 768: 432, 1024: 476 };
        const h = heights[w];
        return `/autogen/graph-${w}x${h}.webp`;
    }

    const imgWidths = [1024, 768, 640, 360];
    const imgBreakpoints = ["lg", "md", "sm"];

    return (
        <div className="flex justify-center">
            <div className="flex flex-col items-middle w-[360px] sm:w-[640px] md:w-[768px] lg:w-[1024px]">
                <picture className="mt-4">
                    {imgBreakpoints.map((b, i) => (
                        <source
                            srcSet={loader(imgWidths[i])}
                            media={`(min-width: ${screens[b]})`}
                            key={b}
                        ></source>
                    ))}
                    <img
                        src={loader(imgWidths[imgWidths.length - 1])}
                        alt="Example image of a graph generated by RetireLabs"
                    />
                </picture>
                <h1 className="text-accent text-4xl font-bold mt-6 md:mt-16 text-center">
                    Test run your retirement
                </h1>
                <div className="mx-8 my-6">
                    We all worry about whether we are saving enough for
                    retirement. There&apos;s so much conflicting advice
                    available, and it&apos;s impossible to know how the advice
                    applies to your situation. Every person is unique and has
                    their own lifestyle and goals. With RetireLabs, you can see
                    how changes now can affect your retirement.
                </div>
                <div className="flex justify-center">
                    <Link href="/calculator">
                        <a className="btn btn-secondary">Try it out</a>
                    </Link>
                </div>
                <h2 className="text-accent text-2xl font-bold mt-6 md:mt-8 text-center">
                    How does it work?
                </h2>
                <div className="mx-8 my-4">
                    RetireLabs simulates a number of random runs based on your
                    retirement settings using historical market data. If there
                    is money left over at the end of the simulation, then a run
                    is successful. After crunching all the numbers, RetireLabs
                    will tell you what percent of runs were succesful, graph the
                    balance of your retirement accounts for a few runs, and show
                    a few other statistics.
                </div>
                <div className="mx-8 my-4">
                    It&apos;s important to remember that past performance is not
                    predictive of future performance. RetireLabs is for
                    illustrative purposes only and should not be used for
                    decision making.
                </div>
            </div>
        </div>
    );
}
