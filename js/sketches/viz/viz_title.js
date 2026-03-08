// viz_title.js
// Draw title-style screens for early active indexes (0 and 1)
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

      if (!manager._introImg) {
        manager._introImg = p.loadImage("js/img/intro.png");
      }

      p.fill(70);
      p.textSize(14);
      p.text("Scroll the article on the left.\nThe visuals update as you read.", 42, 160);

      if (manager._introImg) {
        var imgX = 42;
        var imgY = 120;
        var imgW = w - 84;
        var imgH = 300;

        p.image(manager._introImg, imgX, imgY, imgW, imgH);
      }

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
