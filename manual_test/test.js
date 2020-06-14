import { Vec2 } from "@azleur/vec2";
import { ScalingCanvas } from "../dist";

document.onload = () => {
    const rawCanvas = document.getElementById("target");
    const canvas = new ScalingCanvas(rawCanvas, 1, new Vec2(0, 0));

    const w = 0.25 * (2 * Math.PI);
    const ballSize = 0.1;
    let ballPos = new Vec2(1, 0);

    const updateBall = millis => {
        const t = millis / 1000;
        ballPos = new Vec2(Math.cos(t * w), Math.sin(t * w));
    };

    const paintBall = () => {
        canvas.Clear();
        canvas.SetFill({ brush: "white" });
        canvas.FillRect(canvas.canvasRect);
        canvas.SetStroke({ brush: "red", width: 1 });
        canvas.StrokeRect(FromCenterRadius(ballPos, ballSize));
    };

    const tick = (millis) => {
        updateBall(millis);
        paintBall();
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
};