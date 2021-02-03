import { Vec2 } from "@azleur/vec2";
import { FromCenterRadius } from "@azleur/rect";
import { ScalingCanvas } from "@azleur/scaling-canvas";

window.onload = () => {
    const rawCanvas = document.getElementById("target") as HTMLCanvasElement;
    const canvas = new ScalingCanvas(rawCanvas, FromCenterRadius(Vec2.Zero, 2));

    const w = 0.25 * (2 * Math.PI);
    const ballSize = 0.1;
    let ballPos = Vec2.Right;

    const updateBall = (millis: number) => {
        const t = millis / 1000;
        ballPos = new Vec2(Math.cos(t * w), Math.sin(t * w));
    };

    const paintBall = () => {
        const box = FromCenterRadius(Vec2.Zero, 1);
        canvas.Clear("white");
        canvas.FillRect(box, { brush: "#bfb" });
        canvas.StrokeRect(box, { brush: "green", width: 1 });
        canvas.StrokeCircle(Vec2.Zero, 1, { brush: "red", width: 0.75 });
        canvas.FillCircle(Vec2.Zero, 0.1, { brush: "red" });
        canvas.StrokeLine(Vec2.Left, Vec2.Right, { brush: "black", width: 0.5 });
        canvas.StrokeLine(Vec2.Up, Vec2.Down, { brush: "black", width: 0.5 });
        canvas.FillCircle(ballPos, 0.025, { brush: "blue" });
        canvas.SetStroke({ brush: "blue", width: 2 });
        canvas.StrokeRect(FromCenterRadius(ballPos, ballSize));
        canvas.Write(Vec2.One, "Hello, world!", { brush: "#662", font: "bold 2rem sans-serif" });

        const text = "Ends at the beginning"
        const style = { brush: "black", font: "1rem serif" };
        const padding = new Vec2(0.1, 0.1);
        canvas.SetFont(style);
        const textSize = canvas.MeasureText(text);
        const boxSize = textSize.Grow(padding);
        const boxRect = boxSize.Translate(boxSize.max.Negate());
        const textRect = textSize.Translate(boxRect.min.Sub(textSize.min).Add(padding));
        const textStart = boxRect.min.Add(padding).Sub(textSize.min);
        canvas.FillRect(boxRect, { brush: "#fcf" });
        canvas.StrokeRect(textRect, { brush: "red", width: 0.5 });
        canvas.Write(textStart, text, style);
        canvas.FillCircle(textStart, 0.025, { brush: "red" });

        canvas.StrokePoints([new Vec2(1.5, -1.5), new Vec2(1.7, -1.8), new Vec2(1.8, -1.6)], false, {brush: "#048", width: 1.5});
        canvas.StrokePoints([new Vec2(1.6, -1), new Vec2(1.75, -0.9), new Vec2(1.9, -1.3)], true, {brush: "#084", width: 2.5});
        canvas.FillPoints([new Vec2(2, -1), new Vec2(2.15, -0.9), new Vec2(2.3, -1.3)], {brush: "#804"});
    };

    const tick = (millis: number) => {
        updateBall(millis);
        paintBall();
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
};