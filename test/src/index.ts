import { Vec2, Right, Zero, Left, Up, Down, One } from "@azleur/vec2";
import { FromCenterRadius } from "@azleur/rect";
import { ScalingCanvas } from "@azleur/scaling-canvas";

window.onload = () => {
    const rawCanvas = document.getElementById("target") as HTMLCanvasElement;
    const canvas = new ScalingCanvas(rawCanvas, FromCenterRadius(Zero, 2));

    const w = 0.25 * (2 * Math.PI);
    const ballSize = 0.1;
    let ballPos = Right;

    const updateBall = (millis: number) => {
        const t = millis / 1000;
        ballPos = new Vec2(Math.cos(t * w), Math.sin(t * w));
    };

    const paintBall = () => {
        const box = FromCenterRadius(Zero, 1);
        canvas.Clear();
        canvas.SetFill({ brush: "white" });
        canvas.FillRect(canvas.Window());
        canvas.FillRect(box, { brush: "#bfb" });
        canvas.StrokeRect(box, { brush: "green", width: 1 });
        canvas.StrokeCircle(Zero, 1, { brush: "red", width: 0.75 });
        canvas.FillCircle(Zero, 0.1, { brush: "red" });
        canvas.StrokeLine(Left, Right, { brush: "black", width: 0.5 });
        canvas.StrokeLine(Up, Down, { brush: "black", width: 0.5 });
        canvas.FillCircle(ballPos, 0.025, { brush: "blue" });
        canvas.SetStroke({ brush: "blue", width: 2 });
        canvas.StrokeRect(FromCenterRadius(ballPos, ballSize));
        canvas.SetFont({ brush: "#662", font: "bold 2rem sans-serif" });
        canvas.Write(One, "Hello, world!");
    };

    const tick = (millis: number) => {
        updateBall(millis);
        paintBall();
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
};