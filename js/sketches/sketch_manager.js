// sketch_manager.js
function startP5() {
  var localRenderer = window.Renderer;

  function SketchManager() {
    // Canvas dimensions
    this.width = 900;
    this.height = 560;
    this.canvasWidth = this.width;
    this.canvasHeight = this.height;

    this.state = { activeIndex: 0, progress: 0 };

    // Hold CSV rows for all visualizations
    this.scorecardRows = [];
    this.data = [];

    var self = this;

    // ---- Compute canvas size based on #vis container ----
    function computeCanvasSize() {
      var vis = document.getElementById("vis");
      if (!vis) return { w: self.canvasWidth, h: self.canvasHeight };
      var rect = vis.getBoundingClientRect();
      return {
        w: Math.max(520, Math.floor(rect.width)),
        h: Math.max(520, Math.floor(rect.height))
      };
    }

    // ---- p5 sketch ----
    var sketch = function(p) {
      p.setup = function() {
        var parent = document.getElementById("vis");
        parent.innerHTML = "";

        var s = computeCanvasSize();
        self.width = s.w;
        self.height = s.h;
        self.canvasWidth = s.w;
        self.canvasHeight = s.h;

        p.createCanvas(self.canvasWidth, self.canvasHeight).parent("vis");
        p.pixelDensity(1);
        p.noStroke();
        p.frameRate(30);
      };

      p.windowResized = function() {
        var s = computeCanvasSize();
        self.width = s.w;
        self.height = s.h;
        self.canvasWidth = s.w;
        self.canvasHeight = s.h;

        p.resizeCanvas(self.canvasWidth, self.canvasHeight);
        self._needsLayout = true;
      };

      p.draw = function() {
        p.background(255);

        // Only draw if renderer exists
        if (localRenderer && localRenderer.draw) {
          try {
            self.draw(p);
          } catch (err) {
            console.error("Draw error:", err);
            p.fill(180);
            p.textSize(13);
            p.textAlign(p.LEFT, p.TOP);
            p.text("Render error: " + (err.message || err), 30, 30);
            p.text("Stack: " + String(err.stack || "").slice(0, 200), 30, 50);
          }
        }
      };
    };

    this.p5 = new p5(sketch);
  }

  // ---- SketchManager methods ----
  SketchManager.prototype.setState = function(s) {
    if (s.activeIndex !== undefined) this.state.activeIndex = s.activeIndex;
    if (s.progress !== undefined) this.state.progress = s.progress;
  };

  SketchManager.prototype.setData = function() {
    return localRenderer.setData(this);
  };

  SketchManager.prototype.draw = function(p) {
    var ai = this.state.activeIndex || 0;
    var progress = this.state.progress || 0;
    localRenderer.draw(p, this, ai, progress);
  };

  // ---- Clean up previous p5 instance if exists ----
  if (window.__sketchAPI && window.__sketchAPI.p5) {
    try { window.__sketchAPI.p5.remove(); } catch (e) {}
    window.__sketchAPI = null;
  }

  // ---- Initialize manager ----
  var manager = new SketchManager();
  var ready = manager.setData();

  var api = {
    setState: manager.setState.bind(manager),
    setData: manager.setData.bind(manager),
    p5: manager.p5,
    ready: ready
  };

  // Expose globally
  Promise.resolve(ready).then(function() { window.__sketchAPI = api; });
  return api;
}