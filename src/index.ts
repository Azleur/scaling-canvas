import { Vec2 } from "@azleur/vec2";
import { Rect, FromCenterSpan } from "@azleur/rect";
import {
    AffineTransform, ScaleFit,
    TransformPoint, InverseTransformPoint,
    TransformRect, InverseTransformRect,
    TransformVec, InverseTransformVec,
    TransformArea, InverseTransformArea
} from "@azleur/transform";

export type BrushStyle = string | CanvasGradient | CanvasPattern;
export type StrokeStyle = { brush: BrushStyle, width: number, };
export type FillStyle = { brush: BrushStyle, };
// TODO: Consider splitting font string into components (size, font family...).
export type FontStyle = { brush: BrushStyle, font: string };

export class ScalingCanvas {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    worldRect?: Rect;
    canvasRect?: Rect;
    worldToCanvasTransform?: AffineTransform;

    constructor(canvas: HTMLCanvasElement, worldRect?: Rect) {
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

        if (worldRect) {
            this.AdjustCamera(worldRect); // worldRect initialized here.
        }
        this.ResizeCanvas();
    }

    /** Use this to change the camera position and/or size. */
    AdjustCamera(worldRect: Rect): void {
        this.worldRect = worldRect;
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

    /** Map a world point (position in the world) to canvas space (pixel position). */
    WorldToCanvasPoint(world: Vec2): Vec2 {
        return this.canvasWrapper(transform => TransformPoint(world, transform));
    }

    /** Map a canvas point (pixel position in the canvas) to world space. */
    CanvasToWorldPoint(canvas: Vec2): Vec2 {
        return this.canvasWrapper(transform => InverseTransformPoint(canvas, transform));
    }

    /** Map a world rect (area in the world) to canvas space (pixel area). */
    WorldToCanvasRect(world: Rect): Rect {
        return this.canvasWrapper(transform => TransformRect(world, transform));
    }

    /** Map a canvas rect (pixel area in the canvas) to world space. */
    CanvasToWorldRect(canvas: Rect): Rect {
        return this.canvasWrapper(transform => InverseTransformRect(canvas, transform));
    }

    /** Map a world vector (distance without an origin) to canvas space (pixel distance). */
    WorldToCanvasVec(world: Vec2): Vec2 {
        return this.canvasWrapper(transform => TransformVec(world, transform));
    }

    /** Map a canvas vector (pixel distance without an origin) to world space. */
    CanvasToWorldVec(canvas: Vec2): Vec2 {
        return this.canvasWrapper(transform => InverseTransformVec(canvas, transform));
    }

    /** Map a world area (size rect without an origin) to canvas space (pixel size). */
    WorldToCanvasArea(world: Rect): Rect {
        return this.canvasWrapper(transform => TransformArea(world, transform));
    }

    /** Map a canvas area (pixel rect without an origin) to world space. */
    CanvasToWorldArea(canvas: Rect): Rect {
        return this.canvasWrapper(transform => InverseTransformArea(canvas, transform));
    }

    /** Clear the whole canvas. */
    Clear(fill?: BrushStyle): void {
        if (this.canvasRect) {
            const { x, y } = this.canvasRect.min;
            const { x: w, y: h } = this.canvasRect.Diagonal();
            this.context.clearRect(x, y, w, h);
            if (fill) {
                this.context.fillStyle = fill;
                this.context.fillRect(x, y, w, h);
            }
        }
    }

    /** Set the stroke style (brush, width). */
    SetStroke(style: StrokeStyle): void {
        this.context.strokeStyle = style.brush;
        this.context.lineWidth = style.width;
    }

    /** Set the fill style (brush). */
    SetFill(style: FillStyle): void {
        this.context.fillStyle = style.brush;
    }

    /** Set the font style (brush, font). */
    SetFont(style: FontStyle): void {
        this.context.fillStyle = style.brush;
        this.context.font = style.font;
    }

    /** Draw a line between two world points. */
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

    /** Draw the contour of a world rect. */
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
        const canvasRect = this.WorldToCanvasRect(worldRect);
        const min = canvasRect.min;
        const size = canvasRect.Diagonal();
        this.context.strokeRect(min.x, min.y, size.x, size.y);
    }

    /** Fill the area of a world rect. */
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

    /** Draw the contour of a circle of the approximate given world size (does not deform into ellipse). */
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

    /** Fill the area of a circle of the approximate given world size (does not deform into ellipse). */
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

    /** Write text at the given world position. */
    Write(position: Vec2, text: string, style?: FontStyle): void {
        if (style) {
            this.SetFont(style);
        }
        const canvasPos = this.WorldToCanvasPoint(position);
        this.context.fillText(text, canvasPos.x, canvasPos.y);
    }

    /** Calculate the on-world size of a piece of text. */
    MeasureText(text: string): Rect {
        const metrics = this.context.measureText(text);
        const canvasArea = new Rect(
            -metrics.actualBoundingBoxLeft , -metrics.actualBoundingBoxAscent,
            +metrics.actualBoundingBoxRight, +metrics.actualBoundingBoxDescent
        );
        const worldArea = this.CanvasToWorldArea(canvasArea);
        return worldArea;
    }
}