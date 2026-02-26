(function () {
  function median(arr) {
    var a = arr.slice().sort(function (x, y) { return x - y; });
    if (!a.length) return null;
    var mid = Math.floor(a.length / 2);
    return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
  }

  function clamp01(t) { return Math.max(0, Math.min(1, t)); }

  function colorRamp(p, t) {
    var r = Math.round(236 - 150 * t);
    var g = Math.round(245 - 170 * t);
    var b = Math.round(255 - 110 * t);
    return p.color(r, g, b);
  }

  function idToRGB(id) { return [id & 255, (id >> 8) & 255, (id >> 16) & 255]; }
  function rgbToId(r, g, b) { return (r | (g << 8) | (b << 16)); }

  function buildDebtByState(rows) {
    var by = {};
    for (var i = 0; i < rows.length; i++) {
      var st = rows[i].state;
      if (!by[st]) by[st] = [];
      by[st].push(rows[i].debt);
    }

    var out = {};
    var vals = [];
    Object.keys(by).forEach(function (st) {
      var m = median(by[st]);
      out[st] = m;
      if (m != null) vals.push(m);
    });

    vals.sort(function (a, b) { return a - b; });
    out.__min = vals.length ? vals[0] : 0;
    out.__max = vals.length ? vals[vals.length - 1] : 1;
    return out;
  }

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
    p.text("Median student debt", x, y - 6);

    p.textAlign(p.LEFT, p.TOP);
    p.text("$" + Math.round(minV).toLocaleString(), x, y + h + 6);

    p.textAlign(p.RIGHT, p.TOP);
    p.text("$" + Math.round(maxV).toLocaleString(), x + w, y + h + 6);
    p.pop();
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
      p.textSize(16);
      p.text("Geography of Student Debt", 42, 38);

      // quick status line (helpful while debugging)
      p.fill(120);
      p.textSize(12);
      p.text(
        "rows=" + (manager.scorecardRows ? manager.scorecardRows.length : 0) +
        " usReady=" + (manager._usReady ? "yes" : "no") +
        " topojson=" + (typeof topojson) +
        " d3=" + (typeof d3),
        42, 62
      );

      if (!manager.scorecardRows || !manager.scorecardRows.length) {
        p.fill(90);
        p.textSize(13);
        p.text("Loading dataset…", 42, 84);
        p.pop();
        return;
      }

      if (!manager._usReady) {
        p.fill(90);
        p.textSize(13);
        p.text("Loading map…", 42, 84);

        if (manager._mapError) {
          p.fill(140);
          p.textSize(12);
          p.text("Map error: " + manager._mapError, 42, 104);
        }

        p.pop();
        return;
      }

      if (typeof d3 === "undefined") {
        p.fill(140);
        p.textSize(12);
        p.text("Error: d3-geo library not loaded.", 42, 84);
        p.pop();
        return;
      }

      if (!manager._debtByState) {
        manager._debtByState = buildDebtByState(manager.scorecardRows);
      }

      // recompute projection on resize
      if (!manager._mapProj || manager._needsLayout) {
        var box = { x: 42, y: 96, w: w - 84, h: h - 175 };
        manager._mapBox = box;

        var proj = d3.geoAlbersUsa();
        proj.fitSize([box.w, box.h], { type: "FeatureCollection", features: manager._usStates });
        manager._mapProj = proj;

        // ✅ more reliable path creation
        manager._mapPath = d3.geoPath().projection(proj);

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

        ctx.fillStyle = fill.toString();
        ctx.fill();

        ctx.lineWidth = (hoverIndex === s) ? 2.2 : 1.0;
        ctx.strokeStyle = (hoverIndex === s) ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.22)";
        ctx.stroke();
      }

      ctx.restore();

      drawLegend(p, 42, h - 78, 220, 10, minV, maxV);

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