/* Violet generative illustration, security edition, animated.
   Draws decorative art on <canvas data-art="...">:
   word     letterforms as dark circuit boards with brand-coloured traces and
            security objects; data packets travel along the traces
   screens  a SOC monitor wall: log tail, network graph, radar sweep, alert
            chart, attack map, and lock screens; packets ride the cables
   field    a heap of security objects (inside the dark feature block)
   scope    a radar scope on an arm; the beam sweeps and blips fade
   Colours come from DESIGN.md. Output is seeded, so the still frame is the
   same on every load. Motion runs only while a canvas is on screen, pauses in
   background tabs, and is off under prefers-reduced-motion. */
(function () {
  "use strict";

  var INK = "#0E0F16";
  var BOARD = "#0E0F16";
  var PALETTES = {
    red: ["#D6455C", "#E57A8B", "#F2B3BE", "#ECEDF2"],
    violet: ["#5B46D9", "#6E56E6", "#8E79F0", "#B9ADF6", "#DCD6FB"],
    blue: ["#3E8BFF", "#6FA8FF", "#A3C7FF", "#D2E3FF"]
  };
  var ORDER = ["red", "violet", "blue"];
  var LIGHT = ["#FFFFFF", "#ECEDF2", "#46C28E", "#F2C94C"];
  var TAU = Math.PI * 2;

  /* ---------- helpers ---------- */

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

  function dprOf() { return Math.min(window.devicePixelRatio || 1, 2); }
  function fit(canvas, w, h, setHeight) {
    var dpr = dprOf();
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    if (setHeight) canvas.style.height = h + "px";
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    return ctx;
  }
  function layer(canvas) {
    var c = document.createElement("canvas");
    c.width = canvas.width;
    c.height = canvas.height;
    return c;
  }
  function snapshot(canvas) {
    var c = layer(canvas);
    c.getContext("2d").drawImage(canvas, 0, 0);
    return c;
  }

  function rrect(ctx, x, y, w, h, rad) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, rad);
    else ctx.rect(x, y, w, h);
  }
  function ink(ctx, lw) { ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke(); }
  function fillInk(ctx, fill, lw) { ctx.fillStyle = fill; ctx.fill(); if (lw) ink(ctx, lw); }
  function circle(ctx, x, y, rad, fill, lw) { ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); fillInk(ctx, fill, lw); }
  function line(ctx, x1, y1, x2, y2, color, lw) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke();
  }

  function mix(r, name) {
    var i = ORDER.indexOf(name);
    if (i < 0) i = 1;
    if (r() < 0.14) i = Math.min(2, Math.max(0, i + (r() < 0.5 ? -1 : 1)));
    return PALETTES[ORDER[i]];
  }
  function spectrumAt(r, fx) { return mix(r, fx < 0.36 ? "red" : fx < 0.64 ? "violet" : "blue"); }

  /* ---------- animation loop ---------- */

  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var animations = [];
  var observer = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      animations.forEach(function (a) { if (a.canvas === entry.target) a.visible = entry.isIntersecting; });
    });
  }, { rootMargin: "120px" }) : null;
  var lastTick = 0, loopStarted = false;

  function tick(t) {
    window.requestAnimationFrame(tick);
    if (document.hidden || t - lastTick < 33) return;
    lastTick = t;
    for (var i = animations.length - 1; i >= 0; i--) {
      var a = animations[i];
      if (!a.visible) continue;
      try { a.frame(t); } catch (e) { animations.splice(i, 1); }
    }
  }

  function animate(canvas, frame) {
    frame(0);
    if (reduceMotion || !window.requestAnimationFrame) return;
    animations.push({ canvas: canvas, frame: frame, visible: !observer });
    if (observer) observer.observe(canvas);
    if (!loopStarted) { loopStarted = true; window.requestAnimationFrame(tick); }
  }

  function resetAnimations() {
    if (observer) animations.forEach(function (a) { observer.unobserve(a.canvas); });
    animations = [];
  }

  /* ---------- security objects (centered at x, y, size R) ---------- */

  function padlock(ctx, r, x, y, R, pal) {
    var lw = Math.max(1.2, R * 0.06), bw = R * 1.15, bh = R * 0.9, by = y - bh * 0.15;
    ctx.beginPath();
    ctx.moveTo(x - R * 0.36, by + 2);
    ctx.arc(x, by - R * 0.12, R * 0.36, Math.PI, 0);
    ctx.lineTo(x + R * 0.36, by + 2);
    ctx.lineCap = "butt";
    ctx.strokeStyle = INK; ctx.lineWidth = R * 0.2 + lw * 2; ctx.stroke();
    ctx.strokeStyle = "#ECEDF2"; ctx.lineWidth = R * 0.2; ctx.stroke();
    ctx.lineCap = "round";
    rrect(ctx, x - bw / 2, by, bw, bh, R * 0.16);
    fillInk(ctx, pick(r, pal), lw);
    circle(ctx, x, by + bh * 0.4, R * 0.12, INK, 0);
    rrect(ctx, x - R * 0.05, by + bh * 0.4, R * 0.1, R * 0.26, R * 0.03);
    ctx.fillStyle = INK; ctx.fill();
  }

  function key(ctx, r, x, y, R, pal) {
    var lw = Math.max(1.2, R * 0.06), fill = pick(r, pal);
    ctx.save(); ctx.translate(x, y); ctx.rotate((r() - 0.5) * 1.6);
    rrect(ctx, -R * 0.15, -R * 0.1, R * 0.95, R * 0.2, R * 0.06); fillInk(ctx, fill, lw);
    rrect(ctx, R * 0.5, R * 0.06, R * 0.12, R * 0.24, R * 0.03); fillInk(ctx, fill, lw);
    rrect(ctx, R * 0.68, R * 0.06, R * 0.1, R * 0.17, R * 0.03); fillInk(ctx, fill, lw);
    circle(ctx, -R * 0.42, 0, R * 0.36, fill, lw);
    circle(ctx, -R * 0.42, 0, R * 0.12, BOARD, lw);
    ctx.restore();
  }

  function chip(ctx, r, x, y, R, pal) {
    var lw = Math.max(1.2, R * 0.06), half = R * 0.55;
    for (var i = 0; i < 4; i++) {
      var o = -half * 0.66 + i * half * 0.44;
      line(ctx, x + o, y - half - R * 0.2, x + o, y + half + R * 0.2, "#A7ABBE", lw * 1.6);
      line(ctx, x - half - R * 0.2, y + o, x + half + R * 0.2, y + o, "#A7ABBE", lw * 1.6);
    }
    rrect(ctx, x - half, y - half, half * 2, half * 2, R * 0.12); fillInk(ctx, pick(r, pal), lw);
    rrect(ctx, x - half * 0.55, y - half * 0.55, half * 1.1, half * 1.1, R * 0.06); fillInk(ctx, "#1C1E2A", 0);
    circle(ctx, x - half * 0.3, y - half * 0.3, R * 0.06, pick(r, LIGHT), 0);
  }

  function server(ctx, r, x, y, R, pal) {
    var lw = Math.max(1.2, R * 0.05), w = R * 1.3, uh = R * 0.34, top = y - uh * 1.5 - 2;
    for (var i = 0; i < 3; i++) {
      var uy = top + i * (uh + 2);
      rrect(ctx, x - w / 2, uy, w, uh, R * 0.07); fillInk(ctx, i === 1 ? pick(r, pal) : "#ECEDF2", lw);
      circle(ctx, x - w / 2 + R * 0.16, uy + uh / 2, R * 0.05, pick(r, ["#46C28E", "#46C28E", "#F2C94C", "#D6455C"]), 0);
      line(ctx, x + w * 0.05, uy + uh / 2, x + w * 0.38, uy + uh / 2, "#A7ABBE", lw * 1.4);
    }
  }

  function terminal(ctx, r, x, y, R, pal) {
    var lw = Math.max(1.2, R * 0.05), w = R * 1.6, h = R * 1.15, left = x - w / 2, top = y - h / 2;
    rrect(ctx, left, top, w, h, R * 0.12); fillInk(ctx, "#1C1E2A", lw);
    rrect(ctx, left, top, w, h * 0.22, R * 0.12); fillInk(ctx, pick(r, pal), lw);
    for (var d = 0; d < 3; d++) circle(ctx, left + R * 0.16 + d * R * 0.14, top + h * 0.11, R * 0.04, "#FFFFFF", 0);
    for (var i = 0; i < 3; i++) {
      var ly = top + h * (0.4 + i * 0.18);
      line(ctx, left + R * 0.14, ly - R * 0.05, left + R * 0.22, ly, "#46C28E", lw);
      line(ctx, left + R * 0.22, ly, left + R * 0.14, ly + R * 0.05, "#46C28E", lw);
      line(ctx, left + R * 0.34, ly, left + R * (0.5 + r() * 0.85), ly, pick(r, ["#ECEDF2", "#A3C7FF", "#B9ADF6", "#F2B3BE"]), lw * 1.1);
    }
  }

  function target(ctx, r, x, y, R) {
    var lw = Math.max(1.2, R * 0.05);
    circle(ctx, x, y, R * 0.62, "#ECEDF2", lw);
    circle(ctx, x, y, R * 0.46, "#D6455C", lw);
    circle(ctx, x, y, R * 0.3, "#ECEDF2", lw);
    circle(ctx, x, y, R * 0.14, "#D6455C", lw);
    line(ctx, x - R * 0.8, y, x + R * 0.8, y, "#A7ABBE", lw);
    line(ctx, x, y - R * 0.8, x, y + R * 0.8, "#A7ABBE", lw);
  }

  function bug(ctx, r, x, y, R, pal) {
    var lw = Math.max(1.2, R * 0.05);
    ctx.save(); ctx.translate(x, y); ctx.rotate((r() - 0.5) * 1.2);
    for (var i = -1; i <= 1; i++) {
      line(ctx, -R * 0.25, i * R * 0.22, -R * 0.62, i * R * 0.3 + R * 0.06, "#A7ABBE", lw * 1.3);
      line(ctx, R * 0.25, i * R * 0.22, R * 0.62, i * R * 0.3 + R * 0.06, "#A7ABBE", lw * 1.3);
    }
    line(ctx, -R * 0.1, -R * 0.5, -R * 0.26, -R * 0.74, "#A7ABBE", lw);
    line(ctx, R * 0.1, -R * 0.5, R * 0.26, -R * 0.74, "#A7ABBE", lw);
    circle(ctx, 0, -R * 0.42, R * 0.17, "#ECEDF2", lw);
    ctx.beginPath(); ctx.ellipse(0, R * 0.05, R * 0.32, R * 0.44, 0, 0, TAU); fillInk(ctx, pick(r, pal), lw);
    line(ctx, 0, -R * 0.36, 0, R * 0.46, INK, lw);
    circle(ctx, -R * 0.14, R * 0.08, R * 0.06, INK, 0);
    circle(ctx, R * 0.14, R * 0.2, R * 0.05, INK, 0);
    ctx.restore();
  }

  function graph(ctx, r, x, y, R, pal) {
    var lw = Math.max(1.2, R * 0.05), pts = [];
    for (var i = 0; i < 5; i++) {
      var a = (i / 5) * TAU + r() * 0.8, d = R * (0.35 + r() * 0.4);
      pts.push([x + Math.cos(a) * d, y + Math.sin(a) * d]);
    }
    for (var j = 0; j < pts.length; j++) {
      var p = pts[j], q = pts[(j + 1) % pts.length];
      line(ctx, p[0], p[1], q[0], q[1], "#A7ABBE", lw);
      line(ctx, x, y, p[0], p[1], "#4A4D60", lw * 0.8);
    }
    pts.forEach(function (pt, k) { circle(ctx, pt[0], pt[1], R * 0.13, k === 2 ? "#D6455C" : pick(r, pal), lw); });
    circle(ctx, x, y, R * 0.17, "#ECEDF2", lw);
  }

  function fingerprint(ctx, r, x, y, R, pal) {
    var lw = Math.max(1.2, R * 0.05);
    ctx.beginPath(); ctx.ellipse(x, y, R * 0.5, R * 0.62, 0, 0, TAU); fillInk(ctx, pick(r, pal), lw);
    for (var i = 1; i <= 4; i++) {
      var s = r() * 0.8;
      ctx.beginPath();
      ctx.ellipse(x, y + R * 0.06, R * 0.1 * i, R * 0.13 * i, 0, Math.PI + s, TAU - 0.2 + s * 0.4);
      ctx.strokeStyle = INK; ctx.lineWidth = lw; ctx.stroke();
    }
  }

  function packet(ctx, r, x, y, R, pal) {
    var lw = Math.max(1.2, R * 0.05), w = R * 1.3, h = R * 0.85;
    rrect(ctx, x - w / 2, y - h / 2, w, h, R * 0.08); fillInk(ctx, pick(r, pal), lw);
    ctx.beginPath(); ctx.moveTo(x - w / 2 + 2, y - h / 2 + 2); ctx.lineTo(x, y + h * 0.08); ctx.lineTo(x + w / 2 - 2, y - h / 2 + 2);
    ink(ctx, lw);
  }

  function binary(ctx, r, x, y, R, pal) {
    var lw = Math.max(1.2, R * 0.05), s = R * 1.15;
    rrect(ctx, x - s / 2, y - s / 2, s, s, R * 0.14); fillInk(ctx, pick(r, pal), lw);
    ctx.fillStyle = INK;
    ctx.font = "700 " + Math.round(R * 0.34) + 'px "IBM Plex Mono", ui-monospace, monospace';
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(r() < 0.5 ? "1011" : "0110", x, y - R * 0.16);
    ctx.fillText(r() < 0.5 ? "0101" : "1100", x, y + R * 0.2);
    ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
  }

  function radarMini(ctx, r, x, y, R, pal) {
    var lw = Math.max(1.2, R * 0.05);
    circle(ctx, x, y, R * 0.62, "#1C1E2A", lw);
    ctx.beginPath(); ctx.arc(x, y, R * 0.42, 0, TAU); ctx.strokeStyle = pick(r, pal); ctx.lineWidth = lw * 0.8; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, R * 0.6, -1.2, -0.4); ctx.closePath();
    ctx.fillStyle = "rgba(142, 121, 240, 0.45)"; ctx.fill();
    circle(ctx, x + R * 0.22, y - R * 0.26, R * 0.07, "#D6455C", 0);
  }

  function cloud(ctx, r, x, y, R) {
    var lw = Math.max(1.2, R * 0.06), fill = pick(r, ["#ECEDF2", "#FFFFFF"]);
    var parts = [[-0.3, 0.05, 0.3], [0.02, -0.12, 0.38], [0.34, 0.07, 0.26]];
    parts.forEach(function (p) { circle(ctx, x + p[0] * R, y + p[1] * R, p[2] * R + lw, INK, 0); });
    rrect(ctx, x - R * 0.62 - lw, y - lw, R * 1.24 + lw * 2, R * 0.34 + lw * 2, R * 0.17); ctx.fillStyle = INK; ctx.fill();
    parts.forEach(function (p) { circle(ctx, x + p[0] * R, y + p[1] * R, p[2] * R, fill, 0); });
    rrect(ctx, x - R * 0.62, y, R * 1.24, R * 0.34, R * 0.17); ctx.fillStyle = fill; ctx.fill();
  }

  var OBJECTS = [[padlock, 13], [key, 9], [chip, 12], [server, 9], [terminal, 11], [target, 8], [bug, 8],
    [graph, 9], [fingerprint, 7], [packet, 6], [binary, 8], [radarMini, 6], [cloud, 4]];
  var OBJECT_TOTAL = OBJECTS.reduce(function (sum, o) { return sum + o[1]; }, 0);
  function object(r) {
    var v = r() * OBJECT_TOTAL;
    for (var i = 0; i < OBJECTS.length; i++) { v -= OBJECTS[i][1]; if (v <= 0) return OBJECTS[i][0]; }
    return padlock;
  }

  function scatter(ctx, r, w, h, paletteFor, rmin, rmax, density, inside) {
    var avg = (rmin + rmax) / 2, count = Math.round(((w * h) / (avg * avg)) * density), items = [];
    for (var i = 0; i < count; i++) {
      var x = r() * w, y = r() * h;
      if (inside && !inside(x, y)) continue;
      items.push({ x: x, y: y, R: rmin + Math.pow(r(), 1.5) * (rmax - rmin) });
    }
    items.sort(function (a, b) { return a.y - b.y; });
    items.forEach(function (it) { object(r)(ctx, r, it.x, it.y, it.R, paletteFor(it.x, it.y)); });
  }

  /* ---------- circuit traces ---------- */

  var DIRS = [[1, 0], [0.707, 0.707], [0, 1], [-0.707, 0.707], [-1, 0], [-0.707, -0.707], [0, -1], [0.707, -0.707]];

  function traces(ctx, r, w, h, paletteFor, count, step, lw) {
    var paths = [];
    for (var t = 0; t < count; t++) {
      var x = r() * w, y = r() * h, color = pick(r, paletteFor(x, y)), dir = Math.floor(r() * 4) * 2;
      var pts = [[x, y]], segs = 2 + Math.floor(r() * 4);
      for (var s = 0; s < segs; s++) {
        var len = step * (1 + Math.floor(r() * 3));
        x += DIRS[dir][0] * len; y += DIRS[dir][1] * len;
        pts.push([x, y]);
        dir = (dir + pick(r, [-1, 1, 0, 0]) + 8) % 8;
      }
      ctx.beginPath();
      pts.forEach(function (p, i) { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
      ctx.strokeStyle = INK; ctx.lineWidth = lw + 3; ctx.stroke();
      ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke();
      [pts[0], pts[pts.length - 1]].forEach(function (p) {
        circle(ctx, p[0], p[1], lw * 1.7, color, 1.5);
        circle(ctx, p[0], p[1], lw * 0.6, BOARD, 0);
      });
      paths.push(measure(pts, color));
    }
    return paths;
  }

  function measure(pts, color) {
    var lens = [0];
    for (var i = 1; i < pts.length; i++) {
      lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    return { pts: pts, lens: lens, total: lens[lens.length - 1], color: color };
  }

  function pointAt(path, d) {
    var lens = path.lens, pts = path.pts;
    for (var i = 1; i < lens.length; i++) {
      if (d <= lens[i]) {
        var seg = lens[i] - lens[i - 1] || 1, f = (d - lens[i - 1]) / seg;
        return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
      }
    }
    return pts[pts.length - 1];
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
    var rows = (w < 640 && narrow ? narrow : text).split("|");
    var names = zoneNames(canvas.getAttribute("data-zones"), rows.join(""));
    var probe = document.createElement("canvas").getContext("2d");

    function widthOf(row, size) {
      probe.font = "800 " + size + "px " + WORD_FONT;
      var sum = 0;
      for (var i = 0; i < row.length; i++) sum += probe.measureText(row[i]).width;
      return sum + TRACK * size * (row.length - 1);
    }
    var widest = Math.max.apply(null, rows.map(function (l) { return widthOf(l, 100); }));
    var size = ((w * 0.98) / widest) * 100;
    probe.font = "800 " + size + "px " + WORD_FONT;

    var pad = size * 0.03, gap = size * 0.04, cursor = pad, layout = [];
    rows.forEach(function (row) {
      var m = probe.measureText(row);
      var asc = m.actualBoundingBoxAscent || size * 0.72, desc = m.actualBoundingBoxDescent || 0;
      layout.push({ row: row, base: cursor + asc, top: cursor, bottom: cursor + asc + desc, width: widthOf(row, size) });
      cursor += asc + desc + gap;
    });
    var h = Math.ceil(cursor - gap + pad);

    var ctx = fit(canvas, w, h, true);
    var dpr = canvas.width / w;
    ctx.font = probe.font;
    ctx.fillStyle = "#000";
    var spans = [], k = 0;
    layout.forEach(function (item) {
      var x = (w - item.width) / 2;
      for (var i = 0; i < item.row.length; i++, k++) {
        var cw = probe.measureText(item.row[i]).width;
        ctx.fillText(item.row[i], x, item.base);
        spans.push({ x0: x, x1: x + cw, y0: item.top, y1: item.bottom, name: names[k] });
        x += cw + TRACK * size;
      }
    });
    var mask = snapshot(canvas);

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

    var board = layer(canvas);
    var bctx = board.getContext("2d");
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bctx.lineJoin = "round"; bctx.lineCap = "round";
    bctx.fillStyle = BOARD;
    bctx.fillRect(0, 0, w, h);
    var lw = Math.max(2, size * 0.014);
    var paths = traces(bctx, r, w, h, paletteFor, Math.round(((w * h) / (size * size)) * 46), size * 0.045, lw);
    scatter(bctx, r, w, h, paletteFor, size * 0.055, size * 0.12, 0.85);

    ctx.globalCompositeOperation = "source-in";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(board, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    var still = snapshot(canvas);

    var fx = layer(canvas), fctx = fx.getContext("2d");
    var packets = paths.filter(function (p) { return p.total > lw * 8; }).slice(0, 110).map(function (p) {
      return { path: p, speed: 40 + r() * 70, offset: r() * p.total };
    });

    animate(canvas, function (t) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(still, 0, 0);
      if (!t) return;
      fctx.setTransform(1, 0, 0, 1, 0, 0);
      fctx.globalCompositeOperation = "source-over";
      fctx.clearRect(0, 0, fx.width, fx.height);
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fctx.lineCap = "round";
      packets.forEach(function (p) {
        var d = (p.offset + (t / 1000) * p.speed) % p.path.total;
        var head = pointAt(p.path, d), tail = pointAt(p.path, Math.max(0, d - lw * 4));
        line(fctx, tail[0], tail[1], head[0], head[1], p.path.color, lw * 0.9);
        circle(fctx, head[0], head[1], lw * 0.7, "#FFFFFF", 0);
      });
      fctx.setTransform(1, 0, 0, 1, 0, 0);
      fctx.globalCompositeOperation = "destination-in";
      fctx.drawImage(mask, 0, 0);
      ctx.drawImage(fx, 0, 0);
    });
  }

  /* ---------- SOC monitor wall ---------- */

  var SCREENS = [
    { x: -0.3, y: 0.05, w: 0.66, antenna: false },
    { x: 0.5, y: 0.0, w: 0.36, antenna: true },
    { x: 0.02, y: 0.37, w: 0.5, antenna: false },
    { x: 0.5, y: 0.31, w: 0.46, antenna: false },
    { x: -0.14, y: 0.68, w: 0.48, antenna: true },
    { x: 0.42, y: 0.72, w: 0.44, antenna: false }
  ];
  var FRAME = "#474A5C", BODY = "#F7F7FA", LIP = "#E2E3EC", CABLE = "#EFEFF4", CABLE_EDGE = "#A7ABBE", SCREEN = "#0E0F16";
  var DIM = "#4A4D60", SOFT_VIOLET = "#8E79F0";

  function makeTerminal(r) {
    var rows = [];
    for (var i = 0; i < 48; i++) {
      rows.push({ w: 0.3 + r() * 0.6, c: r() < 0.16 ? "#D6455C" : pick(r, ["#46C28E", "#6FA8FF", "#ECEDF2", "#F2C94C", SOFT_VIOLET]) });
    }
    return function (ctx, t, x, y, w, h) {
      var n = Math.max(4, Math.floor(h / 15)), lh = h / (n + 1), shift = Math.floor(t / 650);
      for (var i = 0; i < n; i++) {
        var row = rows[(i + shift) % rows.length], ly = y + lh * (i + 1);
        line(ctx, x + 10, ly, x + 22, ly, "#5B46D9", 3);
        line(ctx, x + 30, ly, x + 30 + (w - 50) * row.w, ly, row.c, 3);
      }
      if (Math.floor(t / 500) % 2 === 0) { rrect(ctx, x + 30, y + lh * (n + 0.55), 8, 12, 1); ctx.fillStyle = "#46C28E"; ctx.fill(); }
    };
  }

  function makeGraph(r, w, h) {
    var pts = [];
    for (var i = 0; i < 9; i++) pts.push([14 + r() * (w - 28), 14 + r() * (h - 28)]);
    return function (ctx, t, x, y) {
      pts.forEach(function (p, i) {
        for (var j = i + 1; j < Math.min(pts.length, i + 3); j++) line(ctx, x + p[0], y + p[1], x + pts[j][0], y + pts[j][1], DIM, 1.6);
      });
      var hop = (t / 900) % 1, a = pts[3], b = pts[4];
      circle(ctx, x + a[0] + (b[0] - a[0]) * hop, y + a[1] + (b[1] - a[1]) * hop, 3, "#ECEDF2", 0);
      pts.forEach(function (p, i) {
        var threat = i === 3 || i === 7;
        if (threat) circle(ctx, x + p[0], y + p[1], 8 + 5 * (0.5 + 0.5 * Math.sin(t / 320 + i)), "rgba(214, 69, 92, 0.3)", 0);
        circle(ctx, x + p[0], y + p[1], 5, threat ? "#D6455C" : i % 2 ? "#6FA8FF" : SOFT_VIOLET, 0);
      });
    };
  }

  function makeRadar(r) {
    var blips = [];
    for (var i = 0; i < 5; i++) blips.push({ a: r() * TAU, d: 0.25 + r() * 0.7, c: i === 0 ? "#D6455C" : "#6FA8FF" });
    return function (ctx, t, x, y, w, h) {
      var cx = x + w / 2, cy = y + h / 2, rad = Math.min(w, h) * 0.44, sweep = (t / 1000) * 1.6 % TAU;
      [1, 0.66, 0.33].forEach(function (f) {
        ctx.beginPath(); ctx.arc(cx, cy, rad * f, 0, TAU); ctx.strokeStyle = DIM; ctx.lineWidth = 1.5; ctx.stroke();
      });
      line(ctx, cx - rad, cy, cx + rad, cy, DIM, 1.5);
      line(ctx, cx, cy - rad, cx, cy + rad, DIM, 1.5);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, rad, sweep - 0.8, sweep); ctx.closePath();
      ctx.fillStyle = "rgba(142, 121, 240, 0.4)"; ctx.fill();
      blips.forEach(function (b) {
        var behind = (sweep - b.a + TAU) % TAU;
        ctx.globalAlpha = Math.max(0.15, 1 - behind / (TAU * 0.75));
        circle(ctx, cx + Math.cos(b.a) * rad * b.d, cy + Math.sin(b.a) * rad * b.d, 4, b.c, 0);
        ctx.globalAlpha = 1;
      });
    };
  }

  function makeBars(r) {
    var n = 14, base = [], order = [];
    for (var i = 0; i < n; i++) { base.push(0.18 + r() * 0.4); order.push(Math.floor(r() * n)); }
    return function (ctx, t, x, y, w, h) {
      var bw = (w - 24) / n, spike = order[Math.floor(t / 2400) % n];
      line(ctx, x + 10, y + h - 12, x + w - 10, y + h - 12, DIM, 1.5);
      for (var i = 0; i < n; i++) {
        var f = i === spike ? 0.9 : base[i] * (0.8 + 0.2 * Math.sin(t / 520 + i));
        var bh = (h - 30) * f;
        rrect(ctx, x + 12 + i * bw + 2, y + h - 12 - bh, bw - 4, bh, 2);
        ctx.fillStyle = i === spike ? "#D6455C" : "#3E8BFF"; ctx.fill();
      }
    };
  }

  function makeMap(r, w, h) {
    var dots = [], hot = [];
    for (var gx = 8; gx < w - 6; gx += 9) {
      for (var gy = 8; gy < h - 6; gy += 9) {
        var n = Math.sin(gx * 0.045) + Math.cos(gy * 0.07) + Math.sin((gx + gy) * 0.02);
        if (n < 0.3) continue;
        dots.push([gx, gy]);
        if (r() < 0.035) hot.push([gx, gy]);
      }
    }
    var arcs = [];
    for (var i = 0; i + 1 < hot.length && arcs.length < 3; i += 2) arcs.push([hot[i], hot[i + 1]]);
    return function (ctx, t, x, y) {
      dots.forEach(function (d) { circle(ctx, x + d[0], y + d[1], 1.6, "#2A2C3A", 0); });
      arcs.forEach(function (arc, k) {
        var a = arc[0], b = arc[1], p = ((t / 1900) + k * 0.33) % 1;
        var mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - 26, color = k % 2 ? "#6FA8FF" : "#D6455C";
        ctx.beginPath();
        for (var s = 0; s <= 24; s++) {
          var u = (s / 24) * p, v = 1 - u;
          var px = v * v * a[0] + 2 * v * u * mx + u * u * b[0], py = v * v * a[1] + 2 * v * u * my + u * u * b[1];
          if (s === 0) ctx.moveTo(x + px, y + py); else ctx.lineTo(x + px, y + py);
        }
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
        circle(ctx, x + a[0], y + a[1], 3.5, "#D6455C", 0);
        circle(ctx, x + b[0], y + b[1], 2 + 2.5 * p, "#6FA8FF", 0);
      });
    };
  }

  function makeLock() {
    var still = rng(1);
    return function (ctx, t, x, y, w, h) {
      var R = Math.min(w, h) * 0.32, p = (t % 4200) / 4200;
      padlock(ctx, still, x + w / 2, y + h * 0.42, R, ["#6E56E6"]);
      rrect(ctx, x + w * 0.2, y + h * 0.82, w * 0.6, 7, 3); ctx.fillStyle = "#2A2C3A"; ctx.fill();
      rrect(ctx, x + w * 0.2, y + h * 0.82, w * 0.6 * Math.min(1, p * 1.25), 7, 3); ctx.fillStyle = "#46C28E"; ctx.fill();
    };
  }

  var MAKERS = [makeTerminal, makeGraph, makeRadar, makeBars, makeMap, makeLock];

  function monitor(ctx, b) {
    var lw = 2.5, rad = Math.min(22, b.w * 0.08);
    ctx.strokeStyle = FRAME; ctx.lineWidth = lw;
    rrect(ctx, b.x + b.w * 0.44, b.y + b.h - 4, b.w * 0.12, b.h * 0.2, 4); ctx.fillStyle = BODY; ctx.fill(); ctx.stroke();
    rrect(ctx, b.x + b.w * 0.3, b.y + b.h * 1.14, b.w * 0.4, b.h * 0.07, 6); ctx.fillStyle = LIP; ctx.fill(); ctx.stroke();
    if (b.antenna) {
      line(ctx, b.x + b.w / 2, b.y, b.x + b.w / 2, b.y - b.h * 0.24, FRAME, 3);
      circle(ctx, b.x + b.w / 2, b.y - b.h * 0.24 - 7, 7, "#FFFFFF", 0);
      ctx.strokeStyle = FRAME; ctx.lineWidth = lw; ctx.stroke();
    }
    rrect(ctx, b.x, b.y, b.w, b.h, rad); ctx.fillStyle = BODY; ctx.fill(); ctx.strokeStyle = FRAME; ctx.lineWidth = lw; ctx.stroke();
    rrect(ctx, b.x + b.w * 0.06, b.y + b.h * 0.89, b.w * 0.88, b.h * 0.045, 3); ctx.fillStyle = LIP; ctx.fill();
    rrect(ctx, b.ix, b.iy, b.iw, b.ih, b.ir); ctx.fillStyle = SCREEN; ctx.fill(); ctx.strokeStyle = FRAME; ctx.stroke();
  }

  function cablePath(r, a, b) {
    var x1 = a.x + a.w * 0.5, y1 = a.y + a.h * 1.2, x2 = b.x + b.w * 0.5, y2 = b.y + b.h * 1.2;
    var sag = 80 + r() * 90;
    return { x1: x1, y1: y1, x2: x2, y2: y2, sag: sag, speed: 0.08 + r() * 0.06, offset: r() };
  }
  function cablePoint(c, t) {
    var u = 1 - t;
    return [
      u * u * u * c.x1 + 3 * u * u * t * c.x1 + 3 * u * t * t * c.x2 + t * t * t * c.x2,
      u * u * u * c.y1 + 3 * u * u * t * (c.y1 + c.sag) + 3 * u * t * t * (c.y2 + c.sag) + t * t * t * c.y2
    ];
  }

  function drawScreens(canvas) {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    var ctx = fit(canvas, w, h, false);
    var dpr = canvas.width / w;
    var right = canvas.getAttribute("data-side") === "right";
    var r = rng(right ? 31 : 17);
    var boxes = SCREENS.map(function (s, i) {
      var bw = s.w * w, bh = bw * 0.68, bx = right ? w - s.x * w - bw : s.x * w, by = s.y * h;
      var b = { x: bx, y: by, w: bw, h: bh, antenna: s.antenna };
      b.ix = bx + bw * 0.07; b.iy = by + bh * 0.09; b.iw = bw * 0.86; b.ih = bh * 0.74; b.ir = Math.min(14, b.iw * 0.06);
      b.draw = MAKERS[(i + (right ? 3 : 0)) % MAKERS.length](r, b.iw, b.ih);
      return b;
    });
    var cables = [];
    for (var i = 0; i < boxes.length - 1; i++) cables.push(cablePath(r, boxes[i], boxes[i + 1]));
    cables.forEach(function (c) {
      ctx.beginPath(); ctx.moveTo(c.x1, c.y1);
      ctx.bezierCurveTo(c.x1, c.y1 + c.sag, c.x2, c.y2 + c.sag, c.x2, c.y2);
      ctx.strokeStyle = CABLE_EDGE; ctx.lineWidth = 9; ctx.stroke();
      ctx.strokeStyle = CABLE; ctx.lineWidth = 5; ctx.stroke();
    });
    boxes.forEach(function (b) { monitor(ctx, b); });
    var still = snapshot(canvas);

    animate(canvas, function (t) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(still, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      boxes.forEach(function (b) {
        ctx.save();
        rrect(ctx, b.ix, b.iy, b.iw, b.ih, b.ir);
        ctx.clip();
        b.draw(ctx, t, b.ix, b.iy, b.iw, b.ih);
        ctx.restore();
      });
      cables.forEach(function (c, k) {
        [0, 0.5].forEach(function (shift, j) {
          var p = cablePoint(c, (c.offset + shift + (t / 1000) * c.speed) % 1);
          rrect(ctx, p[0] - 7, p[1] - 5, 14, 10, 2);
          ctx.fillStyle = (k + j) % 2 ? "#3E8BFF" : "#D6455C"; ctx.fill();
          ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
        });
      });
    });
  }

  /* ---------- field ---------- */

  function drawField(canvas) {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    var ctx = fit(canvas, w, h, false);
    var r = rng(11);
    scatter(ctx, r, w, h * 1.2, function (x) { return spectrumAt(r, x / w); }, h * 0.09, h * 0.2, 1.15, function (x, y) {
      return y > h * (0.6 - 0.42 * Math.sin(Math.PI * Math.min(1, x / (w * 0.92))));
    });
  }

  /* ---------- radar scope ---------- */

  var SCOPE_BLIPS = [[52, -58, "#D6455C"], [-60, 30, "#6FA8FF"], [22, 66, "#6FA8FF"], [-32, -72, "#D6455C"], [70, 18, "#46C28E"]];

  function drawScope(canvas) {
    var w = canvas.clientWidth;
    if (!w) return;
    var h = w * 0.86, s = w / 400;
    var ctx = fit(canvas, w, h, true);
    var dpr = canvas.width / w;
    ctx.scale(s, s);

    ctx.beginPath();
    ctx.moveTo(6, 336);
    ctx.quadraticCurveTo(70, 296, 132, 314);
    ctx.quadraticCurveTo(214, 272, 300, 308);
    ctx.quadraticCurveTo(360, 300, 396, 336);
    ctx.closePath();
    ctx.fillStyle = "#EFEFF4"; ctx.fill(); ctx.strokeStyle = FRAME; ctx.lineWidth = 2.5; ctx.stroke();
    rrect(ctx, 168, 304, 196, 28, 8); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.stroke();
    rrect(ctx, 318, 312, 12, 12, 2); ctx.fillStyle = "#E2E3EC"; ctx.fill(); ctx.stroke();
    rrect(ctx, 336, 312, 12, 12, 2); ctx.fillStyle = "#46C28E"; ctx.fill(); ctx.stroke();

    ctx.beginPath(); ctx.moveTo(300, 306); ctx.lineTo(318, 236); ctx.lineTo(268, 190);
    ctx.strokeStyle = FRAME; ctx.lineWidth = 18; ctx.stroke();
    ctx.strokeStyle = "#E2E3EC"; ctx.lineWidth = 12; ctx.stroke();
    [[300, 306], [318, 236], [268, 190]].forEach(function (j) {
      circle(ctx, j[0], j[1], 10, "#FFFFFF", 0); ctx.strokeStyle = FRAME; ctx.lineWidth = 2.5; ctx.stroke();
    });

    var cx = 190, cy = 150;
    circle(ctx, cx, cy, 128, "#EFEFF4", 0); ctx.strokeStyle = FRAME; ctx.lineWidth = 3; ctx.stroke();
    circle(ctx, cx, cy, 108, "#0E0F16", 0); ctx.stroke();
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, 106, 0, TAU); ctx.clip();
    for (var g = -100; g <= 100; g += 25) {
      line(ctx, cx + g, cy - 110, cx + g, cy + 110, "rgba(110, 86, 230, 0.22)", 1);
      line(ctx, cx - 110, cy + g, cx + 110, cy + g, "rgba(110, 86, 230, 0.22)", 1);
    }
    [34, 66, 98].forEach(function (rad) {
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, TAU); ctx.strokeStyle = "#5B46D9"; ctx.lineWidth = 2; ctx.stroke();
    });
    line(ctx, cx - 106, cy, cx + 106, cy, "#5B46D9", 2);
    line(ctx, cx, cy - 106, cx, cy + 106, "#5B46D9", 2);
    ctx.restore();
    var still = snapshot(canvas);

    animate(canvas, function (t) {
      var sweep = t ? ((t / 1000) * 1.1) % TAU : -0.9;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(still, 0, 0);
      ctx.setTransform(dpr * s, 0, 0, dpr * s, 0, 0);
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, 106, 0, TAU); ctx.clip();
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, 110, sweep - 0.85, sweep); ctx.closePath();
      ctx.fillStyle = "rgba(142, 121, 240, 0.42)"; ctx.fill();
      line(ctx, cx, cy, cx + Math.cos(sweep) * 106, cy + Math.sin(sweep) * 106, "#8E79F0", 2.5);
      SCOPE_BLIPS.forEach(function (d) {
        var behind = (sweep - Math.atan2(d[1], d[0]) + TAU) % TAU;
        var glow = t ? Math.max(0.2, 1 - behind / (TAU * 0.7)) : 1;
        ctx.globalAlpha = glow;
        circle(ctx, cx + d[0], cy + d[1], 13, d[2] === "#D6455C" ? "rgba(214, 69, 92, 0.35)" : "rgba(111, 168, 255, 0.3)", 0);
        circle(ctx, cx + d[0], cy + d[1], 5.5, d[2], 0);
        ctx.globalAlpha = 1;
      });
      ctx.restore();
      circle(ctx, cx, cy, 6, "#FFFFFF", 0); ctx.strokeStyle = FRAME; ctx.lineWidth = 2; ctx.stroke();
    });
  }

  /* ---------- orchestration ---------- */

  var RENDERERS = { word: drawWord, screens: drawScreens, field: drawField, scope: drawScope };

  function renderAll() {
    resetAnimations();
    Array.prototype.forEach.call(document.querySelectorAll("canvas[data-art]"), function (canvas) {
      var draw = RENDERERS[canvas.getAttribute("data-art")];
      if (!draw || !canvas.getContext) return;
      try { draw(canvas); } catch (e) { canvas.hidden = true; }
    });
  }

  function start() {
    var fonts = document.fonts && document.fonts.load
      ? Promise.all([document.fonts.load('800 100px "Geist"'), document.fonts.load('700 20px "IBM Plex Mono"')]).catch(function () { return null; })
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
