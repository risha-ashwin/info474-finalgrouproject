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

    var api = window.__sketchAPI || startP5();

    var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
    if (!steps.length) {
      console.warn("No .step elements found.");
      return;
    }

    function setActiveFrom(el, ratio) {
      var idx = getActiveIndex(el);
      api.setState({ activeIndex: idx, progress: ratio || 1 });
    }

    var obs = new IntersectionObserver(function (entries) {
      var best = null;
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (!e.isIntersecting) continue;
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      }
      if (!best) return;
      setActiveFrom(best.target, best.intersectionRatio);
    }, {
      root: null,
      threshold: [0.25, 0.35, 0.5, 0.65, 0.8]
    });

    steps.forEach(function (s) { obs.observe(s); });

    setActiveFrom(steps[0], 1);

    if (api.ready && typeof api.ready.then === "function") {
      api.ready.catch(function (err) { console.error("API ready error:", err); });
    }
  });
})();