import { Vec2 } from "@azleur/vec2";
import { Rect } from "@azleur/rect";

export type BrushStyle = string | CanvasGradient | CanvasPattern;

export class Brush {
    ctx: CanvasRenderingContext2D;
    unit: number;

    constructor(ctx: CanvasRenderingContext2D, unit: number) {
        this.ctx = ctx;
        this.unit = unit;
    }

    rescale(unit: number): void {
        this.unit = unit;
    }

    setStroke(style: BrushStyle, width: number): void {
        this.ctx.strokeStyle = style;
        this.ctx.lineWidth = width;
    }

    setFill(style: BrushStyle): void {
        this.ctx.fillStyle = style;
    }

    setFont(font: string, fill?: BrushStyle): void {
        this.ctx.font = font;
        if (fill) {
            this.ctx.fillStyle = fill;
        }
    }

    line(from: Vec2, to: Vec2): void {
        this.ctx.beginPath();
        this.ctx.moveTo(from.x * this.unit, from.y * this.unit);
        this.ctx.lineTo(to.x * this.unit, to.y * this.unit);
        this.ctx.stroke();
    }

    strokeRect(rect: Rect): void;
    strokeRect(center: Vec2, size: Vec2): void;
    strokeRect(a: Rect | Vec2, b?: undefined | Vec2): void {
        let min: Vec2;
        let size: Vec2;
        if (b === undefined) {
            const rect = a as Rect;
            min = rect.min.Times(this.unit);
            size = rect.Diagonal().Times(this.unit);
        } else {
            const center = (a as Vec2).Times(this.unit);
            size = (b as Vec2).Times(this.unit);
            min = center.Sub(size.Div(2));
        }
        this.ctx.strokeRect(min.x, min.y, size.x, size.y);
    }

    fillRect(rect: Rect): void;
    fillRect(center: Vec2, size: Vec2): void;
    fillRect(a: Rect | Vec2, b?: undefined | Vec2): void {
        let min: Vec2;
        let size: Vec2;
        if (b === undefined) {
            const rect = a as Rect;
            min = rect.min.Times(this.unit);
            size = rect.Diagonal().Times(this.unit);
        } else {
            const center = (a as Vec2).Times(this.unit);
            size = (b as Vec2).Times(this.unit);
            min = center.Sub(size.Div(2));
        }
        this.ctx.fillRect(min.x, min.y, size.x, size.y);
    }

    square(center: Vec2, side: number): void {
        this.fillRect(center, new Vec2(side, side));
    }

    fillCircle(center: Vec2, radius: number): void {
        this.ctx.beginPath();
        this.ctx.arc(center.x * this.unit, center.y * this.unit, radius * this.unit, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    strokeCircle(center: Vec2, radius: number): void {
        this.ctx.beginPath();
        this.ctx.arc(center.x * this.unit, center.y * this.unit, radius * this.unit, 0, 2 * Math.PI);
        this.ctx.stroke();
    }

    textSize(text: string): Vec2 {
        const metrics = this.ctx.measureText(text);
        const width = metrics.width / this.unit;
        const height = metrics.actualBoundingBoxAscent / this.unit;
        return new Vec2(width, height);
    }

    write(pos: Vec2, text: string): void {
        this.ctx.fillText(text, pos.x * this.unit, pos.y * this.unit);
    }
}
