/* ============================================================
   UI + audio for the gentleman's garage. scene.js plugs into window.MAGIC.
   ✦ Personalise everything in CONFIG.
   ============================================================ */
(function () {
  'use strict';

  var CONFIG = {
    name: 'Mr. Khan',        // his name, used across the page
    nick: 'Pathaan',         // nickname, used in the letter greeting
    from: 'Ms. Syeda',           // sign-off on the letter
    music: 'music/song.mp3', // optional: your own track. If missing, a slow romantic score plays instead.
    wishes: [                // 10 wishes hidden in the 3D objects (ids match the scene)
      'May every road ahead be smooth, and every green light yours.',
      'Strong, steady, never stuck. May this year carry you through anything.',
      'Quick off the line, calm at the wheel. May good things find you fast.',
      'Some things only get better with age. You are one of them.',
      'Clear skies and tailwinds, always. Pilot at heart, legend by nature.',
      'May time be generous to you, and every hour feel well spent.',
      'The future is so bright, even the aviators are jealous.',
      'May the people who love you keep your fire burning.',
      'May your evenings be slow and your company be good.',
      'Here is to calm after every storm, and peace of mind.'
    ],
    cars: [                  // garage stops, in scroll order (matches the 3D scene)
      { sfx: 'bmw', name: 'BMW', line: 'Precision, presence and a quiet kind of power.', chips: ['Sport coupé', 'Twin-turbo', 'Pure poise'] },
      { photo: 'img/cars/hilux.jpg', sfx: 'diesel', name: 'Toyota Hilux', line: 'The latest model. Built to carry whatever life puts on it.', chips: ['Latest model', '4×4', 'Unstoppable'] },
      { photo: 'img/cars/civic.jpg', sfx: 'civic', name: 'Honda Civic RS', line: 'Sharp, quick and honest, just like the man who drives it.', chips: ['RS', 'Turbo', 'Daily thrill'] },
      { photo: 'img/cars/antique.jpg', sfx: 'antique', name: 'The Collector\'s Classic', line: 'For the billionaire in him: a vintage beauty that only improves with age.', chips: ['Vintage', 'Hand-built', 'Timeless'] },
      { photo: 'img/cars/raptor.jpg', sfx: 'jet', name: 'F-22 Raptor', line: 'The sky is not the limit. For a pilot at heart, it is home.', chips: ['Air dominance', 'Stealth', 'Pilot at heart'] }
    ],
    portraits: [             // [file in img/his/, title, hover line, wide?]
      ['aviators.jpg', 'The Aviators', 'that effortless look'],
      ['bench.jpg', 'Effortless', 'completely at ease', true],
      ['night.jpg', 'Quiet confidence', 'no words needed'],
      ['watch.jpg', 'Time well kept', 'elegance, down to the wrist'],
      ['levis.jpg', 'Always composed', 'calm in every room']
    ],
    icons: [
      ['icons/mustang.jpg', 'Fastback', 'steel, sunlight and a V8 hum', false, 'v8'],
      ['icons/cobra.jpg', 'The Cobra', 'raw, red and unapologetic', true, 'v8'],
      ['icons/watch.jpg', 'Time, well kept', 'automatic, fluted, unhurried', true],
      ['icons/aviators.jpg', 'Aviators', 'a pilot\'s signature'],
      ['icons/lighter.jpg', 'Gold, lit', 'a flame worth the wait', false, 'lighter'],
      ['icons/goldleaf.jpg', 'Gold Leaf', 'his small ritual', false, 'lighter']
    ],
    extra: [
      ['armoury/rifles.jpg', 'The rifles', 'a collector\'s eye', true, 'rifle'],
      ['armoury/glock.jpg', 'Glock 34', 'precision, boxed and kept', false, 'pistol']
    ]                        // more photos: [['armoury/file.jpg', 'Title', 'hover line']] in img/
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var noop = function () {};
  var MAGIC = window.MAGIC = {
    total: CONFIG.wishes.length, cars: CONFIG.cars.length,
    sparkle: noop, rain: noop, enter: noop, flashLights: noop, engineStart: noop, rev: noop, goCar: null,
    onPick: null, onCar: null
  };

  $$('.js-name').forEach(function (e) { e.textContent = CONFIG.name; });
  $$('.js-nick').forEach(function (e) { e.textContent = CONFIG.nick; });
  $$('.js-from').forEach(function (e) { e.textContent = CONFIG.from; });
  var mono = $('.mono'); if (mono) mono.textContent = CONFIG.name.charAt(0).toUpperCase();
  document.title = 'Happy Birthday ' + CONFIG.name + ' ✦';
  $('#foundTotal').textContent = CONFIG.wishes.length;

  /* ============================================================
     AUDIO: synthesised. Slow romantic score (flute, drone, strings,
     soft tabla) + car sound effects. Your own song.mp3 wins if present.
     ============================================================ */
  var Sound = (function () {
    var ctx, master, musicBus, sfxBus, wet, enabled = true, started = false, bgm = null, synthOn = false;
    var noiseBuf, engine = null, notes = 0;
    var mtof = function (n) { return 440 * Math.pow(2, (n - 69) / 12); };

    function init() {
      if (ctx) return;
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = .9; master.connect(ctx.destination);
      musicBus = ctx.createGain(); musicBus.gain.value = .85; musicBus.connect(master);
      sfxBus = ctx.createGain(); sfxBus.gain.value = 1; sfxBus.connect(master);
      var len = ctx.sampleRate * 2.6, buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (var c = 0; c < 2; c++) { var d = buf.getChannelData(c); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4); }
      var conv = ctx.createConvolver(); conv.buffer = buf;
      wet = ctx.createGain(); wet.gain.value = .5; conv.connect(wet); wet.connect(master); master.rv = conv;
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      var nd = noiseBuf.getChannelData(0); for (var j = 0; j < nd.length; j++) nd[j] = Math.random() * 2 - 1;
    }
    function env(g, t, a, peak, dur) {
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    }
    function send(node, bus, rv) { node.connect(bus || musicBus); if (rv !== false) node.connect(master.rv); }
    function noise(t, dur, f1, f2, q, vol, bus, rv) {
      var s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
      var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = q || 1; f.frequency.setValueAtTime(f1, t); f.frequency.exponentialRampToValueAtTime(f2, t + dur);
      var g = ctx.createGain(); env(g, t, Math.min(.05, dur / 3), vol, dur);
      s.connect(f); f.connect(g); send(g, bus || sfxBus, rv); s.start(t); s.stop(t + dur + .05);
    }
    function tone(freq, t, dur, vol, type, bus, rv) {
      var o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || 'sine'; o.frequency.value = freq;
      env(g, t, .006, vol, dur); o.connect(g); send(g, bus || sfxBus, rv); o.start(t); o.stop(t + dur + .05);
    }

    /* --- music voices --- */
    function pluck(freq, t, vol, dur, type, lp) {
      var o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
      o.type = type || 'triangle'; o.frequency.value = freq; f.type = 'lowpass'; f.frequency.value = lp || 2400;
      env(g, t, .01, vol, dur); o.connect(f); f.connect(g); send(g); o.start(t); o.stop(t + dur + .05); notes++;
    }
    function flute(midi, t, dur, vol, from) {
      var f0 = mtof(midi), o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      o.type = 'sine'; o2.type = 'triangle';
      o.frequency.setValueAtTime(from ? mtof(from) : f0, t); o.frequency.exponentialRampToValueAtTime(f0, t + (from ? .14 : .01));
      o2.frequency.setValueAtTime(from ? mtof(from) * 2 : f0 * 2, t); o2.frequency.exponentialRampToValueAtTime(f0 * 2, t + (from ? .14 : .01));
      lfo.frequency.value = 5.2; lg.gain.value = f0 * .0035; lfo.connect(lg); lg.connect(o.frequency);
      var g2 = ctx.createGain(); g2.gain.value = .12; o2.connect(g2);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + .12); g.gain.setValueAtTime(vol, t + Math.max(.14, dur - .25)); g.gain.linearRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g2.connect(g); send(g);
      noise(t, dur, f0 * 2, f0 * 2, 3, vol * .05, musicBus, true);   // breath
      o.start(t); o2.start(t); lfo.start(t); o.stop(t + dur + .05); o2.stop(t + dur + .05); lfo.stop(t + dur + .05); notes++;
    }
    function pad(midis, t, dur, vol) {
      midis.forEach(function (m, i) {
        [-6, 6].forEach(function (det) {
          var o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
          o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = det; f.type = 'lowpass'; f.frequency.value = 900;
          g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + dur * .4 + i * .1); g.gain.linearRampToValueAtTime(0.0001, t + dur + 1);
          o.connect(f); f.connect(g); send(g); o.start(t); o.stop(t + dur + 1.1);
        });
      });
    }
    /* soft celesta/piano-style voice: sine body + quiet octave, quick pluck, long tail */
    function bell(midi, t, dur, vol) {
      var f = mtof(midi), o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain(), lp = ctx.createBiquadFilter();
      o.type = 'sine'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2; g2.gain.value = .22; lp.type = 'lowpass'; lp.frequency.value = 3600;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); send(g); o.start(t); o2.start(t); o.stop(t + dur + .05); o2.stop(t + dur + .05); notes++;
    }
    function softPad(midis, t, dur, vol) {
      midis.forEach(function (m, i) {
        var o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        o.type = 'triangle'; o.frequency.value = mtof(m); f.type = 'lowpass'; f.frequency.value = 1100;
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + dur * .45); g.gain.linearRampToValueAtTime(0.0001, t + dur + .8);
        o.connect(f); f.connect(g); send(g); o.start(t); o.stop(t + dur + .9);
      });
    }
    /* D major, slow: Bm7 - Gmaj7 - D - A. Gentle pad, soft bass, rolling celesta arpeggio, lyrical flute line. */
    var CH = [[59, 62, 66, 69], [55, 59, 62, 66], [57, 62, 66, 69], [57, 61, 64, 69]], ROOT = [47, 43, 50, 45];
    var MEL = [
      [[78, 1.5], [76, .5], [74, 2]], [[71, 1], [74, 1], [79, 2]],
      [[78, 1], [74, 1], [76, 1], [78, 1]], [[76, 1.5], [73, .5], [74, 2]]
    ];
    var ARP = [0, 1, 2, 3, 2, 1, 2, 3], BEAT = 60 / 58, bar = 0, nextBar = 0;
    function scheduleBar(t) {
      var ch = CH[bar % 4], B = BEAT;
      softPad(ch, t, B * 4, .011);
      pluck(mtof(ROOT[bar % 4]), t, .05, B * 3.4, 'sine', 380);
      for (var k = 0; k < 8; k++) bell(ch[ARP[k]] + (k % 4 === 3 ? 12 : 0), t + k * B * .5, 1.8, .017 + (k % 2 ? 0 : .006));
      var mel = MEL[bar % 4], tt = t + B * .25, prev = null;
      if (bar % 8 < 6) mel.forEach(function (n) { flute(n[0], tt, n[1] * B * .98, .034, prev); bell(n[0] + 12, tt, 2.2, .008); prev = n[0]; tt += n[1] * B; });
      bar++;
    }
    function startSynth() {
      if (synthOn || !ctx) return; synthOn = true; nextBar = ctx.currentTime + .2;
      (function tick() { if (ctx && nextBar < ctx.currentTime + 1.5) { scheduleBar(nextBar); nextBar += BEAT * 4; } setTimeout(tick, 300); })();
    }

    /* --- sound effects --- */
    function chirp() { if (!ctx) return; var t = ctx.currentTime; [0, .14].forEach(function (d) { tone(2600, t + d, .09, .06, 'square', sfxBus, false); }); }
    function thunk() { if (!ctx) return; var t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + .16); env(g, t, .004, .28, .3); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .35); noise(t, .08, 900, 300, 1, .1, sfxBus, false); }
    function doorOpen() { if (!ctx) return; var t = ctx.currentTime; noise(t, 1.4, 200, 900, 2, .05, sfxBus, true); tone(98, t + .3, 1.6, .05, 'sine', sfxBus, true); }
    function whoosh() { if (!ctx) return; var t = ctx.currentTime; noise(t, 3.4, 250, 2600, .9, .16, sfxBus, true); noise(t + 1.5, 2.6, 2600, 180, .9, .12, sfxBus, true); tone(46, t, 3.6, .08, 'sawtooth', sfxBus, false); }
    function engineStart() {
      if (!ctx || !enabled) return; var t = ctx.currentTime;
      // starter crank
      var o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = 34; lp.type = 'lowpass'; lp.frequency.value = 260; lfo.frequency.value = 9; lg.gain.value = .5; lfo.connect(lg);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(.14, t + .15); g.gain.setValueAtTime(.14, t + 1.1); g.gain.linearRampToValueAtTime(0.0001, t + 1.3); lg.connect(g.gain);
      o.connect(lp); lp.connect(g); g.connect(sfxBus); o.start(t); lfo.start(t); o.stop(t + 1.4); lfo.stop(t + 1.4);
      // ignition + idle
      var ti = t + 1.15; noise(ti, .5, 1800, 200, .8, .22, sfxBus, true);
      var e = { o: ctx.createOscillator(), o2: ctx.createOscillator(), g: ctx.createGain(), lp: ctx.createBiquadFilter(), lfo: ctx.createOscillator(), lg: ctx.createGain(), am: ctx.createGain() };
      e.o.type = 'sawtooth'; e.o.frequency.value = 46; e.o2.type = 'square'; e.o2.frequency.value = 23; e.lp.type = 'lowpass'; e.lp.frequency.value = 320; e.lp.Q.value = 3;
      e.lfo.frequency.value = 23; e.lg.gain.value = .4; e.am.gain.value = .6; e.lfo.connect(e.lg); e.lg.connect(e.am.gain);
      e.g.gain.setValueAtTime(0.0001, ti); e.g.gain.linearRampToValueAtTime(.12, ti + .35);
      e.o.connect(e.lp); e.o2.connect(e.lp); e.lp.connect(e.am); e.am.connect(e.g); e.g.connect(sfxBus); e.g.connect(master.rv);
      e.o.start(ti); e.o2.start(ti); e.lfo.start(ti); engine = e;
    }
    function rev() {
      if (!ctx || !engine) return; var t = ctx.currentTime, e = engine;
      [[e.o.frequency, 46, 150, 38], [e.o2.frequency, 23, 75, 19], [e.lfo.frequency, 23, 75, 19], [e.lp.frequency, 320, 1500, 360]].forEach(function (p) {
        p[0].cancelScheduledValues(t); p[0].setValueAtTime(p[0].value, t); p[0].linearRampToValueAtTime(p[2], t + .55); p[0].exponentialRampToValueAtTime(p[3] > 0 ? Math.max(p[1], p[3]) : p[1], t + 1.5); p[0].linearRampToValueAtTime(p[1], t + 2.2);
      });
      e.g.gain.cancelScheduledValues(t); e.g.gain.setValueAtTime(e.g.gain.value, t); e.g.gain.linearRampToValueAtTime(.2, t + .5); e.g.gain.linearRampToValueAtTime(.12, t + 2.2);
    }


    /* --- per-object sounds --- */
    function gunShot(t, vol, tail) {
      noise(t, .09, 6000, 900, .6, vol, sfxBus, true);                       // crack
      noise(t, tail || .45, 2200, 140, .5, vol * .55, sfxBus, true);         // report + room
      var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(34, t + .22);
      env(g, t, .002, vol * .9, .3); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + .35);
    }
    function engineBlip(kind) {
      var P = {
        bmw:     { f0: 52, f1: 190, lp: 1100, type: 'sawtooth', am: 0,  dur: 2.1, vol: .16 },
        diesel:  { f0: 36, f1: 96,  lp: 520,  type: 'square',   am: 26, dur: 2.2, vol: .16 },
        civic:   { f0: 60, f1: 260, lp: 1500, type: 'sawtooth', am: 0,  dur: 1.9, vol: .14 },
        antique: { f0: 26, f1: 62,  lp: 420,  type: 'square',   am: 13, dur: 2.4, vol: .17 },
        v8:      { f0: 38, f1: 140, lp: 760,  type: 'sawtooth', am: 19, dur: 2.5, vol: .19 }
      }[kind] || null; if (!P) return;
      var t = ctx.currentTime, o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter(), am = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      o.type = P.type; o2.type = 'sawtooth'; lp.type = 'lowpass'; lp.Q.value = 2.5; am.gain.value = P.am ? .55 : 1;
      o.frequency.setValueAtTime(P.f0, t); o.frequency.exponentialRampToValueAtTime(P.f1, t + .7); o.frequency.exponentialRampToValueAtTime(P.f0 * 1.1, t + P.dur);
      o2.frequency.setValueAtTime(P.f0 * 2.01, t); o2.frequency.exponentialRampToValueAtTime(P.f1 * 2.01, t + .7); o2.frequency.exponentialRampToValueAtTime(P.f0 * 2.2, t + P.dur);
      lp.frequency.setValueAtTime(P.lp * .5, t); lp.frequency.linearRampToValueAtTime(P.lp * 1.5, t + .7); lp.frequency.linearRampToValueAtTime(P.lp * .5, t + P.dur);
      if (P.am) { lfo.frequency.value = P.am; lg.gain.value = .45; lfo.connect(lg); lg.connect(am.gain); lfo.start(t); lfo.stop(t + P.dur + .1); }
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(P.vol, t + .12); g.gain.setValueAtTime(P.vol, t + P.dur - .5); g.gain.linearRampToValueAtTime(0.0001, t + P.dur);
      var g2 = ctx.createGain(); g2.gain.value = .35; o2.connect(g2); o.connect(lp); g2.connect(lp); lp.connect(am); am.connect(g); g.connect(sfxBus); g.connect(master.rv);
      o.start(t); o2.start(t); o.stop(t + P.dur + .1); o2.stop(t + P.dur + .1);
      if (kind === 'v8' || kind === 'antique') noise(t + P.dur * .72, .12, 1500, 300, 1, .1, sfxBus, true);   // exhaust pop
    }
    function jetRoar() { var t = ctx.currentTime; noise(t, 3, 300, 3000, .8, .17, sfxBus, true); noise(t + 1.2, 2.2, 3000, 200, .8, .12, sfxBus, true); tone(58, t, 3, .07, 'sawtooth', sfxBus, false); }
    function lighterFlick() { var t = ctx.currentTime; tone(3300, t, .05, .06, 'square', sfxBus, false); tone(2300, t + .09, .12, .05, 'square', sfxBus, false); noise(t + .16, .35, 900, 300, 1.5, .09, sfxBus, true); }
    function playKind(k) {
      if (!ctx || !enabled) return; if (ctx.state === 'suspended') ctx.resume();
      var t = ctx.currentTime;
      if (k === 'pistol') gunShot(t, .5, .5);
      else if (k === 'rifle') { gunShot(t, .5, .4); gunShot(t + .11, .45, .4); gunShot(t + .22, .45, .7); }
      else if (k === 'jet') jetRoar();
      else if (k === 'lighter') lighterFlick();
      else engineBlip(k);
    }

    return {
      play: playKind,
      start: function () {
        init(); if (ctx && ctx.state === 'suspended') ctx.resume();
        if (started) return; started = true;
        if (CONFIG.music) {
          bgm = new Audio(CONFIG.music); bgm.loop = true; bgm.volume = .85; bgm.muted = !enabled;
          bgm.addEventListener('error', startSynth);
          var p = bgm.play(); if (p && p.catch) p.catch(function () { startSynth(); });
        } else startSynth();
      },
      toggle: function () { enabled = !enabled; if (bgm) bgm.muted = !enabled; if (ctx) master.gain.setTargetAtTime(enabled ? .9 : 0, ctx.currentTime, .1); return enabled; },
      chime: function (i) { if (!ctx || !enabled) return; var S = [523.25, 587.33, 659.25, 783.99, 880, 1046.5]; var f = S[(i == null ? Math.floor(Math.random() * S.length) : i) % S.length], t = ctx.currentTime; tone(f, t, 1.4, .06, 'sine'); tone(f * 2, t, .6, .02, 'sine'); },
      arpeggio: function () { if (!ctx || !enabled) return; var t = ctx.currentTime; [523.25, 659.25, 783.99, 987.77, 1174.66].forEach(function (f, i) { tone(f, t + i * .08, 1.5, .05, 'sine'); }); },
      chirp: function () { if (enabled) chirp(); }, thunk: function () { if (enabled) thunk(); }, doorOpen: function () { if (enabled) doorOpen(); },
      whoosh: function () { if (enabled) whoosh(); }, engineStart: engineStart, rev: function () { if (enabled) rev(); },
      _notes: function () { return notes; }
    };
  })();
  MAGIC.sound = Sound;

  /* ============================================================
     GATE
     ============================================================ */
  var flashEl = $('#flash');
  MAGIC.flashScreen = function () { flashEl.classList.add('on'); setTimeout(function () { flashEl.classList.remove('on'); }, 130); };
  $('#enter').addEventListener('click', function () {
    Sound.start(); Sound.chirp();
    setTimeout(Sound.thunk, 1000); setTimeout(Sound.doorOpen, 1200);
    MAGIC.enter();
    var fob = $('#enter'); fob.style.pointerEvents = 'none';
    setTimeout(function () {
      document.body.classList.add('entered'); document.body.classList.remove('locked');
      $$('.hero .reveal').forEach(function (el) { el.classList.add('in'); });
    }, 3700);
  });
  var musicBtn = $('#music');
  musicBtn.addEventListener('click', function () { musicBtn.setAttribute('aria-pressed', Sound.toggle() ? 'true' : 'false'); });

  /* ============================================================
     WISHES
     ============================================================ */
  var found = {}, foundCount = 0, toastTimer, toast = $('#toast'), toastP = $('p', toast), hud = $('#wishesHud');
  function showToast(text, ms) { toastP.textContent = text; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('show'); }, ms || 4800); }
  MAGIC.toast = showToast;
  MAGIC.onPick = function (id) {
    var isNew = !found[id];
    if (isNew) { found[id] = true; foundCount++; $('#foundN').textContent = foundCount; $('#foundBar').style.width = (foundCount / CONFIG.wishes.length * 100) + '%'; hud.classList.remove('pop'); void hud.offsetWidth; hud.classList.add('pop'); }
    Sound.chime(id);
    if (foundCount === CONFIG.wishes.length && isNew) {
      showToast('You found every wish, ' + CONFIG.name + '. Every one of them is meant.', 7000);
      setTimeout(function () { Sound.arpeggio(); MAGIC.rain(); }, 500);
    } else showToast(CONFIG.wishes[id % CONFIG.wishes.length]);
  };

  /* ============================================================
     REVEAL, TILT
     ============================================================ */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  function observe() { $$('.reveal').forEach(function (el) { if (!el.closest('.hero') && !el.dataset.obs) { el.dataset.obs = 1; io.observe(el); } }); }

  function tiltify(el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.classList.add('live'); el.style.setProperty('--ry', ((px - .5) * 12).toFixed(2) + 'deg'); el.style.setProperty('--rx', ((.5 - py) * 12).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (px * 100) + '%'); el.style.setProperty('--my', (py * 100) + '%');
    });
    el.addEventListener('pointerleave', function () { el.classList.remove('live'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  }
  var canTilt = !reduce && window.matchMedia('(hover:hover)').matches;

  /* ============================================================
     PORTRAITS + extra gallery
     ============================================================ */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lastFocus;
  function openLb(src, cap, alt) { lastFocus = document.activeElement; lbImg.src = src; lbImg.alt = alt || ''; lbCap.textContent = cap; lb.hidden = false; $('#lbClose').focus(); document.body.style.overflow = 'hidden'; Sound.chime(3); }
  function closeLb() { lb.hidden = true; document.body.style.overflow = document.body.classList.contains('locked') ? 'hidden' : ''; if (lastFocus) lastFocus.focus(); }
  $('#lbClose').addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  function frame(base, item, grid, reveal) {
    var fig = document.createElement('figure'); fig.className = 'gframe reveal' + (item[3] ? ' wide' : ''); fig.tabIndex = 0; fig.setAttribute('role', 'button'); fig.setAttribute('aria-label', 'Open photo: ' + item[1]);
    var img = new Image(); img.alt = item[1]; img.loading = 'lazy';
    fig.innerHTML = '<div class="fr"></div><figcaption><span class="script"></span><small>tap to open ✦</small></figcaption><span class="bubble"></span>';
    $('.fr', fig).appendChild(img); $('.script', fig).textContent = item[1]; $('.bubble', fig).textContent = item[2] || '';
    var src = base + item[0];
    img.onload = function () { grid.appendChild(fig); grid.parentNode.hidden = false; var sec = grid.closest('section'); if (sec) sec.hidden = false; observe(); if (canTilt) tiltify(fig); };
    img.onerror = function () {};
    fig.addEventListener('click', function (e) { MAGIC.sparkle(e.clientX, e.clientY, 26); openLb(src, item[1], item[1]); if (item[4]) Sound.play(item[4]); });
    fig.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(src, item[1], item[1]); } });
    img.src = src;
  }
  CONFIG.portraits.forEach(function (p) { frame('img/his/', p, $('#gallery')); });
  CONFIG.icons.forEach(function (p) { frame('img/', p, $('#iconGrid')); });
  CONFIG.extra.forEach(function (p) { frame('img/', p, $('#extraGrid')); });

  observe();
  if (canTilt) $$('.tilt').forEach(tiltify);

  /* ============================================================
     GARAGE UI
     ============================================================ */
  var garage = $('#garage'), N = CONFIG.cars.length, curCar = -1, gCard = $('#gCard');
  var dots = $('#gDots'); for (var d = 0; d < N; d++) { var di = document.createElement('i'); di.dataset.i = d; dots.appendChild(di); }
  function showCar(i) {
    if (i === curCar) return; curCar = i;
    var c = CONFIG.cars[i]; gCard.classList.add('swap');
    setTimeout(function () {
      $('#gNum').textContent = ('0' + (i + 1)).slice(-2) + ' / ' + ('0' + N).slice(-2); $('#gName').textContent = c.name; $('#gLine').textContent = c.line;
      var ph = $('#gPhoto'); if (c.photo) { ph.src = c.photo; ph.alt = c.name; ph.hidden = false; } else { ph.hidden = true; ph.removeAttribute('src'); }
      $('#gChips').innerHTML = c.chips.map(function (x) { return '<li>' + x + '</li>'; }).join(''); gCard.classList.remove('swap');
    }, 220);
    $$('#gDots i').forEach(function (e, k) { e.classList.toggle('on', k === i); });
  }
  $('#gPhoto').addEventListener('click', function (e) { var p = e.currentTarget; if (p.src) openLb(p.src, p.alt, p.alt); Sound.play(CONFIG.cars[curCar].sfx); });
  gCard.addEventListener('click', function (e) { if (e.target.id !== 'gPhoto') { Sound.play(CONFIG.cars[curCar].sfx); MAGIC.sparkle(e.clientX, e.clientY, 22); } });
  MAGIC.onCarTap = function (i) { Sound.play(CONFIG.cars[i].sfx); };
  MAGIC.onCar = showCar; showCar(0);
  function goCar(i) {
    i = Math.max(0, Math.min(N - 1, i));
    var top = garage.offsetTop, h = garage.offsetHeight - innerHeight;
    window.scrollTo({ top: top + (i / (N - 1)) * h + 2, behavior: reduce ? 'auto' : 'smooth' });
  }
  $('#gPrev').addEventListener('click', function () { goCar(curCar - 1); Sound.chime(1); });
  $('#gNext').addEventListener('click', function () { goCar(curCar + 1); Sound.chime(4); });
  dots.addEventListener('click', function (e) { var t = e.target; if (t.dataset && t.dataset.i != null) goCar(+t.dataset.i); });

  /* ============================================================
     ENGINE
     ============================================================ */
  (function () {
    var ticks = $('#ticks'), NS = 'http://www.w3.org/2000/svg';
    for (var k = 0; k <= 8; k++) {
      var a = (-135 + k * 33.75) * Math.PI / 180, x1 = 100 + Math.sin(a) * 80, y1 = 100 - Math.cos(a) * 80, x2 = 100 + Math.sin(a) * 70, y2 = 100 - Math.cos(a) * 70;
      var l = document.createElementNS(NS, 'line'); l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2); l.setAttribute('stroke-width', k > 6 ? 3.5 : 2); if (k > 6) l.setAttribute('stroke', '#ff5a3c'); ticks.appendChild(l);
      var t = document.createElementNS(NS, 'text'); t.setAttribute('x', 100 + Math.sin(a) * 58); t.setAttribute('y', 100 - Math.cos(a) * 58 + 4); t.setAttribute('text-anchor', 'middle'); t.setAttribute('font-size', '11'); t.setAttribute('font-family', 'Cinzel,serif'); t.setAttribute('fill', '#e8cf94'); t.textContent = k; ticks.appendChild(t);
    }
    var needle = $('#needle'), started = false, wm = $('#wishMsg'), startBtn = $('#start'), revBtn = $('#rev');
    function set(deg) { needle.style.transform = 'rotate(' + deg + 'deg)'; }
    startBtn.addEventListener('click', function (e) {
      if (started) return; started = true; startBtn.disabled = true; $('span', startBtn).textContent = 'Running ✦';
      Sound.engineStart(); MAGIC.engineStart(); MAGIC.sparkle(e.clientX, e.clientY, 90);
      set(-20); setTimeout(function () { set(-118); }, 1300);
      document.body.classList.add('shake'); setTimeout(function () { document.body.classList.remove('shake'); }, 1500);
      setTimeout(function () { wm.textContent = 'May this year start first time, every time.'; wm.classList.add('show'); revBtn.disabled = false; }, 1700);
    });
    revBtn.addEventListener('click', function () { Sound.rev(); MAGIC.rev(); set(62); setTimeout(function () { set(-118); }, 1600); });
    set(-135);
  })();

  /* ============================================================
     LETTER, BUTTONS
     ============================================================ */
  var env = $('#envelope'), paper = $('#paper');
  env.addEventListener('click', function (e) {
    env.classList.add('open'); env.setAttribute('aria-expanded', 'true'); Sound.arpeggio(); MAGIC.sparkle(e.clientX, e.clientY, 80);
    setTimeout(function () { paper.hidden = false; paper.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }, 500);
  });
  $('#flashBtn').addEventListener('click', function () { Sound.chirp(); MAGIC.flashLights(); });
  $('#rain').addEventListener('click', function () { Sound.arpeggio(); MAGIC.rain(); });
  $('#replay').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  $$('.btn-gold').forEach(function (b) { b.addEventListener('click', function (e) { if (['start', 'rain'].indexOf(b.id) < 0) { Sound.chime(); MAGIC.sparkle(e.clientX, e.clientY, 36); } }); });
  $$('a[href^="#"]').forEach(function (a) { a.addEventListener('click', function (e) { var t = $(a.getAttribute('href')); if (!t) return; e.preventDefault(); t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }); });

  /* ============================================================
     CURSOR: sleek gold dot + hairline ring, zero lag
     ============================================================ */
  (function () {
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    var root = document.documentElement;
    var ring = document.createElement('div'); ring.className = 'cur-ring'; var cur = document.createElement('div'); cur.className = 'cur';
    document.body.appendChild(ring); document.body.appendChild(cur); root.classList.add('has-cursor');
    var HOVER = 'a,button,.fob,.card,.gframe,.g-card,.g-photo,.g-chips li,.g-dots i,.envelope,.lb-close,[data-tip],input';
    var shown = false;
    addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var m = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)'; cur.style.transform = m; ring.style.transform = m;
      if (!shown) { shown = true; cur.classList.add('on'); ring.classList.add('on'); }
      var t = e.target, over = !!(t.closest && t.closest(HOVER)) || root.classList.contains('hover3d');
      if (over !== cur.classList.contains('is-hover')) { cur.classList.toggle('is-hover', over); ring.classList.toggle('is-hover', over); }
    }, { passive: true });
    document.addEventListener('pointerleave', function () { cur.classList.remove('on'); ring.classList.remove('on'); shown = false; });
    document.addEventListener('pointerdown', function () { cur.classList.add('down'); ring.classList.add('down'); });
    addEventListener('pointerup', function (e) {
      cur.classList.remove('down'); ring.classList.remove('down'); if (reduce) return;
      var r = document.createElement('span'); r.className = 'cur-ripple'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; document.body.appendChild(r); setTimeout(function () { r.remove(); }, 520);
    });
  })();
})();
