// sketch_renderer.js
(function () {
  window.Renderer = {
    setData: function (manager) {
      if (manager._dataReadyPromise) return manager._dataReadyPromise;

      manager._dataReadyPromise = ScorecardLoader
        .loadInstitutionClean("data/institution_clean.csv")
        .then(function (rows) {
          manager.scorecardRows = rows;
          manager.data = rows;

          if (window.VizMapDebt && typeof window.VizMapDebt.init === "function") {
            return window.VizMapDebt.init(manager);
          }
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

      if (ai === 0) return window.VizTitle.draw(p, manager, ai, progress);
      if (ai === 1) return window.VizMapDebt.draw(p, manager, ai, progress);
      if (ai === 2) return window.VizPublicPrivate.draw(p, manager, ai, progress);
      if (ai === 3) return window.VizDebtEarnings.draw(p, manager, ai, progress);

      // Visual 4 placeholder
      if (ai === 4) {
        if (window.VizDebtTuition && typeof window.VizDebtTuition.draw === "function") {
          return window.VizDebtTuition.draw(p, manager, ai, progress);
        }
      }

      // Visual 5 placeholder
      if (ai === 5) {
        p.push();
        p.fill(50);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(16);
        p.text("Visualization 5 coming soon…", manager.width / 2, manager.height / 2);
        p.pop();
        return;
      }

      // Visual 6 placeholder
      if (ai === 6) {
        p.push();
        p.fill(50);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(16);
        p.text("Visualization 6 coming soon…", manager.width / 2, manager.height / 2);
        p.pop();
        return;
      }

      p.push();
      p.fill(50);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(16);
      p.text("Visualization coming soon…", manager.width / 2, manager.height / 2);
      p.pop();
    }
  };
})();