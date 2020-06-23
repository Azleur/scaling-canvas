import { Vec2 } from "@azleur/vec2";
import { Rect } from "@azleur/rect";
import { Brush } from "../Brush";

export type DisplayText = {
    font: string,
    text: string,
    rect: Rect,
};

export const SizeText = (brush: Brush, text: DisplayText, offset: Vec2): void => {
    brush.setFont(text.font);
    const textSize = brush.textSize(text.text);
    text.rect.min = offset;
    text.rect.max = offset.Add(textSize);
};

export const PaintText = (brush: Brush, text: DisplayText): void => {
    brush.setFont(text.font);
    brush.write(text.rect.min, text.text);
};
