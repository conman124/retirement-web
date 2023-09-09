import Link from "next/link";
import { graphSizes } from "../graph/index.js";
import screens from "../screens.js";

export default function Home() {
    function loader(w) {
        const heights = {360: 300, 640: 360, 768: 432, 1024: 476};
        const h = heights[w]
        return `/autogen/graph-${w}x${h}.webp`;
    }

    const imgWidths = [1024, 768, 640, 360];
    const imgBreakpoints = ['lg', 'md', 'sm'];

    const srcset = imgWidths.map(w => `${loader(w)} ${w}w`).join(', ');
    const sizes = imgBreakpoints.map(s => `(min-width: ${screens[s]}) ${screens[s]}`).join(", ") + `, ${imgWidths[imgWidths.length-1]}px`;
    const defaultImg = loader(imgWidths[0]);

    return (
        <div className="flex justify-center">
            <div className="flex flex-col items-middle w-[360px] sm:w-[640px] md:w-[768px] lg:w-[1024px]">
                <img
                    className="mt-4 grow-0"
                    src={defaultImg}
                    srcSet={srcset}
                    sizes={sizes}
                />
                <h1 className="text-accent text-4xl font-bold mt-6 md:mt-16 text-center">Test run your retirement</h1>
                <div className="mx-8 my-6">
                    We all worry about whether we are saving enough for retirement. There's so much conflicting
                    advice available, and it's impossible to see how the advice applies to your situation. Every
                    person is unique and has their own lifestyle and goals. With RetireLabs, you can see how
                    changes now will affect your retirement.
                </div>
                <div className="flex justify-center">
                    <Link href="/calculator">
                        <a className="btn btn-secondary">Try it out</a>
                    </Link>
                </div>
            </div>
        </div>
    );
}
