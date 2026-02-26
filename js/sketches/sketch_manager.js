// sketch_manager.js

function startP5() {
  var localRenderer = window.Renderer;

  function SketchManager() {
    this.width = 800;
    this.height = 560;
    this.state = { activeIndex: 0, progress: 0 };
    this.scorecardRows = [];
    this._needsLayout = true;

    var self = this;

    function computeCanvasSize() {
      var vis = document.getElementById("vis");
      if (!vis) return { w: 900, h: 560 };
      var rect = vis.getBoundingClientRect();
      return {
        w: Math.max(520, Math.floor(rect.width)),
        h: Math.max(520, Math.floor(rect.height))
      };
    }

    var sketch = function (p) {
      p.setup = function () {
        var parent = document.getElementById("vis");
        parent.innerHTML = "";

        var s = computeCanvasSize();
        self.width = s.w;
        self.height = s.h;

        p.createCanvas(self.width, self.height).parent("vis");
        p.pixelDensity(1);
        p.frameRate(30);
      };

      p.windowResized = function () {
        var s = computeCanvasSize();
        self.width = s.w;
        self.height = s.h;
        p.resizeCanvas(self.width, self.height);
        self._needsLayout = true;
      };

      p.draw = function () {
        p.clear();
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
    localRenderer.draw(p, this, this.state.activeIndex || 0, this.state.progress || 0);
  };

  // replace old
  if (window.__sketchAPI && window.__sketchAPI.p5) {
    try { window.__sketchAPI.p5.remove(); } catch (e) {}
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
      console.error("Data load error:", err);
    });

  var api = {
    setState: manager.setState.bind(manager),
    setData: manager.setData.bind(manager),
    p5: manager.p5,
    ready: ready
  };

  api.ready.then(function () { window.__sketchAPI = api; });
  return api;
}