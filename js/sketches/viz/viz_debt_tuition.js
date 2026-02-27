// viz_debt_tuition.js
(function () {

    window.VizDebtTuition = {

        draw: function (p, manager) {
            var w = manager.width || 800;
            var h = manager.height || 600;
            var margin = 80;

            // ---- BACKGROUND & TITLE ----
            p.push();
            p.noStroke();
            p.fill(255);
            p.rect(18, 18, w - 36, h - 36, 18);

            p.fill(25);
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(16);
            p.text("Student Debt vs Annual Average Tuition", 42, 38);

            // ---- LOADING CHECK ----
            if (!manager.scorecardRows || !manager.scorecardRows.length) {
                p.fill(90);
                p.textSize(13);
                p.text("Loading dataset…", 42, 64);
                p.pop();
                return;
            }

            // ---- EXTRACT DATA ----
            if (!manager._debtData) {
                manager._debtData = manager.scorecardRows
                    .map(d => ({ debt: d.debt, tuition: d.avgCost })) // map avgCost → tuition
                    .filter(d => d.debt != null && d.tuition != null); // check 'tuition', not 'avgCost'
            }

            var data = manager._debtData;
            if (!data.length) {
                p.fill(90);
                p.textSize(13);
                p.text("No valid data to display", 42, 64);
                p.pop();
                return;
            }

            // ---- AUTO SCALE ----
            var xMin = Math.min(...data.map(d => d.tuition)) * 0.9;
            var xMax = Math.max(...data.map(d => d.tuition)) * 1.1;
            var yMin = Math.min(...data.map(d => d.debt)) * 0.9;
            var yMax = Math.max(...data.map(d => d.debt)) * 1.1;

            // ---- AXES ----
            p.stroke(0);
            p.line(margin, h - margin, w - margin, h - margin); // X axis
            p.line(margin, h - margin, margin, margin);           // Y axis

            // ---- X TICKS & LABEL ----
            p.noStroke();
            p.fill(0);
            p.textSize(12);
            for (var i = 0; i <= 5; i++) {
                var val = xMin + i * (xMax - xMin) / 5;
                var x = p.map(val, xMin, xMax, margin, w - margin);
                p.stroke(0);
                p.line(x, h - margin, x, h - margin + 5);
                p.noStroke();
                p.textAlign(p.CENTER);
                p.text("$" + Math.round(val), x, h - margin + 20);
            }
            p.textSize(14);
            p.textAlign(p.CENTER);
            p.text("Average Tuition ($)", w / 2, h - 30);

            // ---- Y TICKS & LABEL ----
            for (var i = 0; i <= 5; i++) {
                var val = yMin + i * (yMax - yMin) / 5;
                var y = p.map(val, yMin, yMax, h - margin, margin);
                p.stroke(0);
                p.line(margin - 5, y, margin, y);
                p.noStroke();
                p.textAlign(p.RIGHT);
                p.text("$" + Math.round(val), margin - 10, y + 4);
            }
            p.push();
            p.translate(40, h / 2);
            p.rotate(-p.HALF_PI);
            p.textAlign(p.CENTER);
            p.text("Median Student Debt ($)", 0, 0);
            p.pop();

            // ---- DRAW POINTS ----
            p.noStroke();
            p.fill(0, 120, 255, 140);
            data.forEach(d => {
                var x = p.map(d.tuition, xMin, xMax, margin, w - margin);
                var y = p.map(d.debt, yMin, yMax, h - margin, margin);
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
                p.map(x1, xMin, xMax, margin, w - margin),
                p.map(y1, yMin, yMax, h - margin, margin),
                p.map(x2, xMin, xMax, margin, w - margin),
                p.map(y2, yMin, yMax, h - margin, margin)
            );

            p.pop();
        }
    };

})();