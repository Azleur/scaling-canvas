import { Vec2 } from "@azleur/vec2";
import { FromCenterRadius } from "@azleur/rect";
import { ScalingCanvas } from "@azleur/scaling-canvas";

const VecZero = new Vec2(0, 0);
const VecLeft = new Vec2(-1, 0);
const VecRight = new Vec2(1, 0);
const VecUp = new Vec2(0, 1);
const VecDown = new Vec2(0, -1);

window.onload = () => {
    const rawCanvas = document.getElementById("target") as HTMLCanvasElement;
    const canvas = new ScalingCanvas(rawCanvas, FromCenterRadius(VecZero, 2.5));

    const w = 0.25 * (2 * Math.PI);
    const ballSize = 0.1;
    let ballPos = VecRight;

    const updateBall = (millis: number) => {
        const t = millis / 1000;
        ballPos = new Vec2(Math.cos(t * w), Math.sin(t * w));
    };

    const paintBall = () => {
        const box = FromCenterRadius(VecZero, 1);
        canvas.Clear();
        canvas.SetFill({ brush: "white" });
        canvas.FillRect(canvas.Window());
        canvas.FillRect(box, { brush: "#bfb" });
        canvas.StrokeRect(box, { brush: "green", width: 1 });
        canvas.StrokeCircle(VecZero, 1, { brush: "red", width: 0.75 });
        canvas.FillCircle(VecZero, 0.1, { brush: "red" });
        canvas.StrokeLine(VecLeft, VecRight, { brush: "black", width: 0.5 });
        canvas.StrokeLine(VecUp, VecDown, { brush: "black", width: 0.5 });
        canvas.FillCircle(ballPos, 0.025, { brush: "blue" });
        canvas.SetStroke({ brush: "blue", width: 2 });
        canvas.StrokeRect(FromCenterRadius(ballPos, ballSize));
    };

    const tick = (millis: number) => {
        updateBall(millis);
        paintBall();
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
};