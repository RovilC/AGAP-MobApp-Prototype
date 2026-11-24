/* Phone side of the remote facilitator controller: shows a 4-digit code, listens for commands, reports its screen state. */
(function () {
  'use strict';
  const KEY = 'agap-remote-code';
  let code;
  try { code = localStorage.getItem(KEY); } catch (e) { }
  if (!/^\d{4}$/.test(code || '')) { code = String(Math.floor(1000 + Math.random() * 9000)); try { localStorage.setItem(KEY, code); } catch (e) { } }
  const R = (window.REMOTE = { code: code, online: false, lastCmd: 0 });
  if (!window.WebSocket || !window.MiniMQTT) return;
  const base = window.AGAP_TOPIC(code);
  const mBase = () => 'agap-proto-rovilc/v1/machine/' + ((window.S && window.S.machineId) || 'AGAP-001');

  function state() {
    const S = window.S, b = S.batch, scr = window.SCREENS[window.curScreen()] || {};
    return JSON.stringify({
      t: Date.now(), id: window.curScreen(), screen: scr.name || window.curScreen(), scenario: S.scenario,
      loggedIn: S.loggedIn, batch: b && b.active ? { fish: b.fish, pct: window.M.pct(b), mode: b.mode, status: window.M.status(b), elapsed: window.H.dur(b.h) } : null,
      power: S.power, battery: Math.round(S.battery), speed: S.speed, source: S.source,
      chamber: (function () { const r = window.MC.reading(); return r.ok ? { v: r.v, heater: r.heater, limit: r.limit, warn: r.warn } : { err: r.err }; })(),
      lock: S.lock ? (S.lock.by === 'me' ? 'ikaw' : S.otherName) : null, waiting: S.waiting ? S.waiting.kind : null
    });
  }
  function screensList() {
    const SC = window.SCREENS;
    return JSON.stringify(Object.keys(SC).filter((k) => SC[k].name).map((k) => [k, SC[k].name]).sort((a, b) => a[1].localeCompare(b[1], 'en', { numeric: true })));
  }
  const cli = new window.MiniMQTT({
    clientId: 'agap-phone-' + code + '-' + Math.random().toString(36).slice(2, 7),
    onStatus: (on) => { R.online = on; try { window.facRefreshRemote && window.facRefreshRemote(); } catch (e) { } },
    onConnect: () => { cli.subscribe(base + '/cmd'); cli.subscribe(mBase() + '/telemetry'); cli.publish(base + '/state', state()); cli.publish(mBase() + '/cmd', JSON.stringify({ cmd: 'ping' })); },
    onMessage: (topic, msg) => {
      if (topic === mBase() + '/telemetry') { try { window.MC.onTelemetry(msg); } catch (e) { } return; }
      if (topic !== base + '/cmd') return;
      let c; try { c = JSON.parse(msg); } catch (e) { return; }
      R.lastCmd = Date.now();
      const F = window.FACTRIGGERS;
      if (c.t === 'fac') { if (F[c.k]) F[c.k](); else if (window.SCREENS[c.k]) window.go(c.k); }
      else if (c.t === 'go' && window.SCREENS[c.s]) { if (window.SCREENS[c.s].sheet) window.openOverlay(c.s); else window.go(c.s); }
      else if (c.t === 'speed') { window.S.speed = c.v; window.save(); }
      else if (c.t === 'reset') { window.__resetDemo(); return; }
      else if (c.t === 'list') { cli.publish(base + '/list', screensList()); }
      else if (c.t === 'back') { window.back(); }
      cli.publish(base + '/state', state());
    }
  });
  setInterval(() => { if (cli.ok) cli.publish(base + '/state', state()); }, 2000);
  R.client = cli;
  /** Commands to the machine (ESP32). The machine enforces the 80°C limit itself. */
  R.sendMachine = (obj) => { if (cli.ok) cli.publish(mBase() + '/cmd', JSON.stringify(obj)); };
})();
