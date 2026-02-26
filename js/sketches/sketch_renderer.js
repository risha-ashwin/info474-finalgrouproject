// sketch_renderer.js

// Responsible for rendering the main visualization based on the current active index
(function () {
  window.Renderer = {

    setData: function (manager) {
      return Promise.resolve();
    },

    draw: function (p, manager, ai, progress) {

      if (ai === 0) {
        window.VizTitle.draw(p, manager, ai, progress);
        return;
      }

      if (ai === 1) {
        window.VizMapDebt.draw(p, manager, ai, progress);
        return;
      }

      if (ai === 2) {
        window.VizPublicPrivate.draw(p, manager, ai, progress);
        return;
      }

      // Placeholder for future visuals
      p.push();
      p.fill(50);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(16);
      p.text("Visualization coming soon…", manager.width / 2, manager.height / 2);
      p.pop();
    }
  };
})();