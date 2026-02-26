// sections.js
// Orchestrator: loads data, starts the p5 sketch, and wires scroll -> visual state

(function () {
  function getActiveIndex(el) {
    var a = el.getAttribute("data-active-index");
    if (a == null) a = el.getAttribute("data-step");
    var n = parseInt(a, 10);
    return isFinite(n) ? n : 0;
  }

  window.addEventListener("load", function () {
    if (typeof startP5 !== "function") {
      console.error("startP5() not found. Make sure sketch_manager.js is loaded before sections.js");
      return;
    }
    var api = startP5();

    var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
    if (!steps.length) {
      console.warn("No .step elements found.");
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      var best = null;
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (!e.isIntersecting) continue;
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      }
      if (!best) return;

      var idx = getActiveIndex(best.target);
      api.setState({ activeIndex: idx, progress: best.intersectionRatio });
    }, {
      root: null,
      threshold: [0.35, 0.5, 0.65, 0.8]
    });

    steps.forEach(function (s) { obs.observe(s); });

    api.setState({ activeIndex: getActiveIndex(steps[0]), progress: 1 });
  });
})();