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

  /* ---------- Einkaufswagen öffnen / Zähler ---------- */
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

/* Endloses Scrollen in Kollektionen: lädt automatisch die nächste Seite nach */
if (!customElements.get('sn-infinite')) {
  customElements.define('sn-infinite', class extends HTMLElement {
    connectedCallback() {
      this.loading = false;
      this.io = new IntersectionObserver((e) => { if (e[0].isIntersecting) this.load(); }, { rootMargin: '900px 0px' });
      this.io.observe(this);
      const btn = this.querySelector('a');
      if (btn) btn.addEventListener('click', (ev) => { ev.preventDefault(); this.load(); });
    }
    disconnectedCallback() { this.io && this.io.disconnect(); }
    async load() {
      const url = this.dataset.next;
      if (this.loading || !url) return;
      this.loading = true; this.classList.add('is-loading');
      try {
        const html = await (await fetch(url)).text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const grid = document.getElementById('product-grid');
        const newGrid = doc.getElementById('product-grid');
        if (grid && newGrid) {
          newGrid.querySelectorAll(':scope > li').forEach((li) => {
            li.classList.remove('scroll-trigger', 'animate--slide-in');
            grid.appendChild(document.importNode(li, true));
          });
        }
        const next = doc.querySelector('sn-infinite');
        if (next && next.dataset.next) { this.dataset.next = next.dataset.next; this.querySelector('a').href = next.dataset.next; }
        else { this.io.disconnect(); this.remove(); return; }
      } catch (e) { /* bei Fehler bleibt der Button zum manuellen Nachladen */ }
      this.loading = false; this.classList.remove('is-loading');
    }
  });
}

/* Preise wie im Discounter: große Euro, kleine hochgestellte Cent (z. B. 1,⁹⁹ €) */
(function () {
  const RX = /^(\D*?)(\d{1,3}(?:\.\d{3})*|\d+),(\d{2})(\s*€?)$/;
  function fmt(el) {
    if (el.dataset.snP) return;
    const t = el.textContent.trim().replace(/ /g, ' ');
    const m = t.match(RX);
    if (!m) return;
    el.dataset.snP = '1';
    el.setAttribute('aria-label', t);
    el.innerHTML = '<span aria-hidden="true" class="sn-p"><span class="sn-p__e">' + m[2] + '</span><span class="sn-p__c">,' + m[3] + '</span><span class="sn-p__cur">' + (m[4].trim() || m[1].trim() || '€') + '</span></span>';
  }
  function run(root) { (root || document).querySelectorAll('.price-item--sale, .price__regular .price-item--regular, .sn-pick__price b, [data-sn-price]').forEach((el) => { if (el.tagName !== 'S' && !el.closest('s')) fmt(el); }); }
  document.addEventListener('DOMContentLoaded', () => run());
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => n.nodeType === 1 && run(n)))).observe(document.documentElement, { childList: true, subtree: true });
})();

/* Katalog-Ansicht (Groß / Kompakt / Liste) – merkt sich die Wahl */
(function () {
  const KEY = 'sn-view';
  function apply(v) {
    document.documentElement.dataset.snView = v;
    document.querySelectorAll('[data-sn-view]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.snView === v));
  }
  let v = 'grid'; try { v = localStorage.getItem(KEY) || 'grid'; } catch (e) {}
  apply(v);
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sn-view]'); if (!b) return;
    apply(b.dataset.snView); try { localStorage.setItem(KEY, b.dataset.snView); } catch (err) {}
  });
  new MutationObserver(() => apply(document.documentElement.dataset.snView || 'grid')).observe(document.body || document.documentElement, { childList: true, subtree: true });
})();

/* Lieferdatum auf der Produktseite (bis 14 Uhr bestellt = Versand heute, 1–2 Werktage Zustellung) */
(function () {
  function addBiz(d, n) { const r = new Date(d); while (n > 0) { r.setDate(r.getDate() + 1); if (r.getDay() !== 0 && r.getDay() !== 6) n--; } return r; }
  function run() {
    const els = document.querySelectorAll('[data-sn-eta]'); if (!els.length) return;
    const now = new Date(); let ship = new Date(now);
    const weekend = now.getDay() === 0 || now.getDay() === 6;
    if (weekend || now.getHours() >= 14) ship = addBiz(now, 1);
    const a = addBiz(ship, 1), b = addBiz(ship, 2);
    const f = (d) => d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
    els.forEach((el) => { el.textContent = f(a) + ' – ' + f(b); });
    const left = new Date(now); left.setHours(14, 0, 0, 0);
    const mins = Math.round((left - now) / 60000);
    document.querySelectorAll('[data-sn-eta-hint]').forEach((h) => {
      h.textContent = (!weekend && mins > 0) ? 'Bestell in ' + Math.floor(mins / 60) + ' Std. ' + (mins % 60) + ' Min. – Versand noch heute' : 'Versand am nächsten Werktag';
    });
  }
  document.addEventListener('DOMContentLoaded', run);
})();

/* v12: Suche – wechselnder Platzhalter */
(function () {
  const inputs = document.querySelectorAll('[data-sn-rotate]'); if (!inputs.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  inputs.forEach((inp) => {
    const words = inp.dataset.snRotate.split('|'); let i = 0;
    setInterval(() => { if (document.activeElement === inp || inp.value) return; i = (i + 1) % words.length; inp.placeholder = 'Suche z. B. „' + words[i] + '“'; }, 2600);
  });
})();

/* v12: Kompakter Header beim Scrollen + Nach-oben-Button */
(function () {
  const top = document.createElement('button');
  top.type = 'button'; top.className = 'sn-totop'; top.setAttribute('aria-label', 'Nach oben');
  top.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="m5 12 7-7 7 7M12 19V5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(top));
  let ticking = false;
  const on = () => { const y = window.scrollY; document.documentElement.classList.toggle('sn-scrolled', y > 140); top.classList.toggle('is-on', y > 900); ticking = false; };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(on); } }, { passive: true });
})();

/* v12: Tab „Suche“ springt ins Suchfeld */
(function () {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href$="#suche"]'); if (!a) return;
    const inp = document.querySelector('#SnBandSearch') || document.querySelector('#SnHeaderSearch');
    if (!inp || location.pathname !== new URL(a.href, location.href).pathname) return;
    e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => inp.focus(), 250);
  });
  if (location.hash === '#suche') document.addEventListener('DOMContentLoaded', () => { const i = document.querySelector('#SnBandSearch'); if (i) i.focus(); });
})();

/* v17: Zuletzt angesehen – echte Produktkarten mit Einkaufswagen-Button */
(function () {
  const KEY = 'sn-recent';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };
  const m = location.pathname.match(/\/products\/([^/?#]+)/);
  if (m) { try { const l = read().filter((h) => h !== m[1]); l.unshift(m[1]); localStorage.setItem(KEY, JSON.stringify(l.slice(0, 12))); } catch (e) {} }
  const eur = (c) => (c / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const root = () => (window.Shopify && Shopify.routes ? Shopify.routes.root : '/');
  customElements.get('sn-recent') || customElements.define('sn-recent', class extends HTMLElement {
    async connectedCallback() {
      const cur = this.dataset.current; const handles = read().filter((h) => h && h !== cur).slice(0, 6);
      const clear = this.querySelector('[data-clear]');
      if (clear) clear.addEventListener('click', () => { try { localStorage.removeItem(KEY); } catch (e) {} this.hidden = true; });
      if (!handles.length) return;
      const list = this.querySelector('[data-list]');
      const items = await Promise.all(handles.map((h) => fetch(root() + 'products/' + h + '.js').then((r) => (r.ok ? r.json() : null)).catch(() => null)));
      items.filter(Boolean).forEach((p) => {
        const v = (p.variants || []).find((x) => x.available) || (p.variants || [])[0] || {};
        const img = p.featured_image ? p.featured_image.replace(/(\.[a-z]+)(\?|$)/i, '_400x400$1$2') : '';
        const cmp = v.compare_at_price && v.compare_at_price > v.price ? v.compare_at_price : 0;
        const pct = cmp ? Math.round((1 - v.price / cmp) * 100) : 0;
        const li = document.createElement('li');
        li.className = 'sn-rc';
        li.innerHTML =
          '<a class="sn-rc__media" href="' + p.url + '">' + (img ? '<img src="' + img + '" alt="" width="200" height="200" loading="lazy">' : '') + (pct ? '<span class="sn-rc__pct">−' + pct + ' %</span>' : '') + '</a>' +
          '<a class="sn-rc__title" href="' + p.url + '">' + esc(p.title) + '</a>' +
          '<div class="sn-rc__price">' + (cmp ? '<s>' + eur(cmp) + '</s>' : '') + '<b' + (cmp ? ' class="is-sale"' : '') + '>' + eur(v.price || p.price) + '</b></div>' +
          (p.available && v.id ? '<product-form class="sn-rc__form" data-section-id="sn-recent"><form method="post" action="' + root() + 'cart/add" novalidate><input type="hidden" name="id" value="' + v.id + '"><div class="product-form__error-message-wrapper" hidden><span class="product-form__error-message"></span></div><button type="submit" name="add" class="sn-cartbtn sn-rc__btn"><span>In den Einkaufswagen</span><div class="loading__spinner hidden"></div></button></form></product-form>' : '<span class="sn-rc__soldout">Ausverkauft</span>');
        list.appendChild(li);
      });
      if (list.children.length) this.hidden = false;
    }
  });
})();

/* v12: Lieferdatum auch im Einkaufswagen (nach jedem Neuladen des Korbs) */
(function () {
  function addBiz(d, n) { const r = new Date(d); while (n > 0) { r.setDate(r.getDate() + 1); if (r.getDay() !== 0 && r.getDay() !== 6) n--; } return r; }
  function fill() {
    const now = new Date(); let ship = new Date(now);
    if (now.getDay() === 0 || now.getDay() === 6 || now.getHours() >= 14) ship = addBiz(now, 1);
    const f = (d) => d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
    const txt = f(addBiz(ship, 1)) + ' – ' + f(addBiz(ship, 2));
    document.querySelectorAll('[data-sn-eta]').forEach((el) => { if (el.textContent !== txt) el.textContent = txt; });
  }
  document.addEventListener('DOMContentLoaded', () => {
    fill();
    const d = document.querySelector('cart-drawer'); if (d) new MutationObserver(fill).observe(d, { childList: true, subtree: true });
  });
})();

/* v13: Schnapper des Tages – wechselt täglich um 0 Uhr, Countdown bis Mitternacht */
customElements.get('sn-daily') || customElements.define('sn-daily', class extends HTMLElement {
  connectedCallback() {
    const items = [...this.querySelectorAll('[data-sn-daily-item]')];
    if (items.length) {
      const now = new Date(); const day = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 864e5) + now.getFullYear() * 366;
      const pick = day % items.length; items.forEach((el, i) => { el.hidden = i !== pick; });
    }
    const out = this.querySelector('[data-sn-countdown]'); if (!out) return;
    const tick = () => {
      const n = new Date(); const m = new Date(n); m.setHours(24, 0, 0, 0);
      let s = Math.max(0, Math.floor((m - n) / 1000)); const h = Math.floor(s / 3600); s -= h * 3600; const mi = Math.floor(s / 60); s -= mi * 60;
      out.textContent = [h, mi, s].map((x) => String(x).padStart(2, '0')).join(':');
    };
    tick(); this._t = setInterval(tick, 1000);
  }
  disconnectedCallback() { clearInterval(this._t); }
});

/* v13: „Neu seit deinem letzten Besuch“ + Live&Deals-Button */
(function () {
  const KEY = 'sn-last-visit';
  document.addEventListener('DOMContentLoaded', async () => {
    const bar = document.querySelector('[data-sn-newbar]');
    let last = 0; try { last = +localStorage.getItem(KEY) || 0; } catch (e) {}
    const now = Date.now();
    // Besuch erst nach 30 Min. Pause als „neu“ zählen
    let seen = 0; try { seen = +sessionStorage.getItem(KEY) || 0; } catch (e) {}
    if (!seen) { try { sessionStorage.setItem(KEY, String(last || now)); localStorage.setItem(KEY, String(now)); } catch (e) {} seen = last; }
    if (bar && seen && now - seen > 30 * 60000 && !sessionStorage.getItem('sn-newbar-closed')) {
      try {
        const r = await fetch((window.Shopify && Shopify.routes ? Shopify.routes.root : '/') + 'products.json?limit=250');
        const { products } = await r.json();
        const n = products.filter((p) => new Date(p.published_at || p.created_at).getTime() > seen).length;
        if (n > 0) { bar.querySelector('[data-n]').textContent = n; bar.hidden = false; }
      } catch (e) {}
    }
    if (bar) bar.querySelector('[data-close]').addEventListener('click', () => { bar.hidden = true; try { sessionStorage.setItem('sn-newbar-closed', '1'); } catch (e) {} });
    const d = document.querySelector('[data-sn-dealsbtn]');
    if (d) {
      document.addEventListener('click', (e) => { if (d.open && !d.contains(e.target) && !e.target.closest('a[href$="#deals"]')) d.open = false; });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') d.open = false; });
      d.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => { d.open = false; }));
    }
  });
})();

/* v13: Tab „Deals“ öffnet die Live-&-Deals-Auswahl */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href$="#deals"]'); if (!a) return;
  const d = document.querySelector('[data-sn-dealsbtn]'); if (!d) return;
  e.preventDefault(); e.stopPropagation(); d.open = !d.open;
}, true);

/* v14: Rabattcode im Einkaufswagen – direkt mit Shopify verknüpft (Cart-API) */
(function () {
  const root = () => (window.Shopify && Shopify.routes ? Shopify.routes.root : '/');
  const codesOf = (form) => (form.dataset.codes || '').split(',').map((c) => c.trim()).filter(Boolean);
  async function apply(codes, form, tried) {
    const msg = () => document.querySelector('[data-sn-code] [data-msg]');
    const btn = form && form.querySelector('.sn-code__btn'); if (btn) { btn.disabled = true; btn.textContent = '…'; }
    try {
      const r = await fetch(root() + 'cart/update.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ discount: codes.join(','), sections: ['cart-drawer', 'cart-icon-bubble'] }) });
      if (!r.ok) throw new Error('http');
      const cart = await r.json();
      const drawer = document.querySelector('cart-drawer');
      if (cart.sections && drawer && drawer.renderContents) drawer.renderContents({ id: null, sections: cart.sections });
      else if (!document.querySelector('cart-drawer')) location.reload();
      setTimeout(() => {
        const m = msg(); if (!m || !tried) return;
        const hit = (cart.discount_codes || []).find((c) => c.code.toLowerCase() === tried.toLowerCase());
        if (hit && hit.applicable) { m.textContent = '✓ Code „' + hit.code + '“ wurde eingelöst.'; m.className = 'sn-code__msg is-ok'; }
        else {
          m.textContent = 'Der Code „' + tried + '“ ist ungültig oder gilt nicht für diesen Einkauf.'; m.className = 'sn-code__msg is-err';
          const ok = (cart.discount_codes || []).filter((c) => c.applicable).map((c) => c.code);
          if (hit) fetch(root() + 'cart/update.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ discount: ok.join(',') }) });
        }
      }, 60);
    } catch (e) {
      // Rückfall: Shopify-Rabattlink (Code wird für die Kasse gespeichert)
      if (tried) location.href = root() + 'discount/' + encodeURIComponent(tried) + '?redirect=' + encodeURIComponent(location.pathname + location.search);
    } finally { if (btn) { btn.disabled = false; btn.textContent = 'Einlösen'; } }
  }
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-sn-code]'); if (!form) return;
    e.preventDefault();
    const code = (form.querySelector('input[name="code"]').value || '').trim();
    const m = form.querySelector('[data-msg]');
    if (!code) { m.textContent = 'Bitte gib einen Code ein.'; m.className = 'sn-code__msg is-err'; return; }
    const list = codesOf(form); if (!list.some((c) => c.toLowerCase() === code.toLowerCase())) list.push(code);
    apply(list, form, code);
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sn-code] [data-remove]'); if (!b) return;
    const form = b.closest('[data-sn-code]');
    apply(codesOf(form).filter((c) => c.toLowerCase() !== b.dataset.remove.toLowerCase()), form, null);
  });
})();

/* =====================================================================
   v19 – Schnappy-Funktionen (Handy, Merkzettel, Einkaufswagen, Wiederkommen)
   ===================================================================== */
(function () {
  'use strict';
  const CFG = () => window.SN_CFG || { shipFree: 4400, giftAt: 0 };
  const ROOT = () => (window.Shopify && Shopify.routes ? Shopify.routes.root : '/');
  const isMobile = () => window.matchMedia('(max-width: 749px)').matches;
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const eur = (c) => (c / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const icon = (name) => { const t = document.querySelector('template#sn-icon-' + name); return t ? t.innerHTML : ''; };
  const SN = (window.SN = window.SN || {});

  /* ---------- Toast ---------- */
  SN.toast = function (html, actions, ms) {
    let box = document.querySelector('.sn-toast');
    if (!box) { box = document.createElement('div'); box.className = 'sn-toast'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    box.innerHTML = '<div class="sn-toast__msg">' + html + '</div>' + (actions || '');
    box.classList.add('is-on');
    clearTimeout(box._t); box._t = setTimeout(() => box.classList.remove('is-on'), ms || 4500);
    return box;
  };

  /* ---------- Produktdaten (einmal laden, für Vorschläge & Zähler) ---------- */
  let productsPromise = null;
  SN.products = function () {
    if (!productsPromise) productsPromise = fetch(ROOT() + 'products.json?limit=250').then((r) => r.json()).then((j) => j.products || []).catch(() => []);
    return productsPromise;
  };

  /* ---------- Einkaufswagen neu zeichnen ---------- */
  SN.drawer = () => document.querySelector('cart-drawer');
  SN.refreshCart = function (state, open) {
    const d = SN.drawer();
    if (!d) { location.href = ROOT() + 'cart'; return; }
    SN._forceOpen = !!open;
    d.renderContents(state);
    SN._forceOpen = false;
  };
  SN.addToCart = function (items, open) {
    return fetch(ROOT() + 'cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ items, sections: ['cart-drawer', 'cart-icon-bubble'] }) })
      .then((r) => r.json())
      .then((res) => { if (res.status) { SN.toast(esc(res.description || res.message || 'Konnte nicht hinzugefügt werden.')); return; } SN.refreshCart({ id: items[0].id, sections: res.sections }, open); return res; });
  };

  /* 2) Handy: nach dem Hinzufügen kurze Bestätigung statt Vollbild-Schublade */
  function patchDrawer() {
    const CD = customElements.get('cart-drawer');
    if (!CD || CD.prototype._snPatched) return;
    CD.prototype._snPatched = true;
    const orig = CD.prototype.renderContents;
    CD.prototype.renderContents = function (state) {
      if (!isMobile() || this.classList.contains('active') || SN._forceOpen) return orig.call(this, state);
      const inner = this.querySelector('.drawer__inner');
      if (inner && inner.classList.contains('is-empty')) inner.classList.remove('is-empty');
      this.productId = state.id;
      this.getSectionsToRender().forEach((section) => {
        const el = section.selector ? document.querySelector(section.selector) : document.getElementById(section.id);
        if (el && state.sections && state.sections[section.id]) el.innerHTML = this.getSectionInnerHTML(state.sections[section.id], section.selector);
      });
      this.classList.remove('is-empty');
      const ov = this.querySelector('#CartDrawer-Overlay'); if (ov) ov.addEventListener('click', this.close.bind(this));
      const t = SN.toast(icon('check') + '<span><b>Im Einkaufswagen</b></span>', '<div class="sn-toast__acts"><button type="button" data-open>Ansehen</button><a href="' + ROOT() + 'checkout">Zur Kasse</a></div>', 5000);
      const b = t.querySelector('[data-open]'); if (b) b.addEventListener('click', () => { t.classList.remove('is-on'); this.open(); });
      document.dispatchEvent(new CustomEvent('sn:cart-updated'));
    };
  }

  /* ---------- Merkzettel (21, 22, 56) ---------- */
  const WKEY = 'sn-wish';
  const wish = () => ls.get(WKEY, []);
  function syncHearts() {
    const w = wish();
    document.querySelectorAll('[data-sn-heart]').forEach((b) => { const on = w.includes(b.dataset.snHeart); b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); const s = b.querySelector('span'); if (s && b.classList.contains('sn-pdp-act')) s.textContent = on ? 'Gemerkt' : 'Merken'; });
    document.querySelectorAll('[data-sn-wish-count]').forEach((c) => { c.textContent = w.length; c.hidden = !w.length; });
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sn-heart]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const h = b.dataset.snHeart; let w = wish();
    if (w.includes(h)) { w = w.filter((x) => x !== h); SN.toast('Vom Merkzettel entfernt'); }
    else { w.unshift(h); SN.toast(icon('heart') + '<span>Gemerkt! <a href="' + ROOT() + 'pages/merkzettel">Merkzettel ansehen</a></span>'); }
    ls.set(WKEY, w.slice(0, 60)); syncHearts();
  });
  SN.cardHTML = function (p) {
    const v = (p.variants || []).find((x) => x.available) || (p.variants || [])[0] || {};
    const price = typeof v.price === 'string' ? Math.round(parseFloat(v.price) * 100) : v.price;
    const cmpRaw = v.compare_at_price; const cmp = cmpRaw ? (typeof cmpRaw === 'string' ? Math.round(parseFloat(cmpRaw) * 100) : cmpRaw) : 0;
    const sale = cmp > price; const pct = sale ? Math.round((1 - price / cmp) * 100) : 0;
    let img = p.featured_image || (p.images && p.images[0] && (p.images[0].src || p.images[0])) || '';
    if (typeof img === 'string' && img) img = img.replace(/(\.[a-z]+)(\?|$)/i, '_400x400$1$2');
    const url = p.url || ROOT() + 'products/' + p.handle;
    const title = String(p.title || '').split(' //')[0];
    return '<a class="sn-rc__media" href="' + url + '">' + (img ? '<img src="' + img + '" alt="" width="200" height="200" loading="lazy">' : '') + (pct ? '<span class="sn-rc__pct">−' + pct + ' %</span>' : '') + '</a>' +
      '<a class="sn-rc__title" href="' + url + '">' + esc(title) + '</a>' +
      '<div class="sn-rc__price">' + (sale ? '<s>' + eur(cmp) + '</s>' : '') + '<b' + (sale ? ' class="is-sale"' : '') + '>' + eur(price) + '</b></div>' +
      (p.available !== false && v.id ? '<button type="button" class="sn-cartbtn sn-rc__btn" data-sn-add="' + v.id + '">In den Einkaufswagen</button>' : '<span class="sn-rc__soldout">Ausverkauft</span>');
  };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sn-add]'); if (!b) return;
    e.preventDefault(); b.disabled = true; const t = b.textContent; b.textContent = '…';
    SN.addToCart([{ id: +b.dataset.snAdd, quantity: 1 }], !isMobile()).finally(() => { b.disabled = false; b.textContent = t; });
  });
  customElements.get('sn-wishlist') || customElements.define('sn-wishlist', class extends HTMLElement {
    async connectedCallback() {
      const list = this.querySelector('[data-list]'); const empty = this.querySelector('[data-empty]');
      const render = async () => {
        const w = wish(); list.innerHTML = '';
        if (!w.length) { empty.hidden = false; return; }
        empty.hidden = true;
        const items = await Promise.all(w.map((h) => fetch(ROOT() + 'products/' + h + '.js').then((r) => (r.ok ? r.json() : null)).catch(() => null)));
        items.forEach((p, i) => { if (!p) return; const li = document.createElement('li'); li.className = 'sn-rc'; li.innerHTML = '<button type="button" class="sn-heart is-on" data-sn-heart="' + esc(w[i]) + '" aria-pressed="true" aria-label="Entfernen">' + icon('heart') + '</button>' + SN.cardHTML(p); list.appendChild(li); });
      };
      render();
      document.addEventListener('click', (e) => { if (e.target.closest('[data-sn-heart]') && this.contains(e.target)) setTimeout(render, 50); });
      const clr = document.querySelector('[data-sn-wl-clear]'); if (clr) clr.addEventListener('click', () => { ls.set(WKEY, []); render(); syncHearts(); });
    }
  });

  /* ---------- Produktreihen (12, 13, 80) ---------- */
  customElements.get('sn-row') || customElements.define('sn-row', class extends HTMLElement {
    connectedCallback() {
      const body = this.querySelector('[data-body]');
      const go = () => fetch(this.dataset.url).then((r) => r.text()).then((html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const ul = doc.querySelector('.sn-row__list');
        if (!ul || !ul.children.length) { this.closest('.shopify-section') ? (this.closest('.shopify-section').hidden = true) : (this.hidden = true); return; }
        body.innerHTML = ''; body.appendChild(ul);
        SN.markImages && SN.markImages(this); syncHearts();
        const nav = (dir) => ul.scrollBy({ left: dir * ul.clientWidth * 0.8, behavior: reduce() ? 'auto' : 'smooth' });
        const p = this.querySelector('[data-prev]'); const n = this.querySelector('[data-next]');
        if (p) p.addEventListener('click', () => nav(-1)); if (n) n.addEventListener('click', () => nav(1));
      }).catch(() => { this.hidden = true; });
      if ('IntersectionObserver' in window) { const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { io.disconnect(); go(); } }, { rootMargin: '600px' }); io.observe(this); } else go();
    }
  });

  /* ---------- Wird oft zusammen gekauft (31) ---------- */
  customElements.get('sn-fbt') || customElements.define('sn-fbt', class extends HTMLElement {
    async connectedCallback() {
      const load = (u) => fetch(u).then((r) => r.text()).then((h) => new DOMParser().parseFromString(h, 'text/html').querySelector('.sn-fbt__inner')).catch(() => null);
      let inner = await load(this.dataset.url);
      if (!inner) inner = await load(this.dataset.fallback);
      if (!inner) return;
      this.querySelector('[data-body]').appendChild(inner); this.hidden = false;
      const sum = () => { let s = 0; this.querySelectorAll('input[type=checkbox]:checked').forEach((c) => { s += +c.dataset.price; }); this.querySelector('[data-sum]').textContent = eur(s); };
      sum(); this.addEventListener('change', sum);
      this.querySelector('[data-add]').addEventListener('click', (e) => {
        const items = [...this.querySelectorAll('input[type=checkbox]:checked')].map((c) => ({ id: +c.value, quantity: 1 }));
        if (!items.length) return; e.currentTarget.disabled = true;
        SN.addToCart(items, !isMobile()).finally(() => { e.target.closest('button').disabled = false; });
      });
    }
  });

  /* ---------- Einkaufswagen-Extras (41–45, 49) ---------- */
  async function enhanceDrawer() {
    const cfg = CFG();
    const tier = document.querySelector('[data-sn-tier]');
    if (tier && cfg.giftAt > 0 && !tier.dataset.done) {
      tier.dataset.done = '1';
      const tot = +tier.dataset.total; const left = cfg.giftAt - tot; const pct = Math.min(100, Math.round((tot / cfg.giftAt) * 100));
      tier.innerHTML = icon('gift') + '<span>' + (left > 0 ? 'Noch <b>' + eur(left) + '</b> bis zur <b>' + esc(cfg.giftText) + '</b>' : '<b>' + esc(cfg.giftText) + '</b> freigeschaltet!') + '</span><div class="sn-shipbar__bar"><i style="width:' + pct + '%"></i></div>';
      tier.hidden = false;
    }
    const wel = document.querySelector('[data-sn-welcome]');
    if (wel && cfg.welcomeCode && !wel.dataset.done) {
      wel.dataset.done = '1';
      wel.innerHTML = esc(cfg.welcomeText) + ' <button type="button" class="sn-welcome__code">' + esc(cfg.welcomeCode) + '</button>';
      wel.hidden = false;
      wel.querySelector('button').addEventListener('click', () => { const f = wel.closest('[data-sn-code]'); const i = f && f.querySelector('input[name=code]'); if (i) { i.value = cfg.welcomeCode; f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })); } });
    }
    const fill = document.querySelector('[data-sn-fill]');
    if (fill && !fill.dataset.done) {
      fill.dataset.done = '1';
      const tot = +fill.dataset.total; const left = cfg.shipFree - tot;
      if (tot > 0 && left > 0) {
        const all = (await SN.products()).filter((p) => p.variants && p.variants.some((v) => v.available));
        const pr = (p) => Math.round(parseFloat(p.variants.find((v) => v.available).price) * 100);
        const maker = all.filter((p) => pr(p) >= left).sort((a, b) => pr(a) - pr(b))[0];
        const cheap = all.filter((p) => pr(p) <= 500 && p !== maker).sort((a, b) => pr(b) - pr(a)).slice(0, maker ? 2 : 3);
        const pick = (maker ? [maker] : []).concat(cheap);
        if (pick.length) {
          fill.innerHTML = '<p class="sn-fill__t">' + icon('plus') + ' Passt noch dazu</p><ul class="sn-fill__list" role="list">' + pick.map((p, i) => {
            const v = p.variants.find((x) => x.available); const img = p.images && p.images[0] ? p.images[0].src.replace(/(\.[a-z]+)(\?|$)/i, '_160x160$1$2') : '';
            return '<li class="sn-fill__item' + (p === maker ? ' is-maker' : '') + '">' + (img ? '<img src="' + img + '" alt="" width="56" height="56" loading="lazy">' : '') + '<span class="sn-fill__info">' + (p === maker ? '<em>Damit: Gratis-Versand</em>' : '') + '<a href="' + ROOT() + 'products/' + p.handle + '">' + esc(String(p.title).split(' //')[0]) + '</a><b>' + eur(pr(p)) + '</b></span><button type="button" class="sn-fill__add" data-sn-add="' + v.id + '" aria-label="Hinzufügen">+</button></li>';
          }).join('') + '</ul>';
          fill.hidden = false;
        }
      }
    }
  }
  // Rückgängig nach dem Löschen (49)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('cart-remove-button button, cart-remove-button'); if (!btn) return;
    const row = btn.closest('.cart-item'); if (!row) return;
    const id = (row.querySelector('[data-quantity-variant-id]') || {}).dataset; const q = row.querySelector('.quantity__input');
    if (!id || !id.quantityVariantId) return;
    const vid = +id.quantityVariantId; const qty = q ? +q.value || 1 : 1;
    setTimeout(() => {
      const t = SN.toast('<span>Artikel entfernt</span>', '<div class="sn-toast__acts"><button type="button" data-undo>Rückgängig</button></div>', 6000);
      t.querySelector('[data-undo]').addEventListener('click', () => { t.classList.remove('is-on'); SN.addToCart([{ id: vid, quantity: qty }], true); });
    }, 400);
  }, true);
  // Zähler-Animation (45)
  function watchBubble() {
    const b = document.getElementById('cart-icon-bubble'); if (!b) return;
    new MutationObserver(() => { const c = b.querySelector('.cart-count-bubble') || b; c.classList.remove('sn-bump'); void c.offsetWidth; c.classList.add('sn-bump'); }).observe(b, { childList: true, subtree: true });
  }

  /* ---------- Handy: Kaufleiste (1), Galerie-Punkte (3), Beschreibung (34) ---------- */
  function stickyBuy() {
    const main = document.querySelector('.product__info-container .product-form__submit');
    if (!main || document.querySelector('.sn-buybar')) return;
    const title = (document.querySelector('.product__title h1') || {}).textContent || '';
    const priceEl = document.querySelector('.product__info-container .price-item--sale, .product__info-container .price__regular .price-item--regular');
    const bar = document.createElement('div'); bar.className = 'sn-buybar'; bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<div class="sn-buybar__info"><span class="sn-buybar__t">' + esc(title.trim()) + '</span><b class="sn-buybar__p">' + esc(priceEl ? priceEl.textContent.trim() : '') + '</b></div><button type="button" class="sn-buybar__btn" tabindex="-1">In den Einkaufswagen</button>';
    document.body.appendChild(bar);
    bar.querySelector('button').addEventListener('click', () => main.click());
    if (main.disabled) bar.querySelector('button').disabled = true;
    new IntersectionObserver((en) => { bar.classList.toggle('is-on', !en[0].isIntersecting && en[0].boundingClientRect.top < 0); }).observe(main);
    document.body.classList.add('sn-has-buybar');
  }
  function galleryDots() {
    const list = document.querySelector('.product__media-wrapper .product__media-list'); if (!list || list.children.length < 2) return;
    const wrap = list.closest('slider-component') || list.parentElement; if (wrap.querySelector('.sn-dots-nav')) return;
    const nav = document.createElement('div'); nav.className = 'sn-dots-nav';
    const items = [...list.children];
    items.forEach((it, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Bild ' + (i + 1)); b.addEventListener('click', () => list.scrollTo({ left: it.offsetLeft - list.offsetLeft, behavior: reduce() ? 'auto' : 'smooth' })); nav.appendChild(b); });
    wrap.appendChild(nav);
    const upd = () => { const i = Math.round(list.scrollLeft / Math.max(1, list.clientWidth)); [...nav.children].forEach((b, j) => b.classList.toggle('is-on', j === i)); };
    list.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true }); upd();
  }
  function collapseDesc() {
    const d = document.querySelector('.product__description'); if (!d || d.dataset.sn) return; d.dataset.sn = '1';
    if (d.scrollHeight < 220) return;
    d.classList.add('sn-desc', 'is-closed');
    const b = document.createElement('button'); b.type = 'button'; b.className = 'sn-desc__more'; b.textContent = 'Mehr anzeigen';
    b.addEventListener('click', () => { const c = d.classList.toggle('is-closed'); b.textContent = c ? 'Mehr anzeigen' : 'Weniger anzeigen'; });
    d.after(b);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-sn-copy]'); if (!a) return;
    try { navigator.clipboard.writeText(a.dataset.snCopy); SN.toast('Produktlink kopiert – füg ihn in die Nachricht ein.'); } catch (err) {}
  });

  /* ---------- Suche: Vollbild auf dem Handy (5) + zuletzt gesucht (57) ---------- */
  const SKEY = 'sn-searches';
  document.addEventListener('submit', (e) => {
    const f = e.target; if (!f.matches || !f.matches('form[action*="/search"]')) return;
    const q = (f.querySelector('input[name=q]') || {}).value; if (!q || !q.trim()) return;
    const l = ls.get(SKEY, []).filter((x) => x.toLowerCase() !== q.trim().toLowerCase()); l.unshift(q.trim()); ls.set(SKEY, l.slice(0, 6));
  }, true);
  function recentSearches(form) {
    let box = form.querySelector('.sn-rs');
    if (!box) { box = document.createElement('div'); box.className = 'sn-rs'; box.hidden = true; form.appendChild(box); }
    const l = ls.get(SKEY, []);
    const inp = form.querySelector('input[name=q]');
    if (!l.length || (inp && inp.value)) { box.hidden = true; return; }
    box.innerHTML = '<p class="sn-rs__t">Zuletzt gesucht <button type="button" data-rs-clear>Löschen</button></p><div class="sn-rs__list">' + l.map((q) => '<a href="' + ROOT() + 'search?type=product&q=' + encodeURIComponent(q) + '">' + esc(q) + '</a>').join('') + '</div>';
    box.hidden = false;
    box.querySelector('[data-rs-clear]').addEventListener('click', (ev) => { ev.preventDefault(); ls.set(SKEY, []); box.hidden = true; });
  }
  document.addEventListener('focusin', (e) => {
    const inp = e.target.closest('.sn-sform input[name=q]'); if (!inp) return;
    const form = inp.closest('form'); recentSearches(form);
    if (isMobile() && inp.closest('.sn-searchbar')) {
      document.documentElement.classList.add('sn-search-open');
      const bar = inp.closest('.sn-searchbar');
      if (!bar.querySelector('.sn-search-close')) { const c = document.createElement('button'); c.type = 'button'; c.className = 'sn-search-close'; c.textContent = 'Abbrechen'; c.addEventListener('click', () => { document.documentElement.classList.remove('sn-search-open'); inp.blur(); }); bar.querySelector('.page-width').appendChild(c); }
    }
  });
  document.addEventListener('input', (e) => { const inp = e.target.closest('.sn-sform input[name=q]'); if (inp) recentSearches(inp.closest('form')); });
  document.addEventListener('focusout', (e) => { const inp = e.target.closest('.sn-sform input[name=q]'); if (!inp) return; setTimeout(() => { const f = inp.closest('form'); if (f && !f.contains(document.activeElement)) { const b = f.querySelector('.sn-rs'); if (b) b.hidden = true; } }, 200); });

  /* ---------- Scrollen: Nach-oben nur beim Hochscrollen (8), Leiste aus beim Runterscrollen (9) ---------- */
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY; const down = y > lastY + 4; const up = y < lastY - 4;
    if (down && y > 200) document.documentElement.classList.add('sn-down');
    if (up || y < 120) document.documentElement.classList.remove('sn-down');
    const top = document.querySelector('.sn-totop'); if (top) top.classList.toggle('is-up', up && y > 900);
    if (down || y < 900) { if (top) top.classList.remove('is-up'); }
    lastY = y;
  }, { passive: true });

  /* ---------- Bilder weich einblenden (28, 29) ---------- */
  SN.markImages = function (root) {
    (root || document).querySelectorAll('.product-card-wrapper .card__media img, .sn-rc__media img, .sn-h2__p img').forEach((img) => {
      if (img.dataset.snImg) return; img.dataset.snImg = '1';
      const done = () => img.classList.add('is-loaded');
      if (img.complete && img.naturalWidth) done(); else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
    });
  };
  document.documentElement.classList.add('sn-js');
  setTimeout(() => document.querySelectorAll('.product-card-wrapper .card__media img').forEach((i) => i.classList.add('is-loaded')), 4000);

  /* ---------- Neu seit letztem Besuch auf Karten (55) ---------- */
  function newForYou(root) {
    let seen = 0; try { seen = +sessionStorage.getItem('sn-last-visit') || 0; } catch (e) {}
    if (!seen) return;
    (root || document).querySelectorAll('.product-card-wrapper[data-pub]').forEach((c) => {
      if (c.dataset.snNew) return; c.dataset.snNew = '1';
      if (+c.dataset.pub * 1000 > seen) { const s = document.createElement('span'); s.className = 'sn-newfor'; s.textContent = 'Neu für dich'; const inner = c.querySelector('.card__inner'); if (inner) inner.appendChild(s); }
    });
  }

  /* ---------- Startseite: Saison (15), Tagesbalken (16), Zähler (17), Teilen (58) ---------- */
  function homeBits() {
    document.querySelectorAll('.sn-season[data-start]').forEach((s) => {
      if (window.Shopify && Shopify.designMode) return;
      const d = new Date(); const t = +(d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'));
      if (t < +s.dataset.start || t > +s.dataset.end) { const sec = s.closest('.shopify-section'); (sec || s).hidden = true; }
    });
    const bar = document.querySelector('[data-sn-dayprog]');
    if (bar) { const tick = () => { const n = new Date(); const p = (n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds()) / 864; bar.style.width = (100 - p) + '%'; }; tick(); setInterval(tick, 30000); }
    const cnt = document.querySelector('[data-sn-newcount]');
    if (cnt) SN.products().then((ps) => { const wk = Date.now() - 7 * 864e5; const n = ps.filter((p) => new Date(p.published_at || p.created_at).getTime() > wk).length; if (n >= 3) { cnt.textContent = '✓ ' + n + ' neue Artikel diese Woche'; cnt.hidden = false; } });
    document.querySelectorAll('[data-sn-share]').forEach((b) => b.addEventListener('click', async () => {
      const url = b.dataset.snShare; const title = b.dataset.title || document.title;
      if (navigator.share) { try { await navigator.share({ title, url }); } catch (e) {} } else { try { await navigator.clipboard.writeText(url); SN.toast('Link kopiert!'); } catch (e) {} }
    }));
  }

  /* ---------- Newsletter-Pop-up (51) ---------- */
  customElements.get('sn-popup') || customElements.define('sn-popup', class extends HTMLElement {
    connectedCallback() {
      const cfg = CFG(); const shown = ls.get('sn-pop', 0);
      const posted = /customer_posted=true/.test(location.search) || location.hash === '#SnPopForm' || this.querySelector('[data-ok]');
      const open = () => { if (this._open) return; this._open = true; this.hidden = false; requestAnimationFrame(() => this.classList.add('is-on')); ls.set('sn-pop', Date.now()); const i = this.querySelector('input[type=email]'); if (i && !isMobile()) setTimeout(() => i.focus(), 300); };
      const close = () => { this.classList.remove('is-on'); setTimeout(() => { this.hidden = true; }, 250); };
      this.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !this.hidden) close(); });
      if (posted && this.querySelector('[data-ok]')) { open(); return; }
      if (!cfg.popup || shown || /\/(cart|checkout|account)/.test(location.pathname) || document.querySelector('.sn-newsbar__ok, .newsletter-form__message--success')) return;
      setTimeout(open, (cfg.popupDelay || 20) * 1000);
      if (!isMobile()) document.addEventListener('mouseout', (e) => { if (!e.relatedTarget && e.clientY < 8) open(); });
    }
  });

  /* ---------- Live-Leiste nach Zeitplan (53) ---------- */
  customElements.get('sn-livebar') || customElements.define('sn-livebar', class extends HTMLElement {
    connectedCallback() {
      const cfg = CFG(); if (!cfg.liveDays) return;
      const map = { so: 0, mo: 1, di: 2, mi: 3, do: 4, fr: 5, sa: 6 };
      const days = String(cfg.liveDays).split(',').map((d) => map[d.trim().toLowerCase().slice(0, 2)]).filter((d) => d !== undefined);
      const [hh, mm] = String(cfg.liveTime || '19:00').split(':').map(Number);
      const now = new Date(); if (!days.includes(now.getDay())) return;
      const start = new Date(now); start.setHours(hh || 19, mm || 0, 0, 0);
      const diff = (start - now) / 60000;
      const txt = this.querySelector('[data-text]'); const a = this.querySelector('[data-link]');
      if (cfg.liveLink) a.href = cfg.liveLink;
      if (diff > 0) txt.innerHTML = '<b>Heute live</b> um ' + String(hh).padStart(2, '0') + ':' + String(mm || 0).padStart(2, '0') + ' Uhr';
      else if (diff > -150) { txt.innerHTML = '<b>Jetzt live!</b> Schnapp dir die Live-Deals'; this.classList.add('is-live'); }
      else return;
      this.hidden = false;
    }
  });

  /* ---------- „Zum Home-Bildschirm“-Hinweis auf dem iPhone (60) ---------- */
  function a2hs() {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
    if (!ios || window.navigator.standalone) return;
    const v = ls.get('sn-visits', 0) + 1; ls.set('sn-visits', v);
    if (v < 3 || ls.get('sn-a2hs', 0)) return;
    setTimeout(() => {
      const t = SN.toast('<span><b>Tipp:</b> Schnappy auf den Home-Bildschirm – tippe auf <b>Teilen ⬆︎</b> und dann <b>„Zum Home-Bildschirm“</b>.</span>', '<div class="sn-toast__acts"><button type="button" data-ok>Okay</button></div>', 12000);
      ls.set('sn-a2hs', 1);
      t.querySelector('[data-ok]').addEventListener('click', () => t.classList.remove('is-on'));
    }, 8000);
  }

  /* ---------- Schneller laden: Links beim Antippen/Überfahren vorladen (77) ---------- */
  const pre = new Set();
  const prefetch = (e) => {
    const a = e.target.closest && e.target.closest('a[href]'); if (!a || pre.size > 20) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || /\/(cart|checkout|account)/.test(u.pathname) || u.hash || pre.has(u.href) || u.href === location.href) return;
    pre.add(u.href); const l = document.createElement('link'); l.rel = 'prefetch'; l.href = u.href; document.head.appendChild(l);
  };
  document.addEventListener('mouseover', prefetch, { passive: true }); document.addEventListener('touchstart', prefetch, { passive: true });

  /* ---------- Abschnitte dezent einblenden (95) ---------- */
  function reveal() {
    if (reduce() || !('IntersectionObserver' in window)) return;
    const secs = [...document.querySelectorAll('main .shopify-section')].filter((s) => s.getBoundingClientRect().top > window.innerHeight);
    const io = new IntersectionObserver((en) => en.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('sn-in'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
    secs.forEach((s) => { s.classList.add('sn-reveal'); io.observe(s); });
    setTimeout(() => secs.forEach((s) => s.classList.add('sn-in')), 6000);
  }

  /* ---------- Start ---------- */
  function boot() {
    patchDrawer(); syncHearts(); enhanceDrawer(); watchBubble(); stickyBuy(); galleryDots(); collapseDesc(); homeBits(); a2hs(); reveal(); SN.markImages(); newForYou();
    document.querySelectorAll('.sn-sform input[name=q]').forEach((i) => i.setAttribute('enterkeyhint', 'search'));
    let qd = 0; const d = SN.drawer(); if (d) new MutationObserver(() => { if (qd) return; qd = requestAnimationFrame(() => { qd = 0; enhanceDrawer(); }); }).observe(d, { childList: true, subtree: true });
    let qb = 0; new MutationObserver((m) => { let added = false; m.forEach((r) => r.addedNodes.forEach((n) => { if (n.nodeType === 1 && n.querySelector) { added = true; SN.markImages(n); newForYou(n); } })); if (added && !qb) qb = requestAnimationFrame(() => { qb = 0; syncHearts(); }); }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.addEventListener('load', patchDrawer);
})();
