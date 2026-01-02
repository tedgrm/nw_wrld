# Module Development Guide

This guide covers creating custom visual modules for nw_wrld.

## Table of Contents

1. [Module Architecture](#module-architecture)
2. [Your First Module](#your-first-module)
3. [Module Lifecycle](#module-lifecycle)
4. [Working with Methods](#working-with-methods)
5. [Option Types Reference](#option-types-reference)
6. [Using Libraries](#using-libraries)
7. [Advanced Patterns](#advanced-patterns)
8. [Debugging Modules](#debugging-modules)
9. [Best Practices](#best-practices)
10. [Performance Tips](#performance-tips)

---

## Module Architecture

**Signal Flow:** Trigger (Sequencer/MIDI/OSC) → Dashboard (maps trigger to method) → Projector (calls method on module) → Module (updates visuals)

**Inheritance:** All modules extend `ModuleBase` (provides `this.elem`, built-in methods like `show`/`hide`, transformations, cleanup). For 3D graphics, extend `BaseThreeJsModule` instead.

---

## Your First Module

Create a simple pulsing circle module.

### Create the File

`src/projector/modules/PulsingCircle.js`

```javascript
import ModuleBase from "../helpers/moduleBase.js";

class PulsingCircle extends ModuleBase {
  // Module metadata
  static name = "PulsingCircle";
  static category = "2D"; // Use "2D", "3D", or "Text"

  // Define available methods
  static methods = [
    ...ModuleBase.methods, // Inherit base methods
    {
      name: "pulse",
      autoLoad: false,
      options: [
        {
          name: "intensity",
          defaultVal: 1.5,
          type: "number",
        },
        {
          name: "duration",
          defaultVal: 500,
          type: "number",
        },
      ],
    },
    {
      name: "setColor",
      autoLoad: true,
      options: [
        {
          name: "color",
          defaultVal: "#00FF00",
          type: "color",
        },
      ],
    },
  ];

  constructor(container) {
    super(container);
    this.canvas = null;
    this.ctx = null;
    this.circleScale = 1;
    this.color = "#00FF00";
    this.init();
  }

  init() {
    // Create canvas
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.elem.offsetWidth;
    this.canvas.height = this.elem.offsetHeight;
    this.elem.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    // Draw initial circle
    this.draw();
  }

  draw() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const radius = (Math.min(width, height) / 4) * this.circleScale;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw circle
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  pulse({ intensity = 1.5, duration = 500 }) {
    // Animate scale from 1 to intensity and back
    const startScale = this.circleScale;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress < 0.5) {
        // Growing phase
        this.circleScale =
          startScale + (intensity - startScale) * (progress * 2);
      } else if (progress < 1) {
        // Shrinking phase
        this.circleScale =
          intensity - (intensity - startScale) * ((progress - 0.5) * 2);
      } else {
        // Animation complete
        this.circleScale = startScale;
        this.draw();
        return;
      }

      this.draw();
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  setColor({ color = "#00FF00" }) {
    this.color = color;
    this.draw();
  }

  destroy() {
    if (this.canvas && this.canvas.parentNode === this.elem) {
      this.elem.removeChild(this.canvas);
      this.canvas = null;
      this.ctx = null;
    }
    super.destroy();
  }
}

export default PulsingCircle;
```

### Test Your Module

1. Restart the app (`npm start`)
2. Create a track and add the "PulsingCircle" module
3. Add a channel and program a pattern in the sequencer grid
4. Assign the `pulse` method to the channel
5. Click **[PLAY]** to test your module

For live performance testing, switch to External Mode in Settings and trigger from your DAW.

---

## Module Lifecycle

### 1. Construction Phase

```javascript
constructor(container) {
  super(container); // Call this first

  // Initialize your instance variables
  this.myVariable = null;

  // Call your init method
  this.init();
}
```

`super()` sets up `this.elem`, transformation states, and hides the module by default.

### 2. Initialization Phase

```javascript
init() {
  // Create DOM elements
  // Set up canvases
  // Initialize libraries (p5, Three.js, etc.)
  // Load assets
}
```

Keep initialization fast. Set defaults but don't start animations.

### 3. Method Execution Phase

```javascript
myMethod({ param1 = defaultValue, param2 = defaultValue }) {
  // Validate parameters
  // Update visual state
  // Trigger animations
  // Redraw if needed
}
```

Methods with `autoLoad: true` run automatically after `init()` for initial setup. Methods with `autoLoad: false` wait for sequencer or external triggers. Always use default parameters.

### 4. Destruction Phase

```javascript
destroy() {
  // Stop animations
  // Remove event listeners
  // Clean up DOM elements
  // Destroy library instances

  super.destroy(); // Call this last
}
```

Critical for preventing memory leaks and stopping background processes.

---

## Working with Methods

### Method Definition

```javascript
static methods = [
  ...ModuleBase.methods, // Inherit base methods
  {
    name: "methodName",            // Must match function name
    executeOnLoad: true,           // Run on module load?
    options: [                     // Parameters
      {
        name: "paramName",         // Parameter name
        defaultVal: "value",       // Default value
        type: "text",              // UI control type
        min: 0,                    // (optional) for numbers
        max: 100,                  // (optional) for numbers
        values: ["a", "b"],        // (optional) for selects
        allowRandomization: true,  // (optional) add randomize button
      },
    ],
  },
];
```

### executeOnLoad Explained

`executeOnLoad: true` - Runs automatically when module loads (for initial setup: colors, sizes, text, positions)

`executeOnLoad: false` - Waits for sequencer or external trigger (for animations, effects, state changes)

### Method Naming

- Use camelCase: `myMethod`, `setColor`
- Be descriptive
- Method name in `static methods` must match function name exactly

---

## Option Types Reference

### Available Types

| Type      | Description        | Example                                                                               |
| --------- | ------------------ | ------------------------------------------------------------------------------------- |
| `text`    | Text input         | `{ name: "message", defaultVal: "Hello", type: "text" }`                              |
| `number`  | Numeric input      | `{ name: "size", defaultVal: 50, type: "number", min: 10, max: 200 }`                 |
| `color`   | Color picker (hex) | `{ name: "color", defaultVal: "#FF0000", type: "color" }`                             |
| `boolean` | Toggle switch      | `{ name: "enabled", defaultVal: true, type: "boolean" }`                              |
| `select`  | Dropdown menu      | `{ name: "mode", defaultVal: "bounce", type: "select", values: ["bounce", "slide"] }` |
| `matrix`  | Grid position      | `{ name: "position", defaultVal: { rows: 1, cols: 1, excludedCells: [] }, type: "matrix" }` |

All options create UI controls in the Dashboard and pass values to your methods.

---

## Using Libraries

### p5.js (2D Canvas Drawing)

```javascript
import p5 from "p5";

init() {
  const sketch = (p) => {
    p.setup = () => p.createCanvas(this.elem.offsetWidth, this.elem.offsetHeight);
    p.draw = () => { /* your drawing code */ };
  };
  this.p5Instance = new p5(sketch, this.elem);
}

destroy() {
  if (this.p5Instance) this.p5Instance.remove();
  super.destroy();
}
```

### Three.js (3D Graphics)

Extend `BaseThreeJsModule` instead of `ModuleBase`. See `src/projector/templates/ThreeTemplate.js` for a complete example.

### D3.js (Data Visualization)

```javascript
import * as d3 from "d3";

init() {
  this.svg = d3.select(this.elem).append("svg")
    .attr("width", "100%").attr("height", "100%");
  // Create your visualization
}

destroy() {
  if (this.svg) this.svg.remove();
  super.destroy();
}
```

## Advanced Patterns

**Animation Loops:** Use `requestAnimationFrame` for animations. Store the ID and cancel in `destroy()`.

**External Elements:** For elements outside `this.elem`, add them to `this.externalElements` array for automatic cleanup.

**Random Parameters:** Add `canRandom: true` to any option to enable randomization button in UI.

## Debugging Modules

### Developer Tools

Projector window Developer Tools:

- Mac: `Cmd + Option + I`
- Windows: `Ctrl + Shift + I`

Check Console for errors and log output.

### Common Errors

| Error                                        | Cause                 | Fix                                           |
| -------------------------------------------- | --------------------- | --------------------------------------------- |
| "Module does not have an 'elem' property"    | Forgot `super()`      | Call `super(container)` first                 |
| "Cannot read property 'appendChild' of null" | `this.elem` not ready | Ensure `super()` is called before use         |
| "Method not found"                           | Name mismatch         | Match method name exactly                     |
| "Module doesn't appear in Dashboard"         | Export/name issues    | Add `export default` and verify `static name` |

## Best Practices

1. **Always use default parameters** in methods: `myMethod({ color = "#fff", size = 50 })`
2. **Validate input** where needed (hex colors, ranges, etc.)
3. **Clean up in destroy()**: Stop intervals, remove listeners, dispose Three.js resources
4. **Use descriptive names**: Clear module/method names, appropriate category ("2D", "3D", "Text")
5. **Document complex methods** with JSDoc comments (optional but helpful)

## Performance Tips

1. **Batch DOM updates** - Use `cssText` for multiple style changes
2. **Use requestAnimationFrame** - Not `setInterval` for animations
3. **Limit particle/object counts** - Cap at reasonable limits
4. **Reuse Three.js geometries** - Share geometry and materials
5. **Debounce expensive operations** - Use timeouts for resize handlers

## Testing Your Module

Test that your module appears in Dashboard dropdown, all methods/options work correctly, `autoLoad` behavior is correct, cleanup happens in `destroy()`, and there are no console errors or memory leaks.

## Further Learning

Study existing modules in `src/projector/modules/`. See [p5.js docs](https://p5js.org/reference/), [Three.js docs](https://threejs.org/docs/), and [D3.js docs](https://d3js.org/) for library reference.
