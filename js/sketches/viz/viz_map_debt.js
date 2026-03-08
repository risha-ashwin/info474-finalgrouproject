(function () {
  function clamp01(t) { return Math.max(0, Math.min(1, t)); }

  function colorRamp(p, t) {
    var r = Math.round(255 - 55 * t);
    var g = Math.round(235 - 185 * t);
    var b = Math.round(235 - 185 * t);
    return p.color(r, g, b);
  }

  function idToRGB(id) { return [id & 255, (id >> 8) & 255, (id >> 16) & 255]; }
  function rgbToId(r, g, b) { return (r | (g << 8) | (b << 16)); }

  function drawLegend(p, x, y, w, h, minV, maxV) {
    p.push();
    p.noStroke();
    for (var i = 0; i < w; i++) {
      var t = i / (w - 1);
      p.fill(colorRamp(p, t));
      p.rect(x + i, y, 1, h);
    }
    p.fill(30);
    p.textSize(12);
    p.textAlign(p.LEFT, p.BOTTOM);
    p.text("Median Student Debt", x, y - 6);

    p.textAlign(p.LEFT, p.TOP);
    p.text("$" + Math.round(minV).toLocaleString(), x, y + h + 6);

    p.textAlign(p.RIGHT, p.TOP);
    p.text("$" + Math.round(maxV).toLocaleString(), x + w, y + h + 6);
    p.pop();
  }

  // Load state_median_debt.csv and parse into a lookup object
  function loadStateDebt(manager) {
    if (manager._stateDebtPromise) return manager._stateDebtPromise;

    manager._stateDebtPromise = fetch("data/state_median_debt.csv")
      .then(function (r) { return r.text(); })
      .then(function (text) {
        var lines = text.trim().split(/\r?\n/);
        var out = {};
        var vals = [];
        for (var i = 1; i < lines.length; i++) {
          var parts = lines[i].split(",");
          var st = parts[0].trim();
          var debt = parseFloat(parts[1]);
          if (st && isFinite(debt)) {
            out[st] = debt;
            vals.push(debt);
          }
        }
        vals.sort(function (a, b) { return a - b; });
        out.__min = vals.length ? vals[0] : 0;
        out.__max = vals.length ? vals[vals.length - 1] : 1;
        manager._debtByState = out;
        console.log("State debt data loaded:", Object.keys(out).length - 2, "states");
      })
      .catch(function (err) {
        console.error("Failed to load state_median_debt.csv:", err);
        manager._stateDebtError = String(err);
      });

    return manager._stateDebtPromise;
  }

  window.VizMapDebt = {
    init: function (manager) {
      manager._nameToAbbr = {
        "Alabama":"AL","Alaska":"AK","Arizona":"AZ","Arkansas":"AR","California":"CA","Colorado":"CO","Connecticut":"CT",
        "Delaware":"DE","District of Columbia":"DC","Florida":"FL","Georgia":"GA","Hawaii":"HI","Idaho":"ID","Illinois":"IL",
        "Indiana":"IN","Iowa":"IA","Kansas":"KS","Kentucky":"KY","Louisiana":"LA","Maine":"ME","Maryland":"MD","Massachusetts":"MA",
        "Michigan":"MI","Minnesota":"MN","Mississippi":"MS","Missouri":"MO","Montana":"MT","Nebraska":"NE","Nevada":"NV",
        "New Hampshire":"NH","New Jersey":"NJ","New Mexico":"NM","New York":"NY","North Carolina":"NC","North Dakota":"ND",
        "Ohio":"OH","Oklahoma":"OK","Oregon":"OR","Pennsylvania":"PA","Rhode Island":"RI","South Carolina":"SC","South Dakota":"SD",
        "Tennessee":"TN","Texas":"TX","Utah":"UT","Vermont":"VT","Virginia":"VA","Washington":"WA","West Virginia":"WV",
        "Wisconsin":"WI","Wyoming":"WY"
      };

      // Start loading state debt CSV
      loadStateDebt(manager);

      // Fetch TopoJSON for US states geometry
      var urls = [
        "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json",
        "https://unpkg.com/us-atlas@3/states-10m.json"
      ];

      function tryFetch(i) {
        return fetch(urls[i])
          .then(function (r) {
            if (!r.ok) throw new Error("TopoJSON HTTP " + r.status);
            return r.json();
          })
          .then(function (topo) {
            if (typeof topojson === "undefined") throw new Error("topojson library not loaded");
            if (!topo.objects || !topo.objects.states) throw new Error("TopoJSON missing objects.states");

            manager._usStates = topojson.feature(topo, topo.objects.states).features;
            manager._usReady = true;
            manager._mapError = null;
          })
          .catch(function (err) {
            console.error("Map init failed:", urls[i], err);
            if (i + 1 < urls.length) return tryFetch(i + 1);
            manager._usReady = false;
            manager._mapError = String(err);
          });
      }

      return tryFetch(0);
    },

    draw: function (p, manager) {
      var w = manager.width, h = manager.height;

      p.push();
      p.noStroke();
      p.fill(255);
      p.rect(18, 18, w - 36, h - 36, 18);

      p.fill(25);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(18);
      p.text("Geography of Student Debt", 42, 38);

      if (!manager._debtByState) {
        p.fill(90);
        p.textSize(13);
        p.text("Loading debt data…", 42, 64);
        p.pop();
        return;
      }

      if (!manager._usReady) {
        p.fill(90);
        p.textSize(13);
        p.text("Loading map…", 42, 64);

        if (manager._mapError) {
          p.fill(140);
          p.textSize(12);
          p.text("Map error: " + manager._mapError, 42, 84);
        }

        p.pop();
        return;
      }

      if (typeof d3 === "undefined" || typeof d3.geoAlbersUsa !== "function") {
        p.fill(140);
        p.textSize(12);
        p.text("Error: d3-geo library not loaded correctly.", 42, 64);
        p.pop();
        return;
      }

      // recompute projection on resize
      if (!manager._mapProj || manager._needsLayout) {
        var box = { x: 42, y: 76, w: w - 84, h: h - 155 };
        manager._mapBox = box;

        var proj = d3.geoAlbersUsa();
        proj.fitSize([box.w, box.h], { type: "FeatureCollection", features: manager._usStates });
        manager._mapProj = proj;

        manager._mapPath = d3.geoPath().projection(proj);

        // Clean up old hit canvas before creating a new one
        if (manager._hit) {
          try { manager._hit.remove(); } catch (e) {}
        }

        // hit canvas for hover
        manager._hit = p.createGraphics(w, h);
        manager._hit.pixelDensity(1);

        var hctx = manager._hit.drawingContext;
        hctx.clearRect(0, 0, w, h);
        hctx.save();
        hctx.translate(box.x, box.y);

        // draw each state with a unique color id
        for (var i = 0; i < manager._usStates.length; i++) {
          var id = i + 1;
          var rgb = idToRGB(id);

          hctx.beginPath();
          manager._mapPath.context(hctx);
          manager._mapPath(manager._usStates[i]);

          hctx.fillStyle = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
          hctx.fill();
        }

        hctx.restore();
        manager._needsLayout = false;
      }

      var minV = manager._debtByState.__min;
      var maxV = manager._debtByState.__max;
      var box2 = manager._mapBox;

      // hover detect
      var hoverIndex = null;
      manager._hit.loadPixels();

      var mx = Math.floor(p.mouseX), my = Math.floor(p.mouseY);
      if (mx >= 0 && mx < w && my >= 0 && my < h) {
        var pix = 4 * (my * manager._hit.width + mx);
        var r = manager._hit.pixels[pix];
        var g = manager._hit.pixels[pix + 1];
        var b = manager._hit.pixels[pix + 2];
        var id2 = rgbToId(r, g, b);
        if (id2 > 0) hoverIndex = id2 - 1;
      }

      // draw map
      var ctx = p.drawingContext;
      ctx.save();
      ctx.translate(box2.x, box2.y);

      for (var s = 0; s < manager._usStates.length; s++) {
        var feat = manager._usStates[s];
        var name = feat.properties ? feat.properties.name : "";
        var abbr = manager._nameToAbbr[name];
        var v = abbr ? manager._debtByState[abbr] : null;

        // handle degenerate min/max
        var denom = (maxV - minV) || 1;
        var t = (v == null) ? 0 : clamp01((v - minV) / denom);
        var fill = (v == null) ? p.color(238) : colorRamp(p, t);

        ctx.beginPath();
        manager._mapPath.context(ctx);
        manager._mapPath(feat);

        ctx.fillStyle = "rgb(" + Math.round(fill.levels[0]) + "," + Math.round(fill.levels[1]) + "," + Math.round(fill.levels[2]) + ")";
        ctx.fill();

        ctx.lineWidth = (hoverIndex === s) ? 2.2 : 1.0;
        ctx.strokeStyle = (hoverIndex === s) ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.22)";
        ctx.stroke();
      }

      ctx.restore();

      drawLegend(p, 42, h - 58, 220, 10, minV, maxV);

      // tooltip
      if (hoverIndex != null) {
        var feat2 = manager._usStates[hoverIndex];
        var n2 = feat2.properties ? feat2.properties.name : "State";
        var a2 = manager._nameToAbbr[n2];
        var v2 = a2 ? manager._debtByState[a2] : null;

        var msg = (v2 == null)
          ? (n2 + ": no data")
          : (n2 + ": $" + Math.round(v2).toLocaleString());

        var tx = p.mouseX + 12, ty = p.mouseY - 12, pad = 8;

        p.push();
        p.textSize(12);
        var tw = p.textWidth(msg) + pad * 2;
        var th = 16 + pad * 2;

        p.noStroke();
        p.fill(255);
        p.rect(tx, ty, tw, th, 8);

        p.stroke(0, 40);
        p.noFill();
        p.rect(tx, ty, tw, th, 8);

        p.noStroke();
        p.fill(20);
        p.textAlign(p.LEFT, p.TOP);
        p.text(msg, tx + pad, ty + pad);
        p.pop();
      }

      p.pop();
    }
  };
})();
