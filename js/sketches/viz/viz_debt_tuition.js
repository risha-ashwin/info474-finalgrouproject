// viz_debt_tuition.js
(function () {

    window.VizDebtTuition = {
  
      draw: function (p, manager) {
  
        var w = manager.width || 800;
        var h = manager.height || 600;
        var offsetX = manager.offsetX || 0;
        var offsetY = manager.offsetY || 0;
        var margin = 80;
  
        p.push();
        // ---- BACKGROUND ----
        p.noStroke();
        p.fill(255);
        p.rect(offsetX, offsetY, w, h);
  
        // ---- TITLE ----
        p.fill(0);
        p.textAlign(p.CENTER);
        p.textSize(18);
        p.text("Median Student Debt vs. Average Tuition",
          offsetX + w / 2,
          offsetY + 30
        );
  
        // ---- CHECK DATA ----
        if (!manager.scorecardRows || !manager.scorecardRows.length) {
          p.fill(90);
          p.textSize(13);
          p.text("Loading dataset…", offsetX + 42, offsetY + 64);
          p.pop();
          return;
        }
  
        // ---- PREP DATA ----
        if (!manager._debtData) {
          manager._debtData = manager.scorecardRows
            .map(d => ({ debt: d.debt, avgCost: d.avgCost }))
            .filter(d => d.debt != null && d.avgCost != null);
        }
  
        var data = manager._debtData;
        if (!data.length) {
          p.pop();
          return;
        }
  
        // ---- AUTO SCALE ----
        var xMin = Math.min(...data.map(d => d.avgCost)) * 0.9;
        var xMax = Math.max(...data.map(d => d.avgCost)) * 1.1;
        var yMin = Math.min(...data.map(d => d.debt)) * 0.9;
        var yMax = Math.max(...data.map(d => d.debt)) * 1.1;
  
        // ---- AXES ----
        p.stroke(0);
        p.line(offsetX + margin, offsetY + h - margin,
               offsetX + w - margin, offsetY + h - margin); // X-axis
        p.line(offsetX + margin, offsetY + h - margin,
               offsetX + margin, offsetY + margin); // Y-axis
  
        // ---- X TICKS ----
        p.noStroke();
        p.fill(0);
        p.textSize(12);
        for (var i = 0; i <= 5; i++) {
          var val = xMin + i * (xMax - xMin) / 5;
          var x = p.map(val, xMin, xMax, offsetX + margin, offsetX + w - margin);
          p.stroke(0);
          p.line(x, offsetY + h - margin, x, offsetY + h - margin + 5);
          p.noStroke();
          p.textAlign(p.CENTER);
          p.text("$" + Math.round(val), x, offsetY + h - margin + 20);
        }
  
        // ---- Y TICKS ----
        for (var i = 0; i <= 5; i++) {
          var val = yMin + i * (yMax - yMin) / 5;
          var y = p.map(val, yMin, yMax, offsetY + h - margin, offsetY + margin);
          p.stroke(0);
          p.line(offsetX + margin - 5, y, offsetX + margin, y);
          p.noStroke();
          p.textAlign(p.RIGHT);
          p.text("$" + Math.round(val), offsetX + margin - 10, y + 4);
        }
  
        // ---- AXIS LABELS ----
        p.textAlign(p.CENTER);
        p.textSize(14);
        p.text("Average Tuition ($)", offsetX + w / 2, offsetY + h - 30);
        p.push();
        p.translate(offsetX + 40, offsetY + h / 2);
        p.rotate(-p.HALF_PI);
        p.text("Median Student Debt ($)", 0, 0);
        p.pop();
  
        // ---- DRAW POINTS ----
        p.noStroke();
        p.fill(0, 120, 255, 140);
        data.forEach(d => {
          var x = p.map(d.avgCost, xMin, xMax, offsetX + margin, offsetX + w - margin);
          var y = p.map(d.debt, yMin, yMax, offsetY + h - margin, offsetY + margin);
          p.ellipse(x, y, 5, 5);
        });
  
        // ---- REGRESSION LINE ----
        var n = data.length;
        var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        data.forEach(d => {
          sumX += d.avgCost;
          sumY += d.debt;
          sumXY += d.avgCost * d.debt;
          sumX2 += d.avgCost * d.avgCost;
        });
        var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        var intercept = (sumY - slope * sumX) / n;
        var x1 = xMin, y1 = slope * x1 + intercept;
        var x2 = xMax, y2 = slope * x2 + intercept;
  
        p.stroke(255, 0, 0);
        p.strokeWeight(2);
        p.line(
          p.map(x1, xMin, xMax, offsetX + margin, offsetX + w - margin),
          p.map(y1, yMin, yMax, offsetY + h - margin, offsetY + margin),
          p.map(x2, xMin, xMax, offsetX + margin, offsetX + w - margin),
          p.map(y2, yMin, yMax, offsetY + h - margin, offsetY + margin)
        );
  
        p.pop();
  
      }
  
    };
  
  })();