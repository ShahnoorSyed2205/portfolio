/* ============================================================
   3D magical world — three.js r149 (vendored, classic script).
   Procedural crochet sunflowers, keychains, yarn balls, fireflies,
   stars, moon, scroll-driven camera and clickable wishes.
   ============================================================ */
(function () {
  'use strict';
  var T = window.THREE, M = window.MAGIC;
  var canvas = document.getElementById('bg');
  if (!T || !M || !canvas) { document.documentElement.classList.add('no-webgl'); return; }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer:coarse)').matches;
  var small = Math.min(innerWidth, innerHeight) < 700;

  var renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas: canvas, antialias: !small, powerPreference: 'high-performance' });
  } catch (err) { document.documentElement.classList.add('no-webgl'); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .95;

  var scene = new T.Scene();
  var camera = new T.PerspectiveCamera(50, 1, .1, 500);
  var WORLD_H = 78;                     // how far the camera travels down the world
  var camBase = new T.Vector3(0, 0, 24); // starts pulled back, dollies in on enter
  camera.position.copy(camBase);

  /* ---------- palette ---------- */
  var C = {
    sun: 0xffbd00, gold: 0xe8a317, cream: 0xfbf0d4, blush: 0xf3a8b8, lilac: 0xb9a2e0, sage: 0x9fc29a,
    leaf: 0x5f9a4a, brown: 0x4a2a10, metal: 0xe8c07a
  };
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  /* ---------- canvas textures ---------- */
  function canvasTex(w, h, draw, repeat, srgb) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    var t = new T.CanvasTexture(c);
    if (srgb !== false) t.encoding = T.sRGBEncoding;
    t.anisotropy = 4;
    if (repeat) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(repeat, repeat); }
    return t;
  }

  // crochet "V" stitches, seamless, light-grey so material colour tints it
  var stitchTex = canvasTex(256, 256, function (g, w, h) {
    g.fillStyle = '#8a8a8a'; g.fillRect(0, 0, w, h);
    var sx = 16, sy = 16;
    g.lineCap = 'round';
    for (var y = -1; y <= h / sy + 1; y++) {
      for (var x = -1; x <= w / sx + 1; x++) {
        var ox = x * sx + (y % 2 ? sx / 2 : 0), oy = y * sy;
        [-1, 1].forEach(function (d) {
          g.beginPath(); g.moveTo(ox + d * 5.5, oy + 1); g.quadraticCurveTo(ox + d * 2.5, oy + 11, ox, oy + sy + 2);
          g.lineWidth = 8; g.strokeStyle = '#6e6e6e'; g.stroke();
          g.lineWidth = 5.4; g.strokeStyle = '#c4c4c4'; g.stroke();
          g.lineWidth = 1.6; g.strokeStyle = '#e8e8e8'; g.globalAlpha = .6;
          g.beginPath(); g.moveTo(ox + d * 4.6, oy + 2); g.quadraticCurveTo(ox + d * 2, oy + 10, ox - d * .4, oy + sy); g.stroke();
          g.globalAlpha = 1;
        });
      }
    }
  }, 3);

  // wound yarn ball
  var yarnTex = canvasTex(512, 256, function (g, w, h) {
    g.fillStyle = '#9a9a9a'; g.fillRect(0, 0, w, h);
    g.lineCap = 'round';
    for (var i = 0; i < 320; i++) {
      var x = Math.random() * w, y = Math.random() * h, a = Math.random() * Math.PI, l = rand(30, 80);
      g.beginPath(); g.moveTo(x, y);
      g.quadraticCurveTo(x + Math.cos(a) * l * .5 + rand(-12, 12), y + Math.sin(a) * l * .5 + rand(-12, 12), x + Math.cos(a) * l, y + Math.sin(a) * l);
      g.lineWidth = 7; g.strokeStyle = 'rgba(80,80,80,.55)'; g.stroke();
      g.lineWidth = 4.2; g.strokeStyle = Math.random() < .5 ? '#d0d0d0' : '#b0b0b0'; g.stroke();
    }
  }, 1);

  // sunflower seed head
  var seedTex = canvasTex(256, 256, function (g, w, h) {
    var gr = g.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2);
    gr.addColorStop(0, '#6b3f16'); gr.addColorStop(.7, '#3b1d09'); gr.addColorStop(1, '#2a1306');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 700; i++) {
      var r = Math.sqrt(i / 700) * w * .46, a = i * 2.39996;
      var x = w / 2 + Math.cos(a) * r, y = h / 2 + Math.sin(a) * r, s = 2.4 + (r / w) * 7;
      g.beginPath(); g.arc(x, y, s, 0, 7);
      g.fillStyle = i % 2 ? '#8a5522' : '#2a1306'; g.fill();
      g.beginPath(); g.arc(x - s * .25, y - s * .25, s * .45, 0, 7);
      g.fillStyle = 'rgba(255,214,150,.35)'; g.fill();
    }
    g.beginPath(); g.arc(w / 2, h / 2, w * .49, 0, 7); g.lineWidth = 10; g.strokeStyle = '#7a4a1c'; g.stroke();
  }, 0);

  var glowTex = canvasTex(128, 128, function (g, w) {
    var gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  }, 0);

  /* ---------- sky (gradient that shifts with scroll) ---------- */
  var PAL = [
    { top: 0x0b0620, mid: 0x2a1250, bot: 0x5b2a6b },
    { top: 0x1a0c38, mid: 0x55226a, bot: 0xc2608c },
    { top: 0x30164a, mid: 0xa84e78, bot: 0xffb88c }
  ];
  var skyU = { uTop: { value: new T.Color() }, uMid: { value: new T.Color() }, uBot: { value: new T.Color() } };
  var sky = new T.Mesh(new T.SphereGeometry(300, 24, 16), new T.ShaderMaterial({
    side: T.BackSide, depthWrite: false, uniforms: skyU,
    vertexShader: 'varying float vY; void main(){ vY = normalize(position).y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform vec3 uTop,uMid,uBot; varying float vY; void main(){ float t=clamp(vY*.5+.5,0.,1.); vec3 c = t<.5 ? mix(uBot,uMid,t*2.) : mix(uMid,uTop,(t-.5)*2.); c += (fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)/120.; gl_FragColor=vec4(c,1.); }'
  }));
  scene.add(sky);
  scene.fog = new T.FogExp2(0x2a1250, .021);

  function setPalette(p) {
    var f = p * (PAL.length - 1), i = Math.min(PAL.length - 2, Math.floor(f)), t = f - i;
    ['top', 'mid', 'bot'].forEach(function (k) {
      var a = new T.Color(PAL[i][k]), b = new T.Color(PAL[i + 1][k]);
      skyU['u' + k[0].toUpperCase() + k.slice(1)].value.copy(a.lerp(b, t));
    });
    scene.fog.color.copy(skyU.uMid.value);
  }

  /* ---------- lights ---------- */
  scene.add(new T.HemisphereLight(0xffe2b8, 0x3b1b5e, .55));
  var key = new T.DirectionalLight(0xffe6b8, 1.15); key.position.set(-6, 10, 10); scene.add(key);
  var rim = new T.DirectionalLight(0xe49bff, .9); rim.position.set(8, 3, -8); scene.add(rim);
  var glowLight = new T.PointLight(0xffc766, 1.2, 40, 2); scene.add(glowLight);

  /* ---------- stars, moon ---------- */
  var starGroup = new T.Group(); scene.add(starGroup);
  var twinkleVS = [
    'uniform float uTime; uniform float uScale; attribute float aSeed; attribute float aSize; varying float vA;',
    'void main(){ vec3 p=position;',
    '#ifdef DRIFT',
    ' p.x+=sin(uTime*.25+aSeed*6.283)*.9; p.y+=cos(uTime*.31+aSeed*12.)*.7; p.z+=sin(uTime*.2+aSeed*9.)*.6;',
    '#endif',
    ' vec4 mv=modelViewMatrix*vec4(p,1.); float tw=.5+.5*sin(uTime*(.8+aSeed*2.2)+aSeed*60.);',
    ' vA=.25+.75*tw; gl_PointSize=aSize*(.55+.45*tw)*uScale/ -mv.z; gl_Position=projectionMatrix*mv; }'
  ].join('\n');
  var twinkleFS = 'uniform vec3 uColor; varying float vA; void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,0.,d); a*=a; gl_FragColor=vec4(uColor*(1.+a),a*vA); }';
  var timeU = { value: 0 };

  function twinkleSet(n, spread, sizeR, color, drift, scale) {
    var pos = new Float32Array(n * 3), seed = new Float32Array(n), size = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      spread(pos, i * 3); seed[i] = Math.random(); size[i] = rand(sizeR[0], sizeR[1]);
    }
    var g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new T.BufferAttribute(seed, 1));
    g.setAttribute('aSize', new T.BufferAttribute(size, 1));
    var m = new T.ShaderMaterial({
      transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      defines: drift ? { DRIFT: '' } : {},
      uniforms: { uTime: timeU, uScale: { value: scale }, uColor: { value: new T.Color(color) } },
      vertexShader: twinkleVS, fragmentShader: twinkleFS
    });
    var p = new T.Points(g, m); p.frustumCulled = false; return p;
  }
  var pr = renderer.getPixelRatio();
  starGroup.add(twinkleSet(small ? 600 : 1100, function (a, i) {
    var u = Math.random() * 2 - 1, th = Math.random() * 6.283, r = rand(200, 280), s = Math.sqrt(1 - u * u);
    a[i] = r * s * Math.cos(th); a[i + 1] = r * u; a[i + 2] = r * s * Math.sin(th);
  }, [2.2, 6], 0xfff2d0, false, 190 * pr));

  var moonGroup = new T.Group(); scene.add(moonGroup);
  var moonTex = canvasTex(256, 256, function (g, w) {
    var gr = g.createRadialGradient(w * .42, w * .4, 6, w / 2, w / 2, w / 2);
    gr.addColorStop(0, '#fffaf0'); gr.addColorStop(.7, '#f6e6c4'); gr.addColorStop(1, '#e2c791');
    g.fillStyle = gr; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 2, 0, 7); g.fill();
    g.globalCompositeOperation = 'source-atop';
    [[.35, .35, 26], [.62, .5, 34], [.45, .7, 20], [.7, .26, 16], [.3, .58, 14]].forEach(function (c) {
      g.beginPath(); g.arc(c[0] * w, c[1] * w, c[2], 0, 7); g.fillStyle = 'rgba(190,150,90,.16)'; g.fill();
    });
  }, 0);
  var moon = new T.Sprite(new T.SpriteMaterial({ map: moonTex, fog: false, transparent: true, toneMapped: false, color: 0xb9ad8e }));
  moon.scale.set(24, 24, 1);
  var moonGlow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffd98a, blending: T.AdditiveBlending, depthWrite: false, fog: false, transparent: true, opacity: .4, toneMapped: false }));
  moonGlow.scale.set(110, 110, 1);
  moonGlow.renderOrder = 1; moon.renderOrder = 2; moon.material.depthTest = false; moonGlow.material.depthTest = false;
  moonGroup.add(moonGlow, moon);
  moonGroup.position.set(-70, 52, -150);

  // fireflies drifting through the whole world
  var fireflies = twinkleSet(small ? 110 : 240, function (a, i) {
    a[i] = rand(-22, 22); a[i + 1] = rand(-WORLD_H - 14, 14); a[i + 2] = rand(-14, 8);
  }, [14, 30], 0xffd36b, true, 24 * pr);
  scene.add(fireflies);

  /* ---------- click sparkle particles ---------- */
  var PN = 900, pPos = new Float32Array(PN * 3), pCol = new Float32Array(PN * 3), pSize = new Float32Array(PN), pAlpha = new Float32Array(PN);
  var pVel = new Float32Array(PN * 3), pLife = new Float32Array(PN), pMax = new Float32Array(PN), pBase = new Float32Array(PN), pHead = 0;
  var pGeo = new T.BufferGeometry();
  pGeo.setAttribute('position', new T.BufferAttribute(pPos, 3));
  pGeo.setAttribute('aColor', new T.BufferAttribute(pCol, 3));
  pGeo.setAttribute('aSize', new T.BufferAttribute(pSize, 1));
  pGeo.setAttribute('aAlpha', new T.BufferAttribute(pAlpha, 1));
  var sparkles = new T.Points(pGeo, new T.ShaderMaterial({
    transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    uniforms: { uScale: { value: 380 * pr } },
    vertexShader: 'uniform float uScale; attribute vec3 aColor; attribute float aSize; attribute float aAlpha; varying vec3 vC; varying float vA; void main(){ vC=aColor; vA=aAlpha; vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=aSize*uScale/ -mv.z; gl_Position=projectionMatrix*mv; }',
    fragmentShader: 'varying vec3 vC; varying float vA; void main(){ vec2 p=gl_PointCoord-.5; float d=length(p); float core=smoothstep(.5,0.,d); core*=core; float cr=max(smoothstep(.05,0.,abs(p.x))*smoothstep(.5,0.,abs(p.y)),smoothstep(.05,0.,abs(p.y))*smoothstep(.5,0.,abs(p.x))); gl_FragColor=vec4(vC*(core*1.4+cr*.9),(core+cr)*vA); }'
  }));
  sparkles.frustumCulled = false; scene.add(sparkles);
  var SP_COLS = [0xffc61a, 0xfff2b0, 0xf6e0a8, 0xf3a8b8, 0xffffff, 0xb9a2e0].map(function (h) { return new T.Color(h); });

  function emit(x, y, z, vx, vy, vz, life, size) {
    var i = pHead; pHead = (pHead + 1) % PN;
    pPos[i * 3] = x; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = z;
    pVel[i * 3] = vx; pVel[i * 3 + 1] = vy; pVel[i * 3 + 2] = vz;
    pLife[i] = pMax[i] = life; pBase[i] = size;
    var c = SP_COLS[(Math.random() * SP_COLS.length) | 0];
    pCol[i * 3] = c.r; pCol[i * 3 + 1] = c.g; pCol[i * 3 + 2] = c.b;
  }
  function burstAt(v, n, power) {
    n = n || 50; power = power || 5;
    for (var i = 0; i < n; i++) {
      var th = Math.random() * 6.283, ph = Math.acos(rand(-1, 1)), s = rand(.3, 1) * power;
      emit(v.x, v.y, v.z, Math.sin(ph) * Math.cos(th) * s, Math.sin(ph) * Math.sin(th) * s + 1.2, Math.cos(ph) * s, rand(.9, 2.2), rand(.35, .95));
    }
  }
  function updateParticles(dt) {
    for (var i = 0; i < PN; i++) {
      if (pLife[i] > 0) {
        pLife[i] -= dt;
        var k = Math.max(0, pLife[i] / pMax[i]), j = i * 3;
        pVel[j] *= .985; pVel[j + 1] = pVel[j + 1] * .985 - 2.4 * dt; pVel[j + 2] *= .985;
        pPos[j] += pVel[j] * dt; pPos[j + 1] += pVel[j + 1] * dt; pPos[j + 2] += pVel[j + 2] * dt;
        pAlpha[i] = k; pSize[i] = pBase[i] * (.4 + .6 * k);
      } else { pAlpha[i] = 0; }
    }
    pGeo.attributes.position.needsUpdate = pGeo.attributes.aAlpha.needsUpdate = pGeo.attributes.aSize.needsUpdate = pGeo.attributes.aColor.needsUpdate = true;
  }

  /* ============================================================
     OBJECT BUILDERS
     ============================================================ */
  function petalGeo(wid, len) {
    var s = new T.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(wid, len * .1, wid * 1.1, len * .72, 0, len);
    s.bezierCurveTo(-wid * 1.1, len * .72, -wid, len * .1, 0, 0);
    return new T.ExtrudeGeometry(s, { depth: .05, bevelEnabled: true, bevelThickness: .06, bevelSize: .05, bevelSegments: 3, curveSegments: 10 });
  }
  var PETAL_A = petalGeo(.27, .95), PETAL_B = petalGeo(.24, .8);
  var crochetMat = function (extra) {
    return new T.MeshStandardMaterial(Object.assign({ map: stitchTex, bumpMap: stitchTex, bumpScale: 1.6, roughness: .92, metalness: 0 }, extra || {}));
  };
  var dummy = new T.Object3D(), qz = new T.Quaternion(), qx = new T.Quaternion(), ZA = new T.Vector3(0, 0, 1), XA = new T.Vector3(1, 0, 0);

  function petalRing(geo, n, rad, z, tilt, hex, offset, scaleJ) {
    var m = new T.InstancedMesh(geo, crochetMat({ emissive: 0x6a4200, emissiveIntensity: .42 }), n);
    var col = new T.Color();
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2 + (offset || 0), sc = 1 + (Math.random() - .5) * (scaleJ || .16);
      qz.setFromAxisAngle(ZA, a); qx.setFromAxisAngle(XA, -tilt + (Math.random() - .5) * .12);
      dummy.quaternion.copy(qz).multiply(qx);
      dummy.position.set(-Math.sin(a) * rad, Math.cos(a) * rad, z);
      dummy.scale.setScalar(sc);
      dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix);
      col.setHex(hex).offsetHSL((Math.random() - .5) * .02, 0, (Math.random() - .5) * .08);
      m.setColorAt(i, col);
    }
    m.userData.hex = hex; m.userData.n = n;
    return m;
  }

  function makeSunflower(o) {
    o = o || {};
    var g = new T.Group(), n = o.n || 16;
    var back = petalRing(PETAL_A, n, .36, -.05, .22, 0xf0a000, .0);
    var front = petalRing(PETAL_B, n, .34, .05, .02, o.hex || 0xffbd00, Math.PI / n);
    var center = new T.Mesh(new T.CylinderGeometry(.46, .5, .2, 40), new T.MeshStandardMaterial({ map: seedTex, bumpMap: seedTex, bumpScale: 1.2, roughness: .95, color: 0xffffff }));
    center.rotation.x = Math.PI / 2; center.position.z = .12;
    var ring = new T.Mesh(new T.TorusGeometry(.5, .075, 12, 44), crochetMat({ color: 0x7a4a1c }));
    ring.position.z = .14;
    g.add(back, front, center, ring);
    g.userData.rings = [back, front];
    return g;
  }

  function leaf(hex) {
    var m = new T.Mesh(new T.SphereGeometry(.5, 20, 14), crochetMat({ color: hex || C.leaf }));
    m.scale.set(.75, 1.5, .16); return m;
  }

  function makeKeychain(o) {
    o = o || {};
    var g = new T.Group();            // origin = hang point
    var metal = new T.MeshStandardMaterial({ color: C.metal, metalness: 1, roughness: .28 });
    var topRing = new T.Mesh(new T.TorusGeometry(.26, .035, 12, 36), metal); topRing.position.y = .1; g.add(topRing);
    for (var i = 0; i < 4; i++) {
      var l = new T.Mesh(new T.TorusGeometry(.1, .026, 10, 22), metal);
      l.scale.y = 1.5; l.position.y = -.26 - i * .27; l.rotation.y = i % 2 ? Math.PI / 2 : 0; g.add(l);
    }
    var clasp = new T.Mesh(new T.TorusGeometry(.11, .028, 10, 22), metal); clasp.position.y = -1.42; clasp.scale.y = 1.4; g.add(clasp);
    var flower = makeSunflower({ hex: o.hex, n: 15 }); flower.scale.setScalar(.8); flower.position.y = -2.62; g.add(flower);
    var loop = new T.Mesh(new T.TorusGeometry(.2, .07, 12, 28), crochetMat({ color: o.hex || C.sun })); loop.position.set(0, -1.62, 0); loop.scale.set(.75, 1.15, 1); g.add(loop);
    var l1 = leaf(), l2 = leaf();
    l1.position.set(-.95, -3.35, -.1); l1.rotation.z = .85; l2.position.set(.95, -3.35, -.1); l2.rotation.z = -.85;
    l1.scale.multiplyScalar(.85); l2.scale.multiplyScalar(.85);
    g.add(l1, l2);
    g.userData.flower = flower;
    g.userData.hitR = 2.1; g.userData.hitY = -2.4;
    return g;
  }

  var loader = new T.TextureLoader(), ASSETS = window.ASSETS || {};
  function makeBillboard(key, h) {
    var g = new T.Group();
    var mat = new T.MeshBasicMaterial({ transparent: true, side: T.DoubleSide, toneMapped: false, fog: false, alphaTest: .02, opacity: 0 });
    var mesh = new T.Mesh(new T.PlaneGeometry(1, 1), mat); mesh.scale.set(h, h, 1); g.add(mesh);
    if (ASSETS[key]) loader.load(ASSETS[key], function (tex) {
      tex.encoding = T.sRGBEncoding; tex.anisotropy = 4;
      mat.map = tex; mat.opacity = 1; mat.needsUpdate = true;
      mesh.scale.set(h * tex.image.width / tex.image.height, h, 1);
    });
    g.userData.hitR = h * .62; g.userData.hitY = 0;
    return g;
  }

  /* ---- Penguin (Aiman's nickname) in a sunflower beanie ---- */
  function makePenguin() {
    var g = new T.Group(), M_ = function (hex) { return crochetMat({ color: hex }); };
    var ball = function (r, hex, sx, sy, sz, x, y, z) { var m = new T.Mesh(new T.SphereGeometry(r, 28, 20), M_(hex)); m.scale.set(sx, sy, sz); m.position.set(x, y, z); g.add(m); return m; };
    ball(1, 0x2b2f55, .85, 1, .78, 0, 0, 0);                      // body
    ball(1, 0xfff3dc, .6, .76, .5, 0, -.12, .42);                  // belly
    var eyeM = new T.MeshStandardMaterial({ color: 0x0d0d14, roughness: .3 });
    [-1, 1].forEach(function (d) {
      var e = new T.Mesh(new T.SphereGeometry(.1, 16, 12), eyeM); e.position.set(d * .27, .33, .7); g.add(e);
      var h = new T.Mesh(new T.SphereGeometry(.035, 8, 8), new T.MeshBasicMaterial({ color: 0xffffff })); h.position.set(d * .27 + .03, .37, .79); g.add(h);
      ball(.2, 0xf5a3b5, 1, .7, .3, d * .46, .16, .6);             // blush
      var w = ball(.2, 0x2b2f55, .9, 2.6, 1.3, d * .86, -.1, 0); w.rotation.z = -d * .35; (g.userData.wings = g.userData.wings || []).push([w, d]);
      ball(.3, 0xff9a3c, 1, .3, 1.3, d * .3, -.97, .4);              // feet
    });
    var beak = new T.Mesh(new T.ConeGeometry(.14, .3, 18), M_(0xff9a3c)); beak.rotation.x = Math.PI / 2; beak.position.set(0, .2, .82); g.add(beak);
    var cap = new T.Mesh(new T.SphereGeometry(.7, 30, 16, 0, Math.PI * 2, 0, Math.PI / 2), M_(0xffbd00)); cap.scale.set(1.02, .8, .95); cap.position.set(0, .66, .02); g.add(cap);
    var brim = new T.Mesh(new T.TorusGeometry(.7, .09, 12, 36), M_(0xf0a000)); brim.rotation.x = Math.PI / 2; brim.scale.set(1.02, .95, 1); brim.position.set(0, .66, .02); g.add(brim);
    ball(.18, 0xfff3dc, 1, 1, 1, 0, 1.28, 0);                      // pom-pom
    var pin = makeSunflower({ n: 12 }); pin.scale.setScalar(.22); pin.position.set(.36, .98, .5); pin.rotation.y = .4; g.add(pin);
    g.userData.hitR = 1.5; g.userData.hitY = .1;
    return g;
  }

  /* ---- Tiny stitched treasure: amigurumi keychain in a little brown hat ---- */
  function makeAmigurumi() {
    var g = new T.Group();
    var geo = new T.CapsuleGeometry(.5, .6, 10, 28), pos = geo.attributes.position, cols = new Float32Array(pos.count * 3), c = new T.Color();
    for (var i = 0; i < pos.count; i++) { var y = pos.getY(i); c.setHex(y > .36 || y < -.1 ? 0xd08a35 : 0xffe9c4); cols.set([c.r, c.g, c.b], i * 3); }
    geo.setAttribute('color', new T.BufferAttribute(cols, 3));
    g.add(new T.Mesh(geo, crochetMat({ vertexColors: true, emissive: 0x4a2a0a, emissiveIntensity: .35 })));
    var brown = crochetMat({ color: 0x5a3315 });
    var dome = new T.Mesh(new T.SphereGeometry(.52, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), brown); dome.scale.set(1, .62, 1); dome.position.y = .74; g.add(dome);
    var brim = new T.Mesh(new T.CylinderGeometry(.7, .7, .08, 36), brown); brim.position.y = .75; g.add(brim);
    var dark = new T.MeshStandardMaterial({ color: 0x120a08, roughness: .4 });
    [-1, 1].forEach(function (d) {
      var e = new T.Mesh(new T.SphereGeometry(.06, 12, 10), dark); e.position.set(d * .19, .2, .47); g.add(e);
      var b = new T.Mesh(new T.SphereGeometry(.1, 12, 8), new T.MeshStandardMaterial({ color: 0xf5a3b5, roughness: 1 })); b.scale.set(1, .6, .4); b.position.set(d * .31, .08, .44); g.add(b);
    });
    var smile = new T.Mesh(new T.TorusGeometry(.11, .02, 8, 18, Math.PI), dark); smile.rotation.z = Math.PI; smile.position.set(0, .12, .49); g.add(smile);
    var metal = new T.MeshStandardMaterial({ color: C.metal, metalness: 1, roughness: .28 });
    var ring = new T.Mesh(new T.TorusGeometry(.24, .035, 12, 36), metal); ring.position.set(0, 1.2, 0); g.add(ring);
    var clasp = new T.Mesh(new T.TorusGeometry(.08, .025, 8, 16), metal); clasp.position.set(0, .98, 0); clasp.scale.y = 1.4; g.add(clasp);
    g.userData.hitR = 1.4; g.userData.hitY = .2;
    return g;
  }

  /* ---- Sunflower hair tie on a green stick (her signature) ---- */
  function makeScrunchie() {
    var g = new T.Group();
    var back = petalRing(PETAL_A, 22, .6, -.05, .12, 0xf0a000, 0), front = petalRing(PETAL_B, 22, .58, .04, .02, 0xffbd00, Math.PI / 22);
    var ring = new T.Mesh(new T.TorusGeometry(.5, .17, 14, 44), crochetMat({ color: 0x1b1b1f })); ring.position.z = .06;
    var stick = new T.Mesh(new T.CylinderGeometry(.045, .045, 3.6, 12), new T.MeshStandardMaterial({ color: 0x3c7a2c, roughness: .7 })); stick.rotation.z = Math.PI / 2; stick.position.z = .05;
    var l1 = leaf(0x5f9a4a); l1.scale.multiplyScalar(.5); l1.position.set(1.35, -.22, .05); l1.rotation.z = .3;
    var mini = makeSunflower({ n: 12 }); mini.scale.setScalar(.3); mini.position.set(1.85, .02, .05);
    g.add(back, front, ring, stick, l1, mini);
    g.userData.hitR = 1.7; g.userData.hitY = 0;
    return g;
  }

  function makeYarn(hex) {
    var g = new T.Group();
    var ball = new T.Mesh(new T.SphereGeometry(.85, 40, 28), new T.MeshStandardMaterial({ map: yarnTex, bumpMap: yarnTex, bumpScale: 2.2, color: hex, roughness: .95 }));
    ball.scale.set(1, .96, 1); g.add(ball);
    // tail
    var curve = new T.CatmullRomCurve3([new T.Vector3(.7, -.35, .5), new T.Vector3(1.3, -.9, 1), new T.Vector3(1.9, -.7, 1.8), new T.Vector3(2.5, -1.15, 1.4), new T.Vector3(3, -.8, .5)]);
    var tail = new T.Mesh(new T.TubeGeometry(curve, 40, .075, 8, false), new T.MeshStandardMaterial({ map: yarnTex, color: hex, roughness: .95 }));
    g.add(tail);
    // hook
    var hook = new T.Group();
    var shaft = new T.Mesh(new T.CylinderGeometry(.045, .05, 2.4, 14), new T.MeshStandardMaterial({ color: 0xd9a88a, metalness: .85, roughness: .25 }));
    var head = new T.Mesh(new T.TorusGeometry(.07, .035, 8, 14, Math.PI * 1.3), shaft.material); head.position.y = 1.22; head.rotation.z = -.6;
    var grip = new T.Mesh(new T.CylinderGeometry(.09, .09, .9, 14), new T.MeshStandardMaterial({ color: C.lilac, roughness: .5 })); grip.position.y = -.9;
    hook.add(shaft, head, grip); hook.position.set(-.35, .5, .3); hook.rotation.z = -.9; hook.rotation.x = .3;
    g.add(hook);
    g.userData.hitR = 1.5; g.userData.hitY = 0;
    return g;
  }

  /* ============================================================
     WORLD LAYOUT
     ============================================================ */
  var world = new T.Group(); scene.add(world);
  var items = [], pickables = [], hero = null;
  var YARN_COLS = [C.blush, C.lilac, C.cream, C.sage, C.sun];

  // [type, progress(0-1 down the page), side nx(-1..1), z, scale]
  var LAYOUT = [
    ['key',  0.00,  .93, -1,  1.6],
    ['sun',  0.085, -.78, 0,  1.6],
    ['pen',  0.17,  .8,  0,   1.3],
    ['key',  0.27, -.74, -1,  1.5],
    ['sun',  0.38,  .76, 0,   1.7],
    ['ami',  0.50, -.8,  0,   1.5],
    ['key',  0.62,  .72, -1,  1.5],
    ['scr',  0.76, -.74, 0,   1.45],
    ['key',  0.92,  .7,  0,   1.7],
    ['bb',   0.40,  .93,  1,  1, 'charlie', 5.4],
    ['bb',   0.64, -.9,  1,  1, 'girlYarn', 3.6],
    ['bb',   0.9,  -.9,  1,  1, 'girlKnit', 3.4]
  ];
  var DECOR = []; // filler, deeper
  for (var d = 0; d < (small ? 14 : 26); d++) {
    DECOR.push([['sun', 'yarn', 'key'][d % 3], d / (small ? 14 : 26) + rand(-.02, .02), (d % 2 ? 1 : -1) * rand(.74, 1.3), rand(-13, -6), rand(.5, .95)]);
  }

  function build() {
    LAYOUT.forEach(function (L, idx) {
      var obj = L[0] === 'bb' ? makeBillboard(L[5], L[6]) : L[0] === 'pen' ? makePenguin() : L[0] === 'ami' ? makeAmigurumi() : L[0] === 'scr' ? makeScrunchie() : L[0] === 'sun' ? makeSunflower({ n: 18 }) : L[0] === 'key' ? makeKeychain() : makeYarn(YARN_COLS[idx % YARN_COLS.length]);
      var it = { obj: obj, type: L[0], p: L[1], nx: L[2], z: L[3], s: L[4], dy: 0, phase: Math.random() * 6.28, id: idx, hover: 0, spin: 0, pick: true, base: L[4] };
      if (idx === 0) { hero = it; }
      if (L[0] === 'key') obj.position.y = 0;
      var hit = new T.Mesh(new T.SphereGeometry(obj.userData.hitR || 1.4, 10, 8), new T.MeshBasicMaterial({ visible: false }));
      hit.position.y = obj.userData.hitY || 0; hit.userData.item = it; obj.add(hit);
      world.add(obj); items.push(it); pickables.push(hit);
    });
    DECOR.forEach(function (L, idx) {
      var obj = L[0] === 'sun' ? makeSunflower({ n: 14 }) : L[0] === 'key' ? makeKeychain() : makeYarn(YARN_COLS[idx % YARN_COLS.length]);
      world.add(obj);
      items.push({ obj: obj, type: L[0], p: Math.min(1, Math.max(0, L[1])), nx: L[2], z: L[3], s: L[4], dy: 0, phase: Math.random() * 6.28, hover: 0, spin: 0, pick: false, base: L[4] });
    });
  }
  build();

  function layout() {
    items.forEach(function (it) {
      var dist = 14 - it.z;
      var halfW = Math.tan(T.MathUtils.degToRad(camera.fov / 2)) * dist * camera.aspect;
      var nx = it.nx, dy = 0, s = it.base;
      if (camera.aspect < 1) { nx = (it.nx < 0 ? -1 : 1) * 1.08; s = it.base * (it === hero ? .5 : it.type === 'bb' ? .58 : .46); }
      it.s = s; it.dy = dy;
      it.x = nx * halfW * (camera.aspect < 1 ? .92 : .82);
      it.y = -it.p * WORLD_H + dy;
      // keychains hang from a point: lift so flower sits near target y
      if (it.type === 'key') it.y += 1.7 * s;
      it.obj.position.set(it.x, it.y, it.z);
      if (!it.hover) it.hover = s;
      it.obj.scale.setScalar(it.hover);
    });
  }

  function resize() {
    var w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    layout();
  }
  addEventListener('resize', resize); resize();
  function moonSize() { var k = camera.aspect < 1 ? 14 : 24; moon.scale.set(k, k, 1); moonGlow.scale.set(k * 4.6, k * 4.6, 1); }
  addEventListener('resize', moonSize); moonSize();

  /* ============================================================
     INTERACTION
     ============================================================ */
  var ray = new T.Raycaster(), ndc = new T.Vector2(), mouse = { x: 0, y: 0 }, hovered = null;
  var hintEl = document.getElementById('hint');
  var htmlEl = document.documentElement;
  var INTERACTIVE = 'a,button,.sticker,.gate-charlie,.card,.frame,.paper,.lightbox,.toast,.hud,.wishes-hud,input';

  function pick(cx, cy) {
    ndc.set((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    var hits = ray.intersectObjects(pickables, false);
    return hits.length ? hits[0] : null;
  }

  var found = {};
  addEventListener('pointermove', function (e) {
    mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = (e.clientY / innerHeight) * 2 - 1;
    // hover detection
    if (e.pointerType === 'touch' || !document.body.classList.contains('entered')) return;
    if (e.target.closest && e.target.closest(INTERACTIVE)) { setHover(null); return; }
    var h = pick(e.clientX, e.clientY);
    setHover(h ? h.object.userData.item : null, e);
    trail(e.clientX, e.clientY);
  }, { passive: true });

  function setHover(it, e) {
    if (hovered && hovered !== it) hovered.hovering = false;
    hovered = it;
    if (it) {
      it.hovering = true; htmlEl.classList.add('hover3d');
      hintEl.textContent = found[it.id] ? '✦ again?' : '✦ a wish is hiding here';
      hintEl.style.left = e.clientX + 'px'; hintEl.style.top = e.clientY + 'px'; hintEl.classList.add('on');
    } else { htmlEl.classList.remove('hover3d'); hintEl.classList.remove('on'); }
  }

  var lastTrail = 0;
  function trail(x, y) {
    if (reduce || coarse) return;
    var now = performance.now(); if (now - lastTrail < 45) return; lastTrail = now;
    var v = screenToWorld(x, y, 14);
    emit(v.x, v.y, v.z, rand(-.4, .4), rand(-.2, .5), rand(-.2, .2), rand(.6, 1.1), rand(.2, .45));
  }

  function screenToWorld(x, y, dist) {
    var v = new T.Vector3((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1, .5).unproject(camera);
    var dir = v.sub(camera.position).normalize();
    return camera.position.clone().add(dir.multiplyScalar(dist));
  }

  addEventListener('click', function (e) {
    if (!document.body.classList.contains('entered')) return;
    if (e.target.closest && e.target.closest(INTERACTIVE)) return;
    var h = pick(e.clientX, e.clientY);
    if (h) {
      var it = h.object.userData.item;
      it.spin = 14; it.pop = 1;
      burstAt(h.point, 90, 6);
      found[it.id] = true;
      if (M.onPick) M.onPick(it.id, e.clientX, e.clientY);
    } else {
      burstAt(screenToWorld(e.clientX, e.clientY, 14), 18, 2.6);
    }
  });

  /* ---------- public API ---------- */
  M.sparkle = function (x, y, n) { burstAt(screenToWorld(x, y, 14), n || 60, 5.5); };
  M.recolor = function (hex) {
    if (!hero) return;
    var col = new T.Color(hex), c2 = new T.Color();
    var fl = hero.obj.userData.flower;
    fl.userData.rings[1].userData.hex = col.getHex();
    fl.userData.rings.forEach(function (m, k) {
      for (var i = 0; i < m.userData.n; i++) {
        c2.copy(col); if (k === 0) c2.multiplyScalar(.8);
        c2.offsetHSL((Math.random() - .5) * .02, 0, (Math.random() - .5) * .08);
        m.setColorAt(i, c2);
      }
      m.instanceColor.needsUpdate = true;
    });
    hero.obj.children.forEach(function (c) { if (c.geometry && c.geometry.type === 'TorusGeometry' && c.scale.y > 1.1 && c.material.map) c.material.color.copy(col); });
    hero.pop = 1; hero.spin = 12;
  };
  var entering = 0, entered = false;
  M.enter = function () { entered = true; entering = 0; };

  // sunflower rain
  var rainers = [];
  M.rain = function () {
    var n = small ? 22 : 40;
    for (var i = 0; i < n; i++) {
      (function (i) {
        setTimeout(function () {
          var f = makeSunflower({ n: 12 });
          var s = rand(.35, .7); f.scale.setScalar(s);
          var p = camera.position;
          f.position.set(p.x + rand(-9, 9), p.y + 11 + rand(0, 3), p.z - rand(1, 8));
          world.add(f);
          rainers.push({ obj: f, vy: -rand(2.2, 4), spin: new T.Vector3(rand(-1.4, 1.4), rand(-1.4, 1.4), rand(-1.4, 1.4)), life: 9 });
        }, i * (reduce ? 10 : 90));
      })(i);
    }
  };

  /* ============================================================
     LOOP
     ============================================================ */
  var clock = new T.Clock(), scrollS = 0, camY = 0, camX = 0, camMx = 0, camMy = 0, progress = 0;
  function readScroll() {
    var max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progress = Math.min(1, Math.max(0, (window.scrollY || 0) / max));
  }
  addEventListener('scroll', readScroll, { passive: true }); readScroll();
  addEventListener('load', function () { readScroll(); });

  function frame() {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    var dt = Math.min(.05, clock.getDelta()), t = clock.elapsedTime;
    timeU.value = t;

    // camera
    scrollS += (progress - scrollS) * Math.min(1, dt * 3.2);
    camY = -scrollS * WORLD_H;
    camMx += ((reduce ? 0 : mouse.x) - camMx) * Math.min(1, dt * 2.5);
    camMy += ((reduce ? 0 : mouse.y) - camMy) * Math.min(1, dt * 2.5);
    if (entered) entering = Math.min(1, entering + dt / 3.2);
    var ease = 1 - Math.pow(1 - entering, 3);
    var z = lerp(24, 14, ease) + Math.sin(t * .25) * .15;
    camera.position.set(camMx * 1.1 + Math.sin(t * .15) * .3, camY - camMy * .7 + Math.sin(t * .2) * .15, z);
    camera.lookAt(camMx * .4, camY - camMy * .25 - .2, 0);
    if (window.__cam) { camera.position.copy(window.__cam.p); camera.lookAt(window.__cam.l); }
    camBase.z = z;
    glowLight.position.set(camera.position.x + 3, camera.position.y + 2, 9);

    sky.position.copy(camera.position);
    starGroup.position.copy(camera.position);
    moonGroup.position.set(camera.position.x - Math.min(98, Math.tan(T.MathUtils.degToRad(25)) * 150 * camera.aspect * .72 * (camera.aspect < 1 ? 1.1 : 1)) - camMx * 2, camera.position.y * .55 + 50, -150);
    setPalette(scrollS);

    // items
    for (var i = 0; i < items.length; i++) {
      var it = items[i], o = it.obj, target = it.s * (it.hovering ? 1.16 : 1) * (1 + (it.pop || 0) * .22);
      it.hover += (target - it.hover) * Math.min(1, dt * 8);
      o.scale.setScalar(it.hover);
      if (it.pop) it.pop = Math.max(0, it.pop - dt * 2.2);
      it.spinAcc = (it.spinAcc || 0) + it.spin * dt;
      it.spin *= Math.pow(.05, dt);
      var bob = Math.sin(t * .7 + it.phase) * .28;
      o.position.y = it.y + bob * (it.type === 'key' ? .6 : 1);
      if (it.type === 'key') {
        o.rotation.z = Math.sin(t * .9 + it.phase) * .13;
        o.rotation.y = Math.sin(t * .45 + it.phase) * .55 + it.spinAcc;
      } else if (it.type === 'sun') {
        o.rotation.y = Math.sin(t * .4 + it.phase) * .5 + it.spinAcc;
        o.rotation.x = Math.sin(t * .33 + it.phase) * .18;
        o.rotation.z = t * .12 * (it.phase > 3 ? 1 : -1);
      } else if (it.type === 'pen') {
        var hop = Math.abs(Math.sin(t * 1.3 + it.phase));
        o.position.y = it.y + hop * .35;
        o.rotation.y = Math.sin(t * .5 + it.phase) * .5 + it.spinAcc;
        o.rotation.z = Math.sin(t * 2.6 + it.phase) * .06;
        (o.userData.wings || []).forEach(function (w) { w[0].rotation.z = -w[1] * (.35 + Math.sin(t * 5 + it.phase) * .22 * hop); });
      } else if (it.type === 'ami') {
        o.rotation.y = Math.sin(t * .6 + it.phase) * .6 + it.spinAcc;
        o.rotation.z = Math.sin(t * .9 + it.phase) * .12;
      } else if (it.type === 'scr') {
        o.rotation.z = t * .18 + it.phase;
        o.rotation.y = Math.sin(t * .4 + it.phase) * .45 + it.spinAcc;
      } else if (it.type === 'bb') {
        o.rotation.y = Math.sin(t * .6 + it.phase) * .4 + it.spinAcc;
        o.rotation.z = Math.sin(t * .8 + it.phase) * .05;
      } else {
        o.rotation.y = t * .25 + it.phase + it.spinAcc;
        o.rotation.z = Math.sin(t * .5 + it.phase) * .2;
      }
    }

    // rain
    for (var r = rainers.length - 1; r >= 0; r--) {
      var rr = rainers[r];
      rr.obj.position.y += rr.vy * dt; rr.obj.rotation.x += rr.spin.x * dt; rr.obj.rotation.y += rr.spin.y * dt; rr.obj.rotation.z += rr.spin.z * dt;
      rr.life -= dt;
      if (rr.life <= 0) {
        world.remove(rr.obj);
        rr.obj.traverse(function (c) { if (c.geometry && c.geometry !== PETAL_A && c.geometry !== PETAL_B) c.geometry.dispose(); if (c.material) c.material.dispose(); });
        rainers.splice(r, 1);
      }
    }

    updateParticles(dt);
    renderer.render(scene, camera);
  }
  if (location.hash === '#debug') window.__magic = { items: items, THREE: T };
  // render once so the page isn't blank before the loop starts
  renderer.render(scene, camera);
  frame();
})();
