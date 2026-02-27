// viz_debt_tuition_scorecard.js
(function () {

    window.VizDebtTuition = {

        draw: function (p, manager) {

            if (!manager.scorecardRows || !manager.scorecardRows.length) {
                // Data isn’t loaded yet
                p.push();
                p.fill(90);
                p.textSize(13);
                p.text("Loading dataset…", 42, 64);
                p.pop();
                return;
            }

            // ---- EXTRACT RELEVANT FIELDS ----
            if (!manager._debtData) {
                manager._debtData = manager.scorecardRows
                    .map(d => ({ debt: d.debt, tuition: d.avgCost }))
                    .filter(d => d.debt != null && d.tuition != null);
            }

            var data = manager._debtData;
            if (!data.length) return;

            // ---- SETUP DIMENSIONS ----
            p.push();

            var offsetX = manager.offsetX || 0;
            var offsetY = manager.offsetY || 0;
            var width = manager.width || 800;
            var height = manager.height || 600;
            var margin = 80;

            // ---- AUTO SCALE ----
            var xMin = Math.min(...data.map(d => d.tuition)) * 0.9;
            var xMax = Math.max(...data.map(d => d.tuition)) * 1.1;
            var yMin = Math.min(...data.map(d => d.debt)) * 0.9;
            var yMax = Math.max(...data.map(d => d.debt)) * 1.1;

            // ---- BACKGROUND ----
            p.noStroke();
            p.fill(255);
            p.rect(offsetX, offsetY, width, height);

            // ---- TITLE ----
            p.fill(0);
            p.textAlign(p.CENTER);
            p.textSize(18);
            p.text("Median Student Debt vs. Average Tuition",
                offsetX + width / 2,
                offsetY + 30
            );

            // ---- AXES ----
            p.stroke(0);
            p.line(offsetX + margin, offsetY + height - margin,
                   offsetX + width - margin, offsetY + height - margin);
            p.line(offsetX + margin, offsetY + height - margin,
                   offsetX + margin, offsetY + margin);

            // ---- X TICKS ----
            p.noStroke();
            p.fill(0);
            p.textSize(12);
            for (var i = 0; i <= 5; i++) {
                var val = xMin + i * (xMax - xMin) / 5;
                var x = p.map(val, xMin, xMax, offsetX + margin, offsetX + width - margin);
                p.stroke(0);
                p.line(x, offsetY + height - margin, x, offsetY + height - margin + 5);
                p.noStroke();
                p.textAlign(p.CENTER);
                p.text("$" + Math.round(val), x, offsetY + height - margin + 20);
            }

            // ---- Y TICKS ----
            for (var i = 0; i <= 5; i++) {
                var val = yMin + i * (yMax - yMin) / 5;
                var y = p.map(val, yMin, yMax, offsetY + height - margin, offsetY + margin);
                p.stroke(0);
                p.line(offsetX + margin - 5, y, offsetX + margin, y);
                p.noStroke();
                p.textAlign(p.RIGHT);
                p.text("$" + Math.round(val), offsetX + margin - 10, y + 4);
            }

            // ---- AXIS LABELS ----
            p.textAlign(p.CENTER);
            p.textSize(14);
            p.text("Average Tuition ($)", offsetX + width / 2, offsetY + height - 30);
            p.push();
            p.translate(offsetX + 40, offsetY + height / 2);
            p.rotate(-p.HALF_PI);
            p.text("Median Student Debt ($)", 0, 0);
            p.pop();

            // ---- DRAW POINTS ----
            p.noStroke();
            p.fill(0, 120, 255, 140);
            data.forEach(d => {
                var x = p.map(d.tuition, xMin, xMax, offsetX + margin, offsetX + width - margin);
                var y = p.map(d.debt, yMin, yMax, offsetY + height - margin, offsetY + margin);
                p.ellipse(x, y, 5, 5);
            });

            // ---- REGRESSION LINE ----
            var n = data.length;
            var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
            data.forEach(d => {
                sumX += d.tuition;
                sumY += d.debt;
                sumXY += d.tuition * d.debt;
                sumX2 += d.tuition * d.tuition;
            });
            var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            var intercept = (sumY - slope * sumX) / n;
            var x1 = xMin, y1 = slope * x1 + intercept;
            var x2 = xMax, y2 = slope * x2 + intercept;

            p.stroke(255, 0, 0);
            p.strokeWeight(2);
            p.line(
                p.map(x1, xMin, xMax, offsetX + margin, offsetX + width - margin),
                p.map(y1, yMin, yMax, offsetY + height - margin, offsetY + margin),
                p.map(x2, xMin, xMax, offsetX + margin, offsetX + width - margin),
                p.map(y2, yMin, yMax, offsetY + height - margin, offsetY + margin)
            );

            p.pop();
        }
    };

})();