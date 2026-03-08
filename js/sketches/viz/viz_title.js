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

      p.fill(40);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(18);
      p.textStyle(p.BOLD);
      p.text("How much financial return does a degree actually provide?", 42, 46, w - 84, 32);
      p.textStyle(p.NORMAL);

      if (manager._introImg) {
        var imgX = 42;
        var imgY = 165;
        var imgW = w - 84;
        var imgH = 300;

        p.drawingContext.save();
        p.drawingContext.beginPath();
        p.drawingContext.roundRect(imgX, imgY, imgW, imgH, 16);
        p.drawingContext.clip();

        p.image(manager._introImg, imgX, imgY, imgW, imgH);

        p.drawingContext.restore();
      }

      /*
      p.fill(110);
      p.textSize(12);
      var status = (manager.scorecardRows && manager.scorecardRows.length)
        ? ("Loaded " + manager.scorecardRows.length.toLocaleString() + " rows")
        : "Loading dataset…";
      p.text(status, 42, h - 60);*/

      p.pop();
    }
  };
})();
