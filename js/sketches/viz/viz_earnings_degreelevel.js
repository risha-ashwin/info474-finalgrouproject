// viz_degree_earnings.js
(function () {

    var degreeLabels = {
      0: "Non-degree",
      1: "Certificate",
      2: "Associate",
      3: "Bachelor's",
      4: "Graduate"
    };

    function fmtMoney(x) {
      return "$" + Math.round(x).toLocaleString();
    }

    window.VizDegreeEarnings = {
      draw: function (p, manager) {

        var w = manager.width, h = manager.height;

        p.push();
        p.noStroke();
        p.fill(255);
        p.rect(18, 18, w - 36, h - 36, 18);

        p.fill(25);
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(16);
        p.text("Earnings by Highest Degree Offered (10yr after entry)", 42, 38);

        if (!manager.scorecardRows || !manager.scorecardRows.length) {
          p.fill(90);
          p.textSize(13);
          p.text("Loading dataset…", 42, 64);
          p.pop();
          return;
        }

        if (!manager._degreeEarnCache) {
          var rows = manager.scorecardRows;
          var groups = {};

          for (var i = 0; i < rows.length; i++) {
            var d = rows[i];
            if (d.degreeLevel != null && d.earn10 != null) {
              var deg = d.degreeLevel;
              if (!groups[deg]) {
                groups[deg] = { sum: 0, count: 0 };
              }
              groups[deg].sum += d.earn10;
              groups[deg].count++;
            }
          }

          // Build bars in sorted order (0, 1, 2, 3, 4)
          var bars = [];
          var maxEarn = 0;
          var keys = Object.keys(groups).map(Number).sort(function (a, b) { return a - b; });

          for (var k = 0; k < keys.length; k++) {
            var key = keys[k];
            var avg = groups[key].sum / groups[key].count;
            bars.push({
              degree: key,
              label: degreeLabels[key] || ("Level " + key),
              earn: avg,
              count: groups[key].count
            });
            if (avg > maxEarn) maxEarn = avg;
          }

          manager._degreeEarnCache = {
            bars: bars,
            maxEarn: maxEarn * 1.1
          };
        }

        var cache = manager._degreeEarnCache;

        var box = {
          x: 80,
          y: 80,
          w: w - 140,
          h: h - 220
        };

        var bars = cache.bars;
        var barWidth = box.w / bars.length * 0.6;
        var gap = box.w / bars.length;

        // Draw bars
        var hover = null;
        for (var j = 0; j < bars.length; j++) {
          var b = bars[j];
          var x = box.x + j * gap + gap * 0.2;
          var t = b.earn / cache.maxEarn;
          var barH = t * box.h;
          var y = box.y + box.h - barH;

          p.noStroke();
          p.fill(74, 140, 205);
          p.rect(x, y, barWidth, barH, 4);

          // Bar label (degree name)
          p.fill(40);
          p.textAlign(p.CENTER, p.TOP);
          p.textSize(11);
          p.text(b.label, x + barWidth / 2, box.y + box.h + 8);

          // Hover detection
          if (p.mouseX >= x && p.mouseX <= x + barWidth && p.mouseY >= y && p.mouseY <= y + barH) {
            hover = { x: x, y: y, barW: barWidth, label: b.label, earn: b.earn, count: b.count };
          }
        }

        // Axes
        p.stroke(0, 60);
        p.line(box.x, box.y + box.h, box.x + box.w, box.y + box.h);
        p.line(box.x, box.y, box.x, box.y + box.h);

        // Y-axis ticks
        p.noStroke();
        p.fill(90);
        p.textSize(10);
        p.textAlign(p.RIGHT, p.CENTER);
        for (var ti = 0; ti <= 4; ti++) {
          var tickVal = (cache.maxEarn / 4) * ti;
          var tickY = box.y + box.h - (tickVal / cache.maxEarn) * box.h;
          p.text(fmtMoney(tickVal), box.x - 8, tickY);
          p.stroke(0, 20);
          p.line(box.x, tickY, box.x + box.w, tickY);
          p.noStroke();
        }

        // Axis labels
        p.fill(45);
        p.noStroke();
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(13);
        p.text("Highest Degree Level", box.x + box.w / 2, box.y + box.h + 28);

        p.push();
        p.translate(box.x - 55, box.y + box.h / 2);
        p.rotate(-p.HALF_PI);
        p.textAlign(p.CENTER, p.TOP);
        p.text("Median Earnings (10yr after entry)", 0, 0);
        p.pop();

        // Key / Legend
        p.fill(90);
        p.textSize(10);
        p.textAlign(p.LEFT, p.TOP);
        var keyY = h - 52;
        p.text("Key:", 42, keyY);
        var keyItems = ["0 = Non-degree", "1 = Certificate", "2 = Associate", "3 = Bachelor's", "4 = Graduate"];
        var keyX = 72;
        for (var ki = 0; ki < keyItems.length; ki++) {
          p.text(keyItems[ki], keyX, keyY);
          keyX += p.textWidth(keyItems[ki]) + 14;
        }

        // Hover tooltip
        if (hover) {
          var msg1 = hover.label;
          var msg2 = "Avg Earnings: " + fmtMoney(hover.earn);
          var msg3 = "Institutions: " + hover.count.toLocaleString();
          var tx = p.mouseX + 12, ty = p.mouseY - 50, pad = 8;

          p.push();
          p.textSize(12);
          var tw = Math.max(p.textWidth(msg1), p.textWidth(msg2), p.textWidth(msg3)) + pad * 2;
          var th = 48 + pad * 2;

          p.noStroke();
          p.fill(255);
          p.rect(tx, ty, tw, th, 8);
          p.stroke(0, 40);
          p.noFill();
          p.rect(tx, ty, tw, th, 8);

          p.noStroke();
          p.fill(20);
          p.textAlign(p.LEFT, p.TOP);
          p.text(msg1, tx + pad, ty + pad);
          p.text(msg2, tx + pad, ty + pad + 16);
          p.text(msg3, tx + pad, ty + pad + 32);
          p.pop();
        }

        p.pop();
      }
    };

  })();
