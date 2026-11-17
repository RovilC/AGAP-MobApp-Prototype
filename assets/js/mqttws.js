/* Tiny MQTT 3.1.1 client over WebSocket (QoS 0 only). Used for the remote facilitator controller.
   Relays: free public brokers. Messages carry no personal data – only demo commands and the app's screen state. */
(function () {
  'use strict';
  const enc = new TextEncoder(), dec = new TextDecoder();
  const BROKERS = ['wss://broker.emqx.io:8084/mqtt', 'wss://broker.hivemq.com:8884/mqtt', 'wss://test.mosquitto.org:8081/mqtt'];
  function str(s) { const b = enc.encode(s); const o = new Uint8Array(b.length + 2); o[0] = b.length >> 8; o[1] = b.length & 255; o.set(b, 2); return o; }
  function cat() { let n = 0; for (const a of arguments) n += a.length; const o = new Uint8Array(n); let i = 0; for (const a of arguments) { o.set(a, i); i += a.length; } return o; }
  function rlen(n) { const out = []; do { let d = n % 128; n = Math.floor(n / 128); if (n > 0) d |= 128; out.push(d); } while (n > 0); return Uint8Array.from(out); }
  function pkt(first, body) { return cat(Uint8Array.of(first), rlen(body.length), body); }

  function MiniMQTT(o) {
    this.o = o; this.i = 0; this.subs = []; this.pid = 1; this.ok = false; this.closed = false;
    const q = /[?&]broker=([^&]+)/.exec(location.search);
    this.brokers = q ? [decodeURIComponent(q[1])] : BROKERS;
    this.connect();
  }
  MiniMQTT.prototype.status = function (on) { if (this.o.onStatus) this.o.onStatus(on, this.brokers[this.i % this.brokers.length]); };
  MiniMQTT.prototype.connect = function () {
    if (this.closed) return;
    const url = this.brokers[this.i % this.brokers.length];
    let ws;
    try { ws = new WebSocket(url, 'mqtt'); } catch (e) { this.i++; return this.retry(); }
    ws.binaryType = 'arraybuffer'; this.ws = ws; this.buf = new Uint8Array(0); this.ok = false;
    const guard = setTimeout(() => { if (!this.ok) { try { ws.close(); } catch (e) { } } }, 7000);
    ws.onopen = () => {
      const body = cat(str('MQTT'), Uint8Array.of(4, 0x02, 0, 30), str(this.o.clientId));
      ws.send(pkt(0x10, body));
    };
    ws.onmessage = (e) => { this.feed(new Uint8Array(e.data)); if (this.ok) clearTimeout(guard); };
    ws.onerror = () => { };
    ws.onclose = () => {
      clearTimeout(guard); clearInterval(this.ping);
      const was = this.ok; this.ok = false; this.status(false);
      if (!was) this.i++;
      this.retry();
    };
  };
  MiniMQTT.prototype.retry = function () { if (this.closed) return; clearTimeout(this.rt); this.rt = setTimeout(() => this.connect(), 2500); };
  MiniMQTT.prototype.feed = function (chunk) {
    this.buf = cat(this.buf, chunk);
    for (;;) {
      const b = this.buf; if (b.length < 2) return;
      let mult = 1, val = 0, i = 1, d;
      do { if (i >= b.length) return; d = b[i++]; val += (d & 127) * mult; mult *= 128; } while (d & 128);
      if (b.length < i + val) return;
      const type = b[0] >> 4, body = b.slice(i, i + val);
      this.buf = b.slice(i + val);
      if (type === 2) { // CONNACK
        if (body[1] === 0) {
          this.ok = true; this.status(true);
          this.subs.forEach((t) => this.sendSub(t));
          clearInterval(this.ping); this.ping = setInterval(() => { try { this.ws.send(Uint8Array.of(0xC0, 0)); } catch (e) { } }, 20000);
          if (this.o.onConnect) this.o.onConnect();
        } else { try { this.ws.close(); } catch (e) { } }
      } else if (type === 3) { // PUBLISH
        const qos = (b[0] >> 1) & 3; const tl = (body[0] << 8) | body[1];
        const topic = dec.decode(body.slice(2, 2 + tl)); const off = 2 + tl + (qos ? 2 : 0);
        if (this.o.onMessage) { try { this.o.onMessage(topic, dec.decode(body.slice(off))); } catch (e) { console.warn(e); } }
      }
    }
  };
  MiniMQTT.prototype.sendSub = function (topic) {
    const id = this.pid = (this.pid % 65000) + 1;
    try { this.ws.send(pkt(0x82, cat(Uint8Array.of(id >> 8, id & 255), str(topic), Uint8Array.of(0)))); } catch (e) { }
  };
  MiniMQTT.prototype.subscribe = function (topic) { if (this.subs.indexOf(topic) < 0) this.subs.push(topic); if (this.ok) this.sendSub(topic); };
  MiniMQTT.prototype.publish = function (topic, msg) {
    if (!this.ok) return false;
    try { this.ws.send(pkt(0x30, cat(str(topic), enc.encode(msg)))); return true; } catch (e) { return false; }
  };
  MiniMQTT.prototype.end = function () { this.closed = true; clearInterval(this.ping); clearTimeout(this.rt); try { this.ws.close(); } catch (e) { } };
  window.MiniMQTT = MiniMQTT;
  window.AGAP_TOPIC = (code) => 'agap-proto-rovilc/v1/' + code;
})();
