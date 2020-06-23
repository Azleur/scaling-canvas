# Scaling Canvas

Pixel size invariant canvas wrapper.

This module abstracts away the on-screen size of a canvas element.

Usage:

```typescript
const rawCanvas = document.getElementById("my-canvas");
const worldRect = new Rect(0, 0, 4, 4); // Canvas will ensure this rect is in view, no matter the form factor.
const canvas = new ScalingCanvas(rawCanvas, worldRect);

canvas.StrokeRect(new Rect(1, 1, 3, 3), { brush: "red", width: 0.75 });
...
```