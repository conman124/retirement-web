let cachedCanvas: HTMLCanvasElement | null = null;

function getCssStyle(element, prop) {
    return window.getComputedStyle(element, null).getPropertyValue(prop);
}

function getCanvasFont(classList) {
    const el = document.createElement("div");
    el.classList.add(...classList);
    const fontWeight = getCssStyle(el, "font-weight") || "normal";
    const fontSize = getCssStyle(el, "font-size") || "16px";
    const fontFamily = getCssStyle(el, "font-family") || "Times New Roman";

    return `${fontWeight} ${fontSize} ${fontFamily}`;
}

export function getTextDimensions(text, classList) {
    const font = getCanvasFont(classList);
    // re-use canvas object for better performance
    const canvas =
        cachedCanvas || (cachedCanvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics;
}
