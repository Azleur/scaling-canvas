import { Vec2 } from "@azleur/vec2";
import { Rect, FromCenterSpan } from "@azleur/rect";

import { Brush } from "../Brush";
import { Input, Output, SizePort, PaintPort, PortHelper } from "./Port";
import { ColumnSize } from "../layout/Util";

export type PieceType = (context: AudioContext) => Piece;

export type Piece = {
    rect: Rect,
    color: string,
    name: string,
    namePos: Vec2,
    nameRect: Rect,
    inputs: Input[],
    outputs: Output[],
};

export type PartialPiece = {
    rect?: Rect,
    color?: string,
    name?: string,
    namePos?: Vec2,
    inputs?: Input[],
    outputs?: Output[],
};

const padding = 6;
const minSide = 30;

// TODO: CLEAN UP PADDING LOGIC! AUTOMATE SOMEHOW!

export const MakePiece = (type: PieceType, audioContext: AudioContext, brush: Brush, center: Vec2): Piece => {
    const piece = type(audioContext);
    SizePiece(piece, brush, center);
    return piece;
};

export const SizePiece = (piece: Piece, brush: Brush, center: Vec2): void => {
    piece.inputs.forEach(input => SizePort(input, brush, true));
    piece.outputs.forEach(output => SizePort(output, brush, false));

    const nameSize = brush.textSize(piece.name);
    const inputSize = ColumnSize(piece.inputs.map(input => input.rect.Diagonal()));
    const outputSize = ColumnSize(piece.outputs.map(output => output.rect.Diagonal()));
    const portSize = new Vec2(inputSize.x + outputSize.x, Math.max(inputSize.y, outputSize.y));
    const size = new Vec2(
        Math.max(minSide, portSize.x, nameSize.x + 2 * padding),
        Math.max(minSide, portSize.y + nameSize.y + 2 * padding)
    );
    piece.rect = FromCenterSpan(center, size.Div(2));
    const nameDelta = new Vec2((size.x - nameSize.x) / 2, padding + nameSize.y);
    piece.namePos = piece.rect.min.Add(nameDelta);
    piece.nameRect = new Rect(piece.rect.min, new Vec2(piece.rect.max.x, piece.rect.min.y + nameSize.y + 2 * padding));
    console.log(piece.nameRect);

    let inputPos = piece.rect.min.Add(new Vec2(0, nameSize.y + 2 * padding));
    for (const input of piece.inputs) {
        input.namePos = input.namePos.Add(inputPos);
        input.connectorPos = input.connectorPos.Add(inputPos);
        input.rect = input.rect.Translate(inputPos);
        inputPos = inputPos.Add(new Vec2(0, input.rect.Diagonal().y));
    }

    let outputPos = new Vec2(piece.rect.max.x - outputSize.x, piece.rect.min.y + nameSize.y + 2 * padding);
    for (const output of piece.outputs) {
        output.namePos = output.namePos.Add(outputPos);
        output.connectorPos = output.connectorPos.Add(outputPos);
        output.rect = output.rect.Translate(outputPos);
        outputPos = outputPos.Add(new Vec2(0, output.rect.Diagonal().y));
    }
};

export const PaintPiece = (brush: Brush, piece: Piece): void => {
    brush.setFill(piece.color);
    brush.fillRect(piece.rect);

    for (const input of piece.inputs) {
        brush.setStroke("green", 0.75);
        brush.strokeRect(input.rect);
        PaintPort(brush, input);
    }

    for (const output of piece.outputs) {
        const outputRect = output.rect;
        brush.setStroke("red", 0.75);
        brush.strokeRect(outputRect);
        PaintPort(brush, output);
    }

    brush.setStroke("blue", 0.75);
    brush.strokeRect(piece.nameRect);
    brush.setFont("1rem sans-serif", "black");
    brush.write(piece.namePos, piece.name);
};

const PieceHelper = (partial: PartialPiece): Piece => ({
    rect: new Rect(0, 0, 0, 0),
    color: "magenta",
    name: "NULL",
    namePos: new Vec2(0, 0),
    nameRect: new Rect(0, 0, 0, 0),
    inputs: [],
    outputs: [],
    ...partial
});

export const Source: PieceType = (context: AudioContext): Piece => {
    const node = context.createOscillator();
    node.start(); // HACK
    return PieceHelper({
        color: "#8f8",
        name: "source",
        outputs: [
            PortHelper({
                name: "signal",
                audioNode: node,
            })
        ],
    });
};

export const Sink: PieceType = (context: AudioContext): Piece => PieceHelper({
    color: "#f88",
    name: "sink",
    inputs: [
        PortHelper({
            name: "audio out",
            audioNode: context.destination,
        }),
    ],
});
