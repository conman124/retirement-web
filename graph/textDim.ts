let cachedCanvas: HTMLCanvasElement | null = null;

function getCssStyle(element, prop, window) {
    return window.getComputedStyle(element, null).getPropertyValue(prop);
}

function getCanvasFont(classList, window) {
    const el = window.document.createElement("div");
    el.className = classList.join(" ");
    const fontWeight = getCssStyle(el, "font-weight", window) || "normal";
    const fontSize = getCssStyle(el, "font-size", window) || "16px";
    const fontFamily =
        getCssStyle(el, "font-family", window) || "Times New Roman";

    return `${fontWeight} ${fontSize} ${fontFamily}`;
}

export type CachedCanvasFactory = () => HTMLCanvasElement;

export function getTextDimensions(
    text,
    classList,
    window,
    canvasFactory: CachedCanvasFactory
) {
    const font = getCanvasFont(classList, window);
    const canvas = canvasFactory();
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics;
}
