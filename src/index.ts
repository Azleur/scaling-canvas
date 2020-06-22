import { Vec2 } from "@azleur/vec2";
import { Rect, FromCenterRadius, FromCenterSpan } from "@azleur/rect";
import {
    AffineTransform, ScaleFit,
    TransformPoint, InverseTransformPoint,
    TransformRect, InverseTransformRect,
    TransformVec, InverseTransformVec,
} from "@azleur/transform";

export type BrushStyle = string | CanvasGradient | CanvasPattern;
export type StrokeStyle = { brush: BrushStyle, width: number, };
export type FillStyle = { brush: BrushStyle, };
export type FontStyle = { brush: BrushStyle, font: string };

export class ScalingCanvas {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    worldRect?: Rect;
    canvasRect?: Rect;
    worldToCanvasTransform?: AffineTransform;

    constructor(canvas: HTMLCanvasElement);
    constructor(canvas: HTMLCanvasElement, worldSize: number, worldCenter: Vec2);
    constructor(canvas: HTMLCanvasElement, worldSize?: number, worldCenter?: Vec2) {
        this.canvas = canvas;
        this.canvas.onresize = this.ResizeCanvas;
        this.canvas.onload

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            const msg = "Could not get 2d context.";
            const child = new HTMLDivElement();
            child.innerHTML = msg;
            canvas.appendChild(child);
            throw new Error(msg)
        }
        this.context = ctx;

        if (worldSize && worldCenter) {
            this.AdjustCamera(worldSize, worldCenter); // worldRect initialized here.
        }
        this.ResizeCanvas();
    }

    /** Use this to change the camera position and/or size. */
    AdjustCamera(worldSize: number, worldCenter: Vec2): void {
        this.worldRect = FromCenterRadius(worldCenter, worldSize / 2);
        this.Fit();
    }

    /**
     * Re-calculate the canvas rect size, and set the internal canvas resolution to match the real resolution.
     * 
     * * Called from the constructor.
     * * Should be triggered whenever the canvas is resized, and at init time.
     */
    ResizeCanvas(): void {
        const _w = this.canvas.width = this.canvas.clientWidth;
        const _h = this.canvas.height = this.canvas.clientHeight;
        this.canvasRect = new Rect(0, 0, _w, _h);
        this.Fit();
    }

    /**
     * Calculate the correct world-to-canvas transform.
     * 
     * * Called internally in AdjustCamera() and ResizeCanvas().
     * * Should be called after resizing the canvas or moving the camera.
     */
    Fit(): void {
        if (this.worldRect && this.canvasRect) {
            this.worldToCanvasTransform = ScaleFit(this.worldRect, this.canvasRect, { invertY: true });
        }
    }

    /**
     * Internal method.
     * 
     * Passes worldToCanvasTransform to operation, if the transform is present.
     * Otherwise throws an error. 
     */
    canvasWrapper<T>(operation: (transform: AffineTransform) => T): T {
        if (this.worldToCanvasTransform) {
            return operation(this.worldToCanvasTransform);
        } else {
            throw new Error("Canvas not initialized!");
        }
    }

    /** 
     * Return the actual rect in world coordinates that is rendered.
     * 
     * We require this.worldRect to be rendered, but due to shape discrepancies the real drawn area will typically be bigger.
     */
    Window(): Rect {
        return this.canvasWrapper(transform => InverseTransformRect(this.canvasRect!, transform));
    }

    WorldToCanvasPoint(world: Vec2): Vec2 {
        return this.canvasWrapper(transform => TransformPoint(world, transform));
    }

    CanvasToWorldPoint(canvas: Vec2): Vec2 {
        return this.canvasWrapper(transform => InverseTransformPoint(canvas, transform));
    }

    WorldToCanvasRect(world: Rect): Rect {
        return this.canvasWrapper(transform => TransformRect(world, transform));
    }

    CanvasToWorldRect(canvas: Rect): Rect {
        return this.canvasWrapper(transform => InverseTransformRect(canvas, transform));
    }

    WorldToCanvasVec(world: Vec2): Vec2 {
        return this.canvasWrapper(transform => TransformVec(world, transform));
    }

    CanvasToWorldVec(canvas: Vec2): Vec2 {
        return this.canvasWrapper(transform => InverseTransformVec(canvas, transform));
    }

    Clear(): void {
        if (this.canvasRect) {
            const { x, y } = this.canvasRect.min;
            const { x: w, y: h } = this.canvasRect.Diagonal();
            this.context.clearRect(x, y, w, h);
        }
    }

    SetStroke(style: StrokeStyle): void {
        this.context.strokeStyle = style.brush;
        this.context.lineWidth = style.width;
    }

    SetFill(style: FillStyle): void {
        this.context.fillStyle = style.brush;
    }

    StrokeLine(from: Vec2, to: Vec2, style?: StrokeStyle): void {
        if (style) {
            this.SetStroke(style);
        }
        const canvasFrom = this.WorldToCanvasPoint(from);
        const canvasTo = this.WorldToCanvasPoint(to);
        this.context.beginPath();
        this.context.moveTo(canvasFrom.x, canvasFrom.y);
        this.context.lineTo(canvasTo.x, canvasTo.y);
        this.context.stroke();
    }

    StrokeRect(rect: Rect, style?: StrokeStyle): void;
    StrokeRect(center: Vec2, size: Vec2, style?: StrokeStyle): void;
    StrokeRect(a: Rect | Vec2, b?: StrokeStyle | Vec2, c?: StrokeStyle): void {
        let worldRect: Rect;
        let style: StrokeStyle | undefined;
        if (b === undefined || (b as StrokeStyle).brush !== undefined) {
            worldRect = a as Rect;
            style = b as StrokeStyle | undefined;
        } else {
            worldRect = FromCenterSpan(a as Vec2, b as Vec2);
            style = c;
        }
        if (style) {
            this.SetStroke(style);
        }
        // const worldRect: Rect = (b === undefined) ? (a as Rect) : FromCenterSpan(a as Vec2, b as Vec2);
        const canvasRect = this.WorldToCanvasRect(worldRect);
        const min = canvasRect.min;
        const size = canvasRect.Diagonal();
        this.context.strokeRect(min.x, min.y, size.x, size.y);
    }

    FillRect(rect: Rect, style?: FillStyle): void;
    FillRect(center: Vec2, size: Vec2, style?: FillStyle): void;
    FillRect(a: Rect | Vec2, b?: FillStyle | Vec2, c?: FillStyle): void {
        let worldRect: Rect;
        let style: FillStyle | undefined;
        if (b === undefined || (b as FillStyle).brush !== undefined) {
            worldRect = a as Rect;
            style = b as FillStyle | undefined;
        } else {
            worldRect = FromCenterSpan(a as Vec2, b as Vec2);
            style = c as FillStyle | undefined;
        }
        if (style) {
            this.SetFill(style);
        }
        const canvasRect = this.WorldToCanvasRect(worldRect);
        const min = canvasRect.min;
        const size = canvasRect.Diagonal();
        this.context.fillRect(min.x, min.y, size.x, size.y);
    }

    StrokeCircle(center: Vec2, radius: number, style?: StrokeStyle): void {
        if (style) {
            this.SetStroke(style);
        }
        const c = this.WorldToCanvasPoint(center);
        const radiusVec = this.WorldToCanvasVec(new Vec2(radius, radius));
        const r = Math.max(radiusVec.x, radiusVec.y); // Should be equal but can depend on transform.
        this.context.beginPath();
        this.context.arc(c.x, c.y, r, 0, 2 * Math.PI);
        this.context.stroke();
    }

    FillCircle(center: Vec2, radius: number, style?: FillStyle): void {
        if (style) {
            this.SetFill(style);
        }
        const c = this.WorldToCanvasPoint(center);
        const radiusVec = this.WorldToCanvasVec(new Vec2(radius, radius));
        const r = Math.max(radiusVec.x, radiusVec.y); // Should be equal but can depend on transform.
        this.context.beginPath();
        this.context.arc(c.x, c.y, r, 0, 2 * Math.PI);
        this.context.fill();
    }
}