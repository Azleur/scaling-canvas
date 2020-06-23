import { Vec2 } from "@azleur/vec2";
import { Rect } from "@azleur/rect";

import { Brush } from "../Brush";

export type Port = {
    name: string,
    rect: Rect,
    namePos: Vec2,
    connectorPos: Vec2,
    audioNode: AudioNode,
    connections: Port[],
};

export type PartialPort = {
    name?: string,
    rect?: Rect,
    namePos?: Vec2,
    connectorPos?: Vec2,
    audioNode: AudioNode,
    connections?: Port[],
};

export type Input = Port;
export type Output = Port;

const connectorRadius = 4;
const padding = 6;

export const SizePort = (port: Port, brush: Brush, connectorLeft: boolean): void => {
    const nameSize = brush.textSize(port.name);
    const w = nameSize.x + 2 * connectorRadius + 3 * padding;
    const h = Math.max(nameSize.y, 2 * connectorRadius) + 2 * padding;

    port.rect = new Rect(0, 0, w, h);

    if (connectorLeft) {
        port.namePos = new Vec2(2 * padding + 2 * connectorRadius, (nameSize.y + h) / 2);
        port.connectorPos = new Vec2(padding + connectorRadius, h / 2);
    } else {
        port.namePos = new Vec2(padding, (nameSize.y + h) / 2);
        port.connectorPos = new Vec2(w - (connectorRadius + padding), h / 2);
    }
};

export const PaintPort = (brush: Brush, port: Port): void => {
    if (port.connections.length > 0) {
        brush.setFill("magenta");
        brush.fillCircle(port.connectorPos, connectorRadius);
    }

    brush.setStroke("black", 1.5);
    brush.strokeCircle(port.connectorPos, connectorRadius);

    brush.setFont("1rem sans-serif", "black");
    brush.write(port.namePos, port.name);
}

export const PortHelper = (partial: PartialPort): Port => ({
    name: "NULL",
    rect: new Rect(0, 0, 0, 0),
    namePos: new Vec2(0, 0),
    connectorPos: new Vec2(0, 0),
    connections: [],
    ...partial
});
