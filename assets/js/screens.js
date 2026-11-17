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
  U.supplyIcon = (mode) => (mode === 'Biomass' ? 'flame' : mode === 'Baterya' ? 'battery' : 'plug');

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
    return '<div class="gradcard"><div class="greet">' + (o.greet || 'Magandang araw !') + '</div>' +
      '<div class="line" data-act="tapConn" style="cursor:pointer">' + ic(H.connIcon(), 18) + (o.line || 'AGAP-001 • Nakakonekta') + '</div>' +
      '<div class="chips">' + U.chip(U.supplyIcon(sup), sup, 'dark') + U.chip(S().power === 'none' ? 'battery-low' : 'battery', Math.round(S().battery) + '%', 'dark') + '</div></div>';
  };
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
      '<div class="small" style="opacity:.85;line-height:1.5;margin-top:4px">Para sa facilitator: pindutin nang matagal ang logo (o pindutin ang <b>`</b> / <b>F2</b>) para sa control panel — power cut, baterya, bilis ng orasan, at iba pa.</div>' +
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
  ACT.startApp = () => { const s = S(); s.loggedIn = false; s.connected = false; s.selectedMachine = false; s.loginAttempts = 0; s.pin = ''; s.pinShown = false; s.samahanTyped = ''; save(); go('02'); };

  /* ================= LOGIN (02 + State_Login_01…09) ================= */
  function loginView(mode) {
    const s = S();
    const first = mode === '02';
    const pinVal = s.pin || '';
    const shown = mode === 'L02';
    const kp = mode === 'L03';
    const dots = pinVal ? (shown ? pinVal : '•'.repeat(pinVal.length)) : '';
    const sam = first ? (s.samahanTyped || '') : (s.samahanTyped || s.samahan || 'SUBAD');
    const locked = mode === 'L05';
    const waiting = mode === 'L06';
    let h = '';
    if (!kp) {
      h += '<div class="authhero"><div class="lg"><img src="' + LOGO + '" alt="AGAP" data-logo><b>AGAP</b></div>' +
        '<h2>' + (first ? 'Mag-login' : 'Maligayang Pagbabalik!') + '</h2><div class="sub">' + ic('lock', 16) + (first ? 'Para magamit ang makina.' : mode === 'L01' || mode === 'L02' ? 'Mag-login sa makina.' : 'Mag-login para magamit ang makina.') + '</div></div>';
    }
    h += '<div class="card ' + (kp ? '' : 'mt16') + '" style="padding:20px"><div class="field"><label>' + (first ? 'Samahan' : 'Pangalan ng Samahan o Gumagamit') + '</label>' +
      '<div class="input" id="samBox"><input id="samIn" value="' + H.esc(sam) + '" placeholder="Halimbawa: SUBAD" autocomplete="off" spellcheck="false"></div></div>' +
      '<div class="field mt16"><label>' + (kp ? 'Ilagay ang PIN' : 'PIN') + '</label><div class="input ' + (kp ? 'focus' : '') + (mode === 'L04' || locked ? ' error' : '') + '" data-act="openPin" style="cursor:pointer">' +
      '<span style="flex:1;letter-spacing:' + (shown ? '1px' : '3px') + ';font-size:' + (shown ? '1rem' : '1.25rem') + '">' + (dots || '<span class="ph" style="letter-spacing:0;font-size:1rem">6 na numero</span>') + (kp ? '<span class="caret"></span>' : '') + '</span>' +
      '<button data-act="togglePin" class="blue" style="display:flex;gap:6px;align-items:center;font-weight:600">' + ic(shown ? 'eye-off' : 'eye', 20) + (shown ? 'Itago ang PIN' : 'Ipakita ang PIN') + '</button></div>' +
      (mode === 'L04' ? '<div class="err">' + ic('circle-alert', 16) + 'Maling PIN. Subukan muli.</div>' : '') +
      (locked ? '<div class="err">' + ic('lock', 16) + 'Na-lock · Subukan sa <span id="lockLeft">1 minuto</span>.</div>' : '') + '</div>' +
      (kp ? '' : '<div class="mt8">' + U.check(s.remember, first ? 'Tandaan ako' : 'Tandaan ako sa cellphone na ito', 'toggleRemember') + '</div>') + '</div>';
    return h;
  }
  function loginActions(mode) {
    if (mode === 'L03') return '';
    if (mode === 'L06') return '<button class="btn primary disabled" style="background:var(--blue);color:#fff;opacity:.85"><span class="spinner s" style="border-color:rgba(255,255,255,.35);border-top-color:#fff"></span>Sandali lang...</button>' + '<button class="link" data-go="L07">Nakalimutan ang PIN?</button>';
    return U.btn(mode === '02' ? 'LOGIN' : 'MAG-LOGIN', 'doLogin', 'primary', mode === 'L05' ? 'disabled' : '') + '<button class="link" data-go="L07">Nakalimutan ang PIN?</button>';
  }
  const loginKeys = { Escape: () => { S().loginAttempts = 0; save(); go('00'); } };
  function mkLogin(id, name, extra) {
    SC[id] = Object.assign({ name: name, bar: { brand: true }, body: () => loginView(id), actions: () => loginActions(id), keys: loginKeys, back: '00' }, extra || {});
  }
  mkLogin('02', '02_Login');
  mkLogin('L01', 'State_Login_01_Handa');
  mkLogin('L02', 'State_Login_02_Nakikitang_PIN');
  mkLogin('L04', 'State_Login_04_Maling_PIN', { enter: () => { if (S().loginAttempts >= 3) { S().lockUntil = Date.now() + 60000; save(); go('L05', { replace: true }); } } });
  mkLogin('L05', 'State_Login_05_Na_lock', {
    enter: () => {
      if (!S().lockUntil || S().lockUntil < Date.now()) { S().lockUntil = Date.now() + 60000; save(); }
      const iv = setInterval(() => { const el = document.getElementById('lockLeft'); const left = Math.ceil((S().lockUntil - Date.now()) / 1000); if (left <= 0) { clearInterval(iv); S().loginAttempts = 0; S().lockUntil = 0; save(); if (window.curScreen() === 'L05') go('L01', { replace: true }); return; } if (el) el.textContent = left + ' seg'; }, 500);
      SC.L05._iv = iv;
    }, leave: () => clearInterval(SC.L05._iv)
  });
  mkLogin('L06', 'State_Login_06_Sandali', {
    after: [1500, () => {
      const s = S(); const ok = s.pin === '123456' || s.pin === '';
      if (ok) { s.loginAttempts = 0; save(); go('L08'); } else { s.loginAttempts++; save(); go('L04'); }
    }]
  });
  mkLogin('L08', 'State_Login_08_Tagumpay', {
    mounted: () => { const t = document.createElement('div'); t.className = 'toast nonav'; t.style.bottom = '160px'; t.innerHTML = ic('circle-check', 22) + '<span>Maligayang pagdating!</span>'; document.getElementById('screen').appendChild(t); },
    after: [1100, () => { const s = S(); s.loggedIn = true; save(); if (s.scenario === 'shared' && !s.operator) return go('SB14'); go(s.permOK ? '03' : 'S01'); }]
  });
  SC.L03 = {
    name: 'State_Login_03_Keypad', bar: { brand: true }, body: () => loginView('L03') + '<div class="mt16">' + U.btn('MAG-LOGIN', 'noop', 'primary', 'disabled') + '<button class="link" data-go="L07">Nakalimutan ang PIN?</button></div>',
    raw: null, keys: { Escape: () => window.back() }, back: () => go(S().pinFrom || 'L01'),
    actions: () => '', mounted: () => {
      const v = document.querySelector('#screen .view'); const kp = document.createElement('div'); kp.className = 'keypad';
      kp.innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => '<button data-act="pinKey" data-arg="' + n + '">' + n + '</button>').join('') + '<button data-act="pinDel" aria-label="Burahin">' + ic('del', 26) + '</button><button data-act="pinKey" data-arg="0">0</button><button class="done" data-act="pinDone">Tapos</button>';
      v.insertBefore(kp, v.querySelector('.androidnav'));
    }
  };
  ACT.noop = () => { };
  ACT.openPin = (a, el, e) => { if (e && e.target.closest('[data-act="togglePin"]')) return; const s = S(); if (window.curScreen() === 'L05') return; s.pinFrom = window.curScreen() === 'L02' ? 'L01' : 'L01'; s.pin = ''; save(); keepSam(); go('L03'); };
  ACT.togglePin = (a, el, e) => { e.stopPropagation(); keepSam(); const c = window.curScreen(); if (c === 'L02') return go('L01', { replace: true }); if (!S().pin) return; if (c === 'L01' || c === '02' || c === 'L04') go('L02', { replace: true }); };
  ACT.pinKey = (d) => { const s = S(); if ((s.pin || '').length >= 6) return; s.pin = (s.pin || '') + d; save(); rerender(); };
  ACT.pinDel = () => { const s = S(); s.pin = (s.pin || '').slice(0, -1); save(); rerender(); };
  ACT.pinDone = () => { const s = S(); if (!s.pin) s.pin = '123456'; save(); go('L01', { replace: true }); };
  ACT.toggleRemember = () => { S().remember = !S().remember; keepSam(); save(); rerender(); };
  function keepSam() { const i = document.getElementById('samIn'); if (i) { S().samahanTyped = i.value; S().samahan = i.value || 'SUBAD'; save(); } }
  ACT.doLogin = () => {
    keepSam(); const s = S();
    if (!s.samahanTyped) { const i = document.getElementById('samIn'); toast('Ilagay ang pangalan ng Samahan', 'info'); if (i) i.focus(); return; }
    if (!s.pin) { go('L03'); return; }
    go('L06');
  };
  SC.L07 = {
    name: 'State_Login_07_Nakalimutang_PIN', sheet: () => '<div class="stack"><div class="h2">Nakalimutan ang PIN?</div><p class="p">Ipa-reset ang PIN sa tagapamahala.</p>' + U.btn(ic('phone', 20) + 'Tumawag', 'callAdmin') + U.btn('Isara', 'close', 'secondary') + '</div>',
    keys: { Escape: () => window.closeOverlay() }
  };
  ACT.callAdmin = () => { window.closeOverlay(); toast('Tumatawag sa Tagapamahala…', 'phone'); };

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
        '<div class="center mt16 blue">' + ic('fish', 40, '', 1.5) + '</div><div class="mt12">' + U.btn('+ Bagong Batch', 'navNew') + '</div>' +
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
        '<div class="card soft mt8 listrow" style="padding:8px 12px;min-height:40px"><span class="' + (S().weather === 'sun' ? 'warnc' : 'blue') + '">' + ic(S().weather === 'sun' ? 'sun' : 'cloud-rain', 22) + '</span><span class="small">' + (S().weather === 'sun' ? 'Maaraw · Mainam sa pagpapatuyo' : 'Maulan · Ligtas sa loob ng makina ang isda') + '</span></div>';
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
    const icon = bb.mode === 'Biomass' ? 'flame' : S().power === 'none' ? 'battery' : 'plug';
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
    name: '19_Pagpili_Ituloy sa biomass', base: '18', scrimClose: false,
    sheet: () => '<div class="stack"><div class="h1" style="font-size:1.625rem">Ipagpapatuloy ba ang pagpapatuyo gamit ang biomass?</div><p class="p">Kailangan munang ihanda ang panggatong at silid ng apoy.</p>' + U.btn('OO, ITULOY', 'bioYes') + U.btn('HINDI, ITIGIL', 'bioNo', 'secondary') + '</div>'
  };
  ACT.bioYes = () => { window.closeOverlay(); S().decision = 'biomass'; save(); go('20'); };
  ACT.bioNo = () => { window.closeOverlay(); if (b()) b().heat = 'stopped'; S().decision = 'stop'; save(); go('22'); };
  SC['20'] = {
    name: '20_Ihanda ang biomass', bar: { title: 'Paghahanda', back: '18' }, back: '18',
    enter: () => { S().prep = S().prep || [false, false, false]; save(); },
    body: () => {
      const p = S().prep || [false, false, false];
      const items = ['1. Ihanda ang panggatong.', '2. Sindihan ang apoy.', '3. Ikabit ang silid ng apoy.'];
      return U.hero('flame', { size: 'm' }) + '<div class="h1 mt12">Pakisuri  bago ituloy.</div><p class="p muted mt8">Hindi pa  nagsisimula ang pag-init gamit ang biomass.</p><div class="stack mt12" style="gap:12px">' +
        items.map((t, i) => '<div class="card tap listrow" data-act="prepTick" data-arg="' + i + '" style="padding:10px 12px;min-height:52px"><span class="' + (p[i] ? 'blue' : 'muted') + '">' + ic(p[i] ? 'square-check' : 'square', 26) + '</span><b class="grow" style="color:var(--text)">' + t + '</b></div>').join('') + '</div>' +
        '<div class="mt12">' + U.banner('info', 'shield-alert', 'Mag-ingat  sa apoy.', 'Gumamit  ng guwantes. Ilayo ang madaling masunog.') + '</div>';
    },
    actions: () => { const p = S().prep || []; return U.btn('HANDA NA', 'bioReady', 'primary', p.every((x) => x) && p.length === 3 ? '' : 'disabled'); }
  };
  ACT.prepTick = (i) => { const p = S().prep; p[i] = !p[i]; save(); rerender(); };
  ACT.bioReady = () => {
    const bb = b(); if (!bb) return go(H.homeId());
    bb.mode = 'Biomass'; bb.heat = 'on'; bb.bioStart = bb.h; bb.autoDropDone = false; S().prep = null; save();
    notify({ icon: 'flame', tone: 'info', title: 'Umiinit gamit ang biomass', desc: 'Ituloy ang pagbabantay sa apoy. Aabisuhan kayo kapag bumaba ang init.', go: '21', cta: 'Subaybayan' });
    go('21');
  };
  SC['21'] = {
    name: '21_Subaybayan_Biomass at araw', bar: { title: 'Subaybayan', back: '06' }, nav: 'dash', live: true, back: '06',
    enter: () => { if (!isOn()) go(H.homeId(), { replace: true }); },
    body: () => {
      const bb = b(); if (!bb) return '';
      return '<div class="h3 blue">Biomass / Araw</div><div class="p muted mt4">' + bb.fish + ' • ' + H.dur(bb.h) + '<br>Sinimulan ni ' + bb.starter + '</div>' +
        '<div class="card mt12 listrow" style="padding:12px 16px"><span class="blue">' + ic(S().battery <= S().settings.batWarn ? 'battery-low' : 'battery', 32) + '</span><div class="grow"><div class="p">Baterya</div><div class="p muted">' + (S().battery <= S().settings.batWarn ? 'Mahina' : 'Sapat') + '</div></div><span class="big" style="font-size:2rem">' + Math.round(S().battery) + '%</span></div>' +
        (bb.drop > 3 ? '<div class="mt12">' + U.banner('warn', 'thermometer', 'Bumaba ang init: ' + M.temp(bb) + '°C', 'Magdagdag ng panggatong. Ayusin ang hangin ng apoy.') + '<div class="mt8">' + U.btn(bb.refuel ? '<span class="spinner s"></span> Umiinit muli…' : 'Nadagdagan na ang panggatong', 'refuel', 'tint', bb.refuel ? 'disabled' : '') + '</div></div>' : '') +
        '<div class="mt12">' + heatChip(bb) + '</div><div class="mt12">' + metrics(bb) + '</div>' +
        '<div class="card soft mt12"><b style="color:var(--navy)">Kapag bumaba ang init:</b><p class="p mt8">Magdagdag  ng panggatong.<br>Ayusin  ang hangin ng apoy.</p></div>';
    }
  };
  ACT.refuel = () => { const bb = b(); if (bb) { bb.refuel = true; save(); rerender(); } };
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
    body: () => { const r = S().lastDone || S().history[0]; return U.hero('fish', { size: 's' }) + '<div class="h1 center mt12">Tuyo na  ang isda!</div><p class="p center mt8">Naabot na ang target na timbang.</p>' + doneCard(r, 'Biomass') + '<div class="mt12">' + U.banner('info', 'hand', 'Patayin  ang makina.', 'Kapag malamig na , alisin ang isda at kolektahin ang abo.') + '</div>'; },
    actions: () => U.btn('Tapos Na', 'saveDone') + U.btn('Tingnan ang Buod', 'saveDoneSummary', 'secondary')
  };
  ACT.saveDoneSummary = () => { const r = S().lastDone; if (r) H.addRecord(r); S().batch = null; S().viewRec = r && r.id; save(); go('26'); };

  /* ================= 25 / 26 Rekord ================= */
  U.recCard = (r) => '<div class="card tap" data-act="openRec" data-arg="' + r.id + '" style="padding:10px 14px"><div class="row" style="justify-content:space-between"><span class="small muted">' + r.date + '</span><span class="blue">' + ic('chevron-right', 20) + '</span></div>' +
    '<b class="h3" style="display:block;margin-top:4px">' + r.fish + '</b><div class="h1" style="font-size:1.5rem;margin-top:2px">' + H.kg(r.initial) + ' → ' + H.kg(r.final) + ' kg</div>' +
    '<div class="row mt4" style="justify-content:space-between"><span class="muted">' + H.dur(r.hours) + '</span><span class="blue row" style="gap:4px">' + ic(U.supplyIcon(r.mode), 18) + (r.mode === 'Biomass' ? 'Biomass / Araw' : 'Kuryente') + '</span></div>' +
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
      return '<div class="row" style="justify-content:space-between"><div><div class="h2">' + r.fish + '</div><div class="small muted mt4">' + r.date + '</div></div>' + U.chip(U.supplyIcon(r.mode), r.mode, 'blue') + '</div>' +
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
  SC.S06 = { name: 'S06_Bukas ang pinto', bar: { brand: true }, back: () => go(H.homeId()), enter: () => notify({ icon: 'door', tone: 'warning', title: 'Bukas ang pinto', desc: 'Isara ang pinto ng makina para tuloy ang pagpapatuyo.', go: 'S06' }), body: () => U.hero('door', { white: true, tone: 'warn', deco: false }) + '<div class="h2 center mt16">Bukas ang pinto</div><div class="stack mt24"><div class="card listrow"><span class="blue">' + ic('door', 24) + '</span><span class="grow">Isara ang pinto</span></div></div>', actions: () => U.btn('TAPOS NA', 'doorClosed') };
  ACT.doorClosed = () => go(isOn() ? H.monitorId() : H.homeId());
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
