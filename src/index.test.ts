// import { createCanvas } from "canvas";
import { ScalingCanvas } from ".";

class MockCanvas extends HTMLCanvasElement {};

test("Basic stuff", () => {
    // const rawCanvas = createCanvas(100, 100);
    const rawCanvas = new MockCanvas();
    const scalingCanvas = new ScalingCanvas(rawCanvas);

    console.log(scalingCanvas);
});
