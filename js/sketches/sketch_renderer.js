// sketch_renderer.js
// Responsible for rendering the main visualization based on the current active index
(function () {
  window.Renderer = {

    // Load the dataset and initialize any sketches that need init()
    setData: function (manager) {
      if (manager._dataReadyPromise) return manager._dataReadyPromise;

      // Start the map's TopoJSON fetch immediately — it doesn't need the CSV
      if (window.VizMapDebt && typeof window.VizMapDebt.init === "function") {
        window.VizMapDebt.init(manager);
      }

      manager._dataReadyPromise = ScorecardLoader
        .loadInstitutionClean("data/institution_clean.csv")
        .then(function (rows) {
          manager.scorecardRows = rows;
          manager.data = rows;
          manager._needsLayout = true;
          console.log("Scorecard loaded:", rows.length, "rows");

          if (window.VizPublicPrivate && typeof window.VizPublicPrivate.init === "function") {
            window.VizPublicPrivate.init(manager);
          }
          if (window.VizDebtTuition && typeof window.VizDebtTuition.init === "function") {
            window.VizDebtTuition.init(manager);
          }

          return rows;
        })
        .catch(function (err) {
          console.error("Renderer.setData failed:", err);
          manager._dataError = String(err);
        });

      return manager._dataReadyPromise;
    },

    // Draw the active visualization based on the current step index (ai)
    draw: function (p, manager, ai, progress) {
      // If data failed, show the error in-canvas
      if (manager._dataError) {
        p.push();
        p.background(255);
        p.fill(30);
        p.textSize(14);
        p.textAlign(p.LEFT, p.TOP);
        p.text("Data error:\n" + manager._dataError, 30, 30);
        p.pop();
        return;
      }

      // Step-based rendering
      switch (ai) {
        case 0:
          if (window.VizTitle && typeof window.VizTitle.draw === "function") {
            window.VizTitle.draw(p, manager, ai, progress);
          }
          break;
        case 1:
          if (window.VizMapDebt && typeof window.VizMapDebt.draw === "function") {
            window.VizMapDebt.draw(p, manager, ai, progress);
          }
          break;
        case 2:
          if (window.VizPublicPrivate && typeof window.VizPublicPrivate.draw === "function") {
            window.VizPublicPrivate.draw(p, manager, ai, progress);
          }
          break;
        case 3:
          if (window.VizDebtTuition && typeof window.VizDebtTuition.draw === "function") {
            window.VizDebtTuition.draw(p, manager, ai, progress);
          }
          break;
        default:
          // Placeholder for future visualizations
          p.push();
          p.fill(50);
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(16);
          p.text("Visualization coming soon…", p.width / 2, p.height / 2);
          p.pop();
      }
    }

  };
})();