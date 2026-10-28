/* Schnappy – interaktive Bausteine (3D-Box, Box-Auswahl, Countdown, Live-Chat, App-Leiste, Glücksrad) */
(() => {
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DESIGN = !!(window.Shopify && window.Shopify.designMode);
  const define = (name, cls) => { if (!customElements.get(name)) customElements.define(name, cls); };

  /* ---------- Reveal (Hero-Überschrift, Zähler) ---------- */
  const countUp = (el) => {
    const t = el.textContent.trim();
    const m = t.match(/^([−-]?)(\d[\d.]*)/);
    if (!m || RM) return;
    const end = parseInt(m[2].replace(/\./g, ''), 10);
    if (!end) return;
    const pre = m[1], rest = t.slice(m[0].length);
    const fmt = (n) => pre + (end >= 1000 ? n.toLocaleString('de-DE') : n) + rest;
    let st = null;
    const step = (ts) => {
      st = st || ts;
      const p = Math.min(1, (ts - st) / 1400), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(end * e));
      if (p < 1) requestAnimationFrame(step); else el.textContent = t;
    };
    requestAnimationFrame(step);
  };
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((es) => es.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        if (en.target.hasAttribute('data-sn-count')) countUp(en.target);
        io.unobserve(en.target);
      }), { threshold: 0.12 })
    : null;
  const observeReveal = (root = document) => {
    root.querySelectorAll('.sn-reveal:not(.in), [data-sn-count]:not(.in)').forEach((el) => {
      if (!io || DESIGN) el.classList.add('in'); else io.observe(el);
    });
  };

  /* ---------- 3D-Szene: drehen, ziehen, antippen ---------- */
  class SnScene extends HTMLElement {
    connectedCallback() {
      if (this._on) return;
      this._on = true;
      this.a = parseFloat(this.dataset.start || '-30');
      this.auto = parseFloat(this.dataset.auto || '0.16');
      this.tilt = parseFloat(this.dataset.tilt || '-18');
      this.clickOpen = !this.hasAttribute('data-no-open');
      this.drag = false; this.vis = true; this.touched = false;
      if (this.clickOpen) {
        this.addEventListener('pointerdown', (e) => {
          this.drag = true; this.moved = 0; this.x0 = e.clientX; this.a0 = this.a; this.touched = true;
          try { this.setPointerCapture(e.pointerId); } catch (_) {}
        });
        this.addEventListener('pointermove', (e) => {
          if (!this.drag) return;
          const dx = e.clientX - this.x0;
          this.moved = Math.max(this.moved, Math.abs(dx));
          this.a = this.a0 + dx * 0.45;
        });
        this.addEventListener('pointerup', () => { if (!this.drag) return; this.drag = false; if (this.moved < 6) this.toggle(); });
        this.addEventListener('pointercancel', () => { this.drag = false; });
        this.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.touched = true; this.toggle(); }
          if (e.key === 'ArrowLeft') { this.a -= 15; this.touched = true; }
          if (e.key === 'ArrowRight') { this.a += 15; this.touched = true; }
        });
      }
      if ('IntersectionObserver' in window) {
        this.obs = new IntersectionObserver(([en]) => { this.vis = en.isIntersecting; });
        this.obs.observe(this);
      }
      const loop = () => {
        if (this.vis) {
          if (!this.drag && !RM) this.a += this.auto;
          const c = this.cube;
          if (c) c.style.transform = `rotateX(${this.tilt}deg) rotateY(${this.a}deg)`;
        }
        this.raf = requestAnimationFrame(loop);
      };
      loop();
      if (this.hasAttribute('data-autocycle') && !RM) {
        const cyc = () => {
          if (this.touched || !this.vis) return;
          const c = this.cube; if (!c) return;
          c.classList.add('open');
          this.t2 = setTimeout(() => { if (!this.touched) c.classList.remove('open'); }, 3400);
        };
        this.t1 = setTimeout(() => { cyc(); this.iv = setInterval(cyc, 6800); }, 1500);
      }
    }
    get cube() { return this.querySelector(':scope > .sn-cube'); }
    toggle() { const c = this.cube; if (c) c.classList.toggle('open'); }
    disconnectedCallback() {
      this._on = false;
      cancelAnimationFrame(this.raf); clearTimeout(this.t1); clearTimeout(this.t2); clearInterval(this.iv);
      if (this.obs) this.obs.disconnect();
    }
  }
  define('sn-scene', SnScene);

  /* ---------- Box-Auswahl (Reiter S/M/XXL) ---------- */
  class SnBoxPicker extends HTMLElement {
    connectedCallback() {
      this.tabs = [...this.querySelectorAll('.sn-tab')];
      if (!this.tabs.length) return;
      this.tabs.forEach((t, i) => {
        t.addEventListener('click', () => this.select(i));
        t.addEventListener('keydown', (e) => {
          const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          const n = (i + d + this.tabs.length) % this.tabs.length;
          this.select(n); this.tabs[n].focus();
        });
      });
    }
    select(i) {
      const tab = this.tabs[i];
      this.tabs.forEach((t, j) => {
        const on = j === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        const p = document.getElementById(t.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      });
      const [w, h, d] = (tab.dataset.dims || '186,140,154').split(',');
      const scene = this.querySelector('.sn-pick-stage sn-scene');
      if (scene) {
        scene.style.setProperty('--bw', w); scene.style.setProperty('--bh', h); scene.style.setProperty('--bd', d);
        const lbl = scene.querySelector('[data-sn-label]'); if (lbl) lbl.textContent = tab.dataset.label;
      }
      const stage = this.querySelector('[data-stage]');
      if (stage) stage.style.setProperty('--glow', tab.dataset.glow);
      const word = this.querySelector('[data-word]'); if (word) word.textContent = tab.dataset.label;
      const badge = this.querySelector('[data-badge]');
      if (badge) { badge.textContent = tab.dataset.tag; badge.hidden = !tab.dataset.tag; }
    }
  }
  define('sn-box-picker', SnBoxPicker);

  /* ---------- Countdown zur nächsten Live-Show ---------- */
  class SnCountdown extends HTMLElement {
    connectedCallback() {
      this.days = (this.dataset.days || '').split(',').filter(Boolean).map(Number);
      const [h, m] = (this.dataset.time || '19:00').split(':').map(Number);
      this.h = isNaN(h) ? 19 : h; this.m = isNaN(m) ? 0 : m;
      this.duration = (Number(this.dataset.duration) || 120) * 60000;
      this.tick(); this.timer = setInterval(() => this.tick(), 1000);
    }
    disconnectedCallback() { clearInterval(this.timer); }
    next() {
      const now = new Date();
      for (let i = -1; i < 8; i++) {
        const t = new Date(now); t.setDate(now.getDate() + i); t.setHours(this.h, this.m, 0, 0);
        if (this.days.length && !this.days.includes(t.getDay())) continue;
        if (t.getTime() + this.duration > now.getTime()) return t;
      }
      return null;
    }
    tick() {
      const t = this.next(), now = Date.now();
      const clock = this.querySelector('.sn-clock:not(.sn-clock--live)'), live = this.querySelector('.sn-clock--live'), info = this.querySelector('[data-next]');
      if (!t) { clock.hidden = true; live.hidden = true; info.parentElement.hidden = true; return; }
      const isLive = t.getTime() <= now;
      clock.hidden = isLive; live.hidden = !isLive;
      const d = Math.max(0, t - now), pad = (v) => String(v).padStart(2, '0');
      this.querySelector('[data-h]').textContent = pad(Math.floor(d / 36e5));
      this.querySelector('[data-m]').textContent = pad(Math.floor((d % 36e5) / 6e4));
      this.querySelector('[data-s]').textContent = pad(Math.floor((d % 6e4) / 1e3));
      const today = t.toDateString() === new Date().toDateString();
      const day = today ? 'heute' : t.toLocaleDateString('de-DE', { weekday: 'long' });
      const pf = this.dataset.platform ? ' auf ' + this.dataset.platform : '';
      info.textContent = isLive ? 'Die Show läuft gerade' + pf : 'Nächste Show ' + day + ' um ' + pad(this.h) + ':' + pad(this.m) + pf;
    }
  }
  define('sn-countdown', SnCountdown);

  /* ---------- Live-Chat im Handy ---------- */
  class SnLiveChat extends HTMLElement {
    connectedCallback() {
      this.msgs = (this.dataset.msgs || '').split('|').map((s) => s.trim()).filter(Boolean);
      this.start = Number(this.dataset.bid) || 12; this.bid = this.start; this.i = 0;
      this.bidEl = this.parentElement && this.parentElement.querySelector('[data-bid-value]');
      if (!this.msgs.length) return;
      this.step(); this.step();
      if (!RM) this.iv = setInterval(() => this.step(), 1900);
    }
    disconnectedCallback() { clearInterval(this.iv); }
    step() {
      const raw = this.msgs[this.i++ % this.msgs.length];
      const k = raw.indexOf(':');
      const el = document.createElement('div');
      if (k > 0) { const b = document.createElement('b'); b.textContent = raw.slice(0, k); el.append(b, document.createTextNode(raw.slice(k + 1))); }
      else el.textContent = raw;
      this.append(el);
      while (this.children.length > 3) this.firstElementChild.remove();
      this.bid += Math.ceil(Math.random() * 3); if (this.bid > this.start * 4) this.bid = this.start;
      if (this.bidEl) this.bidEl.textContent = this.bid + ' €';
    }
  }
  define('sn-live-chat', SnLiveChat);

  /* ---------- Warenkorb öffnen / Zähler ---------- */
  const openCart = (trigger) => {
    const drawer = document.querySelector('cart-drawer');
    if (drawer && typeof drawer.open === 'function') { drawer.open(trigger); return true; }
    return false;
  };
  const money = (cents, cur) => {
    try { return new Intl.NumberFormat('de-DE', { style: 'currency', currency: cur || 'EUR' }).format(cents / 100); }
    catch (_) { return (cents / 100).toFixed(2).replace('.', ',') + ' €'; }
  };

  /* ---------- App-Leiste (Handy) ---------- */
  class SnTabbar extends HTMLElement {
    connectedCallback() {
      const always = this.hasAttribute('data-always') || DESIGN;
      const onScroll = () => this.classList.toggle('is-on', always || window.scrollY > 200);
      onScroll();
      this.onScroll = onScroll;
      window.addEventListener('scroll', onScroll, { passive: true });
      const cart = this.querySelector('[data-tab-cart]');
      if (cart) {
        cart.addEventListener('click', (e) => { if (openCart(cart)) e.preventDefault(); });
        if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
          this.unsub = subscribe(PUB_SUB_EVENTS.cartUpdate, () => this.refresh());
        }
        document.addEventListener('cart:updated', () => this.refresh());
      }
      const wheelBtn = this.querySelector('[data-tab-wheel]');
      if (wheelBtn && !document.querySelector('sn-wheel')) wheelBtn.hidden = true;
    }
    disconnectedCallback() {
      window.removeEventListener('scroll', this.onScroll);
      if (this.unsub) this.unsub();
    }
    refresh() {
      fetch((window.routes && window.routes.cart_url ? window.routes.cart_url : '/cart') + '.js', { headers: { Accept: 'application/json' } })
        .then((r) => r.json())
        .then((c) => {
          const n = this.querySelector('[data-count]'), t = this.querySelector('[data-total]'), l = this.querySelector('[data-count-label]');
          if (n) { n.textContent = c.item_count; n.classList.toggle('is-on', c.item_count > 0); n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); }
          if (t) t.textContent = c.item_count > 0 ? money(c.total_price, c.currency) : t.dataset.empty;
          if (l) l.textContent = c.item_count + ' Artikel';
        })
        .catch(() => {});
    }
  }
  define('sn-tabbar', SnTabbar);

  /* ---------- Glücksrad ---------- */
  class SnWheel extends HTMLElement {
    connectedCallback() {
      this.sheet = this.querySelector('.sn-sheet');
      this.overlay = this.querySelector('.sn-wheel__overlay');
      try { this.seg = JSON.parse(this.querySelector('[data-segments]').textContent); } catch (_) { this.seg = []; }
      this.key = 'sn-wheel-' + (this.dataset.sectionId || '');
      this.draw();
      this.onDoc = (e) => {
        const open = e.target.closest('[data-sn-wheel-open], a[href$="#gluecksrad"]');
        if (open) { e.preventDefault(); this.open(open); }
      };
      document.addEventListener('click', this.onDoc);
      this.querySelectorAll('[data-sn-wheel-close]').forEach((b) => b.addEventListener('click', () => this.close()));
      this.onKey = (e) => { if (e.key === 'Escape' && !this.sheet.hidden) this.close(); };
      document.addEventListener('keydown', this.onKey);
      this.querySelector('[data-spin]').addEventListener('click', () => this.spin());
      this.querySelector('[data-copy]').addEventListener('click', (e) => this.copy(e.currentTarget));
      if (this.dataset.once === 'true') {
        try { const saved = JSON.parse(localStorage.getItem(this.key) || 'null'); if (saved) this.showWin(saved, true); } catch (_) {}
      }
      if (location.hash === '#gluecksrad') this.open();
      if (DESIGN) {
        this.onSel = (e) => { if (e.detail && e.detail.sectionId === this.dataset.sectionId) this.open(); };
        this.onDesel = (e) => { if (e.detail && e.detail.sectionId === this.dataset.sectionId) this.close(); };
        document.addEventListener('shopify:section:select', this.onSel);
        document.addEventListener('shopify:section:deselect', this.onDesel);
      }
    }
    disconnectedCallback() {
      document.removeEventListener('click', this.onDoc);
      document.removeEventListener('keydown', this.onKey);
      if (this.onSel) { document.removeEventListener('shopify:section:select', this.onSel); document.removeEventListener('shopify:section:deselect', this.onDesel); }
      document.body.classList.remove('sn-lock');
    }
    draw() {
      const disc = this.querySelector('[data-disc]'), n = this.seg.length, R = 96;
      if (!disc || !n) return;
      const ns = 'http://www.w3.org/2000/svg';
      const p = (a) => `${(R * Math.cos(a)).toFixed(2)},${(R * Math.sin(a)).toFixed(2)}`;
      disc.innerHTML = '';
      this.seg.forEach((s, i) => {
        const a0 = (i / n) * 2 * Math.PI - Math.PI / 2 - Math.PI / n, a1 = a0 + (2 * Math.PI) / n;
        const mid = (((a0 + a1) / 2) * 180) / Math.PI;
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', `M0,0 L${p(a0)} A${R},${R} 0 0,1 ${p(a1)} Z`);
        path.setAttribute('fill', s.color || '#FFD21F'); path.setAttribute('stroke', '#0B2414'); path.setAttribute('stroke-width', '1.2');
        disc.append(path);
        const g = document.createElementNS(ns, 'g');
        g.setAttribute('transform', `rotate(${mid}) translate(62,0) rotate(90)`);
        const text = document.createElementNS(ns, 'text');
        text.setAttribute('text-anchor', 'middle'); text.setAttribute('fill', s.fg || '#fff');
        const lines = String(s.label || '').length > 7 ? String(s.label).split(' ') : [String(s.label || '')];
        text.setAttribute('font-size', lines.length > 1 ? '11' : n > 10 ? '13' : '17');
        lines.forEach((l, j) => {
          const ts = document.createElementNS(ns, 'tspan');
          ts.setAttribute('x', '0'); ts.setAttribute('dy', j ? '12' : lines.length > 1 ? '-2' : '6'); ts.textContent = l;
          text.append(ts);
        });
        g.append(text); disc.append(g);
      });
      const ring = document.createElementNS(ns, 'circle');
      ring.setAttribute('r', '97'); ring.setAttribute('fill', 'none'); ring.setAttribute('stroke', '#0B2414'); ring.setAttribute('stroke-width', '2');
      disc.append(ring);
    }
    open(trigger) {
      this.trigger = trigger || document.activeElement;
      this.overlay.hidden = false; this.sheet.hidden = false;
      requestAnimationFrame(() => { this.classList.add('is-open'); });
      document.body.classList.add('sn-lock');
      setTimeout(() => this.sheet.focus({ preventScroll: true }), 50);
    }
    close() {
      this.classList.remove('is-open');
      document.body.classList.remove('sn-lock');
      setTimeout(() => { if (!this.classList.contains('is-open')) { this.overlay.hidden = true; this.sheet.hidden = true; } }, RM ? 0 : 500);
      if (this.trigger && this.trigger.focus) this.trigger.focus({ preventScroll: true });
    }
    pick() {
      const w = this.seg.map((s) => Math.max(0, Number(s.weight) || 0));
      const sum = w.reduce((a, b) => a + b, 0);
      if (!sum) return Math.floor(Math.random() * this.seg.length);
      let r = Math.random() * sum;
      for (let i = 0; i < w.length; i++) { r -= w[i]; if (r < 0) return i; }
      return 0;
    }
    spin() {
      if (this.spun || !this.seg.length) return;
      this.spun = true;
      const btn = this.querySelector('[data-spin]'); btn.disabled = true;
      const i = this.pick(), n = this.seg.length, jit = (Math.random() - 0.5) * (300 / n) * 0.8;
      const deg = 360 * 6 + (360 - i * (360 / n)) + jit;
      this.querySelector('[data-disc]').style.transform = `rotate(${deg}deg)`;
      const res = { prize: this.seg[i].prize, code: this.seg[i].code };
      setTimeout(() => {
        this.showWin(res);
        if (this.dataset.once === 'true') { try { localStorage.setItem(this.key, JSON.stringify(res)); } catch (_) {} }
      }, RM ? 50 : 4700);
    }
    showWin(res, restored) {
      this.spun = true;
      this.querySelector('[data-spin-area]').hidden = true;
      const win = this.querySelector('[data-win]');
      this.querySelector('[data-prize]').textContent = res.prize;
      this.querySelector('[data-code]').textContent = res.code;
      const root = (this.dataset.root || '/').replace(/\/$/, '');
      const redeem = this.querySelector('[data-redeem]');
      if (res.code) redeem.href = root + '/discount/' + encodeURIComponent(res.code) + '?redirect=' + encodeURIComponent(this.dataset.redirect || '/collections/all');
      win.hidden = false;
      if (!restored) win.classList.add('is-pop');
    }
    copy(btn) {
      const code = this.querySelector('[data-code]').textContent;
      const done = () => { btn.textContent = btn.dataset.done || '✓'; };
      if (navigator.clipboard) navigator.clipboard.writeText(code).then(done, done); else done();
    }
  }
  define('sn-wheel', SnWheel);

  /* ---------- Start ---------- */
  const init = () => observeReveal();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  document.addEventListener('shopify:section:load', (e) => observeReveal(e.target));
})();
