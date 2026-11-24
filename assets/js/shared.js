/* AGAP prototype – Shared batch scenario (SB01–SB55). Several phones share one machine (AGAP-001, samahan SUBAD). */
(function () {
  'use strict';
  const SC = window.SCREENS, ACT = window.ACT, H = window.H, M = window.M, U = window.U, FAC = window.FACTRIGGERS, MC = window.MC;
  const S = () => window.S;
  const b = () => S().batch;
  const isOn = () => b() && b().active;
  const other = () => S().otherName || 'Ate Lita';

  const SB = (window.SB = {});
  SB.homeId = () => {
    const s = S();
    if (!s.connected) return 'ST_WALANG_KONEKSYON';
    if (s.waiting) return s.waiting.kind === 'done' ? 'SB23' : 'SB24';
    if (isOn()) return b().starter === H.me() ? 'SB20' : 'SB19';
    if (s.lock) return s.lock.by === 'me' ? 'SB22' : 'SB21';
    return 'SB01';
  };
  SB.navMid = () => {
    const s = S();
    if (isOn()) return { label: 'May<br>batch', locked: true };
    if (s.lock) return { label: 'May<br>nag-aayos', locked: s.lock.by !== 'me' };
    if (s.waiting) return { label: 'Alisin<br>ang isda', locked: true };
    return { label: 'Bagong<br>Batch', locked: false };
  };
  SB.onNew = () => {
    const s = S();
    if (s.raceNext) { s.raceNext = false; s.lock = { by: 'other', at: Date.now() }; window.save(); return go('SB34'); }
    go('SB11');
  };
  SB.decideNew = () => {
    const s = S(); const home = SB.homeId();
    if (isOn()) { go(home, { replace: true }); return openOverlay('SB25'); }
    if (s.waiting) { go(home, { replace: true }); return openOverlay('SB27'); }
    if (s.lock && s.lock.by === 'other') { go(home, { replace: true }); return openOverlay('SB26'); }
    if (s.lock && s.lock.by === 'me') return go(s.setupStep || 'SB28', { replace: true });
    s.lock = { by: 'me', at: Date.now() }; s.setupStep = 'SB28'; window.save();
    go('SB28', { replace: true });
  };
  SB.onDone = (rec) => {
    const s = S(); H.addRecord(rec);
    s.waiting = { kind: 'done', rec: rec }; s.batch = null; s.cooling = true; window.save();
    notify({ icon: 'circle-check', tone: 'good', title: 'Tapos na ang batch', desc: 'Naabot ang ' + H.kg(rec.target) + ' kg. Palamigin, saka alisin ang isda.', go: 'SB07', cta: 'View' });
    go('SB07');
  };
  SB.afterStop = (rec) => { const s = S(); s.waiting = { kind: 'stopped', rec: rec }; s.lock = null; window.save(); go('SB55'); };

  /* ---------- shared UI bits ---------- */
  const note = (icon, html) => '<div class="card soft mt8 listrow" style="padding:10px 12px"><span class="blue">' + ic(icon, 22) + '</span><span class="grow small">' + html + '</span></div>';
  const freshRow = () => '<div class="card flat listrow tap mt8" data-go="SB37" style="padding:8px 12px;min-height:44px"><span class="blue">' + ic('refresh', 20) + '</span><span class="grow small muted">I-refresh mula sa makina</span></div>';
  const homeBase = { bar: { brand: true }, nav: 'dash', live: true, back: null, keys: { X: 'S18' } };
  const toastOnMount = (msg) => () => setTimeout(() => toast(msg, 'circle-check', 3200), 150);
  const plain = (html) => U.banner('warn', 'hand', '', html);

  /* ---------- Homes (same layout as the original Home) ---------- */
  function freeHome() {
    return U.dashCard() + U.offlineBanner() + U.powerBanner() + U.tempCard() + '<div class="mt12">' + U.btn('+ New Batch', 'navNew', 'primary', U.ready() ? '' : 'disabled') + '</div>' +
      note('users', 'Iisang batch para sa lahat ng cellphone ng SUBAD.') + U.homeCards(false);
  }
  SC.SB01 = Object.assign({ name: 'SB01_Home – libre', body: freeHome }, homeBase);
  SC.SB53 = Object.assign({ name: 'SB53_Home – handa ang makina (toast)', body: freeHome, mounted: toastOnMount('Handa na ang makina sa bagong batch.') }, homeBase);
  SC.SB54 = Object.assign({ name: 'SB54_Home – walang batch (toast)', body: freeHome, mounted: toastOnMount('Walang batch na tumatakbo.') }, homeBase);
  SC.SB12 = Object.assign({ name: 'SB12_Home – natapos ang kandado', body: () => U.dashCard() + '<div class="mt8">' + U.banner('info', 'lock-open', 'Natapos ang oras ng pag-aayos', 'Walang galaw sa loob ng 5 minuto. Libre na ang makina.') + '</div>' + U.tempCard() + '<div class="mt12">' + U.btn('+ New Batch', 'navNew', 'primary', U.ready() ? '' : 'disabled') + '</div>' + U.homeCards(false) }, homeBase);
  const lockOther = () => U.dashCard() + '<div class="mt8">' + U.banner('warn', 'lock', 'Nag-aayos si ' + other(), 'Maghintay muna. Magbubukas pag 5 minutong walang galaw.') + '</div>' + U.tempCard() + '<div class="mt12">' + U.btn(ic('lock', 20) + 'Someone is setting up', 'noop', 'primary', 'disabled') + '</div>' + freshRow() + U.homeCards(false);
  const lockMine = () => U.dashCard() + '<div class="mt8">' + U.banner('info', 'lock-open', 'Ikaw ang nag-aayos', 'Matatapos ang kandado pag 5 minutong walang galaw.') + '</div>' + U.tempCard() + '<div class="mt12">' + U.btn('CONTINUE SETUP', 'resumeSetup') + '</div>' + U.homeCards(false);
  SC.SB21 = Object.assign({ name: 'SB21_Home – may ibang nag-aayos', body: lockOther }, homeBase);
  SC.SB02 = Object.assign({ name: 'SB02_Home – may ibang nag-aayos (alt)', body: lockOther }, homeBase);
  SC.SB22 = Object.assign({ name: 'SB22_Home – ikaw ang nag-aayos', body: lockMine }, homeBase);
  SC.SB03 = Object.assign({ name: 'SB03_Home – ikaw ang nag-aayos (alt)', body: lockMine }, homeBase);
  ACT.resumeSetup = () => { const s = S(); if (!s.lock || s.lock.by !== 'me') s.lock = { by: 'me', at: Date.now() }; window.save(); go(s.setupStep || 'SB28'); };
  function runHome() {
    const bb = b(); if (!bb) return '';
    const mine = bb.starter === H.me();
    return U.dashCard() + note(mine ? 'user' : 'users', mine ? '<b>Ikaw ang nagsimula</b> ng batch na ito.' : 'Sinimulan ni <b>' + bb.starter + '</b>.') + SC['06'].body().replace(U.dashCard(), '') + freshRow();
  }
  SC.SB19 = Object.assign({ name: 'SB19_Home – may batch (iba)', body: runHome }, homeBase);
  SC.SB20 = Object.assign({ name: 'SB20_Home – may batch (ikaw)', body: runHome }, homeBase);
  SC.SB04 = Object.assign({ name: 'SB04_Home – may batch (alt)', body: runHome }, homeBase);
  SC.SB13 = Object.assign({ name: 'SB13_Nav – naka-lock ang Bagong Batch', body: runHome }, homeBase);
  ACT.sbMonitor = () => { if (isOn()) return go(H.monitorId()); go('SB54'); };
  function waitCard(kind) {
    const r = (S().waiting && S().waiting.rec) || S().history[0];
    const done = kind === 'done';
    return U.dashCard() + '<div class="card mt8" style="padding:16px">' + (done ? '<span class="tag-ok">' + ic('circle-check', 16) + 'Tapos</span>' : '<span class="tag-danger">' + ic('pause', 16) + 'Inihinto</span>') +
      '<div class="h2 mt12">' + U.fishName(r.fish) + '</div><p class="p dangerc mt4" style="font-weight:600">Nasa makina pa ang isda.</p>' +
      '<p class="p mt8">' + H.kg(r.initial) + ' → <b>' + H.kg(r.final) + ' kg</b> · ' + H.dur(r.hours) + '</p><p class="small muted mt4">' + (done ? 'Naabot ang target.' : 'Hindi naabot ang ' + H.kg(r.target) + ' kg.') + '</p>' +
      '<div class="mt12">' + plain('Palamigin bago alisin.') + '</div><div class="mt12">' + U.btn('FISH REMOVED', 'toRemoval') + '</div></div>' + U.tempCard() + U.homeCards(true);
  }
  SC.SB23 = Object.assign({ name: 'SB23_Home – naghihintay (tapos)', body: () => waitCard('done') }, homeBase);
  SC.SB24 = Object.assign({ name: 'SB24_Home – naghihintay (inihinto)', body: () => waitCard('stopped') }, homeBase);
  ACT.toRemoval = () => { window.closeOverlay(); const r = (S().waiting && S().waiting.rec) || {}; S().remChecks = [false, false]; window.save(); go(r.mode === 'Biomass' ? 'SB39' : 'SB38'); };

  /* ---------- Blocked dialogs ---------- */
  SC.SB25 = { name: 'SB25_Hindi puwede – may batch', dialog: true, sheet: () => { const bb = b() || { fish: 'Galunggong', starter: other() }; return '<div class="stack">' + U.hero('lock', { size: 's', deco: false, tone: 'warn' }) + '<div class="h2 center">May batch na tumatakbo</div><p class="p center muted">Hintaying matapos.</p><div class="card flat listrow"><span class="blue">' + ic('fish', 24) + '</span><span class="grow"><b>' + U.fishName(bb.fish) + '</b><div class="small muted">Sinimulan ni ' + bb.starter + '</div></span></div>' + U.btn('MONITOR', 'blockedMonitor') + U.btn('Close', 'close', 'secondary') + '</div>'; } };
  ACT.blockedMonitor = () => { window.closeOverlay(); go(H.monitorId()); };
  SC.SB26 = { name: 'SB26_Hindi puwede – may nag-aayos', dialog: true, sheet: () => '<div class="stack">' + U.hero('lock', { size: 's', deco: false, tone: 'warn' }) + '<div class="h2 center">May nag-aayos ng makina</div><p class="p center muted">Nag-aayos si ' + other() + '. Maghintay muna.</p>' + U.btn('Close', 'close', 'secondary') + '</div>' };
  SC.SB27 = { name: 'SB27_Hindi puwede – may isda pa', dialog: true, sheet: () => '<div class="stack">' + U.hero('fish', { size: 's', deco: false, tone: 'warn' }) + '<div class="h2 center">Hindi pa naaalis ang isda</div><p class="p center muted">Alisin muna ang isda.</p>' + U.btn('FISH REMOVED', 'toRemoval') + U.btn('Close', 'close', 'secondary') + '</div>' };

  /* ---------- SB11 Checking machine before a new batch ---------- */
  SC.SB11 = {
    name: 'SB11_Sinusuri ang makina', bar: { title: 'Sinusuri ang makina' }, nav: 'new', transient: true, back: null,
    body: () => '<div style="height:120px"></div><div class="center"><div class="spinner" style="margin:0 auto"></div></div><div class="h2 center mt16">Sinusuri ang makina…</div><p class="p muted center mt8">Kinukuha ang pinakabagong lagay ng batch.</p>',
    after: [1300, () => SB.decideNew()]
  };

  /* ---------- Setup (owner) SB28–SB33 ---------- */
  function setupShell(step, inner) {
    return '<div class="row" style="gap:6px">' + [1, 2, 3, 4].map((i) => '<span style="flex:1;height:6px;border-radius:3px;background:' + (i <= step ? 'var(--blue)' : 'var(--sky)') + '"></span>').join('') + '</div><div class="row mt8" style="justify-content:space-between"><b class="blue">Hakbang ' + step + ' sa 4</b><span class="lock-badge">' + ic('lock-open', 14) + 'Hawak mo ang kandado</span></div>' + inner;
  }
  const setupBase = { bar: { title: 'Ihanda ang makina', back: () => openOverlay('SB33') }, back: () => openOverlay('SB33'), keys: { Escape: () => openOverlay('SB33') } };
  SC.SB28 = Object.assign({
    name: 'SB28_Ayos 1 – timbangin ang tray', enter: () => { S().setupStep = 'SB28'; window.save(); },
    body: () => setupShell(1, U.hero('scale', { size: 'm' }) + '<div class="h2 center mt12">Tinitimbang ang walang lamang tray…</div><p class="p muted center mt8">Huwag galawin ang makina.</p>'),
    actions: () => '<button class="btn primary" style="opacity:.75"><span class="spinner s" style="border-color:rgba(255,255,255,.35);border-top-color:#fff"></span>Tinitimbang…</button>',
    after: [2600, () => { if (!SC.SB33._open) go('SB29', { replace: true }); else SC.SB33._pending = true; }]
  }, setupBase);
  SC.SB29 = Object.assign({ name: 'SB29_Ayos 2 – ilagay ang tray', enter: () => { S().setupStep = 'SB29'; window.save(); }, body: () => setupShell(2, U.hero('trays', { size: 'm' }) + '<div class="h2 center mt12">Ilagay ang mga tray ng isda</div><p class="p muted center mt8">Ipantay ang bawat tray. Isara ang pinto.</p>'), actions: () => U.btn('Loaded', ':SB30') }, setupBase);
  SC.SB30 = Object.assign({ name: 'SB30_Ayos 3 – pinagmulan ng init', enter: () => { S().setupStep = 'SB30'; window.save(); }, body: () => setupShell(3, U.hero(S().power === 'none' ? 'battery' : 'plug-zap', { size: 'm' }) + '<div class="h2 center mt12">' + (S().power === 'none' ? 'Biomass' : 'Kuryente') + ' ang gagamitin</div><div class="center mt8">' + (S().power === 'none' ? U.chip('triangle-alert', 'Walang kuryente', 'warn') : U.chip('circle-check', 'May kuryente', 'ok')) + '</div><p class="p muted center mt12">Kusang nakita ng makina.</p>'), actions: () => U.btn('Next', ':SB31') }, setupBase);
  SC.SB31 = Object.assign({ name: 'SB31_Ayos 4 – unang timbang', enter: () => { S().setupStep = 'SB31'; window.save(); }, body: () => setupShell(4, U.hero('scale', { size: 'm', tone: 'ok' }) + '<div class="h3 center mt12">Unang timbang</div><div class="huge center mt8">26.4 kg</div><div class="center mt8">' + U.chip('circle-check', 'Tama', 'ok') + '</div>'), actions: () => U.btn('Continue', 'setupToForm') }, setupBase);
  ACT.setupToForm = () => { const s = S(); s.form = { fish: 'Galunggong', target: 17.2, temp: 68 }; s.setupStep = '11'; window.save(); go('11'); };
  SC.SB33 = {
    name: 'SB33_Iwan ang pag-aayos?', base: null,
    enter: () => { SC.SB33._open = true; }, onClose: () => { SC.SB33._open = false; if (SC.SB33._pending) { SC.SB33._pending = false; if (window.curScreen() === 'SB28') go('SB29', { replace: true }); } },
    sheet: () => '<div class="stack"><div class="h1">Iwan ang pag-aayos?</div><p class="p muted">Magagamit na ng iba ang makina.</p>' + U.btn('YES, LEAVE', 'leaveSetup') + U.btn('No', 'closeSB33', 'secondary') + '</div>'
  };
  ACT.closeSB33 = () => { window.closeOverlay(); SC.SB33.onClose(); };
  ACT.leaveSetup = () => { SC.SB33._open = false; SC.SB33._pending = false; window.closeOverlay(); const s = S(); s.lock = null; s.setupStep = null; window.save(); go('SB01'); toast('Binitawan ang kandado', 'lock-open'); };
  SC.SB32 = { name: 'SB32_Natapos ang oras ng pag-aayos', bar: { brand: true }, back: () => go(SB.homeId()), body: () => U.hero('hourglass', { tone: 'warn' }) + '<div class="h1 center mt12">Natapos ang oras ng pag-aayos</div><p class="p muted center mt8">Walang galaw sa loob ng 5 minuto. Binitawan ang makina.</p>', actions: () => U.btn('START AGAIN', 'navNew') + U.btn('Home', 'goHome', 'secondary') };
  SC.SB34 = { name: 'SB34_May nauna na', bar: { title: 'Pag-aayos', back: () => go(SB.homeId()) }, back: () => go(SB.homeId()), body: () => U.hero('users', { tone: 'warn' }) + '<div class="h2 center mt12">May nauna na</div><p class="p center muted mt8">Nag-aayos si ' + other() + '. Maghintay muna.</p>', actions: () => U.btn('OK', 'goHome') };
  SC.SB35 = {
    name: 'SB35_Nasimulan na ang batch', bar: { brand: true }, back: null, transient: true,
    body: () => { const bb = b() || { fish: 'Galunggong', starter: other() }; return U.hero('fish', { tone: 'warn' }) + '<div class="h1 center mt12">Kasisimula lang ng batch</div><p class="p muted center mt8">Ni ' + bb.starter + ' · ' + U.fishName(bb.fish) + '</p><p class="p center mt12">Dadalhin ka sa monitoring…</p><div class="center mt16"><span class="spinner s" style="display:inline-block"></span></div>'; },
    after: [2600, () => go('SB05')]
  };
  SC.SB36 = {
    name: 'SB36_Sinisimulan – sinusuri ang makina', bar: { title: 'Sinisimulan' }, back: null, transient: true,
    body: () => '<div style="height:120px"></div><div class="center"><div class="spinner" style="margin:0 auto"></div></div><div class="h2 center mt16">Sinusuri ang makina…</div><p class="p muted center mt8">Sarado ba ang pinto? Pantay ba ang tray?</p>',
    after: [1800, () => { const s = S(); if (s.raceBatchNext) { s.raceBatchNext = false; window.save(); FAC.oStart(true); return; } go('ST_KINUKUHA'); }]
  };

  /* ---------- Operator name SB14–SB16 (only if the account has no name) ---------- */
  function nameView(err, val) {
    return '<div class="authhero"><div class="lg"><img src="' + window.LOGO + '" alt="AGAP" data-logo><b>AGAP</b></div><h2>Ano ang pangalan mo?</h2><div class="sub">Makikita ito ng ibang gumagamit ng makina.</div></div>' +
      '<div class="card mt16" style="padding:20px"><div class="field"><label>Pangalan ng operator</label><div class="input ' + (err ? 'error' : 'focus') + '"><input id="opIn" value="' + H.esc(val || '') + '" placeholder="hal. Mang Jun" maxlength="20" autocomplete="off"></div>' + (err ? '<div class="err">' + ic('circle-alert', 16) + 'Kahit 2 letra.</div>' : '<div class="hint">2–20 letra</div>') + '</div></div>';
  }
  SC.SB14 = { name: 'SB14_Pangalan ng operator', bar: { brand: true }, back: null, body: () => nameView(false, S().opDraft || ''), actions: () => U.btn('NEXT', 'opNext'), mounted: () => { const i = document.getElementById('opIn'); if (i) i.addEventListener('keydown', (e) => { if (e.key === 'Enter') ACT.opNext(); }); } };
  SC.SB15 = { name: 'SB15_Pangalan – mali', bar: { brand: true }, back: 'SB14', body: () => nameView(true, S().opDraft || 'J'), actions: () => U.btn('NEXT', 'opNext') };
  SC.SB16 = { name: 'SB16_Pangalan – maligayang pagdating', bar: { brand: true }, back: null, transient: true, body: () => nameView(false, S().operator || 'Mang Jun'), mounted: () => setTimeout(() => toast('Maligayang pagdating, ' + H.esc(S().operator || 'Mang Jun') + '!', 'circle-check', 1500), 50), after: [1600, () => go('03')] };
  ACT.opNext = () => { const i = document.getElementById('opIn'); const v = (i ? i.value : '').trim(); S().opDraft = v; window.save(); if (v.length < 2) return go('SB15', { replace: true }); S().operator = v; window.save(); go('SB16', { replace: true }); };

  /* ---------- Machine check / sync ---------- */
  SC.SB17 = {
    name: 'SB17_Sinusuri ang lagay ng makina', bar: { brand: true }, back: null, transient: true,
    body: () => '<div style="height:120px"></div><div class="center"><div class="spinner" style="margin:0 auto"></div></div><div class="h2 center mt16">Sinusuri ang makina…</div><p class="p muted center mt8">Kinukuha ang kasalukuyang batch.</p>',
    after: [1800, () => { const s = S(); if (s.syncFailNext) { s.syncFailNext = false; window.save(); return go('SB18'); } go(SB.homeId()); }]
  };
  SC.SB18 = { name: 'SB18_Hindi masuri ang makina', bar: { brand: true }, back: () => go('03'), body: () => U.hero('circle-alert', { tone: 'danger' }) + '<div class="h1 center mt12">Hindi mabasa ang makina</div><p class="p muted center mt8">Hindi alam ang lagay ng batch. Subukan ulit.</p>', actions: () => U.btn(ic('refresh', 20) + 'Retry', ':SB17') + U.btn('Back', ':03', 'secondary') };
  SC.SB37 = {
    name: 'SB37_Nire-refresh mula sa makina', bar: { brand: true }, nav: 'dash', back: null, transient: true,
    body: () => '<div style="height:120px"></div><div class="center"><div class="spinner" style="margin:0 auto"></div></div><div class="h2 center mt16">Nire-refresh…</div><p class="p muted center mt8">Kinukuha ang pinakabago mula sa ' + S().machineId + '.</p>',
    after: [1600, () => go(SB.homeId())]
  };

  /* ---------- SB05 Monitor (shared) + stop sheets ---------- */
  SC.SB05 = {
    name: 'SB05_Subaybayan – shared', bar: { title: 'Subaybayan', back: () => go(SB.homeId()) }, nav: 'dash', live: true, back: () => go(SB.homeId()),
    keys: { L: () => { S().connected = false; window.save(); go('S04'); }, H: 'S05', D: 'S06', E: 'S07', X: 'S18' },
    enter: () => { if (!isOn()) go(SB.homeId(), { replace: true }); },
    body: () => (b() ? SC['15'].body() + '<p class="tiny muted mt12">Puwedeng ihinto ng kahit sino sa SUBAD ang batch na ito.</p>' : ''),
    actions: () => U.btn('Stop', 'sbAskStop', 'danger')
  };
  const origAskStop = ACT.askStop; ACT.askStop = () => (S().scenario === 'shared' ? ACT.sbAskStop() : origAskStop());
  ACT.sbAskStop = () => openOverlay(b() && b().starter === H.me() ? 'SB41' : 'SB06');
  SC.SB06 = { name: 'SB06_Ihinto ang batch ng iba?', sheet: () => { const bb = b() || { starter: other() }; return '<div class="stack"><div class="h1">Ihinto ang batch ni ' + bb.starter + '?</div><p class="p muted">Titigil ang pag-init. Makikita ito ng lahat.</p>' + U.btn('YES, STOP', 'doStop', 'dangerfill') + U.btn('No', 'close', 'secondary') + '</div>'; } };
  SC.SB41 = { name: 'SB41_Ihinto ang batch mo?', sheet: () => { const bb = b(); if (!bb) return ''; return '<div class="stack"><div class="h1">Ihinto ang batch mo?</div><p class="p muted">' + U.fishName(bb.fish) + ' • ' + H.kg(M.weight(bb)) + ' kg • ' + H.dur(bb.h) + '</p>' + U.btn('YES, STOP', 'doStop', 'dangerfill') + U.btn('No', 'close', 'secondary') + '</div>'; } };

  /* ---------- Results, removal ---------- */
  function resultView(kind) {
    const r = (S().waiting && S().waiting.rec) || S().history[0];
    const done = kind === 'done';
    return (done ? U.chip('circle-check', 'Naabot ang target', 'ok') : U.chip('pause', 'Inihinto', 'danger')) +
      '<div class="h1 mt12">' + (done ? 'Tapos na ang batch' : 'Naihinto ang batch') + '</div><p class="p dangerc mt4" style="font-weight:600">Nasa makina pa ang isda.</p>' +
      '<div class="card mt12" style="padding:16px"><div class="row" style="justify-content:space-between"><div><div class="muted small">Simula</div><div class="h1">' + H.kg(r.initial) + ' kg</div></div>' + ic('arrow-right', 18) + '<div><div class="muted small">Huli</div><div class="h1" style="color:var(--blue)">' + H.kg(r.final) + ' kg</div></div></div>' +
      '<div class="kv mt8"><span class="muted">Oras</span><b>' + H.dur(r.hours) + '</b></div><div class="kv"><span class="muted">Average na temp</span><b>' + r.temp + '°C</b></div><div class="kv"><span class="muted">Init</span><b>' + U.modeLabel(r.mode) + '</b></div></div>' +
      '<div class="mt12">' + plain('Palamigin muna. Pindutin ang "Fish removed" kapag wala nang laman ang tray.') + '</div>';
  }
  SC.SB07 = { name: 'SB07_Tapos – alisin ang isda', bar: { title: 'Tapos na ang batch', back: () => go(SB.homeId()) }, back: () => go(SB.homeId()), live: true, body: () => resultView('done'), actions: () => U.btn('FISH REMOVED', 'toRemoval') + U.btn('Summary', 'sbSummary', 'secondary') };
  SC.SB08 = { name: 'SB08_Inihinto – alisin ang isda', bar: { title: 'Naihinto ang batch', back: () => go(SB.homeId()) }, back: () => go(SB.homeId()), live: true, body: () => resultView('stopped'), actions: () => U.btn('FISH REMOVED', 'toRemoval') + U.btn('Summary', 'sbSummary', 'secondary') };
  ACT.sbSummary = () => { const r = (S().waiting && S().waiting.rec) || S().history[0]; S().viewRec = r.id; window.save(); go(r.status === 'done' ? '26' : 'SB52'); };
  SC.SB09 = { name: 'SB09_Kumpirmahing naalis ang isda', base: () => (/SB3[89]|SB40|SB55/.test(window.curScreen() || '') ? null : 'SB07'), sheet: () => '<div class="stack"><div class="h1">Naalis na lahat ng isda?</div><p class="p muted">Dapat malamig at walang laman ang makina.</p>' + U.btn('YES, REMOVED', 'confirmRemoved') + U.btn('No', 'close', 'secondary') + '</div>' };
  ACT.confirmRemoved = () => { window.closeOverlay(); const s = S(); s.waiting = null; s.cooling = false; window.save(); go('SB53'); };
  function removalView(bio) {
    const s = S(); const c = s.remChecks || (s.remChecks = [false, false]);
    const items = bio ? ['Naalis lahat ng isda sa tray', 'Nakuha na ang abo'] : ['Naalis lahat ng isda sa tray'];
    return '<div class="h1">Alisin ang isda</div><p class="p muted mt8">Kailangan bago ang bagong batch.</p>' +
      '<div class="card mt12">' + items.map((t, i) => U.check(c[i], t, 'remTick', i)).join('') + '</div>' +
      '<div class="mt12">' + plain(bio ? 'Palamigin bago hawakan o linisin ang abo.' : 'Palamigin bago hawakan.') + '</div>';
  }
  function removalActions(bio) { const c = S().remChecks || []; const ok = bio ? c[0] && c[1] : c[0]; return U.btn('FISH REMOVED', 'askRemoved', 'primary', ok ? '' : 'disabled') + U.btn('Later', 'goHome', 'secondary'); }
  const remBase = { back: () => go(SB.homeId()) };
  SC.SB38 = Object.assign({ name: 'SB38_Alisin ang isda – kuryente', bar: { title: 'Alisin ang isda', back: () => go(SB.homeId()) }, body: () => removalView(false), actions: () => removalActions(false) }, remBase);
  SC.SB39 = Object.assign({ name: 'SB39_Alisin ang isda – biomass', bar: { title: 'Alisin ang isda', back: () => go(SB.homeId()) }, body: () => removalView(true), actions: () => removalActions(true) }, remBase);
  SC.SB40 = Object.assign({ name: 'SB40_Alisin ang isda – biomass (naka-check)', bar: { title: 'Alisin ang isda', back: () => go(SB.homeId()) }, enter: () => { S().remChecks = [true, true]; window.save(); rerender(); }, body: () => removalView(true), actions: () => removalActions(true) }, remBase);
  SC.SB55 = Object.assign({ name: 'SB55_Naihinto ang batch (toast)', bar: { title: 'Alisin ang isda', back: () => go(SB.homeId()) }, enter: () => { S().remChecks = [false, false]; window.save(); }, body: () => removalView(false), actions: () => removalActions(false), mounted: () => setTimeout(() => toast('Naihinto ang batch.', 'pause', 3000), 100) }, remBase);
  ACT.remTick = (i) => { const c = S().remChecks; c[+i] = !c[+i]; window.save(); if (window.curScreen() === 'SB39' && c[0] && c[1]) return go('SB40', { replace: true }); rerender(); };
  ACT.askRemoved = () => openOverlay('SB09');

  /* ---------- Outage answered by the other phone ---------- */
  function powerOther(bio) {
    return U.hero('unplug', { size: 'm' }) + '<div class="mt12">' + U.chip('plug-zap', 'Walang kuryente', 'danger') + '</div>' +
      '<div class="mt12">' + U.banner(bio ? 'warn' : 'info', bio ? 'flame' : 'pause', 'Sumagot si ' + other() + ': ' + (bio ? 'ituloy gamit ang biomass' : 'ihinto'), bio ? 'Kumpirmahin ang ayos bago magpainit.' : 'Naka-save sa Rekord. Alisin ang isda kapag malamig na.') + '</div>' + U.batCard();
  }
  SC.SB42 = { name: 'SB42_Walang kuryente – biomass ang pinili ng iba', bar: { title: 'Kuryente', back: () => go(SB.homeId()) }, live: true, back: () => go(SB.homeId()), body: () => powerOther(true), actions: () => U.btn('BIOMASS SETUP', 'toBioPrep') };
  ACT.toBioPrep = () => { window.closeOverlay(); S().altMode = 'Biomass'; S().prep = null; window.save(); go('20'); };
  SC.SB44 = { name: 'SB44_Walang kuryente – ihinto ang pinili ng iba', bar: { title: 'Kuryente', back: () => go(SB.homeId()) }, live: true, back: () => go(SB.homeId()), body: () => powerOther(false), actions: () => U.btn('VIEW RECORDS', ':SB46') };
  SC.SB43 = { name: 'SB43_Walang kuryente – biomass (sheet)', base: '18', scrimClose: false, sheet: () => '<div class="stack">' + U.chip('flame', 'Sumagot si ' + other(), 'warn') + '<div class="h1">Ituloy gamit ang biomass</div><p class="p muted">Kumpirmahin ang ayos bago magpainit.</p>' + U.btn('BIOMASS SETUP', 'toBioPrep') + '</div>' };
  SC.SB45 = { name: 'SB45_Walang kuryente – inihinto (sheet)', base: '18', scrimClose: false, sheet: () => '<div class="stack">' + U.chip('pause', 'Sumagot si ' + other(), '') + '<div class="h1">Inihinto ang pagpapatuyo</div><p class="p muted">Naka-save sa Rekord.</p>' + U.btn('VIEW RECORDS', 'sheetToRek') + '</div>' };
  ACT.sheetToSB05 = () => { window.closeOverlay(); go('SB05'); };
  ACT.sheetToRek = () => { window.closeOverlay(); go('SB46'); };

  /* ---------- Records ---------- */
  SC.SB46 = {
    name: 'SB46_Rekord – kinukuha', bar: { title: 'Rekord', back: () => go(SB.homeId()) }, nav: 'rekord', transient: true, back: () => go(SB.homeId()),
    body: () => '<div style="height:100px"></div><div class="center"><div class="spinner" style="margin:0 auto"></div></div><p class="p muted center mt16">Kinukuha ang rekord…</p>',
    after: [1300, () => { const s = S(); if (s.histOffline || !s.connected) { s.histOffline = false; window.save(); return go('SB47', { replace: true }); } go(s.noHistory || !s.history.length ? 'ST_WALANG_REKORD' : 'SB10', { replace: true }); }]
  };
  SC.SB47 = { name: 'SB47_Rekord – offline', bar: { title: 'Rekord', back: () => go(SB.homeId()) }, nav: 'rekord', back: () => go(SB.homeId()), body: () => U.hero('wifi-off', {}) + '<div class="h2 center mt12">Hindi makuha ang rekord</div><p class="p muted center mt8">Kumonekta sa makina.</p><div class="mt16">' + U.btn('Connect', ':03') + '</div>' };
  SC.SB10 = { name: 'SB10_Rekord – shared', bar: { title: 'Rekord', back: () => go(SB.homeId()) }, nav: 'rekord', back: () => go(SB.homeId()), body: () => '<div class="small muted">Pareho ang rekord sa lahat ng cellphone ng SUBAD.</div><div class="stack mt8" style="gap:8px">' + S().history.map(U.recCard).join('') + '</div>' };
  SC.SB52 = {
    name: 'SB52_Rekord – inihintong batch', bar: { title: 'Buod', back: () => go(S().scenario === 'shared' ? 'SB10' : '25') }, nav: 'rekord', back: () => go(S().scenario === 'shared' ? 'SB10' : '25'),
    body: () => {
      const r = S().history.find((x) => x.id === S().viewRec && x.status !== 'done') || S().history.find((x) => x.status !== 'done') || { fish: 'Galunggong', date: '8 Nobyembre 2026', initial: 26.4, final: 21.8, target: 17.2, hours: 4.08, mode: 'Electric', starter: 'Mang Jun', temp: 68, stopAt: .645, stoppedBy: other() };
      return '<div class="row" style="justify-content:space-between"><div><div class="h2">' + U.fishName(r.fish) + '</div><div class="small muted mt4">' + r.date + '</div></div>' + U.chip(U.supplyIcon(r.mode), U.modeLabel(r.mode), 'blue') + '</div>' +
        '<div class="card mt12"><div class="h1">' + H.kg(r.initial) + ' → ' + H.kg(r.final) + ' kg</div><div class="kv mt8"><span class="muted">Oras</span><b>' + H.dur(r.hours) + '</b></div><div class="kv"><span class="muted">Average na temp</span><b>' + r.temp + '°C</b></div><div class="kv"><span class="muted">Inihinto ni</span><b>' + (r.stoppedBy || other()) + '</b></div>' + (r.reason ? '<div class="kv"><span class="muted">Dahilan</span><b>' + r.reason + '</b></div>' : '') + '<div class="mt8"><span class="tag-danger">Hindi naabot ang ' + H.kg(r.target) + ' kg</span></div></div>' +
        '<div class="card mt8"><div class="h3">Timbang (kg)</div><div class="mt8">' + U.graph({ initial: r.initial, target: r.target, dur: r.hours / (r.stopAt || .6), h: r.hours, stopAt: r.stopAt || .6, xlabels: [0, '1 oras', '2 oras', H.dur(r.hours)] }) + '</div></div>';
    }
  };
  const origOpenRec = ACT.openRec;
  ACT.openRec = (id) => { if (S().scenario !== 'shared') return origOpenRec(id); S().viewRec = id; window.save(); const r = S().history.find((x) => x.id === id); go(r && r.status !== 'done' ? 'SB52' : '26'); };

  /* ---------- Operator edit SB48–SB50 ---------- */
  SC.SB48 = {
    name: 'SB48_Palitan ang pangalan', base: '29', enter: () => { S().opErr = false; window.save(); },
    sheet: () => '<div class="stack"><div class="h2">Pangalan ng operator</div><div class="field"><div class="input ' + (S().opErr ? 'error' : 'focus') + '"><input id="opEdit" value="' + H.esc(S().opErr ? (S().opDraft || 'J') : H.me()) + '" maxlength="20" autocomplete="off"></div>' + (S().opErr ? '<div class="err">' + ic('circle-alert', 16) + 'Kahit 2 letra.</div>' : '<div class="hint">2–20 letra</div>') + '</div>' + U.btn('SAVE', 'opSave') + U.btn('Cancel', 'close', 'secondary') + '</div>'
  };
  SC.SB49 = { name: 'SB49_Palitan ang pangalan – mali', base: '29', enter: () => { S().opErr = true; S().opDraft = S().opDraft || 'J'; window.save(); }, sheet: () => { S().opErr = true; return SC.SB48.sheet(); } };
  ACT.opSave = () => { const i = document.getElementById('opEdit'); const v = (i ? i.value : '').trim(); if (v.length < 2) { S().opErr = true; S().opDraft = v; window.save(); window.closeOverlay(); openOverlay('SB49'); return; } S().operator = v; S().opErr = false; window.save(); window.closeOverlay(); go('SB50'); };
  SC.SB50 = Object.assign({}, SC['29'], { name: 'SB50_Na-save ang pangalan (toast)', mounted: () => setTimeout(() => toast('Napalitan ang pangalan.', 'circle-check'), 80) });

  /* ---------- Alerts archive SB51 ---------- */
  SC.SB51 = {
    name: 'SB51_Abiso – shared', bar: { title: 'Abiso ng samahan', back: '16' }, nav: 'abiso', back: '16',
    body: () => {
      const m = 60000, now = Date.now();
      const list = [
        { id: 'a1', icon: 'hourglass', tone: 'warning', title: 'Natapos ang oras ng pag-aayos', desc: 'Libre na ulit ang makina.', at: now - m, unread: true },
        { id: 'a2', icon: 'plug-zap', tone: 'critical', title: 'Nawalan ng kuryente', desc: 'Tingnan ang kuryente ng makina.', at: now - 10 * m, unread: true },
        { id: 'a3', icon: 'flame', tone: 'warning', title: 'Ihanda ang biomass', desc: 'Ihanda ang panggatong.', at: now - 15 * m, unread: true },
        { id: 'a4', icon: 'thermometer', tone: 'warning', title: 'Mataas/mababa ang temperature', desc: 'Tingnan ang chamber.', at: now - 20 * m, unread: false },
        { id: 'a5', icon: 'fish', tone: 'info', title: 'Nagsimula ang pagpapatuyo', desc: 'Binabantayan ang isda mo.', at: now - 245 * m, unread: false }
      ];
      return '<div class="stack" style="gap:8px">' + list.map(U.notifItem).join('').replace(/data-act="openNotif"/g, 'data-act="noop"') + '</div>';
    },
    actions: () => U.btn('Older alerts', ':16A', 'secondary')
  };
  const orig16Actions = SC['16'].actions;
  SC['16'].actions = () => (S().scenario === 'shared' ? U.btn('Shared alerts', ':SB51', 'secondary') : orig16Actions());

  /* ---------- Facilitator triggers for the other phone ---------- */
  Object.assign(FAC, {
    oLock: () => {
      const s = S(); if (isOn() || s.waiting) return toast('May batch o isda pa sa makina', 'info');
      if (s.lock && s.lock.by === 'me') return toast('Ikaw ang may hawak ng kandado', 'info');
      s.lock = { by: 'other', at: Date.now() }; window.save();
      notify({ icon: 'lock', tone: 'warning', title: 'Nag-aayos si ' + other(), desc: 'Maghintay muna bago magsimula ng batch.', go: 'SB21', cta: 'View' });
      if (/^SB(01|12|53|54|21|22)$/.test(window.curScreen())) go(SB.homeId(), { replace: true });
    },
    oLockEnd: () => { const s = S(); if (!s.lock || s.lock.by !== 'other') return toast('Walang kandado si ' + other(), 'info'); s.lock = null; window.save(); notify({ icon: 'lock-open', tone: 'info', title: 'Natapos ang oras ng pag-aayos', desc: 'Libre na ulit ang makina.', go: 'SB12', cta: 'View' }); if (/^SB(21|01|19)$/.test(window.curScreen())) go('SB12', { replace: true }); },
    oStart: (fromRace) => {
      const s = S(); if (isOn()) return toast('May batch na tumatakbo', 'info');
      if (s.waiting) return toast('Alisin muna ang isda', 'info');
      const iWasSetting = s.lock && s.lock.by === 'me';
      const keepForm = s.form; s.form = { fish: 'Galunggong', target: 17.2, temp: 68 };
      H.startBatch(other()); s.form = keepForm; s.lock = null; s.setupStep = null; window.save();
      if (iWasSetting || fromRace === true) return go('SB35');
      if (/^SB(01|12|21|53|54)$/.test(window.curScreen())) go(SB.homeId(), { replace: true });
    },
    oStop: () => {
      if (!isOn()) return toast('Walang batch na tumatakbo', 'info');
      const rec = H.stopBatch(other(), 'Inihinto ni ' + other()); S().waiting = { kind: 'stopped', rec: rec }; window.save();
      notify({ icon: 'pause', tone: 'warning', title: 'Inihinto ni ' + other(), desc: U.fishName(rec.fish) + ' – huminto sa ' + H.kg(rec.final) + ' kg. Alisin ang isda.', go: 'SB08', cta: 'View' });
      if (/^SB(19|20|05|13|04)$|^1[58]|^2[0-3]$|^15A$/.test(window.curScreen())) go('SB08');
    },
    oRemoved: () => { const s = S(); if (!s.waiting) return toast('Walang aalisin', 'info'); s.waiting = null; s.cooling = false; window.save(); notify({ icon: 'circle-check', tone: 'good', title: 'Handa na ang makina', desc: 'Inalis ni ' + other() + ' ang isda.', go: 'SB53', cta: 'View' }); if (/^SB(07|08|23|24|38|39|40|55)$/.test(window.curScreen())) go('SB53'); },
    oBio: () => {
      const s = S(); if (!isOn() || s.power !== 'none') return toast('Gamitin habang walang kuryente at may batch', 'info');
      s.otherDecision = 'bio'; window.save();
      if (window.curScreen() === '18') return openOverlay('SB43');
      notify({ icon: 'flame', tone: 'warning', title: 'Sumagot si ' + other(), desc: 'Ituloy gamit ang biomass. Kumpirmahin ang ayos.', go: 'SB42', cta: 'View' }); go('SB42');
    },
    oItigil: () => {
      const s = S(); if (!isOn() || s.power !== 'none') return toast('Gamitin habang walang kuryente at may batch', 'info');
      const rec = H.stopBatch(other(), 'Nawalan ng kuryente'); s.waiting = { kind: 'stopped', rec: rec }; s.otherDecision = 'stop'; window.save();
      if (window.curScreen() === '18') { go('SB44'); return openOverlay('SB45'); }
      notify({ icon: 'pause', tone: 'warning', title: 'Sumagot si ' + other(), desc: 'Inihinto ang pagpapatuyo. Naka-save sa Rekord.', go: 'SB44', cta: 'View' }); go('SB44');
    },
    oRace: () => { const s = S(); if (s.lock && s.lock.by === 'me') { s.raceBatchNext = true; window.save(); return toast('Mauuna si ' + other() + ' pag nag-confirm ka', 'info'); } s.raceNext = true; window.save(); toast('Kukunin ni ' + other() + ' ang kandado sa susunod mong New Batch', 'info'); },
    myTimeout: () => { const s = S(); if (!s.lock || s.lock.by !== 'me') return toast('Wala sa iyo ang kandado', 'info'); s.lock = null; s.setupStep = null; window.save(); go('SB32'); },
    syncFail: () => { S().syncFailNext = true; window.save(); go('SB17'); },
    reconnect: () => go('SB37'),
    histOff: () => { S().histOffline = true; window.save(); go('SB46'); }
  });

  /* ---------- Shared-mode routing on main screens ---------- */
  ['05', '06'].forEach((id) => { const e = SC[id].enter; SC[id].enter = (o) => { if (S().scenario === 'shared') return go(SB.homeId(), { replace: true }); e && e(o); }; });
  const formBack = () => (S().scenario === 'shared' ? openOverlay('SB33') : go(H.homeId()));
  SC['11'].back = formBack; SC['11'].bar = { title: 'Bagong batch', back: formBack };
})();
