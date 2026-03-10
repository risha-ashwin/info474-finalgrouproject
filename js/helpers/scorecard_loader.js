(function () {
  function toNum(x) {
    var n = Number(x);
    return isFinite(n) ? n : null;
  }

  function stripQuotes(s) {
    s = (s || "").trim();
    if (s.charAt(0) === '"' && s.charAt(s.length - 1) === '"') {
      s = s.slice(1, -1);
    }
    return s;
  }

  function parseCSV(text) {
    var lines = (text || "").trim().split(/\r?\n/);
    if (!lines.length) return [];

    var header = lines[0].split(",").map(stripQuotes);
    var out = [];

    for (var i = 1; i < lines.length; i++) {
      var parts = lines[i].split(",");
      var row = {};
      for (var j = 0; j < header.length; j++) row[header[j]] = stripQuotes(parts[j]);
      out.push(row);
    }
    return out;
  }

  function loadInstitutionClean(url) {
    return fetch(url)
      .then(function (r) { return r.text(); })
      .then(function (text) {
        var raw = parseCSV(text);
        return raw.map(function (d) {
          return {
            name: d.institution_name,
            state: d.state,
            control: toNum(d.control),        // 1 public, 2 private nonprofit, 3 private for-profit
            debt: toNum(d.debt_mdn),
            earn10: toNum(d.earn_mdn_10y),
            avgCost: toNum(d.average_cost),
            degreeLevel: toNum(d.highest_degree_level)
          };
        }).filter(function (d) {
          return d.state && d.control != null && d.debt != null && d.earn10 != null && d.name != null && d.avgCost != null;
        });
      });
  }

  function loadMapDebt(url) {
    return fetch(url)
      .then(function (r) { return r.text(); })
      .then(function (text) {
        var raw = parseCSV(text);
        return raw.map(function (d) {
          return { state: d.state, debt: toNum(d.debt_mdn) };
        }).filter(function (d) {
          return d.state && d.debt != null;
        });
      });
  }

  window.ScorecardLoader = {
    loadInstitutionClean: loadInstitutionClean,
    loadMapDebt: loadMapDebt
  };
})();