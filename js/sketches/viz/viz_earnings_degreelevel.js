// viz_degree_earnings.js
(function () {

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
        p.text("Earnings by Highest Degree Offered", 42, 38);
  
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
  
          var bars = [];
          var maxEarn = 0;
  
          for (var key in groups) {
  
            var avg = groups[key].sum / groups[key].count;
  
            bars.push({
              degree: key,
              earn: avg
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
          y: 100,
          w: w - 140,
          h: h - 200
        };
  
        var bars = cache.bars;
        var barWidth = box.w / bars.length * 0.6;
        var gap = box.w / bars.length;
  
        p.fill(74, 140, 205);
        p.noStroke();
  
        for (var j = 0; j < bars.length; j++) {
  
          var b = bars[j];
  
          var x = box.x + j * gap + gap * 0.2;
  
          var t = b.earn / cache.maxEarn;
  
          var barH = t * box.h;
  
          var y = box.y + box.h - barH;
  
          p.rect(x, y, barWidth, barH, 4);
  
          p.fill(40);
          p.textAlign(p.CENTER, p.TOP);
          p.textSize(12);
          p.text(b.degree, x + barWidth / 2, box.y + box.h + 8);
  
          p.fill(74, 140, 205);
        }
  
        p.stroke(0, 60);
        p.line(box.x, box.y + box.h, box.x + box.w, box.y + box.h);
  
        p.line(box.x, box.y, box.x, box.y + box.h);
  
        p.fill(45);
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(13);
        p.text("Highest Degree Level", box.x + box.w / 2, box.y + box.h + 40);
  
        p.push();
        p.translate(box.x - 50, box.y + box.h / 2);
        p.rotate(-p.HALF_PI);
        p.textAlign(p.CENTER, p.TOP);
        p.text("Median Earnings (10 years after entry)", 0, 0);
        p.pop();
  
        p.fill(110);
        p.textSize(11);
        p.textAlign(p.LEFT, p.BOTTOM);
        p.text("Average earnings grouped by highest degree offered.", 42, h - 30);
  
        p.pop();
      }
    };
  
  })();