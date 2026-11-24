/* AGAP prototype – core: state, router, machine link, drying clock, notifications, facilitator panel */
(function () {
  'use strict';
  const SCREENS = (window.SCREENS = {});
  const ACT = (window.ACT = {});
  const LS_KEY = 'agap-demo-v3';
  const BASE_DUR = 6 + 20 / 60; // 6 h 20 min for 26.4 → 17.2 kg
  const KEYF = [[0, 0], [2 / BASE_DUR, .25], [(4 + 5 / 60) / BASE_DUR, .5], [(5 + 15 / 60) / BASE_DUR, .75], [1, 1]];
  const HUM = [82, 68, 54, 42, 35];
  const SPEEDS = { demo30: 30, figma: 49, fast: 180, med: 480, slow: 1200, real: BASE_DUR * 3600 };
  const MAX_TEMP = 80, RESUME_TEMP = 75, WARN_TEMP = 75;
  window.LIMITS = { MAX_TEMP, RESUME_TEMP, WARN_TEMP };

  const MONTHS = ['Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'];
  const fmtDate = (d) => { d = new Date(d); return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); };

  function seedHistory() {
    return [
      { id: 'h3', date: '30 Oktubre 2026', fish: 'Galunggong', initial: 26.4, final: 17.2, target: 17.2, hours: BASE_DUR, mode: 'Electric', starter: 'Mang Jun', status: 'done', temp: 68 },
      { id: 'h2', date: '29 Oktubre 2026', fish: 'Dilis', initial: 12.0, final: 7.2, target: 7.2, hours: 4.75, mode: 'Biomass', starter: 'Ate Lita', status: 'done', temp: 66 },
      { id: 'h1', date: '28 Oktubre 2026', fish: 'Galunggong', initial: 26.4, final: 17.2, target: 17.2, hours: BASE_DUR, mode: 'Electric', starter: 'Mang Jun', status: 'done', temp: 68 }
    ];
  }
  function seedNotifs() {
    const m = 60000, now = Date.now();
    return [
      { id: 'n1', icon: 'fish', tone: 'info', title: 'Nagsimula ng batch · Mang Jun', desc: 'Umiinit na', at: now - 2 * m, unread: true, seed: true },
      { id: 'n2', icon: 'plug-zap', tone: 'warning', title: 'Inihinto · Ate Lita', desc: 'Huminto ang pag-init', at: now - 5 * m, unread: true, seed: true },
      { id: 'n3', icon: 'flame', tone: 'warning', title: 'Biomass · Ate Lita', desc: 'Kinumpirma', at: now - 10 * m, unread: true, seed: true },
      { id: 'n4', icon: 'circle-check', tone: 'good', title: 'Handa na ang makina', desc: 'Naalis na ang isda', at: now - 60 * m, unread: false, seed: true },
      { id: 'n5', icon: 'droplets', tone: 'info', title: 'Mataas ang humidity', desc: 'Tingnan ang bentilasyon', at: now - 85 * m, unread: false, seed: true },
      { id: 'n6', icon: 'battery-low', tone: 'warning', title: 'Mahina ang baterya', desc: 'Tingnan ang kuryente', at: now - 90 * m, unread: false, seed: true },
      { id: 'n7', icon: 'circle-check', tone: 'good', title: 'Naabot ang target', desc: 'Tuyo na ang isda', at: now - 121 * m, unread: false, seed: true },
      { id: 'n8', icon: 'thermometer', tone: 'warning', title: 'Tapos na', desc: 'Palamigin muna', at: now - 122 * m, unread: false, seed: true },
      { id: 'n9', icon: 'wind', tone: 'info', title: 'Nagpapalamig', desc: 'Huwag hawakan', at: now - 123 * m, unread: false, seed: true }
    ];
  }
  function freshState(scenario) {
    return {
      v: 3, scenario: scenario || null, screen: 'MODE',
      accounts: [{ username: 'MangJun', phone: '09171234567', samahan: 'SUBAD', pin: '123456' }], loginUser: '',
      machine: { door: 'closed', trays: true, sensors: true }, maint: { ash: false, glass: false, coil: false },
      loggedIn: false, remember: false, samahan: 'SUBAD', operator: '',
      loginAttempts: 0, lockUntil: 0, pin: '',
      connType: 'wifi', connected: false, source: 'live', machineId: 'AGAP-001',
      notifAllowed: null, tutorialSeen: false,
      power: 'grid', battery: 76,
      batch: null, cooling: false, lastDone: null,
      history: seedHistory(), notifs: seedNotifs(),
      settings: { font: 'm', sound: true, batWarn: 20 },
      speed: 'demo30', failConnect: false, failStart: false, noHistory: false,
      lock: null, waiting: null, otherName: 'Ate Lita', otherDecision: null
    };
  }

  let S;
  try { S = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch (e) { S = null; }
  if (!S || S.v !== 3) S = freshState();
  window.S = S;
  const save = (window.save = () => { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) { } });

  /* ---------------- formatting ---------------- */
  const H = (window.H = {});
  H.kg = (n) => (Math.round(n * 10) / 10).toFixed(1);
  H.dur = (h) => { const t = Math.max(0, Math.round(h * 60)); const hh = Math.floor(t / 60), mm = t % 60; return hh ? hh + ' oras ' + mm + ' min' : mm + ' min'; };
  H.durShort = (h) => { const t = Math.max(0, Math.round(h * 60)); const hh = Math.floor(t / 60), mm = t % 60; return hh ? hh + 'h ' + String(mm).padStart(2, '0') + 'm' : mm + 'm'; };
  H.durStack = (h) => { const t = Math.max(0, Math.round(h * 60)); const hh = Math.floor(t / 60), mm = t % 60; return hh ? hh + ' oras<br>' + mm + ' min' : mm + ' min'; };
  H.ago = (at) => { const d = Math.max(0, Date.now() - at) / 60000; if (d < 1) return 'Ngayon lang'; if (d < 60) return Math.round(d) + ' min ang nakalipas'; return Math.round(d / 60) + ' oras ang nakalipas'; };
  H.agoLong = H.ago;
  H.secAgo = (at) => { if (!at) return 'wala pa'; const s = Math.round((Date.now() - at) / 1000); return s < 2 ? 'ngayon lang' : s < 60 ? s + ' seg ang nakalipas' : Math.round(s / 60) + ' min ang nakalipas'; };
  H.esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  H.today = () => fmtDate(Date.now());
  H.me = () => S.operator || 'Mang Jun';
  H.connIcon = () => (S.connType === 'bt' ? 'bluetooth' : 'wifi');
  H.connLabel = () => (S.connType === 'bt' ? 'Bluetooth' : 'Wi-Fi');

  /* ---------------- machine link (live chamber temperature) ---------------- */
  const MC = (window.MC = { t: null, lastAt: 0, prev: {}, offlineNotified: false, sim: { t: 68, latched: false, over: 0 } });
  // Live = real ESP32 data arriving (within 10 s). Otherwise the app stays connected and uses the
  // clearly-labelled simulated reading, switching to live automatically when telemetry arrives.
  MC.wantLive = () => S.source !== 'sim';
  MC.live = () => MC.wantLive() && MC.lastAt > 0 && Date.now() - MC.lastAt < 10000;
  MC.online = () => true;
  /** Current chamber reading. {ok, v, heater, limit, warn, err, sim} */
  MC.reading = () => {
    if (MC.live()) {
      if (!MC.online()) return { ok: false, err: 'Walang koneksyon sa makina' };
      const t = MC.t || {};
      if (t.sensor !== 'ok' || typeof t.temp !== 'number') return { ok: false, err: t.sensor === 'missing' ? 'Walang nakitang temperature sensor' : 'Temperature sensor error', limit: !!t.limit };
      return { ok: true, v: Math.round(t.temp), raw: t.temp, heater: !!t.heater, limit: !!t.limit, warn: t.temp >= WARN_TEMP };
    }
    const v = MC.sim.t;
    return { ok: true, v: Math.round(v), raw: v, heater: !!(S.batch && S.batch.active && S.batch.heat === 'on' && S.batch.mode === 'Electric' && !MC.sim.latched), limit: MC.sim.latched, warn: v >= WARN_TEMP, sim: true };
  };
  MC.send = (obj) => { if (MC.wantLive() && window.REMOTE && REMOTE.sendMachine) REMOTE.sendMachine(obj); };
  MC.onTelemetry = (msg) => {
    let t; try { t = JSON.parse(msg); } catch (e) { return; }
    if (!MC.wantLive()) { MC.t = t; return; }
    const wasLive = MC.live(), was = wasLive ? (MC.t || {}) : { limit: MC.sim.latched, warn: MC.sim.t >= WARN_TEMP, sensor: 'ok' };
    MC.t = t; MC.lastAt = Date.now(); MC.offlineNotified = false;
    if (!wasLive && S.loggedIn) toast('Live na ang temperature mula sa ' + S.machineId, 'activity', 2600);
    MC.alerts(was.limit, !!t.limit, was.warn, t.temp >= WARN_TEMP, was.sensor, t.sensor);
  };
  MC.alerts = (wasLimit, limit, wasWarn, warn, wasSensor, sensor) => {
    if (!S.loggedIn) return;
    if (limit && !wasLimit) notify({ icon: 'thermometer', tone: 'critical', title: 'Naabot ang max temperature (80°C)', desc: 'Pinatay ng makina ang heater. Bubukas ulit pag bumaba sa 75°C.', go: H.monitorId(), cta: 'View' });
    else if (warn && !wasWarn && !limit) notify({ icon: 'thermometer', tone: 'warning', title: 'Malapit na sa max temperature', desc: Math.round(MC.reading().v) + '°C ang chamber. Max ay 80°C.', go: H.monitorId(), cta: 'View' });
    if (sensor && sensor !== 'ok' && wasSensor === 'ok') notify({ icon: 'circle-alert', tone: 'critical', title: 'Temperature sensor error', desc: 'Walang tamang reading. Naka-off ang heater para ligtas.', go: H.monitorId(), cta: 'View' });
  };
  function simTemp(dt, rate) { // simulated chamber (testing only) – mirrors the firmware rules
    const b = S.batch, sm = MC.sim;
    let target = 30;
    if (b && b.active && b.heat === 'on') target = b.mode === 'Electric' ? (S.power === 'grid' ? b.temp : 30) : b.mode === 'Solar' ? b.temp - 6 + Math.sin(b.h * 4) * 2 - (b.drop || 0) : b.temp + Math.sin(b.h * 7) * 1.5 - (b.drop || 0);
    if (sm.over > 0) { target = 84; sm.over -= dt; }
    if (sm.latched) target = Math.min(target, 70);
    sm.t += (target - sm.t) * Math.min(1, dt * (sm.over > 0 ? .9 : .5));
    const wasL = sm.latched, wasW = sm.t >= WARN_TEMP;
    if (sm.t >= MAX_TEMP) { sm.t = MAX_TEMP; sm.latched = true; }
    else if (sm.latched && sm.t < RESUME_TEMP) sm.latched = false;
    MC.alerts(wasL, sm.latched, MC.prev.warn, sm.t >= WARN_TEMP, 'ok', 'ok');
    MC.prev.warn = sm.t >= WARN_TEMP || wasW && sm.t >= WARN_TEMP - .5;
  }

  /* ---------------- drying model ---------------- */
  const M = (window.M = {});
  M.dur = (b) => { b = b || S.batch; return Math.max(1, BASE_DUR * (b.initial - b.target) / (26.4 - 17.2)); };
  M.p = (b) => { b = b || S.batch; return Math.min(1, b.h / M.dur(b)); };
  M.lossShare = (p) => { for (let i = 1; i < KEYF.length; i++) { if (p <= KEYF[i][0]) { const a = KEYF[i - 1], c = KEYF[i]; return a[1] + (c[1] - a[1]) * (p - a[0]) / (c[0] - a[0]); } } return 1; };
  M.weight = (b) => { b = b || S.batch; return b.initial - (b.initial - b.target) * M.lossShare(M.p(b)); };
  M.pct = (b) => Math.round(M.lossShare(M.p(b || S.batch)) * 100);
  M.stage = (b) => { const s = M.lossShare(M.p(b || S.batch)); return s >= 1 ? 4 : Math.floor(s * 4 + 1e-6); };
  M.hum = (b) => { const s = M.lossShare(M.p(b || S.batch)) * 4; const i = Math.min(3, Math.floor(s)); return Math.round(HUM[i] + (HUM[i + 1] - HUM[i]) * (s - i)); };
  M.temp = () => { const r = MC.reading(); return r.ok ? r.v : null; }; // chamber temperature from the machine (null if unavailable)
  M.remaining = (b) => { b = b || S.batch; return Math.max(0, M.dur(b) - b.h); };
  M.status = (b) => { b = b || S.batch; if (!b) return ''; if (M.p(b) >= 1) return 'Tuyo na'; if (b.heat !== 'on') return 'Nakahinto'; const r = MC.reading(); if (b.mode === 'Electric' && r.limit) return 'Max temp'; return 'Umiinit'; };
  M.supply = () => (S.batch && S.batch.active && S.batch.mode === 'Biomass' ? 'Biomass' : S.batch && S.batch.active && S.batch.mode === 'Solar' ? 'Solar' : S.power === 'none' ? 'Battery' : 'Electric');
  M.alt = (b) => { b = b || S.batch; return !!b && (b.mode === 'Biomass' || b.mode === 'Solar'); };

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
    const prev = stack.pop(); if (prev) go(prev, { replace: true });
  }
  window.back = back;
  function openOverlay(id) {
    const def = SCREENS[id];
    if (def.base) { const b = typeof def.base === 'function' ? def.base() : def.base; if (b && b !== cur) go(b, { replace: false }); }
    overlay = id;
    const scr = $screen();
    const old = scr.querySelector('.ovl'); if (old) old.remove();
    const w = document.createElement('div'); w.className = 'ovl';
    w.innerHTML = '<div class="scrim" data-act="ovScrim"></div>' + (def.dialog ? '<div class="dialog">' + def.sheet() + '</div>' : '<div class="sheet"><div class="grab"></div>' + def.sheet() + '</div>');
    scr.appendChild(w);
    if (def.enter) def.enter();
    facRefresh();
  }
  function closeOverlay(silent) { const scr = $screen(); if (!scr) return; const old = scr.querySelector('.ovl'); if (old) old.remove(); overlay = null; if (!silent) facRefresh(); }
  window.openOverlay = openOverlay; window.closeOverlay = () => closeOverlay();
  window.curOverlay = () => overlay;
  ACT.ovScrim = () => { const d = SCREENS[overlay]; if (d && d.scrimClose === false) return; if (d && d.onClose) d.onClose(); closeOverlay(); };
  ACT.close = () => closeOverlay();

  /* ---------------- chrome ---------------- */
  const LOGO = 'assets/img/logo-96.png';
  window.LOGO = LOGO;
  function statusbar(light) {
    const d = new Date(); const t = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
    return '<div class="statusbar ' + (light ? 'light' : '') + '" data-act="sbTap"><span>' + t + '</span><span class="sys">' +
      '<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx=".5"/><rect x="4.3" y="5.5" width="3" height="6.5" rx=".5"/><rect x="8.6" y="3" width="3" height="9" rx=".5"/><rect x="12.9" y="0" width="3" height="12" rx=".5" opacity=".35"/></svg>' +
      '<svg width="16" height="12" viewBox="0 0 24 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M2 6.5a15 15 0 0 1 20 0"/><path d="M5.5 10a10 10 0 0 1 13 0"/><path d="M9 13.5a5 5 0 0 1 6 0"/><circle cx="12" cy="16.5" r=".8" fill="currentColor"/></svg>' +
      '<svg width="24" height="12" viewBox="0 0 26 12"><rect x=".75" y=".75" width="21.5" height="10.5" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="2.5" y="2.5" width="14.8" height="7" rx="1.5" fill="currentColor"/><rect x="23.5" y="4" width="1.8" height="4" rx=".8" fill="currentColor"/></svg></span></div>';
  }
  function androidnav(light) {
    return '<div class="androidnav ' + (light ? 'light' : '') + '"><button data-act="aBack" aria-label="Back"><svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M10 1v10L1.5 6z"/></svg></button>' +
      '<button data-act="aHome" aria-label="Home"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6" cy="6" r="4.8"/></svg></button>' +
      '<button data-act="aRecent" aria-label="Recent apps"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="1.2" y="1.2" width="9.6" height="9.6" rx="1.5"/></svg></button></div>';
  }
  const backBtn = () => '<button class="back" data-act="barBack" aria-label="Back">' + ic('arrow-left', 26, '', 2.4) + '</button>';
  function appbar(def) {
    const bar = typeof def.bar === 'function' ? def.bar() : def.bar;
    if (!bar) return '';
    if (bar.brand) return '<div class="appbar">' + (bar.back ? backBtn() : '') + '<div class="brand"><img class="logo-mark" src="' + LOGO + '" alt="AGAP logo" data-logo><b>AGAP</b></div>' + (bar.right || '') + '</div>';
    return '<div class="appbar">' + (bar.back !== false && bar.back !== undefined ? backBtn() : '') + '<h1>' + bar.title + '</h1>' + (bar.right || '') + '<img class="logo-mark logo-right" src="' + LOGO + '" alt="AGAP" data-logo></div>';
  }
  ACT.barBack = () => { const def = SCREENS[cur]; const bar = typeof def.bar === 'function' ? def.bar() : def.bar; if (bar && typeof bar.back === 'string') return go(bar.back); if (bar && typeof bar.back === 'function') return bar.back(); back(); };
  ACT.aBack = () => back();
  ACT.aHome = () => { if (!S.loggedIn) return go('00'); go(H.homeId()); };
  ACT.aRecent = () => toast('Recent apps: AGAP');

  function bnav(active) {
    const unread = S.notifs.filter((n) => n.unread).length;
    const sh = S.scenario === 'shared' && window.SB ? SB.navMid() : null;
    const items = [['dash', 'house', 'Home', 'navDash'], ['rekord', 'history', 'Rekord', 'navRekord'], ['new', 'plus', sh ? sh.label : 'Bagong<br>Batch', 'navNew'], ['abiso', 'bell', 'Abiso', 'navAbiso'], ['more', 'menu', 'Iba pa', 'navMore']];
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
    if (S.machine && S.machine.door !== 'closed') return go('S06');
    go('S11a');
  };
  ACT.navAbiso = () => go('16');
  ACT.navMore = () => go('30');
  H.homeId = () => {
    if (S.scenario === 'shared' && window.SB) return SB.homeId();
    if (!S.connected) return 'ST_WALANG_KONEKSYON';
    return S.batch && S.batch.active ? '06' : '05';
  };
  H.monitorId = () => (S.batch && S.batch.active && M.alt(S.batch) ? '21' : S.scenario === 'shared' ? 'SB05' : '15');

  function render(fresh) {
    const def = SCREENS[cur]; if (!def) return;
    const scr = $screen();
    let view = scr.querySelector('.view');
    const scrollTop = !fresh && view && view.querySelector('.body') ? view.querySelector('.body').scrollTop : 0;
    const light = !!def.light;
    const a = def.actions ? def.actions() : '';
    const html = (def.raw ? def.raw() : statusbar(light) + appbar(def) + '<div class="body ' + (def.nopad ? 'nopad' : '') + '">' + def.body() + '</div>' + (a ? '<div class="actions">' + a + '</div>' : '') + (def.nav ? bnav(def.nav) : '') + androidnav(light)) +
      (def.hotspot ? '<button class="hotspot" data-act="' + def.hotspot + '" aria-label="Demo"></button>' : '');
    if (fresh || !view) { scr.innerHTML = '<div class="view ' + (def.cls || '') + '">' + html + '</div>'; }
    else {
      // keep focus/typing safe: don't re-render while an input inside the view is focused
      if (view.contains(document.activeElement) && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
      view.className = 'view ' + (def.cls || ''); view.innerHTML = html;
      const b = view.querySelector('.body'); if (b) b.scrollTop = scrollTop;
    }
    if (def.mounted) def.mounted();
    bindLogoPress();
  }
  window.rerender = () => render(false);

  /* ---------------- toasts & heads-up notifications ---------------- */
  function toast(msg, icon, ms) {
    const scr = $screen(); const t = document.createElement('div'); const def = SCREENS[cur];
    t.className = 'toast' + (def && def.nav ? '' : ' nonav');
    t.innerHTML = ic(icon || 'circle-check', 20) + '<span>' + msg + '</span>';
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
  /** tone: 'critical' (red) | 'warning' (yellow) | 'good' | 'info' */
  function notify(n) {
    const item = Object.assign({ id: 'n' + Date.now() + Math.random().toString(36).slice(2, 5), at: Date.now(), unread: true, tone: 'info' }, n);
    S.notifs.unshift(item); if (S.notifs.length > 40) S.notifs.length = 40; save();
    if (S.notifAllowed === false) { rerenderSoft(); return item; }
    const scr = $screen();
    scr.querySelectorAll('.headsup').forEach((e) => e.remove());
    const el = document.createElement('div');
    el.className = 'headsup ' + (item.tone || '');
    el.innerHTML = '<div style="flex:1;min-width:0"><div class="meta"><img class="appic" src="' + LOGO + '" alt="">AGAP · ngayon</div><div class="t">' + H.esc(item.title) + '</div><div class="d">' + H.esc(item.desc) + '</div>' +
      (item.go ? '<div class="act"><span>' + H.esc(item.cta || 'Open') + '</span><span style="color:var(--text2)" data-dismiss>Dismiss</span></div>' : '') + '</div>' +
      '<div class="hic">' + ic(item.icon || 'bell', 28) + '</div>';
    el.addEventListener('click', (e) => {
      e.stopPropagation(); el.classList.add('out'); setTimeout(() => el.remove(), 300);
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
    let rate = BASE_DUR / (SPEEDS[S.speed] || 30); if (b && b.mode === 'Solar') rate *= .75;
    if (!MC.live()) simTemp(dt, rate);
    // live data stopped: stay connected, fall back to the labelled simulated reading
    if (MC.wantLive() && MC.lastAt && !MC.live() && !MC.offlineNotified && S.loggedIn) {
      MC.offlineNotified = true; if (MC.t && typeof MC.t.temp === 'number') MC.sim.t = MC.t.temp;
      notify({ icon: 'wifi-off', tone: 'warning', title: 'Nawala ang live data', desc: 'SIMULATED muna ang temperature. Tuloy pa rin ang safety limit ng makina.', go: H.homeId(), cta: 'View' });
    }
    if (b && b.active) {
      const heating = b.heat === 'on' && (M.alt(b) || S.power === 'grid');
      if (heating) {
        b.h += dt * rate;
        if (b.drop) b.drop = Math.max(0, b.drop - dt * rate * (b.refuel ? 30 : 0));
        if (b.drop === 0) b.refuel = false;
      }
      const r = MC.reading(); if (r.ok) { b.tSum = (b.tSum || 0) + r.raw * dt; b.tN = (b.tN || 0) + dt; }
      if (S.power === 'none') {
        const prev = S.battery; S.battery = Math.max(5, S.battery - dt * rate * 6);
        if (prev > S.settings.batWarn && S.battery <= S.settings.batWarn && !b.batNotified) {
          b.batNotified = true;
          notify({ icon: 'battery-low', tone: 'warning', title: 'Mahina ang baterya', desc: Math.round(S.battery) + '% na lang. Tingnan ang kuryente.', go: 'ST_BATERYA', cta: 'View' });
        }
      }
      if (M.alt(b) && heating && !b.autoDropDone && b.bioStart != null && b.h - b.bioStart > Math.max(.6, (M.dur(b) - b.bioStart) * .35)) { b.autoDropDone = true; ACT.facTempDrop(); }
      const st = M.stage(b); b.notified = b.notified || {};
      if (st >= 1 && st < 4 && !b.notified[st]) {
        b.notified[st] = true;
        const msgs = { 1: ['25% na', 'Timbang ngayon: ' + H.kg(M.weight(b)) + ' kg.', 'scale'], 2: ['Kalahati na', H.kg(M.weight(b)) + ' kg · mga ' + H.dur(M.remaining(b)) + ' pa.', 'chart-line'], 3: ['Malapit nang matuyo', '75% na · humidity ' + M.hum(b) + '%.', 'droplets'] };
        const m = msgs[st]; notify({ icon: m[2], tone: 'info', title: m[0], desc: m[1], go: H.monitorId(), cta: 'Monitor' });
      }
      if (M.p(b) >= 1) finishBatch();
      save();
    }
    if (S.cooling && S.coolUntil && now > S.coolUntil) { S.cooling = false; save(); }
    if (now - lastRender > 900) { lastRender = now; const def = SCREENS[cur]; if (def && def.live) render(false); facStat(); }
  }
  H.avgTemp = (b) => (b && b.tN ? Math.round(b.tSum / b.tN) : b ? b.temp : 68);
  function finishBatch() {
    const b = S.batch; b.active = false; b.doneAt = Date.now();
    MC.send({ cmd: 'stop' });
    const rec = { id: 'h' + Date.now(), date: H.today(), fish: b.fish, initial: b.initial, final: b.target, target: b.target, hours: b.h, mode: b.mode, starter: b.starter, status: 'done', temp: H.avgTemp(b) };
    S.lastDone = rec;
    if (S.scenario === 'shared') { SB.onDone(rec); return; }
    notify({ icon: 'circle-check', tone: 'good', title: 'Tuyo na ang isda!', desc: 'Naabot ang ' + H.kg(b.target) + ' kg. Palamigin bago alisin.', go: M.alt(b) ? 'ST_TAPOS_BIO' : '24', cta: 'View' });
    if (M.alt(b)) go('ST_TAPOS_BIO');
    else { S.cooling = true; S.coolUntil = Date.now() + 20 * 60000 / (SPEEDS.real / SPEEDS[S.speed]); go('17'); }
    save();
  }
  window.finishBatch = finishBatch;
  H.addRecord = (rec) => { if (!S.history.find((r) => r.id === rec.id)) S.history.unshift(rec); S.noHistory = false; save(); };
  H.stopBatch = (by, reason) => {
    const bb = S.batch; if (!bb) return null;
    MC.send({ cmd: 'stop' });
    const rec = { id: 'h' + Date.now(), date: H.today(), fish: bb.fish, initial: bb.initial, final: +H.kg(M.weight(bb)), target: bb.target, hours: bb.h, mode: bb.mode, starter: bb.starter, status: 'stopped', temp: H.avgTemp(bb), stopAt: M.p(bb), stoppedBy: by || H.me(), reason: reason || '' };
    S.batch = null; S.lastStopped = rec; H.addRecord(rec); save(); return rec;
  };
  H.startBatch = (starter) => {
    const f = S.form || {};
    S.batch = { active: true, fish: f.fish || 'Galunggong', initial: 26.4, target: f.target || 17.2, temp: f.temp || 68, h: 0, mode: S.power === 'none' ? 'Biomass' : 'Electric', heat: 'on', starter: starter || H.me(), startedAt: Date.now() };
    if (S.batch.mode === 'Biomass') S.batch.bioStart = 0;
    S.cooling = false; save();
    if (S.batch.mode === 'Electric') MC.send({ cmd: 'start', setpoint: S.batch.temp });
    notify({ icon: 'fish', tone: 'info', title: 'Nagsimula ang pagpapatuyo', desc: (S.batch.fish === 'Iba pa' ? 'Isda' : S.batch.fish) + ' · sinimulan ni ' + S.batch.starter + '.', go: H.monitorId(), cta: 'Monitor' });
  };
  H.powerCut = (direct) => {
    if (S.power === 'none') return;
    S.power = 'none';
    if (S.batch && S.batch.active && S.batch.mode === 'Electric') S.batch.heat = 'paused';
    save();
    if (direct) { go('18'); return; }
    notify({ icon: 'unplug', tone: 'critical', title: 'Nawalan ng kuryente', desc: 'Huminto ang pag-init. Baterya muna ang gamit. Kailangan ang desisyon mo.', go: S.batch && S.batch.active ? '18' : H.homeId(), cta: 'Next' });
  };
  H.powerBack = () => {
    if (S.power === 'grid') return;
    S.power = 'grid'; save();
    const needsAnswer = S.batch && S.batch.active;
    notify({ icon: 'plug-zap', tone: 'good', title: 'Bumalik ang kuryente', desc: needsAnswer ? 'Ibalik sa kuryente ang pag-init?' : 'May kuryente na ulit ang makina.', go: needsAnswer ? '23' : H.homeId(), cta: needsAnswer ? 'Answer' : 'Open' });
  };

  /* ---------------- events ---------------- */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-go],[data-act]');
    if (!el || !el.closest('#screen')) return;
    if (el.dataset.go) { go(el.dataset.go); return; }
    const fn = ACT[el.dataset.act]; if (fn) fn(el.dataset.arg, el, e);
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
  function bindLogoPress() {
    document.querySelectorAll('#screen [data-logo]').forEach((img) => {
      if (img._lp) return; img._lp = true; let t;
      img.addEventListener('pointerdown', () => { t = setTimeout(() => { facToggle(true); if (navigator.vibrate) navigator.vibrate(40); }, 650); });
      ['pointerup', 'pointerleave'].forEach((ev) => img.addEventListener(ev, () => clearTimeout(t)));
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
    const b = S.batch, r = MC.reading();
    el.innerHTML = 'Senaryo: <b>' + (S.scenario === 'shared' ? 'Shared batch' : S.scenario === 'orig' ? 'Orihinal na daloy' : '—') + '</b><br>' +
      'Screen: <b>' + H.esc((SCREENS[overlay || cur] || {}).name || cur) + '</b><br>' +
      'Batch: <b>' + (b && b.active ? b.fish + ' · ' + M.pct(b) + '% · ' + H.dur(b.h) + ' · ' + M.status(b) + ' · ' + b.mode : 'wala') + '</b><br>' +
      'Chamber: <b>' + (r.ok ? r.v + '°C' + (r.limit ? ' · LIMIT' : r.warn ? ' · near max' : '') : r.err) + '</b> · pinagmulan <b>' + (MC.live() ? 'LIVE na makina' : 'SIMULATED') + '</b><br>' +
      'Data ng makina: <b>' + (MC.live() ? 'live · huli ' + H.secAgo(MC.lastAt) : MC.wantLive() ? 'walang live data → simulated' : 'simulated') + '</b><br>' +
      'Kuryente: <b>' + (S.power === 'grid' ? 'meron' : 'WALA') + '</b> · baterya <b>' + Math.round(S.battery) + '%</b><br>' +
      'Remote code: <b style="font-size:15px;letter-spacing:2px">' + (window.REMOTE ? REMOTE.code : '—') + '</b> · ' + (window.REMOTE && REMOTE.online ? '<b style="color:#6ee7a8">online</b>' : '<span style="color:#f6b26b">offline</span>') + '<br>' +
      (S.scenario === 'shared' ? 'Kandado: <b>' + (S.lock ? (S.lock.by === 'me' ? 'ikaw' : S.otherName) : 'libre') + '</b>' + (S.waiting ? ' · hinihintay alisin ang isda (' + S.waiting.kind + ')' : '') : '');
  }
  function facRefresh() { if (document.getElementById('fac').classList.contains('open')) facStat(); }
  function facBuild() {
    const sc = document.querySelector('#fac .scroll');
    const shared = S.scenario === 'shared';
    const allScreens = Object.keys(SCREENS).filter((k) => SCREENS[k].name).sort((a, b) => SCREENS[a].name.localeCompare(SCREENS[b].name, 'en', { numeric: true }));
    sc.innerHTML =
      '<div class="stat" id="facStat"></div>' +
      '<h4>Pinagmulan ng temperature</h4><div class="grid">' + fb('Live machine (ESP32)', 'srcLive', 'totoong sensor ng chamber', MC.live() ? 'on' : '') + fb('Simulated (testing)', 'srcSim', 'kahit walang makina', MC.live() ? '' : 'on') + '</div>' +
      '<h4>Bilis ng orasan</h4><select id="facSpeed">' +
      [['demo30', 'Pang-test (~30 seg ang buong batch)'], ['figma', 'Figma demo (~50 s)'], ['fast', 'Mabilis (~3 min)'], ['med', 'Katamtaman (~8 min)'], ['slow', 'Mabagal (~20 min)'], ['real', 'Totoong oras (6 oras 20 min)']].map((o) => '<option value="' + o[0] + '"' + (S.speed === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select>' +
      '<div class="grid mt8">' + fb('+1 hour', 'skip1') + fb('Finish batch', 'finish') + '</div>' +
      '<h4>Kuryente at baterya</h4><div class="grid">' +
      fb('⚡ Power outage', 'cut', 'abiso + tanong kung itutuloy', 'hot') + fb('Power restored', 'back', 'tanong kung lilipat') +
      fb('Low battery', 'lowbat', '15%') + fb('Temperature drop', 'drop', 'biomass / solar') +
      fb('Not enough power', 'insuff', 'bago magsimula') + fb('Overheat test (sim)', 'simOver', 'aakyat sa 80°C, papatayin ang heater') +
      '</div><h4>Makina at koneksyon</h4><div class="grid">' +
      fb('Too hot', 'S05', 'H') + fb('Door open', 'S06', 'D') + fb('Machine problem', 'S07', 'E') + fb('Emergency stop', 'emer') +
      fb('Connection lost', 'lost', 'L') + fb('Session expired', 'S18', 'X') +
      fb('Start will fail', 'failStart', S.failStart ? 'ON' : 'off · F', S.failStart ? 'on' : '') +
      fb('No records', 'nohist', S.noHistory ? 'ON' : 'off', S.noHistory ? 'on' : '') + fb('No new alerts', 'S14', 'N') + fb('Allow alerts', 'S17', 'P') +
      '</div>' +
      (shared ? '<h4>Ibang cellphone (' + S.otherName + ')</h4><div class="grid">' +
        fb(S.otherName + ' is setting up', 'oLock', 'kukunin ang kandado') + fb('Lock expired', 'oLockEnd', '5 min, walang galaw') +
        fb(S.otherName + ' started a batch', 'oStart', 'unahan kung nag-aayos ka') + fb(S.otherName + ' stopped the batch', 'oStop') +
        fb(S.otherName + ' removed the fish', 'oRemoved') + fb('Answered: biomass', 'oBio', 'habang walang kuryente') +
        fb('Answered: stop', 'oItigil', 'habang walang kuryente') + fb('Setup race', 'oRace', 'sa susunod mong pindot') +
        fb('Your 5 min ran out', 'myTimeout', 'SB32') + fb('Machine check failed', 'syncFail', 'SB18') +
        fb('Reconnect', 'reconnect', 'SB37') + fb('Records offline', 'histOff', 'SB47') + '</div>' : '') +
      '<h4>Pumunta sa screen</h4><select id="facJump"><option value="">— pumili —</option>' + allScreens.map((k) => '<option value="' + k + '">' + H.esc(SCREENS[k].name) + '</option>').join('') + '</select>' +
      '<h4>Demo</h4><div class="grid">' + fb('Change scenario', 'mode', 'balik sa simula') + fb('Reset demo', 'reset', 'buburahin ang data', 'hot') + '</div>' +
      '<h4>Shortcut sa keyboard</h4><div class="kbd"><code>`</code> or <code>F2</code> open/close · <code>Esc</code> back<br>' +
      '<code>H</code> too hot · <code>D</code> door open · <code>E</code> machine problem · <code>L</code> connection lost · <code>X</code> session expired · <code>A</code> batch running · <code>V</code> invalid values · <code>F</code> start fails · <code>R</code> records not found · <code>N</code> no alerts · <code>P</code> allow alerts<br>' +
      'Sa cellphone: pindutin nang matagal ang logo, o i-tap ang orasan nang 3 beses.<br>Nakatagong hotspot: kanang itaas ng Home habang may batch = biglang walang kuryente.</div>';
    facStat();
    document.getElementById('facSpeed').onchange = (e) => { S.speed = e.target.value; save(); facStat(); };
    document.getElementById('facJump').onchange = (e) => { if (e.target.value) { const k = e.target.value; e.target.value = ''; if (SCREENS[k].sheet) openOverlay(k); else go(k); } };
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-fac]'); if (!b) return;
    const a = b.dataset.fac; const fn = FAC[a]; if (fn) fn(); else if (SCREENS[a]) go(a);
    facBuild();
  });
  const FAC = (window.FAC = {
    srcLive: () => { S.source = 'live'; save(); rerender(); },
    srcSim: () => { S.source = 'sim'; MC.sim.t = MC.reading().ok ? MC.sim.t : 30; save(); rerender(); },
    simOver: () => { if (MC.live()) { toast('Live ang data – ilipat muna sa Simulated', 'info'); return; } MC.sim.over = 6; },
    skip1: () => { if (S.batch && S.batch.active) { S.batch.h += 1; save(); rerender(); } else toast('Walang batch na tumatakbo', 'info'); },
    finish: () => { if (S.batch && S.batch.active) { S.batch.h = M.dur(S.batch); save(); } else toast('Walang batch na tumatakbo', 'info'); },
    cut: () => H.powerCut(false),
    back: () => H.powerBack(),
    lowbat: () => { S.battery = 15; save(); notify({ icon: 'battery-low', tone: 'warning', title: 'Mahina ang baterya', desc: '15% na lang ang baterya ng makina. Tingnan ang kuryente.', go: 'ST_BATERYA', cta: 'View' }); },
    drop: () => ACT.facTempDrop(),
    insuff: () => go('ST_KULANG_KURYENTE'),
    emer: () => { notify({ icon: 'octagon-alert', tone: 'critical', title: 'Huminto ang makina', desc: 'Emergency stop. Lumayo sa apoy at tingnan ang makina.', go: 'ST_EMERHENSIYA', cta: 'View' }); go('ST_EMERHENSIYA'); },
    lost: () => { S.connected = false; save(); go(S.batch && S.batch.active ? 'S04' : 'ST_WALANG_KONEKSYON'); },
    failConn: () => { S.failConnect = !S.failConnect; save(); },
    failStart: () => { S.failStart = !S.failStart; save(); },
    nohist: () => { S.noHistory = !S.noHistory; save(); rerender(); },
    mode: () => { go('MODE'); facToggle(false); },
    reset: () => { const n = Date.now(); if (!FAC._armed || n - FAC._armed > 4000) { FAC._armed = n; setTimeout(() => { const b = document.querySelector('[data-fac="reset"]'); if (b) b.innerHTML = 'Tap AGAIN to reset<small>buburahin ang batch, rekord at login</small>'; }, 0); return; } FAC._armed = 0; window.__resetDemo(); }
  });
  ACT.facTempDrop = () => {
    const b = S.batch; if (!b || !b.active) { toast('Walang batch na tumatakbo', 'info'); return; }
    if (!M.alt(b)) { toast('Para lang sa biomass o solar', 'info'); return; }
    b.drop = 14; b.refuel = false; save();
    if (b.mode === 'Solar') notify({ icon: 'cloud-rain', tone: 'warning', title: 'Bumaba ang temperature', desc: 'Natatakpan ng ulap ang araw. Maghintay o lumipat sa biomass.', go: '21', cta: 'View' });
    else notify({ icon: 'thermometer', tone: 'warning', title: 'Bumaba ang temperature', desc: 'Dagdagan ang panggatong at ayusin ang hangin ng apoy.', go: '21', cta: 'View' });
  };
  window.FACTRIGGERS = FAC;
  window.facRefreshRemote = () => { facStat(); const el = document.getElementById('modeRemote'); if (el && window.REMOTE) el.innerHTML = remoteLine(); };
  function remoteLine() { return 'Remote code: <b style="letter-spacing:2px;font-size:1.0625rem">' + REMOTE.code + '</b> · ' + (REMOTE.online ? 'handa' : 'walang internet'); }
  window.remoteLine = remoteLine;
  window.__resetDemo = () => { try { localStorage.removeItem(LS_KEY); } catch (e) { } location.reload(); };
  window.__fresh = freshState; window.__statusbar = statusbar; window.__androidnav = androidnav;
  document.getElementById('facClose').onclick = () => facToggle(false);
  document.getElementById('facTab').onclick = () => facToggle(true);

  function fit() {
    const d = document.getElementById('device');
    if (window.innerWidth <= 520) { d.style.transform = ''; return; }
    d.style.transform = 'scale(' + Math.min(1, (window.innerHeight - 70) / 820, (window.innerWidth - 20) / 380) + ')';
  }
  window.addEventListener('resize', fit);
  window.applyFont = () => { const px = ({ s: '14px', m: '16px', l: '18px' })[S.settings.font] || '16px'; document.documentElement.style.setProperty('--fs', px); document.documentElement.style.fontSize = px; };
  window.boot = function () {
    fit(); applyFont();
    let start = S.screen && SCREENS[S.screen] ? S.screen : 'MODE';
    if (SCREENS[start] && SCREENS[start].transient) start = S.loggedIn ? '03' : (S.scenario ? '00' : 'MODE');
    if (S.loggedIn && !S.remember && start !== 'MODE') start = 'L01';
    else if (S.loggedIn && start !== 'MODE') start = '03'; // pick and connect the machine on every app open
    cur = null; go(start, { replace: true });
    setInterval(tick, 250);
    setInterval(() => { const sb = document.querySelector('#screen .statusbar span'); if (sb) { const d = new Date(); sb.textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); } }, 15000);
  };
})();
