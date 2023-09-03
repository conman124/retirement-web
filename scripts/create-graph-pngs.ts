import { createGraph, testingSimulation, graphSizes } from "../graph/index.js";
import { createSVGWindow } from "svgdom";
import { memoize } from "underscore";
import { createCanvas, Image } from "canvas";
import * as Retirement from "@conman124/retirement";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import { cwd } from "process";
import cliProgress, { SingleBar } from "cli-progress";

const ANIMATION_RUNWAY_TIME = 4000;
const ANIMATION_TIME = 3000;
const ANIMATION_TOTAL_TIME = ANIMATION_RUNWAY_TIME + ANIMATION_TIME;
const FPS = 60;

const window = createSVGWindow();
const document = window.document;
const simulation = testingSimulation(Retirement);
const textDimCanvasFactory = memoize(() => createCanvas(100, 100));

function createName(w: number, h: number, i: number) {
    const digits = Math.ceil(Math.log10((ANIMATION_TOTAL_TIME * FPS) / 1000));
    return path.join(
        cwd(),
        "graph-pngs-out",
        `${w}x${h}`,
        i.toString().padStart(digits, "0") + ".png"
    );
}

mkdirSync(path.join(cwd(), "graph-pngs-out"));

const progress = new SingleBar({}, cliProgress.Presets.shades_classic);
progress.start((graphSizes.length * ANIMATION_TOTAL_TIME * FPS) / 1000, 0);
let currentProgress = 0;

function createImageFromBlob(base64: string): Promise<Image> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve(img);
        };
        img.onerror = (e) => {
            reject(e);
        };
        img.src = `data:image/svg+xml;base64,${base64}`;
    });
}

await (async () => {
    for (let i = 0; i < graphSizes.length; ++i) {
        const svg = document.createElement("svg") as unknown as SVGElement;
        const w = graphSizes[i][1];
        const h = graphSizes[i][2];
        const canvas = createCanvas(w, h);

        mkdirSync(path.join(cwd(), "graph-pngs-out", `${w}x${h}`));

        let { update } = createGraph(
            simulation,
            svg,
            ...graphSizes[i],
            { ANIMATION_RUNWAY_TIME, ANIMATION_TIME },
            window,
            textDimCanvasFactory
        );

        for (let i = 0; i < (ANIMATION_TOTAL_TIME * FPS) / 1000; ++i) {
            update(i / ((ANIMATION_TOTAL_TIME * FPS) / 1000));

            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const img = await createImageFromBlob(btoa(svg.outerHTML));
            ctx.drawImage(img, 0, 0);

            const buffer = canvas.toBuffer("image/png");
            writeFileSync(createName(w, h, i), buffer);

            ++currentProgress;
            progress.update(currentProgress);
        }
    }
    progress.stop();
})();
