// sketch_renderer.js

// Responsible for rendering the main visualization based on the current active index
(function () {
  window.Renderer = {
    setData: function () {
      return Promise.resolve();
    },

    draw: function (p, manager, ai, progress) {
      p.background(255);

      if (ai === 0) return window.VizTitle.draw(p, manager, ai, progress);
      if (ai === 1) return window.VizMapDebt.draw(p, manager, ai, progress);
      if (ai === 2) return window.VizPublicPrivate.draw(p, manager, ai, progress);

      // placeholder
      p.push();
      p.fill(20);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(16);
      p.text("More visualizations coming next…", manager.width / 2, manager.height / 2);
      p.pop();
    }
  };
})();