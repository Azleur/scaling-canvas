import { Vec2 } from "@azleur/vec2";

import { Brush } from "../Brush";
import { Input, Output } from "./Port";

export type Arrow = {
    source: Output,
    target: Input,
};

// Decoration on arrows.
const ballSpacing = 30;
const ballRadius = 3.5;
const ballSpeed = 50;

export const PaintArrow = (brush: Brush, source: Vec2, target: Vec2, time: number): void => {
    // const source = arrow.source.connectorPos;
    // const target = arrow.target.connectorPos;

    const direction = target.Sub(source);
    const size = direction.Mag();
    const normalized = direction.Div(size);
    brush.line(source, target);
    const init = (time * ballSpeed) % ballSpacing;
    for (let ballPos = init; ballPos < size; ballPos += ballSpacing) {
        const p = source.Add(normalized.Times(ballPos));
        brush.fillCircle(p, ballRadius);
    }
};
