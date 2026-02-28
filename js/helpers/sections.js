// sections.js
// Orchestrator: loads data, starts the p5 sketch, and wires scroll -> visual state

(function () {
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

    // Trigger-point scrollytelling: the step whose top edge is at or above the
    // trigger line (40% from the top of the viewport) becomes the active step.
    // This works reliably in both scroll directions regardless of step height.
    var lastIdx = -1;

    function update() {
      var triggerY = window.innerHeight * 0.4;
      var best = null;

      // Walk backwards — the last step whose top is above the trigger wins
      for (var i = steps.length - 1; i >= 0; i--) {
        if (steps[i].getBoundingClientRect().top <= triggerY) {
          best = steps[i];
          break;
        }
      }

      if (!best) best = steps[0];

      var idx = parseInt(best.getAttribute("data-active-index") || "0", 10);
      var rect = best.getBoundingClientRect();
      var progress = Math.max(0, Math.min(1, (triggerY - rect.top) / (rect.height || 1)));

      if (idx !== lastIdx) {
        console.log("[sections] activeIndex changed:", lastIdx, "→", idx);
        lastIdx = idx;
      }

      api.setState({ activeIndex: idx, progress: progress });
    }

    // Throttle to one update per animation frame
    var rafPending = false;
    function onScroll() {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(function () {
        rafPending = false;
        update();
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update(); // set initial state

    if (api.ready && typeof api.ready.then === "function") {
      api.ready.catch(function (err) { console.error("API ready error:", err); });
    }
  });
})();