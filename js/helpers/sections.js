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

    // Captions for the explanation box below the visualization
    var captions = {
      0: "This article uses data from the U.S. Department of Education College Scorecard to explore the financial realities of higher education.",
      1: "This choropleth map shows median student debt by state. Darker shades indicate higher median debt levels among institutions in that state.",
      2: "Median debt and earnings are compared between public and private institutions. Private includes both nonprofit and for-profit schools.",
      3: "Each point represents an institution. The x-axis shows median student debt and the y-axis shows median earnings 10 years after entry.",
      4: "Each point represents an institution. The x-axis shows average tuition and the y-axis shows median student debt. The red line is a linear regression.",
      5: "Each point represents an institution. The x-axis shows average tuition and the y-axis shows median earnings 10 years after entry.",
      6: "Bars show average of median earnings grouped by the highest degree level an institution offers (0 = Non-degree, 1 = Certificate, 2 = Associate, 3 = Bachelor\u2019s, 4 = Graduate).",
      7: ""
    };

    var captionEl = document.getElementById("vis-caption");

    var lastIdx = -1;

    function update() {
      var triggerY = window.innerHeight * 0.4;
      var best = null;

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
        lastIdx = idx;
        if (captionEl) {
          captionEl.textContent = captions[idx] || "";
        }
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
