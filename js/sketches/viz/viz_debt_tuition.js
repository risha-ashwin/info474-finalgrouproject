// viz_debt_tuition.js
(function () {

    window.VizDebtTuition = {

      draw: function (p, manager) {

        var w = manager.width || 800;
        var h = manager.height || 600;
        var offsetX = manager.offsetX || 0;
        var offsetY = manager.offsetY || 0;
        var margin = 110;

        p.push();
        // ---- BACKGROUND ----
        p.noStroke();
        p.fill(255);
        p.rect(offsetX, offsetY, w, h);

        // ---- TITLE ----
        p.fill(0);
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(18);
        p.text("Median Student Debt vs. Average Tuition Per Year", 42, 38);

        // ---- CHECK DATA ----
        if (!manager.scorecardRows || !manager.scorecardRows.length) {
          p.fill(90);
          p.textSize(13);
          p.text("Loading dataset…", offsetX + w / 2, offsetY + 64);
          p.pop();
          return;
        }

        // ---- PREP DATA ----
        if (!manager._debtTuitionData) {
          manager._debtTuitionData = manager.scorecardRows
            .map(function (d) { return { name: d.name, debt: d.debt, avgCost: d.avgCost }; })
            .filter(function (d) { return d.debt != null && d.avgCost != null; });
        }

        var data = manager._debtTuitionData;
        if (!data.length) {
          p.pop();
          return;
        }

        // ---- AUTO SCALE ----
        var xMin = Math.min.apply(null, data.map(function (d) { return d.avgCost; })) * 0.9;
        var xMax = Math.max.apply(null, data.map(function (d) { return d.avgCost; })) * 1.1;
        var yMin = Math.min.apply(null, data.map(function (d) { return d.debt; })) * 0.9;
        var yMax = Math.max.apply(null, data.map(function (d) { return d.debt; })) * 1.1;

        // ---- AXES ----
        p.stroke(0);
        p.line(offsetX + margin, offsetY + h - margin,
               offsetX + w - margin, offsetY + h - margin);
        p.line(offsetX + margin, offsetY + h - margin,
               offsetX + margin, offsetY + margin);

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
        for (var j = 0; j <= 5; j++) {
          var yVal = yMin + j * (yMax - yMin) / 5;
          var y = p.map(yVal, yMin, yMax, offsetY + h - margin, offsetY + margin);
          p.stroke(0);
          p.line(offsetX + margin - 5, y, offsetX + margin, y);
          p.noStroke();
          p.textAlign(p.RIGHT);
          p.text("$" + Math.round(yVal), offsetX + margin - 10, y + 4);
        }

        // ---- AXIS LABELS ----
        p.textAlign(p.CENTER);
        p.textSize(14);
        p.text("Average Tuition (dollars)", offsetX + w / 2, offsetY + h - 70);
        p.push();
        p.translate(offsetX + 35, offsetY + h / 2);
        p.rotate(-p.HALF_PI);
        p.text("Median Student Debt (dollars)", 0, 0);
        p.pop();

        // ---- DRAW POINTS + HOVER DETECTION ----
        var hover = null;
        var hoverDist = 15;
        p.noStroke();
        p.fill(0, 120, 255, 180);
        for (var k = 0; k < data.length; k++) {
          var px = p.map(data[k].avgCost, xMin, xMax, offsetX + margin, offsetX + w - margin);
          var py = p.map(data[k].debt, yMin, yMax, offsetY + h - margin, offsetY + margin);
          p.ellipse(px, py, 7, 7);

          var d = p.dist(p.mouseX, p.mouseY, px, py);
          if (d < hoverDist) {
            hoverDist = d;
            hover = { x: px, y: py, name: data[k].name, avgCost: data[k].avgCost, debt: data[k].debt };
          }
        }

        // ---- REGRESSION LINE ----
        var n = data.length;
        var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
        for (var r = 0; r < n; r++) {
          sumX += data[r].avgCost;
          sumY += data[r].debt;
          sumXY += data[r].avgCost * data[r].debt;
          sumX2 += data[r].avgCost * data[r].avgCost;
          sumY2 += data[r].debt * data[r].debt;
        }
        var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        var intercept = (sumY - slope * sumX) / n;
        var corrR = (n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
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

        // ---- R VALUE ----
        p.noStroke();
        p.fill(0);
        p.textAlign(p.RIGHT, p.TOP);
        p.textSize(13);
        p.text("r = " + corrR.toFixed(2), offsetX + w - margin, offsetY + margin);

        // ---- HOVER TOOLTIP ----
        if (hover) {
          p.fill(0, 120, 255);
          p.noStroke();
          p.ellipse(hover.x, hover.y, 10, 10);

          var msg1 = hover.name || "Institution";
          var msg2 = "Tuition: $" + Math.round(hover.avgCost).toLocaleString();
          var msg3 = "Debt: $" + Math.round(hover.debt).toLocaleString();
          var tx = p.mouseX + 14;
          var ty = p.mouseY - 54;
          var pad = 8;

          p.textSize(12);
          var tw = Math.max(p.textWidth(msg1), p.textWidth(msg2), p.textWidth(msg3)) + pad * 2;
          var th = 48 + pad * 2;

          if (tx + tw > offsetX + w - 10) tx = p.mouseX - tw - 14;
          if (ty < offsetY + 10) ty = p.mouseY + 14;

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
        }

        p.pop();

      }

    };

  })();
