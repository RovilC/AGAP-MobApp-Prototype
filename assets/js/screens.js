/* AGAP prototype – main screens (original flow). Screen IDs follow the Figma frame numbers. */
(function () {
  'use strict';
  const SC = window.SCREENS, ACT = window.ACT, H = window.H, M = window.M, MC = window.MC;
  const S = () => window.S;
  const b = () => S().batch;
  const isOn = () => b() && b().active;

  /* ---------- UI helpers ---------- */
  const U = (window.U = {});
  U.hero = (icon, o) => { o = o || {}; const sz = o.size === 'm' ? 48 : o.size === 's' ? 34 : 80; return '<div class="hero ' + (o.size || '') + (o.white ? ' white' : '') + '"><div class="disc ' + (o.tone || '') + '">' + (o.deco === false ? '' : '<i class="sun"></i><i class="moon"></i>') + ic(icon, sz, '', o.size === 's' ? 1.6 : 1.4) + '</div></div>'; };
  U.btn = (label, a, kind, extra) => { const attr = a && a.indexOf(':') === 0 ? 'data-go="' + a.slice(1) + '"' : 'data-act="' + a + '"'; return '<button class="btn ' + (kind || 'primary') + '" ' + attr + ' ' + (extra || '') + '>' + label + '</button>'; };
  U.chip = (icon, text, cls) => '<span class="chip ' + (cls || '') + '">' + (icon ? ic(icon, 18) : '') + text + '</span>';
  U.metric = (icon, label, val, unit, sm, cls) => '<div class="metric ' + (cls || '') + '"><div class="lbl">' + ic(icon, 18) + label + '</div><div class="val ' + (sm ? 'sm' : '') + '">' + val + '</div>' + (unit ? '<div class="unit">' + unit + '</div>' : '') + '</div>';
  U.bar = (pct) => '<div class="bar"><i style="width:' + Math.max(0, Math.min(100, pct)) + '%"></i></div>';
  U.ring = (pct) => { const r = 32, c = 2 * Math.PI * r; return '<div class="ring"><svg width="76" height="76" viewBox="0 0 76 76"><circle cx="38" cy="38" r="' + r + '" fill="none" stroke="#bbdefb" stroke-width="8"/><circle cx="38" cy="38" r="' + r + '" fill="none" stroke="#0b5ed7" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - pct / 100)).toFixed(1) + '" style="transition:stroke-dashoffset .6s"/></svg><b>' + pct + '%</b></div>'; };
  U.banner = (tone, icon, title, desc, act) => '<div class="banner ' + tone + (act ? ' tap' : '') + '" ' + (act ? (act[0] === ':' ? 'data-go="' + act.slice(1) + '"' : 'data-act="' + act + '"') : '') + '><span class="bi">' + ic(icon, 24) + '</span><div style="flex:1">' + (title ? '<div class="t">' + title + '</div>' : '') + (desc ? '<div class="p' + (title ? ' mt4' : '') + '">' + desc + '</div>' : '') + '</div>' + (act ? '<span class="blue" style="align-self:center">' + ic('chevron-right', 20) + '</span>' : '') + '</div>';
  U.check = (on, label, act, arg) => '<div class="check ' + (on ? 'on' : '') + '" data-act="' + act + '" data-arg="' + (arg || '') + '"><span class="box">' + (on ? ic('check', 16, '', 3) : '') + '</span><span>' + label + '</span></div>';
  U.supplyIcon = (mode) => (mode === 'Biomass' ? 'flame' : mode === 'Solar' ? 'sun' : mode === 'Battery' ? 'battery' : 'plug');
  U.modeLabel = (mode) => (mode === 'Biomass' ? 'Biomass' : mode === 'Solar' ? 'Solar' : mode === 'Battery' ? 'Baterya' : 'Kuryente');
  U.fishName = (f) => (f === 'Iba pa' ? 'Iba pa' : f);
  U.graph = (o) => {
    const W = 250, Hh = 146, y0 = 6, y1 = 136;
    const yOf = (w) => y0 + (o.initial - w) / (o.initial - o.target) * (y1 - y0);
    const end = o.stopAt != null ? o.stopAt : o.full ? 1 : Math.min(1, o.h / o.dur);
    const pts = []; for (let i = 0; i <= 40; i++) { const p = end * i / 40; pts.push([p * (W - 12), yOf(o.initial - (o.initial - o.target) * M.lossShare(p))]); }
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const last = pts[pts.length - 1];
    const xl = o.xlabels || [0, 2, 4, Math.round(o.dur)];
    return '<div class="row" style="align-items:stretch;gap:8px"><div style="width:38px;display:flex;flex-direction:column;justify-content:space-between;height:146px;font-size:.8125rem;color:var(--text2)"><span>' + H.kg(o.initial) + '</span><span>' + H.kg((o.initial + o.target) / 2) + '</span><span>' + H.kg(o.target) + '</span></div>' +
      '<svg class="graph" viewBox="0 0 ' + W + ' ' + Hh + '" preserveAspectRatio="none" style="flex:1;height:146px"><line x1="0" x2="' + W + '" y1="6.5" y2="6.5" stroke="#cddef4"/><line x1="0" x2="' + W + '" y1="71" y2="71" stroke="#cddef4"/><line x1="0" x2="' + W + '" y1="136" y2="136" stroke="#cddef4"/>' +
      (end > 0.002 ? '<path d="' + d + '" fill="none" stroke="#0b5ed7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' : '') +
      '<circle cx="' + Math.max(6, last[0]).toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="5" fill="#0b5ed7" stroke="#fff" stroke-width="2"/></svg></div>' +
      '<div class="row" style="justify-content:space-between;padding-left:46px;font-size:.8125rem;color:var(--text2);margin-top:8px">' + xl.map((v, i) => '<span>' + (typeof v === 'number' ? v + (i === xl.length - 1 ? ' oras' : '') : v) + '</span>').join('') + '</div>';
  };

  /* ---------- chamber temperature (live from the machine) ---------- */
  U.tempVal = () => { const r = MC.reading(); return r.ok ? String(r.v) : '—'; };
  U.tempState = () => {
    const r = MC.reading();
    if (!r.ok) return { cls: 'danger', icon: 'circle-alert', label: 'Walang reading' };
    if (r.limit) return { cls: 'danger', icon: 'thermometer', label: 'Max · heater off' };
    if (r.warn) return { cls: 'warn', icon: 'thermometer', label: 'Malapit sa max' };
    return { cls: 'ok', icon: 'circle-check', label: 'Normal' };
  };
  U.tempAlert = () => {
    const r = MC.reading();
    if (!r.ok) return '<div class="mt8">' + U.banner('danger', 'circle-alert', r.err, 'Naka-off ang heater hanggang bumalik ang reading.', MC.online() ? null : ':CONN') + '</div>';
    if (r.limit) return '<div class="mt8">' + U.banner('danger', 'thermometer', 'Naabot ang max temperature', 'Naka-off ang heater. Bubukas ulit pag bumaba sa 75°C.') + '</div>';
    if (r.warn) return '<div class="mt8">' + U.banner('warn', 'thermometer', 'Malapit na sa max temperature', r.v + '°C ngayon. Max ay 80°C.') + '</div>';
    return '';
  };
  U.tempCard = () => {
    const r = MC.reading(), st = U.tempState();
    const src = MC.live() ? 'Live · ' + S().machineId + ' · ' + H.secAgo(MC.lastAt) : MC.wantLive() ? 'SIMULATED (walang live data mula sa makina)' : 'SIMULATED (pang-test)';
    return '<div class="card mt8 tempcard ' + st.cls + '"><div class="row" style="justify-content:space-between"><b style="color:var(--navy)">Temperature ng chamber</b>' + U.chip(st.icon, st.label, st.cls) + '</div>' +
      '<div class="row mt8" style="align-items:flex-end;gap:10px"><span class="huge">' + (r.ok ? r.v : '—') + '<span style="font-size:1.25rem">°C</span></span><span class="small muted" style="padding-bottom:6px">max 80°C</span><span class="spacer"></span>' +
      (r.ok ? '<span class="small" style="padding-bottom:6px;font-weight:700;color:' + (r.heater ? 'var(--danger)' : 'var(--text2)') + '">' + ic('flame', 16) + ' Heater ' + (r.heater ? 'on' : 'off') + '</span>' : '') + '</div>' +
      (r.ok ? '<div class="mt8 tbar"><i style="width:' + Math.min(100, Math.max(0, (r.raw - 20) / 60 * 100)) + '%"></i><em style="left:' + ((75 - 20) / 60 * 100) + '%"></em></div>' : '<div class="small dangerc mt4" style="font-weight:600">' + r.err + '</div>') +
      '<div class="tiny muted mt8">' + ic(MC.live() ? 'activity' : 'info', 12) + ' ' + src + '</div></div>';
  };

  /* ---------- home cards: readiness, backup power, maintenance ---------- */
  U.ready = () => { const m = S().machine || {}; return m.door === 'closed' && m.trays && S().connected && MC.reading().ok; };
  U.homeCards = (running) => {
    const s = S(), m = s.machine || {}, r = MC.reading();
    const row = (ok, label, val) => '<div class="kv" style="min-height:30px"><span class="row" style="gap:8px"><span class="' + (ok ? 'okc' : 'dangerc') + '">' + ic(ok ? 'circle-check' : 'circle-alert', 18) + '</span>' + label + '</span><b class="' + (ok ? '' : 'dangerc') + '">' + val + '</b></div>';
    let h = '';
    if (!running) h += '<div class="card mt8"><div class="row" style="justify-content:space-between"><b style="color:var(--navy)">Handa na ba ang makina?</b>' + (U.ready() ? U.chip('circle-check', 'Handa', 'ok') : U.chip('circle-alert', 'Hindi pa handa', 'danger')) + '</div><div class="mt8">' +
      row(m.door === 'closed', 'Pinto', m.door === 'closed' ? 'Sarado' : 'Bukas') + row(!!m.trays, 'Tray', m.trays ? 'Pantay' : 'Tingnan') + row(r.ok, 'Temp sensor', r.ok ? 'OK' : 'Error') +
      '</div>' + (m.door !== 'closed' ? '<div class="mt8">' + U.btn('Door closed', 'doorFix', 'tint') + '</div>' : '') + '</div>';
    const hrs = Math.max(0, s.battery / 100 * 10), grid = s.power === 'grid';
    h += '<div class="card mt8"><div class="row" style="justify-content:space-between"><b style="color:var(--navy)">Baterya (backup)</b>' + U.chip(grid ? 'plug' : 'battery-low', grid ? 'Nagcha-charge' : 'Baterya ang gamit', grid ? 'ok' : 'warn') + '</div>' +
      '<div class="row mt8" style="gap:12px"><span class="' + (s.battery <= s.settings.batWarn ? 'dangerc' : 'blue') + '">' + ic(s.battery <= s.settings.batWarn ? 'battery-low' : 'battery', 30) + '</span><div class="grow"><div class="h2">' + Math.round(s.battery) + '%</div><div class="small muted">~' + (Math.round(hrs * 2) / 2) + ' oras na monitoring kung walang kuryente</div></div></div><div class="mt8">' + U.bar(s.battery) + '</div></div>';
    if (!running) {
      const mt = s.maint || {};
      const items = [['ash', 'flame', 'Linisin ang lalagyan ng abo'], ['glass', 'sun', 'Punasan ang salamin'], ['coil', 'wrench', 'Tingnan ang heating coil']];
      const left = items.filter((x) => !mt[x[0]]).length;
      h += '<div class="card mt8"><div class="row" style="justify-content:space-between"><b style="color:var(--navy)">Pag-aalaga ng makina</b><span class="small ' + (left ? 'warnc' : 'okc') + '" style="font-weight:700">' + (left ? left + ' pa ang gagawin' : 'Tapos lahat') + '</span></div>' +
        items.map((x) => '<div class="listrow" style="min-height:48px;border-top:1px solid var(--line);margin-top:6px;padding-top:6px' + (mt[x[0]] ? ';opacity:.55' : '') + '"><span class="blue">' + ic(x[1], 22) + '</span><div class="grow p" style="' + (mt[x[0]] ? 'text-decoration:line-through' : '') + '">' + x[2] + '</div><button class="btn ' + (mt[x[0]] ? 'tint' : 'secondary') + '" style="height:36px;width:auto;padding:0 12px;font-size:.8125rem;border-radius:10px" data-act="maintTick" data-arg="' + x[0] + '">' + (mt[x[0]] ? 'Undo' : 'Done') + '</button></div>').join('') + '</div>';
    }
    return h;
  };
  ACT.maintTick = (k) => { S().maint[k] = !S().maint[k]; save(); rerender(); };
  ACT.doorFix = () => { S().machine.door = 'closed'; save(); rerender(); toast('Sarado na ang pinto', 'door'); };

  U.dashCard = (o) => {
    o = o || {};
    const sup = M.supply(), on = MC.online();
    return '<div class="gradcard"><div class="greet">' + (o.greet || 'Magandang araw' + (S().operator ? ', ' + H.esc(S().operator) : '') + '!') + '</div>' +
      '<div class="line" data-act="tapConn" style="cursor:pointer">' + ic(on ? H.connIcon() : 'wifi-off', 18) + S().machineId + ' • ' + (on ? 'Nakakonekta' : 'Offline') + '</div>' +
      '<div class="chips">' + U.chip(U.supplyIcon(sup), U.modeLabel(sup), 'dark') + U.chip(S().power === 'none' ? 'battery-low' : 'battery', Math.round(S().battery) + '%', 'dark') + '</div></div>';
  };
  ACT.tapConn = () => window.openOverlay('CONN_SET');

  /* ================= Demo picker (before 00) ================= */
  SC.MODE = {
    name: '— Pumili ng demo (bago ang 00)', light: true,
    raw: () => '<div class="view modepick" style="position:absolute;inset:0;display:flex;flex-direction:column">' +
      '<div class="statusbar light"><span>Demo</span><span></span></div>' +
      '<div style="flex:1;overflow:auto;padding:24px 20px;display:flex;flex-direction:column;gap:16px">' +
      '<div class="center"><img src="assets/img/logo-192.png" alt="AGAP" style="width:96px;height:96px;border-radius:50%;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.25)" data-logo></div>' +
      '<div class="center" style="font-size:2rem;font-weight:800">AGAP</div><div class="center" style="opacity:.9;margin-top:-8px">Pumili ng demo</div>' +
      '<button class="opt" data-act="pickMode" data-arg="orig"><span class="pic">' + ic('smartphone', 26) + '</span><span><b class="h3" style="display:block">Orihinal na daloy</b><span class="p muted small">Isang cellphone, isang makina.</span></span></button>' +
      '<button class="opt" data-act="pickMode" data-arg="shared"><span class="pic">' + ic('users', 26) + '</span><span><b class="h3" style="display:block">Shared Batch</b><span class="p muted small">Maraming cellphone, iisang makina.</span></span></button>' +
      '<div class="small" style="opacity:.85;line-height:1.5">Facilitator: pindutin nang matagal ang logo para sa control panel, o buksan ang <b>controller.html</b> sa ibang device at ilagay ang:</div>' +
      '<div id="modeRemote" class="center" style="background:rgba(255,255,255,.14);border-radius:12px;padding:10px">' + (window.REMOTE ? window.remoteLine() : 'Remote: hindi available') + '</div>' +
      '</div><div class="androidnav light"><button></button><button></button><button></button></div></div>'
  };
  ACT.pickMode = (m) => {
    const keep = { settings: S().settings, speed: S().speed, source: S().source, accounts: S().accounts };
    const fresh = JSON.parse(JSON.stringify(window.__fresh(m)));
    Object.keys(window.S).forEach((k) => delete window.S[k]);
    Object.assign(window.S, fresh, keep); save();
    go('00');
  };

  /* ================= 00 Welcome ================= */
  SC['00'] = {
    name: '00_Simula', light: true,
    raw: () => '<div class="view splash" style="position:absolute;inset:0;display:flex;flex-direction:column">' + window.__statusbar(true) +
      '<div style="flex:1;overflow:auto;padding:0 32px">' +
      '<div class="tile"><img src="assets/img/logo-192.png" alt="AGAP logo" data-logo></div>' +
      '<div class="name">AGAP</div><div class="tag">Tuyo ang isda, umulan man o umaraw.</div>' +
      '<div class="stack mt24" style="gap:20px">' +
      '<div class="benefit"><span class="pic">' + ic('shield-check', 34, '', 1.5) + '</span><div><div class="h3" style="color:var(--text)">Ligtas ang isda</div><div class="p muted mt4">Ligtas at kontroladong init.</div></div></div>' +
      '<div class="benefit"><span class="pic">' + ic('smartphone', 34, '', 1.5) + '</span><div><div class="h3" style="color:var(--text)">Bantayan sa cellphone</div><div class="p muted mt4">Makita ang timbang at temperature.</div></div></div>' +
      '</div><div class="mt24">' + U.btn('Start', 'startApp') + '</div></div>' +
      '<div style="height:40px"></div>' + window.__androidnav(true) + '</div>',
    keys: { Escape: 'MODE' }, back: 'MODE'
  };
  ACT.startApp = () => { const s = S(); s.loggedIn = false; s.connected = false; s.loginAttempts = 0; s.pin = ''; save(); go('02'); };

  /* ================= Login (02, L01–L09) ================= */
  function pinInput(id, val, shown, ph, err) {
    return '<div class="input ' + (err ? 'error' : '') + '"><input id="' + id + '" type="' + (shown ? 'text' : 'password') + '" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="off" value="' + H.esc(val || '') + '" placeholder="' + (ph || '6 na numero') + '" style="letter-spacing:' + (shown ? '1px' : '4px') + '"></div>';
  }
  U.pinInput = pinInput;
  function loginView(mode) {
    const s = S(), shown = mode === 'L02', locked = mode === 'L05';
    return '<div class="authhero"><div class="lg"><img src="' + LOGO + '" alt="AGAP" data-logo><b>AGAP</b></div><h2>' + (mode === '02' ? 'Mag-log in' : 'Maligayang pagbabalik!') + '</h2></div>' +
      '<div class="card mt16" style="padding:20px"><div class="field"><label>Username</label><div class="input ' + (mode === 'L04' ? 'error' : '') + '"><input id="userIn" value="' + H.esc(s.loginUser || '') + '" placeholder="hal. MangJun" autocomplete="username" autocapitalize="none" spellcheck="false"></div></div>' +
      '<div class="field mt16"><label>PIN</label><div style="position:relative">' + pinInput('pinIn', s.pin, shown, '6 na numero', mode === 'L04' || locked) +
      '<button data-act="togglePin" class="blue" style="position:absolute;right:12px;top:0;height:56px;display:flex;gap:6px;align-items:center;font-weight:600">' + ic(shown ? 'eye-off' : 'eye', 20) + (shown ? 'Hide' : 'Show') + '</button></div>' +
      (mode === 'L04' ? '<div class="err">' + ic('circle-alert', 16) + 'Mali ang username o PIN.</div>' : '') +
      (locked ? '<div class="err">' + ic('lock', 16) + 'Naka-lock. Subukan ulit sa loob ng <span id="lockLeft">1 min</span>.</div>' : '') + '</div>' +
      '<div class="mt8">' + U.check(s.remember, 'Tandaan ako', 'toggleRemember') + '</div></div>';
  }
  function loginActions(mode) {
    const extra = U.btn(ic('user', 20) + 'Create account', 'toRegister', 'secondary') + '<button class="link" style="padding:4px 0" data-go="L07">Nakalimutan ang PIN?</button>';
    if (mode === 'L06') return '<button class="btn primary disabled" style="background:var(--blue);color:#fff;opacity:.85"><span class="spinner s" style="border-color:rgba(255,255,255,.35);border-top-color:#fff"></span>Naglo-log in…</button>' + extra;
    return U.btn('LOG IN', 'doLogin', 'primary', mode === 'L05' ? 'disabled' : '') + extra;
  }
  const loginKeys = { Escape: () => { S().loginAttempts = 0; save(); go('00'); } };
  function mkLogin(id, name, extra) {
    SC[id] = Object.assign({ name: name, bar: { brand: true }, body: () => loginView(id), actions: () => loginActions(id), keys: loginKeys, back: '00',
      mounted: () => { ['userIn', 'pinIn'].forEach((k) => { const i = document.getElementById(k); if (i) i.addEventListener('keydown', (e) => { if (e.key === 'Enter') ACT.doLogin(); }); }); const p = document.getElementById('pinIn'); if (p) p.addEventListener('input', () => { p.value = p.value.replace(/\D/g, '').slice(0, 6); }); } }, extra || {});
  }
  mkLogin('02', '02_Mag-log in');
  mkLogin('L01', 'L01_Login – handa');
  mkLogin('L02', 'L02_Login – kita ang PIN');
  mkLogin('L03', 'L03_Login – nagta-type ng PIN', { enter: () => setTimeout(() => { const p = document.getElementById('pinIn'); if (p) p.focus(); }, 150) });
  mkLogin('L04', 'L04_Login – maling PIN', { enter: () => { if (S().loginAttempts >= 3) { S().lockUntil = Date.now() + 60000; save(); go('L05', { replace: true }); } } });
  mkLogin('L05', 'L05_Login – naka-lock', {
    enter: () => {
      if (!S().lockUntil || S().lockUntil < Date.now()) { S().lockUntil = Date.now() + 60000; save(); }
      SC.L05._iv = setInterval(() => { const el = document.getElementById('lockLeft'); const left = Math.ceil((S().lockUntil - Date.now()) / 1000); if (left <= 0) { clearInterval(SC.L05._iv); S().loginAttempts = 0; S().lockUntil = 0; save(); if (window.curScreen() === 'L05') go('L01', { replace: true }); return; } if (el) el.textContent = left + ' seg'; }, 500);
    }, leave: () => clearInterval(SC.L05._iv)
  });
  H.findAccount = (u) => S().accounts.find((a) => a.username.toLowerCase() === String(u || '').trim().toLowerCase());
  mkLogin('L06', 'L06_Login – sinusuri', {
    after: [1200, () => { const s = S(); const acc = H.findAccount(s.loginUser); if (acc && acc.pin === s.pin) { s.loginAttempts = 0; s.operator = acc.username; s.samahan = acc.samahan; save(); go('L08'); } else { s.loginAttempts++; save(); go('L04'); } }]
  });
  mkLogin('L08', 'L08_Login – tagumpay', {
    mounted: () => { const t = document.createElement('div'); t.className = 'toast nonav'; t.style.bottom = '170px'; t.innerHTML = ic('circle-check', 22) + '<span>Maligayang pagdating, ' + H.esc(H.me()) + '!</span>'; document.getElementById('screen').appendChild(t); },
    after: [1000, () => { const s = S(); s.loggedIn = true; save(); if (s.scenario === 'shared' && !s.operator) return go('SB14'); go('03'); }]
  });
  ACT.noop = () => { };
  function keepLogin() { const u = document.getElementById('userIn'), p = document.getElementById('pinIn'); if (u) S().loginUser = u.value.trim(); if (p) S().pin = p.value.replace(/\D/g, '').slice(0, 6); save(); }
  ACT.togglePin = (a, el, e) => { if (e) e.stopPropagation(); keepLogin(); go(window.curScreen() === 'L02' ? 'L01' : 'L02', { replace: true }); };
  ACT.toggleRemember = () => { keepLogin(); S().remember = !S().remember; save(); rerender(); };
  ACT.doLogin = () => {
    keepLogin(); const s = S();
    if (window.curScreen() === 'L05') return;
    if (!s.loginUser) { toast('Ilagay ang username', 'info'); const i = document.getElementById('userIn'); if (i) i.focus(); return; }
    if (s.pin.length !== 6) { toast('Ilagay ang 6 na numerong PIN', 'info'); const i = document.getElementById('pinIn'); if (i) i.focus(); return; }
    go('L06');
  };
  ACT.toRegister = () => { keepLogin(); S().reg = { err: {} }; save(); go('REG'); };
  SC.L07 = { name: 'L07_Nakalimutan ang PIN', sheet: () => '<div class="stack"><div class="h2">Nakalimutan ang PIN?</div><p class="p">Magpatulong sa admin para i-reset.</p>' + U.btn(ic('phone', 20) + 'Call admin', 'callAdmin') + U.btn('Close', 'close', 'secondary') + '</div>', keys: { Escape: () => window.closeOverlay() } };
  ACT.callAdmin = () => { window.closeOverlay(); toast('Tinatawagan ang admin…', 'phone'); };

  /* ================= Create account ================= */
  SC.REG = {
    name: 'REG_Gumawa ng account', bar: { title: 'Gumawa ng account', back: 'L01' }, back: 'L01', keys: { Escape: 'L01' },
    body: () => {
      const r = S().reg || (S().reg = { err: {} }); const e = r.err || {};
      const fld = (k, label, inner, hint) => '<div class="field mt16"><label>' + label + '</label>' + inner + (e[k] ? '<div class="err">' + ic('circle-alert', 16) + e[k] + '</div>' : (hint ? '<div class="hint">' + hint + '</div>' : '')) + '</div>';
      const txt = (k, ph, extra) => '<div class="input ' + (e[k] ? 'error' : '') + '"><input id="reg_' + k + '" value="' + H.esc(r[k] || '') + '" placeholder="' + ph + '" ' + (extra || '') + '></div>';
      return fld('username', 'Username', txt('username', 'hal. MangJun', 'autocapitalize="none" spellcheck="false" maxlength="20"'), '3–20 letra o numero') +
        fld('phone', 'Numero ng telepono', txt('phone', '09XX XXX XXXX', 'type="tel" inputmode="tel" maxlength="13"'), '') +
        fld('samahan', 'Samahan', txt('samahan', 'hal. SUBAD', 'maxlength="30"'), '') +
        fld('pin', 'PIN', pinInput('reg_pin', r.pin, false, '6 na numero', e.pin), '') +
        fld('pin2', 'Ulitin ang PIN', pinInput('reg_pin2', r.pin2, false, '6 na numero', e.pin2), '');
    },
    actions: () => U.btn('CREATE ACCOUNT', 'doRegister') + '<button class="link" data-go="L01">May account na? Mag-log in</button>',
    mounted: () => { ['reg_pin', 'reg_pin2'].forEach((k) => { const p = document.getElementById(k); if (p) p.addEventListener('input', () => { p.value = p.value.replace(/\D/g, '').slice(0, 6); }); }); }
  };
  ACT.doRegister = () => {
    const v = (k) => { const i = document.getElementById('reg_' + k); return i ? i.value.trim() : ''; };
    const r = { username: v('username'), phone: v('phone').replace(/[\s-]/g, ''), samahan: v('samahan'), pin: v('pin'), pin2: v('pin2'), err: {} };
    if (!/^[A-Za-z0-9._ ]{3,20}$/.test(r.username)) r.err.username = 'Gumamit ng 3–20 letra o numero.';
    else if (H.findAccount(r.username)) r.err.username = 'May gumagamit na ng username na ito.';
    if (!/^(09\d{9}|\+639\d{9})$/.test(r.phone)) r.err.phone = 'hal. 09171234567 (11 numero).';
    if (r.samahan.length < 2) r.err.samahan = 'Ilagay ang inyong samahan.';
    if (!/^\d{6}$/.test(r.pin)) r.err.pin = 'Dapat 6 na numero ang PIN.';
    else if (r.pin2 !== r.pin) r.err.pin2 = 'Hindi magkapareho ang PIN.';
    S().reg = r; save();
    if (Object.keys(r.err).length) { if (document.activeElement) document.activeElement.blur(); rerender(); const f = document.querySelector('#screen .input.error input'); if (f) f.focus(); return; }
    S().accounts.push({ username: r.username, phone: r.phone, samahan: r.samahan, pin: r.pin });
    S().loginUser = r.username; S().pin = ''; S().reg = null; save();
    go('L01'); setTimeout(() => toast('Nagawa ang account. Mag-log in na.', 'circle-check', 3000), 100);
  };

  /* ================= 03 Kumonekta sa makina (every login) → CONN auto-check ================= */
  SC['03'] = {
    name: '03_Kumonekta sa makina', bar: { title: 'Kumonekta sa makina', back: () => ACT.connBack() }, back: () => ACT.connBack(), keys: { Escape: () => ACT.connBack() },
    enter: () => { const s = S(); s.connected = false; s.selectedMachine = true; s.scanDone = false; save(); MC.send({ cmd: 'ping' }); later(1400, () => { S().scanDone = true; save(); if (window.curScreen() === '03') rerender(); }); },
    live: true,
    body: () => {
      const s = S(), bt = s.connType === 'bt', seen = MC.online();
      const status = MC.live() ? 'Online · Live data' : 'Handa';
      return '<div class="seg"><button class="' + (!bt ? 'on' : '') + '" data-act="connType" data-arg="wifi">' + ic('wifi', 18) + 'Wi-Fi</button><button class="' + (bt ? 'on' : '') + '" data-act="connType" data-arg="bt">' + ic('bluetooth', 18) + 'Bluetooth</button></div>' +
        '<div class="mt12">' + U.hero('radar', {}) + '</div>' +
        '<div class="h2 center mt12">Hanapin ang makina</div><div class="p muted center mt8">' + (bt ? 'Naka-on ang Bluetooth · lumapit sa makina' : 'Naka-on ang Wi-Fi · may internet') + '</div>' +
        (s.scanDone ? '<div class="card mt16 tap listrow" data-act="pickMachine" style="padding:16px;' + (s.selectedMachine ? 'border-color:var(--blue);background:var(--pale)' : '') + '"><span class="blue">' + ic(bt ? 'bluetooth' : 'wifi', 30) + '</span><span class="grow"><b class="h3" style="color:var(--text)">' + s.machineId + '</b><div class="tiny ' + (seen ? 'okc' : 'muted') + '">' + (s.samahan || 'SUBAD') + ' · ' + status + '</div></span><span class="blue">' + ic(s.selectedMachine ? 'circle-check' : 'circle', 26) + '</span></div>'
          : '<div class="card mt16 listrow" style="padding:16px"><span class="spinner s"></span><span class="grow muted">Naghahanap ng makina…</span></div>') +
        (!bt ? '<div class="tiny muted center mt12">Kung walang Wi-Fi, gamitin ang Bluetooth.</div>' : '');
    },
    actions: () => U.btn('CONNECT', 'connectGo', 'primary', S().scanDone && S().selectedMachine ? '' : 'disabled') + '<div class="center muted small">Piliin ang inyong makina.</div>'
  };
  ACT.pickMachine = () => { S().selectedMachine = !S().selectedMachine; save(); rerender(); };
  ACT.connectGo = () => { if (!S().selectedMachine) return; go('CONN'); };
  ACT.connBack = () => { const s = S(); s.loggedIn = false; s.pin = ''; save(); go('L01'); };

  /* ================= Machine connection (single screen) ================= */
  SC.CONN = {
    name: 'CONN_Kumokonekta (auto-check)', bar: { brand: true }, back: null, transient: true,
    enter: () => {
      const s = S(); s.connected = false; save();
      const t0 = (SC.CONN._t0 = Date.now()); MC.send({ cmd: 'ping' });
      clearInterval(SC.CONN._iv);
      SC.CONN._iv = setInterval(() => {
        if (window.curScreen() !== 'CONN') return clearInterval(SC.CONN._iv);
        const el = Date.now() - t0;
        // Always connects: waits briefly for live data, otherwise continues with the simulated reading.
        const done = MC.live() ? el > 1200 : el > 2400;
        if (done) { clearInterval(SC.CONN._iv); s.connected = true; save(); go(H.homeId(), { replace: true }); return; }
        rerender();
      }, 300);
    },
    leave: () => clearInterval(SC.CONN._iv),
    body: () => {
      const el = Date.now() - (SC.CONN._t0 || Date.now()), relay = el > 500, mach = el > 1100;
      const step = (ok, label) => '<div class="listrow" style="min-height:40px">' + (ok ? '<span class="okc">' + ic('circle-check', 22) + '</span>' : '<span class="spinner s"></span>') + '<span class="grow">' + label + '</span></div>';
      return '<div style="height:70px"></div><div class="center"><div class="spinner" style="margin:0 auto;width:72px;height:72px"></div></div>' +
        '<div class="h1 center mt24">Kumokonekta…</div><p class="p muted center mt8">' + S().machineId + '</p>' +
        '<div class="card mt24">' + step(relay, 'Internet') + step(relay && mach, 'Makina') + step(relay && mach && MC.reading().ok, 'Temperature sensor') + '</div>';
    }
  };
  SC.CONN_FAIL = {
    name: 'CONN_Hindi makakonekta', bar: { brand: true }, back: null,
    body: () => {
      const why = SC.CONN_FAIL._why === 'internet';
      return U.hero(why ? 'wifi-off' : 'plug-zap', { tone: 'danger' }) + '<div class="h1 center mt16">Hindi makakonekta</div><p class="p muted center mt8">' + (why ? 'Walang internet ang cellphone.' : 'Walang sagot mula sa ' + S().machineId + '.') + '</p>' +
        '<div class="card mt16 stack" style="gap:4px">' + [['power', 'Nakabukas ang makina'], ['wifi', 'May internet ang Wi-Fi ng makina'], ['smartphone', 'May internet ang cellphone']].map((x) => '<div class="listrow"><span class="blue">' + ic(x[0], 22) + '</span><span class="grow">' + x[1] + '</span></div>').join('') + '</div>';
    },
    actions: () => U.btn(ic('refresh', 20) + 'Retry', ':CONN') + U.btn('Back', ':03', 'secondary') + '<button class="link" data-act="openConnSet">Ayos ng koneksyon</button>'
  };
  ACT.openConnSet = () => window.openOverlay('CONN_SET');
  ACT.reconnect = () => go('CONN');
  SC.CONN_SET = {
    name: 'CONN_Ayos ng koneksyon',
    sheet: () => {
      const on = MC.online(), bt = S().connType === 'bt';
      return '<div class="stack"><div class="h2">Koneksyon</div>' +
        '<div class="card flat"><div class="kv"><span class="muted">Makina</span><b>' + S().machineId + '</b></div><div class="kv"><span class="muted">Status</span><b class="' + (on ? 'okc' : 'dangerc') + '">' + (on ? 'Online' : 'Offline') + '</b></div><div class="kv"><span class="muted">Huling reading</span><b>' + (MC.live() ? H.secAgo(MC.lastAt) : 'simulated') + '</b></div></div>' +
        '<div class="seg"><button class="' + (!bt ? 'on' : '') + '" data-act="connType" data-arg="wifi">' + ic('wifi', 18) + 'Wi-Fi</button><button class="' + (bt ? 'on' : '') + '" data-act="connType" data-arg="bt">' + ic('bluetooth', 18) + 'Bluetooth</button></div>' +
        U.btn(ic('refresh', 20) + 'Reconnect', 'connSetGo') + U.btn('Close', 'close', 'secondary') + '</div>';
    }
  };
  ACT.connType = (t) => { S().connType = t; save(); if (window.curOverlay && window.curOverlay() === 'CONN_SET') { window.closeOverlay(); window.openOverlay('CONN_SET'); } else rerender(); };
  ACT.connSetGo = () => { window.closeOverlay(); go('CONN'); };

  /* ================= Home (05 / 06) ================= */
  function powerBanner() {
    if (S().power === 'grid') return '';
    const bb = b();
    if (bb && bb.active && bb.mode === 'Electric') return '<div class="mt8">' + U.banner('danger', 'unplug', 'Walang kuryente', 'Huminto ang pag-init. Ano ang gagawin?', ':18') + '</div>';
    return '<div class="mt8">' + U.banner('warn', 'unplug', 'Walang kuryente', 'Baterya ang gamit (' + Math.round(S().battery) + '%).') + '</div>';
  }
  U.powerBanner = powerBanner;
  function offlineBanner() { return MC.online() ? '' : '<div class="mt8">' + U.banner('warn', 'wifi-off', 'Offline ang makina', 'I-tap para kumonekta ulit.', ':CONN') + '</div>'; }
  U.offlineBanner = offlineBanner;
  SC['05'] = {
    name: '05_Home – walang batch', bar: { brand: true }, nav: 'dash', live: true, back: null, keys: { X: 'S18' },
    enter: () => { if (!S().connected) go('ST_WALANG_KONEKSYON', { replace: true }); else if (isOn()) go('06', { replace: true }); },
    body: () => {
      const last = S().history[0];
      return U.dashCard() + offlineBanner() + powerBanner() + U.tempCard() +
        '<div class="mt12">' + U.btn('+ New Batch', 'navNew', 'primary', U.ready() ? '' : 'disabled') + '</div>' + U.homeCards(false) +
        (last ? '<div class="card soft mt8 tap listrow" data-act="openLast" style="padding:12px"><span class="blue">' + ic('fish', 26) + '</span><span class="grow"><b class="small" style="color:var(--navy)">Huling batch · ' + U.fishName(last.fish) + '</b><div class="p mt4">' + H.kg(last.initial) + ' → ' + H.kg(last.final) + ' kg</div></span><span class="' + (last.status === 'done' ? 'okc' : 'dangerc') + ' small" style="font-weight:700;align-self:flex-end">' + (last.status === 'done' ? 'Tapos' : 'Inihinto') + '</span></div>' : '') +
        '<div class="card soft mt8 tap listrow" data-act="startTut" style="padding:12px"><span class="blue">' + ic('play', 20) + '</span><span class="grow"><b style="color:var(--navy)">Paano gamitin</b></span><span class="blue">' + ic('chevron-right', 20) + '</span></div>';
    }
  };
  ACT.openLast = () => go('25');
  ACT.startTut = () => go('S12_1');
  SC['06'] = {
    name: '06_Home – may batch', bar: { brand: true }, nav: 'dash', live: true, back: null, hotspot: 'demoCut',
    keys: { H: 'S05', D: 'S06', E: 'S07', X: 'S18' },
    enter: () => { if (!S().connected) go('S04', { replace: true }); else if (!isOn()) go('05', { replace: true }); },
    body: () => {
      const bb = b(); if (!bb) return '';
      const st = M.status(bb), r = MC.reading();
      return U.dashCard() + offlineBanner() + powerBanner() + U.tempAlert() +
        '<div class="card mt8 tap listrow" data-act="toMonitor" style="padding:12px">' + U.ring(M.pct(bb)) + '<div class="grow"><div class="p" style="font-weight:700;color:var(--navy)">' + U.fishName(bb.fish) + '</div><div class="big" style="font-size:1.875rem">' + H.kg(M.weight(bb)) + ' kg</div><div class="small muted">' + H.dur(bb.h) + ' • <span class="' + (st === 'Umiinit' ? 'pulse' : 'dangerc') + '">' + st + '</span></div></div><span class="blue">' + ic('chevron-right', 20) + '</span></div>' +
        '<div class="mini4 mt8">' +
        '<div class="m ' + (r.ok ? (r.limit ? 'bad' : r.warn ? 'warnm' : '') : 'bad') + '">' + ic('thermometer', 24) + '<div class="l">Chamber</div><div class="v">' + U.tempVal() + '°C</div></div>' +
        '<div class="m">' + ic('droplets', 24) + '<div class="l">Halumigmig</div><div class="v">' + M.hum(bb) + '%</div></div>' +
        '<div class="m">' + ic('clock', 24) + '<div class="l">Natitira</div><div class="v">' + H.durShort(M.remaining(bb)) + '</div></div>' +
        '<div class="m">' + ic('scale', 24) + '<div class="l">Timbang</div><div class="v">' + H.kg(M.weight(bb)) + ' kg</div></div></div>' +
        '<div class="grid2 mt8">' + U.btn('Monitor', 'toMonitor') + U.btn('Stop', 'askStop', 'danger') + '</div>' + U.homeCards(true);
    }
  };
  ACT.toMonitor = () => go(H.monitorId());
  ACT.demoCut = () => { if (isOn() && S().power === 'grid') H.powerCut(true); };
  ACT.askStop = () => window.openOverlay('ST_IHINTO');
  SC.ST_WALANG_KONEKSYON = {
    name: 'State_Walang koneksyon', bar: { title: 'Home' }, nav: 'dash', live: true, back: null,
    body: () => {
      const bb = b(); const w = bb ? H.kg(M.weight(bb)) : (S().history[0] ? H.kg(S().history[0].final) : '21.8');
      return U.banner('warn', 'wifi-off', 'Nawala ang koneksyon', 'Tuloy ang makina at ang safety limit nito.') +
        '<div class="card mt12" style="padding:16px"><div class="h3">Huling reading</div><div class="small muted mt4">' + (MC.lastAt ? H.secAgo(MC.lastAt) : 'ilang minuto ang nakalipas') + '</div><div class="row mt12" style="justify-content:space-between"><span class="big" style="font-size:1.875rem">' + w + ' kg</span><span class="big" style="font-size:1.875rem">' + (MC.t && typeof MC.t.temp === 'number' ? Math.round(MC.t.temp) : '—') + '°C</span></div></div>' +
        '<div class="mt12">' + U.btn(ic('refresh', 20) + 'Reconnect', ':03') + '</div>';
    }
  };

  /* ================= S11 Prepare machine ================= */
  function prepView(state) {
    const rows = [
      ['scale', 'Timbangin ang walang lamang tray', state >= 1 ? 'Tapos' : 'Tinitimbang…', state >= 1],
      ['fish', 'Ilagay ang isda', state >= 2 ? 'Tapos' : state === 1 ? 'Ilagay at isara' : 'Naghihintay', state >= 2],
      ['plug', S().power === 'none' ? 'Baterya' : 'Kuryente', state >= 3 || state === 9 ? 'Nakita' : 'Naghihintay', state >= 3 || state === 9],
      ['scale', 'Unang timbang', state === 3 ? '26.4 kg' : state === 9 ? 'Walang nakitang timbang' : state === 2 ? 'Tinitimbang…' : 'Naghihintay', state === 3]
    ];
    return U.hero(state === 9 ? 'triangle-alert' : 'scale', { size: 'm', white: true, tone: state === 9 ? 'danger' : state === 3 ? 'ok' : '', deco: false }) + '<div class="h2 center mt12">Ihanda ang makina</div><div class="stack mt16" style="gap:8px">' +
      rows.map((r, i) => '<div class="card ' + (i === 1 && state === 1 ? 'tap' : '') + '" ' + (i === 1 && state === 1 ? 'data-act="fishIn"' : '') + ' style="padding:12px' + (i === 3 && state === 9 ? ';border-color:var(--danger)' : '') + '"><div class="row"><span class="' + (r[3] ? 'okc' : 'blue') + '">' + ic(r[0], 22) + '</span><div style="flex:1"><b style="color:var(--navy)">' + r[1] + '</b><div class="p mt4 ' + (i === 3 && state === 9 ? 'dangerc' : 'muted') + '">' + r[2] + '</div></div>' +
        (r[3] ? '<span class="okc">' + ic('circle-check', 26) + '</span>' : (i === 1 && state === 1) ? '<span class="btn primary" style="height:36px;width:auto;padding:0 12px;font-size:.8125rem;border-radius:10px">Loaded</span>' : r[2] === 'Tinitimbang…' ? '<span class="spinner s"></span>' : '<span style="color:var(--line)">' + ic('circle', 26) + '</span>') + '</div></div>').join('') + '</div>';
  }
  const prepBase = { bar: { title: 'Bagong batch', back: () => go(H.homeId()) }, back: () => go(H.homeId()), keys: { E: 'S11e', Escape: () => go(H.homeId()) } };
  SC.S11a = Object.assign({ name: 'S11_Ihanda – tinitimbang', transient: true, body: () => prepView(0), actions: () => U.btn('Continue', 'noop', 'primary', 'disabled'), after: [1800, () => go('S11b', { replace: true })] }, prepBase);
  SC.S11b = Object.assign({ name: 'S11_Ihanda – ilagay ang isda', transient: true, body: () => prepView(1), actions: () => U.btn('Continue', 'noop', 'primary', 'disabled'), after: [3500, () => go('S11c', { replace: true })] }, prepBase);
  ACT.fishIn = () => go('S11c', { replace: true });
  SC.S11c = Object.assign({ name: 'S11_Ihanda – binabasa ang timbang', transient: true, body: () => prepView(2), actions: () => U.btn('Continue', 'noop', 'primary', 'disabled'), after: [1600, () => { if (S().power === 'none') return go('ST_KULANG_KURYENTE'); go('S11d', { replace: true }); }] }, prepBase);
  SC.S11d = Object.assign({ name: 'S11_Ihanda – handa na', body: () => prepView(3), actions: () => U.btn('Continue', 'prepDone') }, prepBase);
  SC.S11e = Object.assign({ name: 'S11_Ihanda – error', body: () => prepView(9), actions: () => U.btn('Try again', ':S11c') }, prepBase);
  ACT.prepDone = () => { S().form = { fish: 'Galunggong', target: 17.2, temp: 68 }; save(); go('11'); };
  SC.ST_KULANG_KURYENTE = {
    name: 'State_Kulang ang kuryente', bar: { title: 'Suplay ng kuryente', back: () => go(H.homeId()) }, back: () => go(H.homeId()),
    body: () => U.hero('plug-zap', {}) + '<div class="mt12">' + U.chip('triangle-alert', 'Mahina ang suplay', 'warn') + '</div><div class="h1 mt12">Kulang ang kuryente</div>' +
      '<div class="card mt16 stack"><div class="listrow"><span class="blue">' + ic('plug', 24) + '</span><span class="grow">Tingnan ang kuryente</span></div><div class="listrow"><span class="dangerc">' + ic('flame', 24) + '</span><span class="grow">Huwag pilitin ang heater</span></div></div>',
    actions: () => U.btn('Check again', 'recheckPower') + U.btn('Back', 'goHome', 'secondary')
  };
  ACT.recheckPower = () => { if (S().power === 'grid') go('S11c'); else toast('Wala pa ring kuryente', 'unplug'); };
  ACT.goHome = () => go(H.homeId());

  /* ================= 11 New batch ================= */
  function fishTile(name, label) { const on = (S().form || {}).fish === name; return '<button class="card tap" data-act="pickFish" data-arg="' + name + '" style="flex:1;min-width:0;padding:12px 4px;height:88px;display:flex;flex-direction:column;align-items:center;gap:8px;position:relative;' + (on ? 'border-color:var(--blue);background:var(--pale)' : '') + '"><span class="blue">' + ic('fish', 32) + '</span><b class="small" style="color:var(--navy)">' + (label || name) + '</b>' + (on ? '<span class="blue" style="position:absolute;right:8px;top:6px">' + ic('check', 14, '', 3) + '</span>' : '') + '</button>'; }
  U.valid = (f) => ({ t: f.target > 0 && f.target < 26.4, c: f.temp >= 40 && f.temp <= 80 });
  function formView(showErr) {
    const f = S().form || (S().form = { fish: 'Galunggong', target: 17.2, temp: 68 });
    const v = U.valid(f), errT = showErr && !v.t, errC = showErr && !v.c;
    return '<div class="card soft" style="padding:10px 12px"><div class="tiny muted">Unang timbang</div><div class="p" style="font-weight:700;color:var(--navy);margin-top:4px">26.4 kg · ' + (S().power === 'none' ? 'Battery' : 'Electric') + '</div></div>' +
      (showErr ? '<div class="mt12">' + U.banner('danger', 'circle-alert', 'Tingnan ang mga value', '') + '</div>' : '') +
      '<div class="h3 mt16">Isda</div><div class="row mt8" style="gap:8px">' + fishTile('Galunggong') + fishTile('Dilis') + fishTile('Iba pa') + '</div>' +
      '<div class="field mt16"><label>Target na timbang</label><div class="input ' + (errT ? 'error' : '') + '" data-act="editField" data-arg="target"><span style="flex:1">' + f.target + '</span><span class="unit">kg</span></div>' + (errT ? '<div class="err">Dapat mas mababa sa 26.4 kg</div>' : '<div class="hint">Mas mababa sa 26.4 kg</div>') + '</div>' +
      '<div class="field mt16"><label>Temperature</label><div class="input ' + (errC ? 'error' : '') + '" data-act="editField" data-arg="temp"><span style="flex:1">' + f.temp + '</span><span class="unit">°C</span></div>' + (errC ? '<div class="err">Dapat 40–80°C</div>' : '<div class="hint">40–80°C · mungkahi 70°C · max 80°C</div>') + '</div>' +
      '<div class="card soft mt16 listrow" style="padding:8px 12px"><span class="blue">' + ic('shield-check', 24) + '</span><span class="grow small">Isara ang pinto. Ipantay ang mga tray.</span></div>';
  }
  SC['11'] = {
    name: '11_Bagong batch', bar: { title: 'Bagong batch', back: () => go(H.homeId()) }, back: () => go(H.homeId()),
    keys: { A: () => go('S08'), V: () => { S().form = Object.assign({}, S().form, { target: 30, temp: 85 }); save(); go('S10'); }, X: 'S18' },
    body: () => formView(false), actions: () => U.btn('Next', 'formNext')
  };
  SC.S10 = { name: 'S10_Mali ang value', bar: { title: 'Bagong batch', back: '11' }, back: '11', body: () => formView(true), actions: () => { const v = U.valid(S().form); return U.btn('Next', 'formNext', 'primary', v.t && v.c ? '' : 'disabled'); } };
  ACT.pickFish = (n) => { S().form.fish = n; save(); rerender(); };
  ACT.editField = (k) => { S().kp = { field: k, val: '', from: window.curScreen() }; save(); go(k === 'target' ? 'KPT' : 'KPI'); };
  ACT.formNext = () => { const v = U.valid(S().form); if (!v.t || !v.c) return go('S10'); go('S09'); };
  function keypadScreen(field) {
    const isT = field === 'target';
    return {
      name: isT ? 'Keypad – target na timbang' : 'Keypad – temperature',
      bar: { title: isT ? 'Target na timbang' : 'Temperature', back: () => go((S().kp || {}).from || '11') }, back: () => go((S().kp || {}).from || '11'),
      body: () => {
        const kp = S().kp || { val: '' }; const n = parseFloat(kp.val);
        const bad = kp.val !== '' && kp.tried && (isT ? !(n > 0 && n < 26.4) : !(n >= 40 && n <= 80));
        return '<div class="field"><label>' + (isT ? 'Target na timbang' : 'Temperature') + '</label><div class="input focus ' + (bad ? 'error' : '') + '"><span style="flex:1;font-size:1.125rem">' + (kp.val ? kp.val : '<span class="ph">0</span>') + '<span class="caret"></span></span><span class="unit">' + (isT ? 'kg' : '°C') + '</span></div>' +
          (bad ? '<div class="err">' + (isT ? 'Dapat mas mababa sa 26.4 kg' : 'Dapat 40–80°C') + '</div>' : '<div class="hint" style="font-size:.875rem">' + (isT ? 'Mas mababa sa 26.4 kg' : '40–80°C') + '</div>') + '</div>' +
          '<button class="blue" style="font-weight:700;margin-top:20px" data-act="kpCancel">Cancel</button>';
      },
      mounted: () => { const v = document.querySelector('#screen .view'); const kp = document.createElement('div'); kp.className = 'keypad b'; kp.innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => '<button data-act="kpKey" data-arg="' + n + '">' + n + '</button>').join('') + '<button data-act="kpKey" data-arg=".">.</button><button data-act="kpKey" data-arg="0">0</button><button class="txt" data-act="kpDel">Delete</button>'; v.insertBefore(kp, v.querySelector('.actions')); },
      actions: () => U.btn('Save', 'kpSave')
    };
  }
  SC.KPT = keypadScreen('target'); SC.KPI = keypadScreen('temp');
  ACT.kpKey = (d) => { const kp = S().kp; if (kp.val.length >= 5) return; if (d === '.' && kp.val.indexOf('.') >= 0) return; if (d === '.' && !kp.val) kp.val = '0'; kp.val += d; kp.tried = false; save(); rerender(); };
  ACT.kpDel = () => { const kp = S().kp; kp.val = kp.val.slice(0, -1); save(); rerender(); };
  ACT.kpCancel = () => go(S().kp.from || '11');
  ACT.kpSave = () => {
    const kp = S().kp; const n = parseFloat(kp.val); const isT = kp.field === 'target';
    if (kp.val === '') return go(kp.from || '11');
    if (isT ? !(n > 0 && n < 26.4) : !(n >= 40 && n <= 80)) { kp.tried = true; save(); rerender(); return; }
    S().form[kp.field] = n; save();
    const v = U.valid(S().form); go(kp.from === 'S10' && !(v.t && v.c) ? 'S10' : '11');
  };

  /* ================= S09 Confirm ================= */
  SC.S09 = {
    name: 'S09_Kumpirmahin', bar: { title: 'Kumpirmahin', back: '11' }, back: '11',
    keys: { F: () => { S().failStart = true; save(); toast('Papalya ang susunod na start', 'info'); } },
    body: () => {
      const f = S().form; const row = (icon, l, v) => '<div class="card listrow" style="padding:8px 12px"><span class="blue">' + ic(icon, 22) + '</span><span class="grow muted">' + l + '</span><b style="color:var(--navy)">' + v + '</b></div>';
      return '<div class="stack" style="gap:8px">' + row('fish', 'Isda', U.fishName(f.fish)) + row('scale', 'Unang timbang', '26.4 kg') + row('scale', 'Target na timbang', f.target + ' kg') + row('thermometer', 'Temperature', f.temp + '°C') + row(S().power === 'none' ? 'battery' : 'plug', 'Pinagmulan ng init', S().power === 'none' ? 'Biomass' : 'Kuryente') + '</div>' +
        (!MC.reading().ok ? '<div class="mt12">' + U.banner('danger', 'circle-alert', 'Walang temperature reading', 'Hindi bubukas ang heater hangga\'t sira ang sensor.') + '</div>' : '');
    },
    actions: () => U.btn('START DRYING', 'confirmStart') + U.btn('Edit', ':11', 'secondary')
  };
  ACT.confirmStart = () => {
    const s = S();
    if (s.failStart) { s.failStart = false; save(); return go('S16'); }
    if (s.scenario === 'shared') return go('SB36');
    if (isOn()) return go('S08');
    go('ST_KINUKUHA');
  };
  SC.ST_KINUKUHA = {
    name: 'State_Kinukuha ang data', bar: { title: 'Sinisimulan' }, nav: 'dash', transient: true, back: null,
    body: () => '<div style="height:150px"></div><div class="spinner" style="margin:0 auto"></div><div class="h2 center mt24">Binabasa ang mga sensor…</div>',
    after: [1500, () => { H.startBatch(H.me()); if (S().scenario === 'shared') { S().lock = null; save(); return go('SB20'); } go('06'); }]
  };
  SC.S16 = { name: 'S16_Hindi nasimulan', bar: { brand: true }, back: 'S09', body: () => U.hero('circle-alert', { tone: 'danger', white: true }) + '<div class="h2 center mt16">Hindi nasimulan</div><div class="p muted center mt8">Hindi sumagot ang makina. Tingnan ang pinto at koneksyon.</div>', actions: () => U.btn('Try again', ':S09') };
  SC.S08 = {
    name: 'S08_May batch na', bar: { brand: true }, back: () => go(H.homeId()),
    body: () => { const bb = b() || { fish: 'Galunggong', starter: 'Mang Jun' }; return U.hero('fish', { white: true }) + '<div class="h2 center mt16">May batch na tumatakbo</div><div class="card mt16 listrow" style="padding:16px"><span class="blue">' + ic('fish', 28) + '</span><span class="grow"><b class="h3">' + U.fishName(bb.fish) + '</b><div class="small muted mt4">Sinimulan ni ' + bb.starter + '</div></span></div>'; },
    actions: () => U.btn('Monitor', 'toMonitor') + U.btn('Back', 'goHome', 'secondary')
  };

  /* ================= Stop (sheet) ================= */
  SC.ST_IHINTO = {
    name: 'State_Ihinto ang batch', sheet: () => {
      const bb = b(); if (!bb) return '';
      return '<div class="stack"><div class="h1">Ihinto ang batch?</div><p class="p muted">' + U.fishName(bb.fish) + ' • ' + H.kg(M.weight(bb)) + ' kg • ' + H.dur(bb.h) + ' • ni ' + bb.starter + '</p>' +
        U.banner('info', 'fish', '', 'Alisin ang isda bago magsimula ng bagong batch.') + U.btn('YES, STOP', 'doStop', 'dangerfill') + U.btn('No', 'close', 'secondary') + '</div>';
    }
  };
  ACT.doStop = () => {
    window.closeOverlay(); if (!b()) return;
    const rec = H.stopBatch(H.me(), 'Inihinto ng user');
    if (S().scenario === 'shared') return window.SB.afterStop(rec);
    go('S13');
  };
  SC.S13 = {
    name: 'S13_Naihinto ang batch', bar: { brand: true }, back: () => go(H.homeId()),
    body: () => { const r = S().lastStopped || { fish: 'Galunggong', initial: 26.4, final: 21.8, hours: 4.08 }; return U.hero('pause-circle', { white: true, tone: 'danger' }) + '<div class="h2 center mt16">Naihinto ang batch</div><div class="card mt16 stack" style="padding:16px;gap:8px"><b class="h3">' + U.fishName(r.fish) + '</b><div class="kv"><span class="muted">Timbang</span><b>' + H.kg(r.initial) + ' → ' + H.kg(r.final) + ' kg</b></div><div class="kv"><span class="muted">Oras</span><b>' + H.dur(r.hours) + '</b></div></div>'; },
    actions: () => U.btn('View records', 'stoppedRec') + U.btn('Home', 'goHome', 'secondary')
  };
  ACT.stoppedRec = () => { S().viewRec = (S().lastStopped || {}).id; save(); go('25'); };

  /* ================= 15 Monitor ================= */
  function heatChip(bb, withSupply) {
    const st = M.status(bb);
    const icon = bb.mode === 'Biomass' ? 'flame' : bb.mode === 'Solar' ? 'sun' : S().power === 'none' ? 'battery' : 'plug';
    return U.chip(st === 'Umiinit' ? icon : st === 'Max temp' ? 'thermometer' : 'pause', '<span class="' + (st === 'Umiinit' ? 'pulse' : '') + '">' + st + (withSupply ? ' • ' + U.modeLabel(M.supply()) : '') + '</span>', st === 'Umiinit' ? 'blue' : 'danger');
  }
  U.heatChip = heatChip;
  function metrics(bb) {
    const r = MC.reading();
    return '<div class="grid2">' + U.metric('thermometer', 'Chamber', U.tempVal(), r.ok ? '°C · max 80' + (MC.live() ? '' : ' · <span style="color:#b26a00;font-weight:700">SIM</span>') : '<span class="dangerc">' + r.err + '</span>', false, !r.ok || r.limit ? 'bad' : r.warn ? 'warnm' : '') + U.metric('droplets', 'Halumigmig', M.hum(bb), '%') + U.metric('scale', 'Timbang', H.kg(M.weight(bb)), 'kg') + U.metric('clock', 'Natitirang oras', H.durStack(M.remaining(bb)), '', true) + '</div>';
  }
  U.metrics = metrics;
  function progressCard(bb) {
    return '<div class="card"><div class="row" style="justify-content:space-between"><span class="muted">' + H.kg(bb.initial) + ' kg</span><b style="color:var(--navy)">' + H.kg(bb.target) + ' kg</b></div><div class="mt8">' + U.bar(M.pct(bb)) + '</div><div class="blue mt8">' + M.pct(bb) + '% na</div></div>';
  }
  U.progressCard = progressCard;
  SC['15'] = {
    name: '15_Subaybayan_Kuryente', bar: { title: 'Subaybayan', back: () => go(H.homeId()) }, nav: 'dash', live: true, back: () => go(H.homeId()),
    keys: { L: () => { S().connected = false; save(); go('S04'); }, H: 'S05', D: 'S06', E: 'S07', X: 'S18' },
    enter: () => { if (!isOn()) go(H.homeId(), { replace: true }); },
    body: () => {
      const bb = b(); if (!bb) return '';
      return '<div class="row" style="justify-content:space-between;align-items:flex-start"><div><div class="h2">' + U.fishName(bb.fish) + '</div><div class="small muted mt4">Sinimulan ni ' + bb.starter + ' · ' + H.dur(bb.h) + '</div></div>' + heatChip(bb) + '</div>' +
        offlineBanner() + powerBanner() + U.tempAlert() + '<div class="mt12">' + metrics(bb) + '</div><div class="mt8">' + progressCard(bb) + '</div>' +
        '<div class="grid2 mt8"><button class="card soft tap" data-go="15A" style="height:64px;display:flex;align-items:center;justify-content:center;gap:8px"><span class="blue">' + ic('chart-line', 20) + '</span><b class="blue">Grap</b></button>' +
        '<button class="card soft tap" data-act="supplyTap" style="height:64px;display:flex;align-items:center;justify-content:center;gap:8px"><span class="blue">' + ic('plug-zap', 20) + '</span><b class="blue">Suplay</b></button></div>';
    },
    actions: () => U.btn('Stop', 'askStop', 'danger')
  };
  ACT.supplyTap = () => {
    const bb = b();
    if (bb && bb.active && S().power === 'grid' && M.stage(bb) === 3) return H.powerCut(true); // Figma: Power at stage 3 = demo outage
    if (S().power === 'none') return go('18');
    window.openOverlay('SUPPLY');
  };
  SC.SUPPLY = {
    name: 'Suplay ng kuryente', sheet: () => '<div class="stack"><div class="h2">Suplay ng kuryente</div>' +
      '<div class="card flat listrow"><span class="blue">' + ic(U.supplyIcon(M.supply()), 24) + '</span><span class="grow">Pinagmulan</span><b>' + U.modeLabel(M.supply()) + '</b></div>' +
      '<div class="card flat listrow"><span class="blue">' + ic('battery', 24) + '</span><span class="grow">Baterya</span><b>' + Math.round(S().battery) + '%</b></div>' +
      '<div class="card flat listrow"><span class="blue">' + ic('thermometer', 24) + '</span><span class="grow">Max ng heater</span><b>80°C</b></div>' + U.btn('Close', 'close', 'secondary') + '</div>'
  };
  SC['15A'] = {
    name: '15A_Grap ng timbang', bar: { title: 'Timbang', back: () => go(H.monitorId()) }, nav: 'dash', live: true, back: () => go(H.monitorId()),
    body: () => {
      const bb = b(); if (!bb) return '<div class="p muted center mt24">Walang batch na tumatakbo.</div>';
      const d = M.dur(bb);
      return heatChip(bb, true) + '<div class="card mt12 listrow" style="padding:16px"><div class="grow"><div class="big">' + H.kg(M.weight(bb)) + ' kg</div><div class="p muted mt4">' + H.dur(bb.h) + ' · ni ' + bb.starter + '</div></div><span class="blue">' + ic('scale', 40, '', 1.4) + '</span></div>' +
        '<div class="card mt12" style="padding:16px"><div class="h3">Timbang (kg)</div><div class="mt8">' + U.graph({ initial: bb.initial, target: bb.target, dur: d, h: bb.h, xlabels: [0, Math.round(d / 3), Math.round(2 * d / 3), Math.round(d)] }) + '</div></div>' +
        '<div class="mt12">' + progressCard(bb) + '</div><p class="p muted mt12">Target ' + H.kg(bb.target) + ' kg · mga ' + H.dur(M.remaining(bb)) + ' pa</p>';
    }
  };

  /* ================= 16 Alerts ================= */
  U.notifItem = (n) => '<div class="notif ' + (n.unread ? 'unread t-' + (n.tone === 'critical' ? 'critical' : n.tone === 'warning' || n.tone === 'warn' ? 'warning' : 'info') : '') + '" data-act="openNotif" data-arg="' + n.id + '" style="cursor:pointer"><span class="ico">' + ic(n.icon || 'bell', 24) + '</span><div style="flex:1;min-width:0"><div class="t">' + H.esc(n.title) + '</div><div class="d">' + H.esc(n.desc) + '</div><div class="w">' + H.ago(n.at) + '</div></div>' + (n.unread ? '<span class="u"></span>' : '') + '</div>';
  SC['16'] = {
    name: '16_Abiso', bar: () => ({ title: 'Abiso', back: () => go(H.homeId()) }), nav: 'abiso', live: true, back: () => go(H.homeId()),
    keys: { N: 'S14', P: 'S17' },
    enter: () => { if (S().notifAllowed === null && !S().askedNotif) { S().askedNotif = true; save(); go('S17', { replace: true }); } },
    body: () => {
      const list = S().notifs.slice(0, 5); const un = S().notifs.filter((n) => n.unread).length;
      if (!S().notifs.length) return '<div class="p muted center mt24">Walang abiso.</div>';
      return '<div class="row" style="justify-content:space-between">' + U.chip('bell', un ? un + ' bago' : 'Nabasa lahat', un ? 'blue' : '') + (un ? '<button class="link" style="width:auto;padding:0" data-act="readAll">Mark all read</button>' : '') + '</div>' +
        '<div class="legend mt8"><span><i class="lg-c"></i>Kritikal</span><span><i class="lg-w"></i>Kailangang pansinin</span><span><i class="lg-r"></i>Nabasa na</span></div>' +
        '<div class="stack mt12" style="gap:10px">' + list.map(U.notifItem).join('') + '</div>' +
        (S().notifAllowed === false ? '<div class="mt12">' + U.banner('warn', 'bell-off', 'Naka-off ang abiso', 'I-on para makatanggap ng babala.', ':S17') + '</div>' : '');
    },
    actions: () => (S().notifs.length > 5 ? U.btn('Older alerts', ':16A', 'secondary') : '')
  };
  SC['16A'] = {
    name: '16A_Lumang abiso', bar: () => ({ title: 'Lumang abiso', back: '16' }), nav: 'abiso', back: '16',
    body: () => '<div class="stack" style="gap:8px">' + S().notifs.slice(5, 11).map(U.notifItem).join('') + '</div>',
    actions: () => U.btn('Back to new alerts', ':16', 'secondary')
  };
  ACT.openNotif = (id) => { const n = S().notifs.find((x) => x.id === id); if (!n) return; n.unread = false; save(); if (n.go && !n.seed) go(n.go); else rerender(); };
  ACT.readAll = () => { S().notifs.forEach((n) => (n.unread = false)); save(); rerender(); };
  SC.S14 = { name: 'S14_Walang bagong abiso', bar: { brand: true }, back: () => go(H.homeId()), body: () => U.hero('bell-off', { white: true }) + '<div class="h2 center mt16">Walang bagong abiso</div>', actions: () => U.btn('Back', 'goHome') };
  SC.S17 = { name: 'S17_Payagan ang abiso', bar: { brand: true }, back: () => go(H.homeId()), body: () => U.hero('bell-ring', { white: true }) + '<div class="h2 center mt16">Payagan ang abiso?</div><div class="p muted center mt8">Mababalitaan ka tungkol sa init, kuryente, at kapag tuyo na ang isda.</div>', actions: () => U.btn('Allow', 'notifYes') + U.btn('Not now', 'notifNo', 'secondary') };
  ACT.notifYes = () => { S().notifAllowed = true; S().askedNotif = true; save(); toast('Naka-on ang abiso', 'bell'); go(S().tutorialSeen ? '16' : 'S12_1'); };
  ACT.notifNo = () => { S().notifAllowed = false; S().askedNotif = true; save(); go(S().tutorialSeen ? '16' : 'S12_1'); };

  /* ================= 17 Cooling ================= */
  SC['17'] = {
    name: '17_Nagpapalamig', bar: { title: 'Nagpapalamig', back: '16' }, nav: 'abiso', back: '16', live: true,
    enter: () => { if (S().batch && !S().batch.active && S().lastDone) later(5000, () => { if (window.curScreen() === '17') go('24'); }); },
    body: () => U.hero('wind', {}) + '<div class="mt12">' + U.chip('thermometer', 'Mainit · ' + U.tempVal() + '°C', 'danger') + '</div><div class="h1 mt12">Palamigin muna.</div><p class="p mt8">Mga 20 minuto bago ligtas hawakan.</p>' +
      '<div class="mt12">' + U.banner('warn', 'hand', 'Huwag munang hawakan', 'Alisin lang ang isda kapag malamig na.') + '</div>',
    actions: () => U.btn('Back to alerts', ':16')
  };

  /* ================= 18–23 Power outage ================= */
  function batCard() {
    return '<div class="card mt16" style="padding:16px"><div class="listrow" style="min-height:32px"><span class="blue">' + ic(S().battery <= S().settings.batWarn ? 'battery-low' : 'battery', 22) + '</span><span class="grow muted">Baterya</span><b>' + Math.round(S().battery) + '%</b></div>' +
      '<div class="row mt12" style="justify-content:space-between;align-items:flex-end"><div><div class="big">' + (b() ? H.kg(M.weight(b())) : '26.4') + ' kg</div><div class="muted mt4">Timbang</div></div><div style="text-align:right"><div class="big">' + U.tempVal() + '°C</div><div class="muted mt4">Chamber</div></div></div></div>';
  }
  U.batCard = batCard;
  SC['18'] = {
    name: '18_Nawalan ng kuryente', bar: { title: 'Kuryente', back: () => go(H.monitorId()) }, live: true, back: () => go(H.monitorId()),
    body: () => U.hero('unplug', {}) + '<div class="mt12">' + U.chip('plug-zap', 'Walang kuryente', 'danger') + '</div><div class="h1 mt12">Nawalan ng kuryente</div><p class="p mt8">Huminto ang pag-init. Baterya muna ang gamit.</p>' + batCard(),
    actions: () => U.btn('Next', ':19')
  };
  SC['19'] = {
    name: '19_Ituloy ang pagpapatuyo?', base: '18', scrimClose: false,
    sheet: () => '<div class="stack"><div class="h1" style="font-size:1.5rem">Ituloy ang pagpapatuyo?</div><p class="p">Gamitin ang init ng <b>araw (solar)</b> o <b>biomass</b>. Kung hindi, ihihinto ang batch at ise-save sa Rekord.</p>' + U.btn('YES, CONTINUE', 'bioYes') + U.btn('NO, STOP', 'bioNo', 'secondary') + '</div>'
  };
  ACT.bioYes = () => { window.closeOverlay(); S().decision = 'continue'; save(); go('ALT'); };
  ACT.bioNo = () => {
    window.closeOverlay(); S().decision = 'stop';
    const rec = H.stopBatch(H.me(), 'Nawalan ng kuryente'); if (!rec) return go(H.homeId());
    if (S().scenario === 'shared') { S().waiting = { kind: 'stopped', rec: rec }; save(); go('SB46'); }
    else { S().viewRec = rec.id; save(); go('25'); }
    setTimeout(() => toast('Naihinto ang batch · naka-save sa Rekord', 'pause', 3200), 120);
  };
  SC.ALT = {
    name: 'ALT_Pumili ng init', bar: { title: 'Ituloy ang pagpapatuyo', back: '18' }, back: '18', live: true,
    body: () => {
      const opt = (k, icon, title, desc, tag) => '<button class="card tap" data-act="pickAlt" data-arg="' + k + '" style="width:100%;text-align:left;padding:16px;display:flex;gap:14px;align-items:center"><span style="width:52px;height:52px;border-radius:16px;background:var(--pale);display:flex;align-items:center;justify-content:center;flex:none" class="' + (k === 'Solar' ? 'warnc' : 'dangerc') + '">' + ic(icon, 30) + '</span><span style="flex:1"><b class="h3" style="display:block">' + title + '</b><span class="p muted small" style="display:block;margin-top:4px">' + desc + '</span><span class="chip mt8" style="height:24px;font-size:.6875rem">' + tag + '</span></span><span class="blue">' + ic('chevron-right', 22) + '</span></button>';
      return '<div class="h1">Pumili ng pagkukunan ng init</div><div class="stack mt16" style="gap:12px">' + opt('Solar', 'sun', 'Solar', 'Init ng araw sa salamin.', 'Kapag maaraw lang') + opt('Biomass', 'flame', 'Biomass', 'Panggatong sa fire chamber.', 'Gumagana sa gabi') + '</div>' +
        '<div class="card soft mt16 listrow"><span class="blue">' + ic('battery', 22) + '</span><span class="grow small">Baterya ang gamit sa monitoring (' + Math.round(S().battery) + '%).</span></div>';
    }
  };
  const PREP = {
    Solar: ['Ilagay ang makina sa buong araw', 'Punasan ang salamin', 'Alisin ang takip ng salamin', 'Isara ang pinto', 'Tingnan kung umaandar ang fan'],
    Biomass: ['Ihanda ang tuyong panggatong (kahoy o ipa)', 'Sindihan ang apoy sa chamber', 'Ikabit ang fire chamber', 'Buksan ang singawan ng hangin', 'Magsuot ng gloves; alisin ang madaling masunog']
  };
  ACT.pickAlt = (k) => { S().altMode = k; S().prep = PREP[k].map(() => false); save(); go(k === 'Solar' ? 'ALT_SOLAR' : '20'); };
  function prepScreen(kind) {
    return {
      name: kind === 'Solar' ? 'ALT_Solar checklist' : '20_Biomass checklist',
      bar: { title: kind === 'Solar' ? 'Ihanda ang solar' : 'Ihanda ang biomass', back: 'ALT' }, back: 'ALT',
      enter: () => { if (!S().prep || S().prep.length !== PREP[kind].length || S().altMode !== kind) { S().altMode = kind; S().prep = PREP[kind].map(() => false); save(); } },
      body: () => {
        const p = S().prep || []; const done = p.filter(Boolean).length; const n = PREP[kind].length;
        return '<div class="row" style="justify-content:space-between"><b style="color:var(--navy)">' + done + ' sa ' + n + ' tapos</b><span class="small muted">Tapusin lahat para magsimula</span></div><div class="mt8">' + U.bar(done / n * 100) + '</div>' +
          '<div class="stack mt12" style="gap:10px">' + PREP[kind].map((t, i) => '<div class="card tap listrow" data-act="prepTick" data-arg="' + i + '" style="padding:10px 12px;min-height:56px;' + (p[i] ? 'border-color:var(--blue);background:var(--pale)' : '') + '"><span class="' + (p[i] ? 'blue' : 'muted') + '">' + ic(p[i] ? 'square-check' : 'square', 26) + '</span><b class="grow" style="color:var(--text);font-weight:600">' + t + '</b></div>').join('') + '</div>' +
          '<div class="mt12">' + (kind === 'Solar' ? U.banner('info', 'cloud-rain', '', 'Kapag natakpan ng ulap ang araw, sasabihan kang lumipat sa biomass.') : U.banner('warn', 'shield-alert', '', 'Huwag iwanang walang bantay ang apoy.')) + '</div>';
      },
      actions: () => { const p = S().prep || []; const ok = p.length && p.every((x) => x); return U.btn(ok ? 'START' : 'Finish the checklist', 'altReady', 'primary', ok ? '' : 'disabled'); }
    };
  }
  SC['20'] = prepScreen('Biomass'); SC.ALT_SOLAR = prepScreen('Solar');
  ACT.prepTick = (i) => { const p = S().prep; p[+i] = !p[+i]; save(); rerender(); };
  ACT.altReady = () => {
    const bb = b(); if (!bb) return go(H.homeId());
    const kind = window.curScreen() === 'ALT_SOLAR' ? 'Solar' : 'Biomass';
    bb.mode = kind; bb.heat = 'on'; bb.bioStart = bb.h; bb.autoDropDone = false; bb.drop = 0; S().prep = null; save();
    MC.send({ cmd: 'heat', on: false }); // electric coil stays off; the machine keeps monitoring
    notify({ icon: kind === 'Solar' ? 'sun' : 'flame', tone: 'info', title: 'Naka-on ang ' + kind, desc: 'Tuloy ang pagpapatuyo. Aabisuhan ka kapag lumamig.', go: '21', cta: 'Monitor' });
    go('21');
  };
  ACT.bioReady = ACT.altReady;
  SC['21'] = {
    name: '21_Subaybayan_Solar/Biomass', bar: { title: 'Subaybayan', back: () => go(H.homeId()) }, nav: 'dash', live: true, back: () => go(H.homeId()),
    enter: () => { if (!isOn()) go(H.homeId(), { replace: true }); },
    body: () => {
      const bb = b(); if (!bb) return '';
      const solar = bb.mode === 'Solar';
      return '<div class="row" style="justify-content:space-between"><div><div class="h2 row" style="gap:6px">' + ic(solar ? 'sun' : 'flame', 22) + (solar ? 'Solar' : 'Biomass') + '</div><div class="small muted mt4">' + U.fishName(bb.fish) + ' • ' + H.dur(bb.h) + '</div></div>' + U.chip('battery', Math.round(S().battery) + '%', S().battery <= S().settings.batWarn ? 'warn' : '') + '</div>' +
        (bb.drop > 3 ? '<div class="mt12">' + U.banner('warn', solar ? 'cloud-rain' : 'thermometer', 'Bumaba ang temperature', solar ? 'Natatakpan ng ulap ang araw.' : 'Dagdagan ang panggatong. Ayusin ang singawan.') + '<div class="mt8">' + (solar ? '<div class="grid2">' + U.btn(bb.refuel ? '<span class="spinner s"></span>' : 'Wait for sun', 'refuel', 'tint', bb.refuel ? 'disabled' : '') + U.btn('Use biomass', 'switchBio', 'secondary') + '</div>' : U.btn(bb.refuel ? '<span class="spinner s"></span> Umiinit…' : 'Fuel added', 'refuel', 'tint', bb.refuel ? 'disabled' : '')) + '</div></div>' : '') +
        U.tempAlert() + '<div class="mt12">' + metrics(bb) + '</div><div class="mt8">' + progressCard(bb) + '</div>';
    }
  };
  ACT.refuel = () => { const bb = b(); if (bb) { bb.refuel = true; save(); rerender(); } };
  ACT.switchBio = () => { S().altMode = 'Biomass'; S().prep = PREP.Biomass.map(() => false); save(); go('20'); };
  SC['22'] = {
    name: '22_Nakahinto ang pag-init', bar: { title: 'Lagay ng batch', back: () => go(H.monitorId()) }, nav: 'dash', back: () => go(H.monitorId()),
    body: () => U.hero('pause-circle', { size: 'm' }) + '<div class="h1 mt12">Nakahinto ang pag-init</div><p class="p mt8">Tuloy ang monitoring.</p><div class="mt12">' + U.banner('warn', 'hand', 'Mainit ang makina', 'Palamigin bago hawakan.') + '</div>',
    actions: () => U.btn('Back to monitor', 'toMonitor')
  };
  SC['23'] = {
    name: '23_Bumalik ang kuryente', bar: { title: 'Kuryente', back: () => go(H.monitorId()) }, back: () => go(H.monitorId()),
    body: () => U.hero('plug-zap', {}) + '<div class="mt12">' + U.chip('plug', 'May kuryente', 'ok') + '</div><div class="h1 mt12">Bumalik ang kuryente</div><p class="p mt8">Ibalik sa kuryente ang pag-init?</p>',
    actions: () => U.btn('YES, USE ELECTRIC', 'useGrid') + U.btn('Not yet', 'notYetGrid', 'secondary')
  };
  ACT.useGrid = () => { const bb = b(); if (bb) { bb.mode = 'Electric'; bb.heat = 'on'; bb.drop = 0; MC.send({ cmd: 'start', setpoint: bb.temp }); } save(); toast('Kuryente na ulit ang gamit', 'plug'); go(bb ? H.monitorId() : H.homeId()); };
  ACT.notYetGrid = () => go(H.monitorId());

  /* ================= 24 Done ================= */
  function doneCard(r, mode) {
    return '<div class="card mt12" style="padding:16px">' + U.chip('circle-check', 'Tapos • ' + mode, 'blue') +
      '<div class="row mt12" style="justify-content:space-between;align-items:flex-start"><div><div class="muted">Simula</div><div class="big mt4">' + H.kg(r.initial) + ' kg</div></div><span class="muted" style="margin-top:2px">' + ic('arrow-right', 20) + '</span><div><div class="muted">Huli</div><div class="big mt4" style="color:var(--blue)">' + H.kg(r.final) + ' kg</div></div></div>' +
      '<div class="kv mt8"><span class="muted">Kabuuang oras</span><b>' + H.dur(r.hours) + '</b></div><div class="kv"><span class="muted">Average na temperature</span><b>' + r.temp + '°C</b></div></div>';
  }
  U.doneCard = doneCard;
  SC['24'] = {
    name: '24_Tuyo na', bar: { title: 'Tapos na', back: () => go(H.homeId()) }, back: () => go(H.homeId()),
    body: () => { const r = S().lastDone || S().history[0]; return U.hero('fish', { size: 's' }) + '<div class="h1 center mt12">Tuyo na ang isda!</div><p class="p center muted mt8">Naabot ang target</p>' + doneCard(r, 'Kuryente') + '<div class="mt12">' + U.banner('info', 'hand', 'Patayin ang makina', 'Palamigin bago alisin ang isda.') + '</div>'; },
    actions: () => U.btn('Save to records', 'saveDone')
  };
  ACT.saveDone = () => { const r = S().lastDone; if (r) H.addRecord(r); S().batch = null; S().viewRec = r && r.id; save(); toast('Naka-save sa Rekord', 'circle-check'); go('25'); };
  SC.ST_TAPOS_BIO = {
    name: 'State_Tapos_Biomass/Solar', bar: { title: 'Tapos na ang batch', back: () => go(H.homeId()) }, back: () => go(H.homeId()),
    body: () => { const r = S().lastDone || S().history[0]; return U.hero('fish', { size: 's' }) + '<div class="h1 center mt12">Tuyo na ang isda!</div><p class="p center muted mt8">Naabot ang target</p>' + doneCard(r, U.modeLabel(r.mode)) + '<div class="mt12">' + U.banner('info', 'hand', 'Palamigin muna', r.mode === 'Solar' ? 'Saka alisin ang isda at takpan ang salamin.' : 'Saka alisin ang isda at linisin ang abo.') + '</div>'; },
    actions: () => U.btn('Done', 'saveDone') + U.btn('View summary', 'saveDoneSummary', 'secondary')
  };
  ACT.saveDoneSummary = () => { const r = S().lastDone; if (r) H.addRecord(r); S().batch = null; S().viewRec = r && r.id; save(); go('26'); };

  /* ================= 25 / 26 Records ================= */
  U.recCard = (r) => '<div class="card tap" data-act="openRec" data-arg="' + r.id + '" style="padding:10px 14px"><div class="row" style="justify-content:space-between"><span class="small muted">' + r.date + '</span><span class="blue">' + ic('chevron-right', 20) + '</span></div>' +
    '<b class="h3" style="display:block;margin-top:4px">' + U.fishName(r.fish) + '</b><div class="h1" style="font-size:1.5rem;margin-top:2px">' + H.kg(r.initial) + ' → ' + H.kg(r.final) + ' kg</div>' +
    '<div class="row mt4" style="justify-content:space-between"><span class="muted">' + H.dur(r.hours) + '</span><span class="blue row" style="gap:4px">' + ic(U.supplyIcon(r.mode), 18) + U.modeLabel(r.mode) + '</span></div>' +
    '<div class="row mt4" style="justify-content:space-between"><span class="muted">Ni ' + r.starter + '</span>' + (r.status === 'done' ? '<span class="tag-ok">' + ic('check', 16, '', 3) + 'Tapos</span>' : '<span class="tag-danger">! Inihinto</span>') + '</div></div>';
  SC['25'] = {
    name: '25_Rekord', bar: { title: 'Rekord', back: () => go(H.homeId()) }, nav: 'rekord', back: () => go(H.homeId()),
    keys: { R: 'S15', X: 'S18' },
    enter: () => { if (S().noHistory || !S().history.length) go('ST_WALANG_REKORD', { replace: true }); },
    body: () => '<div class="stack" style="gap:8px">' + S().history.map(U.recCard).join('') + '</div><div class="center muted mt12">' + S().history.filter((r) => r.status === 'done').length + ' natapos</div>'
  };
  ACT.openRec = (id) => { S().viewRec = id; save(); const r = S().history.find((x) => x.id === id); go(r && r.status !== 'done' ? 'S13b' : '26'); };
  SC['26'] = {
    name: '26_Buod ng batch', bar: { title: 'Buod', back: '25' }, nav: 'rekord', back: '25',
    body: () => {
      const r = S().history.find((x) => x.id === S().viewRec) || S().history[0]; if (!r) return '';
      return '<div class="row" style="justify-content:space-between"><div><div class="h2">' + U.fishName(r.fish) + '</div><div class="small muted mt4">' + r.date + '</div></div>' + U.chip(U.supplyIcon(r.mode), U.modeLabel(r.mode), 'blue') + '</div>' +
        '<div class="card mt12"><div class="h1">' + H.kg(r.initial) + ' → ' + H.kg(r.final) + ' kg</div><div class="kv mt8"><span class="muted">Oras</span><b>' + H.dur(r.hours) + '</b></div><div class="kv"><span class="muted">Average na temp</span><b>' + r.temp + '°C</b></div><div class="kv"><span class="muted">Sinimulan ni</span><b>' + r.starter + '</b></div>' +
        '<div class="mt8">' + (r.status === 'done' ? '<span class="tag-ok">' + ic('check', 16, '', 3) + 'Naabot ang target</span>' : '<span class="tag-danger">Inihinto</span>') + '</div></div>' +
        '<div class="card mt8"><div class="h3">Timbang (kg)</div><div class="mt8">' + U.graph({ initial: r.initial, target: r.target, dur: r.hours, h: r.hours, full: r.status === 'done', stopAt: r.status === 'done' ? null : r.stopAt, xlabels: [0, 2, 4, Math.round(r.hours)] }) + '</div></div>';
    }
  };
  SC.S13b = {
    name: 'S13b_Rekord – inihinto', bar: { title: 'Rekord', back: '25' }, back: '25',
    body: () => { const r = S().history.find((x) => x.id === S().viewRec) || { fish: 'Galunggong', initial: 26.4, final: 21.8, hours: 4.08 }; return '<div class="card stack" style="padding:16px;gap:8px"><b class="h3">' + U.fishName(r.fish) + '</b><div class="kv"><span class="muted">Timbang</span><b>' + H.kg(r.initial) + ' → ' + H.kg(r.final) + ' kg</b></div><div class="kv"><span class="muted">Oras</span><b>' + H.dur(r.hours) + '</b></div>' + (r.reason ? '<div class="kv"><span class="muted">Dahilan</span><b>' + r.reason + '</b></div>' : '') + '<div><span class="tag-danger">' + ic('circle-alert', 16) + 'Hindi natapos</span></div></div>'; },
    actions: () => U.btn('All records', ':25') + U.btn('Home', 'goHome', 'secondary')
  };
  SC.ST_WALANG_REKORD = {
    name: 'State_Walang rekord', bar: { title: 'Rekord', back: () => go(H.homeId()) }, nav: 'rekord', back: () => go(H.homeId()),
    body: () => '<div style="height:60px"></div>' + U.hero('history', {}) + '<div class="h2 center mt16">Wala pang batch</div><p class="p muted center mt8">Dito lalabas ang mga natapos na batch.</p><div class="mt24">' + U.btn('New batch', 'navNew') + '</div>'
  };
  SC.S15 = { name: 'S15_Walang nakitang rekord', bar: { brand: true }, back: '25', body: () => U.hero('file-search', { white: true }) + '<div class="h2 center mt16">Walang nakitang rekord</div><p class="p muted center mt8">Kumonekta sa makina.</p>', actions: () => U.btn('Connect', ':03') };

  /* ================= Machine states ================= */
  SC.S04 = {
    name: 'S04_Nawala ang koneksyon', bar: { brand: true }, back: () => go('03'), keys: { Escape: '03' },
    body: () => { const bb = b(); return U.hero('wifi-off', { white: true }) + '<div class="h2 center mt16">Nawala ang koneksyon</div><div class="card mt16" style="padding:16px"><div class="muted">Huling reading</div><div class="grid2 mt8" style="grid-template-columns:repeat(3,1fr)"><div><div class="h1">' + (bb ? H.kg(M.weight(bb)) : '21.8') + '</div><div class="muted">kg</div></div><div><div class="h1">' + (MC.t && typeof MC.t.temp === 'number' ? Math.round(MC.t.temp) : '—') + '</div><div class="muted">°C</div></div><div><div class="h1">' + (bb ? H.durShort(bb.h) : '4h 05m') + '</div><div class="muted">oras</div></div></div></div><div class="mt12">' + U.banner('ok', 'shield-check', 'Ligtas na tuloy ang makina', 'Ang makina mismo ang nagbabantay sa 80°C na limit ng heater.') + '</div>'; },
    actions: () => U.btn(ic('refresh', 20) + 'Reconnect', ':CONN')
  };
  function safetyScreen(id, name, icon, tone, title, items, actions, onEnter) {
    SC[id] = { name: name, bar: { brand: true }, back: () => go(H.homeId()), enter: onEnter || null, body: () => U.hero(icon, { white: true, tone: tone, deco: false }) + '<div class="h2 center mt16">' + title + '</div><div class="stack mt24">' + items.map((x) => '<div class="card listrow"><span class="blue">' + ic(x[0], 24) + '</span><span class="grow">' + x[1] + '</span></div>').join('') + '</div>', actions: actions };
  }
  safetyScreen('S05', 'S05_Sobrang init', 'thermometer', 'danger', 'Sobrang init', [['hand', 'Huwag hawakan'], ['thermometer', 'Palamigin muna']], () => U.btn('I UNDERSTAND', ':17') + U.btn('Call', ':27', 'secondary'), () => notify({ icon: 'thermometer', tone: 'critical', title: 'Sobrang init', desc: 'Huwag hawakan ang makina. Palamigin muna.', go: 'S05' }));
  safetyScreen('S06', 'S06_Bukas ang pinto', 'door', 'warn', 'Bukas ang pinto', [['door', 'Isara ang pinto']], () => U.btn('DONE', 'doorClosed'), () => { S().machine.door = 'open'; save(); notify({ icon: 'door', tone: 'warning', title: 'Bukas ang pinto', desc: 'Isara ang pinto para tuloy ang pagpapatuyo.', go: 'S06' }); });
  ACT.doorClosed = () => { S().machine.door = 'closed'; save(); go(isOn() ? H.monitorId() : H.homeId()); };
  safetyScreen('S07', 'S07_Problema sa makina', 'wrench', 'danger', 'Problema sa makina', [['power', 'Patayin ang makina'], ['phone', 'Tawagan ang admin']], () => U.btn('CALL', ':27'), () => notify({ icon: 'wrench', tone: 'critical', title: 'Problema sa makina', desc: 'Patayin ang makina at tawagan ang admin.', go: 'S07' }));
  SC.S18 = { name: 'S18_Tapos na ang session', bar: { brand: true }, back: null, body: () => U.hero('hourglass', { white: true }) + '<div class="h2 center mt16">Tapos na ang session</div><p class="p muted center mt8">Mag-log in ulit. Tuloy ang makina.</p>', actions: () => U.btn('LOG IN', 'relogin') };
  ACT.relogin = () => { S().loggedIn = false; S().pin = ''; save(); go('02'); };
  SC.ST_EMERHENSIYA = {
    name: 'State_Emerhensiya', bar: { title: 'Kaligtasan', back: () => go(H.homeId()) }, back: () => go(H.homeId()),
    body: () => U.hero('octagon-alert', { tone: 'danger' }) + '<div class="h1 mt12">Huminto ang makina</div><div class="card mt16 stack">' + [['wrench', 'Tingnan ang makina'], ['flame', 'Lumayo sa apoy'], ['phone', 'Humingi ng tulong']].map((x) => '<div class="listrow"><span class="blue">' + ic(x[0], 24) + '</span><span class="grow">' + x[1] + '</span></div>').join('') + '</div>',
    actions: () => U.btn('CALL', 'callAdmin2') + U.btn('Safety guide', ':28', 'secondary')
  };
  ACT.callAdmin2 = () => toast('Tinatawagan ang admin…', 'phone');
  SC.ST_BATERYA = {
    name: 'State_Mahina ang baterya', bar: { title: 'Baterya', back: () => go(H.homeId()) }, nav: 'abiso', back: () => go(H.homeId()),
    body: () => U.hero('battery-low', { tone: 'warn' }) + '<div class="h1 mt12">Mahina ang baterya</div><div class="huge mt12" style="color:#b26a00">' + Math.round(S().battery) + '%</div><div class="card mt16 stack"><div class="listrow"><span class="blue">' + ic('plug', 24) + '</span><span class="grow">Tingnan ang kuryente</span></div><div class="listrow"><span class="dangerc">' + ic('hand', 24) + '</span><span class="grow">Huwag hawakan ang mainit na makina</span></div></div>',
    actions: () => U.btn('OK', 'batOk')
  };
  ACT.batOk = () => go(isOn() ? H.monitorId() : H.homeId());

  /* ================= S12 Tutorial ================= */
  const TUT = [['dash', 'house', 'Home', 'Lagay ng makina at temperature.'], ['new', 'plus', 'Bagong Batch', 'Dito magsimula ng pagpapatuyo.'], ['abiso', 'bell', 'Abiso', 'Mga babala at balita.'], ['rekord', 'history', 'Rekord', 'Mga nakaraang batch.']];
  [1, 2, 3, 4].forEach((n) => {
    const t = TUT[n - 1];
    SC['S12_' + n] = {
      name: 'S12_Tutorial ' + n + ' – ' + t[2], bar: { brand: true }, nav: 'dash', back: n > 1 ? 'S12_' + (n - 1) : '05',
      body: () => SC['05'].body(),
      mounted: () => {
        const scr = document.getElementById('screen'); const navBtn = scr.querySelector('.bnav [data-nav="' + t[0] + '"]');
        const r = navBtn.getBoundingClientRect(), sr = scr.getBoundingClientRect(), sc = sr.width / scr.offsetWidth;
        const sp = document.createElement('div'); sp.className = 'spot';
        sp.innerHTML = '<div class="shade"></div><div class="ring2" style="left:' + ((r.left - sr.left) / sc - 2) + 'px;top:' + ((r.top - sr.top) / sc - 2) + 'px;width:' + (r.width / sc + 4) + 'px;height:' + (r.height / sc + 4) + 'px"></div>' +
          '<button data-act="tutNext" style="position:absolute;left:' + ((r.left - sr.left) / sc) + 'px;top:' + ((r.top - sr.top) / sc) + 'px;width:' + (r.width / sc) + 'px;height:' + (r.height / sc) + 'px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;color:var(--blue);font-size:11px;font-weight:700;padding-bottom:8px">' + ic(t[1], 24) + '<span>' + t[2].replace(' ', '<br>') + '</span></button>' +
          '<div class="tip">' + U.hero(t[1], { size: 'm', deco: false }) + '<div class="h2 mt12">' + t[2] + '</div><div class="blue mt8">Hakbang ' + n + ' sa 4</div><p class="p mt16">' + t[3] + '</p><div class="mt24">' + U.btn(n === 4 ? 'GET STARTED' : 'Next', 'tutNext') + '</div><div class="grid2 mt12">' + U.btn('Back', 'tutBack', 'secondary') + U.btn('Skip', 'tutSkip', 'ghost') + '</div></div>';
        scr.querySelector('.view').appendChild(sp);
      }
    };
  });
  ACT.tutNext = () => { const n = +window.curScreen().split('_')[1]; if (n >= 4) return ACT.tutSkip(); go('S12_' + (n + 1), { replace: true }); };
  ACT.tutBack = () => { const n = +window.curScreen().split('_')[1]; go(n > 1 ? 'S12_' + (n - 1) : H.homeId(), { replace: true }); };
  ACT.tutSkip = () => { S().tutorialSeen = true; save(); go(H.homeId()); };

  /* ================= 27–30 Help, Guide, Settings, More ================= */
  SC['27'] = {
    name: '27_Tulong', bar: { title: 'Tulong', back: '30' }, nav: 'more', back: '30',
    body: () => '<div class="stack" style="gap:12px">' + [['fish', 'Magsimula ng batch', 'startTut'], ['unplug', 'Pag nawalan ng kuryente', 'helpPower'], ['flame', 'Paggamit ng biomass', ':28'], ['thermometer', 'Limit ng temperature', 'helpTemp'], ['shield-check', 'Kaligtasan', ':28']].map((x) => '<div class="card tap listrow" ' + (x[2][0] === ':' ? 'data-go="' + x[2].slice(1) + '"' : 'data-act="' + x[2] + '"') + ' style="padding:12px"><span style="width:40px;height:40px;border-radius:12px;background:var(--pale);display:flex;align-items:center;justify-content:center" class="blue">' + ic(x[0], 24) + '</span><b class="grow" style="color:var(--text)">' + x[1] + '</b><span class="muted">' + ic('chevron-right', 20) + '</span></div>').join('') +
      U.btn(ic('phone', 20) + 'Call admin', 'callAdmin2', 'secondary') + '</div>'
  };
  ACT.helpPower = () => window.openOverlay('HELP_POWER');
  ACT.helpTemp = () => window.openOverlay('HELP_TEMP');
  const steps = (title, list) => '<div class="stack"><div class="h2">' + title + '</div>' + list.map((t, i) => '<div class="step"><span class="n" style="width:32px;height:32px;border-radius:16px;font-weight:800">' + (i + 1) + '</span><p class="p">' + t + '</p></div>').join('') + U.btn('Close', 'close', 'secondary') + '</div>';
  SC.HELP_POWER = { name: 'Tulong – walang kuryente', sheet: () => steps('Pag nawalan ng kuryente', ['Hihinto ang pag-init; tuloy ang monitoring gamit ang baterya.', 'Buksan ang abiso at piliin kung itutuloy o ihihinto.', 'Para ituloy, pumili ng solar o biomass at tapusin ang checklist.', 'Pagbalik ng kuryente, puwede kang bumalik sa kuryente.']) };
  SC.HELP_TEMP = { name: 'Tulong – limit ng temperature', sheet: () => steps('Limit ng temperature', ['Binabasa ng makina ang temperature ng chamber kada segundo.', 'Sa 80°C, kusang pinapatay ng makina ang heater.', 'Puwedeng bumukas ulit ang heater pag bumaba sa 75°C.', 'Kapag sira ang sensor, naka-off ang heater.']) };
  SC['28'] = {
    name: '28_Gabay sa biomass at kaligtasan', bar: { title: 'Gabay sa biomass', back: '27' }, nav: 'more', back: '27',
    body: () => '<div class="stack" style="gap:12px">' + [['flame-kindling', 'Ihanda ang panggatong'], ['flame', 'Sindihan ang apoy'], ['box', 'Ikabit ang fire chamber']].map((x, i) => '<div class="step" style="align-items:center"><span class="n">' + ic(x[0], 28) + '</span><b style="color:var(--text)">' + (i + 1) + '. ' + x[1] + '</b></div>').join('') + '</div>' +
      '<div class="mt12">' + U.banner('info', 'shield-check', 'Magsuot ng gloves', 'Ilayo ang madaling masunog. Palamigin bago linisin ang abo.') + '</div>'
  };
  SC['29'] = {
    name: '29_Ayos', bar: { title: 'Ayos', back: '30' }, nav: 'more', back: '30',
    body: () => {
      const st = S().settings;
      return '<div class="card"><b style="color:var(--navy)">Laki ng letra</b><div class="row mt8" style="gap:4px">' + [['s', 'Maliit'], ['m', 'Katamtaman'], ['l', 'Malaki']].map((x) => '<button class="btn ' + (st.font === x[0] ? 'primary' : 'tint') + '" style="height:48px;font-size:.875rem" data-act="setFont" data-arg="' + x[0] + '">' + x[1] + '</button>').join('') + '</div></div>' +
        '<div class="card mt12 listrow" style="min-height:56px"><b class="grow" style="color:var(--navy)">Tunog / vibrate</b><button data-act="toggleSound" aria-label="Sound" style="width:52px;height:32px;border-radius:16px;background:' + (st.sound ? 'var(--blue)' : 'var(--auth)') + ';position:relative"><span style="position:absolute;top:4px;left:' + (st.sound ? '24px' : '4px') + ';width:24px;height:24px;border-radius:12px;background:#fff;transition:left .15s"></span></button></div>' +
        '<div class="card mt12 listrow tap" data-act="cycleBat" style="min-height:48px"><span class="grow">Abiso pag mahina ang baterya</span><b class="blue" style="font-size:1.25rem">' + st.batWarn + '%</b></div>' +
        '<div class="card mt12 listrow tap" data-act="editOp"><span class="blue">' + ic('user', 24) + '</span><span class="grow">Operator<div class="blue small">' + H.esc(H.me()) + '</div></span><b>›</b></div>' +
        '<div class="card mt12 listrow tap" data-act="openConnSet"><span class="blue">' + ic(MC.online() ? H.connIcon() : 'wifi-off', 24) + '</span><span class="grow">Koneksyon<div class="small ' + (MC.online() ? 'okc' : 'dangerc') + '">' + S().machineId + ' • ' + (MC.online() ? 'Nakakonekta' : 'Offline') + '</div></span><b>›</b></div>' +
        '<div class="card mt12 listrow tap" data-act="about"><span class="blue">' + ic('info', 24) + '</span><span class="grow">Tungkol sa app</span><b>›</b></div>';
    }
  };
  ACT.setFont = (f) => { S().settings.font = f; save(); window.applyFont(); rerender(); };
  ACT.toggleSound = () => { S().settings.sound = !S().settings.sound; save(); rerender(); };
  ACT.cycleBat = () => { const v = [15, 20, 30]; const st = S().settings; st.batWarn = v[(v.indexOf(st.batWarn) + 1) % v.length]; save(); rerender(); };
  ACT.about = () => window.openOverlay('ABOUT');
  ACT.editOp = () => window.openOverlay('SB48');
  SC.ABOUT = { name: 'Tungkol sa app', sheet: () => '<div class="stack center"><img src="assets/img/logo-192.png" alt="AGAP" style="width:88px;height:88px;border-radius:50%;margin:0 auto"><div class="h2">AGAP</div><p class="p muted">Tuyo ang isda, umulan man o umaraw.<br>Prototype para sa usability test · v2.1</p><p class="small muted">Makina ' + S().machineId + ' · max ng heater 80°C</p>' + U.btn('Close', 'close', 'secondary') + '</div>' };
  SC['30'] = {
    name: '30_Iba pa', bar: { title: 'Iba pa', back: () => go(H.homeId()) }, nav: 'more', back: () => go(H.homeId()),
    body: () => '<div class="stack" style="gap:12px">' + [['help', 'Tulong', ':27'], ['settings', 'Ayos', ':29'], ['log-out', 'Mag-log out', 'askLogout']].map((x) => '<div class="card tap listrow" ' + (x[2][0] === ':' ? 'data-go="' + x[2].slice(1) + '"' : 'data-act="' + x[2] + '"') + ' style="min-height:64px"><span class="' + (x[0] === 'log-out' ? 'dangerc' : 'blue') + '">' + ic(x[0], 24) + '</span><span class="grow p">' + x[1] + '</span><span class="muted">' + ic('chevron-right', 20) + '</span></div>').join('') + '</div>'
  };
  ACT.askLogout = () => window.openOverlay('L09');
  SC.L09 = { name: 'L09_Mag-log out?', base: '30', sheet: () => '<div class="stack"><div class="h1">Mag-log out?</div><p class="p muted">Tuloy ang makina.</p>' + U.btn('YES, LOG OUT', 'doLogout') + U.btn('No', 'close', 'secondary') + '</div>' };
  ACT.doLogout = () => { window.closeOverlay(); const s = S(); s.loggedIn = false; s.remember = false; s.pin = ''; save(); go('L01'); };
})();
