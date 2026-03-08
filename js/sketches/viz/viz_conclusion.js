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

      if (manager._conclusionImg) {
        p.image(manager._conclusionImg, 18, 18, w - 36, h - 36);
      }

      p.pop();
    }
  };
})();