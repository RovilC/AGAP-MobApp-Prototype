/* AGAP clickable prototype – core: state, router, drying clock, notifications, facilitator panel */
(function () {
  'use strict';
  const SCREENS = (window.SCREENS = {});
  const ACT = (window.ACT = {});
  const LS_KEY = 'agap-demo-v1';
  const BASE_DUR = 6 + 20 / 60; // 6 oras 20 min for 26.4 → 17.2 kg
  const KEYF = [ // normalised progress → share of weight to lose; Figma stage points
    [0, 0], [2 / BASE_DUR, .25], [(4 + 5 / 60) / BASE_DUR, .5], [(5 + 15 / 60) / BASE_DUR, .75], [1, 1]
  ];
  const HUM = [82, 68, 54, 42, 35];
  const SPEEDS = { figma: 49, fast: 180, med: 480, slow: 1200, real: BASE_DUR * 3600 }; // real seconds for full 6h20m

  const MONTHS = ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'];
  const fmtDate = (d) => { d = new Date(d); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); };

  function seedHistory() {
    return [
      { id: 'h3', date: '30 Oktubre 2026', fish: 'Galunggong', initial: 26.4, final: 17.2, target: 17.2, hours: BASE_DUR, mode: 'Kuryente', starter: 'Mang Jun', status: 'done', temp: 68 },
      { id: 'h2', date: '29 Oktubre 2026', fish: 'Dilis', initial: 12.0, final: 7.2, target: 7.2, hours: 4.75, mode: 'Biomass', starter: 'Ate Lita', status: 'done', temp: 66 },
      { id: 'h1', date: '28 Oktubre 2026', fish: 'Galunggong', initial: 26.4, final: 17.2, target: 17.2, hours: BASE_DUR, mode: 'Kuryente', starter: 'Mang Jun', status: 'done', temp: 68 }
    ];
  }
  function seedNotifs() {
    const m = 60000, now = Date.now();
    return [
      { id: 'n1', icon: 'fish', tone: 'blue', title: 'Sinimulan · Mang Jun', desc: 'Umiinit', at: now - 2 * m, unread: true, seed: true },
      { id: 'n2', icon: 'plug-zap', tone: 'warn', title: 'Ihininto · Ate Lita', desc: 'Init hinto', at: now - 5 * m, unread: true, seed: true },
      { id: 'n3', icon: 'flame', tone: 'warn', title: 'Biomass · Ate Lita', desc: 'Kinumpirma', at: now - 10 * m, unread: true, seed: true },
      { id: 'n4', icon: 'circle-check', tone: 'ok', title: 'Makina handa', desc: 'Isda naalis', at: now - 60 * m, unread: false, seed: true },
      { id: 'n5', icon: 'droplets', tone: 'blue', title: 'Mahalumigmig', desc: 'Suriin ang bentilasyon', at: now - 25 * m - 60 * m, unread: false, seed: true },
      { id: 'n6', icon: 'battery-low', tone: 'warn', title: 'Mahina baterya', desc: 'Suriin ang suplay', at: now - 30 * m - 60 * m, unread: false, seed: true },
      { id: 'n7', icon: 'circle-check', tone: 'ok', title: 'Target naabot', desc: 'Tuyo na', at: now - 61 * m - 60 * m, unread: false, seed: true },
      { id: 'n8', icon: 'thermometer', tone: 'warn', title: 'Tapos na', desc: 'Palamigin muna', at: now - 62 * m - 60 * m, unread: false, seed: true },
      { id: 'n9', icon: 'wind', tone: 'blue', title: 'Paglamig', desc: 'Huwag hawakan', at: now - 63 * m - 60 * m, unread: false, seed: true }
    ];
  }
  function freshState(scenario) {
    return {
      v: 1, scenario: scenario || null, screen: 'MODE',
      loggedIn: false, remember: false, samahan: 'SUBAD', operator: scenario === 'shared' ? '' : 'Mang Jun',
      loginAttempts: 0, lockUntil: 0, pin: '', pinTyped: false,
      permOK: false, connType: 'wifi', connected: false, selectedMachine: false,
      notifAllowed: null, tutorialSeen: false,
      power: 'grid', battery: 76, weather: 'sun',
      batch: null, cooling: false, lastDone: null,
      history: seedHistory(), notifs: seedNotifs(),
      settings: { font: 'm', sound: true, batWarn: 20 },
      speed: 'fast', failConnect: false, failStart: false, noHistory: false,
      // shared-batch scenario
      lock: null, // {by:'me'|'other', at}
      waiting: null, // {kind:'done'|'stopped', record}
      otherName: 'Ate Lita', otherDecision: null
    };
  }

  let S;
  try { S = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch (e) { S = null; }
  if (!S || S.v !== 1) S = freshState();
  window.S = S;
  const save = (window.save = () => { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { } });

  /* ---------------- formatting helpers ---------------- */
  const H = (window.H = {});
  H.kg = (n) => (Math.round(n * 10) / 10).toFixed(1);
  H.dur = (h) => { const t = Math.max(0, Math.round(h * 60)); const hh = Math.floor(t / 60), mm = t % 60; return hh ? hh + ' oras ' + mm + ' min' : mm + ' min'; };
  H.durShort = (h) => { const t = Math.max(0, Math.round(h * 60)); const hh = Math.floor(t / 60), mm = t % 60; return hh ? hh + 'h ' + String(mm).padStart(2, '0') + 'm' : mm + 'm'; };
  H.durStack = (h) => { const t = Math.max(0, Math.round(h * 60)); const hh = Math.floor(t / 60), mm = t % 60; return hh ? hh + 'h<br>' + mm + ' min' : mm + ' min'; };
  H.ago = (at) => { const d = Math.max(0, Date.now() - at) / 60000; if (d < 1) return 'Ngayon lang'; if (d < 60) return Math.round(d) + ' min'; return Math.round(d / 60) + ' oras'; };
  H.agoLong = (at) => { const d = Math.max(0, Date.now() - at) / 60000; if (d < 1) return 'Ngayon lang'; if (d < 60) return Math.round(d) + ' minuto na ang nakalipas'; return Math.round(d / 60) + ' oras na ang nakalipas'; };
  H.esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  H.today = () => fmtDate(Date.now());
  H.me = () => S.operator || 'Mang Jun';
  H.connIcon = () => (S.connType === 'bt' ? 'bluetooth' : 'wifi');
  H.connLabel = () => (S.connType === 'bt' ? 'Bluetooth' : 'Wi-Fi');

  /* ---------------- drying model ---------------- */
  const M = (window.M = {});
  M.dur = (b) => { b = b || S.batch; return Math.max(1, BASE_DUR * (b.initial - b.target) / (26.4 - 17.2)); };
  M.p = (b) => { b = b || S.batch; return Math.min(1, b.h / M.dur(b)); };
  M.lossShare = (p) => { for (let i = 1; i < KEYF.length; i++) { if (p <= KEYF[i][0]) { const a = KEYF[i - 1], c = KEYF[i]; return a[1] + (c[1] - a[1]) * (p - a[0]) / (c[0] - a[0]); } } return 1; };
  M.weight = (b) => { b = b || S.batch; return b.initial - (b.initial - b.target) * M.lossShare(M.p(b)); };
  M.pct = (b) => Math.round(M.lossShare(M.p(b || S.batch)) * 100);
  M.stage = (b) => { const s = M.lossShare(M.p(b || S.batch)); return s >= 1 ? 4 : Math.floor(s * 4 + 1e-6); };
  M.hum = (b) => { const s = M.lossShare(M.p(b || S.batch)) * 4; const i = Math.min(3, Math.floor(s)); return Math.round(HUM[i] + (HUM[i + 1] - HUM[i]) * (s - i)); };
  M.temp = (b) => {
    b = b || S.batch; const s = M.lossShare(M.p(b));
    let t = b.temp - (s > .75 ? (s - .75) * 16 : 0);
    if (b.mode === 'Biomass') t += Math.sin(b.h * 7) * 1.5 - (b.drop || 0);
    if (S.batch && b.heat !== 'on') t = Math.max(38, t - (b.coolH || 0) * 18);
    return Math.round(t);
  };
  M.remaining = (b) => { b = b || S.batch; return Math.max(0, M.dur(b) - b.h); };
  M.status = (b) => { b = b || S.batch; if (!b) return ''; if (M.p(b) >= 1) return 'Tuyo na'; if (b.heat === 'stopped') return 'Nakahinto'; if (b.heat === 'paused') return 'Nakahinto'; return 'Umiinit'; };
  M.supply = () => (S.batch && S.batch.mode === 'Biomass' ? 'Biomass' : S.power === 'none' ? 'Baterya' : 'Kuryente');

  /* ---------------- router ---------------- */
  let cur = null, timers = [], stack = [], overlay = null;
  const $screen = () => document.getElementById('screen');
  const later = (window.later = (ms, fn) => { const t = setTimeout(fn, ms); timers.push(t); return t; });
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function go(id, opts) {
    opts = opts || {};
    const def = SCREENS[id];
    if (!def) { console.warn('No screen', id); return; }
    if (def.sheet && !opts.asBase) { openOverlay(id); return; }
    closeOverlay(true);
    if (cur && SCREENS[cur] && SCREENS[cur].leave) SCREENS[cur].leave();
    clearTimers();
    if (cur && !opts.replace && cur !== id) { stack.push(cur); if (stack.length > 60) stack.shift(); }
    cur = id; S.screen = id; save();
    render(true);
    if (def.enter) def.enter(opts);
    if (def.after) later(def.after[0], () => { if (cur === id) def.after[1](); });
    facRefresh();
  }
  window.go = go;
  window.curScreen = () => cur;

  function back() {
    if (overlay) { const od = SCREENS[overlay]; if (od && od.onClose) od.onClose(); closeOverlay(); return; }
    const def = SCREENS[cur];
    if (def && def.back !== undefined) {
      if (def.back === null) return;
      if (typeof def.back === 'function') return def.back();
      return go(def.back);
    }
    const prev = stack.pop();
    if (prev) { go(prev, { replace: true }); }
  }
  window.back = back;

  function openOverlay(id) {
    const def = SCREENS[id];
    if (def.base) {
      const b = typeof def.base === 'function' ? def.base() : def.base;
      if (b && b !== cur) go(b, { replace: false });
    }
    overlay = id;
    const scr = $screen();
    const old = scr.querySelector('.ovl'); if (old) old.remove();
    const w = document.createElement('div'); w.className = 'ovl';
    w.innerHTML = '<div class="scrim" data-act="ovScrim"></div>' + (def.dialog ? '<div class="dialog">' + def.sheet() + '</div>' : '<div class="sheet"><div class="grab"></div>' + def.sheet() + '</div>');
    scr.appendChild(w);
    if (def.enter) def.enter();
    facRefresh();
  }
  function closeOverlay(silent) {
    const scr = $screen(); if (!scr) return;
    const old = scr.querySelector('.ovl'); if (old) old.remove();
    overlay = null; if (!silent) facRefresh();
  }
  window.openOverlay = openOverlay; window.closeOverlay = () => closeOverlay();
  ACT.ovScrim = () => { const d = SCREENS[overlay]; if (d && d.scrimClose === false) return; if (d && d.onClose) d.onClose(); closeOverlay(); };
  ACT.close = () => closeOverlay();

  /* ---------------- chrome ---------------- */
  const LOGO = 'assets/img/logo-96.png';
  window.LOGO = LOGO;
  function statusbar(light) {
    const d = new Date(); const t = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
    const bat = Math.round(S.phoneBat || 82);
    return '<div class="statusbar ' + (light ? 'light' : '') + '" data-act="sbTap"><span>' + t + '</span><span class="sys">' +
      '<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx=".5"/><rect x="4.3" y="5.5" width="3" height="6.5" rx=".5"/><rect x="8.6" y="3" width="3" height="9" rx=".5"/><rect x="12.9" y="0" width="3" height="12" rx=".5" opacity=".35"/></svg>' +
      '<svg width="16" height="12" viewBox="0 0 24 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M2 6.5a15 15 0 0 1 20 0"/><path d="M5.5 10a10 10 0 0 1 13 0"/><path d="M9 13.5a5 5 0 0 1 6 0"/><circle cx="12" cy="16.5" r=".8" fill="currentColor"/></svg>' +
      '<svg width="24" height="12" viewBox="0 0 26 12"><rect x=".75" y=".75" width="21.5" height="10.5" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="2.5" y="2.5" width="' + (18 * bat / 100).toFixed(1) + '" height="7" rx="1.5" fill="currentColor"/><rect x="23.5" y="4" width="1.8" height="4" rx=".8" fill="currentColor"/></svg>' +
      '</span></div>';
  }
  function androidnav(light) {
    return '<div class="androidnav ' + (light ? 'light' : '') + '"><button data-act="aBack" aria-label="Bumalik"><svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M10 1v10L1.5 6z"/></svg></button>' +
      '<button data-act="aHome" aria-label="Tahanan"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6" cy="6" r="4.8"/></svg></button>' +
      '<button data-act="aRecent" aria-label="Mga bukas na app"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="1.2" y="1.2" width="9.6" height="9.6" rx="1.5"/></svg></button></div>';
  }
  function appbar(def) {
    const bar = typeof def.bar === 'function' ? def.bar() : def.bar;
    if (!bar) return '';
    if (bar.brand) {
      return '<div class="appbar">' + (bar.back ? '<button class="back" data-act="barBack">' + ic('arrow-left', 24) + '</button>' : '') +
        '<div class="brand"><img class="logo-mark" src="' + LOGO + '" alt="AGAP logo" data-logo><b>AGAP</b>' + (bar.sub ? '<span class="muted small" style="margin-left:4px">' + bar.sub + '</span>' : '') + '</div>' + (bar.right || '') + '</div>';
    }
    return '<div class="appbar">' + (bar.back !== false && bar.back !== undefined ? '<button class="back" data-act="barBack" aria-label="Bumalik">' + ic('arrow-left', 24) + '</button>' : '') +
      '<h1>' + bar.title + '</h1>' + (bar.right || '') + '<img class="logo-mark logo-right" src="' + LOGO + '" alt="AGAP" data-logo></div>';
  }
  ACT.barBack = () => { const def = SCREENS[cur]; const bar = typeof def.bar === 'function' ? def.bar() : def.bar; if (bar && typeof bar.back === 'string') return go(bar.back); if (bar && typeof bar.back === 'function') return bar.back(); back(); };
  ACT.aBack = () => back();
  ACT.aHome = () => { if (!S.loggedIn) return go('00'); go(H.homeId()); };
  ACT.aRecent = () => toast('Mga bukas na app: AGAP');

  function bnav(active) {
    const unread = S.notifs.filter((n) => n.unread).length;
    const sh = S.scenario === 'shared' && window.SB ? SB.navMid() : null;
    const items = [
      ['dash', 'house', 'Dashboard', 'navDash'],
      ['rekord', 'history', 'Rekord', 'navRekord'],
      ['new', 'plus', sh ? sh.label : 'Bagong<br>Batch', 'navNew'],
      ['abiso', 'bell', 'Abiso', 'navAbiso'],
      ['more', 'menu', 'Higit pa', 'navMore']
    ];
    return '<nav class="bnav">' + items.map((it) => {
      if (it[0] === 'new') return '<button data-act="navNew" data-nav="new" class="' + (active === 'new' ? 'on' : '') + '"><span class="fab ' + (sh && sh.locked ? 'locked' : '') + '">' + ic(sh && sh.locked ? 'lock' : 'plus', 26, '', 2.2) + '</span><span class="mid">' + it[2] + '</span></button>';
      return '<button data-act="' + it[3] + '" data-nav="' + it[0] + '" class="' + (active === it[0] ? 'on' : '') + '">' + ic(it[1], 24) + (it[0] === 'abiso' && unread ? '<span class="badge">' + unread + '</span>' : '') + '<span>' + it[2] + '</span></button>';
    }).join('') + '</nav>';
  }
  ACT.navDash = () => go(H.homeId());
  ACT.navRekord = () => (S.scenario === 'shared' ? go('SB46') : go(S.noHistory || !S.history.length ? 'ST_WALANG_REKORD' : '25'));
  ACT.navNew = () => {
    if (S.scenario === 'shared') return SB.onNew();
    if (S.batch && S.batch.active) return go('S08');
    go('S11a');
  };
  ACT.navAbiso = () => (S.scenario === 'shared' ? go('16') : go('16'));
  ACT.navMore = () => go('30');

  H.homeId = () => {
    if (S.scenario === 'shared' && window.SB) return SB.homeId();
    if (!S.connected) return 'ST_WALANG_KONEKSYON';
    return S.batch && S.batch.active ? '06' : '05';
  };
  H.monitorId = () => (S.batch && S.batch.mode === 'Biomass' ? '21' : S.scenario === 'shared' ? 'SB05' : '15');

  function render(fresh) {
    const def = SCREENS[cur]; if (!def) return;
    const scr = $screen();
    let view = scr.querySelector('.view');
    const scrollTop = !fresh && view && view.querySelector('.body') ? view.querySelector('.body').scrollTop : 0;
    const light = !!def.light;
    const html = (def.raw ? def.raw() :
      statusbar(light) + appbar(def) +
      '<div class="body ' + (def.nopad ? 'nopad' : '') + '">' + def.body() + '</div>' +
      (function () { const a = def.actions ? def.actions() : ''; return a ? '<div class="actions">' + a + '</div>' : ''; })() +
      (def.nav ? bnav(def.nav) : '') + androidnav(light)) +
      (def.hotspot ? '<button class="hotspot" data-act="' + def.hotspot + '" aria-label="Demo"></button>' : '');
    if (fresh || !view) {
      const ov = scr.querySelector('.ovl');
      scr.innerHTML = '<div class="view ' + (def.cls || '') + '">' + html + '</div>';
      if (ov && !fresh) scr.appendChild(ov);
    } else {
      view.className = 'view ' + (def.cls || '');
      view.innerHTML = html;
      const b = view.querySelector('.body'); if (b) b.scrollTop = scrollTop;
    }
    if (def.mounted) def.mounted();
    bindLogoPress();
  }
  window.rerender = () => render(false);

  /* ---------------- toasts & heads-up notifications ---------------- */
  function toast(msg, icon, ms) {
    const scr = $screen(); const t = document.createElement('div');
    const def = SCREENS[cur];
    t.className = 'toast' + (def && def.nav ? '' : ' nonav');
    t.innerHTML = (icon ? ic(icon, 20) : ic('circle-check', 20)) + '<span>' + msg + '</span>';
    scr.appendChild(t); setTimeout(() => t.remove(), ms || 2600);
  }
  window.toast = toast;

  let audioCtx;
  function chime(kind) {
    if (!S.settings.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = kind === 'critical' ? [880, 660, 880, 660] : kind === 'good' ? [660, 880, 1046] : [784, 988];
      notes.forEach((f, i) => {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(audioCtx.destination);
        const t0 = audioCtx.currentTime + i * .16; g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.18, t0 + .02); g.gain.exponentialRampToValueAtTime(.0001, t0 + .15);
        o.start(t0); o.stop(t0 + .16);
      });
      if (navigator.vibrate) navigator.vibrate(kind === 'critical' ? [200, 100, 200, 100, 300] : [120, 60, 120]);
    } catch (e) { }
  }
  /** notify({icon,title,desc,tone:'critical'|'warning'|'good'|'info',go:'screenId', actions:[[label, screen]]}) */
  function notify(n) {
    const item = Object.assign({ id: 'n' + Date.now() + Math.random().toString(36).slice(2, 5), at: Date.now(), unread: true, tone: 'info' }, n);
    S.notifs.unshift(item); save();
    if (S.notifAllowed === false) { rerenderSoft(); return item; }
    const scr = $screen();
    scr.querySelectorAll('.headsup').forEach((e) => e.remove());
    const el = document.createElement('div');
    el.className = 'headsup ' + (item.tone || '');
    el.innerHTML = '<div style="flex:1;min-width:0"><div class="meta"><img class="appic" src="' + LOGO + '" alt="">AGAP · ngayon</div><div class="t">' + H.esc(item.title) + '</div><div class="d">' + H.esc(item.desc) + '</div>' +
      (item.go ? '<div class="act"><span>' + H.esc(item.cta || 'Buksan') + '</span><span style="color:var(--text2)" data-dismiss>Isara</span></div>' : '') + '</div>' +
      '<div style="color:' + (item.tone === 'critical' ? 'var(--danger)' : item.tone === 'warning' ? '#b26a00' : item.tone === 'good' ? 'var(--ok)' : 'var(--blue)') + '">' + ic(item.icon || 'bell', 28) + '</div>';
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      el.classList.add('out'); setTimeout(() => el.remove(), 300);
      if (e.target.closest('[data-dismiss]')) return;
      item.unread = false; save();
      if (item.go) go(item.go);
    });
    scr.appendChild(el);
    chime(item.tone);
    setTimeout(() => { if (el.isConnected) { el.classList.add('out'); setTimeout(() => el.remove(), 300); } }, item.tone === 'critical' ? 14000 : 7000);
    rerenderSoft();
    return item;
  }
  window.notify = notify;
  function rerenderSoft() { const def = SCREENS[cur]; if (def && (def.live || def.nav)) render(false); }

  /* ---------------- drying engine ---------------- */
  let lastTick = Date.now(), lastRender = 0;
  function tick() {
    const now = Date.now(); const dt = Math.min(2, (now - lastTick) / 1000); lastTick = now;
    const b = S.batch;
    const rate = (BASE_DUR) / SPEEDS[S.speed || 'fast']; // sim hours per real second
    if (b && b.active) {
      const heating = b.heat === 'on' && (b.mode === 'Biomass' || S.power === 'grid');
      if (heating) {
        b.h += dt * rate; b.coolH = Math.max(0, (b.coolH || 0) - dt * rate * 2);
        if (b.drop) b.drop = Math.max(0, b.drop - dt * rate * (b.refuel ? 30 : 0));
        if (b.drop === 0) b.refuel = false;
      } else { b.coolH = Math.min(1, (b.coolH || 0) + dt * rate); }
      if (S.power === 'none') {
        const prev = S.battery; S.battery = Math.max(5, S.battery - dt * rate * 6);
        if (prev > S.settings.batWarn && S.battery <= S.settings.batWarn && !b.batNotified) {
          b.batNotified = true;
          notify({ icon: 'battery-low', tone: 'warning', title: 'Mahina na ang Baterya', desc: Math.round(S.battery) + '% na lang. Suriin ang kuryente.', go: 'ST_BATERYA', cta: 'Tingnan' });
        }
      }
      // biomass: automatic temperature drop reminder halfway through the biomass phase
      if (b.mode === 'Biomass' && heating && !b.autoDropDone && b.bioStart != null && b.h - b.bioStart > Math.max(.6, (M.dur(b) - b.bioStart) * .35)) {
        b.autoDropDone = true; ACT.facTempDrop();
      }
      // stage notifications (mirror Figma stage changes)
      const st = M.stage(b);
      b.notified = b.notified || {};
      if (st >= 1 && st < 4 && !b.notified[st]) {
        b.notified[st] = true;
        const msgs = { 1: ['25% nabawas', 'Bumababa ang timbang: ' + H.kg(M.weight(b)) + ' kg na.', 'scale'], 2: ['Kalahati na!', '50% nabawas · ' + H.kg(M.weight(b)) + ' kg. Tantiyang natitira: ' + H.dur(M.remaining(b)) + '.', 'chart-line'], 3: ['Malapit nang matuyo', '75% nabawas · Halumigmig ' + M.hum(b) + '%.', 'droplets'] };
        const m = msgs[st]; notify({ icon: m[2], tone: 'info', title: m[0], desc: m[1], go: H.monitorId(), cta: 'Subaybayan' });
      }
      if (M.p(b) >= 1) finishBatch();
      save();
    }
    if (S.cooling && S.coolUntil && now > S.coolUntil) { S.cooling = false; save(); }
    if (now - lastRender > 900) { lastRender = now; const def = SCREENS[cur]; if (def && def.live && !document.querySelector('#screen .ovl')) render(false); else if (def && def.live) render(false); facStat(); }
  }
  function finishBatch() {
    const b = S.batch; b.active = false; b.doneAt = Date.now();
    const rec = { id: 'h' + Date.now(), date: H.today(), fish: b.fish, initial: b.initial, final: b.target, target: b.target, hours: b.h, mode: b.mode, starter: b.starter, status: 'done', temp: b.temp };
    S.lastDone = rec;
    if (S.scenario === 'shared') { SB.onDone(rec); return; }
    notify({ icon: 'circle-check', tone: 'good', title: 'Tuyo na ang isda!', desc: 'Naabot ang target na ' + H.kg(b.target) + ' kg. Palamigin muna bago alisin.', go: b.mode === 'Biomass' ? 'ST_TAPOS_BIO' : '24', cta: 'Tingnan' });
    if (b.mode === 'Biomass') { go('ST_TAPOS_BIO'); }
    else { S.cooling = true; S.coolUntil = Date.now() + 20 * 60000 / (SPEEDS.real / SPEEDS[S.speed]); go('17'); }
    save();
  }
  window.finishBatch = finishBatch;
  H.addRecord = (rec) => { if (!S.history.find((r) => r.id === rec.id)) S.history.unshift(rec); S.noHistory = false; save(); };

  H.startBatch = (starter) => {
    const f = S.form || {};
    S.batch = { active: true, fish: f.fish || 'Galunggong', initial: 26.4, target: f.target || 17.2, temp: f.temp || 68, h: 0, mode: S.power === 'none' ? 'Biomass' : 'Kuryente', heat: 'on', starter: starter || H.me(), startedAt: Date.now(), samples: [] };
    if (S.batch.mode === 'Biomass') S.batch.bioStart = 0;
    S.cooling = false; save();
    notify({ icon: 'fish', tone: 'info', title: 'Nagsimula ang Pagpapatuyo', desc: 'Binabantayan na ang inyong ' + S.batch.fish + '. Sinimulan ni ' + S.batch.starter + '.', go: H.monitorId(), cta: 'Subaybayan' });
  };

  /* power events (shared by facilitator, hotspot & keyboard) */
  H.powerCut = (direct) => {
    if (S.power === 'none') return;
    S.power = 'none';
    if (S.batch && S.batch.active && S.batch.mode === 'Kuryente') S.batch.heat = 'paused';
    save();
    if (direct) { go('18'); return; }
    notify({ icon: 'unplug', tone: 'critical', title: 'Nagbago ang Pinagkukunan ng Kuryente', desc: 'Nawalan ng kuryente. Huminto ang pag-init; baterya ang gamit sa pagsubaybay. Kailangan ng inyong pasya.', go: S.batch && S.batch.active ? '18' : H.homeId(), cta: 'Ano ang susunod?' });
  };
  H.powerBack = () => {
    if (S.power === 'grid') return;
    S.power = 'grid'; save();
    const needsAnswer = S.batch && S.batch.active;
    notify({ icon: 'plug-zap', tone: 'good', title: 'Bumalik na ang Kuryente', desc: needsAnswer ? 'Gagamitin na ba ang pampainit na de-kuryente? Hihintayin ang inyong sagot.' : 'May kuryente na ulit ang makina.', go: needsAnswer ? '23' : H.homeId(), cta: needsAnswer ? 'Sagutin' : 'Buksan' });
  };

  /* ---------------- events / clicks ---------------- */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-go],[data-act]');
    if (!el || !el.closest('#screen')) return;
    if (el.dataset.go) { go(el.dataset.go); return; }
    const fn = ACT[el.dataset.act];
    if (fn) fn(el.dataset.arg, el, e);
  });
  document.addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input,select,textarea')) { if (e.key === 'Escape') e.target.blur(); return; }
    if (e.key === '`' || e.key === 'F2') { e.preventDefault(); facToggle(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const def = SCREENS[overlay] || SCREENS[cur];
    const k = e.key.length === 1 ? e.key.toUpperCase() : e.key;
    if (def && def.keys && def.keys[k]) { e.preventDefault(); const t = def.keys[k]; typeof t === 'function' ? t() : go(t); return; }
    if (k === 'Escape' || k === 'Backspace') { e.preventDefault(); back(); }
  });

  /* long-press the logo (or tap status bar 3x) → facilitator panel */
  function bindLogoPress() {
    document.querySelectorAll('#screen [data-logo]').forEach((img) => {
      if (img._lp) return; img._lp = true;
      let t;
      const start = (ev) => { t = setTimeout(() => { facToggle(true); if (navigator.vibrate) navigator.vibrate(40); }, 650); };
      const end = () => clearTimeout(t);
      img.addEventListener('pointerdown', start); img.addEventListener('pointerup', end); img.addEventListener('pointerleave', end);
      img.addEventListener('contextmenu', (e) => e.preventDefault());
    });
  }
  let sbTaps = [];
  ACT.sbTap = () => { const n = Date.now(); sbTaps = sbTaps.filter((x) => n - x < 700); sbTaps.push(n); if (sbTaps.length >= 3) { sbTaps = []; facToggle(true); } };

  /* ---------------- facilitator panel ---------------- */
  function facToggle(force) { const f = document.getElementById('fac'); const open = force === undefined ? !f.classList.contains('open') : force; f.classList.toggle('open', open); if (open) facBuild(); }
  window.facToggle = facToggle;
  function fb(label, act, sub, cls) { return '<button class="fb ' + (cls || '') + '" data-fac="' + act + '">' + label + (sub ? '<small>' + sub + '</small>' : '') + '</button>'; }
  function facStat() {
    const el = document.getElementById('facStat'); if (!el) return;
    const b = S.batch;
    el.innerHTML = 'Senaryo: <b>' + (S.scenario === 'shared' ? 'Shared Batch' : S.scenario === 'orig' ? 'Orihinal na daloy' : '—') + '</b><br>' +
      'Screen: <b>' + H.esc((SCREENS[overlay || cur] || {}).name || cur) + '</b><br>' +
      'Batch: <b>' + (b && b.active ? b.fish + ' · ' + M.pct(b) + '% · ' + H.dur(b.h) + ' · ' + M.status(b) + ' · ' + b.mode : 'wala') + '</b><br>' +
      'Kuryente: <b>' + (S.power === 'grid' ? 'May kuryente' : 'WALA') + '</b> · Baterya <b>' + Math.round(S.battery) + '%</b><br>' +
      (S.scenario === 'shared' ? 'Kandado: <b>' + (S.lock ? (S.lock.by === 'me' ? 'Ikaw' : S.otherName) : 'libre') + '</b>' + (S.waiting ? ' · Naghihintay alisin (' + S.waiting.kind + ')' : '') : '');
  }
  function facRefresh() { if (document.getElementById('fac').classList.contains('open')) facStat(); }
  function facBuild() {
    const sc = document.querySelector('#fac .scroll');
    const shared = S.scenario === 'shared';
    const allScreens = Object.keys(SCREENS).filter((k) => SCREENS[k].name).sort((a, b) => SCREENS[a].name.localeCompare(SCREENS[b].name, 'en', { numeric: true }));
    sc.innerHTML =
      '<div class="stat" id="facStat"></div>' +
      '<h4>Bilis ng orasan ng pagpapatuyo</h4><select id="facSpeed">' +
      [['figma', 'Figma demo (~50 seg ang buong batch)'], ['fast', 'Mabilis (~3 min)'], ['med', 'Katamtaman (~8 min)'], ['slow', 'Mabagal (~20 min)'], ['real', 'Totoong oras (6 oras 20 min)']].map((o) => '<option value="' + o[0] + '"' + (S.speed === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select>' +
      '<div class="grid mt8">' + fb('+1 oras', 'skip1') + fb('Tapusin ang batch', 'finish') + '</div>' +
      '<h4>Kuryente at baterya</h4><div class="grid">' +
      fb('⚡ Nawalan ng kuryente', 'cut', 'abiso sa itaas, tulad ng totoong app', 'hot') + fb('Bumalik ang kuryente', 'back', 'bubukas ang tanong (23)') +
      fb('Mahina ang baterya', 'lowbat', '15% · abiso') + fb('Bumaba ang init (biomass)', 'drop', 'paalala sa panggatong') +
      fb('Hindi sapat ang kuryente', 'insuff', 'bago magsimula') + fb('Panahon: ' + (S.weather === 'sun' ? 'Maaraw' : 'Maulan'), 'weather') +
      '</div><h4>Makina at koneksyon</h4><div class="grid">' +
      fb('Sobrang init', 'S05', 'H') + fb('Bukas ang pinto', 'S06', 'D') + fb('Problema sa makina', 'S07', 'E') + fb('Pang-emerhensiyang paghinto', 'emer') +
      fb('Nawala ang koneksyon', 'lost', 'L') + fb('Tapos na ang session', 'S18', 'X') +
      fb('Mabibigo ang koneksyon', 'failConn', S.failConnect ? 'NAKA-ON' : 'naka-off', S.failConnect ? 'on' : '') + fb('Mabibigo ang pagsimula', 'failStart', S.failStart ? 'NAKA-ON' : 'naka-off · F', S.failStart ? 'on' : '') +
      fb('Walang makina (S03)', 'S03') + fb('Walang rekord', 'nohist', S.noHistory ? 'NAKA-ON' : 'naka-off', S.noHistory ? 'on' : '') +
      fb('Walang bagong abiso', 'S14', 'N') + fb('Payagan ang abiso', 'S17', 'P') +
      '</div>' +
      (shared ? '<h4>Ibang cellphone (' + S.otherName + ')</h4><div class="grid">' +
        fb(S.otherName + ' nag-aayos', 'oLock', 'kukunin ang kandado') + fb('Natapos ang kandado', 'oLockEnd', '5 minuto, walang ginawa') +
        fb(S.otherName + ' nagsimula ng batch', 'oStart', 'race kung nag-aayos ka') + fb(S.otherName + ' inihinto ang batch', 'oStop') +
        fb(S.otherName + ': naalis na ang isda', 'oRemoved') + fb('Sumagot: ituloy sa biomass', 'oBio', 'kapag walang kuryente') +
        fb('Sumagot: itigil ang pag-init', 'oItigil', 'kapag walang kuryente') + fb('Unahan sa pag-aayos', 'oRace', 'sa susunod na pindot') +
        fb('Natapos ang 5 min mo', 'myTimeout', 'SB32') + fb('Hindi masuri ang makina', 'syncFail', 'SB18') +
        fb('Muling kumonekta', 'reconnect', 'SB37') + fb('Offline ang Rekord', 'histOff', 'SB47') +
        '</div>' : '') +
      '<h4>Pumunta sa screen</h4><select id="facJump"><option value="">— piliin —</option>' + allScreens.map((k) => '<option value="' + k + '">' + H.esc(SCREENS[k].name) + '</option>').join('') + '</select>' +
      '<h4>Demo</h4><div class="grid">' + fb('Palitan ang senaryo', 'mode', 'babalik sa simula') + fb('I-reset ang demo', 'reset', 'buburahin ang naka-save', 'hot') + '</div>' +
      '<h4>Mga shortcut sa keyboard</h4><div class="kbd"><code>`</code> o <code>F2</code> buksan/isara ito · <code>Esc</code> bumalik<br>' +
      '<code>H</code> sobrang init · <code>D</code> bukas ang pinto · <code>E</code> problema/may mali · <code>L</code> nawala ang koneksyon · <code>X</code> tapos na ang session · <code>A</code> may batch na · <code>V</code> maling halaga · <code>F</code> mabibigong pagsimula · <code>R</code> walang rekord · <code>N</code> walang abiso · <code>P</code> payagan ang abiso<br>' +
      'Sa cellphone: pindutin nang matagal ang logo, o i-tap nang 3 beses ang oras sa itaas.<br>Nakatagong hotspot (Figma): kanang-itaas na sulok ng Dashboard habang may batch = biglang power cut.</div>';
    facStat();
    document.getElementById('facSpeed').onchange = (e) => { S.speed = e.target.value; save(); facStat(); };
    document.getElementById('facJump').onchange = (e) => { if (e.target.value) { const k = e.target.value; e.target.value = ''; if (SCREENS[k].sheet) { openOverlay(k); } else go(k); } };
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-fac]'); if (!b) return;
    const a = b.dataset.fac; const fn = FAC[a]; if (fn) fn(); else if (SCREENS[a]) go(a);
    facBuild();
  });
  const FAC = (window.FAC = {
    skip1: () => { if (S.batch && S.batch.active) { S.batch.h += 1; save(); rerender(); } else toast('Walang tumatakbong batch', 'info'); },
    finish: () => { if (S.batch && S.batch.active) { S.batch.h = M.dur(S.batch); save(); } else toast('Walang tumatakbong batch', 'info'); },
    cut: () => H.powerCut(false),
    back: () => H.powerBack(),
    lowbat: () => { S.battery = 15; save(); notify({ icon: 'battery-low', tone: 'warning', title: 'Mahina na ang Baterya', desc: '15% na lang ang baterya ng makina. Suriin ang kuryente.', go: 'ST_BATERYA', cta: 'Tingnan' }); },
    drop: () => ACT.facTempDrop(),
    insuff: () => go('ST_KULANG_KURYENTE'),
    weather: () => { S.weather = S.weather === 'sun' ? 'rain' : 'sun'; save(); rerender(); },
    emer: () => { notify({ icon: 'octagon-alert', tone: 'critical', title: 'Nakahinto ang makina', desc: 'Pang-emerhensiyang paghinto. Lumayo sa apoy at suriin ang makina.', go: 'ST_EMERHENSIYA', cta: 'Tingnan' }); go('ST_EMERHENSIYA'); },
    lost: () => { S.connected = false; save(); go(S.batch && S.batch.active ? 'S04' : 'ST_WALANG_KONEKSYON'); },
    failConn: () => { S.failConnect = !S.failConnect; save(); },
    failStart: () => { S.failStart = !S.failStart; save(); },
    nohist: () => { S.noHistory = !S.noHistory; save(); rerender(); },
    mode: () => { go('MODE'); facToggle(false); },
    reset: () => { const n = Date.now(); if (!FAC._armed || n - FAC._armed > 4000) { FAC._armed = n; setTimeout(() => { const b = document.querySelector('[data-fac="reset"]'); if (b) b.innerHTML = 'Pindutin ULIT para i-reset<small>buburahin ang batch, rekord at login</small>'; }, 0); return; } FAC._armed = 0; try { localStorage.removeItem(LS_KEY); } catch (e) { } location.reload(); }
  });
  ACT.facTempDrop = () => {
    const b = S.batch; if (!b || !b.active) { toast('Walang tumatakbong batch', 'info'); return; }
    if (b.mode !== 'Biomass') { toast('Para sa biomass na pag-init lang ito', 'info'); return; }
    b.drop = 14; b.refuel = false; save();
    notify({ icon: 'thermometer', tone: 'warning', title: 'Bumaba ang init', desc: 'Magdagdag ng panggatong at ayusin ang hangin ng apoy.', go: '21', cta: 'Tingnan' });
  };

  window.FACTRIGGERS = FAC;
  window.__fresh = freshState; window.__statusbar = statusbar; window.__androidnav = androidnav;
  document.getElementById('facClose').onclick = () => facToggle(false);
  document.getElementById('facTab').onclick = () => facToggle(true);

  /* ---------------- device scaling ---------------- */
  function fit() {
    const d = document.getElementById('device');
    if (window.innerWidth <= 520) { d.style.transform = ''; return; }
    const s = Math.min(1, (window.innerHeight - 70) / 820, (window.innerWidth - 20) / 380);
    d.style.transform = 'scale(' + s + ')';
  }
  window.addEventListener('resize', fit);

  /* ---------------- boot ---------------- */
  window.applyFont = () => { document.documentElement.style.setProperty('--fs', ({ s: '14px', m: '16px', l: '18px' })[S.settings.font] || '16px'); document.getElementById('screen').style.fontSize = 'var(--fs)'; document.documentElement.style.fontSize = ({ s: '14px', m: '16px', l: '18px' })[S.settings.font]; };
  window.boot = function () {
    fit(); applyFont();
    let start = S.screen && SCREENS[S.screen] ? S.screen : 'MODE';
    if (SCREENS[start] && SCREENS[start].transient) start = S.loggedIn ? H.homeId() : (S.scenario ? '00' : 'MODE');
    if (S.loggedIn && !S.remember && start !== 'MODE') start = 'L01';
    cur = null; go(start, { replace: true });
    setInterval(tick, 250);
    setInterval(() => { const sb = document.querySelector('#screen .statusbar span'); if (sb) { const d = new Date(); sb.textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); } }, 15000);
  };
})();
