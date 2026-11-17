/* AGAP prototype – "ADD-ON: Shared Batch" scenario (SB01–SB55). Wiring inferred: several phones share one machine (AGAP-001, SUBAD). */
(function () {
  'use strict';
  const SC = window.SCREENS, ACT = window.ACT, H = window.H, M = window.M, U = window.U, FAC = window.FACTRIGGERS;
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
    if (isOn()) return { label: 'May<br>Batch', locked: true };
    if (s.lock) return { label: 'May<br>naghahanda', locked: s.lock.by !== 'me' };
    if (s.waiting) return { label: 'Alisin<br>muna', locked: true };
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
    const s = S(); rec.machine = true; H.addRecord(rec);
    s.waiting = { kind: 'done', rec: rec }; s.batch = null; s.cooling = true; window.save();
    notify({ icon: 'circle-check', tone: 'good', title: 'Tapos na ang Batch', desc: 'Naabot ang target na ' + H.kg(rec.target) + ' kg. Palamigin muna bago alisin ang isda.', go: 'SB07', cta: 'Tingnan' });
    go('SB07');
  };
  SB.afterStop = (rec) => { const s = S(); s.waiting = { kind: 'stopped', rec: rec }; s.lock = null; window.save(); go('SB55'); };

  /* ---------- shared UI bits ---------- */
  const card = (inner, extra) => '<div class="card ' + (extra || '') + '">' + inner + '</div>';
  function sbHeader(sub) { return U.dashCard(sub && sub.greet ? { greet: sub.greet } : {}); }
  function compactHeader() { return U.dashCard(); }
  function quick() { return ''; }
  function note(icon, html, tone) { return '<div class="card ' + (tone || 'soft') + ' mt8 listrow" style="padding:10px 12px"><span class="' + (tone === 'warn' ? 'warnc' : 'blue') + '">' + ic(icon, 22) + '</span><span class="grow small">' + html + '</span></div>'; }
  function freshRow() { return '<div class="card flat listrow tap mt12" data-go="SB37" style="padding:8px 12px;min-height:44px"><span class="blue">' + ic('refresh', 20) + '</span><span class="grow small muted">Suriin  ang sariwang tala ng makina.</span></div>'; }
  ACT.sbMonitor = () => { if (isOn()) return go(H.monitorId()); go('SB54'); };
  function homeMount(msg) { return () => { if (msg) setTimeout(() => toast(msg, 'circle-check', 3200), 150); }; }
  const homeBase = { bar: { brand: true }, nav: 'dash', live: true, back: null, keys: { X: 'S18' } };

  /* ---------- SB01 Tahanan_Libre + toasts ---------- */
  function libreBody() {
    return U.dashCard() + U.powerBanner() + '<div class="mt12">' + U.btn('+ Bagong Batch', 'navNew', 'primary', U.ready() ? '' : 'disabled') + '</div>' +
      note('users', 'Iisa  ang Batch sa lahat ng cellphone ng SUBAD. Sa Makina  galing ang tala.') + U.homeCards(false);
  }
  SC.SB01 = Object.assign({ name: 'SB01_Tahanan_Libre', body: () => libreBody() }, homeBase);
  SC.SB53 = Object.assign({ name: 'SB53_Makina_Handa_Toast', body: () => libreBody(), mounted: homeMount('Handa na ang makina para sa bagong batch.') }, homeBase);
  SC.SB54 = Object.assign({ name: 'SB54_Walang_Tumatakbong_Batch_Toast', body: () => libreBody(), mounted: homeMount('Walang tumatakbong batch.') }, homeBase);
  SC.SB12 = Object.assign({
    name: 'SB12_Natapos_ang_Setup_Lock',
    body: () => U.dashCard() + '<div class="mt12">' + U.banner('info', 'lock-open', 'Natapos na  ang oras ng paghahanda.', 'Walang ginawa sa loob ng 5 minuto. Kinumpirma ng Makina: Walang Batch.') + '</div><div class="mt12">' + U.btn('+ Bagong Batch', 'navNew', 'primary', U.ready() ? '' : 'disabled') + '</div>' + U.homeCards(false)
  }, homeBase);
  /* ---------- Setup lock homes ---------- */
  const lockOther = () => U.dashCard() + '<div class="mt12">' + U.banner('warn', 'lock', 'May nag-aayos ng batch: ' + other(), 'Hintayin muna. Awtomatikong magbubukas pagkalipas ng mga 5 minuto kung hindi ituloy.') + '</div><div class="mt12">' + U.btn(ic('lock', 20) + 'May nag-aayos…', 'noop', 'primary', 'disabled') + '</div>' + freshRow() + U.homeCards(false);
  const lockMine = () => U.dashCard() + '<div class="mt12">' + U.banner('info', 'lock-open', 'Ikaw ang nag-aayos ng batch.', H.esc(H.me()) + ' • SUBAD · Mawawala ang kandado kapag walang ginawa sa loob ng 5 minuto.') + '</div><div class="mt12">' + U.btn('ITULOY ANG PAG-AAYOS', 'resumeSetup') + '</div>' + U.homeCards(false);
  SC.SB21 = Object.assign({ name: 'SB21_Home_Setup_Other', body: lockOther }, homeBase);
  SC.SB02 = Object.assign({ name: 'SB02_Nag_aayos_Ibang_Cellphone', body: lockOther }, homeBase);
  SC.SB22 = Object.assign({ name: 'SB22_Home_Setup_Mine', body: lockMine }, homeBase);
  SC.SB03 = Object.assign({ name: 'SB03_Nag_aayos_May_Ari', body: lockMine }, homeBase);
  ACT.resumeSetup = () => { const s = S(); if (!s.lock || s.lock.by !== 'me') { s.lock = { by: 'me', at: Date.now() }; } window.save(); go(s.setupStep || 'SB28'); };

  /* ---------- Running homes ---------- */
  function runHome() {
    const bb = b(); if (!bb) return '';
    const mine = bb.starter === H.me();
    return U.dashCard() + note(mine ? 'user' : 'users', mine ? '<b>Ikaw ang nagsimula</b> ng batch na ito.' : 'Sinimulan ni <b>' + bb.starter + '</b>. Sa Makina  galing ang pinakabagong tala.') + SC['06'].body().replace(U.dashCard(), '') + freshRow();
  }
  SC.SB19 = Object.assign({ name: 'SB19_Home_Running_Other', body: runHome }, homeBase);
  SC.SB20 = Object.assign({ name: 'SB20_Home_Running_Mine', body: runHome }, homeBase);
  SC.SB04 = Object.assign({ name: 'SB04_Tahanan_Tumatakbo', body: runHome }, homeBase);
  SC.SB13 = Object.assign({ name: 'SB13_Nav_Bagong_Batch_Bawal (nav component)', body: runHome }, homeBase);
  ACT.sbMonitor = () => { if (isOn()) return go(H.monitorId()); go('SB54'); };
  /* ---------- Waiting-for-removal homes ---------- */
  function waitCard(kind) {
    const r = (S().waiting && S().waiting.rec) || S().history[0];
    const done = kind === 'done';
    return U.dashCard() + '<div class="card mt12" style="padding:16px">' + (done ? '<span class="tag-ok">' + ic('circle-check', 16) + 'Tapos na</span>' : '<span class="tag-danger">' + ic('pause', 16) + 'Ihininto</span>') +
      '<div class="h2 mt12">' + r.fish + '</div><p class="p dangerc mt4" style="font-weight:600">Hindi pa naaalis ang isda sa makina.</p>' +
      '<p class="p mt8">Una: ' + H.kg(r.initial) + ' kg → Huli: <b>' + H.kg(r.final) + ' kg</b></p><p class="small muted mt4">' + (done ? 'Naabot ang target na ' + H.kg(r.target) + ' kg.' : 'Hindi naabot ang target na ' + H.kg(r.target) + ' kg.') + '</p><p class="small muted mt4">' + (done ? 'Kabuuang tagal: ' : 'Tagal bago ihinto: ') + H.dur(r.hours) + '</p>' +
      '<div class="mt12">' + U.banner('warn', 'hand', '', 'Palamigin muna  ang makina bago alisin ang isda.').replace('<div class="t"></div><div class="p mt4">', '<div class="p">') + '</div>' + '<div class="mt12">' + U.btn('NAALIS NA ANG ISDA', 'toRemoval') + '</div></div>' + U.homeCards(true);
  }
  SC.SB23 = Object.assign({ name: 'SB23_Home_Waiting_Natapos', body: () => waitCard('done') }, homeBase);
  SC.SB24 = Object.assign({ name: 'SB24_Home_Waiting_Ihininto', body: () => waitCard('stopped') }, homeBase);
  ACT.toRemoval = () => { window.closeOverlay(); const r = (S().waiting && S().waiting.rec) || {}; S().remChecks = [false, false]; window.save(); go(r.mode === 'Biomass' ? 'SB39' : 'SB38'); };

  /* ---------- Blocked dialogs (SB25–27) ---------- */
  SC.SB25 = { name: 'SB25_Blocked_Running', dialog: true, sheet: () => { const bb = b() || { fish: 'Galunggong', starter: other() }; return '<div class="stack">' + U.hero('lock', { size: 's', deco: false, tone: 'warn' }) + '<div class="h2 center">May tumatakbong batch pa .</div><p class="p center muted">Hintayin munang matapos bago magsimula ng bago.</p><div class="card flat listrow"><span class="blue">' + ic('fish', 24) + '</span><span class="grow"><b>' + bb.fish + '</b><div class="small muted">Sinimulan ni ' + bb.starter + '</div></span></div>' + U.btn('SUBAYBAYAN', 'blockedMonitor') + U.btn('ISARA', 'close', 'secondary') + '</div>'; } };
  ACT.blockedMonitor = () => { window.closeOverlay(); go(H.monitorId()); };
  SC.SB26 = { name: 'SB26_Blocked_Setup', dialog: true, sheet: () => '<div class="stack">' + U.hero('lock', { size: 's', deco: false, tone: 'warn' }) + '<div class="h2 center">May nag-aayos ng batch.</div><p class="p center muted">' + other() + ' ang nag-aayos ngayon. Hintayin .</p>' + U.btn('ISARA', 'close', 'secondary') + '</div>' };
  SC.SB27 = { name: 'SB27_Blocked_Removal', dialog: true, sheet: () => '<div class="stack">' + U.hero('fish', { size: 's', deco: false, tone: 'warn' }) + '<div class="h2 center">Hindi pa naaalis ang isda.</div><p class="p center muted">Alisin muna ang isda sa makina bago magsimula ng bago.</p>' + U.btn('NAALIS NA ANG ISDA', 'toRemoval') + U.btn('ISARA', 'close', 'secondary') + '</div>' };

  /* ---------- SB11 Kinukuha ang Batch (before deciding Bagong Batch) ---------- */
  SC.SB11 = {
    name: 'SB11_Kinukuha_ang_Batch', bar: { title: 'Kinukuha ang Batch sa Makina…' }, nav: 'new', transient: true, back: null,
    body: () => '<div class="card soft"><div class="listrow">' + ic(H.connIcon(), 22) + '<b class="grow" style="color:var(--navy)">Konektado sa Makina</b></div><div class="kv"><span class="muted">Samahan:</span><b>SUBAD</b></div><div class="kv"><span class="muted">Makina:</span><b>AGAP-001</b></div></div>' +
      '<div class="center mt24"><div class="spinner" style="margin:0 auto"></div></div><div class="h2 center mt16">Kinukuha  ang Batch…</div><p class="p muted center mt8">Tinitingnan  muna ang pinakabagong tala bago magpatuloy.</p>' +
      '<div class="card mt16 stack" style="gap:8px"><div class="listrow"><span class="dangerc">' + ic('x', 20) + '</span><span class="grow small">Huwag munang magsimula ng bagong Batch.</span></div><div class="listrow"><span class="blue">' + ic('hourglass', 20) + '</span><span class="grow small">Hayaan  munang matapos ang pagkuha ng tala.</span></div></div>',
    actions: () => U.btn('Hindi maaaring magpatuloy', 'noop', 'primary', 'disabled') + '<div class="small muted center">Hindi  kailangang pindutin muli.</div>',
    after: [1300, () => SB.decideNew()]
  };

  /* ---------- Setup (owner) SB28–SB33 ---------- */
  function setupShell(step, inner) {
    return '<div class="banner warn">' + ic('lock-open', 22) + '<div class="small">Ikaw ang nag-aayos. Awtomatikong magbubukas ang makina pagkalipas ng 5 minuto kung walang gagawin.</div></div>' +
      '<div class="row mt16" style="gap:6px">' + [1, 2, 3, 4].map((i) => '<span style="flex:1;height:6px;border-radius:3px;background:' + (i <= step ? 'var(--blue)' : 'var(--sky)') + '"></span>').join('') + '</div><div class="blue mt8" style="font-weight:700">Hakbang ' + step + ' sa 4</div>' + inner;
  }
  const setupBase = { bar: { title: 'Ihanda ang makina', back: () => openOverlay('SB33') }, back: () => openOverlay('SB33'), keys: { Escape: () => openOverlay('SB33') } };
  SC.SB28 = Object.assign({
    name: 'SB28_Startup_1_Owner', enter: () => { S().setupStep = 'SB28'; window.save(); },
    body: () => setupShell(1, U.hero('scale', { size: 'm' }) + '<div class="h2 center mt12">Walang laman na rack – sinusukat ang bigat…</div><p class="p muted center mt8">Alisin muna  ang mga tray ng isda. Huwag  munang galawin ang makina.</p><div class="card soft mt16 listrow"><span class="spinner s"></span><span class="grow"><b>Sinusukat pa</b><div class="small muted">Sandali lang . Kusang susunod ang hakbang.</div></span></div>'),
    actions: () => U.btn('Sinusukat pa…', 'noop', 'primary', 'disabled'),
    after: [2600, () => { if (!SC.SB33._open) go('SB29', { replace: true }); else SC.SB33._pending = true; }]
  }, setupBase);
  SC.SB29 = Object.assign({
    name: 'SB29_Startup_2_Owner', enter: () => { S().setupStep = 'SB29'; window.save(); },
    body: () => setupShell(2, U.hero('trays', { size: 'm' }) + '<div class="h2 center mt12">Ilagay na  ang mga tray ng isda.</div><p class="p muted center mt8">Pantayin  ang laman ng bawat tray. Isara  nang maayos ang pinto.</p><div class="card mt16 listrow"><span class="okc">' + ic('circle-check', 22) + '</span><span class="grow small">Walang laman na rack: nasukat na</span></div>'),
    actions: () => U.btn('Nailagay na', ':SB30')
  }, setupBase);
  SC.SB30 = Object.assign({
    name: 'SB30_Startup_3_Owner', enter: () => { S().setupStep = 'SB30'; window.save(); },
    body: () => setupShell(3, U.hero(S().power === 'none' ? 'battery' : 'plug-zap', { size: 'm' }) + '<div class="small muted center mt12">Nakita ng app:</div><div class="h2 center mt4">Pagpapatuyo gamit ang ' + (S().power === 'none' ? 'Biomass' : 'Kuryente') + '</div><div class="center mt8">' + (S().power === 'none' ? U.chip('triangle-alert', 'Walang kuryente', 'warn') : U.chip('circle-check', 'May sapat na kuryente', 'ok')) + '</div><p class="p muted center mt12">Kusang nakita ng makina ang suplay. Wala  kayong kailangang piliin.</p>'),
    actions: () => U.btn('Susunod', ':SB31')
  }, setupBase);
  SC.SB31 = Object.assign({
    name: 'SB31_Startup_4_Owner', enter: () => { S().setupStep = 'SB31'; window.save(); },
    body: () => setupShell(4, U.hero('scale', { size: 'm', tone: 'ok' }) + '<div class="h3 center mt12">Unang Timbang</div><div class="huge center mt8">26.4 kg</div><div class="center mt8">' + U.chip('circle-check', 'May wastong timbang', 'ok') + '</div><p class="p muted center mt12">Ito  ang timbang ng isda bago patuyuin. Maaari nang gumawa ng bagong Batch.</p>'),
    actions: () => U.btn('Magpatuloy sa Bagong Batch', 'setupToForm')
  }, setupBase);
  ACT.setupToForm = () => { const s = S(); s.form = { fish: 'Galunggong', target: 17.2, temp: 68 }; s.setupStep = '11'; window.save(); go('11'); };
  SC.SB33 = {
    name: 'SB33_Leave_Setup_Confirm', base: null,
    enter: () => { SC.SB33._open = true; }, onClose: () => { SC.SB33._open = false; if (SC.SB33._pending) { SC.SB33._pending = false; if (window.curScreen() === 'SB28') go('SB29', { replace: true }); } },
    sheet: () => '<div class="stack"><div class="h1">Ititigil ang pag-aayos?</div><p class="p">Bibitawan ang pag-aayos para magamit ng iba ang makina. Wala pang nasisimulang Batch.</p>' + U.btn('OO, ITIGIL', 'leaveSetup') + U.btn('HINDI', 'closeSB33', 'secondary') + '</div>'
  };
  ACT.closeSB33 = () => { window.closeOverlay(); SC.SB33.onClose(); };
  ACT.leaveSetup = () => { SC.SB33._open = false; SC.SB33._pending = false; window.closeOverlay(); const s = S(); s.lock = null; s.setupStep = null; window.save(); go('SB01'); toast('Binitawan ang pag-aayos', 'lock-open'); };
  SC.SB32 = {
    name: 'SB32_Setup_Timeout', bar: { brand: true }, back: () => go(SB.homeId()),
    body: () => U.hero('hourglass', { tone: 'warn' }) + '<div class="h1 center mt12">Natapos ang oras ng pag-aayos.</div><p class="small muted center mt8">AGAP-001 • SUBAD</p><p class="p center mt12">Walang nagawa sa loob ng 5 minuto kaya binuksan na ulit ang makina.</p><div class="mt16">' + U.banner('info', 'info', 'Paalala', 'Susuriin muna kung libre ang makina bago magsimulang muli.') + '</div>',
    actions: () => U.btn('MAGSIMULA MULI', 'navNew') + U.btn('BUMALIK SA DASHBOARD', 'goHome', 'secondary')
  };
  SC.SB34 = {
    name: 'SB34_Race_Setup', bar: { title: 'Pag-aayos', back: () => go(SB.homeId()) }, back: () => go(SB.homeId()),
    body: () => '<div class="card soft"><div class="kv"><b>AGAP-001 / SUBAD</b>' + U.chip('plug', 'Kuryente', 'blue') + '</div></div>' + U.hero('users', { tone: 'warn' }) + '<div class="h2 center mt12">May nauna na sa pag-aayos.</div><p class="p center muted mt8">Si ' + other() + ' ang nauna. Hintayin .</p>' +
      '<div class="card mt16 stack" style="gap:6px"><div class="small muted">Sinubukan ang pag-aayos.</div><div class="kv"><span class="muted">Pag-aari:</span><b>' + other() + '</b></div><div class="kv"><span class="muted">Kasalukuyang Operator:</span><b>' + H.esc(H.me()) + '</b></div></div>',
    actions: () => U.btn('OK', 'goHome')
  };
  SC.SB35 = {
    name: 'SB35_Race_Batch', bar: { brand: true }, back: null, transient: true,
    body: () => { const bb = b() || { fish: 'Galunggong', starter: other() }; return U.hero('fish', { tone: 'warn' }) + '<div class="h1 center mt12">May nagsimula na ng batch.</div><p class="p muted center mt8">Ililipat ka sa pagsubaybay.</p><div class="card mt16"><div class="h3">Batch sa Makina</div><div class="kv mt8"><span class="muted">Samahan:</span><b>SUBAD</b></div><div class="kv"><span class="muted">Makina:</span><b>AGAP-001</b></div><div class="kv"><span class="muted">Isda:</span><b>' + bb.fish + '</b></div><div class="kv"><span class="muted">Sinimulan ni:</span><b>' + bb.starter + '</b></div></div><div class="center mt16"><span class="spinner s" style="display:inline-block"></span></div>'; },
    after: [2600, () => go('SB05')]
  };
  SC.SB36 = {
    name: 'SB36_Start_Recheck_Loading', bar: { title: 'Buod ng Batch' }, back: null, transient: true,
    body: () => { const f = S().form || {}; return '<div class="blue" style="font-weight:700">Hakbang 4 sa 4</div><div class="h1 mt8">Tama  ba ang lahat?</div><div class="mt8">' + U.chip('refresh', 'Sinusuri…', 'blue') + '</div><div class="card mt12 stack" style="gap:4px">' +
      [['fish', 'Isda', f.fish], ['scale', 'Unang timbang', '26.4 kg'], ['scale', 'Target na timbang', f.target + ' kg'], ['thermometer', 'Nais na init', f.temp + '°C'], ['plug', 'Kusang nakita', S().power === 'none' ? 'Biomass' : 'Kuryente']].map((x) => '<div class="kv"><span class="row muted">' + ic(x[0], 18) + x[1] + '</span><b>' + x[2] + '</b></div>').join('') +
      '</div><p class="small muted mt12">Sinusuri  muna ang kasalukuyang lagay ng Makina bago magsimula ng bagong Batch. Pakisigurado  nakasara ang pinto at maayos ang mga tray.</p>'; },
    actions: () => '<button class="btn primary" style="opacity:.7"><span class="spinner s" style="border-color:rgba(255,255,255,.35);border-top-color:#fff"></span>Sinusuri…</button>',
    after: [1800, () => { const s = S(); if (s.raceBatchNext) { s.raceBatchNext = false; window.save(); FAC.oStart(true); return; } go('ST_KINUKUHA'); }]
  };

  /* ---------- Operator name SB14–SB16 ---------- */
  function nameView(err, val) {
    return '<div class="authhero"><div class="lg"><img src="' + window.LOGO + '" alt="AGAP" data-logo><b>AGAP</b></div><h2>Ano  ang pangalan mo?</h2><div class="sub">Para malaman ng iba kung sino ang gumagamit ng makina.</div></div>' +
      '<div class="card mt16" style="padding:20px"><div class="field"><label>Pangalan ng Operator</label><div class="input ' + (err ? 'error' : 'focus') + '"><input id="opIn" value="' + H.esc(val || '') + '" placeholder="hal. Mang Jun" maxlength="20" autocomplete="off"></div>' + (err ? '<div class="err">' + ic('circle-alert', 16) + 'Isulat  ang pangalan (2 letra pataas).</div>' : '') + '<div class="hint">Maaari itong baguhin sa Mga Ayos.</div><div class="hint">Gumamit  ng 2–20 karakter.</div></div></div>';
  }
  SC.SB14 = { name: 'SB14_Pangalan_Empty', bar: { brand: true }, back: null, body: () => nameView(false, S().opDraft || ''), actions: () => U.btn('SUSUNOD', 'opNext'), mounted: () => { const i = document.getElementById('opIn'); if (i) i.addEventListener('keydown', (e) => { if (e.key === 'Enter') ACT.opNext(); }); } };
  SC.SB15 = { name: 'SB15_Pangalan_Error', bar: { brand: true }, back: 'SB14', body: () => nameView(true, S().opDraft || 'J'), actions: () => U.btn('SUSUNOD', 'opNext') };
  SC.SB16 = {
    name: 'SB16_Pangalan_Welcome', bar: { brand: true }, back: null, transient: true, body: () => nameView(false, S().operator || 'Mang Jun'), actions: () => U.btn('SUSUNOD', 'noop', 'primary', 'disabled'),
    mounted: () => setTimeout(() => toast('Maligayang pagdating , ' + H.esc(S().operator || 'Mang Jun') + '!', 'circle-check', 1500), 50),
    after: [1600, () => go(S().permOK ? '03' : 'S01')]
  };
  ACT.opNext = () => { const i = document.getElementById('opIn'); const v = (i ? i.value : '').trim(); S().opDraft = v; window.save(); if (v.length < 2) return go('SB15', { replace: true }); S().operator = v; window.save(); go('SB16', { replace: true }); };

  /* ---------- SB17/SB18/SB37 machine check ---------- */
  SC.SB17 = {
    name: 'SB17_Sinusuri_ang_Makina', bar: { title: 'Sinusuri ang makina…' }, back: null, transient: true,
    body: () => '<div class="card soft"><div class="listrow">' + ic(H.connIcon(), 22) + '<b class="grow" style="color:var(--navy)">Konektado  sa makina</b></div><div class="kv"><span class="muted">Samahan:</span><b>SUBAD</b></div><div class="kv"><span class="muted">Makina:</span><b>AGAP-001</b></div></div><div class="center mt24"><div class="spinner" style="margin:0 auto"></div></div><p class="p muted center mt16">Kinukuha  ang kasalukuyang Batch ng makina bago ipakita ang Dashboard.</p>',
    after: [1800, () => { const s = S(); if (s.syncFailNext) { s.syncFailNext = false; window.save(); return go('SB18'); } go(SB.homeId()); }]
  };
  SC.SB18 = {
    name: 'SB18_Sync_Failure', bar: { title: 'Pagsusuri ng makina', back: '03' }, back: '03',
    body: () => U.hero('circle-alert', { tone: 'danger' }) + '<div class="mt12">' + U.chip('circle-alert', 'Hindi masuri ang makina.', 'danger') + '</div><div class="h1 mt12">Hindi masuri ang makina.</div><p class="p mt8">Hindi  makuha ang kasalukuyang Batch. Hindi pa  tiyak ang kalagayan ng makina.</p><div class="card mt16"><div class="small muted">Makina at samahan</div><b class="p" style="display:block;margin-top:4px">AGAP-001<br>SUBAD</b></div>',
    actions: () => U.btn('Subukan Muli', ':SB17') + U.btn('Bumalik', ':03', 'secondary')
  };
  SC.SB37 = {
    name: 'SB37_Reconnect_Recheck', bar: { brand: true }, nav: 'dash', back: null, transient: true,
    body: () => { const bb = b(); return '<div class="banner info">' + '<span class="spinner s"></span><div class="t">Nakakonekta muli. Kinukuha ang tala…</div></div><div class="card mt12"><div class="small muted">Huling nabasang lagay</div><b>SUBAD • AGAP-001</b></div>' +
      (bb ? '<div class="card mt12 listrow" style="padding:12px;opacity:.75">' + U.ring(M.pct(bb)) + '<div class="grow"><div class="small muted">Huling nabasang Batch</div><b style="color:var(--navy)">' + bb.fish + '</b><div class="h2">' + H.kg(M.weight(bb)) + ' kg</div><div class="small muted">Huling nabasang tagal: ' + H.dur(bb.h) + '</div></div></div>' : '') +
      '<div class="center mt12">' + U.chip('refresh', 'Sinusuri…', 'blue') + '</div>' + quick([['activity', 'Subaybayan', 'noop'], ['bell', 'Abiso', 'noop'], ['help', 'Tulong', 'noop']]); },
    after: [1800, () => go(SB.homeId())]
  };

  /* ---------- SB05 Subaybayan (shared) + stop sheets ---------- */
  SC.SB05 = {
    name: 'SB05_Subaybayan_Shared', bar: { title: 'Subaybayan', back: () => go(SB.homeId()) }, nav: 'dash', live: true, back: () => go(SB.homeId()),
    keys: { L: () => { S().connected = false; window.save(); go('S04'); }, H: 'S05', D: 'S06', E: 'S07', X: 'S18' },
    enter: () => { if (!isOn()) go(SB.homeId(), { replace: true }); },
    body: () => {
      const bb = b(); if (!bb) return '';
      return SC['15'].body().replace('Sinimulan ni ' + bb.starter + ' · ', 'Sinimulan ni ' + bb.starter + ' · SUBAD · ') + '<p class="tiny muted mt12">Mula sa Makina ang tala. Sinumang naka-login sa SUBAD ay puwedeng maghinto.</p>';
    },
    actions: () => U.btn('Ihinto', 'sbAskStop', 'danger')
  };
  const origAskStop = ACT.askStop; ACT.askStop = () => (S().scenario === 'shared' ? ACT.sbAskStop() : origAskStop());
  ACT.sbAskStop = () => openOverlay(b() && b().starter === H.me() ? 'SB41' : 'SB06');
  SC.SB06 = { name: 'SB06_Ihinto_May_Pangalan', sheet: () => { const bb = b() || { starter: other() }; return '<div class="stack"><span style="width:14px;height:14px;border-radius:3px;background:var(--danger);display:block"></span><div class="h1">Ihihinto  ba ang Batch na sinimulan ni ' + bb.starter + '?</div><p class="p">Titigil  ang pag-init. Hindi pa makakapagsimula ng bagong Batch hangga’t may isda pa sa Makina.</p>' + U.banner('warn', 'users', '', 'Kahit sinong naka-login sa SUBAD ay puwede . Basahin muna ang lagay sa Makina bago ihinto.').replace('<div class="t"></div><div class="p mt4">', '<div class="p">') + U.btn('OO, IHINTO', 'doStop') + U.btn('HINDI', 'close', 'secondary') + '</div>'; } };
  SC.SB41 = { name: 'SB41_Stop_Mine', sheet: () => { const bb = b(); if (!bb) return ''; return '<div class="stack"><span style="width:14px;height:14px;border-radius:3px;background:var(--danger);display:block"></span><div class="h1">Ihinto ang batch mo?</div><p class="p">Sinimulan mo , ' + H.esc(H.me()) + '.</p><p class="p muted">' + bb.fish + ' • ' + H.kg(M.weight(bb)) + ' kg • Tumakbo na: ' + H.dur(bb.h) + '</p>' + U.banner('info', 'users', '', 'Makikita ito ng lahat ng gumagamit ng makina.').replace('<div class="t"></div><div class="p mt4">', '<div class="p">') + U.btn('OO, IHINTO', 'doStop') + U.btn('HINDI', 'close', 'secondary') + '</div>'; } };

  /* ---------- Result screens SB07/SB08, confirm SB09 ---------- */
  function resultView(kind) {
    const r = (S().waiting && S().waiting.rec) || S().history[0];
    const done = kind === 'done';
    return '<p class="small muted">' + r.fish + ' · AGAP-001 · SUBAD</p><div class="mt8">' + (done ? U.chip('circle-check', 'Target naabot · Mula sa Makina', 'ok') : U.chip('pause', 'Itinigil · Mula sa Makina', 'danger')) + '</div>' +
      '<div class="h1 mt12">' + (done ? 'Naabot na  ang target na Timbang.' : 'Itinigil na  ang Batch.') + '</div><p class="p ' + (done ? 'dangerc' : 'dangerc') + ' mt4" style="font-weight:600">' + (done ? 'May isda pa  sa Makina.' : 'Hindi  naabot ang target.') + '</p>' +
      '<div class="card mt12" style="padding:16px">' + U.chip(done ? 'circle-check' : 'pause', (done ? 'Tapos na • ' : 'Itinigil • ') + r.mode, done ? 'blue' : 'danger') +
      '<div class="row mt12" style="justify-content:space-between"><div><div class="muted small">Unang timbang</div><div class="h1">' + H.kg(r.initial) + ' kg</div></div>' + ic('arrow-right', 18) + '<div><div class="muted small">Huling timbang</div><div class="h1" style="color:var(--blue)">' + H.kg(r.final) + ' kg</div></div></div>' +
      (done ? '' : '<p class="small muted mt8">Target na Timbang: ' + H.kg(r.target) + ' kg</p>') +
      '<div class="kv mt8"><span class="muted">Kabuuang tagal</span><b>' + H.dur(r.hours) + '</b></div><div class="kv"><span class="muted">Karaniwang init</span><b>' + r.temp + '°C</b></div></div>' +
      '<div class="card warn mt12"><b>' + (done ? 'Alisin muna ang Isda' : 'May Isda pa sa Makina') + '</b><p class="p mt4">Palamigin muna  ang Makina. Pindutin lang  kapag naalis na ang lahat ng isda.</p></div>' +
      '<p class="tiny muted mt12">Sinumang naka-login ay puwede  magpatunay ng pag-alis. Basahin muna ang lagay sa Makina. Nasa Makina ang Rekord.</p>';
  }
  SC.SB07 = { name: 'SB07_Target_Naghihintay_Alisin', bar: { title: 'Tapos na ang Batch', back: () => go(SB.homeId()) }, back: () => go(SB.homeId()), body: () => resultView('done'), actions: () => U.btn('NAALIS NA ANG ISDA', 'toRemoval') + U.btn('Tingnan ang Buod', 'sbSummary', 'secondary') };
  SC.SB08 = { name: 'SB08_Itinigil_Naghihintay_Alisin', bar: { title: 'Itinigil na  ang Batch', back: () => go(SB.homeId()) }, back: () => go(SB.homeId()), body: () => resultView('stopped'), actions: () => U.btn('NAALIS NA ANG ISDA', 'toRemoval') + U.btn('Tingnan ang Buod', 'sbSummary', 'secondary') };
  ACT.sbSummary = () => { const r = (S().waiting && S().waiting.rec) || S().history[0]; S().viewRec = r.id; window.save(); go(r.status === 'done' ? '26' : 'SB52'); };
  SC.SB09 = {
    name: 'SB09_Pagtiyak_Naalis_na', base: () => (window.curScreen() && /SB3[89]|SB40|SB55/.test(window.curScreen()) ? null : 'SB07'),
    sheet: () => '<div class="stack"><div class="h1">Naalis na  ba ang lahat ng Isda?</div><p class="p">Pakisigurado  malamig na ang Makina at wala nang isda sa loob. Pagkatapos  nito, maaari nang magsimula ng bagong Batch.</p>' + U.btn('OO, NAALIS NA', 'confirmRemoved') + U.btn('HINDI', 'close', 'secondary') + '</div>'
  };
  ACT.confirmRemoved = () => { window.closeOverlay(); const s = S(); s.waiting = null; s.cooling = false; window.save(); go('SB53'); };

  /* ---------- Removal checklists SB38–SB40, SB55 ---------- */
  function removalView(bio, toastMsg) {
    const s = S(); const r = (s.waiting && s.waiting.rec) || { fish: 'Galunggong', mode: bio ? 'Biomass' : 'Kuryente' };
    const c = s.remChecks || (s.remChecks = [false, false]);
    const items = bio ? ['Naalis na ang lahat ng isda sa mga tray.', 'Nakolekta na ang abo.'] : ['Naalis na ang lahat ng isda sa mga tray.'];
    return '<p class="small muted">' + (bio ? 'Biomass · ' : r.fish + ' · ') + 'SUBAD AGAP-001 · ' + H.esc(H.me()) + '</p><div class="mt8">' + U.chip(bio ? 'flame' : 'plug', bio ? 'Biomass' : 'Kuryente', 'blue') + '</div>' +
      '<div class="h1 mt12">Alisin na  ang isda.</div><p class="p mt8">Hindi pa makakapagsimula ng bagong batch hanggang hindi naaalis ang isda.</p>' +
      '<div class="card mt12"><b style="color:var(--navy)">Alisin muna ang Isda</b><div class="mt8">' + items.map((t, i) => U.check(c[i], t, 'remTick', i)).join('') + '</div></div>' +
      '<div class="mt12">' + U.banner('warn', 'hand', '', bio ? 'Palamigin muna  ang makina bago hawakan o kolektahin ang abo.' : 'Palamigin muna  ang Makina bago hawakan.').replace('<div class="t"></div><div class="p mt4">', '<div class="p">') + '</div>';
  }
  function removalActions(bio) { const c = S().remChecks || []; const ok = bio ? c[0] && c[1] : c[0]; return U.btn('NAALIS NA ANG ISDA', 'askRemoved', 'primary', ok ? '' : 'disabled') + U.btn('Mamaya na', 'goHome', 'secondary'); }
  const remBase = { back: () => go(SB.homeId()) };
  SC.SB38 = Object.assign({ name: 'SB38_Remove_Electric_Unchecked', bar: { title: 'Alisin na  ang isda.', back: () => go(SB.homeId()) }, body: () => removalView(false), actions: () => removalActions(false) }, remBase);
  SC.SB39 = Object.assign({ name: 'SB39_Remove_Biomass_Unchecked', bar: { title: 'Biomass', back: () => go(SB.homeId()) }, body: () => removalView(true), actions: () => removalActions(true) }, remBase);
  SC.SB40 = Object.assign({ name: 'SB40_Remove_Biomass_Checked', bar: { title: 'Biomass', back: () => go(SB.homeId()) }, enter: () => { S().remChecks = [true, true]; window.save(); rerender(); }, body: () => removalView(true), actions: () => removalActions(true) }, remBase);
  SC.SB55 = Object.assign({ name: 'SB55_Naihinto_Toast', bar: { title: 'Alisin na  ang isda.', back: () => go(SB.homeId()) }, enter: () => { S().remChecks = [false, false]; window.save(); }, body: () => removalView(false), actions: () => removalActions(false), mounted: () => setTimeout(() => toast('Naihinto ang batch.', 'pause', 3000), 100) }, remBase);
  ACT.remTick = (i) => { const c = S().remChecks; c[+i] = !c[+i]; window.save(); const cur = window.curScreen(); if (cur === 'SB39' && c[0] && c[1]) return go('SB40', { replace: true }); rerender(); };
  ACT.askRemoved = () => openOverlay('SB09');

  /* ---------- Power answered by other phone SB42–SB45 ---------- */
  function powerOther(bio) {
    const bb = b();
    return U.hero('unplug', { size: 'm' }) + '<div class="mt12">' + U.chip('plug-zap', 'Walang kuryente', '') + '</div>' +
      (bb ? '<p class="small muted mt8">Walang kuryente · SUBAD AGAP-001<br>' + bb.starter + ' · ' + bb.fish + ' · ' + H.kg(bb.initial) + ' kg → ' + H.kg(bb.target) + ' kg<br>Lumipas: ' + H.dur(bb.h) + '</p>' : '') +
      '<div class="mt12">' + U.banner(bio ? 'warn' : 'info', bio ? 'flame' : 'pause', 'Nasagot na ni ' + other() + ': ' + (bio ? 'Itinuloy sa biomass.' : 'Itinigil ang pagpapatuyo.'), bio ? 'Kumpirmahin muna  ang paghahanda bago simulan ang pag-init sa biomass.' : 'Naitala sa Rekord. Alisin ang isda kapag malamig na.') + '</div>' + (bb ? U.batCard(bb) : '') +
      (bio ? '<p class="small muted mt12">Tingnan ang mga kagamitan at kuryente bago magpatuloy.</p>' : '');
  }
  SC.SB42 = { name: 'SB42_Power_Biomass_Alert', bar: { title: 'Suplay ng makina', back: () => go(SB.homeId()) }, live: true, back: () => go(SB.homeId()), body: () => powerOther(true), actions: () => U.btn('TINGNAN ANG BIOMASS', 'toBioPrep') };
  ACT.toBioPrep = () => { window.closeOverlay(); S().altMode = 'Biomass'; S().prep = null; window.save(); go('20'); };
  SC.SB44 = { name: 'SB44_Power_Itigil_Alert', bar: { title: 'Suplay ng makina', back: () => go(SB.homeId()) }, live: true, back: () => go(SB.homeId()), body: () => powerOther(false), actions: () => U.btn('TINGNAN ANG REKORD', ':SB46') };
  SC.SB43 = { name: 'SB43_Power_Biomass_Sheet', base: '18', scrimClose: false, sheet: () => '<div class="stack">' + U.chip('flame', 'Nasagot na ni ' + other(), 'warn') + '<div class="h1">Itinuloy sa biomass.</div><p class="p">Kumpirmahin muna  ang paghahanda bago simulan ang pag-init sa biomass.</p><p class="p dangerc" style="font-weight:600">Huwag muna mag-init.</p>' + U.btn('TINGNAN ANG BIOMASS', 'toBioPrep') + '</div>' };
  SC.SB45 = { name: 'SB45_Power_Itigil_Sheet', base: '18', scrimClose: false, sheet: () => '<div class="stack">' + U.chip('pause', 'Nasagot na ni ' + other(), '') + '<div class="h1">Itinigil ang pagpapatuyo.</div><p class="p">Naitala sa Rekord.</p>' + U.btn('TINGNAN ANG REKORD', 'sheetToRek') + '</div>' };
  ACT.sheetTo20 = () => { window.closeOverlay(); go('20'); };
  ACT.sheetToSB05 = () => { window.closeOverlay(); go('SB05'); };
  ACT.sheetToRek = () => { window.closeOverlay(); go('SB46'); };

  /* ---------- History SB10, SB46, SB47, SB52 ---------- */
  SC.SB46 = {
    name: 'SB46_History_Loading', bar: { title: 'Rekord', back: () => go(SB.homeId()) }, nav: 'rekord', transient: true, back: () => go(SB.homeId()),
    body: () => '<div class="card soft"><div class="kv"><span class="muted">Makina:</span><b>AGAP-001</b></div><div class="kv"><span class="muted">Mga gumagamit ng SUBAD:</span><b>' + H.esc(H.me()) + ', ' + other() + '</b></div></div><div class="center mt24"><div class="spinner" style="margin:0 auto"></div></div><p class="p muted center mt16">Kinukuha ang Rekord mula sa makina…</p>' +
      [1, 2].map(() => '<div class="card mt12" style="height:120px;background:linear-gradient(90deg,#fff,#f0f5fc,#fff)"></div>').join(''),
    after: [1300, () => { const s = S(); if (s.histOffline || !s.connected) { s.histOffline = false; window.save(); return go('SB47', { replace: true }); } go(s.noHistory || !s.history.length ? 'ST_WALANG_REKORD' : 'SB10', { replace: true }); }]
  };
  SC.SB47 = {
    name: 'SB47_History_Offline', bar: { title: 'Rekord', back: () => go(SB.homeId()) }, nav: 'rekord', back: () => go(SB.homeId()),
    body: () => '<div class="card soft listrow"><b class="grow">AGAP-001</b>' + U.chip('x', 'Walang koneksyon', 'danger') + '</div>' + U.hero(S().connType === 'bt' ? 'bluetooth-off' : 'wifi-off', {}) + '<div class="h2 center mt12">Hindi makuha ang Rekord.</div><p class="p muted center mt8">Kumonekta sa makina.</p><div class="mt16">' + U.btn('Kumonekta', 'reconnectS02') + '</div>'
  };
  SC.SB10 = {
    name: 'SB10_Kasaysayan_sa_Makina', bar: { title: 'Rekord', back: () => go(SB.homeId()) }, nav: 'rekord', back: () => go(SB.homeId()),
    body: () => '<div class="card soft"><div class="kv"><span class="muted">Makina:</span><b>AGAP-001</b></div><div class="kv"><span class="muted">Samahan:</span><b>SUBAD</b></div><p class="small muted mt4">Sa Makina  naka-save ang Rekord. Pareho  ang tala sa lahat ng cellphone ng SUBAD.</p></div><div class="stack mt12" style="gap:8px">' + S().history.map(U.recCard).join('') + '</div>'
  };
  SC.SB52 = {
    name: 'SB52_History_Ihininto_Detail', bar: { title: 'Buod ng Batch', back: () => go(S().scenario === 'shared' ? 'SB10' : '25') }, nav: 'rekord', back: () => go(S().scenario === 'shared' ? 'SB10' : '25'),
    body: () => {
      const r = S().history.find((x) => x.id === S().viewRec && x.status !== 'done') || S().history.find((x) => x.status !== 'done') || { fish: 'Galunggong', date: '8 Nobyembre 2026', initial: 26.4, final: 21.8, target: 17.2, hours: 4.08, mode: 'Kuryente', starter: 'Mang Jun', temp: 68, stopAt: .645, stoppedBy: other() };
      return '<div class="row" style="justify-content:space-between"><div><div class="h2">' + r.fish + '</div><div class="small muted mt4">' + r.date + '</div></div>' + U.chip(U.supplyIcon(r.mode), U.modeLabel(r.mode), 'blue') + '</div>' +
        '<div class="card mt12"><div class="h1">' + H.kg(r.initial) + ' → ' + H.kg(r.final) + ' kg</div><p class="p mt8">Tagal: ' + H.dur(r.hours) + '</p><p class="p mt4">Karaniwang init: ' + r.temp + '°C</p><div class="row mt8"><span class="tag-danger">Ihininto</span><span class="muted">Sinimulan ni ' + r.starter + '</span></div></div>' +
        '<div class="card mt8"><div class="h3">Timbang (kg)</div><div class="mt8">' + U.graph({ initial: r.initial, target: r.target, dur: r.hours / (r.stopAt || .6), h: r.hours, stopAt: r.stopAt || .6, xlabels: [0, '1 oras', '2 oras', H.dur(r.hours)] }) + '</div><p class="p muted mt8">Oras ng pagpapatuyo</p></div>' +
        '<div class="card mt8"><b style="color:var(--navy)">Ihininto ni ' + (r.stoppedBy || other()) + '</b><p class="p mt8">Target: ' + H.kg(r.target) + ' kg, hindi naabot.<br>Naalis na  ang isda.<br><span class="muted">AGAP-001 · Para sa lahat ng cellphone.</span></p></div>';
    }
  };
  // In shared mode, stopped records open SB52 instead of S13b
  const origOpenRec = ACT.openRec;
  ACT.openRec = (id) => { if (S().scenario !== 'shared') return origOpenRec(id); S().viewRec = id; window.save(); const r = S().history.find((x) => x.id === id); go(r && r.status !== 'done' ? 'SB52' : '26'); };

  /* ---------- Operator edit SB48–SB50 ---------- */
  SC.SB48 = {
    name: 'SB48_Operator_Edit', base: '29', enter: () => { S().opErr = false; window.save(); },
    sheet: () => '<div class="stack"><div class="h2">Pangalan ng Operator</div><div class="field"><label>Pangalan ng Operator</label><div class="input ' + (S().opErr ? 'error' : 'focus') + '"><input id="opEdit" value="' + H.esc(S().opErr ? (S().opDraft || 'J') : H.me()) + '" maxlength="20" autocomplete="off"></div>' + (S().opErr ? '<div class="err">' + ic('circle-alert', 16) + 'Isulat  ang pangalan (2 letra pataas).</div>' : '') + '<div class="hint">Maaari itong baguhin sa Mga Ayos.</div><div class="hint">Gumamit  ng 2–20 karakter.</div></div>' + U.btn('I-TALA', 'opSave') + U.btn('KANSELAHIN', 'close', 'secondary') + '</div>'
  };
  SC.SB49 = { name: 'SB49_Operator_Edit_Error', base: '29', enter: () => { S().opErr = true; S().opDraft = 'J'; window.save(); }, sheet: () => { S().opErr = true; return SC.SB48.sheet(); } };
  ACT.opSave = () => { const i = document.getElementById('opEdit'); const v = (i ? i.value : '').trim(); if (v.length < 2) { S().opErr = true; S().opDraft = v; window.save(); window.closeOverlay(); openOverlay('SB49'); return; } S().operator = v; S().opErr = false; window.save(); window.closeOverlay(); go('SB50'); };
  SC.SB50 = Object.assign({}, SC['29'], { name: 'SB50_Operator_Saved_Toast', mounted: () => setTimeout(() => toast('Nabago na ang pangalan.', 'circle-check'), 80) });

  /* ---------- Abiso archive SB51 ---------- */
  SC.SB51 = {
    name: 'SB51_Abiso_Archive', bar: { title: 'Abiso · 2 sa 3', back: '16' }, nav: 'abiso', back: '16',
    body: () => {
      const m = 60000, now = Date.now();
      const list = [
        { icon: 'hourglass', tone: 'warn', title: 'Natapos ang oras ng pag-aayos ng batch.', desc: '', at: now - 1 * m },
        { icon: 'fish', tone: 'blue', title: 'Nagsimula ang Pagpapatuyo', desc: 'Binabantayan na  ang inyong isda.', at: now - 245 * m },
        { icon: 'plug-zap', tone: 'critical', title: 'Nagbago ang Pinagkukunan ng Kuryente', desc: 'Pakisuri  ang suplay ng makina.', at: now - 10 * m },
        { icon: 'flame', tone: 'warn', title: 'Kailangan Maghanda ng Biomass', desc: 'Ihanda  ang panggatong.', at: now - 15 * m },
        { icon: 'thermometer', tone: 'warn', title: 'Mataas/Mababa ang Init', desc: 'Pakisuri  ang init ng makina.', at: now - 20 * m }
      ];
      return U.chip('bell', '3 hindi pa nababasa', 'blue') + '<div class="stack mt12" style="gap:8px">' + list.map((n, i) => '<div class="notif ' + (i < 3 ? 'unread' : '') + '"><span class="ico" style="color:' + (n.tone === 'critical' ? 'var(--danger)' : n.tone === 'warn' ? '#d48806' : 'var(--blue)') + '">' + ic(n.icon, 24) + '</span><div style="flex:1"><div class="t">' + n.title + '</div>' + (n.desc ? '<div class="d">' + n.desc + '</div>' : '') + '<div class="w">' + H.agoLong(n.at) + '</div></div></div>').join('') + '</div>';
    },
    actions: () => U.btn('Susunod na Abiso', ':16A', 'secondary')
  };
  // shared: "Mas naunang Abiso" goes through the archive page
  const orig16Actions = SC['16'].actions;
  SC['16'].actions = () => (S().scenario === 'shared' ? U.btn('Mas naunang Abiso', ':SB51', 'secondary') : orig16Actions());

  /* ---------- Facilitator triggers for the other phone ---------- */
  Object.assign(FAC, {
    oLock: () => {
      const s = S(); if (isOn() || s.waiting) return toast('May batch o isda pa sa makina', 'info');
      if (s.lock && s.lock.by === 'me') { s.raceNext = false; return toast('Ikaw ang may hawak ng kandado', 'info'); }
      s.lock = { by: 'other', at: Date.now() }; window.save();
      notify({ icon: 'lock', tone: 'info', title: 'May naghahanda ng Batch', desc: 'Si ' + other() + ' ang nag-aayos ng makina. Hintayin muna.', go: 'SB21', cta: 'Tingnan' });
      if (/^SB(01|12|53|54|21|22)$/.test(window.curScreen())) go(SB.homeId(), { replace: true });
    },
    oLockEnd: () => { const s = S(); if (!s.lock || s.lock.by !== 'other') return toast('Walang kandado si ' + other(), 'info'); s.lock = null; window.save(); notify({ icon: 'lock-open', tone: 'info', title: 'Natapos ang oras ng pag-aayos ng batch.', desc: 'Walang ginawa si ' + other() + ' sa loob ng 5 minuto. Libre na ang makina.', go: 'SB12', cta: 'Tingnan' }); if (/^SB(21|01|19)$/.test(window.curScreen())) go('SB12', { replace: true }); },
    oStart: (fromRace) => {
      const s = S(); if (isOn()) return toast('May tumatakbo nang batch', 'info');
      if (s.waiting) return toast('Alisin muna ang isda (naghihintay)', 'info');
      const iWasSetting = s.lock && s.lock.by === 'me';
      const keepForm = s.form; s.form = { fish: 'Galunggong', target: 17.2, temp: 68 };
      H.startBatch(other()); s.form = keepForm; s.lock = null; s.setupStep = null; window.save();
      if (iWasSetting || fromRace === true) return go('SB35');
      if (/^SB(01|12|21|53|54)$/.test(window.curScreen())) go(SB.homeId(), { replace: true });
    },
    oStop: () => {
      const bb = b(); if (!isOn()) return toast('Walang tumatakbong batch', 'info');
      const rec = { id: 'h' + Date.now(), date: H.today(), fish: bb.fish, initial: bb.initial, final: +H.kg(M.weight(bb)), target: bb.target, hours: bb.h, mode: bb.mode, starter: bb.starter, status: 'stopped', temp: bb.temp, stopAt: M.p(bb), stoppedBy: other() };
      S().batch = null; H.addRecord(rec); S().waiting = { kind: 'stopped', rec: rec }; window.save();
      notify({ icon: 'pause', tone: 'warning', title: 'Ihininto · ' + other(), desc: 'Itinigil ang ' + rec.fish + ' sa ' + H.kg(rec.final) + ' kg. Alisin muna ang isda.', go: 'SB08', cta: 'Tingnan' });
      const c = window.curScreen(); if (/^SB(19|20|05|13|04)$|^1[58]|^2[0-3]$|^15A$/.test(c)) go('SB08');
    },
    oRemoved: () => { const s = S(); if (!s.waiting) return toast('Walang naghihintay na pag-alis', 'info'); s.waiting = null; s.cooling = false; window.save(); notify({ icon: 'circle-check', tone: 'good', title: 'Makina handa', desc: 'Naalis na ni ' + other() + ' ang isda. Maaari nang magsimula.', go: 'SB53', cta: 'Tingnan' }); if (/^SB(07|08|23|24|38|39|40|55)$/.test(window.curScreen())) go('SB53'); },
    oBio: () => {
      const s = S(); if (!isOn() || s.power !== 'none') return toast('Gamitin kapag walang kuryente at may batch', 'info');
      s.otherDecision = 'bio'; window.save();
      if (window.curScreen() === '18') return openOverlay('SB43');
      notify({ icon: 'flame', tone: 'warning', title: 'Nasagot na ni ' + other(), desc: 'Itinuloy sa biomass. Kumpirmahin muna ang paghahanda.', go: 'SB42', cta: 'Tingnan' }); go('SB42');
    },
    oItigil: () => {
      const s = S(); if (!isOn() || s.power !== 'none') return toast('Gamitin kapag walang kuryente at may batch', 'info');
      const rec = H.stopBatch(other(), 'Walang kuryente'); s.waiting = { kind: 'stopped', rec: rec }; s.otherDecision = 'stop'; window.save();
      if (window.curScreen() === '18') { go('SB44'); return openOverlay('SB45'); }
      notify({ icon: 'pause', tone: 'info', title: 'Nasagot na ni ' + other(), desc: 'Itinigil ang pagpapatuyo. Naitala sa Rekord.', go: 'SB44', cta: 'Tingnan' }); go('SB44');
    },
    oRace: () => { const s = S(); if (s.lock && s.lock.by === 'me') { s.raceBatchNext = true; window.save(); return toast('Pagkumpirma mo, mauunahan ka ni ' + other(), 'info'); } s.raceNext = true; window.save(); toast('Sa susunod na Bagong Batch, mauunahan ka ni ' + other(), 'info'); },
    myTimeout: () => { const s = S(); if (!s.lock || s.lock.by !== 'me') return toast('Wala kang hawak na kandado', 'info'); s.lock = null; s.setupStep = null; window.save(); go('SB32'); },
    syncFail: () => { S().syncFailNext = true; window.save(); go('SB17'); },
    reconnect: () => go('SB37'),
    histOff: () => { S().histOffline = true; window.save(); go('SB46'); }
  });

  /* ---------- Patch main screens for shared mode ---------- */
  ['05', '06'].forEach((id) => { const e = SC[id].enter; SC[id].enter = (o) => { if (S().scenario === 'shared') return go(SB.homeId(), { replace: true }); e && e(o); }; });
  ['15', '21', '15A', '18', '23', '22'].forEach((id) => {
    const bar = SC[id].bar; SC[id].bar = () => Object.assign({}, typeof bar === 'function' ? bar() : bar, { back: () => go(id === '15A' || id === '18' || id === '23' ? H.monitorId() : H.homeId()) });
    SC[id].back = () => go(id === '15A' || id === '18' || id === '23' ? H.monitorId() : H.homeId());
  });
  const formBack = () => (S().scenario === 'shared' ? openOverlay('SB33') : go(H.homeId()));
  SC['11'].back = formBack; SC['11'].bar = { title: 'Bagong Batch', back: formBack };
  const oldPrepBack = ACT.prepDone;
  // When shared, prep flow S11* is replaced by SB28–31; keep S11 reachable from jump list
  const n22 = SC['22'].actions; SC['22'].actions = () => U.btn('Bumalik sa Subaybayan', 'toMonitor');
  SC['22'].back = () => go(H.monitorId()); SC['22'].bar = { title: 'Lagay ng Batch', back: () => go(H.monitorId()) };
  SC['24'].back = () => go(H.homeId()); SC.ST_TAPOS_BIO.back = () => go(H.homeId());
  SC.S13.back = () => go(H.homeId());
})();
