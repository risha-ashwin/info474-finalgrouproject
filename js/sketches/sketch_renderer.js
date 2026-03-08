// sketch_renderer.js
(function () {
  window.Renderer = {
    setData: function (manager) {
      if (manager._dataReadyPromise) return manager._dataReadyPromise;

      // Start the map's TopoJSON + state debt CSV fetch immediately — it doesn't need institution CSV
      if (window.VizMapDebt && typeof window.VizMapDebt.init === "function") {
        window.VizMapDebt.init(manager);
      }

      manager._dataReadyPromise = ScorecardLoader
        .loadInstitutionClean("data/institution_clean_final.csv")
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

    draw: function (p, manager, ai, progress) {
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

      if (ai === 0 && window.VizTitle) return window.VizTitle.draw(p, manager, ai, progress);
      if (ai === 1 && window.VizMapDebt) return window.VizMapDebt.draw(p, manager, ai, progress);
      if (ai === 2 && window.VizPublicPrivate) return window.VizPublicPrivate.draw(p, manager, ai, progress);
      if (ai === 3 && window.VizDebtEarnings) return window.VizDebtEarnings.draw(p, manager, ai, progress);
      if (ai === 4 && window.VizDebtTuition) return window.VizDebtTuition.draw(p, manager, ai, progress);
      if (ai === 5 && window.VizTuitionEarnings) return window.VizTuitionEarnings.draw(p, manager, ai, progress);
      if (ai === 6 && window.VizDegreeEarnings) return window.VizDegreeEarnings.draw(p, manager, ai, progress);
      if (ai === 7 && window.VizConclusion) return window.VizConclusion.draw(p, manager, ai, progress);
      
      p.push();
      p.fill(50);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(16);
      p.text("Visualization coming soon…", manager.width / 2, manager.height / 2);
      p.pop();
    }
  };
})();
