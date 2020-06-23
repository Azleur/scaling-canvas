import { Vec2 } from "@azleur/vec2";
import { Rect } from "@azleur/rect";
import { Brush } from "../Brush";

export type Box = {
    rect: Rect,
    fillStyle?: string,
    hiliteStyle?: string,
    outlineStyle?: string,
    outlineSize?: number,
    padding?: number,
    hilite?: boolean,
};

export const SizeBox = (box: Box, contents: Rect): void => {
    const { padding } = box;
    if (padding) {
        const padVec = new Vec2(padding, padding);
        box.rect.min = contents.min.Sub(padVec);
        box.rect.max = contents.max.Add(padVec);
    } else {
        box.rect = contents;
    }
};

export const PutContentsAsRow = (box: Box, offset: Vec2, contents: Rect[]): void => {
    // TODO
};

export const PaintBox = (brush: Brush, box: Box): void => {
    const { fillStyle, outlineStyle, outlineSize, hiliteStyle, hilite } = box;

    if (fillStyle) {
        brush.setFill(fillStyle);
        brush.fillRect(box.rect);
    }

    if (hilite && hiliteStyle) {
        brush.setFill(hiliteStyle);
        brush.fillRect(box.rect);
    }

    if (outlineStyle && outlineSize) {
        brush.setStroke(outlineStyle, outlineSize);
        brush.strokeRect(box.rect);
    }
};
