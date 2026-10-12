/* ============================================================
   The gentleman's garage: procedural 3D (three.js r149, vendored).
   Cars, F-22, watch, aviators, lighter, packs, hall, road finale.
   ============================================================ */
(function () {
  'use strict';
  var T = window.THREE, M = window.MAGIC, canvas = document.getElementById('bg');
  if (!T || !M || !canvas) { document.documentElement.classList.add('no-webgl'); return; }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer:coarse)').matches;
  var small = Math.min(innerWidth, innerHeight) < 700;

  var renderer;
  try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: !small, powerPreference: 'high-performance' }); }
  catch (err) { document.documentElement.classList.add('no-webgl'); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  var scene = new T.Scene();
  scene.background = new T.Color(0x050407);
  scene.fog = new T.FogExp2(0x050407, .014);
  var camera = new T.PerspectiveCamera(46, 1, .1, 700);

  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var clamp = function (x, a, b) { return Math.min(b, Math.max(a, x)); };
  var ss = function (a, b, x) { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
  var V = function (x, y, z) { return new T.Vector3(x, y, z); };

  /* ---------- textures ---------- */
  function canvasTex(w, h, draw) {
    var c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
  }
  var glowTex = canvasTex(128, 128, function (g, w) {
    var gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.3, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
  var envTex = canvasTex(1024, 512, function (g, w, h) {
    var gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#2a2a34'); gr.addColorStop(.3, '#4a4036'); gr.addColorStop(.5, '#e8c882'); gr.addColorStop(.58, '#2a2018'); gr.addColorStop(1, '#0a0806');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    try { g.filter = 'blur(7px)'; } catch (e) {}
    g.fillStyle = '#fff4dc';
    [[30, 40, 420, 46], [520, 30, 480, 40], [80, 110, 300, 34], [600, 120, 340, 30], [250, 175, 220, 28], [700, 180, 200, 26]].forEach(function (r) { g.fillRect(r[0], r[1], r[2], r[3]); });
    g.fillStyle = '#ffcf8a'; g.fillRect(520, 210, 130, 24);
  });
  envTex.mapping = T.EquirectangularReflectionMapping;
  var pm = new T.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(envTex).texture; pm.dispose();

  /* ---------- materials ---------- */
  var chrome = new T.MeshStandardMaterial({ color: 0xf4f4f4, metalness: 1, roughness: .05, envMapIntensity: 1.5 });
  var goldM = new T.MeshStandardMaterial({ color: 0xd9a84a, metalness: 1, roughness: .2 });
  var steel = new T.MeshStandardMaterial({ color: 0xb4bed6, metalness: .9, roughness: .3 });
  var glassM = new T.MeshStandardMaterial({ color: 0x03060a, metalness: .92, roughness: .04, transparent: true, opacity: .86, envMapIntensity: 1.4 });
  var rubber = new T.MeshStandardMaterial({ color: 0x0b0b0c, roughness: .9 });
  var dark = new T.MeshStandardMaterial({ color: 0x0c0b0e, roughness: .55, metalness: .3 });
  var leather = new T.MeshStandardMaterial({ color: 0xb98a5a, roughness: .55 });
  var cream = new T.MeshStandardMaterial({ color: 0xe6d8b8, roughness: .6 });
  var flakeTex = (function () {
    var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d'); g.fillStyle = 'rgb(128,128,255)'; g.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 5200; i++) { var x = Math.random() * 256, y = Math.random() * 256, r = Math.random() * 1.4 + .3; g.fillStyle = 'rgb(' + (110 + Math.random() * 36 | 0) + ',' + (110 + Math.random() * 36 | 0) + ',255)'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    var t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(10, 10); return t;
  })();
  function paint(hex) {
    return small ? new T.MeshStandardMaterial({ color: hex, metalness: .7, roughness: .28 })
      : new T.MeshPhysicalMaterial({ color: hex, metalness: .78, roughness: .34, clearcoat: 1, clearcoatRoughness: .035, normalMap: flakeTex, normalScale: new T.Vector2(.18, .18), envMapIntensity: 1.25 });
  }
  function glowMat(hex, k) { return new T.MeshStandardMaterial({ color: 0x1a1a1a, emissive: hex, emissiveIntensity: k || 0, roughness: .3 }); }

  /* ---------- geometry helpers ---------- */
  function rshape(pts) {
    var s = new T.Shape(), n = pts.length, P = pts.map(function (p) { return new T.Vector2(p[0], p[1]); });
    function cut(i, j, r) { var a = P[i], b = P[j], d = b.clone().sub(a), L = d.length() || 1; return a.clone().add(d.multiplyScalar(Math.min(r, L / 2) / L)); }
    for (var i = 0; i < n; i++) {
      var r = pts[i][2] || .0001, a = cut(i, (i + n - 1) % n, r), b = cut(i, (i + 1) % n, r);
      if (i === 0) s.moveTo(a.x, a.y); else s.lineTo(a.x, a.y);
      s.quadraticCurveTo(P[i].x, P[i].y, b.x, b.y);
    }
    s.closePath(); return s;
  }
  function slab(pts, depth, bev, holes) {
    var s = rshape(pts); (holes || []).forEach(function (h) { s.holes.push(rshape(h)); });
    var g = new T.ExtrudeGeometry(s, { depth: depth, bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev, bevelOffset: -bev, bevelSegments: 2, curveSegments: 6 });
    g.translate(0, 0, -depth / 2); return g;
  }
  function mesh(geo, mat, x, y, z) { var m = new T.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); return m; }
  function box(w, h, d, mat, x, y, z) { return mesh(new T.BoxGeometry(w, h, d), mat, x, y, z); }
  function cyl(r1, r2, h, mat, x, y, z, ax) { var m = mesh(new T.CylinderGeometry(r1, r2, h, 24), mat, x, y, z); if (ax === 'x') m.rotation.z = Math.PI / 2; if (ax === 'z') m.rotation.x = Math.PI / 2; return m; }
  function scalePts(pts, k) { var cx = 0, cy = 0; pts.forEach(function (p) { cx += p[0]; cy += p[1]; }); cx /= pts.length; cy /= pts.length; return pts.map(function (p) { return [cx + (p[0] - cx) * k, cy + (p[1] - cy) * k, p[2]]; }); }
  function shiftPts(pts, dx) { return pts.map(function (p) { return [p[0] + dx, p[1], p[2]]; }); }

  var tyreTex = canvasTex(512, 64, function (g, w, h) {
    g.fillStyle = '#0b0b0c'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2a2c'; g.font = '600 20px Jost, sans-serif'; g.textAlign = 'center';
    for (var i = 0; i < 3; i++) g.fillText('PREMIUM  PERFORMANCE  ·  255/35 R19  ·  W', 170 + i * 180, 38);
  });
  var gunmetal = new T.MeshStandardMaterial({ color: 0x1a1c20, metalness: 1, roughness: .22, envMapIntensity: 1.4 });
  var caliper = new T.MeshStandardMaterial({ color: 0xc8102e, metalness: .4, roughness: .35 });
  function makeWheel(R, Wd, wire) {
    var g = new T.Group(), sp = new T.Group(); g.add(sp);
    if (wire) {   // vintage wire wheel
      g.add(cyl(R, R, Wd, rubber, 0, 0, 0, 'z'));
      sp.add(cyl(R * .9, R * .9, Wd * 1.02, cream, 0, 0, 0, 'z')); sp.add(mesh(new T.TorusGeometry(R * .68, R * .05, 8, 40), chrome, 0, 0, Wd * .5));
      for (var k = 0; k < 24; k++) { var a2 = k / 24 * Math.PI * 2, sk = cyl(.006, .006, R * .56, chrome, Math.cos(a2) * R * .38, Math.sin(a2) * R * .38, Wd * .5, null); sk.rotation.z = a2 - Math.PI / 2; sp.add(sk); }
      sp.add(cyl(R * .14, R * .14, Wd * 1.1, goldM, 0, 0, 0, 'z')); g.userData.spin = sp; return g;
    }
    // tyre: lathe profile with rounded shoulders + sidewall lettering
    var pts = [], hw = Wd / 2, ri = R * .66;
    pts.push(new T.Vector2(ri, -hw * .96)); pts.push(new T.Vector2(R * .8, -hw)); pts.push(new T.Vector2(R * .96, -hw * .86)); pts.push(new T.Vector2(R, -hw * .5)); pts.push(new T.Vector2(R, hw * .5)); pts.push(new T.Vector2(R * .96, hw * .86)); pts.push(new T.Vector2(R * .8, hw)); pts.push(new T.Vector2(ri, hw * .96));
    var tg = new T.LatheGeometry(pts, 48); tg.rotateX(Math.PI / 2); g.add(new T.Mesh(tg, rubber));
    var lt = new T.Mesh(new T.RingGeometry(R * .74, R * .9, 48), new T.MeshBasicMaterial({ map: tyreTex, transparent: true, opacity: .55, depthWrite: false })); lt.position.z = hw * 1.001; g.add(lt);
    // rim: dished barrel + 10 slim spokes + lip + hub
    sp.add(cyl(ri, ri, Wd * .8, gunmetal, 0, 0, 0, 'z'));
    var lip = mesh(new T.TorusGeometry(ri * .99, R * .035, 10, 56), chrome, 0, 0, hw * .72); sp.add(lip);
    for (var j = 0; j < 10; j++) { var b2 = j / 10 * Math.PI * 2, spk = box(R * .075, ri * .78, Wd * .1, gunmetal, Math.cos(b2) * ri * .42, Math.sin(b2) * ri * .42, hw * .62); spk.rotation.z = b2 - Math.PI / 2; sp.add(spk); }
    sp.add(cyl(R * .13, R * .13, Wd * .9, chrome, 0, 0, hw * .3, 'z')); sp.add(cyl(R * .05, R * .05, Wd * .95, goldM, 0, 0, hw * .33, 'z'));
    // brake disc + caliper (stay still)
    g.add(cyl(R * .52, R * .52, Wd * .12, steel, 0, 0, -hw * .1, 'z'));
    var cal = box(R * .22, R * .34, Wd * .22, caliper, R * .36, R * .2, hw * .15); cal.rotation.z = -.5; g.add(cal);
    g.userData.spin = sp; return g;
  }

  /* ============================================================
     CAR BUILDER: smooth lofted hulls, hollow cabin, real door opening
     ============================================================ */
  function interp(pts, x) {
    if (x <= pts[0][0]) return pts[0][1]; var n = pts.length; if (x >= pts[n - 1][0]) return pts[n - 1][1];
    var i = 0; while (i < n - 2 && x > pts[i + 1][0]) i++; var t = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0]); t = t * t * (3 - 2 * t); return lerp(pts[i][1], pts[i + 1][1], t);
  }
  function sgnpow(v, p) { return Math.sign(v) * Math.pow(Math.abs(v), p); }
  // build loop sections; fn(x) -> {yb, yt, w, n, tumble}
  function sections(x0, x1, N, M, fn, capR0, capR1) {
    var out = [];
    for (var i = 0; i <= N; i++) {
      var x = lerp(x0, x1, i / N), d = fn(x), cap = 1, e0 = x - x0, e1 = x1 - x;
      if (e0 < capR0) cap = Math.min(cap, Math.sqrt(Math.max(0, 1 - Math.pow((capR0 - e0) / capR0, 2))));
      if (e1 < capR1) cap = Math.min(cap, Math.sqrt(Math.max(0, 1 - Math.pow((capR1 - e1) / capR1, 2))));
      cap = Math.max(cap, .015);
      var cy = (d.yb + d.yt) / 2, hy = (d.yt - d.yb) / 2 * Math.max(cap, .02), w = d.w * cap, loop = [];
      for (var j = 0; j < M; j++) {
        var th = -Math.PI / 2 + j / M * Math.PI * 2, c = Math.cos(th), sn = Math.sin(th), px = w * sgnpow(c, 2 / d.n), py = cy + hy * sgnpow(sn, 2 / d.n);
        if (sn > 0) px *= 1 - d.tumble * sn;
        loop.push(new T.Vector3(x, py, px));
      }
      out.push(loop);
    }
    return out;
  }
  function loftGeo(secs, skip, only, groupFn) {
    var N = secs.length, M = secs[0].length, pos = [], idx = [], gi = [[], []];
    secs.forEach(function (s) { s.forEach(function (v) { pos.push(v.x, v.y, v.z); }); });
    for (var i = 0; i < N - 1; i++) for (var j = 0; j < M; j++) {
      if (skip && skip(i, j)) continue; if (only && !only(i, j)) continue;
      var a = i * M + j, b = i * M + (j + 1) % M, c = (i + 1) * M + (j + 1) % M, d = (i + 1) * M + j, tgt = groupFn ? groupFn(i, j) : 0;
      gi[tgt].push(a, d, b, b, d, c);
    }
    var g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    if (groupFn) { var all = gi[0].concat(gi[1]); g.setIndex(all); g.addGroup(0, gi[0].length, 0); g.addGroup(gi[0].length, gi[1].length, 1); } else g.setIndex(gi[0]);
    g.computeVertexNormals(); return g;
  }

  function buildCar(S) {
    var car = new T.Group(), W2 = S.hw, body = S.mat, tr = {}, M = 40, N = 90;
    car.userData.wheels = [];
    var hullFn = function (x) { return { yb: interp(S.bottom, x), yt: interp(S.top, x), w: interp(S.width, x), n: S.n || 3.4, tumble: S.tum == null ? .1 : S.tum }; };
    var secs = sections(S.x0, S.x1, N, M, hullFn, S.cap0, S.cap1);
    // door patch indices: sections inside [dx0,dx1], angles on +z side
    var jlo = Math.round(M * (-.5 / (Math.PI * 2) + .25)), jhi = Math.round(M * (.52 / (Math.PI * 2) + .25));
    var topLo = Math.round(M * .25 + M * .12), topHi = Math.round(M * .75 - M * .12);
    var doorSkip = function (i, j) { var x = secs[i][0].x; return (x > S.d0 && x < S.d1 && j >= jlo && j < jhi) || (x > S.g0 + .1 && x < S.g1 - .1 && j >= topLo && j <= topHi); };
    var hull = new T.Mesh(loftGeo(secs, doorSkip), body); car.add(hull);
    var liner = new T.Mesh(loftGeo(secs), new T.MeshStandardMaterial({ color: 0x14100d, roughness: .8, side: T.BackSide })); liner.scale.set(.985, .985, .96); liner.position.y = .008; car.add(liner);
    // door: same surface patch, hinged at the front edge
    var hinge = S.d1, dg = loftGeo(secs, null, function (i, j) { var x = secs[i][0].x; return x > S.d0 && x < S.d1 && j >= jlo && j < jhi; }); dg.translate(-hinge, 0, 0); dg.computeVertexNormals();
    var pivot = new T.Group(); pivot.position.set(hinge, 0, 0); var dm = new T.Mesh(dg, body); dm.scale.set(1, 1, 1.004); pivot.add(dm); car.add(pivot); car.userData.door = pivot;
    // greenhouse (glass) + painted roof cap
    var ghFn = function (x) { var yt = interp(S.roof, x), yb = interp(S.top, x) - .03; return { yb: yb, yt: Math.max(yt, yb + .001), w: interp(S.gw, x), n: S.gn || 2.6, tumble: S.gt }; };
    var gsec = sections(S.g0, S.g1, 50, 28, ghFn, .05, .05);
    var topJ = function (i, j) { var a = -Math.PI / 2 + (j + .5) / 28 * Math.PI * 2; return Math.sin(a) > .86; };
    var gg = loftGeo(gsec, null, null, function (i, j) { return topJ(i, j) ? 1 : 0; });
    car.add(new T.Mesh(gg, [glassM, body]));
    // pillars (thin painted strips along glass corners)
    // wheels + arch discs
    S.wheelX.forEach(function (wx) {
      var wz = interp(S.width, wx) * 1.0;
      [1, -1].forEach(function (side) {
        var arch = new T.Mesh(new T.CircleGeometry(S.arch, 32, 0, Math.PI), new T.MeshBasicMaterial({ color: 0x050505 })); arch.position.set(wx, S.wheelR, side * (wz + .006)); if (side < 0) arch.rotation.y = Math.PI; car.add(arch);
        var wh = makeWheel(S.wheelR, S.wheelW, false); wh.position.set(wx, S.wheelR, side * (wz - S.wheelW / 2 + .03)); car.add(wh); car.userData.wheels.push(wh);
      });
    });
    // interior
    var I = S.int;
    [.44, -.44].forEach(function (z) {
      car.add(box(.52, .13, .5, leather, I.x, I.y, z)); var bk = box(.12, .62, .5, leather, I.x - .32, I.y + .34, z); bk.rotation.z = -.2; car.add(bk); car.add(box(.1, .18, .3, leather, I.x - .4, I.y + .76, z));
    });
    car.add(box(.5, .5, 1.4, leather, I.x - 1.0, I.y + .1, 0)); car.add(box(.18, .5, 1.4, leather, I.x - 1.3, I.y + .35, 0));
    car.add(box(.5, .24, 1.7, dark, I.dx, I.dy, 0)); car.add(box(1.3, .05, 1.7, dark, I.x - .2, .36, 0));
    var sw = mesh(new T.TorusGeometry(.16, .022, 10, 28), dark, I.dx - .2, I.dy + .2, S.drv); sw.rotation.y = Math.PI / 2; sw.rotation.x = .3; car.add(sw);
    var led = glowMat(0xffb35a, 0); car.add(box(1.3, .018, .018, led, .1, .42, interp(S.width, .1) - .02)); tr.led = led;
    var cab = new T.PointLight(0xffc27a, 0, 4.5, 2); cab.position.set(I.x, I.y + .5, .3); car.add(cab); tr.cab = cab;
    tr.head = glowMat(0xfff0c8, 0); tr.tail = glowMat(0xff2418, .5); tr.amber = glowMat(0xffa020, 0);
    S.extras(car, tr, S);
    tr.beams = [-1, 1].map(function (s) { var b = new T.SpotLight(0xfff0d0, 0, 22, .42, .6, 1.4); b.position.set(S.x1 - .15, S.lampY, s * .6); b.target.position.set(S.x1 + 10, .2, s * .5); car.add(b); car.add(b.target); return b; });
    var sh = mesh(new T.PlaneGeometry((S.x1 - S.x0) * 1.25, 2.9), new T.MeshBasicMaterial({ map: glowTex, color: 0x000000, transparent: true, opacity: .75, depthWrite: false }), (S.x0 + S.x1) / 2, .012, 0); sh.rotation.x = -Math.PI / 2; car.add(sh);
    car.userData.t = tr; car.userData.hit = S.hitR; return car;
  }

  var SPECS = {
    bmw: {
      mat: paint(0x16315f), n: 4.6, tum: .07, x0: -2.4, x1: 2.4, cap0: .3, cap1: .42, hw: .93, drv: .44, lampY: .72, wheelR: .36, wheelW: .26, arch: .43, wheelX: [1.42, -1.38], hitR: 2.6,
      bottom: [[-2.4, .44], [-2.2, .33], [2.1, .33], [2.4, .42]],
      top: [[-2.4, .66], [-2.25, .9], [-1.8, 1.0], [-1.0, 1.03], [1.0, 1.0], [1.6, .93], [2.1, .8], [2.4, .66]],
      width: [[-2.4, .6], [-2.1, .86], [-1.2, .93], [1.2, .93], [2.0, .88], [2.4, .7]],
      g0: -1.62, g1: 1.08, roof: [[-1.62, 1.03], [-1.0, 1.4], [-.2, 1.5], [.45, 1.47], [1.08, 1.0]], gw: [[-1.62, .66], [-1.0, .84], [.3, .86], [1.08, .8]], gt: .14,
      d0: -.62, d1: .96, int: { x: -.05, y: .52, dx: .8, dy: .86 },
      extras: function (car, tr, S) {
        [-1, 1].forEach(function (s) {
          car.add(box(.18, .09, .4, tr.head, 2.22, .7, s * .56)); var ae = mesh(new T.TorusGeometry(.065, .012, 8, 24), tr.head, 2.32, .7, s * .56); ae.rotation.y = Math.PI / 2; car.add(ae);
          car.add(box(.04, .16, .16, dark, 2.4, .58, s * .12)); car.add(box(.045, .016, .18, chrome, 2.405, .67, s * .12)); car.add(box(.045, .016, .18, chrome, 2.405, .49, s * .12));
          car.add(box(.05, .09, .4, tr.tail, -2.37, .84, s * .6)); car.add(box(.1, .02, .36, tr.amber, 2.3, .52, s * .62));
          car.add(cyl(.045, .045, .14, chrome, -2.4, .42, s * .5, 'x')); car.add(box(.12, .07, .14, S.mat, .9, 1.04, s * (.93 + .05)));
        });
        car.add(box(.03, .12, .4, new T.MeshStandardMaterial({ color: 0xf2f2f2, roughness: .5 }), 2.42, .42, 0)); car.add(box(.3, .05, 1.7, dark, 2.3, .36, 0)); car.add(box(.2, .06, 1.5, dark, -2.36, .38, 0));
      }
    },
    civic: {
      mat: paint(0x0b0c11), n: 4.6, tum: .07, x0: -2.33, x1: 2.33, cap0: .3, cap1: .42, hw: .9, drv: .43, lampY: .7, wheelR: .34, wheelW: .25, arch: .41, wheelX: [1.4, -1.38], hitR: 2.5,
      bottom: [[-2.33, .42], [-2.1, .32], [2.0, .32], [2.33, .4]],
      top: [[-2.33, .64], [-2.2, .92], [-1.4, 1.0], [1.0, .97], [1.55, .9], [2.0, .78], [2.33, .62]],
      width: [[-2.33, .6], [-2.0, .84], [-1.2, .9], [1.2, .9], [2.0, .85], [2.33, .68]],
      g0: -1.7, g1: 1.04, roof: [[-1.7, 1.0], [-.95, 1.36], [.1, 1.46], [.5, 1.42], [1.04, .97]], gw: [[-1.7, .66], [-.9, .82], [.3, .84], [1.04, .78]], gt: .14,
      d0: -.6, d1: .95, int: { x: -.05, y: .5, dx: .8, dy: .84 },
      extras: function (car, tr, S) {
        var mm = new T.MeshStandardMaterial({ color: 0x050506, roughness: .5, metalness: .4 });
        car.add(box(.05, .13, .95, mm, 2.28, .5, 0)); car.add(box(.055, .016, .95, chrome, 2.285, .58, 0)); car.add(box(.06, .1, .18, chrome, 2.3, .54, 0));
        [-1, 1].forEach(function (s) {
          car.add(box(.16, .07, .5, tr.head, 2.18, .72, s * .54)); car.add(box(.05, .08, .46, tr.tail, -2.3, .88, s * .56)); car.add(cyl(.04, .04, .12, chrome, -2.34, .4, s * .55, 'x')); car.add(box(.12, .07, .14, S.mat, .88, 1.0, s * (.9 + .05)));
        });
        car.add(box(.05, .035, 1.2, tr.tail, -2.33, .9, 0)); var sp = box(.22, .03, 1.5, S.mat, -2.16, 1.06, 0); sp.rotation.z = .12; car.add(sp);
        car.add(box(.36, .05, 1.7, dark, 2.15, .35, 0)); car.add(box(.2, .06, 1.5, dark, -2.28, .36, 0)); car.add(box(.03, .12, .4, new T.MeshStandardMaterial({ color: 0xeaeaea, roughness: .5 }), 2.34, .4, 0));
      }
    },
    hilux: {
      mat: paint(0xe6e2da), n: 4.6, gn: 3.2, tum: .04, x0: -1.55, x1: 2.72, cap0: .06, cap1: .16, hw: .97, drv: .5, lampY: 1.02, wheelR: .46, wheelW: .3, arch: .56, wheelX: [1.78, -1.0], hitR: 3,
      bottom: [[-1.55, .5], [-1.2, .46], [2.4, .46], [2.72, .55]],
      top: [[-1.55, 1.32], [.6, 1.34], [1.5, 1.24], [2.5, 1.18], [2.72, 1.02]],
      width: [[-3.0, .96], [-1.0, .97], [2.3, .96], [2.72, .84]],
      g0: -1.5, g1: .75, roof: [[-1.5, 1.32], [-1.35, 1.88], [.1, 1.94], [.75, 1.34]], gw: [[-1.5, .9], [-1.3, .92], [.1, .92], [.75, .86]], gt: .1,
      d0: -.34, d1: .56, int: { x: -.05, y: .62, dx: .72, dy: .98 },
      extras: function (car, tr, S) {
        var W = 1.94, b0 = S.mat;
        car.add(box(1.4, .08, W - .12, dark, -2.25, .9, 0));
        [1, -1].forEach(function (s) { car.add(box(1.4, .46, .07, b0, -2.25, 1.13, s * (W / 2 - .04))); });
        car.add(box(.06, .46, W - .1, b0, -2.95, 1.13, 0)); car.add(box(1.6, .3, W - .5, dark, -2.2, .62, 0));
        car.add(box(.08, .4, W - .1, b0, -1.58, 1.14, 0));
        [1, -1].forEach(function (s) {
          car.add(cyl(.03, .03, .85, chrome, -1.8, 1.35, s * .8, null)); car.add(box(.14, .13, .5, tr.head, 2.6, 1.04, s * .6)); car.add(box(.05, .1, .4, tr.tail, -2.97, 1.14, s * .7));
          car.add(box(.1, .14, .3, tr.amber, 2.64, .66, s * .6)); car.add(box(.12, .08, .16, b0, .8, 1.3, s * (.97 + .05)));
          car.add(box(1.9, .06, .14, steel, -.2, .5, s * (.97 + .06)));
        });
        car.add(cyl(.03, .03, 1.6, chrome, -1.8, 1.78, 0, 'z'));
        car.add(box(.05, .32, 1.1, dark, 2.66, .84, 0)); car.add(box(.055, .05, 1.15, chrome, 2.665, .96, 0)); car.add(box(.4, .08, W - .06, dark, 2.5, .52, 0)); car.add(box(.08, .06, .4, steel, -2.98, .5, 0));
      }
    }
  };
  // hilux: wheels need to be repositioned for the long bed: rear axle sits under the bed
  SPECS.hilux.wheelX = [1.78, -1.5];
  var hiluxBedX = true; // bed extends past the hull to x=-2.95

  /* ============================================================
     ANTIQUE ROADSTER (1930s grand tourer): open cockpit, swooping fenders
     ============================================================ */
  function strip(arc, z0, z1, mat) {   // arc: [[x,y],...] swept along z
    var pos = [], idx = [], n = arc.length;
    arc.forEach(function (p) { pos.push(p[0], p[1], z0, p[0], p[1], z1); });
    for (var i = 0; i < n - 1; i++) { var a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3; idx.push(a, c, b, b, c, d); }
    var g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    var m = mat.clone(); m.side = T.DoubleSide; return new T.Mesh(g, m);
  }
  function buildAntique() {
    var car = new T.Group(), burg = paint(0x5c0f1e), blk = new T.MeshStandardMaterial({ color: 0x0b0a0a, metalness: .6, roughness: .28 }), tr = {};
    car.userData.wheels = [];
    var X0 = -2.3, X1 = 1.95, M = 36;
    var hfn = function (x) { return { yb: .64, yt: interp([[-2.3, .92], [-2.0, 1.06], [-1.0, 1.08], [.3, 1.1], [.62, 1.2], [1.9, 1.22], [1.95, 1.1]], x), w: interp([[-2.3, .5], [-2.0, .8], [-1.0, .82], [.3, .8], [.7, .5], [1.95, .48]], x), n: 2.8, tumble: .04 }; };
    var secs = sections(X0, X1, 80, M, hfn, .5, .08);
    var tlo = Math.round(M * .25 + M * .08), thi = Math.round(M * .75 - M * .08);
    var openTop = function (i, j) { var x = secs[i][0].x; return x > -1.95 && x < .3 && j >= tlo && j <= thi; };
    car.add(new T.Mesh(loftGeo(secs, openTop), burg));
    var liner = new T.Mesh(loftGeo(secs), new T.MeshStandardMaterial({ color: 0xcdb98e, roughness: .6, side: T.BackSide })); liner.scale.set(.985, .985, .95); liner.position.y = .01; car.add(liner);
    // chassis, running boards, fenders, wheels
    [1, -1].forEach(function (s) { car.add(box(4.6, .1, .12, blk, -.1, .5, s * .5)); car.add(box(2.4, .05, .4, blk, -.3, .6, s * .98)); car.add(box(2.4, .018, .03, chrome, -.3, .64, s * 1.18)); });
    car.add(cyl(.04, .04, 1.7, blk, 1.5, .5, 0, 'z')); car.add(cyl(.04, .04, 1.7, blk, -1.2, .5, 0, 'z'));
    var WX = [1.5, -1.2], R = .5;
    WX.forEach(function (x) {
      [1, -1].forEach(function (s) {
        var wh = makeWheel(R, .17, true); wh.position.set(x, R, s * .98); car.add(wh); car.userData.wheels.push(wh);
        var arc = []; for (var k = 0; k <= 26; k++) { var a = (200 - k / 26 * 220) * Math.PI / 180; arc.push([x + Math.cos(a) * .68 * (x > 0 ? 1 : 1), R + .02 + Math.sin(a) * .68]); }
        car.add(strip(arc, s * .98 - .22, s * .98 + .22, blk));
        var arc2 = arc.map(function (p) { return [p[0], p[1] - .0]; }); // thin lip highlight
        car.add(strip(arc2.map(function (p) { return [p[0], p[1] + .015]; }), s * .98 + .22, s * .98 + .24, new T.MeshStandardMaterial({ color: 0xe0c070, metalness: 1, roughness: .2 })));
      });
    });
    // hood details + radiator shell
    for (var l = 0; l < 12; l++) [1, -1].forEach(function (s) { car.add(box(.025, .15, .01, blk, .85 + l * .09, 1.06, s * .475)); });
    car.add(box(1.5, .02, .018, chrome, 1.25, 1.23, 0));
    car.add(box(.2, .98, .86, chrome, 2.08, .92, 0)); for (var r = 0; r < 14; r++) car.add(box(.215, .8, .012, blk, 2.08, .92, -.37 + r * .057));
    car.add(mesh(new T.ConeGeometry(.035, .16, 8), goldM, 2.08, 1.48, 0)); car.add(mesh(new T.SphereGeometry(.045, 10, 8), goldM, 2.08, 1.4, 0));
    tr.head = glowMat(0xfff0c8, 0); tr.tail = glowMat(0xff2418, .4);
    [1, -1].forEach(function (s) {
      var lamp = mesh(new T.SphereGeometry(.2, 20, 16), chrome, 1.95, 1.18, s * .64); lamp.scale.set(.8, 1, 1); car.add(lamp);
      var gl = mesh(new T.CircleGeometry(.16, 20), tr.head, 2.13, 1.18, s * .64); gl.rotation.y = Math.PI / 2; car.add(gl); car.add(cyl(.02, .02, .34, chrome, 1.93, 1.0, s * .62, null));
      car.add(cyl(.05, .05, 1.9, chrome, .2, .42, s * 1.04, 'x')); car.add(box(.1, .1, .1, tr.tail, -2.36, 1.0, s * .55));
    });
    car.add(cyl(.02, .02, 1.3, chrome, 1.9, 1.0, 0, 'z'));
    // cockpit
    [.36, -.36].forEach(function (z) { car.add(box(.56, .16, .58, cream, -.45, .82, z)); var bk = box(.12, .7, .58, cream, -.74, 1.16, z); bk.rotation.z = -.18; car.add(bk); });
    car.add(box(.5, .16, 1.34, cream, -1.45, .82, 0)); car.add(box(.14, .5, 1.34, cream, -1.72, 1.04, 0)); car.add(box(.2, .5, 1.5, burg, .24, 1.0, 0));
    var sw = mesh(new T.TorusGeometry(.21, .02, 8, 28), blk, -.02, 1.26, .36); sw.rotation.y = Math.PI / 2; sw.rotation.x = .55; car.add(sw);
    var col = cyl(.016, .016, .4, chrome, .12, 1.08, .36, null); col.rotation.z = .9; car.add(col);
    var wg = box(.02, .5, 1.3, glassM, .52, 1.5, 0); wg.rotation.z = -.2; car.add(wg); car.add(box(.03, .03, 1.36, chrome, .6, 1.76, 0));
    [1, -1].forEach(function (s) { var p = box(.03, .56, .03, chrome, .56, 1.5, s * .66); p.rotation.z = -.2; car.add(p); });
    var top = mesh(new T.CylinderGeometry(.14, .14, 1.4, 20), blk, -2.05, 1.18, 0); top.rotation.x = Math.PI / 2; car.add(top);
    var spare = makeWheel(R * .9, .2, true); spare.rotation.y = Math.PI / 2; spare.position.set(-2.6, .86, 0); car.add(spare); car.add(box(.1, .06, .5, chrome, -2.52, .56, 0));
    tr.beams = [-1, 1].map(function (s) { var b = new T.SpotLight(0xfff0d0, 0, 22, .4, .6, 1.4); b.position.set(2.0, 1.15, s * .64); b.target.position.set(12, .3, s * .5); car.add(b); car.add(b.target); return b; });
    tr.exhaust = V(-2.6, .42, .74);
    var sh = mesh(new T.PlaneGeometry(6.4, 3), new T.MeshBasicMaterial({ map: glowTex, color: 0x000000, transparent: true, opacity: .75, depthWrite: false }), -.1, .012, 0); sh.rotation.x = -Math.PI / 2; car.add(sh);
    car.userData.t = tr; car.userData.hit = 3.2; return car;
  }

  /* ============================================================
     F-22 RAPTOR
     ============================================================ */
  function buildRaptor() {
    var g = new T.Group(), gm = new T.MeshStandardMaterial({ color: 0x2c3038, metalness: .35, roughness: .55 }), gm2 = new T.MeshStandardMaterial({ color: 0x1d2025, metalness: .4, roughness: .55 });
    function planform(pts, thick, mat) { var sg = slab(pts, thick, .02); sg.rotateX(Math.PI / 2); return new T.Mesh(sg, mat); }
    // wings
    g.add(planform([[.9, .35, 0], [-.7, 2.15, 0], [-1.15, 2.15, 0], [-1.15, .7, 0], [-1.15, -.7, 0], [-1.15, -2.15, 0], [-.7, -2.15, 0], [.9, -.35, 0]], .07, gm));
    // tailplanes
    g.add(planform([[-1.7, .3, 0], [-2.6, 1.3, 0], [-3.0, 1.3, 0], [-2.8, .3, 0], [-2.8, -.3, 0], [-3.0, -1.3, 0], [-2.6, -1.3, 0], [-1.7, -.3, 0]], .05, gm));
    // fuselage: lofted, pointed nose, flat chined belly
    var fsec = sections(-3.2, 3.7, 70, 24, function (x) { return { yb: interp([[-3.2, -.2], [-2, -.3], [0, -.34], [1.8, -.2], [3.7, 0]], x), yt: interp([[-3.2, .2], [-2, .36], [0, .42], [1.8, .32], [3.7, .02]], x), w: interp([[-3.2, .34], [-2, .56], [0, .66], [1.8, .46], [3.7, .02]], x), n: 2.3, tumble: .12 }; }, .2, 1.1);
    g.add(new T.Mesh(loftGeo(fsec), gm));
    [1, -1].forEach(function (s) {
      var intake = box(1.2, .22, .3, gm2, 1.15, -.12, s * .5); intake.rotation.y = -s * .07; g.add(intake);
      var vt = mesh(slab([[.5, 0, .01], [-.9, 0, .01], [-1.3, 1.0, .02], [-.55, 1.05, .02]], .045, .01), gm, -2.0, .2, s * .52); vt.rotation.x = s * .48; g.add(vt);
      var noz = cyl(.2, .26, .5, steel, -3.05, 0, s * .3, 'x'); g.add(noz);
    });
    var can = mesh(new T.SphereGeometry(1, 28, 16), new T.MeshPhysicalMaterial({ color: 0xc89a3a, metalness: .9, roughness: .06, transparent: true, opacity: .92 }), 2.0, .3, 0); can.scale.set(.95, .26, .3); g.add(can);
    var burn = new T.MeshBasicMaterial({ color: 0xff9a3a, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false });
    g.userData.burn = [];
    [1, -1].forEach(function (s) { var f = mesh(new T.ConeGeometry(.2, 1.8, 16, 1, true), burn, -3.95, 0, s * .3); f.rotation.z = Math.PI / 2; g.add(f); g.userData.burn.push(f); var gl = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffa04a, blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0, fog: false, toneMapped: false })); gl.scale.set(2.2, 2.2, 1); gl.position.set(-3.2, 0, s * .3); g.add(gl); g.userData.burn.push(gl); });
    g.userData.burnMat = burn; g.userData.hit = 3.2;
    g.scale.setScalar(1.15); return g;
  }

  /* ============================================================
     OBJECTS: watch, aviators, lighter, packs
     ============================================================ */
  function makeWatch() {
    var g = new T.Group();
    var dial = canvasTex(512, 512, function (c, w) {
      var gr = c.createRadialGradient(w / 2, w / 2, 20, w / 2, w / 2, w / 2); gr.addColorStop(0, '#1b2a4a'); gr.addColorStop(1, '#05070d'); c.fillStyle = gr; c.fillRect(0, 0, w, w);
      c.translate(w / 2, w / 2);
      for (var i = 0; i < 60; i++) { c.save(); c.rotate(i / 60 * Math.PI * 2); c.fillStyle = i % 5 ? '#b8a37a' : '#f0d58f'; c.fillRect(-2, -236, i % 5 ? 3 : 8, i % 5 ? 14 : 34); c.restore(); }
      [[0, -110], [-110, 0], [110, 0], [0, 110]].forEach(function (p, k) { c.strokeStyle = '#8d7440'; c.lineWidth = 3; c.beginPath(); c.arc(p[0], p[1], 52, 0, 7); c.stroke(); c.fillStyle = '#0a0f1c'; c.fill(); });
      c.fillStyle = '#e8cf94'; c.font = '600 26px Cinzel, serif'; c.textAlign = 'center'; c.fillText('AUTOMATIC', 0, -150); c.font = '500 18px Cinzel, serif'; c.fillText('CHRONOMETER', 0, 178);
    });
    var cs = mesh(new T.CylinderGeometry(.62, .62, .2, 56), goldM, 0, 0, 0); cs.rotation.x = Math.PI / 2; g.add(cs);
    g.add(mesh(new T.TorusGeometry(.6, .06, 16, 64), goldM, 0, 0, .1));
    var dm = new T.Mesh(new T.CircleGeometry(.56, 64), new T.MeshStandardMaterial({ map: dial, roughness: .4, metalness: .2 })); dm.position.z = .102; g.add(dm);
    var gl = new T.Mesh(new T.CircleGeometry(.56, 48), new T.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: .02, transparent: true, opacity: .12, clearcoat: 1 })); gl.position.z = .125; g.add(gl);
    function hand(len, w, mat) { var p = new T.Group(); var b = box(w, len, .012, mat, 0, len / 2 - .05, 0); p.add(b); p.position.z = .12; g.add(p); return p; }
    g.userData.h = hand(.3, .035, goldM); g.userData.m = hand(.46, .026, goldM); g.userData.s = hand(.5, .01, new T.MeshStandardMaterial({ color: 0xff4a2a, roughness: .3 }));
    g.add(cyl(.05, .05, .1, goldM, .66, 0, 0, 'x'));
    var strap = new T.MeshStandardMaterial({ color: 0x2a1a10, roughness: .6 });
    [1, -1].forEach(function (s) { var st = box(.46, 1.0, .06, strap, 0, s * .98, -.12); st.rotation.x = -s * .35; g.add(st); g.add(box(.5, .14, .18, goldM, 0, s * .66, 0)); });
    g.userData.hit = 1.1; return g;
  }

  function makeAviators() {
    var g = new T.Group();
    function tear(k) { var s = new T.Shape(); s.moveTo(0, .5 * k); s.bezierCurveTo(.55 * k, .5 * k, .62 * k, -.1 * k, .25 * k, -.45 * k); s.bezierCurveTo(.05 * k, -.6 * k, -.45 * k, -.45 * k, -.55 * k, -.05 * k); s.bezierCurveTo(-.6 * k, .35 * k, -.3 * k, .5 * k, 0, .5 * k); return s; }
    var lensM = new T.MeshPhysicalMaterial({ color: 0x14221d, metalness: .85, roughness: .05, transparent: true, opacity: .9, clearcoat: 1 });
    [-1, 1].forEach(function (s) {
      var outer = tear(1); outer.holes.push((function () { var h = tear(.9); return h; })());
      var fg = new T.ExtrudeGeometry(outer, { depth: .035, bevelEnabled: false, curveSegments: 20 }); var fm = new T.Mesh(fg, goldM); fm.position.set(s * .66, 0, -.017); if (s < 0) fm.scale.x = -1; g.add(fm);
      var lg = new T.ExtrudeGeometry(tear(.92), { depth: .012, bevelEnabled: false, curveSegments: 20 }); var lm = new T.Mesh(lg, lensM); lm.position.set(s * .66, 0, -.006); if (s < 0) lm.scale.x = -1; g.add(lm);
      var temple = cyl(.018, .018, 1.7, goldM, s * 1.2, .38, -.85, null); temple.rotation.x = Math.PI / 2; temple.rotation.z = s * .06; g.add(temple);
      g.add(mesh(new T.SphereGeometry(.05, 10, 8), goldM, s * 1.22, .38, -1.7));
    });
    var br = mesh(new T.TorusGeometry(.16, .02, 8, 24, Math.PI), goldM, 0, .38, 0); g.add(br); g.add(box(.5, .025, .025, goldM, 0, .5, 0));
    g.userData.hit = 1.2; return g;
  }

  function makeLighter() {
    var g = new T.Group(), brass = new T.MeshStandardMaterial({ color: 0xd4a548, metalness: 1, roughness: .25 });
    g.add(mesh(slab([[-.28, 0, .06], [.28, 0, .06], [.28, .62, .06], [-.28, .62, .06]], .2, .02), brass, 0, 0, 0));
    var lid = new T.Group(); lid.position.set(-.28, .62, 0); lid.rotation.z = .9; g.add(lid); lid.add(mesh(slab([[0, 0, .05], [.56, 0, .05], [.56, .3, .06], [0, .3, .06]], .2, .02), brass, 0, 0, 0));
    g.add(cyl(.07, .07, .18, steel, .12, .74, 0, 'z')); g.add(cyl(.05, .05, .22, dark, .12, .7, 0, null));
    var fl = new T.Mesh(new T.ConeGeometry(.08, .3, 14), new T.MeshBasicMaterial({ color: 0xffb040, toneMapped: false, transparent: true, opacity: .95 })); fl.position.set(.12, .96, 0); g.add(fl); g.userData.flame = fl;
    var fg = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffa040, blending: T.AdditiveBlending, depthWrite: false, transparent: true, fog: false, toneMapped: false })); fg.scale.set(.9, .9, 1); fg.position.set(.12, .95, 0); g.add(fg); g.userData.fg = fg;
    var pl = new T.PointLight(0xffa040, .8, 5, 2); pl.position.set(.12, 1.0, .2); g.add(pl); g.userData.pl = pl;
    g.userData.hit = .8; return g;
  }

  function makePack(kind) {
    var tex = canvasTex(256, 400, function (c, w, h) {
      if (kind === 'gold') {
        var gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f2e2b0'); gr.addColorStop(1, '#c9a24a'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
        c.fillStyle = '#7a1a22'; c.fillRect(0, 0, w, 60); c.fillStyle = '#1c1408'; c.textAlign = 'center'; c.font = '700 44px Cinzel, serif'; c.fillText('GOLD', w / 2, 170); c.fillText('LEAF', w / 2, 220);
        c.font = '500 20px Cinzel, serif'; c.fillText('F I L T E R', w / 2, 270); c.strokeStyle = '#7a1a22'; c.lineWidth = 4; c.strokeRect(14, 100, w - 28, 210);
      } else {
        c.fillStyle = '#f4f1ea'; c.fillRect(0, 0, w, h); c.fillStyle = '#c2151c'; c.beginPath(); c.moveTo(0, 0); c.lineTo(w, 0); c.lineTo(w, 200); c.lineTo(w / 2, 280); c.lineTo(0, 200); c.closePath(); c.fill();
        c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = 'italic 700 46px Cormorant Garamond, serif'; c.fillText('Marlboro', w / 2, 150); c.fillStyle = '#222'; c.font = '500 18px Cinzel, serif'; c.fillText('F I L T E R', w / 2, 340);
      }
    });
    var side = new T.MeshStandardMaterial({ color: kind === 'gold' ? 0xc9a24a : 0xeee9df, roughness: .5 });
    var front = new T.MeshStandardMaterial({ map: tex, roughness: .45 });
    var mats = [side, side, side, side, front, front];
    var b = new T.Mesh(new T.BoxGeometry(.62, .96, .24), mats); b.rotation.y = 0; var g = new T.Group(); g.add(b); g.userData.hit = .62; return g;
  }

  /* ============================================================
     WORLD
     ============================================================ */
  var world = new T.Group(); scene.add(world);
  var floor = mesh(new T.PlaneGeometry(60, 460), new T.MeshStandardMaterial({ color: 0x050406, roughness: .22, metalness: .5, transparent: true, opacity: small ? 1 : .8, envMapIntensity: .1 }), 0, 0, -170); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  scene.add(new T.HemisphereLight(0x9c8a6a, 0x060504, .38));
  var key = new T.DirectionalLight(0xffe2b0, .35); key.position.set(-6, 12, 8); scene.add(key);

  var STATIONS = {
    bmw: { x: 0, z: 0 }, hilux: { x: -3.2, z: -15 }, civic: { x: 3.2, z: -30 }, antique: { x: -3, z: -46 }, raptor: { x: 0, z: -62 }, plinth: { x: 0, z: -78 }
  };
  var cars = {}, podiums = [], spots = [], cones = [], mirrors = [];
  function podium(x, z, r) {
    var g = new T.Group(); g.position.set(x, 0, z);
    g.add(mesh(new T.CylinderGeometry(r, r * 1.03, .16, 56), new T.MeshStandardMaterial({ color: 0x0b0a0d, metalness: .7, roughness: .22 }), 0, .08, 0));
    var ring = mesh(new T.TorusGeometry(r * .985, .035, 10, 72), new T.MeshStandardMaterial({ color: 0xf0c872, emissive: 0xd9a84a, emissiveIntensity: .9, metalness: 1, roughness: .3 }), 0, .17, 0); ring.rotation.x = Math.PI / 2; g.add(ring);
    scene.add(g); podiums.push(g); return g;
  }
  function spot(x, z, intensity, tx, tz) {
    var s = new T.SpotLight(0xffe2b0, intensity, 40, .6, .75, 1.1); s.position.set(x + 1.5, 11, z + 2); s.target.position.set(tx == null ? x : tx, .5, tz == null ? z : tz); scene.add(s); scene.add(s.target); spots.push(s);
    var cone = mesh(new T.ConeGeometry(3.4, 11, 32, 1, true), new T.MeshBasicMaterial({ map: glowTex, color: 0xffd899, transparent: true, opacity: .05, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false }), x + .75, 5.5, z + 1); cone.rotation.z = .05; scene.add(cone); cones.push(cone); return s;
  }
  function place(key, obj, st, rotY, mirror) {
    obj.position.set(st.x, .16, st.z); obj.rotation.y = rotY || 0; scene.add(obj); cars[key] = obj;
    if (mirror && !small) { var m = obj.clone(true); var dead = []; m.traverse(function (n) { if (n.isLight) dead.push(n); }); dead.forEach(function (n) { if (n.parent) n.parent.remove(n); }); m.scale.y = -1; m.position.y = -.16; scene.add(m); mirrors.push({ src: obj, m: m }); }
  }
  // cars
  var bmw = buildCar(SPECS.bmw), hilux = buildCar(SPECS.hilux), civic = buildCar(SPECS.civic), antique = buildAntique(), raptor = buildRaptor();
  [['bmw', 'bmw', 3.1], ['hilux', 'hilux', 3.4], ['civic', 'civic', 3.1], ['antique', 'antique', 3.5]].forEach(function (a) { podium(STATIONS[a[0]].x, STATIONS[a[0]].z, a[2]); });
  podium(STATIONS.raptor.x, STATIONS.raptor.z, 3.8);
  place('bmw', bmw, STATIONS.bmw, 0, true); place('hilux', hilux, STATIONS.hilux, 0, true); place('civic', civic, STATIONS.civic, 0, true); place('antique', antique, STATIONS.antique, 0, true);
  raptor.position.set(STATIONS.raptor.x, 1.9, STATIONS.raptor.z); scene.add(raptor); cars.raptor = raptor;
  spot(0, 0, 2.4); spot(-3.2, -15, 2.2); spot(3.2, -30, 2.2); spot(-3, -46, 2.2); spot(0, -62, 2.6); spot(0, -78, 2.4);
  [bmw, hilux, civic, antique].forEach(function (c) { c.userData.base = c.rotation.y; });
  // finale car (second antique) on the road
  var fin = buildAntique(); fin.position.set(0, 0, -108); fin.rotation.y = Math.PI / 2; scene.add(fin);
  var finBeams = fin.userData.t.beams;

  // overhead light bars + side strips
  var barM = new T.MeshBasicMaterial({ color: 0xfff0d0, toneMapped: false }), stripM = new T.MeshBasicMaterial({ color: 0xd9a84a, toneMapped: false });
  for (var zi = 12; zi > -92; zi -= 9) { var bar = box(9, .08, .3, barM, 0, 9, zi); bar.material = barM; scene.add(bar); [-1, 1].forEach(function (s) { scene.add(box(.1, 6, .1, stripM, s * 12, 3, zi)); }); }
  [-1, 1].forEach(function (s) { scene.add(box(.06, .06, 110, stripM, s * 6.5, .03, -40)); });

  // collection plinth
  var tbl = new T.Group(); tbl.position.set(STATIONS.plinth.x, 0, STATIONS.plinth.z); scene.add(tbl);
  tbl.add(box(9, .9, 2.8, new T.MeshStandardMaterial({ color: 0x0b0a0c, metalness: .6, roughness: .22 }), 0, .45, 0));
  tbl.add(box(9.1, .05, 2.9, new T.MeshStandardMaterial({ color: 0xd9a84a, emissive: 0xd9a84a, emissiveIntensity: .35, metalness: 1, roughness: .25 }), 0, .92, 0));
  tbl.add(box(8.6, .02, 2.5, new T.MeshStandardMaterial({ color: 0x0b0103, roughness: 1, metalness: 0, envMapIntensity: .05 }), 0, .955, 0));
  var watch = makeWatch(); watch.scale.setScalar(1.15); watch.position.set(0, 2.05, 0); watch.rotation.x = -.12; tbl.add(watch);
  tbl.add(box(.9, .1, .6, goldM, 0, 1.0, .0)); tbl.add(cyl(.05, .05, .5, goldM, 0, 1.28, -.3, null));
  var shades = makeAviators(); shades.scale.setScalar(.95); shades.position.set(-2.8, 1.5, 0); shades.rotation.set(-.15, .5, 0); tbl.add(shades);
  var lighter = makeLighter(); lighter.scale.setScalar(1.15); lighter.position.set(2.0, .98, .1); lighter.rotation.y = -.3; tbl.add(lighter);
  var packG = makePack('gold'), packM = makePack('marl');
  packG.scale.setScalar(1.15); packG.position.set(3.1, 1.55, -.2); packG.rotation.set(0, -.3, .08); tbl.add(packG);
  packM.scale.setScalar(1.15); packM.position.set(3.85, 1.55, .1); packM.rotation.set(0, -.5, -.06); tbl.add(packM);
  spot(0, -78, 2.2, 0, -78);

  // sky, sun
  var skyU = { uTop: { value: new T.Color(0x050407) }, uMid: { value: new T.Color(0x0a0709) }, uBot: { value: new T.Color(0x100a08) } };
  var sky = new T.Mesh(new T.SphereGeometry(500, 24, 16), new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, uniforms: skyU,
    vertexShader: 'varying float vY; void main(){ vY = normalize(position).y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform vec3 uTop,uMid,uBot; varying float vY; void main(){ float t=clamp(vY*1.6+.2,0.,1.); vec3 c = t<.35 ? mix(uBot,uMid,t/.35) : mix(uMid,uTop,(t-.35)/.65); c += (fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)/120.; gl_FragColor=vec4(c,1.); }' }));
  scene.add(sky);
  var sun = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffb860, blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0, fog: false, toneMapped: false })); sun.scale.set(260, 260, 1); scene.add(sun);
  var sunCore = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xfff0c8, blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0, fog: false, toneMapped: false })); sunCore.scale.set(70, 70, 1); scene.add(sunCore);

  // road finale: lane dashes + lamps
  var dashes = [], lamps = [];
  for (var di = 0; di < 40; di++) { var dsh = box(.18, .02, 2.2, stripM, 0, .02, 0); scene.add(dsh); dashes.push(dsh); }
  for (var li = 0; li < 16; li++) [-1, 1].forEach(function (s) {
    var pole = new T.Group(); pole.add(cyl(.05, .05, 6, dark, 0, 3, 0, null)); pole.add(mesh(new T.SphereGeometry(.22, 12, 10), new T.MeshBasicMaterial({ color: 0xffd48a, toneMapped: false }), s * -.4, 6.1, 0));
    var gl = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffc66a, blending: T.AdditiveBlending, depthWrite: false, transparent: true, fog: false, toneMapped: false })); gl.scale.set(3, 3, 1); gl.position.set(s * -.4, 6.1, 0); pole.add(gl);
    pole.userData.side = s; scene.add(pole); lamps.push(pole);
  });

  /* ---------- particles ---------- */
  var timeU = { value: 0 }, pr = renderer.getPixelRatio();
  var PN = 1100, pPos = new Float32Array(PN * 3), pCol = new Float32Array(PN * 3), pSize = new Float32Array(PN), pAlpha = new Float32Array(PN), pVel = new Float32Array(PN * 3), pLife = new Float32Array(PN), pMax = new Float32Array(PN), pBase = new Float32Array(PN), pG = new Float32Array(PN), pHead = 0;
  var pGeo = new T.BufferGeometry();
  pGeo.setAttribute('position', new T.BufferAttribute(pPos, 3)); pGeo.setAttribute('aColor', new T.BufferAttribute(pCol, 3)); pGeo.setAttribute('aSize', new T.BufferAttribute(pSize, 1)); pGeo.setAttribute('aAlpha', new T.BufferAttribute(pAlpha, 1));
  var sparks = new T.Points(pGeo, new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: { uScale: { value: 380 * pr } },
    vertexShader: 'uniform float uScale; attribute vec3 aColor; attribute float aSize; attribute float aAlpha; varying vec3 vC; varying float vA; void main(){ vC=aColor; vA=aAlpha; vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=aSize*uScale/ -mv.z; gl_Position=projectionMatrix*mv; }',
    fragmentShader: 'varying vec3 vC; varying float vA; void main(){ vec2 p=gl_PointCoord-.5; float d=length(p); float core=smoothstep(.5,0.,d); core*=core; float cr=max(smoothstep(.05,0.,abs(p.x))*smoothstep(.5,0.,abs(p.y)),smoothstep(.05,0.,abs(p.y))*smoothstep(.5,0.,abs(p.x))); gl_FragColor=vec4(vC*(core*1.4+cr*.9),(core+cr)*vA); }' }));
  sparks.frustumCulled = false; scene.add(sparks);
  var SPC = [0xf6e3b0, 0xd9a84a, 0xfff6dc, 0xffc66a, 0xffffff].map(function (h) { return new T.Color(h); });
  function emit(x, y, z, vx, vy, vz, life, size, g, col) {
    var i = pHead; pHead = (pHead + 1) % PN; pPos[i * 3] = x; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = z; pVel[i * 3] = vx; pVel[i * 3 + 1] = vy; pVel[i * 3 + 2] = vz;
    pLife[i] = pMax[i] = life; pBase[i] = size; pG[i] = g == null ? 2.4 : g; var c = col || SPC[(Math.random() * SPC.length) | 0]; pCol[i * 3] = c.r; pCol[i * 3 + 1] = c.g; pCol[i * 3 + 2] = c.b;
  }
  function burstAt(v, n, power) { for (var i = 0; i < n; i++) { var th = Math.random() * 6.283, ph = Math.acos(rand(-1, 1)), s = rand(.3, 1) * (power || 5); emit(v.x, v.y, v.z, Math.sin(ph) * Math.cos(th) * s, Math.sin(ph) * Math.sin(th) * s + 1.2, Math.cos(ph) * s, rand(.9, 2.2), rand(.3, .8)); } }
  function updateParticles(dt) {
    for (var i = 0; i < PN; i++) {
      if (pLife[i] > 0) { pLife[i] -= dt; var k = Math.max(0, pLife[i] / pMax[i]), j = i * 3; pVel[j] *= .985; pVel[j + 1] = pVel[j + 1] * .985 - pG[i] * dt; pVel[j + 2] *= .985; pPos[j] += pVel[j] * dt; pPos[j + 1] += pVel[j + 1] * dt; pPos[j + 2] += pVel[j + 2] * dt; pAlpha[i] = k; pSize[i] = pBase[i] * (.4 + .6 * k); } else pAlpha[i] = 0;
    }
    pGeo.attributes.position.needsUpdate = pGeo.attributes.aAlpha.needsUpdate = pGeo.attributes.aSize.needsUpdate = pGeo.attributes.aColor.needsUpdate = true;
  }
  // golden dust motes drifting in the hall
  var dust = (function () {
    var n = small ? 120 : 260, pos = new Float32Array(n * 3), seed = new Float32Array(n), size = new Float32Array(n);
    for (var i = 0; i < n; i++) { pos[i * 3] = rand(-14, 14); pos[i * 3 + 1] = rand(.5, 9); pos[i * 3 + 2] = rand(-95, 12); seed[i] = Math.random(); size[i] = rand(5, 14); }
    var g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('aSeed', new T.BufferAttribute(seed, 1)); g.setAttribute('aSize', new T.BufferAttribute(size, 1));
    var m = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending, uniforms: { uTime: timeU, uScale: { value: 16 * pr } },
      vertexShader: 'uniform float uTime; uniform float uScale; attribute float aSeed; attribute float aSize; varying float vA; void main(){ vec3 p=position; p.x+=sin(uTime*.2+aSeed*6.28)*.8; p.y+=cos(uTime*.25+aSeed*12.)*.5+sin(uTime*.1+aSeed*9.)*.4; vec4 mv=modelViewMatrix*vec4(p,1.); float tw=.5+.5*sin(uTime*(.6+aSeed*1.6)+aSeed*50.); vA=.15+.6*tw; gl_PointSize=aSize*(.5+.5*tw)*uScale/ -mv.z; gl_Position=projectionMatrix*mv; }',
      fragmentShader: 'varying float vA; void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,0.,d); a*=a; gl_FragColor=vec4(vec3(1.,.82,.5)*(1.+a),a*vA); }' });
    var p = new T.Points(g, m); p.frustumCulled = false; scene.add(p); return p;
  })();

  /* ============================================================
     PICKABLES (wishes)
     ============================================================ */
  var pickables = [], items = [];
  function addPick(id, obj, r, ox, oy, oz) {
    var hit = new T.Mesh(new T.SphereGeometry(r, 10, 8), new T.MeshBasicMaterial({ visible: false })); hit.position.set(ox || 0, oy || 0, oz || 0);
    var it = { id: id, obj: obj, hover: 0, hovering: false, pop: 0, base: obj.scale.x }; hit.userData.item = it; obj.add(hit); pickables.push(hit); items.push(it); return it;
  }
  addPick(0, bmw, 2.4, 0, 1, 0); addPick(1, hilux, 2.8, 0, 1.2, 0); addPick(2, civic, 2.4, 0, 1, 0); addPick(3, antique, 3, 0, 1, 0); addPick(4, raptor, 3.4, 0, 0, 0);
  addPick(5, watch, 1.0, 0, 0, 0); addPick(6, shades, 1.1, 0, 0, 0); addPick(7, lighter, .7, 0, .5, 0); addPick(8, packG, .7, 0, 0, 0); addPick(9, packM, .7, 0, 0, 0);

  /* ============================================================
     CAMERA PATH (driven by real DOM scroll positions)
     ============================================================ */
  var P = {
    gate: { p: V(4.8, 1.25, 5.6), l: V(.3, .85, 0) }, gateB: { p: V(3.5, 1.1, 3.0), l: V(0, .85, .4) },
    hero: { p: V(3.2, 1.45, 8.4), l: V(.2, 1.9, 0) },
    gentleman: { p: V(-3.8, 1.8, 3.2), l: V(0, 1.2, -9) },
    portraits: { p: V(-4.6, 1.9, 5.0), l: V(0, 1.0, 0) },
    garage: [
      { p: V(4.4, 1.5, 6.2), l: V(0, .9, 0) }, { p: V(-3.2 + 4.8, 1.8, -15 + 7.4), l: V(-3.2, 1.0, -15) }, { p: V(3.2 + 4.2, 1.5, -30 + 6.2), l: V(3.2, .9, -30) },
      { p: V(-3 + 4.6, 1.5, -46 + 6.4), l: V(-3, .9, -46) }, { p: V(6.0, 2.4, -62 + 8.2), l: V(0, 1.7, -62) }
    ],
    engine: { p: V(-3 + 3.4, 1.2, -46 + 5.0), l: V(-.4, .9, -46) },
    collection: { p: V(0, 2.2, -78 + 8.8), l: V(0, 1.6, -78) },
    letter: { p: V(0, 2.3, -90), l: V(0, 1.6, -120) },
    end: { p: V(0, 2.1, -100.5), l: V(0, 1.3, -122) }
  };
  var keys = [];
  function elTop(id) { var el = document.getElementById(id); return el ? el : null; }
  function computeKeys() {
    keys = []; var vh = innerHeight;
    function mid(el) { return el.offsetTop + Math.max(0, (el.offsetHeight - vh) / 2); }
    [['hero', 'hero'], ['gentleman', 'gentleman'], ['portraits', 'portraits']].forEach(function (a) { var el = elTop(a[0]); if (el) keys.push({ y: mid(el), pose: P[a[1]] }); });
    var gar = elTop('garage');
    if (gar) { var span = gar.offsetHeight - vh; for (var i = 0; i < 5; i++) keys.push({ y: gar.offsetTop + i / 4 * span, pose: P.garage[i], car: i }); }
    ['engine', 'collection', 'extra', 'letter', 'end'].forEach(function (id) { var el = elTop(id); if (el && el.offsetHeight > 0 && !el.hidden) keys.push({ y: id === 'end' ? el.offsetTop : mid(el), pose: P[id === 'extra' ? 'collection' : id], id: id }); });
    keys.sort(function (a, b) { return a.y - b.y; });
    var le = keys.filter(function (k) { return k.id === 'letter'; })[0], en = keys.filter(function (k) { return k.id === 'end'; })[0];
    moodA = le ? le.y : 1e9; moodB = en ? en.y + innerHeight * .3 : 1e9 + 1;
    var gk = keys.filter(function (k) { return k.car != null; }); garA = gk.length ? gk[0].y : 0; garB = gk.length ? gk[gk.length - 1].y : 1;
  }
  var moodA = 1e9, moodB = 1e9 + 1, garA = 0, garB = 1;
  var tmpP = V(0, 0, 0), tmpL = V(0, 0, 0);
  function scrollPose(s, outP, outL) {
    if (!keys.length) { outP.copy(P.hero.p); outL.copy(P.hero.l); return; }
    var i = 0; while (i < keys.length - 1 && s > keys[i + 1].y) i++;
    var a = keys[i], b = keys[Math.min(keys.length - 1, i + 1)], t = a === b ? 0 : ss(a.y, b.y, s);
    outP.lerpVectors(a.pose.p, b.pose.p, t); outL.lerpVectors(a.pose.l, b.pose.l, t);
  }

  var rw = 0, rh = 0;
  function resize() { var w = innerWidth, h = innerHeight; if (rw && w === rw && Math.abs(h - rh) < 120) return; rw = w; rh = h; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < .8 ? 58 : 46; camera.updateProjectionMatrix(); computeKeys(); }
  addEventListener('resize', resize); addEventListener('load', function () { computeKeys(); }); resize();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(computeKeys);
  setTimeout(computeKeys, 1500); setTimeout(computeKeys, 4000);

  /* ============================================================
     INTERACTION
     ============================================================ */
  var ray = new T.Raycaster(), ndc = new T.Vector2(), mouse = { x: 0, y: 0 }, hovered = null, found = {};
  var hintEl = document.getElementById('hint'), htmlEl = document.documentElement;
  var INTERACTIVE = 'a,button,.fob,.card,.gframe,.g-card,.g-nav,.paper,.envelope,.lightbox,.toast,.hud,.wishes-hud,.gauge,input';
  function pick(cx, cy) { ndc.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); var h = ray.intersectObjects(pickables, false); return h.length ? h[0] : null; }
  function w2s(x, y, d) { var v = new T.Vector3(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1, .5).unproject(camera); return camera.position.clone().add(v.sub(camera.position).normalize().multiplyScalar(d)); }
  var drag = null, spinOff = 0, spinVel = 0, hoverEv = null, hoverQ = false;
  addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse' && !(e.target.closest && e.target.closest(INTERACTIVE)) && document.body.classList.contains('entered')) drag = { x: e.clientX }; });
  var dragDist = 0;
  addEventListener('pointerup', function () { dragDist = drag ? (drag.moved || 0) : 0; drag = null; });
  addEventListener('pointermove', function (e) {
    mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = e.clientY / innerHeight * 2 - 1;
    if (drag) { var dx = e.clientX - drag.x; drag.x = e.clientX; drag.moved = (drag.moved || 0) + Math.abs(dx); spinVel = dx * .012; spinOff += dx * .012; }
    if (e.pointerType === 'touch' || !document.body.classList.contains('entered')) return;
    if (e.target.closest && e.target.closest(INTERACTIVE)) { setHover(null); return; }
    hoverEv = e; if (!hoverQ) { hoverQ = true; requestAnimationFrame(function () { hoverQ = false; var h = pick(hoverEv.clientX, hoverEv.clientY); setHover(h ? h.object.userData.item : null, hoverEv); }); }
  }, { passive: true });
  function setHover(it, e) {
    if (hovered && hovered !== it) hovered.hovering = false; hovered = it;
    if (it) { it.hovering = true; htmlEl.classList.add('hover3d'); hintEl.textContent = found[it.id] ? '✦ again?' : '✦ a wish is hiding here'; hintEl.style.left = e.clientX + 'px'; hintEl.style.top = e.clientY + 'px'; hintEl.classList.add('on'); }
    else { htmlEl.classList.remove('hover3d'); hintEl.classList.remove('on'); }
  }
  addEventListener('click', function (e) {
    if (!document.body.classList.contains('entered')) return;
    if (e.target.closest && e.target.closest(INTERACTIVE)) return;
    if (dragDist > 6) { dragDist = 0; return; }
    var h = pick(e.clientX, e.clientY);
    if (h) { var it = h.object.userData.item; it.pop = 1; found[it.id] = true; burstAt(h.point, 80, 5.5); if (M.onPick) M.onPick(it.id); }
    else {
      var ch = ray.intersectObjects([bmw, hilux, civic, antique, raptor], true);
      if (ch.length) { var o = ch[0].object; while (o && !(o === bmw || o === hilux || o === civic || o === antique || o === raptor)) o = o.parent; var ci = [bmw, hilux, civic, antique, raptor].indexOf(o); if (ci > -1) { burstAt(ch[0].point, 40, 4); if (M.onCarTap) M.onCarTap(ci); return; } }
      burstAt(w2s(e.clientX, e.clientY, 12), 14, 2.4);
    }
  });

  /* ---------- public API ---------- */
  var gate = { t: -1, done: false }, lights = { flash: 0 }, engine = { on: false, t: 0, rev: 0 }, shake = 0;
  M.sparkle = function (x, y, n) { burstAt(w2s(x, y, 12), n || 50, 5); };
  M.enter = function () { if (gate.t < 0) gate.t = 0; };
  if (M.wantEnter) M.enter();
  M.flashLights = function () { lights.flash = 1.2; };
  M.engineStart = function () { engine.on = true; engine.t = 0; shake = 1; };
  M.rev = function () { engine.rev = 1; shake = .7; };
  M.rain = function () { for (var i = 0; i < 360; i++) (function (i) { setTimeout(function () { emit(camera.position.x + rand(-9, 9), camera.position.y + rand(5, 9), camera.position.z - rand(2, 12), rand(-.4, .4), -rand(1.5, 3.5), rand(-.3, .3), rand(2.6, 4), rand(.4, .9), 0); }, i * 11); })(i); };
  M.goCarScroll = null;

  /* ============================================================
     LOOP
     ============================================================ */
  var clock = new T.Clock(), sY = 0, camMx = 0, camMy = 0, focus = 0, focusSmooth = 0, lastCar = -1, introK = 0, flyT = -1, nextFly = 0, wasEnd = false;
  var cp = V(0, 0, 0), cl = V(0, 0, 0), gP = V(0, 0, 0), gL = V(0, 0, 0);
  function setBeams(c, k) { c.userData.t.beams.forEach(function (b) { b.intensity = k * 3.2; }); }

  var cT = new T.Color(0x0b1233), cM = new T.Color(0x9a4220), cB = new T.Color(0xf6b255);
  function frame() {
    requestAnimationFrame(frame); if (document.hidden) return;
    var dt = Math.min(.05, clock.getDelta()), t = clock.elapsedTime; timeU.value = t;
    sY += ((window.scrollY || 0) - sY) * Math.min(1, dt * 4.2);

    // mood (studio -> sunset)
    var mood = ss(moodA, moodB, sY);
    skyU.uTop.value.setHex(0x050407).lerp(cT, mood); skyU.uMid.value.setHex(0x0a0709).lerp(cM, mood); skyU.uBot.value.setHex(0x100a08).lerp(cB, mood);
    scene.fog.color.copy(skyU.uMid.value).multiplyScalar(.9); scene.fog.density = lerp(.014, .006, mood); scene.background.copy(skyU.uBot.value);
    sky.position.copy(camera.position); sun.position.set(camera.position.x, 14, camera.position.z - 400); sunCore.position.copy(sun.position); sun.material.opacity = mood * .9; sunCore.material.opacity = mood * .9;
    barM.color.setHex(0xfff0d0).multiplyScalar(1 - mood * .7);

    // gate sequence
    var gt = gate.t >= 0 ? (gate.t += dt) : -1;
    var door = bmw.userData.door, bt = bmw.userData.t;
    if (gt < 0) {
      gP.copy(P.gate.p); gP.x += Math.sin(t * .25) * .5; gP.y += Math.sin(t * .31) * .06; gL.copy(P.gate.l);
      bt.head.emissiveIntensity = 0; bt.cab.intensity = 0; door.rotation.y = 0; setBeams(bmw, 0);
    } else {
      var k1 = ss(0, 3.2, gt); gP.lerpVectors(P.gate.p, P.gateB.p, k1); gL.lerpVectors(P.gate.l, P.gateB.l, k1);
      var f = (gt < .25 || (gt > .4 && gt < .65)) ? 1 : 0, hold = ss(.65, 1, gt) * (1 - ss(4.2, 4.9, gt)) * .6; bt.head.emissiveIntensity = Math.max(f * 2.2, hold * 1.6); setBeams(bmw, Math.max(f, hold));
      if (f && Math.random() < .5) { var fl = document.getElementById('flash'); }
      var open = ss(1.2, 2.7, gt) * (1 - ss(3.9, 4.9, gt)); door.rotation.y = open * .98;
      bt.cab.intensity = ss(1.2, 2.6, gt) * (1 - ss(3.9, 4.9, gt)) * 2.4; bt.led.emissiveIntensity = ss(1.2, 2.2, gt) * (1 - ss(3.9, 4.9, gt)) * 3;
      if (gt > 1.5 && gt < 2.8 && Math.random() < .6) emit(1 + rand(-.4, .4), 1 + rand(0, .4), 2 + rand(-.2, .4), rand(-.3, .5), rand(.4, 1.2), rand(.3, 1.2), rand(1.2, 2.2), rand(.3, .6), -.2);
      if (gt > 4.9 && !gate.done) { gate.done = true; }
      introK = ss(3.2, 5.6, gt);
    }
    // flash lights button
    if (lights.flash > 0) { lights.flash -= dt; var on = Math.floor(lights.flash * 5) % 2 === 1; bt.head.emissiveIntensity = Math.max(bt.head.emissiveIntensity, on ? 2.2 : 0); setBeams(bmw, on ? 1 : 0); }

    // camera from scroll
    scrollPose(sY, cp, cl);
    var kk = gt < 0 ? 0 : introK;
    camera.position.lerpVectors(gP, cp, kk); tmpL.lerpVectors(gL, cl, kk);
    if (gt < 0) camera.position.copy(gP);
    camMx += ((reduce ? 0 : mouse.x) - camMx) * Math.min(1, dt * 2.5); camMy += ((reduce ? 0 : mouse.y) - camMy) * Math.min(1, dt * 2.5);
    camera.position.x += camMx * .45; camera.position.y += -camMy * .25 + Math.sin(t * .3) * .03;
    if (shake > 0) { shake = Math.max(0, shake - dt * 1.2); camera.position.x += (Math.random() - .5) * .06 * shake; camera.position.y += (Math.random() - .5) * .05 * shake; }
    camera.lookAt(tmpL);
    if (window.__cam) { camera.position.copy(window.__cam.p); camera.lookAt(window.__cam.l); }

    // garage focus
    var gp = clamp((sY - garA) / Math.max(1, garB - garA), 0, 1), idx = Math.round(gp * 4);
    if (sY > garA - innerHeight * .4 && sY < garB + innerHeight * .4) { if (idx !== lastCar) { lastCar = idx; if (M.onCar) M.onCar(idx); } }
    spinVel *= Math.pow(.05, dt);
    var order = ['bmw', 'hilux', 'civic', 'antique', 'raptor'];
    order.forEach(function (name, i) {
      var c = cars[name], act = sY > garA - innerHeight * .5 && sY < garB + innerHeight * .5 && i === idx;
      if (name === 'raptor') { c.rotation.y = Math.sin(t * .35) * .5 + (act ? spinOff : 0) - .5; c.rotation.z = Math.sin(t * .5) * .12 + .08; c.position.y = 1.9 + Math.sin(t * .8) * .12; }
      else {
        var tgt = c.userData.base + (act ? t * .25 + spinOff : Math.sin(t * .3 + i) * .18);
        if (name === 'bmw' && gt >= 0 && gt < 5) tgt = c.userData.base; c.rotation.y += (tgt - c.rotation.y) * Math.min(1, dt * 2.5);
      }
    });
    if (idx !== lastSpinCar) { spinOff = 0; lastSpinCar = idx; }
    mirrors.forEach(function (m) { m.m.rotation.y = m.src.rotation.y; });

    // collection objects
    var tn = new Date(), sec = tn.getSeconds() + tn.getMilliseconds() / 1000;
    watch.userData.s.rotation.z = -sec / 60 * Math.PI * 2; watch.userData.m.rotation.z = -(tn.getMinutes() + sec / 60) / 60 * Math.PI * 2; watch.userData.h.rotation.z = -((tn.getHours() % 12) + tn.getMinutes() / 60) / 12 * Math.PI * 2;
    watch.rotation.y = Math.sin(t * .5) * .35; shades.rotation.y = .5 + Math.sin(t * .4) * .35; shades.position.y = 1.5 + Math.sin(t * .8) * .04;
    var fk = .9 + Math.sin(t * 17) * .08 + Math.sin(t * 9.3) * .06; lighter.userData.flame.scale.set(fk, 1 + Math.sin(t * 13) * .12, fk); lighter.userData.pl.intensity = .7 + Math.sin(t * 15) * .15;
    packG.rotation.y = -.3 + Math.sin(t * .6) * .18; packM.rotation.y = -.5 + Math.sin(t * .55 + 1) * .18;

    // engine start effects on the antique
    if (engine.on) {
      engine.t += dt; var tb = antique.userData.t;
      tb.head.emissiveIntensity = ss(1.1, 1.5, engine.t) * 1.8 + engine.rev * .8; setBeams(antique, ss(1.1, 1.5, engine.t) * .8);
      var ex = V(0, 0, 0); antique.localToWorld(ex.copy(tb.exhaust));
      if (engine.t > 1.1 && Math.random() < .7 + engine.rev) emit(ex.x, ex.y, ex.z, rand(-.5, .5) - 1.4 * Math.sin(antique.rotation.y), rand(.2, .8), rand(-.4, .4), rand(.5, 1.1), rand(.25, .5), -.5, new T.Color(Math.random() < .5 ? 0xffb050 : 0xffe0a0));
      antique.position.y = .16 + Math.sin(t * 55) * .004 * (1 + engine.rev * 2); engine.rev = Math.max(0, engine.rev - dt * .6);
    }

    // finale
    var atEnd = sY > moodA + (moodB - moodA) * .55;
    fin.userData.wheels.forEach(function (w) { w.userData.spin.rotation.z -= dt * (atEnd ? 22 : 0); });
    var driving = atEnd ? 1 : 0;
    fin.userData.t.tail.emissiveIntensity = .5 + driving * 1.4; fin.userData.t.head.emissiveIntensity = 1.2; setBeams(fin, .55);
    fin.position.y = Math.sin(t * 9) * .006 * driving;
    var base = (t * 28 * driving) % 5.5; if (!driving) base = 0;
    dashes.forEach(function (d, i) { d.position.set(0, .02, -92 - ((i * 5.5 + base) % 220)); d.visible = mood > .02; });
    lamps.forEach(function (pl, i) { var s = pl.userData.side; pl.position.set(s * 7.5, 0, -88 - ((Math.floor(i / 2) * 14 + (t * 28 * driving)) % 224)); pl.visible = mood > .02; });
    // F-22 flyover
    if (atEnd) { if (!wasEnd) { nextFly = t + 1.5; } wasEnd = true; if (flyT < 0 && t > nextFly) { flyT = 0; if (M.sound) M.sound.whoosh(); } } else wasEnd = false;
    var rb = raptor.userData;
    if (flyT >= 0 && atEnd) {
      flyT += dt; var fz = -78 - flyT * 46, fx = lerp(-4, 3, flyT / 4.5);
      raptor.position.set(fx, 7 + Math.sin(flyT * 1.2) * .4, fz); raptor.rotation.set(0, Math.PI / 2 + .0, Math.sin(flyT * 1.3) * .22); raptor.scale.setScalar(2.0);
      rb.burnMat.opacity = .85; rb.burn.forEach(function (b) { if (b.isSprite) b.material.opacity = .9; });
      if (flyT > 5) { flyT = -1; nextFly = t + 11; raptor.scale.setScalar(1.15); raptor.position.set(STATIONS.raptor.x, 1.9, STATIONS.raptor.z); rb.burnMat.opacity = 0; rb.burn.forEach(function (b) { if (b.isSprite) b.material.opacity = 0; }); }
    } else if (!atEnd && flyT < 0) { rb.burnMat.opacity = ss(0.5, 1, 0) * 0; }
    // hover pulse
    items.forEach(function (it) { var s = it.base * (it.hovering ? 1.04 : 1) * (1 + it.pop * .06); it.hover += (s - it.hover) * Math.min(1, dt * 8) || s; if (it.id >= 5) it.obj.scale.setScalar(it.hover); if (it.pop) it.pop = Math.max(0, it.pop - dt * 2); });
    spots.forEach(function (s, i) { s.intensity = s.intensity; });
    cones.forEach(function (c, i) { c.material.opacity = .05 + .015 * Math.sin(t * .7 + i); });

    updateParticles(dt);
    renderer.render(scene, camera);
  }
  var lastSpinCar = -1;
  renderer.render(scene, camera);
  if (location.hash === '#debug') window.__magic = { camera: camera, THREE: T, cars: cars, P: P, scene: scene, fin: fin, alive: function () { var n = 0; for (var i = 0; i < PN; i++) if (pLife[i] > 0) n++; return n; }, keys: function () { return keys; }, sY: function () { return sY; } };
  frame();
})();
