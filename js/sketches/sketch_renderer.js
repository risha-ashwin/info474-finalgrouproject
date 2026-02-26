// sketch_renderer.js

// Responsible for rendering the main visualization based on the current active index
function startP5() {

  var localRenderer = window.Renderer;

  function SketchManager() {
    this.width = 900;
    this.height = 560;

    this.canvasWidth = this.width;
    this.canvasHeight = this.height;

    this.state = { activeIndex: 0, progress: 0 };

    this.scorecardRows = [];

    this._needsLayout = true;

    var self = this;

    function computeCanvasSize() {
      var vis = document.getElementById("vis");
      if (!vis) return { w: self.canvasWidth, h: self.canvasHeight };

      var rect = vis.getBoundingClientRect();
      var w = Math.max(520, Math.floor(rect.width));
      var h = Math.max(520, Math.floor(rect.height));
      return { w: w, h: h };
    }

    var sketch = function (p) {
      p.setup = function () {
        var parent = document.getElementById("vis");
        parent.innerHTML = "";

        var s = computeCanvasSize();
        self.canvasWidth = s.w;
        self.canvasHeight = s.h;
        self.width = s.w;
        self.height = s.h;

        p.createCanvas(self.canvasWidth, self.canvasHeight).parent("vis");
        p.noStroke();
        p.frameRate(30);
      };

      p.windowResized = function () {
        var s = computeCanvasSize();
        self.canvasWidth = s.w;
        self.canvasHeight = s.h;
        self.width = s.w;
        self.height = s.h;

        p.resizeCanvas(self.canvasWidth, self.canvasHeight);
        self._needsLayout = true;
      };

      p.draw = function () {
        p.background(255);
        self.draw(p);
      };
    };

    this.p5 = new p5(sketch);
  }

  SketchManager.prototype.setState = function (s) {
    if (s.activeIndex !== undefined) this.state.activeIndex = s.activeIndex;
    if (s.progress !== undefined) this.state.progress = s.progress;
  };

  SketchManager.prototype.setData = function (newData) {
    if (localRenderer && typeof localRenderer.setData === "function") {
      return localRenderer.setData(this, newData);
    }
    return Promise.resolve();
  };

  SketchManager.prototype.draw = function (p) {
    var ai = this.state.activeIndex || 0;
    var progress = this.state.progress || 0;
    localRenderer.draw(p, this, ai, progress);
  };

  if (window.__sketchAPI && window.__sketchAPI.p5) {
    try { window.__sketchAPI.p5.remove(); } catch (e) { }
    window.__sketchAPI = null;
  }

  var manager = new SketchManager();

  var ready = ScorecardLoader
    .loadInstitutionClean("data/institution_clean.csv")
    .then(function (rows) {
      manager.scorecardRows = rows;

      if (window.VizMapDebt && typeof window.VizMapDebt.init === "function") {
        return window.VizMapDebt.init(manager);
      }
    })
    .catch(function (err) {
      console.error("Data/map init error:", err);
    });

  var api = {
    setState: manager.setState.bind(manager),
    setData: manager.setData.bind(manager),
    p5: manager.p5,
    ready: ready
  };

  api.ready.then(function () {
    window.__sketchAPI = api;
  });

  return api;
}