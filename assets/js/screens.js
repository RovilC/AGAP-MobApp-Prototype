/* AGAP prototype – main ("orihinal na daloy") screens, named after the Figma frames */
(function () {
  'use strict';
  const SC = window.SCREENS, ACT = window.ACT, H = window.H, M = window.M;
  const S = () => window.S;

  /* ---------- UI helpers ---------- */
  const U = (window.U = {});
  U.hero = (icon, o) => { o = o || {}; const sz = o.size === 'm' ? 48 : o.size === 's' ? 34 : 80; return '<div class="hero ' + (o.size || '') + (o.white ? ' white' : '') + '"><div class="disc ' + (o.tone || '') + '">' + (o.deco === false ? '' : '<i class="sun"></i><i class="moon"></i>') + ic(icon, sz, '', o.size === 's' ? 1.6 : 1.4) + '</div></div>'; };
  U.btn = (label, a, kind, extra) => { const attr = a && a.indexOf(':') === 0 ? 'data-go="' + a.slice(1) + '"' : 'data-act="' + a + '"'; return '<button class="btn ' + (kind || 'primary') + '" ' + attr + ' ' + (extra || '') + '>' + label + '</button>'; };
  U.chip = (icon, text, cls) => '<span class="chip ' + (cls || '') + '">' + (icon ? ic(icon, 18) : '') + text + '</span>';
  U.metric = (icon, label, val, unit, sm) => '<div class="metric"><div class="lbl">' + ic(icon, 18) + label + '</div><div class="val ' + (sm ? 'sm' : '') + '">' + val + '</div>' + (unit ? '<div class="unit">' + unit + '</div>' : '') + '</div>';
  U.bar = (pct) => '<div class="bar"><i style="width:' + Math.max(0, Math.min(100, pct)) + '%"></i></div>';
  U.ring = (pct) => { const r = 32, c = 2 * Math.PI * r; return '<div class="ring"><svg width="76" height="76" viewBox="0 0 76 76"><circle cx="38" cy="38" r="' + r + '" fill="none" stroke="#bbdefb" stroke-width="8"/><circle cx="38" cy="38" r="' + r + '" fill="none" stroke="#0b5ed7" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + (c * (1 - pct / 100)).toFixed(1) + '" style="transition:stroke-dashoffset .6s"/></svg><b>' + pct + '%</b></div>'; };
  U.banner = (tone, icon, title, desc, act) => '<div class="banner ' + tone + (act ? ' tap' : '') + '" ' + (act ? (act[0] === ':' ? 'data-go="' + act.slice(1) + '"' : 'data-act="' + act + '"') : '') + '><span style="color:' + (tone === 'danger' ? 'var(--danger)' : tone === 'warn' ? '#b26a00' : tone === 'ok' ? 'var(--ok)' : 'var(--blue)') + '">' + ic(icon, 24) + '</span><div style="flex:1"><div class="t">' + title + '</div>' + (desc ? '<div class="p mt4">' + desc + '</div>' : '') + '</div>' + (act ? '<span class="blue" style="align-self:center">' + ic('chevron-right', 20) + '</span>' : '') + '</div>';
  U.check = (on, label, act, arg) => '<div class="check ' + (on ? 'on' : '') + '" data-act="' + act + '" data-arg="' + (arg || '') + '"><span class="box">' + (on ? ic('check', 16, '', 3) : '') + '</span><span>' + label + '</span></div>';
  U.supplyIcon = (mode) => (mode === 'Biomass' ? 'flame' : mode === 'Solar' || mode === 'Araw' ? 'sun' : mode === 'Baterya' ? 'battery' : 'plug');
  U.modeLabel = (mode) => (mode === 'Biomass' ? 'Biomass' : mode === 'Solar' ? 'Araw (Solar)' : 'Kuryente');

  U.graph = (o) => { // o: {initial,target,dur,h,full}
    const W = 250, Hh = 146, x0 = 0, y0 = 6, y1 = 136;
    const yOf = (w) => y0 + (o.initial - w) / (o.initial - o.target) * (y1 - y0);
    const pts = []; const end = o.full ? 1 : Math.min(1, o.h / o.dur);
    const N = 40;
    for (let i = 0; i <= N; i++) { const p = end * i / N; const w = o.initial - (o.initial - o.target) * M.lossShare(p) * (o.stopShare != null ? 1 : 1); pts.push([x0 + p * (W - 12), yOf(w)]); }
    if (o.stopAt != null) { // stopped record: cut curve where it stopped
      pts.length = 0; for (let i = 0; i <= N; i++) { const p = o.stopAt * i / N; pts.push([p * (W - 12), yOf(o.initial - (o.initial - o.target) * M.lossShare(p))]); }
    }
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const last = pts[pts.length - 1];
    const mid = (o.initial + o.target) / 2;
    const xl = o.xlabels || [0, 2, 4, Math.round(o.dur)];
    return '<div class="row" style="align-items:stretch;gap:8px"><div style="width:38px;display:flex;flex-direction:column;justify-content:space-between;height:146px;font-size:.8125rem;color:var(--text2)"><span>' + H.kg(o.initial) + '</span><span>' + H.kg(mid) + '</span><span>' + H.kg(o.target) + '</span></div>' +
      '<svg class="graph" viewBox="0 0 ' + W + ' ' + Hh + '" preserveAspectRatio="none" style="flex:1;height:146px"><line x1="0" x2="' + W + '" y1="6.5" y2="6.5" stroke="#cddef4"/><line x1="0" x2="' + W + '" y1="71" y2="71" stroke="#cddef4"/><line x1="0" x2="' + W + '" y1="136" y2="136" stroke="#cddef4"/>' +
      (pts.length > 1 && end > 0.002 ? '<path d="' + d + '" fill="none" stroke="#0b5ed7" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' : '') +
      '<circle cx="' + Math.max(6, last[0]).toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="5" fill="#0b5ed7" stroke="#fff" stroke-width="2"/></svg></div>' +
      '<div class="row" style="justify-content:space-between;padding-left:46px;font-size:.8125rem;color:var(--text2);margin-top:8px">' + xl.map((v, i) => '<span>' + (typeof v === 'number' ? v + (i === xl.length - 1 ? ' oras' : '') : v) + '</span>').join('') + '</div>';
  };

  const b = () => S().batch;
  const isOn = () => b() && b().active;

  /* ---------- greeting card used on dashboards ---------- */
  U.dashCard = (o) => {
    o = o || {};
    const sup = M.supply();
    return '<div class="gradcard"><div class="greet">' + (o.greet || 'Magandang araw' + (S().operator ? ', ' + H.esc(S().operator) : '') + '!') + '</div>' +
      '<div class="line" data-act="tapConn" style="cursor:pointer">' + ic(H.connIcon(), 18) + (o.line || 'AGAP-001 • Nakakonekta') + '</div>' +
      '<div class="chips">' + U.chip(U.supplyIcon(sup), sup, 'dark') + U.chip(S().power === 'none' ? 'battery-low' : 'battery', Math.round(S().battery) + '%', 'dark') + '</div></div>';
  };
  /* ---------- (bago) home cards: machine readiness, backup power, maintenance ---------- */
  U.ready = () => { const m = S().machine || {}; return m.door === 'closed' && m.trays && m.sensors && S().connected; };
  U.homeCards = (running) => {
    const s = S(), m = s.machine || {};
    const row = (ok, icon, label, val) => '<div class="kv" style="min-height:30px"><span class="row" style="gap:8px">' + '<span class="' + (ok ? 'okc' : 'dangerc') + '">' + ic(ok ? 'circle-check' : 'circle-alert', 18) + '</span>' + label + '</span><b class="' + (ok ? '' : 'dangerc') + '">' + val + '</b></div>';
    const ready = U.ready();
    let h = '';
    if (!running) h += '<div class="card mt12"><div class="row" style="justify-content:space-between"><b style="color:var(--navy)">Kahandaan ng makina</b>' + (ready ? U.chip('circle-check', 'Handa', 'ok') : U.chip('circle-alert', 'Hindi pa handa', 'danger')) + '</div><div class="mt8">' +
      row(m.door === 'closed', 'door', 'Pinto', m.door === 'closed' ? 'Nakasara' : 'Bukas') + row(!!m.trays, 'trays', 'Mga tray', m.trays ? 'Pantay' : 'Suriin') + row(!!m.sensors, 'thermometer', 'Sensor ng init at timbang', m.sensors ? 'Gumagana' : 'May problema') +
      '</div><div class="tiny muted mt4">Huling update: ngayon lang</div>' + (m.door !== 'closed' ? '<div class="mt8">' + U.btn('Naisara ko na ang pinto', 'doorFix', 'tint') + '</div>' : '') + '</div>';
    const hrs = Math.max(0, s.battery / 100 * 10);
    const grid = s.power === 'grid';
    h += '<div class="card mt8"><div class="row" style="justify-content:space-between"><b style="color:var(--navy)">Reserbang kuryente</b>' + U.chip(grid ? 'plug' : 'battery-low', grid ? 'Nagcha-charge' : 'Gamit ang baterya', grid ? 'ok' : 'warn') + '</div>' +
      '<div class="row mt8" style="gap:12px"><span class="' + (s.battery <= s.settings.batWarn ? 'dangerc' : 'blue') + '">' + ic(s.battery <= s.settings.batWarn ? 'battery-low' : 'battery', 30) + '</span><div class="grow"><div class="h2">' + Math.round(s.battery) + '%</div><div class="small muted">Kaya pang magbantay nang mga ' + (Math.round(hrs * 2) / 2) + ' oras kung mawalan ng kuryente</div></div></div>' +
      '<div class="mt8">' + U.bar(s.battery) + '</div><div class="tiny muted mt8">' + ic('sun', 14) + ' Solar charging: ' + (grid ? 'naka-standby' : 'bukas kapag may araw') + '</div></div>';
    if (!running) {
      const mt = s.maint || {};
      const items = [['ash', 'flame', 'Linisin ang lalagyan ng abo', 'Pagkatapos ng biomass'], ['glass', 'sun', 'Punasan ang salaming bahagi', 'Para pumasok ang init ng araw'], ['coil', 'wrench', 'Suriin ang heating coil', 'Isang beses kada linggo']];
      const left = items.filter((x) => !mt[x[0]]).length;
      h += '<div class="card mt8"><div class="row" style="justify-content:space-between"><b style="color:var(--navy)">Paalala sa pag-aalaga</b><span class="small ' + (left ? 'warnc' : 'okc') + '" style="font-weight:700">' + (left ? left + ' gagawin' : 'Tapos lahat') + '</span></div>' +
        items.map((x) => '<div class="listrow" style="min-height:52px;border-top:1px solid var(--line);margin-top:6px;padding-top:6px' + (mt[x[0]] ? ';opacity:.55' : '') + '"><span class="blue">' + ic(x[1], 22) + '</span><div class="grow"><div class="p" style="' + (mt[x[0]] ? 'text-decoration:line-through' : '') + '">' + x[2] + '</div><div class="tiny muted">' + (mt[x[0]] ? 'Natapos ngayon' : x[3]) + '</div></div><button class="btn ' + (mt[x[0]] ? 'tint' : 'secondary') + '" style="height:36px;width:auto;padding:0 12px;font-size:.8125rem;border-radius:10px" data-act="maintTick" data-arg="' + x[0] + '">' + (mt[x[0]] ? 'Ibalik' : 'Tapos na') + '</button></div>').join('') + '</div>';
    }
    return h;
  };
  ACT.maintTick = (k) => { S().maint[k] = !S().maint[k]; save(); rerender(); };
  ACT.doorFix = () => { S().machine.door = 'closed'; save(); rerender(); toast('Nakasara na ang pinto', 'door'); };
  ACT.tapConn = () => { S().connected = false; save(); go(isOn() ? 'S04' : S().scenario === 'shared' ? 'ST_WALANG_KONEKSYON' : 'ST_WALANG_KONEKSYON'); };

  /* ================= MODE PICKER (before 00_Simula) ================= */
  SC.MODE = {
    name: '— Pumili ng demo (bago ang 00_Simula)', light: true,
    raw: () => '<div class="view modepick" style="position:absolute;inset:0;display:flex;flex-direction:column">' + '' +
      '<div class="statusbar light"><span>Demo</span><span></span></div>' +
      '<div style="flex:1;overflow:auto;padding:24px 20px;display:flex;flex-direction:column;gap:16px">' +
      '<div class="center"><img src="assets/img/logo-192.png" alt="AGAP" style="width:96px;height:96px;border-radius:50%;background:#fff;box-shadow:0 8px 24px rgba(0,0,0,.25)" data-logo></div>' +
      '<div class="center" style="font-size:2rem;font-weight:800">AGAP</div>' +
      '<div class="center" style="opacity:.9;margin-top:-8px">Interactive na prototype · Pumili ng senaryo</div>' +
      '<button class="opt" data-act="pickMode" data-arg="orig"><span class="pic">' + ic('smartphone', 26) + '</span><span><b class="h3" style="display:block">Orihinal na daloy</b><span class="p muted small">Isang cellphone. Login → ikonekta ang makina → bagong batch → subaybayan → nawalan ng kuryente → biomass → tapos na.</span></span></button>' +
      '<button class="opt" data-act="pickMode" data-arg="shared"><span class="pic">' + ic('users', 26) + '</span><span><b class="h3" style="display:block">Shared Batch</b><span class="p muted small">Maraming cellphone sa iisang makina (SUBAD). May pangalan ng operator, kandado sa paghahanda, at mga kilos ni Ate Lita mula sa ibang cellphone.</span></span></button>' +
      '<div class="small" style="opacity:.85;line-height:1.5;margin-top:4px">Para sa facilitator: pindutin nang matagal ang logo (o <b>`</b> / <b>F2</b>) para sa control panel. Para kontrolin mula sa ibang device, buksan ang <b>controller.html</b> at ilagay ang code:</div>' +
      '<div id="modeRemote" class="center" style="background:rgba(255,255,255,.14);border-radius:12px;padding:10px">' + (window.REMOTE ? window.remoteLine() : 'Remote: hindi available') + '</div>' +
      '</div>' + '<div class="androidnav light"><button></button><button></button><button></button></div></div>'
  };
  ACT.pickMode = (m) => {
    const keep = { settings: S().settings, speed: S().speed };
    const fresh = JSON.parse(JSON.stringify(window.__fresh(m)));
    Object.keys(window.S).forEach((k) => delete window.S[k]);
    Object.assign(window.S, fresh, keep); save();
    go('00');
  };

  /* ================= 00_Simula ================= */
  SC['00'] = {
    name: '00_Simula', light: true,
    raw: () => '<div class="view splash" style="position:absolute;inset:0;display:flex;flex-direction:column">' +
      window.__statusbar(true) +
      '<div style="flex:1;overflow:auto;padding:0 32px">' +
      '<div class="tile"><img src="assets/img/logo-192.png" alt="AGAP logo" data-logo></div>' +
      '<div class="name">AGAP</div><div class="tag">Tuyong isda kahit maulan.</div>' +
      '<div class="stack mt24" style="gap:20px">' +
      '<div class="benefit"><span class="pic">' + ic('shield-check', 34, '', 1.5) + '</span><div><div class="h3" style="color:var(--text)">Protektado ang isda</div><div class="p muted mt4">May gabay sa init at kaligtasan.</div></div></div>' +
      '<div class="benefit"><span class="pic">' + ic('smartphone', 34, '', 1.5) + '</span><div><div class="h3" style="color:var(--text)">Subaybayan sa cellphone</div><div class="p muted mt4">Kita ang timbang at init ng makina.</div></div></div>' +
      '</div><div class="mt24">' + U.btn('Start', 'startApp') + '</div></div>' +
      '<div class="center" style="padding:24px 0 26px;opacity:.95">Gabay sa pagpapatuyo</div>' +
      window.__androidnav(true) + '</div>',
    keys: { Escape: 'MODE' }, back: 'MODE'
  };
  ACT.startApp = () => { const s = S(); s.loggedIn = false; s.connected = false; s.selectedMachine = false; s.loginAttempts = 0; s.pin = ''; save(); go('02'); };

  /* ================= LOGIN (02 + State_Login_01…09) – username + PIN, native number keyboard ================= */
  function pinInput(id, val, shown, ph, err) {
    return '<div class="input ' + (err ? 'error' : '') + '"><input id="' + id + '" type="' + (shown ? 'text' : 'password') + '" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="off" value="' + H.esc(val || '') + '" placeholder="' + (ph || '6 na numero') + '" style="letter-spacing:' + (shown ? '1px' : '4px') + '"></div>';
  }
  U.pinInput = pinInput;
  function loginView(mode) {
    const s = S();
    const first = mode === '02';
    const shown = mode === 'L02';
    const locked = mode === 'L05';
    let h = '<div class="authhero"><div class="lg"><img src="' + LOGO + '" alt="AGAP" data-logo><b>AGAP</b></div>' +
      '<h2>' + (first ? 'Mag-login' : 'Maligayang Pagbabalik!') + '</h2><div class="sub">' + ic('lock', 16) + (first ? 'Para magamit ang makina.' : 'Mag-login sa makina.') + '</div></div>';
    h += '<div class="card mt16" style="padding:20px"><div class="field"><label>Username</label>' +
      '<div class="input ' + (mode === 'L04' ? 'error' : '') + '"><input id="userIn" value="' + H.esc(s.loginUser || '') + '" placeholder="hal. MangJun" autocomplete="username" autocapitalize="none" spellcheck="false"></div></div>' +
      '<div class="field mt16"><label>PIN</label><div style="position:relative">' + pinInput('pinIn', s.pin, shown, '6 na numero', mode === 'L04' || locked) +
      '<button data-act="togglePin" class="blue" style="position:absolute;right:12px;top:0;height:56px;display:flex;gap:6px;align-items:center;font-weight:600">' + ic(shown ? 'eye-off' : 'eye', 20) + (shown ? 'Itago' : 'Ipakita') + '</button></div>' +
      (mode === 'L04' ? '<div class="err">' + ic('circle-alert', 16) + 'Mali ang username o PIN. Subukan muli.</div>' : '') +
      (locked ? '<div class="err">' + ic('lock', 16) + 'Na-lock · Subukan sa <span id="lockLeft">1 minuto</span>.</div>' : '') + '</div>' +
      '<div class="mt8">' + U.check(s.remember, 'Tandaan ako sa cellphone na ito', 'toggleRemember') + '</div></div>';
    return h;
  }
  function loginActions(mode) {
    const reg = U.btn(ic('user', 20) + 'Gumawa ng account', 'toRegister', 'secondary') + '<button class="link" style="padding:4px 0" data-go="L07">Nakalimutan ang PIN?</button>';
    if (mode === 'L06') return '<button class="btn primary disabled" style="background:var(--blue);color:#fff;opacity:.85"><span class="spinner s" style="border-color:rgba(255,255,255,.35);border-top-color:#fff"></span>Sandali lang...</button>' + reg;
    return U.btn('MAG-LOGIN', 'doLogin', 'primary', mode === 'L05' ? 'disabled' : '') + reg;
  }
  const loginKeys = { Escape: () => { S().loginAttempts = 0; save(); go('00'); } };
  function mkLogin(id, name, extra) {
    SC[id] = Object.assign({ name: name, bar: { brand: true }, body: () => loginView(id), actions: () => loginActions(id), keys: loginKeys, back: '00',
      mounted: () => { ['userIn', 'pinIn'].forEach((k) => { const i = document.getElementById(k); if (i) i.addEventListener('keydown', (e) => { if (e.key === 'Enter') ACT.doLogin(); }); }); const p = document.getElementById('pinIn'); if (p) p.addEventListener('input', () => { p.value = p.value.replace(/\D/g, '').slice(0, 6); }); } }, extra || {});
  }
  mkLogin('02', '02_Login');
  mkLogin('L01', 'State_Login_01_Handa');
  mkLogin('L02', 'State_Login_02_Nakikitang_PIN');
  mkLogin('L03', 'State_Login_03 (PIN gamit ang keyboard ng telepono)', { enter: () => setTimeout(() => { const p = document.getElementById('pinIn'); if (p) p.focus(); }, 150) });
  mkLogin('L04', 'State_Login_04_Maling_PIN', { enter: () => { if (S().loginAttempts >= 3) { S().lockUntil = Date.now() + 60000; save(); go('L05', { replace: true }); } } });
  mkLogin('L05', 'State_Login_05_Na_lock', {
    enter: () => {
      if (!S().lockUntil || S().lockUntil < Date.now()) { S().lockUntil = Date.now() + 60000; save(); }
      const iv = setInterval(() => { const el = document.getElementById('lockLeft'); const left = Math.ceil((S().lockUntil - Date.now()) / 1000); if (left <= 0) { clearInterval(iv); S().loginAttempts = 0; S().lockUntil = 0; save(); if (window.curScreen() === 'L05') go('L01', { replace: true }); return; } if (el) el.textContent = left + ' seg'; }, 500);
      SC.L05._iv = iv;
    }, leave: () => clearInterval(SC.L05._iv)
  });
  H.findAccount = (u) => S().accounts.find((a) => a.username.toLowerCase() === String(u || '').trim().toLowerCase());
  mkLogin('L06', 'State_Login_06_Sandali', {
    after: [1300, () => {
      const s = S(); const acc = H.findAccount(s.loginUser);
      if (acc && acc.pin === s.pin) { s.loginAttempts = 0; s.operator = acc.username; s.samahan = acc.samahan; save(); go('L08'); } else { s.loginAttempts++; save(); go('L04'); }
    }]
  });
  mkLogin('L08', 'State_Login_08_Tagumpay', {
    mounted: () => { const t = document.createElement('div'); t.className = 'toast nonav'; t.style.bottom = '170px'; t.innerHTML = ic('circle-check', 22) + '<span>Maligayang pagdating, ' + H.esc(H.me()) + '!</span>'; document.getElementById('screen').appendChild(t); },
    after: [1100, () => { const s = S(); s.loggedIn = true; save(); if (s.scenario === 'shared' && !s.operator) return go('SB14'); go(s.permOK ? '03' : 'S01'); }]
  });
  ACT.noop = () => { };
  function keepLogin() { const u = document.getElementById('userIn'), p = document.getElementById('pinIn'); if (u) S().loginUser = u.value.trim(); if (p) S().pin = p.value.replace(/\D/g, '').slice(0, 6); save(); }
  ACT.togglePin = (a, el, e) => { if (e) e.stopPropagation(); keepLogin(); const c = window.curScreen(); go(c === 'L02' ? 'L01' : 'L02', { replace: true }); };
  ACT.toggleRemember = () => { keepLogin(); S().remember = !S().remember; save(); rerender(); };
  ACT.doLogin = () => {
    keepLogin(); const s = S();
    if (window.curScreen() === 'L05') return;
    if (!s.loginUser) { toast('Ilagay ang username', 'info'); const i = document.getElementById('userIn'); if (i) i.focus(); return; }
    if (s.pin.length !== 6) { toast('Ilagay ang 6 na numero ng PIN', 'info'); const i = document.getElementById('pinIn'); if (i) i.focus(); return; }
    go('L06');
  };
  ACT.toRegister = () => { keepLogin(); S().reg = { username: '', phone: '', samahan: '', pin: '', pin2: '', err: {} }; save(); go('REG'); };
  SC.L07 = {
    name: 'State_Login_07_Nakalimutang_PIN', sheet: () => '<div class="stack"><div class="h2">Nakalimutan ang PIN?</div><p class="p">Ipa-reset ang PIN sa tagapamahala.</p>' + U.btn(ic('phone', 20) + 'Tumawag', 'callAdmin') + U.btn('Isara', 'close', 'secondary') + '</div>',
    keys: { Escape: () => window.closeOverlay() }
  };
  ACT.callAdmin = () => { window.closeOverlay(); toast('Tumatawag sa Tagapamahala…', 'phone'); };

  /* ================= (bago) Gumawa ng account ================= */
  SC.REG = {
    name: '(bago) Gumawa ng account', bar: { title: 'Gumawa ng account', back: 'L01' }, back: 'L01', keys: { Escape: 'L01' },
    body: () => {
      const r = S().reg || (S().reg = { err: {} }); const e = r.err || {};
      const fld = (k, label, inner, hint) => '<div class="field mt16"><label>' + label + '</label>' + inner + (e[k] ? '<div class="err">' + ic('circle-alert', 16) + e[k] + '</div>' : (hint ? '<div class="hint">' + hint + '</div>' : '')) + '</div>';
      const txt = (k, ph, extra) => '<div class="input ' + (e[k] ? 'error' : '') + '"><input id="reg_' + k + '" value="' + H.esc(r[k] || '') + '" placeholder="' + ph + '" ' + (extra || '') + '></div>';
      return '<p class="p muted">Para makapag-login at makita ng samahan kung sino ang gumagamit ng makina.</p>' +
        fld('username', 'Username', txt('username', 'hal. MangJun', 'autocapitalize="none" spellcheck="false" maxlength="20"'), '3–20 letra o numero') +
        fld('phone', 'Numero ng telepono', txt('phone', '09XX XXX XXXX', 'type="tel" inputmode="tel" maxlength="13"'), 'Para sa pag-reset ng PIN') +
        fld('samahan', 'Samahan', txt('samahan', 'hal. SUBAD', 'maxlength="30"'), 'Pangalan ng inyong samahan o kooperatiba') +
        fld('pin', 'PIN', pinInput('reg_pin', r.pin, false, '6 na numero', e.pin), '6 na numero') +
        fld('pin2', 'Ulitin ang PIN', pinInput('reg_pin2', r.pin2, false, '6 na numero', e.pin2), '');
    },
    actions: () => U.btn('GUMAWA NG ACCOUNT', 'doRegister') + '<button class="link" data-go="L01">May account na? Mag-login</button>',
    mounted: () => { ['reg_pin', 'reg_pin2'].forEach((k) => { const p = document.getElementById(k); if (p) p.addEventListener('input', () => { p.value = p.value.replace(/\D/g, '').slice(0, 6); }); }); }
  };
  ACT.doRegister = () => {
    const v = (k) => { const i = document.getElementById('reg_' + k); return i ? i.value.trim() : ''; };
    const r = { username: v('username'), phone: v('phone').replace(/[\s-]/g, ''), samahan: v('samahan'), pin: v('pin'), pin2: v('pin2'), err: {} };
    if (!/^[A-Za-z0-9._ ]{3,20}$/.test(r.username)) r.err.username = 'Gumamit ng 3–20 letra o numero.';
    else if (H.findAccount(r.username)) r.err.username = 'May gumagamit na ng username na ito.';
    if (!/^(09\d{9}|\+639\d{9})$/.test(r.phone)) r.err.phone = 'Hal. 09171234567 (11 numero).';
    if (r.samahan.length < 2) r.err.samahan = 'Ilagay ang pangalan ng samahan.';
    if (!/^\d{6}$/.test(r.pin)) r.err.pin = 'Dapat 6 na numero ang PIN.';
    else if (r.pin2 !== r.pin) r.err.pin2 = 'Hindi magkapareho ang PIN.';
    S().reg = r; save();
    if (Object.keys(r.err).length) { rerender(); const first = document.querySelector('#screen .input.error input'); if (first) first.focus(); return; }
    S().accounts.push({ username: r.username, phone: r.phone, samahan: r.samahan, pin: r.pin });
    S().loginUser = r.username; S().pin = ''; S().reg = null; save();
    go('L01'); setTimeout(() => toast('Nagawa ang account. Mag-login na.', 'circle-check', 3000), 100);
  };

  /* ================= S01 Wi-Fi / Bluetooth at pahintulot ================= */
  SC.S01 = {
    name: 'S01_Bluetooth at pahintulot (Wi-Fi muna)', bar: { brand: true }, back: 'L01', keys: { Escape: 'L01' },
    body: () => { const bt = S().connType === 'bt'; return U.hero(bt ? 'bluetooth-off' : 'wifi-off', { white: true }) + '<div class="h2 center mt16">' + (bt ? 'Naka-off ang Bluetooth' : 'Naka-off ang Wi-Fi') + '</div>' +
      '<div class="stack mt24"><div class="card listrow">' + '<span class="blue">' + ic(bt ? 'bluetooth' : 'wifi', 24) + '</span><span class="grow">' + (bt ? 'I-on ang Bluetooth' : 'I-on ang Wi-Fi') + '</span></div>' +
      '<div class="card listrow"><span class="blue">' + ic('smartphone', 24) + '</span><span class="grow">Payagan ang Nearby devices</span></div></div>'; },
    actions: () => U.btn('BUKSAN ANG AYOS', 'grantPerm')
  };
  ACT.grantPerm = () => { S().permOK = true; save(); go('03'); };

  /* ================= 03 Ikonekta ang makina ================= */
  SC['03'] = {
    name: '03_Ikonekta ang makina', bar: { title: 'Ikonekta ang makina', back: 'L01' }, back: 'L01', keys: { Escape: 'L01' },
    enter: () => { S().selectedMachine = false; S().scanDone = false; save(); later(1600, () => { S().scanDone = true; save(); if (window.curScreen() === '03') rerender(); }); later(20000, () => { if (window.curScreen() === '03' && !S().selectedMachine) go('S03'); }); },
    body: () => {
      const s = S(), bt = s.connType === 'bt';
      return '<div class="seg"><button class="' + (!bt ? 'on' : '') + '" data-act="connType" data-arg="wifi">' + ic('wifi', 18) + 'Wi-Fi</button><button class="' + (bt ? 'on' : '') + '" data-act="connType" data-arg="bt">' + ic('bluetooth', 18) + 'Bluetooth</button></div>' +
        '<div class="mt12">' + U.hero('radar', {}) + '</div>' +
        '<div class="h2 center mt12">Hanapin</div><div class="p muted center mt8">' + (bt ? 'Bluetooth on · lumapit sa makina' : 'Wi-Fi on · nasa network ng makina') + '</div>' +
        (s.scanDone ? '<div class="card mt16 tap listrow" data-act="pickMachine" style="padding:16px"><span class="blue">' + ic(bt ? 'bluetooth' : 'wifi', 30) + '</span><span class="grow"><b class="h3" style="color:var(--text)">AGAP-001</b>' + (bt ? '' : '<div class="tiny muted">AGAP-001-WiFi · Malakas ang signal</div>') + '</span><span class="blue">' + ic(s.selectedMachine ? 'circle-check' : 'circle', 26) + '</span></div>'
          : '<div class="card mt16 listrow" style="padding:16px"><span class="spinner s"></span><span class="grow muted">Naghahanap ng makina…</span></div>') +
        '<div class="mt16">' + U.btn('Ikonekta ang AGAP-001', 'connectGo', 'primary', s.scanDone ? '' : 'disabled') + '</div>' +
        (!bt ? '<div class="tiny muted center mt12">Kung walang Wi-Fi, gamitin ang Bluetooth.</div>' : '');
    },
    actions: () => '<div class="center muted">Piliin ang inyong makina.</div>'
  };
  ACT.connType = (t) => { S().connType = t; save(); rerender(); };
  ACT.pickMachine = () => { S().selectedMachine = !S().selectedMachine; save(); rerender(); };
  ACT.connectGo = () => { S().selectedMachine = true; save(); go('S02'); };

  SC.S02 = {
    name: 'S02_Kumokonekta', bar: { brand: true }, back: '03', keys: { Escape: '03' }, transient: true,
    body: () => '<div style="height:120px"></div><div class="center"><div class="spinner" style="margin:0 auto"></div></div><div class="h2 center mt24">Kumokonekta…</div><div class="p muted center mt8">' + (S().connType === 'bt' ? 'Lumapit sa makina' : 'Manatili sa Wi-Fi ng makina') + '</div>',
    actions: () => U.btn('Kanselahin', ':03', 'secondary'),
    after: [2000, () => { const s = S(); if (s.selectedMachine && !s.failConnect) { s.connected = true; save(); go(s.reconnecting && s.scenario === 'shared' ? 'SB37' : s.reconnecting ? H.homeId() : '04'); s.reconnecting = false; save(); } else { s.connected = false; save(); go('ST_HINDI_MAKAKONEKTA'); } }]
  };
  SC.S03 = {
    name: 'S03_Walang makina', bar: { brand: true }, back: '03', keys: { Escape: '03' },
    body: () => U.hero('radar', { white: true }) + '<div class="h2 center mt16">Walang nakitang makina</div><div class="stack mt24"><div class="card listrow"><span class="blue">' + ic('power', 24) + '</span><span class="grow">Buksan ang makina</span></div><div class="card listrow"><span class="blue">' + ic(H.connIcon(), 24) + '</span><span class="grow">' + (S().connType === 'bt' ? 'Lumapit sa makina' : 'Kumonekta sa Wi-Fi ng makina') + '</span></div></div>',
    actions: () => U.btn('SUBUKAN MULI', ':03') + U.btn('Bumalik', ':03', 'secondary')
  };
  SC.ST_HINDI_MAKAKONEKTA = {
    name: 'State_Hindi makakonekta', bar: { title: 'Koneksyon sa makina', back: '03' }, back: '03', keys: { Escape: '03' },
    body: () => { const bt = S().connType === 'bt'; return U.hero(bt ? 'bluetooth-off' : 'wifi-off', { tone: 'danger' }) + '<div class="mt12">' + U.chip('circle-alert', 'Hindi nakakonekta', 'danger') + '</div><div class="h1 mt12">Hindi makakonekta</div>' +
      '<div class="card mt16 stack"><div class="listrow">' + '<span class="blue">' + ic(bt ? 'bluetooth' : 'wifi', 24) + '</span><span class="grow">' + (bt ? 'Bluetooth' : 'Wi-Fi ng makina (AGAP-001)') + '</span></div><div class="listrow"><span class="blue">' + ic('smartphone', 24) + '</span><span class="grow">Malapit ang cellphone</span></div><div class="listrow"><span class="blue">' + ic('plug', 24) + '</span><span class="grow">Bukas ang AGAP-001</span></div></div>'; },
    actions: () => U.btn('SUBUKAN MULI', ':S02') + U.btn('Bumalik', ':03', 'secondary')
  };

  /* ================= 04 Nakakonekta na ================= */
  SC['04'] = {
    name: '04_Nakakonekta na', bar: { title: 'Koneksyon', back: '03' }, back: '03', keys: { Escape: '03' },
    body: () => U.hero('circle-check', { tone: 'ok' }) + '<div class="h1 center mt12">Nakakonekta</div><div class="p muted center mt8">AGAP-001</div>' +
      '<div class="card mt16" style="padding:16px">' + U.chip(H.connIcon(), H.connLabel(), 'blue') + '<div class="p mt12">AGAP-001 • Nakakonekta' + (S().connType === 'wifi' ? ' sa Wi-Fi ng makina' : '') + '</div></div><div class="mt16">' + U.btn('Pumunta sa Dashboard', 'toDash') + '</div>'
  };
  ACT.toDash = () => { if (S().scenario === 'shared') return go('SB17'); go(H.homeId()); };

  /* ================= 05 / 06 Dashboard ================= */
  SC['05'] = {
    name: '05_Tahanan_Walang Batch', bar: { brand: true }, nav: 'dash', live: true, back: null,
    keys: { X: 'S18' },
    enter: () => { if (!S().connected) go('ST_WALANG_KONEKSYON', { replace: true }); else if (isOn()) go('06', { replace: true }); },
    body: () => {
      const last = S().history[0];
      return U.dashCard() + powerBanner() +
        '<div class="mt12">' + U.btn('+ Bagong Batch', 'navNew', 'primary', U.ready() ? '' : 'disabled') + '</div>' + U.homeCards(false) +
        (last ? '<div class="card soft mt12 tap listrow" data-act="openLast" style="padding:14px 12px"><span class="blue">' + ic('fish', 28) + '</span><span class="grow"><b class="small" style="color:var(--navy)">Huling batch · ' + last.fish + '</b><div class="p mt4">' + H.kg(last.initial) + ' kg → ' + H.kg(last.final) + ' kg</div></span><span class="' + (last.status === 'done' ? 'okc' : 'dangerc') + ' small" style="font-weight:700;align-self:flex-end">' + (last.status === 'done' ? 'Natapos' : 'Hindi natapos') + '</span></div>' : '') +
        '<div class="card soft mt8 tap listrow" data-act="startTut" style="padding:14px 12px"><span class="blue">' + ic('play', 22) + '</span><span class="grow"><b class="h3" style="color:var(--navy)">Paano gamitin</b><div class="p muted mt4">Ulitin ang maikling gabay  →</div></span></div>' +
        '<div class="card soft mt8 listrow" style="padding:8px 12px">' + '<span class="blue">' + ic('hand', 24) + '</span><span class="grow small">Palamigin bago hawakan</span></div>';
    }
  };
  ACT.openLast = () => go('25');
  ACT.startTut = () => go('S12_1');
  function powerBanner() {
    if (S().power === 'grid') return '';
    const bb = b();
    if (bb && bb.active && bb.mode === 'Kuryente') return '<div class="mt12">' + U.banner('danger', 'unplug', 'Walang kuryente', bb.heat === 'stopped' ? 'Nakahinto ang pag-init. Patuloy ang pagsubaybay.' : 'Huminto ang pag-init. Ano ang susunod?', bb.heat === 'stopped' ? null : ':18') + '</div>';
    return '<div class="mt12">' + U.banner('warn', 'unplug', 'Walang kuryente', 'Baterya ang gamit ng makina (' + Math.round(S().battery) + '%).') + '</div>';
  }
  U.powerBanner = powerBanner;

  SC['06'] = {
    name: '06_Tahanan_May Batch', bar: { brand: true }, nav: 'dash', live: true, back: null, hotspot: 'demoCut',
    keys: { H: 'S05', D: 'S06', E: 'S07', X: 'S18' },
    enter: () => { if (!S().connected) go('S04', { replace: true }); else if (!isOn()) go('05', { replace: true }); },
    body: () => {
      const bb = b(); if (!bb) return '';
      const st = M.status(bb);
      return U.dashCard() + powerBanner() +
        '<div class="card mt8 tap listrow" data-act="toMonitor" style="padding:12px">' + U.ring(M.pct(bb)) + '<div class="grow"><div class="p" style="font-weight:700;color:var(--navy)">' + bb.fish + '</div><div class="big" style="font-size:1.875rem">' + H.kg(M.weight(bb)) + ' kg</div><div class="small muted ' + (st === 'Umiinit' ? '' : '') + '">' + H.dur(bb.h) + ' • <span class="' + (st === 'Umiinit' ? 'pulse' : 'dangerc') + '">' + st + '</span></div></div><span class="blue">' + ic('chevron-right', 20) + '</span></div>' +
        '<div class="mini4 mt8">' +
        '<div class="m">' + ic('thermometer', 24) + '<div class="l">Init</div><div class="v">' + M.temp(bb) + '°C</div></div>' +
        '<div class="m">' + ic('droplets', 24) + '<div class="l">Halumigmig</div><div class="v">' + M.hum(bb) + '%</div></div>' +
        '<div class="m">' + ic('clock', 24) + '<div class="l">Natitira</div><div class="v">' + H.durShort(M.remaining(bb)) + '</div></div>' +
        '<div class="m">' + ic('scale', 24) + '<div class="l">Timbang</div><div class="v">' + H.kg(M.weight(bb)) + ' kg</div></div></div>' +
        '<div class="grid2 mt8">' + U.btn('Subaybayan', 'toMonitor') + U.btn('Ihinto', 'askStop', 'danger') + '</div>' +
        U.homeCards(true);
    }
  };
  ACT.toMonitor = () => go(H.monitorId());
  ACT.demoCut = () => { if (isOn() && S().power === 'grid') H.powerCut(true); };
  ACT.askStop = () => window.openOverlay('ST_IHINTO');

  SC.ST_WALANG_KONEKSYON = {
    name: 'State_Tahanan_Walang koneksyon', bar: { title: 'Dashboard', back: '03' }, nav: 'dash', back: '03', keys: { Escape: '03' },
    body: () => {
      const bb = b(); const w = bb ? H.kg(M.weight(bb)) : (S().history[0] ? H.kg(S().history[0].final) : '21.8');
      const d = new Date(Date.now() - 5 * 60000);
      return U.banner('info', H.connIcon() === 'wifi' ? 'wifi-off' : 'bluetooth-off', 'Nawala ang koneksyon · Tuloy pa rin ang makina', '') +
        '<div class="card mt12" style="padding:16px"><div class="h3">Huling nabasang sukat</div><div class="small muted mt8">' + ((d.getHours() % 12) || 12) + ':' + String(d.getMinutes()).padStart(2, '0') + (d.getHours() < 12 ? ' n.u.' : ' n.h.') + ' • 5 minuto na</div><div class="row mt12" style="justify-content:space-between"><span class="big" style="font-size:1.875rem">' + w + ' kg</span><span class="big" style="font-size:1.875rem">' + (bb ? M.temp(bb) : 68) + '°C</span></div></div>' +
        '<div class="mt12">' + U.btn('IKONEKTA MULI', 'reconnect') + '</div>' +
        '<div class="grid2 mt16" style="grid-template-columns:repeat(3,1fr);row-gap:16px">' +
        [['plus', 'Bagong Batch'], ['activity', 'Subaybayan'], ['bell', 'Mga Abiso'], ['history', 'Rekord'], ['help', 'Tulong'], ['settings', 'Mga Ayos']].map((x) => '<div class="center" data-act="offlineTap"><span style="display:inline-flex;width:36px;height:36px;border-radius:18px;background:var(--pale);align-items:center;justify-content:center;color:var(--blue)">' + ic(x[0], 20) + '</span><div class="small" style="font-weight:700;color:var(--navy);margin-top:6px">' + x[1] + '</div></div>').join('') + '</div>';
    }
  };
  ACT.reconnect = () => { S().reconnecting = true; save(); go('03'); };
  ACT.offlineTap = () => toast('Kumonekta muna sa makina', 'info');

  /* ================= S11 Ihanda ang makina ================= */
  function prepView(state) {
    const rows = [
      ['scale', 'Sukatin ang tray', state >= 1 ? 'Tapos' : 'Kasalukuyan…', state >= 1],
      ['fish', 'Ilagay ang isda', state >= 2 ? 'Tapos' : state === 1 ? 'Ilagay at isara' : 'Naghihintay', state >= 2],
      ['plug', S().power === 'none' ? 'Baterya' : 'Kuryente', state >= 3 || state === 9 ? 'Kusang nakita' : 'Naghihintay', state >= 3 || state === 9],
      ['scale', 'Unang timbang', state === 3 ? '26.4 kg' : state === 9 ? 'Walang nakitang timbang' : state === 2 ? 'Kasalukuyan…' : 'Naghihintay', state === 3]
    ];
    const heroTone = state === 9 ? 'danger' : state === 3 ? 'ok' : '';
    return U.hero(state === 9 ? 'triangle-alert' : 'scale', { size: 'm', white: true, tone: heroTone, deco: false }) + '<div class="h2 center mt12">Ihanda ang makina</div><div class="stack mt16" style="gap:8px">' +
      rows.map((r, i) => '<div class="card ' + (i === 1 && state === 1 ? 'tap' : '') + '" ' + (i === 1 && state === 1 ? 'data-act="fishIn"' : '') + ' style="padding:12px;min-height:84px' + (i === 3 && state === 9 ? ';border-color:var(--danger)' : '') + '"><div class="row" style="align-items:flex-start"><span class="' + (r[3] ? 'okc' : 'blue') + '">' + ic(r[0], 22) + '</span><div class="grow" style="flex:1"><b style="color:var(--navy)">' + r[1] + '</b><div class="p mt12 ' + (i === 3 && state === 9 ? 'dangerc' : '') + '">' + r[2] + (r[2] === 'Kasalukuyan…' ? ' <span class="spinner s" style="display:inline-block;vertical-align:middle;margin-left:6px;width:16px;height:16px;border-width:2px"></span>' : '') + '</div></div>' +
        (r[3] ? '<span class="okc">' + ic('circle-check', 26) + '</span>' : (i === 1 && state === 1) ? '<span class="btn primary" style="height:36px;width:auto;padding:0 12px;font-size:.8125rem;border-radius:10px">Nailagay na</span>' : '<span style="color:var(--line)">' + ic('circle', 26) + '</span>') + '</div></div>').join('') + '</div>';
  }
  const prepBase = { bar: { brand: true }, back: () => go(H.homeId()), keys: { E: 'S11e', Escape: () => go(H.homeId()) } };
  SC.S11a = Object.assign({ name: 'S11_Ihanda_Sinusukat', transient: true, body: () => prepView(0), actions: () => U.btn('Magpatuloy', 'noop', 'primary', 'disabled'), after: [1800, () => go('S11b', { replace: true })] }, prepBase);
  SC.S11b = Object.assign({ name: 'S11_Ihanda_Ilagay ang isda', transient: true, body: () => prepView(1), actions: () => U.btn('Magpatuloy', 'noop', 'primary', 'disabled'), after: [3500, () => go('S11c', { replace: true })] }, prepBase);
  ACT.fishIn = () => go('S11c', { replace: true });
  SC.S11c = Object.assign({ name: 'S11_Ihanda_Kinukuha ang timbang', transient: true, body: () => prepView(2), actions: () => U.btn('Magpatuloy', 'noop', 'primary', 'disabled'), after: [1600, () => { if (S().power === 'none' && !S().allowBattery) return go('ST_KULANG_KURYENTE'); go('S11d', { replace: true }); }] }, prepBase);
  SC.S11d = Object.assign({ name: 'S11_Ihanda_Handa', body: () => prepView(3), actions: () => U.btn('Magpatuloy', 'prepDone') }, prepBase);
  SC.S11e = Object.assign({ name: 'S11_Ihanda_May mali', body: () => prepView(9), actions: () => U.btn('SUBUKAN MULI', ':S11c') }, prepBase);
  ACT.prepDone = () => { const s = S(); s.form = { fish: 'Galunggong', target: 17.2, temp: 68 }; save(); go(s.scenario === 'shared' ? '11' : '11'); };

  SC.ST_KULANG_KURYENTE = {
    name: 'State_Hindi sapat ang kuryente', bar: { title: 'Suplay ng makina', back: () => go(H.homeId()) }, back: () => go(H.homeId()),
    body: () => U.hero('plug-zap', {}) + '<div class="mt12">' + U.chip('triangle-alert', 'Kulang ang suplay', 'warn') + '</div><div class="h1 mt12">Kulang ang kuryente</div>' +
      '<div class="card mt16 stack"><div class="listrow"><span class="blue">' + ic('plug', 24) + '</span><span class="grow">Suriin ang suplay</span></div><div class="listrow"><span class="dangerc">' + ic('flame', 24) + '</span><span class="grow">Huwag ipilit ang init</span></div></div>',
    actions: () => U.btn('SURIIN MULI', 'recheckPower') + U.btn('Bumalik', 'goHome', 'secondary')
  };
  ACT.recheckPower = () => { if (S().power === 'grid') go('S11c'); else toast('Wala pa ring kuryente', 'unplug'); };
  ACT.goHome = () => go(H.homeId());

  /* ================= 11 Bagong Batch ================= */
  function fishTile(name) { const on = (S().form || {}).fish === name; return '<button class="card tap" data-act="pickFish" data-arg="' + name + '" style="flex:1;min-width:0;padding:12px 4px;height:88px;display:flex;flex-direction:column;align-items:center;gap:8px;position:relative;' + (on ? 'border-color:var(--blue);background:var(--pale)' : '') + '"><span class="blue">' + ic('fish', 32) + '</span><b class="small" style="color:var(--navy)">' + name + '</b>' + (on ? '<span class="blue" style="position:absolute;right:8px;top:6px">' + ic('check', 14, '', 3) + '</span>' : '') + '</button>'; }
  U.valid = (f) => ({ t: f.target > 0 && f.target < 26.4, c: f.temp >= 40 && f.temp <= 80 });
  function formView(showErr) {
    const f = S().form || (S().form = { fish: 'Galunggong', target: 17.2, temp: 68 });
    const v = U.valid(f);
    const errT = showErr && !v.t, errC = showErr && !v.c;
    return '<div class="card soft" style="padding:10px 12px"><div class="tiny muted">Unang timbang</div><div class="p" style="font-weight:700;color:var(--navy);margin-top:4px">26.4 kg · ' + (S().power === 'none' ? 'Baterya' : 'Kuryente') + '</div></div>' +
      (showErr ? '<div class="mt12">' + U.banner('danger', 'circle-alert', 'May maling halaga', 'Unang timbang: 26.4 kg') + '</div>' : '') +
      '<div class="h3 mt16">Pumili ng isda</div><div class="row mt8" style="gap:8px">' + fishTile('Galunggong') + fishTile('Dilis') + fishTile('Iba pa') + '</div>' +
      '<div class="field mt16"><label>Target timbang</label><div class="input ' + (errT ? 'error' : '') + '" data-act="editField" data-arg="target"><span style="flex:1">' + f.target + '</span><span class="unit">kg</span>' + (errT ? '<span class="dangerc">' + ic('triangle-alert', 22) + '</span>' : '') + '</div>' + (errT ? '<div class="err">Dapat mas mababa sa 26.4 kg</div>' : '<div class="hint">0 &lt; target &lt; unang timbang (26.4 kg)</div>') + '</div>' +
      '<div class="field mt16"><label>Init</label><div class="input ' + (errC ? 'error' : '') + '" data-act="editField" data-arg="temp"><span style="flex:1">' + f.temp + '</span><span class="unit">°C</span>' + (errC ? '<span class="dangerc">' + ic('triangle-alert', 22) + '</span>' : '') + '</div>' + (errC ? '<div class="err">Dapat 40 hanggang 80°C</div>' : '<div class="hint">40–80°C · Mungkahi: 70°C</div>') + '</div>' +
      '<div class="card soft mt16 listrow" style="padding:8px 12px"><span class="blue">' + ic('shield-check', 24) + '</span><span class="grow small">Isara ang pinto. Pantayin ang tray.</span></div>';
  }
  SC['11'] = {
    name: '11_Bagong Batch_Numero', bar: { title: 'Bagong Batch', back: () => go(H.homeId()) }, back: () => go(H.homeId()),
    keys: { A: () => go('S08'), V: () => { S().form = Object.assign({}, S().form, { target: 30, temp: 85 }); save(); go('S10'); }, X: 'S18' },
    body: () => formView(false),
    actions: () => U.btn('Susunod', 'formNext')
  };
  SC.S10 = {
    name: 'S10_Bagong Batch_Maling halaga', bar: { title: 'Bagong Batch', back: '11' }, back: '11',
    body: () => formView(true),
    actions: () => { const v = U.valid(S().form); return U.btn('Susunod', 'formNext', 'primary', v.t && v.c ? '' : 'disabled'); }
  };
  ACT.pickFish = (n) => { S().form.fish = n; save(); rerender(); };
  ACT.editField = (k) => { S().kp = { field: k, val: '', from: window.curScreen() }; save(); go(k === 'target' ? 'KPT' : 'KPI'); };
  ACT.formNext = () => { const v = U.valid(S().form); if (!v.t || !v.c) return go('S10'); go('S09'); };

  function keypadScreen(field) {
    const isT = field === 'target';
    return {
      name: isT ? 'State_Bagong Batch_Keypad_Timbang' : 'State_Bagong Batch_Keypad_Init',
      bar: { title: isT ? 'Target timbang' : 'Init', back: () => go((S().kp || {}).from || '11') }, back: () => go((S().kp || {}).from || '11'),
      body: () => {
        const kp = S().kp || { val: '' }; const n = parseFloat(kp.val);
        const bad = kp.val !== '' && kp.tried && (isT ? !(n > 0 && n < 26.4) : !(n >= 40 && n <= 80));
        return '<div class="h1">Ilagay ang bagong halaga</div><div class="p muted mt8">Gamitin ang keypad sa ibaba.</div>' +
          '<div class="field mt16"><label>' + (isT ? 'Target timbang' : 'Init') + '</label><div class="input focus ' + (bad ? 'error' : '') + '"><span style="flex:1;font-size:1.125rem">' + (kp.val ? kp.val : '<span class="ph">0</span>') + '<span class="caret"></span></span><span class="unit">' + (isT ? 'kg' : '°C') + '</span></div>' +
          (bad ? '<div class="err">' + (isT ? 'Dapat mas mababa sa 26.4 kg' : 'Dapat 40 hanggang 80°C') + '</div>' : '<div class="hint" style="font-size:.875rem">' + (isT ? '0 &lt; target &lt; 26.4 kg' : '40–80°C · Mungkahi: 70°C') + '</div>') + '</div>' +
          '<button class="blue" style="font-weight:700;margin-top:20px" data-act="kpCancel">Kanselahin</button>';
      },
      mounted: () => {
        const v = document.querySelector('#screen .view'); const kp = document.createElement('div'); kp.className = 'keypad b';
        kp.innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => '<button data-act="kpKey" data-arg="' + n + '">' + n + '</button>').join('') + '<button data-act="kpKey" data-arg=".">.</button><button data-act="kpKey" data-arg="0">0</button><button class="txt" data-act="kpDel">Burahin</button>';
        v.insertBefore(kp, v.querySelector('.actions'));
      },
      actions: () => U.btn('I-save', 'kpSave')
    };
  }
  SC.KPT = keypadScreen('target');
  SC.KPI = keypadScreen('temp');
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

  /* ================= S09 Kumpirmahin ================= */
  SC.S09 = {
    name: 'S09_Kumpirmahin', bar: { brand: true }, back: '11',
    keys: { F: () => { S().failStart = true; save(); toast('Susunod na KUMPIRMA: mabibigo', 'info'); } },
    body: () => {
      const f = S().form;
      const row = (icon, l, v) => '<div class="card listrow" style="padding:8px 12px"><span class="blue">' + ic(icon, 22) + '</span><span class="grow muted">' + l + '</span><b style="color:var(--navy)">' + v + '</b></div>';
      return U.hero('circle-check', { size: 'm', white: true, tone: 'ok', deco: false }) + '<div class="h2 center mt12">Kumpirmahin</div><div class="stack mt16" style="gap:8px">' +
        row('fish', 'Isda', f.fish) + row('scale', 'Unang timbang', '26.4 kg') + row('scale', 'Target timbang', f.target + '  kg') + row('thermometer', 'Init', f.temp + '  °C') + row(S().power === 'none' ? 'battery' : 'plug', S().power === 'none' ? 'Baterya' : 'Kuryente', S().power === 'none' ? 'Biomass' : 'Kuryente') + '</div>';
    },
    actions: () => U.btn('KUMPIRMA', 'confirmStart') + U.btn('AYUSIN', ':11', 'secondary')
  };
  ACT.confirmStart = () => {
    const s = S();
    if (s.failStart) { s.failStart = false; save(); return go('S16'); }
    if (s.scenario === 'shared') return go('SB36');
    if (isOn()) return go('S08');
    go('ST_KINUKUHA');
  };
  SC.ST_KINUKUHA = {
    name: 'State_Kinukuha ang mga sukat', bar: { title: 'Subaybayan' }, nav: 'dash', transient: true, back: null,
    body: () => '<div style="height:150px"></div><div class="spinner" style="margin:0 auto"></div><div class="h2 center mt24">Kinukuha ang sukat…</div>',
    after: [1500, () => { H.startBatch(H.me()); if (S().scenario === 'shared') { S().lock = null; save(); return go('SB20'); } go('06'); }]
  };
  SC.S16 = {
    name: 'S16_Hindi nasimulan', bar: { brand: true }, back: 'S09',
    body: () => U.hero('circle-alert', { tone: 'danger', white: true }) + '<div class="h2 center mt16">Hindi nasimulan</div><div class="p muted center mt8">Hindi tumugon ang makina. Suriin ang pinto at koneksyon.</div>',
    actions: () => U.btn('SUBUKAN MULI', ':S09')
  };
  SC.S08 = {
    name: 'S08_May batch na', bar: { brand: true }, back: () => go(H.homeId()),
    body: () => { const bb = b() || { fish: 'Galunggong', starter: 'Mang Jun' }; return U.hero('fish', { white: true }) + '<div class="h2 center mt16">May tumatakbo nang batch</div><div class="card mt16 listrow" style="padding:16px"><span class="blue">' + ic('fish', 28) + '</span><span class="grow"><b class="h3">' + bb.fish + '</b><div class="small muted mt4">Sinimulan ni ' + bb.starter + '</div></span></div>'; },
    actions: () => U.btn('SUBAYBAYAN', 'toMonitor') + U.btn('Bumalik', 'goHome', 'secondary')
  };

  /* ================= Ihinto (overlay) ================= */
  SC.ST_IHINTO = {
    name: 'State_Ihinto ang Batch_Tanong', sheet: () => {
      const bb = b(); if (!bb) return '';
      return '<div class="stack"><span style="width:14px;height:14px;border-radius:3px;background:var(--danger);display:block"></span><div class="h1">Ihinto ang batch ni ' + bb.starter + '?</div><p class="p">' + bb.fish + ' • ' + H.kg(M.weight(bb)) + ' kg kasalukuyan • ' + H.dur(bb.h) + ' na tumatakbo • Sinimulan ni ' + bb.starter + '</p>' +
        U.banner('info', 'battery-low', '', 'Alisin ang isda bago magsimula ng bagong batch.').replace('<div class="t"></div><div class="p mt4">', '<div class="p">') + U.btn('OO, IHINTO', 'doStop') + U.btn('HINDI', 'close', 'secondary') + '</div>';
    }
  };
  ACT.doStop = () => {
    const bb = b(); window.closeOverlay(); if (!bb) return;
    const rec = { id: 'h' + Date.now(), date: H.today(), fish: bb.fish, initial: bb.initial, final: +H.kg(M.weight(bb)), target: bb.target, hours: bb.h, mode: bb.mode, starter: bb.starter, status: 'stopped', temp: bb.temp, stopAt: M.p(bb), stoppedBy: H.me() };
    S().batch = null; S().lastStopped = rec; H.addRecord(rec); save();
    if (S().scenario === 'shared') return SB.afterStop(rec);
    go('S13');
  };
  SC.S13 = {
    name: 'S13_Naihinto ang batch', bar: { brand: true }, back: () => go('05'),
    body: () => { const r = S().lastStopped || { fish: 'Galunggong', initial: 26.4, final: 21.8, hours: 4.08 }; return U.hero('pause-circle', { white: true, tone: 'danger' }) + '<div class="h2 center mt16">Naihinto ang batch</div><div class="card mt16 stack" style="padding:16px;gap:8px"><b class="h3">' + r.fish + '</b><div class="kv"><span class="muted">Timbang</span><b>' + H.kg(r.initial) + ' kg → ' + H.kg(r.final) + ' kg</b></div><div class="kv"><span class="muted">Tagal</span><b>' + H.dur(r.hours) + '</b></div></div>'; },
    actions: () => U.btn('TINGNAN ANG REKORD', 'stoppedRec') + U.btn('BUMALIK', ':05', 'secondary')
  };
  ACT.stoppedRec = () => { S().viewRec = (S().lastStopped || {}).id; save(); go('25'); };

  /* ================= 15 Subaybayan (Kuryente) ================= */
  function heatChip(bb, withSupply) {
    const st = M.status(bb);
    const icon = bb.mode === 'Biomass' ? 'flame' : bb.mode === 'Solar' ? 'sun' : S().power === 'none' ? 'battery' : 'plug';
    return U.chip(st === 'Umiinit' ? icon : 'pause', '<span class="' + (st === 'Umiinit' ? 'pulse' : '') + '">' + st + (withSupply ? ' • ' + M.supply() : '') + '</span>', st === 'Umiinit' ? 'blue' : 'danger');
  }
  U.heatChip = heatChip;
  function metrics(bb, big) {
    return '<div class="grid2">' + U.metric('thermometer', 'Init', M.temp(bb), '°C') + U.metric('droplets', 'Halumigmig', M.hum(bb), '%') + U.metric('scale', big ? 'Kasalukuyang Timbang' : 'Timbang', H.kg(M.weight(bb)), 'kg') + U.metric('clock', big ? 'Natitirang Oras' : 'Natitira', H.durStack(M.remaining(bb)), big ? 'tantiyang tagal' : '', true) + '</div>';
  }
  U.metrics = metrics;
  function progressCard(bb, txt) {
    return '<div class="card"><div class="row" style="justify-content:space-between"><span class="muted">' + H.kg(bb.initial) + ' kg</span><b style="color:var(--navy)">' + H.kg(bb.target) + ' kg</b></div><div class="mt8">' + U.bar(M.pct(bb)) + '</div><div class="blue mt8">' + M.pct(bb) + '% ' + (txt || 'nabawas') + '</div></div>';
  }
  U.progressCard = progressCard;
  SC['15'] = {
    name: '15_Subaybayan_Kuryente', bar: { title: 'Subaybayan', back: '06' }, nav: 'dash', live: true, back: '06',
    keys: { L: () => { S().connected = false; save(); go('S04'); }, H: 'S05', D: 'S06', E: 'S07', X: 'S18' },
    enter: () => { if (!isOn()) go(H.homeId(), { replace: true }); },
    body: () => {
      const bb = b(); if (!bb) return '';
      return '<div class="row" style="justify-content:space-between;align-items:flex-start"><div><div class="h2">' + bb.fish + '</div><div class="small muted mt4">Sinimulan ni ' + bb.starter + ' · ' + H.dur(bb.h) + '</div></div>' + heatChip(bb) + '</div>' +
        powerBanner() + '<div class="mt12">' + metrics(bb) + '</div><div class="mt8">' + progressCard(bb) + '</div>' +
        '<div class="grid2 mt8"><button class="card soft tap" data-go="15A" style="height:72px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px"><span class="blue">' + ic('chart-line', 20) + '</span><b class="blue">Grap</b></button>' +
        '<button class="card soft tap" data-act="supplyTap" style="height:72px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px"><span class="blue">' + ic('plug-zap', 20) + '</span><b class="blue">Suplay</b></button></div>';
    },
    actions: () => U.btn('Ihinto', 'askStop', 'danger')
  };
  ACT.supplyTap = () => {
    const bb = b();
    if (bb && bb.active && S().power === 'grid' && M.stage(bb) === 3) return H.powerCut(true); // Figma: Suplay at stage 3 = demo power cut
    if (S().power === 'none') return go('18');
    window.openOverlay('SUPPLY');
  };
  SC.SUPPLY = {
    name: '(dagdag) Suplay ng makina – impormasyon', sheet: () => '<div class="stack"><div class="h2">Suplay ng makina</div>' +
      '<div class="card flat listrow"><span class="blue">' + ic(U.supplyIcon(M.supply()), 24) + '</span><span class="grow">Pinagkukunan</span><b>' + M.supply() + '</b></div>' +
      '<div class="card flat listrow"><span class="blue">' + ic('battery', 24) + '</span><span class="grow">Baterya ng makina</span><b>' + Math.round(S().battery) + '%</b></div>' +
      '<div class="card flat listrow"><span class="blue">' + ic('info', 24) + '</span><span class="grow small">Kusang lilipat sa baterya ang pagsubaybay kapag nawalan ng kuryente.</span></div>' + U.btn('Isara', 'close', 'secondary') + '</div>'
  };
  SC['15A'] = {
    name: '15A_Subaybayan_Grap ng timbang', bar: { title: 'Pagbaba ng timbang', back: () => go(H.monitorId()) }, nav: 'dash', live: true, back: () => go(H.monitorId()),
    body: () => {
      const bb = b(); if (!bb) return '<div class="p muted center mt24">Walang tumatakbong batch.</div>';
      const d = M.dur(bb);
      return heatChip(bb, true) + '<div class="card mt12 listrow" style="padding:16px"><div class="grow"><div class="big">' + H.kg(M.weight(bb)) + ' kg</div><div class="p mt4">' + H.dur(bb.h) + '<br>Sinimulan ni ' + bb.starter + '</div></div><span class="blue">' + ic('scale', 40, '', 1.4) + '</span></div>' +
        '<div class="card mt12" style="padding:16px"><div class="h3">Timbang (kg)</div><div class="mt8">' + U.graph({ initial: bb.initial, target: bb.target, dur: d, h: bb.h, xlabels: [0, Math.round(d / 3), Math.round(2 * d / 3), Math.round(d)] }) + '</div><div class="p muted mt8">Oras ng pagpapatuyo</div></div>' +
        '<div class="mt12"><div class="row" style="justify-content:space-between"><span class="muted">' + H.kg(bb.initial) + ' kg</span><b>' + H.kg(bb.target) + ' kg</b></div><div class="mt8">' + U.bar(M.pct(bb)) + '</div><div class="blue mt8">' + M.pct(bb) + '% nabawas</div></div>' +
        '<p class="p muted mt12">' + bb.fish + ' • Target: ' + H.kg(bb.target) + ' kg<br>Tantiyang natitira: mga ' + H.dur(M.remaining(bb)) + '</p>';
    }
  };

  /* ================= 16 / 16A Mga Abiso ================= */
  const toneColor = { critical: 'var(--danger)', warning: '#d48806', warn: '#d48806', good: 'var(--ok)', ok: 'var(--ok)', info: 'var(--blue)', blue: 'var(--blue)' };
  U.notifItem = (n) => '<div class="notif ' + (n.unread ? 'unread' : '') + '" data-act="openNotif" data-arg="' + n.id + '" style="cursor:pointer"><span class="ico" style="color:' + (toneColor[n.tone] || 'var(--blue)') + '">' + ic(n.icon || 'bell', 26) + '</span><div style="flex:1;min-width:0"><div class="t">' + H.esc(n.title) + '</div><div class="d">' + H.esc(n.desc) + '</div><div class="w">' + H.ago(n.at) + '</div></div>' + (n.unread ? '<span class="u"></span>' : '') + '</div>';
  function pages() { const n = S().notifs.length; return Math.max(1, 1 + Math.ceil(Math.max(0, n - 4) / 5)); }
  SC['16'] = {
    name: '16_Mga Abiso_Unang bahagi', bar: () => ({ title: 'Abiso · 1 sa ' + pages(), back: () => go(H.homeId()) }), nav: 'abiso', live: true, back: () => go(H.homeId()),
    keys: { N: 'S14', P: 'S17' },
    enter: () => { if (S().notifAllowed === null && !S().askedNotif) { S().askedNotif = true; save(); go('S17', { replace: true }); } },
    leave: () => { S().notifs.forEach((n) => (n.unread = false)); save(); },
    body: () => {
      const list = S().notifs.slice(0, 4); const un = S().notifs.filter((n) => n.unread).length;
      if (!S().notifs.length) return '<div class="p muted center mt24">Walang abiso.</div>';
      return (un ? U.chip('bell', un + ' bago', 'blue') : U.chip('bell', 'Walang bago', '')) + '<div class="small muted mt12">Nabasa sa cellphone</div><div class="stack mt12" style="gap:12px">' + list.map(U.notifItem).join('') + '</div>' +
        (S().notifAllowed === false ? '<div class="mt12">' + U.banner('warn', 'bell-off', 'Naka-off ang abiso', 'Hindi kayo makakatanggap ng babala sa cellphone. Buksan ang Mga Ayos.', ':S17') + '</div>' : '');
    },
    actions: () => (S().notifs.length > 4 ? U.btn('Mas naunang Abiso', ':16A', 'secondary') : '')
  };
  SC['16A'] = {
    name: '16A_Mga Abiso_Ikalawang bahagi', bar: () => ({ title: 'Abiso · ' + pages() + ' sa ' + pages(), back: '16' }), nav: 'abiso', back: '16',
    body: () => '<div class="stack" style="gap:8px">' + S().notifs.slice(4, 9).map(U.notifItem).join('') + '</div>',
    actions: () => U.btn('Balik sa bagong Abiso', ':16', 'secondary')
  };
  ACT.openNotif = (id) => { const n = S().notifs.find((x) => x.id === id); if (!n) return; n.unread = false; save(); if (n.go && !n.seed) go(n.go); else rerender(); };
  SC.S14 = {
    name: 'S14_Walang bagong abiso', bar: { brand: true }, back: () => go(H.homeId()),
    body: () => U.hero('bell-off', { white: true }) + '<div class="h2 center mt16">Walang bagong abiso</div>',
    actions: () => U.btn('BUMALIK', 'goHome')
  };
  SC.S17 = {
    name: 'S17_Payagan ang abiso', bar: { brand: true }, back: () => go(H.homeId()),
    body: () => U.hero('bell-ring', { white: true }) + '<div class="h2 center mt16">Payagan ang abiso</div><div class="p muted center mt8">Para makita kapag tapos na</div>',
    actions: () => U.btn('PAYAGAN', 'notifYes') + U.btn('HUWAG MUNA', 'notifNo', 'secondary')
  };
  ACT.notifYes = () => { S().notifAllowed = true; S().askedNotif = true; save(); toast('Naka-on ang abiso', 'bell'); go(S().tutorialSeen ? '16' : 'S12_1'); };
  ACT.notifNo = () => { S().notifAllowed = false; S().askedNotif = true; save(); go(S().tutorialSeen ? '16' : 'S12_1'); };

  /* ================= 17 Paglamig ================= */
  SC['17'] = {
    name: '17_Abiso_Paglamig ng makina', bar: { title: 'Paglamig', back: '16' }, nav: 'abiso', back: '16',
    enter: () => { if (S().batch && !S().batch.active && S().lastDone) later(5000, () => { if (window.curScreen() === '17') go('24'); }); },
    body: () => U.hero('wind', {}) + '<div class="mt12">' + U.chip('thermometer', 'Mainit pa', 'danger') + '</div><div class="h1 mt12">Palamigin muna.</div><p class="p mt12">Mainit pa ang makina. Mga 20 minuto bago ligtas hawakan.</p>' +
      '<div class="mt12">' + U.banner('warn', 'hand', 'Huwag muna pong hawakan.', 'Tiyaking malamig na ang makina bago alisin ang isda.') + '</div>',
    actions: () => U.btn('Bumalik sa Abiso', ':16')
  };

  /* ================= 18–23 Power-change flow ================= */
  function batCard(bb) {
    return '<div class="card mt16" style="padding:16px"><div class="listrow" style="min-height:32px"><span class="blue">' + ic(S().battery <= S().settings.batWarn ? 'battery-low' : 'battery', 22) + '</span><span class="grow muted">Baterya ng makina</span><b>' + Math.round(S().battery) + '%</b></div>' +
      '<div class="row mt12" style="justify-content:space-between;align-items:flex-end"><div><div class="big">' + (bb ? H.kg(M.weight(bb)) : '26.4') + ' kg</div><div class="muted mt4">Timbang</div></div><div style="text-align:right"><div class="big">' + (bb ? M.temp(bb) : 68) + '°C</div><div class="muted mt4">Init ngayon</div></div></div></div>';
  }
  U.batCard = batCard;
  SC['18'] = {
    name: '18_Nawalan ng Kuryente', bar: { title: 'Suplay ng makina', back: () => go(H.monitorId()) }, live: true, back: () => go(H.monitorId()),
    body: () => U.hero('unplug', {}) + '<div class="mt12">' + U.chip('plug-zap', 'Walang kuryente', '') + '</div><div class="h1 mt12">Nawalan ng Kuryente</div><p class="p mt12">Huminto ang pag-init sa kuryente. Patuloy ang pagsubaybay gamit ang baterya.</p>' + batCard(b()),
    actions: () => U.btn('Ano ang susunod?', ':19')
  };
  SC['19'] = {
    name: '19_Pagpili_Ituloy ang pagpapatuyo?', base: '18', scrimClose: false,
    sheet: () => '<div class="stack"><div class="h1" style="font-size:1.625rem">Ipagpapatuloy ba ang pagpapatuyo?</div><p class="p">Walang kuryente. Maaaring ituloy gamit ang <b>araw (solar)</b> o <b>biomass</b>. Kung hindi, ititigil ang batch at itatala sa Rekord.</p>' + U.btn('OO, ITULOY', 'bioYes') + U.btn('HINDI, ITIGIL', 'bioNo', 'secondary') + '</div>'
  };
  ACT.bioYes = () => { window.closeOverlay(); S().decision = 'continue'; save(); go('ALT'); };
  ACT.bioNo = () => {
    window.closeOverlay(); S().decision = 'stop';
    const rec = H.stopBatch(H.me(), 'Walang kuryente'); if (!rec) return go(H.homeId());
    if (S().scenario === 'shared') { S().waiting = { kind: 'stopped', rec: rec }; save(); go('SB46'); }
    else { S().viewRec = rec.id; save(); go('25'); }
    setTimeout(() => toast('Itinigil ang batch · naitala sa Rekord', 'pause', 3200), 120);
  };
  /* (bago) Pumili: Araw (solar) o Biomass */
  SC.ALT = {
    name: '(bago) Pumili ng alternatibong pagpapatuyo', bar: { title: 'Ituloy ang pagpapatuyo', back: '18' }, back: '18', live: true,
    body: () => {
      const bb = b();
      const opt = (k, icon, title, desc, tags) => '<button class="card tap" data-act="pickAlt" data-arg="' + k + '" style="width:100%;text-align:left;padding:16px;display:flex;gap:14px;align-items:flex-start"><span style="width:52px;height:52px;border-radius:16px;background:var(--pale);display:flex;align-items:center;justify-content:center;flex:none" class="' + (k === 'Solar' ? 'warnc' : 'dangerc') + '">' + ic(icon, 30) + '</span><span style="flex:1"><b class="h3" style="display:block">' + title + '</b><span class="p muted small" style="display:block;margin-top:4px">' + desc + '</span><span class="row mt8" style="gap:6px;flex-wrap:wrap">' + tags.map((t) => '<span class="chip" style="height:24px;font-size:.6875rem">' + t + '</span>').join('') + '</span></span><span class="blue" style="align-self:center">' + ic('chevron-right', 22) + '</span></button>';
      return U.hero('unplug', { size: 'm' }) + '<div class="h1 mt12">Paano itutuloy?</div><p class="p muted mt8">Piliin ang gagamitin habang walang kuryente. May gabay at checklist bago magsimula.</p>' +
        '<div class="stack mt16" style="gap:12px">' + opt('Solar', 'sun', 'Araw (Solar)', 'Init ng araw sa salaming bahagi ng makina. Tahimik at walang gastos sa panggatong.', ['Maaraw lang', 'Mas mabagal']) +
        opt('Biomass', 'flame', 'Biomass', 'Panggatong at silid ng apoy. Gumagana kahit gabi o maulap.', ['Kailangang bantayan ang apoy']) + '</div>' +
        (bb ? '<div class="card soft mt16 listrow"><span class="blue">' + ic('battery', 22) + '</span><span class="grow small">Tuloy ang pagsubaybay gamit ang baterya (' + Math.round(S().battery) + '%). Nakahinto ang pag-init habang naghahanda.</span></div>' : '');
    }
  };
  const PREP = {
    Solar: ['Ilagay ang makina sa lugar na tinatamaan ng araw.', 'Punasan ang salaming bahagi (glass panel).', 'Alisin ang takip sa salamin.', 'Isara nang maayos ang pinto ng makina.', 'Tiyaking umaandar ang bentilador (baterya).'],
    Biomass: ['Ihanda ang panggatong (tuyong kahoy o bao).', 'Sindihan ang apoy sa silid ng apoy.', 'Ikabit ang silid ng apoy sa makina.', 'Buksan nang tama ang daluyan ng hangin ng apoy.', 'Magsuot ng guwantes; ilayo ang madaling masunog.']
  };
  ACT.pickAlt = (k) => { S().altMode = k; S().prep = PREP[k].map(() => false); save(); go(k === 'Solar' ? 'ALT_SOLAR' : '20'); };
  function prepScreen(kind) {
    return {
      name: kind === 'Solar' ? '(bago) Ihanda ang solar (checklist)' : '20_Ihanda ang biomass (checklist)',
      bar: { title: kind === 'Solar' ? 'Paghahanda · Araw' : 'Paghahanda · Biomass', back: 'ALT' }, back: 'ALT',
      enter: () => { if (!S().prep || S().prep.length !== PREP[kind].length || S().altMode !== kind) { S().altMode = kind; S().prep = PREP[kind].map(() => false); save(); } },
      body: () => {
        const p = S().prep || []; const done = p.filter(Boolean).length; const n = PREP[kind].length;
        return U.hero(kind === 'Solar' ? 'sun' : 'flame', { size: 'm', tone: kind === 'Solar' ? 'warn' : '' }) + '<div class="h1 mt12">Pakisuri  bago ituloy.</div><p class="p muted mt8">Hindi pa  nagsisimula ang pag-init gamit ang ' + (kind === 'Solar' ? 'araw' : 'biomass') + '. Gawin at i-tsek ang bawat hakbang.</p>' +
          '<div class="row mt12" style="justify-content:space-between"><b class="small" style="color:var(--navy)">' + done + ' sa ' + n + ' tapos</b><span class="small muted">Lahat dapat naka-tsek</span></div><div class="mt4">' + U.bar(done / n * 100) + '</div>' +
          '<div class="stack mt12" style="gap:10px">' + PREP[kind].map((t, i) => '<div class="card tap listrow" data-act="prepTick" data-arg="' + i + '" style="padding:10px 12px;min-height:56px;' + (p[i] ? 'border-color:var(--blue);background:var(--pale)' : '') + '"><span class="' + (p[i] ? 'blue' : 'muted') + '">' + ic(p[i] ? 'square-check' : 'square', 26) + '</span><b class="grow" style="color:var(--text);font-weight:600">' + (i + 1) + '. ' + t + '</b></div>').join('') + '</div>' +
          '<div class="mt12">' + (kind === 'Solar' ? U.banner('info', 'cloud-rain', 'Kapag umulap o gumabi:', 'Bababa ang init. Aabisuhan kayo para lumipat sa biomass.') : U.banner('info', 'shield-alert', 'Mag-ingat  sa apoy.', 'Huwag iwan ang apoy nang walang bantay.')) + '</div>';
      },
      actions: () => { const p = S().prep || []; const ok = p.length && p.every((x) => x); return U.btn(ok ? 'HANDA NA · SIMULAN' : 'Tapusin muna ang checklist', 'altReady', 'primary', ok ? '' : 'disabled'); }
    };
  }
  SC['20'] = prepScreen('Biomass');
  SC.ALT_SOLAR = prepScreen('Solar');
  ACT.prepTick = (i) => { const p = S().prep; p[+i] = !p[+i]; save(); rerender(); };
  ACT.altReady = () => {
    const bb = b(); if (!bb) return go(H.homeId());
    const kind = window.curScreen() === 'ALT_SOLAR' ? 'Solar' : 'Biomass';
    bb.mode = kind; bb.heat = 'on'; bb.bioStart = bb.h; bb.autoDropDone = false; bb.drop = 0; S().prep = null; save();
    notify({ icon: kind === 'Solar' ? 'sun' : 'flame', tone: 'info', title: kind === 'Solar' ? 'Umiinit gamit ang araw' : 'Umiinit gamit ang biomass', desc: 'Tuloy ang pagpapatuyo. Aabisuhan kayo kapag bumaba ang init.', go: '21', cta: 'Subaybayan' });
    go('21');
  };
  ACT.bioReady = ACT.altReady;
  SC['21'] = {
    name: '21_Subaybayan_Biomass at araw', bar: { title: 'Subaybayan', back: '06' }, nav: 'dash', live: true, back: '06',
    enter: () => { if (!isOn()) go(H.homeId(), { replace: true }); },
    body: () => {
      const bb = b(); if (!bb) return '';
      const solar = bb.mode === 'Solar';
      return '<div class="h3 blue row" style="gap:6px">' + ic(solar ? 'sun' : 'flame', 20) + (solar ? 'Araw (Solar)' : 'Biomass') + '</div><div class="p muted mt4">' + bb.fish + ' • ' + H.dur(bb.h) + '<br>Sinimulan ni ' + bb.starter + '</div>' +
        '<div class="card mt12 listrow" style="padding:12px 16px"><span class="blue">' + ic(S().battery <= S().settings.batWarn ? 'battery-low' : 'battery', 32) + '</span><div class="grow"><div class="p">Baterya</div><div class="p muted">' + (S().battery <= S().settings.batWarn ? 'Mahina' : 'Sapat') + '</div></div><span class="big" style="font-size:2rem">' + Math.round(S().battery) + '%</span></div>' +
        (bb.drop > 3 ? '<div class="mt12">' + U.banner('warn', solar ? 'cloud-rain' : 'thermometer', 'Bumaba ang init: ' + M.temp(bb) + '°C', solar ? 'Natakpan ng ulap ang araw. Hintayin o lumipat sa biomass.' : 'Magdagdag ng panggatong. Ayusin ang hangin ng apoy.') + '<div class="mt8">' + (solar ? '<div class="grid2">' + U.btn(bb.refuel ? '<span class="spinner s"></span> Hinihintay…' : 'Hintayin ang araw', 'refuel', 'tint', bb.refuel ? 'disabled' : '') + U.btn('Lumipat sa biomass', 'switchBio', 'secondary') + '</div>' : U.btn(bb.refuel ? '<span class="spinner s"></span> Umiinit muli…' : 'Nadagdagan na ang panggatong', 'refuel', 'tint', bb.refuel ? 'disabled' : '')) + '</div></div>' : '') +
        '<div class="mt12">' + U.heatChip(bb) + '</div><div class="mt12">' + U.metrics(bb) + '</div><div class="mt8">' + U.progressCard(bb) + '</div>' +
        '<div class="card soft mt12"><b style="color:var(--navy)">Kapag bumaba ang init:</b><p class="p mt8">' + (solar ? 'Tiyaking walang lilim sa salamin.<br>Kapag maulap nang matagal, lumipat sa biomass.' : 'Magdagdag  ng panggatong.<br>Ayusin  ang hangin ng apoy.') + '</p></div>';
    }
  };
  ACT.refuel = () => { const bb = b(); if (bb) { bb.refuel = true; save(); rerender(); } };
  ACT.switchBio = () => { S().altMode = 'Biomass'; S().prep = PREP.Biomass.map(() => false); save(); go('20'); };
  SC['22'] = {
    name: '22_Hindi itutuloy_Hinto ang pag-init', bar: { title: 'Lagay ng Batch', back: '15' }, nav: 'dash', back: '15',
    body: () => U.hero('pause-circle', { size: 'm' }) + '<div class="h1 mt12">Titigil ang pag-init.</div><p class="p mt8">Patuloy pa rin ang pagsubaybay.</p>' +
      '<div class="card mt12" style="padding:16px">' + U.chip('pause', 'Pag-init: nakahinto') + '<div class="mt12">' + U.chip('activity', 'Pagsubaybay: tuloy', 'blue') + '</div><p class="p muted mt12">Hindi pa  tapos ang Batch.</p></div>' +
      '<div class="mt12">' + U.banner('info', 'hand', 'Mainit pa  ang makina.', 'Palamigin muna  bago hawakan.') + '</div>',
    actions: () => U.btn('Bumalik sa Subaybayan', ':15')
  };
  SC['23'] = {
    name: '23_Bumalik na ang Kuryente', bar: { title: 'Suplay ng makina', back: () => go(H.monitorId()) }, back: () => go(H.monitorId()),
    body: () => U.hero('plug-zap', {}) + '<div class="mt12">' + U.chip('plug', 'May kuryente na', 'ok') + '</div><div class="h1 mt12">Bumalik na ang Kuryente</div><p class="p mt12">Gagamitin na  ba ang pampainit na de-kuryente?</p>' +
      '<div class="mt12">' + U.banner('info', 'info', 'Hindi pa lumilipat ang pag-init.', 'Hihintayin  ang inyong sagot. Patuloy ang pagsubaybay.') + '</div>',
    actions: () => U.btn('OO, GAMITIN ANG KURYENTE', 'useGrid') + U.btn('HINDI, HUWAG MUNA', 'notYetGrid', 'secondary')
  };
  ACT.useGrid = () => { const bb = b(); if (bb) { bb.mode = 'Kuryente'; bb.heat = 'on'; bb.drop = 0; } save(); toast('Kuryente na ang gamit sa pag-init', 'plug'); go(bb ? H.monitorId() : H.homeId()); };
  ACT.notYetGrid = () => go(H.monitorId());

  /* ================= 24 Tuyo na / Tapos na Biomass ================= */
  function doneCard(r, mode) {
    return '<div class="card mt12" style="padding:16px">' + U.chip('circle-check', 'Tapos na • ' + mode, 'blue') +
      '<div class="row mt12" style="justify-content:space-between;align-items:flex-start"><div><div class="muted">Unang timbang</div><div class="big mt4">' + H.kg(r.initial) + ' kg</div></div><span class="muted" style="margin-top:2px">' + ic('arrow-right', 20) + '</span><div><div class="muted">Huling timbang</div><div class="big mt4" style="color:var(--blue)">' + H.kg(r.final) + ' kg</div></div></div>' +
      '<div class="kv mt8"><span class="muted">Kabuuang tagal</span><b>' + H.dur(r.hours) + '</b></div><div class="kv"><span class="muted">Karaniwang init</span><b>' + r.temp + '°C</b></div></div>';
  }
  U.doneCard = doneCard;
  SC['24'] = {
    name: '24_Tuyo na ang isda', bar: { title: 'Tapos na', back: () => go('05') }, back: () => go('05'),
    body: () => { const r = S().lastDone || S().history[0]; return U.hero('fish', { size: 's' }) + '<div class="h1 center mt12">Tuyo na ang isda!</div><p class="p center mt8">Naabot na ang target</p>' + doneCard(r, 'Kuryente') + '<div class="mt12">' + U.banner('info', 'hand', 'Patayin makina', 'Palamigin bago alisin ang isda.') + '</div>'; },
    actions: () => U.btn('Ilagay sa Rekord', 'saveDone')
  };
  ACT.saveDone = () => { const r = S().lastDone; if (r) H.addRecord(r); S().batch = null; S().viewRec = r && r.id; save(); toast('Naitala sa Rekord', 'circle-check'); go('25'); };
  SC.ST_TAPOS_BIO = {
    name: 'State_Tapos na_Biomass', bar: { title: 'Tapos na ang Batch', back: () => go('05') }, back: () => go('05'),
    body: () => { const r = S().lastDone || S().history[0]; return U.hero('fish', { size: 's' }) + '<div class="h1 center mt12">Tuyo na  ang isda!</div><p class="p center mt8">Naabot na ang target na timbang.</p>' + doneCard(r, U.modeLabel(r.mode)) + '<div class="mt12">' + U.banner('info', 'hand', 'Patayin  ang makina.', (r.mode === 'Solar' ? 'Kapag malamig na, alisin ang isda at takpan ang salamin.' : 'Kapag malamig na , alisin ang isda at kolektahin ang abo.')) + '</div>'; },
    actions: () => U.btn('Tapos Na', 'saveDone') + U.btn('Tingnan ang Buod', 'saveDoneSummary', 'secondary')
  };
  ACT.saveDoneSummary = () => { const r = S().lastDone; if (r) H.addRecord(r); S().batch = null; S().viewRec = r && r.id; save(); go('26'); };

  /* ================= 25 / 26 Rekord ================= */
  U.recCard = (r) => '<div class="card tap" data-act="openRec" data-arg="' + r.id + '" style="padding:10px 14px"><div class="row" style="justify-content:space-between"><span class="small muted">' + r.date + '</span><span class="blue">' + ic('chevron-right', 20) + '</span></div>' +
    '<b class="h3" style="display:block;margin-top:4px">' + r.fish + '</b><div class="h1" style="font-size:1.5rem;margin-top:2px">' + H.kg(r.initial) + ' → ' + H.kg(r.final) + ' kg</div>' +
    '<div class="row mt4" style="justify-content:space-between"><span class="muted">' + H.dur(r.hours) + '</span><span class="blue row" style="gap:4px">' + ic(U.supplyIcon(r.mode), 18) + U.modeLabel(r.mode) + '</span></div>' +
    '<div class="row mt4" style="justify-content:space-between"><span class="muted">Sinimulan ni ' + r.starter + '</span>' + (r.status === 'done' ? '<span class="tag-ok">' + ic('check', 16, '', 3) + 'Natapos</span>' : '<span class="tag-danger">! Hindi natapos</span>') + '</div></div>';
  SC['25'] = {
    name: '25_Kasaysayan ng mga Batch', bar: { title: 'Rekord', back: () => go(H.homeId()) }, nav: 'rekord', back: () => go(H.homeId()),
    keys: { R: 'S15', X: 'S18' },
    enter: () => { if (S().noHistory || !S().history.length) go('ST_WALANG_REKORD', { replace: true }); },
    body: () => { const done = S().history.filter((r) => r.status === 'done').length; return '<div class="muted">Rekord mula sa makina</div><div class="stack mt8" style="gap:8px">' + S().history.map(U.recCard).join('') + '</div><div class="center muted mt12">' + done + ' natapos na Batch</div>'; }
  };
  ACT.openRec = (id) => { S().viewRec = id; save(); const r = S().history.find((x) => x.id === id); go(r && r.status !== 'done' ? 'S13b' : '26'); };
  SC['26'] = {
    name: '26_Kasaysayan_Buod ng Galunggong', bar: { title: 'Buod ng Batch', back: '25' }, nav: 'rekord', back: '25',
    body: () => {
      const r = S().history.find((x) => x.id === S().viewRec) || S().history[0];
      if (!r) return '';
      return '<div class="row" style="justify-content:space-between"><div><div class="h2">' + r.fish + '</div><div class="small muted mt4">' + r.date + '</div></div>' + U.chip(U.supplyIcon(r.mode), U.modeLabel(r.mode), 'blue') + '</div>' +
        '<div class="card mt12"><div class="h1">' + H.kg(r.initial) + ' → ' + H.kg(r.final) + ' kg</div><p class="p mt8">Tagal: ' + H.dur(r.hours) + '</p><p class="p mt4">Karaniwang init: ' + r.temp + '°C</p>' +
        '<div class="row mt8">' + (r.status === 'done' ? '<span class="tag-ok"><span class="dot" style="background:var(--ok)"></span>Natapos</span>' : '<span class="tag-danger">Ihininto</span>') + '<span class="muted">Sinimulan ni ' + r.starter + '</span></div></div>' +
        '<div class="card mt8"><div class="h3">Timbang (kg)</div><div class="mt8">' + U.graph({ initial: r.initial, target: r.target, dur: r.hours, h: r.hours, full: r.status === 'done', stopAt: r.status === 'done' ? null : r.stopAt, xlabels: [0, 2, 4, Math.round(r.hours * 10) / 10 > 4 ? Math.round(r.hours) : Math.round(r.hours * 10) / 10] }) + '</div><p class="p muted mt8">Oras ng pagpapatuyo</p></div>' +
        '<div class="card mt8"><b style="color:var(--navy)">Tala sa Batch</b><p class="p mt8">' + (r.status === 'done' ? 'Naabot ang target.' : 'Target: ' + H.kg(r.target) + ' kg, hindi naabot.') + '</p></div>';
    }
  };
  SC.S13b = {
    name: 'S13b_Rekord_Hindi natapos', bar: { brand: true }, back: '25',
    body: () => { const r = S().history.find((x) => x.id === S().viewRec) || { fish: 'Galunggong', initial: 26.4, final: 21.8, hours: 4.08 }; return '<div class="h2">Rekord</div><div class="card mt12 stack" style="padding:16px;gap:8px"><b class="h3">' + r.fish + '</b><div class="kv"><span class="muted">Timbang</span><b>' + H.kg(r.initial) + ' kg → ' + H.kg(r.final) + ' kg</b></div><div class="kv"><span class="muted">Tagal</span><b>' + H.dur(r.hours) + '</b></div><div><span class="tag-danger">' + ic('circle-alert', 16) + 'Hindi natapos</span></div></div>'; },
    actions: () => U.btn('IBA PANG REKORD', ':25') + U.btn('BUMALIK', 'goHome', 'secondary')
  };
  SC.ST_WALANG_REKORD = {
    name: 'State_Walang kasaysayan', bar: { title: 'Rekord', back: () => go(H.homeId()) }, nav: 'rekord', back: () => go(H.homeId()),
    body: () => '<div style="height:60px"></div>' + U.hero('history', {}) + '<div class="h2 center mt16">Wala pang natapos na Batch.</div><p class="p muted center mt8">Dito  makikita ang timbang, tagal, at suplay ng bawat natapos na Batch.</p><div class="mt24">' + U.btn('Bagong Batch', 'navNew') + '</div>'
  };
  SC.S15 = {
    name: 'S15_Hindi makita ang rekord', bar: { brand: true }, back: '25',
    body: () => U.hero('file-search', { white: true }) + '<div class="h2 center mt16">Hindi makita ang rekord</div><div class="card mt24 listrow"><span class="blue">' + ic(H.connIcon(), 24) + '</span><span class="grow">Ikonekta ang makina</span></div>',
    actions: () => U.btn('IKONEKTA', 'reconnectS02')
  };
  ACT.reconnectS02 = () => { S().selectedMachine = true; S().reconnecting = true; save(); go('S02'); };

  /* ================= S04–S07, S18, emergency, battery ================= */
  SC.S04 = {
    name: 'S04_Nawala ang koneksyon', bar: { brand: true }, back: '03', keys: { Escape: '03' },
    body: () => { const bb = b(); return U.hero(S().connType === 'bt' ? 'bluetooth-off' : 'wifi-off', { white: true }) + '<div class="h2 center mt16">Nawala ang koneksyon</div><div class="card mt16" style="padding:16px"><div class="muted">Huling sukat</div><div class="grid2 mt8" style="grid-template-columns:repeat(3,1fr)"><div><div class="h1">' + (bb ? H.kg(M.weight(bb)) : '21.8') + '</div><div class="muted">kg</div></div><div><div class="h1">' + (bb ? M.temp(bb) : 68) + '</div><div class="muted">°C</div></div><div><div class="h1">' + (bb ? H.durShort(bb.h).replace('h ', ':').replace('m', '') : '4:05') + '</div><div class="muted">oras</div></div></div></div><div class="mt12">' + U.banner('ok', 'activity', 'Tuloy pa rin ang makina', '') + '</div>'; },
    actions: () => U.btn('IKONEKTA MULI', 'reconnect')
  };
  SC.S05 = { name: 'S05_Sobrang init', bar: { brand: true }, back: () => go(H.homeId()), enter: () => notify({ icon: 'thermometer', tone: 'critical', title: 'Sobrang init', desc: 'Huwag hawakan ang makina. Palamigin muna.', go: 'S05' }), body: () => U.hero('thermometer', { white: true, tone: 'danger', deco: false }) + '<div class="h2 center mt16">Sobrang init</div><div class="stack mt24"><div class="card listrow"><span class="blue">' + ic('hand', 24) + '</span><span class="grow">Huwag hawakan</span></div><div class="card listrow"><span class="blue">' + ic('thermometer', 24) + '</span><span class="grow">Palamigin muna</span></div></div>', actions: () => U.btn('NAUNAWAAN KO', ':17') + U.btn('Tumawag', ':27', 'secondary') };
  SC.S06 = { name: 'S06_Bukas ang pinto', bar: { brand: true }, back: () => go(H.homeId()), enter: () => (S().machine.door = 'open', save(), notify({ icon: 'door', tone: 'warning', title: 'Bukas ang pinto', desc: 'Isara ang pinto ng makina para tuloy ang pagpapatuyo.', go: 'S06' })), body: () => U.hero('door', { white: true, tone: 'warn', deco: false }) + '<div class="h2 center mt16">Bukas ang pinto</div><div class="stack mt24"><div class="card listrow"><span class="blue">' + ic('door', 24) + '</span><span class="grow">Isara ang pinto</span></div></div>', actions: () => U.btn('TAPOS NA', 'doorClosed') };
  ACT.doorClosed = () => { S().machine.door = 'closed'; save(); go(isOn() ? H.monitorId() : H.homeId()); };
  SC.S07 = { name: 'S07_Problema sa makina', bar: { brand: true }, back: () => go(H.homeId()), enter: () => notify({ icon: 'wrench', tone: 'critical', title: 'May problema sa makina', desc: 'Patayin ang makina at tumawag sa Tagapamahala.', go: 'S07' }), body: () => U.hero('wrench', { white: true, tone: 'danger', deco: false }) + '<div class="h2 center mt16">May problema sa makina</div><div class="stack mt24"><div class="card listrow"><span class="blue">' + ic('power', 24) + '</span><span class="grow">Patayin ang makina</span></div><div class="card listrow"><span class="blue">' + ic('phone', 24) + '</span><span class="grow">Tumawag sa Tagapamahala</span></div></div>', actions: () => U.btn('TUMAWAG', ':27') };
  SC.S18 = { name: 'S18_Tapos na ang session', bar: { brand: true }, back: null, body: () => U.hero('hourglass', { white: true }) + '<div class="h2 center mt16">Tapos na ang session</div><p class="p muted center mt8">Mag-login ulit para magpatuloy. Tuloy pa rin ang makina.</p>', actions: () => U.btn('MAG-LOGIN ULIT', 'relogin') };
  ACT.relogin = () => { S().loggedIn = false; S().pin = ''; save(); go('02'); };
  SC.ST_EMERHENSIYA = {
    name: 'State_Pang-emerhensiyang paghinto', bar: { title: 'Kaligtasan', back: () => go(H.homeId()) }, back: () => go(H.homeId()),
    body: () => U.hero('octagon-alert', { tone: 'danger' }) + '<div class="mt12">' + U.chip('octagon-alert', 'Nakahinto ang makina', 'danger') + '</div><div class="h1 mt12">Nakahinto ang makina</div>' +
      '<div class="card mt16 stack"><div class="listrow"><span class="blue">' + ic('wrench', 24) + '</span><span class="grow">Suriin muna ang makina</span></div><div class="listrow"><span class="dangerc">' + ic('flame', 24) + '</span><span class="grow">Lumayo sa apoy</span></div><div class="listrow"><span class="blue">' + ic('phone', 24) + '</span><span class="grow">Humingi ng tulong</span></div></div>',
    actions: () => U.btn('TUMAWAG', 'callAdmin2') + U.btn('GABAY SA KALIGTASAN', ':28', 'secondary')
  };
  ACT.callAdmin2 = () => { toast('Tumatawag sa Tagapamahala…', 'phone'); };
  SC.ST_BATERYA = {
    name: 'State_Mahina na ang Baterya', bar: { title: 'Abiso sa baterya', back: () => go(H.homeId()) }, nav: 'abiso', back: () => go(H.homeId()),
    body: () => U.hero('battery-low', { tone: 'warn' }) + '<div class="mt12">' + U.chip('battery-low', 'Mahina ang baterya', 'warn') + '</div><div class="h1 mt12">Mahina na ang Baterya</div><div class="huge mt12" style="color:#b26a00">' + Math.round(S().battery) + '%</div>' +
      '<div class="card mt16 stack"><div class="listrow"><span class="blue">' + ic('plug', 24) + '</span><span class="grow">Suriin ang kuryente</span></div><div class="listrow"><span class="dangerc">' + ic('hand', 24) + '</span><span class="grow">Huwag galawin ang mainit na makina</span></div></div>',
    actions: () => U.btn('NAUNAWAAN KO', 'batOk')
  };
  ACT.batOk = () => go(isOn() ? H.monitorId() : H.homeId());

  /* ================= S12 Gabay (tutorial with spotlight) ================= */
  const TUT = [
    ['dash', 'house', 'Dashboard', 'Tingnan ang lagay ng makina.'],
    ['new', 'plus', 'Bagong Batch', 'Maghanda ng bagong batch.'],
    ['abiso', 'bell', 'Abiso', 'Tingnan ang mga abiso.'],
    ['rekord', 'history', 'Rekord', 'Balikan ang mga rekord.']
  ];
  [1, 2, 3, 4].forEach((n) => {
    const t = TUT[n - 1];
    SC['S12_' + n] = {
      name: 'S12_' + n + '_Gabay_' + t[2], bar: { brand: true }, nav: 'dash', back: n > 1 ? 'S12_' + (n - 1) : '05',
      body: () => SC['05'].body(),
      mounted: () => {
        const scr = document.getElementById('screen');
        const navBtn = scr.querySelector('.bnav [data-nav="' + t[0] + '"]');
        const r = navBtn.getBoundingClientRect(), sr = scr.getBoundingClientRect(), sc = sr.width / scr.offsetWidth;
        const sp = document.createElement('div'); sp.className = 'spot';
        sp.innerHTML = '<div class="shade"></div><div class="ring2" style="left:' + ((r.left - sr.left) / sc - 2) + 'px;top:' + ((r.top - sr.top) / sc - 2) + 'px;width:' + (r.width / sc + 4) + 'px;height:' + (r.height / sc + 4) + 'px"></div>' +
          '<button data-act="tutNext" style="position:absolute;left:' + ((r.left - sr.left) / sc) + 'px;top:' + ((r.top - sr.top) / sc) + 'px;width:' + (r.width / sc) + 'px;height:' + (r.height / sc) + 'px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;color:var(--blue);font-size:11px;font-weight:700;padding-bottom:8px">' + ic(t[1], 24) + '<span>' + t[2] + '</span></button>' +
          '<div class="tip">' + U.hero(t[1], { size: 'm', deco: false }) + '<div class="h2 mt12">' + t[2] + '</div><div class="blue mt8">Hakbang ' + n + ' sa 4</div><p class="p mt16">' + t[3] + '</p><div class="mt24">' + U.btn(n === 4 ? 'SIMULAN' : 'Susunod', 'tutNext') + '</div><div class="grid2 mt12">' + U.btn('Bumalik', 'tutBack', 'secondary') + U.btn('Laktawan', 'tutSkip', 'ghost') + '</div></div>';
        scr.querySelector('.view').appendChild(sp);
      }
    };
  });
  ACT.tutNext = () => { const c = window.curScreen(); const n = +c.split('_')[1]; if (n >= 4) return ACT.tutSkip(); go('S12_' + (n + 1), { replace: true }); };
  ACT.tutBack = () => { const c = window.curScreen(); const n = +c.split('_')[1]; go(n > 1 ? 'S12_' + (n - 1) : H.homeId(), { replace: true }); };
  ACT.tutSkip = () => { S().tutorialSeen = true; save(); go(H.homeId()); };

  /* ================= 27–30 Tulong, Gabay, Mga Ayos, Higit pa ================= */
  SC['27'] = {
    name: '27_Tulong at mga gabay', bar: { title: 'Tulong', back: '30' }, nav: 'more', back: '30',
    body: () => '<p class="p">Ano ang kailangan ninyo?</p><div class="stack mt12" style="gap:12px">' +
      [['fish', 'Paano magsimula ng Batch', 'startTut'], ['unplug', 'Kung nawalan ng kuryente', 'helpPower'], ['flame', 'Paano mag-biomass', ':28'], ['shield-check', 'Kaligtasan', ':28']].map((x) => '<div class="card tap listrow" ' + (x[2][0] === ':' ? 'data-go="' + x[2].slice(1) + '"' : 'data-act="' + x[2] + '"') + ' style="padding:12px"><span style="width:40px;height:40px;border-radius:12px;background:var(--pale);display:flex;align-items:center;justify-content:center" class="blue">' + ic(x[0], 24) + '</span><b class="grow" style="color:var(--text)">' + x[1] + '</b><span class="muted">' + ic('chevron-right', 20) + '</span></div>').join('') +
      U.btn(ic('phone', 20) + 'Tumawag sa Tagapamahala', 'callAdmin2', 'secondary') + '</div>'
  };
  ACT.helpPower = () => window.openOverlay('HELP_POWER');
  SC.HELP_POWER = { name: '(dagdag) Tulong – Kung nawalan ng kuryente', sheet: () => '<div class="stack"><div class="h2">Kung nawalan ng kuryente</div>' + ['Huminto ang pag-init, pero tuloy ang pagsubaybay gamit ang baterya.', 'Pindutin ang abiso at piliin kung itutuloy sa biomass.', 'Ihanda ang panggatong, sindihan, at ikabit ang silid ng apoy.', 'Kapag bumalik ang kuryente, tatanungin kayo kung lilipat muli.'].map((t, i) => '<div class="step"><span class="n" style="width:32px;height:32px;border-radius:16px;font-weight:800">' + (i + 1) + '</span><p class="p">' + t + '</p></div>').join('') + U.btn('Isara', 'close', 'secondary') + '</div>' };
  SC['28'] = {
    name: '28_Gabay_Biomass at kaligtasan', bar: { title: 'Paano mag-biomass', back: '27' }, nav: 'more', back: '27',
    body: () => '<div class="h2">Ligtas na paghahanda</div><div class="stack mt12" style="gap:12px">' +
      [['flame-kindling', '1. Ihanda ang panggatong.'], ['flame', '2. Sindihan ang apoy.'], ['box', '3. Ikabit  ang silid ng apoy.']].map((x) => '<div class="step" style="align-items:center"><span class="n">' + ic(x[0], 28) + '</span><b style="color:var(--text)">' + x[1] + '</b></div>').join('') + '</div>' +
      '<div class="mt12">' + U.banner('info', 'shield-check', 'Gumamit  ng guwantes.', 'Ilayo ang madaling masunog. Palamigin  bago linisin ang abo.') + '</div>'
  };
  SC['29'] = {
    name: '29_Mga Ayos', bar: { title: 'Mga Ayos', back: '30' }, nav: 'more', back: '30',
    body: () => {
      const st = S().settings;
      return '<div class="card"><b style="color:var(--navy)">Laki ng Letra</b><div class="row mt8" style="gap:4px">' + [['s', 'Maliit'], ['m', 'Katamtaman'], ['l', 'Malaki']].map((x) => '<button class="btn ' + (st.font === x[0] ? 'primary' : 'tint') + '" style="height:48px;font-size:' + (x[0] === 's' ? '.875rem' : x[0] === 'l' ? '1.0625rem' : '.875rem') + '" data-act="setFont" data-arg="' + x[0] + '">' + x[1] + '</button>').join('') + '</div></div>' +
        '<div class="card mt12 listrow" style="min-height:56px"><b class="grow" style="color:var(--navy)">Tunog / Vibrate</b><button data-act="toggleSound" aria-label="Tunog" style="width:52px;height:32px;border-radius:16px;background:' + (st.sound ? 'var(--blue)' : 'var(--auth)') + ';position:relative"><span style="position:absolute;top:4px;left:' + (st.sound ? '24px' : '4px') + ';width:24px;height:24px;border-radius:12px;background:#fff;transition:left .15s"></span></button></div>' +
        '<div class="card mt12 listrow tap" data-act="cycleBat" style="min-height:48px"><span class="grow">Babala sa baterya</span><b class="blue" style="font-size:1.25rem">' + st.batWarn + '%</b></div>' +
        '<div class="card mt12 tap" data-act="editOp"><div class="listrow"><span class="blue">' + ic('user', 24) + '</span><span class="grow muted">Operator</span><b>›</b></div><div class="blue">' + H.esc(H.me()) + '</div></div>' +
        '<div class="card mt12"><div class="listrow tap" data-act="reconnect"><span class="blue">' + ic(H.connIcon(), 24) + '</span><span class="grow muted">Koneksyon · ' + H.connLabel() + '</span><b>›</b></div><div class="blue">AGAP-001 • ' + (S().connected ? 'Nakakonekta' : 'Hindi nakakonekta') + '</div><div class="listrow tap mt4" data-act="about"><span class="blue">' + ic('info', 24) + '</span><span class="grow muted">Tungkol sa App</span><b>›</b></div></div>';
    }
  };
  ACT.setFont = (f) => { S().settings.font = f; save(); window.applyFont(); rerender(); };
  ACT.toggleSound = () => { S().settings.sound = !S().settings.sound; save(); rerender(); };
  ACT.cycleBat = () => { const v = [15, 20, 30]; const st = S().settings; st.batWarn = v[(v.indexOf(st.batWarn) + 1) % v.length]; save(); rerender(); };
  ACT.about = () => window.openOverlay('ABOUT');
  ACT.editOp = () => window.openOverlay('SB48');
  SC.ABOUT = { name: '(dagdag) Tungkol sa App', sheet: () => '<div class="stack center"><img src="assets/img/logo-192.png" alt="AGAP" style="width:88px;height:88px;border-radius:50%;margin:0 auto"><div class="h2">AGAP</div><p class="p muted">Tuyong isda kahit maulan.<br>Prototype para sa usability test · v1.0</p><p class="small muted">Makina: AGAP-001 · ' + H.connLabel() + '</p>' + U.btn('Isara', 'close', 'secondary') + '</div>' };
  SC['30'] = {
    name: '30_Higit pa', bar: { title: 'Higit pa', back: () => go(H.homeId()) }, nav: 'more', back: () => go(H.homeId()),
    body: () => '<div class="stack" style="gap:12px">' + [['help', 'Tulong', ':27'], ['settings', 'Mga Ayos', ':29'], ['log-out', 'Mag-logout', 'askLogout']].map((x) => '<div class="card tap listrow" ' + (x[2][0] === ':' ? 'data-go="' + x[2].slice(1) + '"' : 'data-act="' + x[2] + '"') + ' style="min-height:64px"><span class="' + (x[0] === 'log-out' ? 'dangerc' : 'blue') + '">' + ic(x[0], 24) + '</span><span class="grow p">' + x[1] + '</span><span class="muted">' + ic('chevron-right', 20) + '</span></div>').join('') + '</div>'
  };
  ACT.askLogout = () => window.openOverlay('L09');
  SC.L09 = { name: 'State_Logout_09_Tanong', base: '30', sheet: () => '<div class="stack"><div class="h1">Mag-logout?</div><p class="p">Tuloy pa rin ang makina kahit mag-logout.</p>' + U.btn('OO, MAG-LOGOUT', 'doLogout') + U.btn('HINDI', 'close', 'secondary') + '</div>' };
  ACT.doLogout = () => { window.closeOverlay(); const s = S(); s.loggedIn = false; s.remember = false; s.pin = ''; save(); go('L01'); };
})();
