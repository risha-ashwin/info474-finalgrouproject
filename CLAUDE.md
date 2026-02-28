# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An interactive scrollytelling visualization of student debt and earnings data ("The Financial Reality of Higher Education"), built for INFO 474. Deployed as a static GitHub Pages site on the `gh-pages` branch.

## Running Locally

No build step required. Serve the repo root with a static server:

```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

Deploy by committing to the `gh-pages` branch — GitHub Pages serves automatically.

## Architecture

**Data flow:**
1. `scorecard_loader.js` fetches and parses `data/institution_clean.csv` (4,731 institutions with fields: `name`, `state`, `control`, `debt`, `earn10`, `avgCost`)
2. `sections.js` initializes the p5.js sketch via `startP5()` and wires scroll events to `api.setState()`
3. `scroller.js` computes `activeIndex` and `progress` using IntersectionObserver
4. `sketch_manager.js` owns the p5 lifecycle and exposes the sketch API
5. `sketch_renderer.js` dispatches each p5 frame to the correct viz module based on `activeIndex`

**Script load order in `index.html` must be:**
```
helpers (scorecard_loader, etc.) → viz modules → sketch_renderer.js → sketch_manager.js → scroller.js → visual_controller.js → sections.js
```

**Active index → visualization mapping:**
| activeIndex | Viz module | Description |
|---|---|---|
| 0 | `viz_title.js` | Title screen |
| 1 | `viz_map_debt.js` | US choropleth map of median debt by state |
| 2 | `viz_public_private.js` | Bar charts: public vs. private institutions |
| 3 | `viz_debt_tuition.js` | Scatter: median debt vs. average tuition |

Sections 4–5 in `index.html` link out to external p5.js editor sketches rather than embedding a viz module.

## Adding a New Visualization

1. Create `js/sketches/viz/viz_newname.js` exposing:
   ```js
   window.VizNewName = {
     init: function(manager) { /* optional */ },
     draw: function(p, manager, activeIndex, progress) { /* draw */ }
   };
   ```
2. Load the file before `sketch_renderer.js` in `index.html`
3. Add a `case` in `sketch_renderer.js` switch statement
4. Add a `.step` div with `data-active-index` in `index.html`

## Key Implementation Details

- **Map hit testing** (`viz_map_debt.js`): Uses a hidden offscreen p5 canvas (`manager._hit`) where each state is filled with a unique RGB color ID. On `mousemove`, the pixel color is sampled to identify the hovered state — avoids polygon math.
- **Computed aggregates** are cached on the `manager` object (e.g., `manager._debtByState`) to avoid per-frame recalculation.
- **Sketch API** returned by `startP5()` and exposed as `window.__sketchAPI`: `setState({activeIndex, progress})`, `setData(data)`, `ready` (Promise).
- **Configuration** via `window.ScrollDemoConfig` in `index.html`: keys include `dataUrl`, `containerSelector`, `stepSelector`, `visSelector`, `showAt`, `trigger`.

## Libraries (CDN, no bundler)

- **p5.js** 1.6.0 — rendering engine for all visualizations
- **TopoJSON Client** 3 — geographic data format
- **D3-geo** 3 — map projections and path rendering
- **Bootstrap** — CSS utilities (bundled locally in `css/`)
