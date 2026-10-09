/* ============================================================
   UI + audio. The 3D scene (scene.js) plugs into window.MAGIC.
   ✦ Edit the CONFIG block to personalise.
   ============================================================ */
(function () {
  'use strict';

  var CONFIG = {
    name: 'Aiman',          // her name, shown across the page
    from: 'Syeda, your Charlie', // sign-off on the letter
    music: 'music/song.mp3', // YOUR track (drop the file in birthday/music/). Leave '' for no music.
    work: [                 // Aim to Crochet photos: drop files in img/work/ (missing ones are skipped)
      ['sunflower-hairtie.jpg', 'The sunflower hair tie. Her signature.'],
      ['sunflower-bag.jpg', 'A sunflower purse, stitched by hand.'],
      ['sunflower-band.jpg', 'Sunflower wristbands for sunny days.'],
      ['tiny-treasures.jpg', 'Tiny stitched treasures. Always here to smile.'],
      ['cherry-bag.jpg', 'Cherries on top.'],
      ['star-dish.jpg', 'Star dishes for little treasures.']
    ],
    wishes: [               // 12 wishes hidden in the 3D world (one per floating object)
      'May every door you knock on open before you finish knocking.',
      'Soft mornings, loud laughter, and a heart that stays light.',
      'Waddle into this year, my Penguin. It was made for you.',
      'May the people who love you show up in ways you can actually feel.',
      'Every dream you have stitched in secret: may it bloom this year.',
      'Tiny stitched treasures, big beautiful life. May all of it come true.',
      'You turn thread into joy. Never stop. The world needs it.',
      'May your sunflowers always find the sun, and so may you.',
      'Everything good that you give out: may it come back doubled.',
      'Charlie tips the hat: you are my favourite audience, and my favourite person.',
      'May your hook never tangle and your tea stay hot.',
      'Stitch by stitch, may everything you make stay as soft as your heart.'
    ]
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- MAGIC bridge (scene.js overrides these) ---------- */
  var noop = function () {};
  var MAGIC = window.MAGIC = {
    total: CONFIG.wishes.length,
    sparkle: noop, rain: noop, recolor: noop, enter: noop,
    onPick: null
  };

  /* ---------- personalise ---------- */
  $$('.js-name').forEach(function (e) { e.textContent = CONFIG.name; });
  $$('.js-from').forEach(function (e) { e.textContent = CONFIG.from; });
  document.title = 'Happy Birthday ' + CONFIG.name + ' ✦';
  $('#foundTotal').textContent = CONFIG.wishes.length;

  /* ============================================================
     AUDIO — synthesised, no files. Music-box chimes + soft pad.
     ============================================================ */
  var Sound = (function () {
    var ctx, master, wet, enabled = true, started = false, bgm = null;
    var PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66];

    function init() {
      if (ctx) return;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = .9; master.connect(ctx.destination);
      var len = ctx.sampleRate * 2, buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (var c = 0; c < 2; c++) {
        var d = buf.getChannelData(c);
        for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
      }
      var conv = ctx.createConvolver(); conv.buffer = buf;
      wet = ctx.createGain(); wet.gain.value = .4;
      conv.connect(wet); wet.connect(master);
      master.reverb = conv;
    }

    function tone(freq, t, dur, vol, type) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + .005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(master); g.connect(master.reverb);
      o.start(t); o.stop(t + dur + .05);
    }
    function box(freq, t, vol, dur) { // tiny music-box tick: UI sound effect only
      tone(freq, t, dur || 1.2, vol, 'sine');
      tone(freq * 2, t, (dur || 1.2) * .5, vol * .3, 'sine');
    }

    return {
      /* Background music is YOUR track: put a file at CONFIG.music (default music/song.mp3). */
      start: function () {
        init(); if (ctx && ctx.state === 'suspended') ctx.resume();
        if (started) return; started = true;
        if (CONFIG.music) {
          bgm = new Audio(CONFIG.music); bgm.loop = true; bgm.volume = .8; bgm.muted = !enabled;
          var p = bgm.play(); if (p && p.catch) p.catch(function () {});
        }
      },
      toggle: function () {
        enabled = !enabled;
        if (bgm) bgm.muted = !enabled;
        if (ctx) master.gain.setTargetAtTime(enabled ? .9 : 0, ctx.currentTime, .1);
        return enabled;
      },
      isOn: function () { return enabled; },
      chime: function (i) {
        if (!ctx || !enabled) return;
        box(PENTA[(i == null ? Math.floor(Math.random() * PENTA.length) : i) % PENTA.length], ctx.currentTime, .07, 1.2);
      },
      arpeggio: function () {
        if (!ctx || !enabled) return;
        var t = ctx.currentTime;
        PENTA.forEach(function (f, i) { box(f, t + i * .07, .06, 1.4); });
      },
      birthday: function () { this.arpeggio(); return 0; }
    };
  })();
  MAGIC.sound = Sound;
  MAGIC.onBow = function (on) { var el = $('#bowCap'); if (el) el.classList.toggle('show', on); };

  /* ============================================================
     GATE + HUD
     ============================================================ */
  $('#enter').addEventListener('click', function (e) {
    Sound.start();
    Sound.arpeggio();
    document.body.classList.add('entered');
    document.body.classList.remove('locked');
    MAGIC.enter();
    MAGIC.sparkle(e.clientX, e.clientY, 80);
    $$('.hero .reveal').forEach(function (el) { el.classList.add('in'); });
  });

  var musicBtn = $('#music');
  musicBtn.addEventListener('click', function () {
    var on = Sound.toggle();
    musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  /* ============================================================
     WISHES — collected from the 3D world
     ============================================================ */
  var found = {}, foundCount = 0, toastTimer;
  var toast = $('#toast'), toastP = $('p', toast), hud = $('#wishesHud');

  function showToast(text, ms) {
    toastP.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, ms || 4800);
  }
  MAGIC.toast = showToast;

  MAGIC.onPick = function (id, x, y) {
    var isNew = !found[id];
    if (isNew) {
      found[id] = true; foundCount++;
      $('#foundN').textContent = foundCount;
      $('#foundBar').style.width = (foundCount / CONFIG.wishes.length * 100) + '%';
      hud.classList.remove('pop'); void hud.offsetWidth; hud.classList.add('pop');
    }
    Sound.chime(id);
    if (foundCount === CONFIG.wishes.length && isNew) {
      showToast('You found every wish. They are all yours now, ' + CONFIG.name + '.', 7000);
      setTimeout(function () { Sound.arpeggio(); MAGIC.rain(); }, 500);
    } else {
      showToast(CONFIG.wishes[id % CONFIG.wishes.length]);
    }
  };

  /* ============================================================
     REVEAL + COUNTERS
     ============================================================ */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      if (en.target.classList.contains('craft')) runCounters();
      io.unobserve(en.target);
    });
  }, { threshold: .18, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(function (el) { if (!el.closest('.hero')) io.observe(el); });

  var counted = false;
  function runCounters() {
    if (counted) return; counted = true;
    $$('[data-count]').forEach(function (el) {
      var end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1800;
      (function tick(now) {
        var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * e).toLocaleString('en-GB') + (p === 1 ? suf : '');
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }

  /* ============================================================
     TILT CARDS (pointer devices)
     ============================================================ */
  function tiltify(el) {
    {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.classList.add('live');
        el.style.setProperty('--ry', ((px - .5) * 14).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((.5 - py) * 14).toFixed(2) + 'deg');
        el.style.setProperty('--mx', (px * 100) + '%');
        el.style.setProperty('--my', (py * 100) + '%');
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('live');
        el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
      });
    }
  }
  if (!reduce && window.matchMedia('(hover:hover)').matches) $$('.tilt,.stilt').forEach(tiltify);

  /* ============================================================
     STICKERS (Charlie + crochet girls): click = bow + new line
     ============================================================ */
  $$('.sticker').forEach(function (st) {
    var lines = (st.dataset.lines || '').split('|').filter(Boolean), i = 0, bubble = $('.bubble', st), fl = $('.float', st);
    st.addEventListener('click', function (e) {
      if (lines.length) { i = (i + 1) % lines.length; bubble.textContent = lines[i]; }
      bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
      fl.classList.remove('bow'); void fl.offsetWidth; fl.classList.add('bow');
      Sound.chime(); MAGIC.sparkle(e.clientX, e.clientY, 36);
    });
  });
  var gc = $('.gate-charlie');
  if (gc) gc.addEventListener('click', function (e) { Sound.chime(); MAGIC.sparkle(e.clientX, e.clientY, 30); });

  /* cute rising confetti: hearts, flowers, sparkles */
  (function () {
    if (reduce) return;
    var box = document.createElement('div'); box.className = 'floaties'; box.setAttribute('aria-hidden', 'true');
    var G = ['♡', '✿', '✦', '❀', '♡', '✧'], COL = ['#f3a8b8', '#ffc61a', '#f6e0a8', '#b9a2e0', '#ffffff'];
    for (var k = 0; k < 16; k++) {
      var s = document.createElement('span');
      s.textContent = G[k % G.length];
      s.style.cssText = '--x:' + (Math.random() * 100).toFixed(1) + '%;--s:' + (12 + Math.random() * 16).toFixed(0) + 'px;--c:' + COL[k % COL.length] +
        ';--d:' + (16 + Math.random() * 14).toFixed(1) + 's;--dl:' + (-Math.random() * 26).toFixed(1) + 's;--sw:' + ((Math.random() * 60 - 30)).toFixed(0) + 'px';
      box.appendChild(s);
    }
    document.body.appendChild(box);
  })();

  /* ============================================================
     AIM TO CROCHET showcase: real photos from img/work/ (skipped if absent)
     ============================================================ */
  (function () {
    var grid = $('#workGrid'); if (!grid) return;
    CONFIG.work.forEach(function (w, n) {
      var im = new Image();
      im.onload = function () {
        var fig = document.createElement('figure');
        fig.className = 'work stilt reveal in'; fig.style.setProperty('--r', ((n % 2 ? 1 : -1) * (1.5 + (n % 3))) + 'deg');
        fig.innerHTML = '<i class="tape"></i><figcaption class="script"></figcaption><span class="bubble"></span>';
        fig.insertBefore(im, fig.firstChild);
        $('figcaption', fig).textContent = w[1].split('.')[0].replace(/^The /, '');
        $('.bubble', fig).textContent = w[1];
        fig.addEventListener('click', function (e) { Sound.chime(); MAGIC.sparkle(e.clientX, e.clientY, 40); });
        grid.appendChild(fig); grid.hidden = false;
        if (!reduce && window.matchMedia('(hover:hover)').matches) tiltify(fig);
      };
      im.alt = w[1]; im.src = 'img/work/' + w[0];
    });
  })();

  /* ============================================================
     BUTTON SPARKLES
     ============================================================ */
  $('#sparkleMe').addEventListener('click', function (e) {
    Sound.arpeggio(); MAGIC.sparkle(e.clientX, e.clientY, 120);
  });
  $$('.btn-gold').forEach(function (b) {
    b.addEventListener('click', function (e) { if (['enter', 'blow', 'rain'].indexOf(b.id) < 0) { Sound.chime(); MAGIC.sparkle(e.clientX, e.clientY, 40); } });
  });
  $$('.btn-ghost,.sw').forEach(function (b) {
    b.addEventListener('pointerenter', function () { Sound.chime(Math.floor(Math.random() * 5)); });
  });

  /* ============================================================
     SWATCHES -> recolour hero keychain
     ============================================================ */
  $$('.sw').forEach(function (sw) {
    sw.addEventListener('click', function (e) {
      $$('.sw').forEach(function (s) { s.classList.remove('on'); s.setAttribute('aria-checked', 'false'); });
      sw.classList.add('on'); sw.setAttribute('aria-checked', 'true');
      MAGIC.recolor(sw.dataset.c);
      MAGIC.sparkle(e.clientX, e.clientY, 36);
      Sound.chime();
    });
  });

  /* ============================================================
     LIGHTBOX
     ============================================================ */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lastFocus;
  function openLb(fig) {
    lastFocus = document.activeElement;
    lbImg.src = fig.dataset.full; lbImg.alt = $('img', fig).alt; lbCap.textContent = fig.dataset.cap;
    lb.hidden = false; $('#lbClose').focus();
    document.body.style.overflow = 'hidden';
    Sound.chime(3);
  }
  function closeLb() {
    lb.hidden = true; document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  $$('.frame').forEach(function (f) {
    f.addEventListener('click', function (e) { MAGIC.sparkle(e.clientX, e.clientY, 30); openLb(f); });
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(f); } });
  });
  $('#lbClose').addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  /* ============================================================
     CAKE / WISH
     ============================================================ */
  var cake = $('#cake'), blown = false, wishMsg = $('#wishMsg'), blowBtn = $('#blow');
  blowBtn.addEventListener('click', function (e) {
    if (blown) return; blown = true;
    cake.classList.add('out');
    blowBtn.disabled = true; blowBtn.style.opacity = .5; blowBtn.style.pointerEvents = 'none';
    $('span', blowBtn).textContent = 'Wish made ✦';
    var r = cake.getBoundingClientRect();
    MAGIC.sparkle(r.left + r.width / 2, r.top + r.height * .25, 220);
    var secs = Sound.birthday() || 0;
    wishMsg.textContent = 'Whatever you just wished for: it is already on its way.';
    wishMsg.classList.add('show');
    setTimeout(function () { MAGIC.rain(); }, 900);
  });

  /* ============================================================
     LETTER
     ============================================================ */
  var env = $('#envelope'), paper = $('#paper');
  env.addEventListener('click', function (e) {
    env.classList.add('open'); env.setAttribute('aria-expanded', 'true');
    Sound.arpeggio(); MAGIC.sparkle(e.clientX, e.clientY, 80);
    setTimeout(function () {
      paper.hidden = false;
      paper.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }, 500);
  });

  /* ============================================================
     FOOTER
     ============================================================ */
  $('#rain').addEventListener('click', function () { Sound.arpeggio(); MAGIC.rain(); });
  $('#replay').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    setTimeout(function () { MAGIC.sparkle(innerWidth / 2, innerHeight / 2, 120); Sound.arpeggio(); }, 900);
  });

  // keep anchor links smooth + sparkle on hero CTA
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var t = $(a.getAttribute('href')); if (!t) return;
      e.preventDefault(); t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });
})();
