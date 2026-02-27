// viz_debt_tuition.js
(function () {

    window.VizDebtTuition = {

        draw: function (p, manager) {

            // ---- LOAD CSV ONLY ONCE ----
            if (!manager._debtDataLoaded) {

                p.loadTable("../data/institution_clean.csv", "csv", "header",
                    function (table) {

                        var rows = table.getRows();
                        var cleaned = [];

                        for (var i = 0; i < rows.length; i++) {

                            var debt = parseFloat(rows[i].get("dbt_mean"));
                            var tuition = parseFloat(rows[i].get("average_cost"));

                            if (!isNaN(debt) && !isNaN(tuition)) {
                                cleaned.push({
                                    debt: debt,
                                    tuition: tuition
                                });
                            }
                        }

                        manager._debtData = cleaned;
                        manager._debtDataLoaded = true;

                        console.log("Loaded rows:", cleaned.length);
                    }
                );

                return; // wait until data loads
            }

            var data = manager._debtData;
            if (!data || data.length === 0) return;

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

            p.noStroke();
            p.fill(0);
            p.textSize(12);

            // ---- X TICKS ----
            for (var i = 0; i <= 5; i++) {
                var val = xMin + i * (xMax - xMin) / 5;
                var x = p.map(val, xMin, xMax,
                    offsetX + margin,
                    offsetX + width - margin
                );

                p.stroke(0);
                p.line(x, offsetY + height - margin, x, offsetY + height - margin + 5);
                p.noStroke();
                p.textAlign(p.CENTER);
                p.text("$" + Math.round(val), x, offsetY + height - margin + 20);
            }

            // ---- Y TICKS ----
            for (var i = 0; i <= 5; i++) {
                var val = yMin + i * (yMax - yMin) / 5;
                var y = p.map(val, yMin, yMax,
                    offsetY + height - margin,
                    offsetY + margin
                );

                p.stroke(0);
                p.line(offsetX + margin - 5, y, offsetX + margin, y);
                p.noStroke();
                p.textAlign(p.RIGHT);
                p.text("$" + Math.round(val), offsetX + margin - 10, y + 4);
            }

            // ---- AXIS LABELS ----
            p.textAlign(p.CENTER);
            p.textSize(14);
            p.text("Average Tuition ($)",
                offsetX + width / 2,
                offsetY + height - 30
            );

            p.push();
            p.translate(offsetX + 40, offsetY + height / 2);
            p.rotate(-p.HALF_PI);
            p.text("Median Student Debt ($)", 0, 0);
            p.pop();

            // ---- DRAW POINTS ----
            p.noStroke();
            p.fill(0, 120, 255, 140);

            for (var i = 0; i < data.length; i++) {

                var x = p.map(data[i].tuition, xMin, xMax,
                    offsetX + margin,
                    offsetX + width - margin
                );

                var y = p.map(data[i].debt, yMin, yMax,
                    offsetY + height - margin,
                    offsetY + margin
                );

                p.ellipse(x, y, 5, 5);
            }

            // ---- REGRESSION LINE ----
            var n = data.length;
            var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

            for (var i = 0; i < n; i++) {
                sumX += data[i].tuition;
                sumY += data[i].debt;
                sumXY += data[i].tuition * data[i].debt;
                sumX2 += data[i].tuition * data[i].tuition;
            }

            var slope = (n * sumXY - sumX * sumY) /
                        (n * sumX2 - sumX * sumX);

            var intercept = (sumY - slope * sumX) / n;

            var x1 = xMin;
            var y1 = slope * x1 + intercept;
            var x2 = xMax;
            var y2 = slope * x2 + intercept;

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