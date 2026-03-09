(function () {
  function median(arr) {
    var a = arr.slice().sort(function (x, y) { return x - y; });
    if (!a.length) return null;
    var mid = Math.floor(a.length / 2);
    return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
  }

  function inside(mx, my, x, y, w, h) {
    return mx >= x && mx <= x + w && my >= y && my <= y + h;
  }

  function stats(rows) {
    var pubDebt = [], pubEarn = [];
    var priDebt = [], priEarn = [];

    for (var i = 0; i < rows.length; i++) {
      var d = rows[i];
      if (d.control === 1) { pubDebt.push(d.debt); pubEarn.push(d.earn10); }
      if (d.control === 2 || d.control === 3) { priDebt.push(d.debt); priEarn.push(d.earn10); }
    }

    return {
      public: { n: pubDebt.length, debt: median(pubDebt), earn: median(pubEarn) },
      private: { n: priDebt.length, debt: median(priDebt), earn: median(priEarn) }
    };
  }

  window.VizPublicPrivate = {
    draw: function (p, manager) {
      var w = manager.width, h = manager.height;

      p.push();
      p.noStroke();
      p.fill(255);
      p.rect(18, 18, w - 36, h - 36, 18);

      p.fill(0);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(18);
      p.text("Public vs. Private: Debt and Earnings", 42, 38);

      if (!manager.scorecardRows || !manager.scorecardRows.length) {
        p.fill(0);
        p.textSize(13);
        p.text("Loading dataset…", 42, 64);
        p.pop();
        return;
      }

      if (!manager._pubpri) manager._pubpri = stats(manager.scorecardRows);
      var s = manager._pubpri;

      p.fill(0);
      p.textSize(12);
      p.text(
        "Medians across Institution Types (Public n=" + s.public.n.toLocaleString() +
        ", Private n=" + s.private.n.toLocaleString() + ")",
        42, 62
      );

      var chartX = 42;
      var chartW = w - 84;

      var cPub = p.color(74, 140, 205);
      var cPri = p.color(232, 115, 140);

      function drawRow(y, label, pubVal, priVal, maxVal, fmt) {
        p.fill(0);
        p.textSize(13);
        p.textAlign(p.LEFT, p.TOP);
        p.text(label, chartX, y);

        var by = y + 28;
        var barH = 26;
        var gap = 10;

        var pubW = (pubVal / maxVal) * chartW;
        var priW = (priVal / maxVal) * chartW;

        p.noStroke();

        p.fill(cPub);
        p.rect(chartX, by, pubW, barH, 8);

        p.fill(cPri);
        p.rect(chartX, by + barH + gap, priW, barH, 8);

        p.fill(255);
        p.textSize(12);
        p.textAlign(p.LEFT, p.CENTER);
        p.text("Public: " + fmt(pubVal), chartX + 10, by + barH / 2);
        p.text("Private: " + fmt(priVal), chartX + 10, by + barH + gap + barH / 2);

        var hover = null;
        if (inside(p.mouseX, p.mouseY, chartX, by, pubW, barH)) hover = "Public " + label + ": " + fmt(pubVal);
        if (inside(p.mouseX, p.mouseY, chartX, by + barH + gap, priW, barH)) hover = "Private " + label + ": " + fmt(priVal);

        if (hover) {
          var tx = p.mouseX + 12, ty = p.mouseY - 12, pad = 8;
          p.push();
          p.textSize(12);
          var tw = p.textWidth(hover) + pad * 2;
          var th = 16 + pad * 2;

          p.noStroke();
          p.fill(255);
          p.rect(tx, ty, tw, th, 8);

          p.stroke(0, 40);
          p.noFill();
          p.rect(tx, ty, tw, th, 8);

          p.noStroke();
          p.fill(0);
          p.textAlign(p.LEFT, p.TOP);
          p.text(hover, tx + pad, ty + pad);
          p.pop();
        }
      }

      var debtMax = Math.max(s.public.debt, s.private.debt) * 1.12;
      var earnMax = Math.max(s.public.earn, s.private.earn) * 1.12;

      drawRow(
        110,
        "Median Student Debt",
        s.public.debt, s.private.debt, debtMax,
        function (v) { return "$" + Math.round(v).toLocaleString(); }
      );

      drawRow(
        300,
        "Median Student Earnings (10 years after entry)",
        s.public.earn, s.private.earn, earnMax,
        function (v) { return "$" + Math.round(v).toLocaleString(); }
      );

      p.fill(0);
      p.textSize(11);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text("Private includes nonprofit + for-profit.", 42, h - 30);

      p.pop();
    }
  };
})();