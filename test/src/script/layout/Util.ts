import { Vec2, Project } from "@azleur/vec2";
import { Rect } from "@azleur/rect";

// TODO: Lots of fluff here. Let's see if we can kill stuff.

export enum Direction {
    Horizontal = "horizontal",
    Vertical = "vertical",
}

export enum Alignment {
    Beginning = "beginning",
    Middle = "middle",
    End = "end",
}

export enum HorizontalAlignment {
    Left = "left",
    Center = "center",
    Right = "right",
}

export enum VerticalAlignment {
    Top = "top",
    Center = "center",
    Bottom = "bottom",
}

const VecX = new Vec2(0, 1);
const VecY = new Vec2(0, 1);

const VerticalToAlignment = (vert: VerticalAlignment): Alignment => {
    switch (vert) {
        case VerticalAlignment.Bottom:
            return Alignment.Beginning;
        case VerticalAlignment.Center:
            return Alignment.Middle;
        case VerticalAlignment.Top:
            return Alignment.End;
    }
}

const HorizontalToAlignment = (hor: HorizontalAlignment): Alignment => {
    switch (hor) {
        case HorizontalAlignment.Left:
            return Alignment.Beginning;
        case HorizontalAlignment.Center:
            return Alignment.Middle;
        case HorizontalAlignment.Right:
            return Alignment.End;
    }
}

const Align = (rect: Rect, envelope: Rect, direction: Direction, alignment: Alignment): void => {
    const axis = direction === Direction.Horizontal ? VecX : VecY;
    let delta: Vec2;
    switch (alignment) {
        case Alignment.Beginning:
            delta = envelope.min.Sub(rect.min);
            break;
        case Alignment.End:
            delta = envelope.max.Sub(rect.max);
            break;
        case Alignment.Middle:
            const center = envelope.Center();
            const halfSize = rect.Diagonal().Div(2);
            delta = center.Sub(halfSize);
            break;
    }
    delta = Project(delta, axis);
    rect.min = rect.min.Add(delta);
    rect.max = rect.max.Add(delta);
};

export const AlignVertical = (rect: Rect, envelope: Rect, alignment: VerticalAlignment): void => Align(rect, envelope, Direction.Vertical, VerticalToAlignment(alignment));

export const AlignHorizontal = (rect: Rect, envelope: Rect, alignment: HorizontalAlignment): void => Align(rect, envelope, Direction.Horizontal, HorizontalToAlignment(alignment));

/** Calculate size needed to lay out all elements in 'sizes' in one vertical strip. */
export const ColumnSize = (sizes: Vec2[]): Vec2 => {
    const width = sizes.reduce((max, size) => Math.max(size.x, max), 0);
    const height = sizes.reduce((sum, size) => sum + size.y, 0);
    return new Vec2(width, height);
};

/** Calculate size needed to lay out all elements in 'sizes' in one horizontal strip. */
export const RowSize = (sizes: Vec2[]): Vec2 => {
    const width = sizes.reduce((sum, size) => sum + size.x, 0);
    const height = sizes.reduce((max, size) => Math.max(size.y, max), 0);
    return new Vec2(width, height);
};

export const LinearSize = (sizes: Vec2[], direction: Direction): Vec2 => {
    if (direction === Direction.Horizontal) {
        return RowSize(sizes);
    } else {
        return ColumnSize(sizes);
    }
}

/** Put all rects in one strip starting at min coords 'offset', and returns the envelope. */
const MakeStrip = (offset: Vec2, rects: Rect[], direction: Direction): Rect => {
    const pos = offset;
    for (const rect of rects) {
        rect.Translate(pos.Sub(rect.min));
        if (direction === Direction.Horizontal) {
            pos.x = rect.max.x;
        } else {
            pos.y = rect.max.y;
        }
    }
    return new Rect(rects[0].min, rects[rects.length - 1].max);
};

/** Puts all rects in one strip starting at min coords 'offset' and aligning them as appropriate; returns the envelope. */
export const Arrange = (offset: Vec2, rects: Rect[], direction: Direction, alignment: Alignment): Rect => {
    const envelope = MakeStrip(offset, rects, direction);
    rects.forEach(rect => Align(rect, envelope, direction, alignment));
    return envelope;
}

/** Puts all rects in one row starting at min coords 'offset' and aligning them as appropriate; returns the envelope. */
export const ArrangeAsRow = (offset: Vec2, rects: Rect[], alignment: VerticalAlignment): Rect => Arrange(offset, rects, Direction.Horizontal, VerticalToAlignment(alignment));

/** Puts all rects in one column starting at min coords 'offset' and aligning them as appropriate; returns the envelope. */
export const ArrangeAsColumn = (offset: Vec2, rects: Rect[], alignment: HorizontalAlignment): Rect => Arrange(offset, rects, Direction.Vertical, HorizontalToAlignment(alignment));
