// viz_debt_earnings.js
(function () {
  function fmtMoney(x) {
    return "$" + Math.round(x).toLocaleString();
  }

  function clamp01(t) {
    return Math.max(0, Math.min(1, t));
  }

  function drawAxes(p, box, xTicks, yTicks, xLabel, yLabel) {
    var x0 = box.x;
    var y0 = box.y + box.h;
    var x1 = box.x + box.w;
    var y1 = box.y;

    p.stroke(0, 55);
    p.strokeWeight(1);
    p.line(x0, y0, x1, y0);
    p.line(x0, y0, x0, y1);

    p.noStroke();
    p.fill(40);
    p.textSize(12);

    for (var i = 0; i < xTicks.length; i++) {
      var t = xTicks[i].t;
      var label = xTicks[i].label;
      var x = x0 + t * box.w;

      p.stroke(0, 40);
      p.line(x, y0, x, y0 + 6);
      p.noStroke();
      p.textAlign(p.CENTER, p.TOP);
      p.text(label, x, y0 + 10);
    }

    for (var j = 0; j < yTicks.length; j++) {
      var ty = yTicks[j].t;
      var ylab = yTicks[j].label;
      var y = y0 - ty * box.h;

      p.stroke(0, 40);
      p.line(x0 - 6, y, x0, y);
      p.noStroke();
      p.textAlign(p.RIGHT, p.CENTER);
      p.text(ylab, x0 - 10, y);
    }

    p.fill(45);
    p.textSize(13);
    p.textAlign(p.CENTER, p.TOP);
    p.text(xLabel, box.x + box.w / 2, box.y + box.h + 42);

    p.push();
    p.translate(box.x - 54, box.y + box.h / 2);
    p.rotate(-p.HALF_PI);
    p.textAlign(p.CENTER, p.TOP);
    p.text(yLabel, 0, 0);
    p.pop();
  }

  function computeRegression(data) {
    var n = data.length;
    if (n < 2) return null;

    var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (var i = 0; i < n; i++) {
      var x = data[i].debt;
      var y = data[i].earn;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }

    var denom = (n * sumX2 - sumX * sumX);
    if (denom === 0) return null;

    var slope = (n * sumXY - sumX * sumY) / denom;
    var intercept = (sumY - slope * sumX) / n;
    return { slope: slope, intercept: intercept };
  }

  window.VizDebtEarnings = {
    draw: function (p, manager) {
      var w = manager.width, h = manager.height;

      p.push();
      p.noStroke();
      p.fill(255);
      p.rect(18, 18, w - 36, h - 36, 18);

      p.fill(25);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(16);
      p.text("Debt vs. Earnings", 42, 38);

      if (!manager.scorecardRows || !manager.scorecardRows.length) {
        p.fill(90);
        p.textSize(13);
        p.text("Loading dataset…", 42, 64);
        p.pop();
        return;
      }

      if (!manager._debtEarnCache) {
        var pts = [];
        var rows = manager.scorecardRows;

        for (var i = 0; i < rows.length; i++) {
          var d = rows[i];
          if (d.debt != null && d.earn10 != null) {
            pts.push({ debt: d.debt, earn: d.earn10 });
          }
        }

        var stride = Math.max(1, Math.ceil(pts.length / 900));
        var sampled = [];
        for (var k = 0; k < pts.length; k += stride) sampled.push(pts[k]);

        var minD = Infinity, maxD = -Infinity, minE = Infinity, maxE = -Infinity;
        for (var s = 0; s < sampled.length; s++) {
          var dd = sampled[s].debt;
          var ee = sampled[s].earn;
          if (dd < minD) minD = dd;
          if (dd > maxD) maxD = dd;
          if (ee < minE) minE = ee;
          if (ee > maxE) maxE = ee;
        }

        var padD = (maxD - minD) * 0.06;
        var padE = (maxE - minE) * 0.06;

        manager._debtEarnCache = {
          pts: sampled,
          minD: minD - padD,
          maxD: maxD + padD,
          minE: minE - padE,
          maxE: maxE + padE,
          reg: computeRegression(sampled)
        };
      }

      var cache = manager._debtEarnCache;
      var box = { x: 70, y: 96, w: w - 120, h: h - 190 };

      var xTicks = [];
      var yTicks = [];
      for (var t = 0; t <= 4; t++) {
        var xt = t / 4;
        var xv = cache.minD + xt * (cache.maxD - cache.minD);
        xTicks.push({ t: xt, label: fmtMoney(xv) });
      }
      for (var u = 0; u <= 4; u++) {
        var yt = u / 4;
        var yv = cache.minE + yt * (cache.maxE - cache.minE);
        yTicks.push({ t: yt, label: fmtMoney(yv) });
      }

      drawAxes(
        p,
        box,
        xTicks,
        yTicks,
        "Median Student Debt",
        "Median Earnings (10 years after entry)"
      );

      p.noStroke();
      p.fill(74, 140, 205, 110);

      var hover = null;
      var bestDist = 999999;

      for (var i2 = 0; i2 < cache.pts.length; i2++) {
        var pt = cache.pts[i2];

        var tx = (pt.debt - cache.minD) / (cache.maxD - cache.minD);
        var ty = (pt.earn - cache.minE) / (cache.maxE - cache.minE);

        var x = box.x + clamp01(tx) * box.w;
        var y = box.y + (1 - clamp01(ty)) * box.h;

        p.circle(x, y, 5);

        var dx = p.mouseX - x;
        var dy = p.mouseY - y;
        var dist2 = dx * dx + dy * dy;

        if (dist2 < bestDist && dist2 < 10 * 10) {
          bestDist = dist2;
          hover = { x: x, y: y, debt: pt.debt, earn: pt.earn };
        }
      }

      if (cache.reg) {
        var r = cache.reg;

        var xA = cache.minD;
        var yA = r.slope * xA + r.intercept;
        var xB = cache.maxD;
        var yB = r.slope * xB + r.intercept;

        var tAx = (xA - cache.minD) / (cache.maxD - cache.minD);
        var tAy = (yA - cache.minE) / (cache.maxE - cache.minE);
        var tBx = (xB - cache.minD) / (cache.maxD - cache.minD);
        var tBy = (yB - cache.minE) / (cache.maxE - cache.minE);

        var sx1 = box.x + clamp01(tAx) * box.w;
        var sy1 = box.y + (1 - clamp01(tAy)) * box.h;
        var sx2 = box.x + clamp01(tBx) * box.w;
        var sy2 = box.y + (1 - clamp01(tBy)) * box.h;

        p.stroke(232, 115, 140, 200);
        p.strokeWeight(2);
        p.line(sx1, sy1, sx2, sy2);
      }

      if (hover) {
        var msg1 = "Debt: " + fmtMoney(hover.debt);
        var msg2 = "Earnings: " + fmtMoney(hover.earn);

        var pad = 8;
        p.textSize(12);
        p.noStroke();

        var tw = Math.max(p.textWidth(msg1), p.textWidth(msg2)) + pad * 2;
        var th = 16 * 2 + pad * 2;

        var tx0 = hover.x + 12;
        var ty0 = hover.y - th - 12;

        p.fill(255);
        p.rect(tx0, ty0, tw, th, 8);

        p.stroke(0, 40);
        p.noFill();
        p.rect(tx0, ty0, tw, th, 8);

        p.noStroke();
        p.fill(20);
        p.textAlign(p.LEFT, p.TOP);
        p.text(msg1, tx0 + pad, ty0 + pad);
        p.text(msg2, tx0 + pad, ty0 + pad + 16);
      }

      p.fill(110);
      p.textSize(11);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text("Each point is an institution. Hover for a sample value.", 42, h - 30);

      p.pop();
    }
  };
})();