import {
    createGraph,
    testingSimulation,
    graphSizes,
} from "../../graph/index.js";
import { createSVGWindow } from "svgdom";
import { memoize } from "underscore";
import { createCanvas, Image } from "canvas";
import * as Retirement from "@conman124/retirement";
import { mkdirSync } from "fs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { cwd } from "process";
import cliProgress, { MultiBar } from "cli-progress";
import { promisify } from "util";
import { exec as execCallback } from "child_process";
const exec = promisify(execCallback);

const ANIMATION_RUNWAY_TIME = 4000;
const ANIMATION_TIME = 3000;
const ANIMATION_TOTAL_TIME = ANIMATION_RUNWAY_TIME + ANIMATION_TIME;
const FPS = 30;

const window = createSVGWindow();
const document = window.document;
const simulation = testingSimulation(Retirement);
const textDimCanvasFactory = memoize(() => createCanvas(100, 100));

function createName(w: number, h: number, i: number, root = cwd()) {
    const digits = Math.ceil(Math.log10((ANIMATION_TOTAL_TIME * FPS) / 1000));
    return path.join(
        root,
        "graph-webp-out",
        `${w}x${h}`,
        i.toString().padStart(digits, "0") + ".png"
    );
}

mkdirSync(path.join(cwd(), "graph-webp-out"));

const progressBars = new MultiBar(
    {},
    {
        ...cliProgress.Presets.shades_classic,
        format: "{bar} {percentage}% | {task} ETA: {eta}s | {value}/{total}",
    }
);
const pngProgress = progressBars.create(
    (graphSizes.length * ANIMATION_TOTAL_TIME * FPS) / 1000,
    0,
    { task: "create static png files" }
);
const webpProgress = progressBars.create(graphSizes.length + 1, 0, {
    task: "create animated webp files",
});

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

let dockerPromise: Promise<any> = exec(
    "docker build scripts/create-graph-webp --tag libwebp-tools"
).then(() => webpProgress.increment());

await (async () => {
    for (let i = 0; i < graphSizes.length; ++i) {
        const svg = document.createElement("svg") as unknown as SVGElement;
        const w = graphSizes[i][1];
        const h = graphSizes[i][2];
        const canvas = createCanvas(w, h);

        await mkdir(path.join(cwd(), "graph-webp-out", `${w}x${h}`));

        let { update } = createGraph(
            simulation,
            svg,
            ...graphSizes[i],
            { ANIMATION_RUNWAY_TIME, ANIMATION_TIME },
            window,
            textDimCanvasFactory
        );

        let filenames = [];

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
            await writeFile(createName(w, h, i), buffer);
            filenames.push(createName(w, h, i, "/mnt"));

            pngProgress.increment();
            progressBars.update();
        }

        let commandStr =
            "-o " +
            path.join("/mnt/graph-webp-out", `${w}x${h}`, `${w}x${h}.webp`) +
            " -loop 1 -mixed -d " +
            1000 / FPS;
        commandStr += filenames.join(" ");

        await writeFile(
            path.join(cwd(), "graph-webp-out", `${w}x${h}`, "img2webp.args"),
            commandStr
        );

        dockerPromise = dockerPromise
            .then(() => {
                return exec(
                    `docker run --mount type=bind,src=${cwd()}/graph-webp-out,dst=/mnt/graph-webp-out libwebp-tools img2webp /mnt/graph-webp-out/${w}x${h}/img2webp.args`
                );
            })
            .then(() => webpProgress.increment());
    }
    pngProgress.stop();
    dockerPromise
        .then(() => {
            progressBars.stop();
        })
        .catch((e) => {
            console.error("Error running docker stuffs: ", e);
        });
})();
