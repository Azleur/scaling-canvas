import { Vec2 } from "@azleur/vec2";

import { Brush } from "../Brush";
import { Box, SizeBox, PaintBox } from "./Box";
import { DisplayText, SizeText, PaintText } from "./DisplayText";

export type Label = {
    box: Box,
    text: DisplayText,
};

export const SizeLabel = (brush: Brush, label: Label, offset: Vec2): void => {
    SizeText(brush, label.text, offset); // TODO: Offset looks suspicious here.
    SizeBox(label.box, label.text.rect);
};

export const PaintLabel = (brush: Brush, label: Label): void => {
    PaintBox(brush, label.box);
    PaintText(brush, label.text);
};


// TODO: Variant with connectors or arbitrary stuff.
//       * A way to do this would be: instead of a Label type, have a Row type that just puts them together.
//       * Then (anyway) we need a Connector type.
// TODO: Connect and actually use.
// TODO: Connect hilite to mouse input to highlight.
// TODO: Use new framework to turn on / off oscillators on title click.
