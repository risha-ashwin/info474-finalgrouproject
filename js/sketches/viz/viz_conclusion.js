(function () {
  window.VizConclusion = {
    draw: function (p, manager) {
      var w = manager.width, h = manager.height;

      if (!manager._conclusionImg) {
        manager._conclusionImg = p.loadImage("js/img/conclusion.jpeg");
      }

      p.push();
      p.noStroke();

      p.fill(255);
      p.rect(18, 18, w - 36, h - 36, 18);

      p.fill(245);
      p.rect(18, 18, w - 36, 96, 18);

      p.fill(40);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(18);
      p.textStyle(p.BOLD);
      p.text("Higher education can open doors, but the financial outcomes are not the same for everyone.", 42, 46, w - 84, 80);
      p.textStyle(p.NORMAL);

      if (manager._conclusionImg) {
        var imgX = 42;
        var imgY = 165;
        var imgW = w - 84;
        var imgH = 300;

        p.drawingContext.save();
        p.drawingContext.beginPath();
        p.drawingContext.roundRect(imgX, imgY, imgW, imgH, 16);
        p.drawingContext.clip();

        p.image(manager._conclusionImg, imgX, imgY, imgW, imgH);
        p.drawingContext.restore();
      }

      p.pop();
    }
  };
})();