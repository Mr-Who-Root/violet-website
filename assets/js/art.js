/* Violet generative illustration.
   Draws the site's decorative art on <canvas data-art="..."> elements:
   word   letterforms filled with blooms and guilloche rosettes
   screens  line-art monitors with guilloche patterns, joined by cables
   field  a mound of blooms (inside the violet block)
   scope  a radar scope on an arm (why section)
   Guilloche is the fine rosette line-work used in security printing.
   Output is seeded, so it is the same on every load. */
(function () {
  "use strict";

  var INK = "#2E2370";
  var PALETTES = {
    red: ["#D6455C", "#F06A7E", "#F8A3B2", "#FF8A3D", "#F2C94C", "#E25D8F", "#FFC2CC"],
    violet: ["#6E56E6", "#8E79F0", "#B9A8FF", "#D8CCFF", "#C77DFF", "#A98BFF", "#F7A8D0"],
    blue: ["#3E8BFF", "#6FA8FF", "#A9CBFF", "#4FC3C7", "#2F6AD0", "#7ED3E0", "#C9DEFF"]
  };
  var ALL = PALETTES.red.concat(PALETTES.violet, PALETTES.blue);
  var ACCENTS = ["#F2C94C", "#46C28E", "#FF8A3D", "#F7A8D0", "#FFFFFF"];
  var LINES = ["#F28AA0", "#4FC3C7", "#F2C94C", "#8E79F0", "#6FA8FF", "#D6455C", "#46C28E"];
  var GUILLOCHE = [[5, 3], [7, 4], [8, 3], [9, 4], [7, 3], [10, 3], [11, 4], [12, 5]];
  var TAU = Math.PI * 2;

  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(r, list) { return list[Math.floor(r() * list.length)]; }
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }

  function fit(canvas, w, h, setHeight) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    if (setHeight) canvas.style.height = h + "px";
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    return ctx;
  }

  function rrect(ctx, x, y, w, h, rad) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, rad);
    else ctx.rect(x, y, w, h);
  }

  function ink(ctx, lw) { ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); }

  function circle(ctx, x, y, rad, fill, lw) {
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, TAU);
    ctx.fillStyle = fill;
    ctx.fill();
    if (lw) ink(ctx, lw);
  }

  /* ---------- guilloche (hypotrochoid) ---------- */

  function guilloche(ctx, r, x, y, radius, color, lw) {
    var g = pick(r, GUILLOCHE), Rn = g[0], rn = g[1], d = rn * (0.55 + r() * 0.6);
    var scale = radius / (Rn - rn + d);
    var turns = rn / gcd(Rn, rn), steps = 180 * turns, k = (Rn - rn) / rn;
    ctx.beginPath();
    for (var i = 0; i <= steps; i++) {
      var t = (i / steps) * TAU * turns;
      var px = x + ((Rn - rn) * Math.cos(t) + d * Math.cos(k * t)) * scale;
      var py = y + ((Rn - rn) * Math.sin(t) - d * Math.sin(k * t)) * scale;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.stroke();
  }

  /* ---------- wavy-ring guilloche ---------- */

  function waves(ctx, r, x, y, radius, lw, colors) {
    var rings = 4 + Math.floor(r() * 3);
    for (var i = 0; i < rings; i++) {
      var base = radius * (1 - i / (rings + 0.5)), k = pick(r, [6, 8, 10, 12, 14]);
      var amp = 0.06 + r() * 0.12, ph = r() * TAU;
      ctx.beginPath();
      for (var s = 0; s <= 240; s++) {
        var t = (s / 240) * TAU, rad = base * (1 + amp * Math.sin(k * t + ph));
        var px = x + Math.cos(t) * rad, py = y + Math.sin(t) * rad;
        if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = pick(r, colors);
      ctx.lineWidth = lw;
      ctx.stroke();
    }
  }

  /* ---------- motifs ---------- */

  function bloom(ctx, r, x, y, R, pal) {
    var n = 5 + Math.floor(r() * 4), a0 = r() * Math.PI, petal = pick(r, pal), lw = Math.max(1, R * 0.045);
    for (var i = 0; i < n; i++) {
      var a = a0 + (i / n) * TAU;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a) * R * 0.52, y + Math.sin(a) * R * 0.52, R * 0.5, R * 0.3, a, 0, TAU);
      ctx.fillStyle = petal;
      ctx.fill();
      ink(ctx, lw);
    }
    circle(ctx, x, y, R * 0.3, pick(r, ACCENTS.concat(pal)), lw);
    circle(ctx, x, y, R * 0.09, INK, 0);
  }

  function aster(ctx, r, x, y, R, pal) {
    var n = 14 + Math.floor(r() * 10), a0 = r() * Math.PI, petal = pick(r, pal), lw = Math.max(0.8, R * 0.03);
    for (var i = 0; i < n; i++) {
      var a = a0 + (i / n) * TAU;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a) * R * 0.55, y + Math.sin(a) * R * 0.55, R * 0.45, R * 0.09, a, 0, TAU);
      ctx.fillStyle = petal;
      ctx.fill();
      ink(ctx, lw);
    }
    circle(ctx, x, y, R * 0.24, pick(r, ACCENTS), lw);
  }

  function rosette(ctx, r, x, y, R, pal) {
    var bg = pick(r, pal), lw = Math.max(1, R * 0.04);
    var line = pick(r, LINES.concat(["#FFFFFF", INK]));
    if (line === bg) line = "#FFFFFF";
    ctx.save();
    circle(ctx, x, y, R, bg, lw);
    ctx.clip();
    if (r() < 0.6) waves(ctx, r, x, y, R * 0.92, Math.max(0.8, R * 0.035), [line, "#FFFFFF", INK]);
    else guilloche(ctx, r, x, y, R * 0.9, line, Math.max(0.8, R * 0.03));
    ctx.restore();
  }

  function rings(ctx, r, x, y, R, pal) {
    var n = 3 + Math.floor(r() * 2), lw = Math.max(1, R * 0.04);
    for (var i = 0; i < n; i++) circle(ctx, x, y, R * (1 - i / n), i % 2 ? "#FFFFFF" : pick(r, pal), lw);
  }

  function star(ctx, r, x, y, R, pal) {
    var n = 6 + Math.floor(r() * 5), a0 = r() * Math.PI, lw = Math.max(1, R * 0.04);
    ctx.beginPath();
    for (var i = 0; i < n * 2; i++) {
      var a = a0 + (i / (n * 2)) * TAU, rad = i % 2 ? R * 0.45 : R;
      var px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = pick(r, pal);
    ctx.fill();
    ink(ctx, lw);
    circle(ctx, x, y, R * 0.22, pick(r, ACCENTS), lw);
  }

  function leaf(ctx, r, x, y, R) {
    var lw = Math.max(1, R * 0.04);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(r() * TAU);
    ctx.beginPath();
    ctx.ellipse(0, 0, R, R * 0.38, 0, 0, TAU);
    ctx.fillStyle = pick(r, ["#46C28E", "#4FC3C7", "#8FD9B6"]);
    ctx.fill();
    ink(ctx, lw);
    ctx.beginPath();
    ctx.moveTo(-R * 0.8, 0);
    ctx.lineTo(R * 0.8, 0);
    ink(ctx, lw);
    ctx.restore();
  }

  var MOTIFS = [[bloom, 30], [aster, 22], [rosette, 20], [rings, 9], [star, 13], [leaf, 6]];
  var MOTIF_TOTAL = MOTIFS.reduce(function (sum, m) { return sum + m[1]; }, 0);
  function motif(r) {
    var v = r() * MOTIF_TOTAL;
    for (var i = 0; i < MOTIFS.length; i++) { v -= MOTIFS[i][1]; if (v <= 0) return MOTIFS[i][0]; }
    return bloom;
  }

  var ORDER = ["red", "violet", "blue"];

  function mix(r, name) {
    var i = ORDER.indexOf(name);
    if (i < 0) i = 1;
    if (r() < 0.16) i = Math.min(2, Math.max(0, i + (r() < 0.5 ? -1 : 1)));
    return PALETTES[ORDER[i]];
  }

  function spectrumAt(r, fx) { return mix(r, fx < 0.36 ? "red" : fx < 0.64 ? "violet" : "blue"); }

  function scatter(ctx, r, w, h, paletteFor, rmin, rmax, density, inside) {
    var avg = (rmin + rmax) / 2, count = Math.round(((w * h) / (avg * avg)) * density), items = [];
    for (var i = 0; i < count; i++) {
      var x = r() * w, y = r() * h;
      if (inside && !inside(x, y)) continue;
      items.push({ x: x, y: y, R: rmin + Math.pow(r(), 1.7) * (rmax - rmin) });
    }
    items.sort(function (a, b) { return b.R - a.R; });
    items.forEach(function (it) { motif(r)(ctx, r, it.x, it.y, it.R, paletteFor(it.x, it.y)); });
  }

  /* ---------- word ---------- */

  var WORD_FONT = '"Geist", "Hanken Grotesk", system-ui, sans-serif';
  var TRACK = 0.035;

  function zoneNames(spec, chars) {
    var names = [];
    if (spec) {
      spec.split(",").forEach(function (part) {
        var bits = part.split(":"), n = Number(bits[1]) || 0;
        for (var i = 0; i < n; i++) names.push(bits[0]);
      });
    }
    for (var j = 0; j < chars.length; j++) {
      if (!names[j]) { var f = j / Math.max(1, chars.length - 1); names[j] = f < 0.36 ? "red" : f < 0.64 ? "violet" : "blue"; }
    }
    return names;
  }

  function drawWord(canvas) {
    var w = canvas.clientWidth, text = canvas.getAttribute("data-text") || "";
    if (!w || !text) return;
    var narrow = canvas.getAttribute("data-narrow");
    var lines = (w < 640 && narrow ? narrow : text).split("|");
    var names = zoneNames(canvas.getAttribute("data-zones"), lines.join(""));
    var probe = document.createElement("canvas").getContext("2d");

    function widthOf(line, size) {
      probe.font = "800 " + size + "px " + WORD_FONT;
      var sum = 0;
      for (var i = 0; i < line.length; i++) sum += probe.measureText(line[i]).width;
      return sum + TRACK * size * (line.length - 1);
    }
    var widest = Math.max.apply(null, lines.map(function (l) { return widthOf(l, 100); }));
    var size = ((w * 0.98) / widest) * 100;
    probe.font = "800 " + size + "px " + WORD_FONT;

    var pad = size * 0.03, gap = size * 0.04, cursor = pad, layout = [];
    lines.forEach(function (line) {
      var m = probe.measureText(line);
      var asc = m.actualBoundingBoxAscent || size * 0.72, desc = m.actualBoundingBoxDescent || 0;
      layout.push({ line: line, base: cursor + asc, top: cursor, bottom: cursor + asc + desc, width: widthOf(line, size) });
      cursor += asc + desc + gap;
    });
    var h = Math.ceil(cursor - gap + pad);

    var ctx = fit(canvas, w, h, true);
    ctx.font = probe.font;
    ctx.fillStyle = "#000";
    var spans = [], k = 0;
    layout.forEach(function (row) {
      var x = (w - row.width) / 2;
      for (var i = 0; i < row.line.length; i++, k++) {
        var cw = probe.measureText(row.line[i]).width;
        ctx.fillText(row.line[i], x, row.base);
        spans.push({ x0: x, x1: x + cw, y0: row.top, y1: row.bottom, name: names[k] });
        x += cw + TRACK * size;
      }
    });

    var r = rng(Number(canvas.getAttribute("data-seed")) || 7);
    function paletteFor(px, py) {
      var best = null, bestD = Infinity;
      for (var i = 0; i < spans.length; i++) {
        var sp = spans[i];
        var dy = py < sp.y0 ? sp.y0 - py : py > sp.y1 ? py - sp.y1 : 0;
        var dx = px < sp.x0 ? sp.x0 - px : px > sp.x1 ? px - sp.x1 : 0;
        var d = dy * 4 + dx;
        if (d < bestD) { bestD = d; best = sp; }
      }
      return mix(r, best ? best.name : "violet");
    }

    var pattern = document.createElement("canvas");
    pattern.width = canvas.width;
    pattern.height = canvas.height;
    var pctx = pattern.getContext("2d");
    var dpr = canvas.width / w;
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pctx.fillStyle = "#D8CCFF";
    pctx.fillRect(0, 0, w, h);
    scatter(pctx, r, w, h, paletteFor, size * 0.05, size * 0.17, 2.1);

    ctx.globalCompositeOperation = "source-in";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(pattern, 0, 0);
    ctx.globalCompositeOperation = "source-over";
  }

  /* ---------- screens ---------- */

  var SCREENS = [
    { x: -0.3, y: 0.05, w: 0.66, antenna: false },
    { x: 0.5, y: 0.0, w: 0.36, antenna: true },
    { x: 0.02, y: 0.37, w: 0.5, antenna: false },
    { x: 0.5, y: 0.31, w: 0.46, antenna: false },
    { x: -0.14, y: 0.68, w: 0.48, antenna: true },
    { x: 0.42, y: 0.72, w: 0.44, antenna: false }
  ];
  var OUTLINE = "#6E56E6", BODY = "#EDE8FF", LIP = "#B9A8FF", CABLE = "#D8CCFF";

  function cable(ctx, r, a, b) {
    var x1 = a.x + a.w * 0.5, y1 = a.y + a.h * 1.2, x2 = b.x + b.w * 0.5, y2 = b.y + b.h * 1.2;
    var sag = 80 + r() * 90;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(x1, y1 + sag, x2, y2 + sag, x2, y2);
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 9;
    ctx.stroke();
    ctx.strokeStyle = CABLE;
    ctx.lineWidth = 5;
    ctx.stroke();
    for (var k = 1; k <= 2; k++) {
      var t = k / 3 + (r() - 0.5) * 0.12, u = 1 - t;
      var px = u * u * u * x1 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x2;
      var py = u * u * u * y1 + 3 * u * u * t * (y1 + sag) + 3 * u * t * t * (y2 + sag) + t * t * t * y2;
      circle(ctx, px, py, 5.5, k === 1 ? "#D6455C" : "#3E8BFF", 2);
    }
  }

  function screen(ctx, r, b) {
    var lw = 2.5, rad = Math.min(22, b.w * 0.08);
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = lw;
    rrect(ctx, b.x + b.w * 0.44, b.y + b.h - 4, b.w * 0.12, b.h * 0.2, 4);
    ctx.fillStyle = BODY; ctx.fill(); ctx.stroke();
    rrect(ctx, b.x + b.w * 0.3, b.y + b.h * 1.14, b.w * 0.4, b.h * 0.07, 6);
    ctx.fillStyle = LIP; ctx.fill(); ctx.stroke();
    if (b.antenna) {
      ctx.beginPath();
      ctx.moveTo(b.x + b.w / 2, b.y);
      ctx.lineTo(b.x + b.w / 2, b.y - b.h * 0.24);
      ctx.lineWidth = 4; ctx.stroke(); ctx.lineWidth = lw;
      circle(ctx, b.x + b.w / 2, b.y - b.h * 0.24 - 7, 7, "#FFFFFF", 0);
      ctx.strokeStyle = OUTLINE; ctx.stroke();
    }
    rrect(ctx, b.x, b.y, b.w, b.h, rad);
    ctx.fillStyle = BODY; ctx.fill(); ctx.strokeStyle = OUTLINE; ctx.stroke();
    rrect(ctx, b.x + b.w * 0.06, b.y + b.h * 0.89, b.w * 0.88, b.h * 0.045, 3);
    ctx.fillStyle = LIP; ctx.fill();
    var ix = b.x + b.w * 0.07, iy = b.y + b.h * 0.09, iw = b.w * 0.86, ih = b.h * 0.74;
    rrect(ctx, ix, iy, iw, ih, Math.min(14, iw * 0.06));
    ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.stroke();
    ctx.save();
    rrect(ctx, ix, iy, iw, ih, Math.min(14, iw * 0.06));
    ctx.clip();
    waves(ctx, r, ix + iw / 2, iy + ih / 2, Math.max(iw, ih) * 0.62, 1.8, LINES);
    circle(ctx, ix + iw / 2, iy + ih / 2, Math.min(iw, ih) * 0.06, pick(r, LINES), 0);
    ctx.restore();
  }

  function drawScreens(canvas) {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    var ctx = fit(canvas, w, h, false);
    var right = canvas.getAttribute("data-side") === "right";
    var r = rng(right ? 31 : 17);
    var boxes = SCREENS.map(function (s) {
      var bw = s.w * w, bh = bw * 0.68;
      return { x: right ? w - s.x * w - bw : s.x * w, y: s.y * h, w: bw, h: bh, antenna: s.antenna };
    });
    for (var i = 0; i < boxes.length - 1; i++) cable(ctx, r, boxes[i], boxes[i + 1]);
    boxes.forEach(function (b) { screen(ctx, r, b); });
  }

  /* ---------- field ---------- */

  function drawField(canvas) {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    var ctx = fit(canvas, w, h, false);
    var r = rng(11);
    scatter(ctx, r, w, h * 1.15, function (x) { return spectrumAt(r, x / w); }, h * 0.06, h * 0.2, 1.5, function (x, y) {
      var top = h * (0.62 - 0.44 * Math.sin(Math.PI * Math.min(1, x / (w * 0.9))));
      return y > top;
    });
  }

  /* ---------- scope ---------- */

  function drawScope(canvas) {
    var w = canvas.clientWidth;
    if (!w) return;
    var h = w * 0.86, s = w / 400;
    var ctx = fit(canvas, w, h, true);
    var r = rng(5);
    ctx.scale(s, s);

    ctx.beginPath();
    ctx.moveTo(6, 336);
    ctx.quadraticCurveTo(70, 296, 132, 314);
    ctx.quadraticCurveTo(214, 272, 300, 308);
    ctx.quadraticCurveTo(360, 300, 396, 336);
    ctx.closePath();
    ctx.fillStyle = "#8E79F0"; ctx.fill(); ink(ctx, 2.5);

    rrect(ctx, 168, 304, 196, 28, 8);
    ctx.fillStyle = "#FFFFFF"; ctx.fill(); ink(ctx, 2.5);
    rrect(ctx, 318, 312, 12, 12, 2); ctx.fillStyle = "#EDE8FF"; ctx.fill(); ink(ctx, 2);
    rrect(ctx, 336, 312, 12, 12, 2); ctx.fillStyle = "#46C28E"; ctx.fill(); ink(ctx, 2);

    ctx.beginPath();
    ctx.moveTo(300, 306); ctx.lineTo(318, 236); ctx.lineTo(268, 190);
    ctx.strokeStyle = INK; ctx.lineWidth = 18; ctx.stroke();
    ctx.strokeStyle = "#D8CCFF"; ctx.lineWidth = 12; ctx.stroke();
    circle(ctx, 300, 306, 10, "#FFFFFF", 2.5);
    circle(ctx, 318, 236, 10, "#FFFFFF", 2.5);
    circle(ctx, 268, 190, 10, "#FFFFFF", 2.5);

    var cx = 190, cy = 150;
    circle(ctx, cx, cy, 128, "#D8CCFF", 3);
    circle(ctx, cx, cy, 108, "#2E2370", 3);
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, 106, 0, TAU); ctx.clip();
    ctx.beginPath();
    ctx.moveTo(cx, cy); ctx.arc(cx, cy, 110, -1.25, -0.55); ctx.closePath();
    ctx.fillStyle = "rgba(201, 188, 255, 0.28)"; ctx.fill();
    [36, 66, 96].forEach(function (rad) {
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, TAU);
      ctx.strokeStyle = "#5B46D9"; ctx.lineWidth = 1.5; ctx.stroke();
    });
    ctx.beginPath();
    ctx.moveTo(cx - 106, cy); ctx.lineTo(cx + 106, cy);
    ctx.moveTo(cx, cy - 106); ctx.lineTo(cx, cy + 106);
    ctx.strokeStyle = "#5B46D9"; ctx.lineWidth = 1.5; ctx.stroke();
    waves(ctx, r, cx, cy, 98, 1.7, ["#F28AA0", "#4FC3C7", "#F2C94C", "#8E79F0"]);
    [[cx + 44, cy - 52, "#D6455C"], [cx - 58, cy + 30, "#3E8BFF"], [cx + 20, cy + 64, "#3E8BFF"], [cx - 30, cy - 70, "#D6455C"]]
      .forEach(function (d) { circle(ctx, d[0], d[1], 6, d[2], 2); ctx.strokeStyle = "#FFFFFF"; ctx.stroke(); });
    ctx.restore();
    circle(ctx, cx, cy, 108, "rgba(0,0,0,0)", 3);
  }

  /* ---------- orchestration ---------- */

  var RENDERERS = { word: drawWord, screens: drawScreens, field: drawField, scope: drawScope };

  function renderAll() {
    var canvases = document.querySelectorAll("canvas[data-art]");
    Array.prototype.forEach.call(canvases, function (canvas) {
      var draw = RENDERERS[canvas.getAttribute("data-art")];
      if (!draw || !canvas.getContext) return;
      try { draw(canvas); } catch (e) { canvas.hidden = true; }
    });
  }

  function start() {
    var fonts = document.fonts && document.fonts.load
      ? document.fonts.load('800 100px "Geist"').catch(function () { return null; })
      : Promise.resolve(null);
    var timeout = new Promise(function (resolve) { setTimeout(resolve, 2500); });
    Promise.race([fonts, timeout]).then(renderAll);

    var lastWidth = window.innerWidth, timer = null;
    window.addEventListener("resize", function () {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      clearTimeout(timer);
      timer = setTimeout(renderAll, 150);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
