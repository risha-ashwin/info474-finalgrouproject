// viz_title.js
// Draw title-style screens for early active indexes (0 and 1)
// js/sketches/viz/viz_title.js
(function () {
  window.VizTitle = {
    draw: function (p, manager) {
      var w = manager.width, h = manager.height;

      p.push();
      p.noStroke();
      p.fill(255);
      p.rect(18, 18, w - 36, h - 36, 18);

      p.fill(245);
      p.rect(18, 18, w - 36, 96, 18);

      p.textAlign(p.LEFT, p.TOP);

      p.fill(90);
      p.textSize(13);

      p.fill(20);
      p.textSize(28);
      p.text("The Financial Reality\nof Higher Education", 42, 66);

      p.fill(70);
      p.textSize(14);
      p.text("Scroll the article on the left.\nThe visuals update as you read.", 42, 160);

      p.fill(110);
      p.textSize(12);
      var status = (manager.scorecardRows && manager.scorecardRows.length)
        ? ("Loaded " + manager.scorecardRows.length.toLocaleString() + " rows")
        : "Loading dataset…";
      p.text(status, 42, h - 60);

      p.pop();
    }
  };
})();
