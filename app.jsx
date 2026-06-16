/* Blackstone Agency — app.jsx — alle React-Komponenten */
const { useState, useEffect, useRef, useCallback } = React;
const T = window.T;
const PORTFOLIO = window.PORTFOLIO;
const SERVICES_DETAIL = window.SERVICES_DETAIL;

function initScrollProgress() {
  const bar = document.getElementById('scroll-bar');
  if (!bar) return;
  const update = () => {
    const el = document.documentElement;
    const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
    bar.style.width = pct + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
}

function initCursorGlow(dark) {
  const el = document.getElementById('cursor-glow');
  if (!el) return;
  el.style.background = dark
    ? 'radial-gradient(circle,rgba(255,255,255,0.04) 0%,transparent 70%)'
    : 'radial-gradient(circle,rgba(0,0,0,0.03) 0%,transparent 70%)';
  const move = (e) => { el.style.left = e.clientX + 'px'; el.style.top = e.clientY + 'px'; };
  window.addEventListener('mousemove', move, { passive: true });
  return () => window.removeEventListener('mousemove', move);
}

function initBackToTop(dark) {
  const el = document.getElementById('back-top');
  if (!el) return;
  el.innerHTML = `<button onclick="window.scrollTo({top:0,behavior:'smooth'})"
    style="width:44px;height:44px;border-radius:50%;border:1px solid ${dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'};
    background:${dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)'};
    color:${dark ? '#fff' : '#09090b'};cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:all .3s;backdrop-filter:blur(12px)"
    onmouseover="this.style.background='${dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,1)'}'"
    onmouseout="this.style.background='${dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)'}'">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>
  </button>`;
  const check = () => { if (window.scrollY > 400) el.classList.add('visible'); else el.classList.remove('visible'); };
  window.addEventListener('scroll', check, { passive: true });
}

function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
  );
  setTimeout(() => { document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(el => observer.observe(el)); }, 120);
  return () => observer.disconnect();
}

function useCountUp(end, duration = 1800) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let startTime = null;
        const endNum = parseFloat(end.replace(/[^0-9.]/g, ''));
        const isFloat = end.includes('.');
        const step = (ts) => {
          if (!startTime) startTime = ts;
          const progress = Math.min((ts - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = eased * endNum;
          setVal(isFloat ? current.toFixed(1) : Math.floor(current));
          if (progress < 1) requestAnimationFrame(step);
          else setVal(isFloat ? endNum.toFixed(1) : endNum);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);
  return [val, ref];
}

const Logo = ({ size = 38 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="tF" x1="60" y1="25" x2="60" y2="59" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#3F3F46"/><stop offset="100%" stopColor="#18181B"/></linearGradient>
      <linearGradient id="lF" x1="30" y1="42" x2="60" y2="93" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#27272A"/><stop offset="100%" stopColor="#09090B"/></linearGradient>
      <linearGradient id="rF" x1="90" y1="42" x2="60" y2="93" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#71717A"/><stop offset="100%" stopColor="#18181B"/></linearGradient>
      <linearGradient id="gB" x1="60" y1="10" x2="60" y2="110" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15"/><stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.02"/></linearGradient>
    </defs>
    <rect x="10" y="10" width="100" height="100" rx="24" fill="#09090B" stroke="url(#gB)" strokeWidth="1.5"/>
    <path d="M60 25L90 42L60 59L30 42L60 25Z" fill="url(#tF)" stroke="#52525B" strokeWidth="0.5" strokeLinejoin="round"/>
    <path d="M30 42L60 59V93L30 76V42Z" fill="url(#lF)" stroke="#27272A" strokeWidth="0.5" strokeLinejoin="round"/>
    <path d="M60 59L90 42V76L60 93V59Z" fill="url(#rF)" stroke="#3F3F46" strokeWidth="0.5" strokeLinejoin="round"/>
    <path d="M60 25V59L60 93" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" opacity="0.65"/>
  </svg>
);

const ParticleCanvas = ({ dark }) => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -1000, y: -1000 });
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', e => { mouse.current = { x: e.clientX, y: e.clientY }; }, { passive: true });
    const pts = Array.from({ length: 55 }, () => ({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.4 + 0.4, op: Math.random() * 0.45 + 0.08 }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: mx, y: my } = mouse.current;
      pts.forEach(p => {
        const dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx*dx+dy*dy);
        if (d < 110) { p.vx += (dx/d)*0.25; p.vy += (dy/d)*0.25; }
        const spd = Math.sqrt(p.vx*p.vx+p.vy*p.vy);
        if (spd > 1.8) { p.vx=(p.vx/spd)*1.8; p.vy=(p.vy/spd)*1.8; }
        p.vx*=0.992; p.vy*=0.992; p.x+=p.vx; p.y+=p.vy;
        if (p.x<0) p.x=canvas.width; if (p.x>canvas.width) p.x=0;
        if (p.y<0) p.y=canvas.height; if (p.y>canvas.height) p.y=0;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=dark?`rgba(255,255,255,${p.op})`:`rgba(0,0,0,${p.op*0.25})`; ctx.fill();
      });
      for (let i=0;i<pts.length;i++) for (let j=i+1;j<pts.length;j++) {
        const dx=pts[j].x-pts[i].x,dy=pts[j].y-pts[i].y,d=Math.sqrt(dx*dx+dy*dy);
        if (d<125) { ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.strokeStyle=dark?`rgba(255,255,255,${0.055*(1-d/125)})`:`rgba(0,0,0,${0.03*(1-d/125)})`; ctx.lineWidth=0.6; ctx.stroke(); }
      }
      animId=requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, [dark]);
  return <canvas ref={canvasRef} style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:1 }} />;
};

const ServiceModal = ({ svc, dark, onClose, onContact, t }) => {
  const bd = dark;
  const icons = {
    'monitor':<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>,
    'trending-up':<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    'share-2':<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
    'film':<><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></>,
    'file-text':<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
    'layers':<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
  };
  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={`modal-box rounded-2xl w-full max-w-xl ${bd?'glass-dark':'glass-light'}`} style={{border:bd?'1px solid rgba(255,255,255,0.12)':'1px solid rgba(0,0,0,0.1)'}}>
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${bd?'bg-zinc-800':'bg-zinc-100'}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={bd?'#a1a1aa':'#52525b'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{icons[svc.icon]}</svg>
            </div>
            <button onClick={onClose} aria-label="Schließen" className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${bd?'hover:bg-zinc-800 text-zinc-500 hover:text-white':'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <h3 className={`text-2xl font-bold mb-3 ${bd?'text-white':'text-zinc-900'}`}>{svc.title_de}</h3>
          <p className={`text-sm leading-relaxed mb-6 ${bd?'text-zinc-400':'text-zinc-500'}`}>{svc.desc_de}</p>
          <div className={`text-xs font-semibold tracking-widest uppercase mb-3 ${bd?'text-zinc-600':'text-zinc-400'}`}>Leistungsumfang</div>
          <ul className="space-y-2.5 mb-6">
            {svc.includes_de.map((item,i)=>(
              <li key={i} className="flex items-start gap-3">
                <svg className="check-icon flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span className={`text-sm ${bd?'text-zinc-300':'text-zinc-600'}`}>{item}</span>
              </li>
            ))}
          </ul>
          <div className={`flex gap-4 p-4 rounded-xl mb-6 ${bd?'bg-zinc-900/80':'bg-zinc-50'}`}>
            <div className="flex-1"><div className={`text-xs font-semibold mb-1 ${bd?'text-zinc-600':'text-zinc-400'}`}>ZEITRAHMEN</div><div className={`text-sm font-medium ${bd?'text-white':'text-zinc-900'}`}>{svc.timeline_de}</div></div>
            <div className={`w-px ${bd?'bg-zinc-800':'bg-zinc-200'}`}/>
            <div className="flex-1"><div className={`text-xs font-semibold mb-1 ${bd?'text-zinc-600':'text-zinc-400'}`}>INVESTITION</div><div className={`text-sm font-medium ${bd?'text-white':'text-zinc-900'}`}>{svc.price_de}</div></div>
          </div>
          <button onClick={()=>{onClose();onContact();}} className="btn-p w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2">
            {t.x.svcCta}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const CookieBanner = ({ dark: bd, t, onAccept, onDecline }) => (
  <div className="cookie-bar">
    <div className={`rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 ${bd?'glass-dark':'glass-light'}`} style={{boxShadow:'0 20px 60px rgba(0,0,0,0.4)'}}>
      <div className="flex items-start gap-3 flex-1"><span style={{fontSize:20}}>🍪</span><p className={`text-sm ${bd?'text-zinc-400':'text-zinc-500'}`}>{t.cookie.text}</p></div>
      <div className="flex gap-2 flex-shrink-0">
        <button onClick={onDecline} className={`text-xs font-semibold px-4 py-2 rounded-full transition-all ${bd?'text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-600':'text-zinc-500 hover:text-zinc-700 border border-zinc-200 hover:border-zinc-300'}`}>{t.cookie.decline}</button>
        <button onClick={onAccept} className="btn-p text-xs font-bold px-4 py-2 rounded-full">{t.cookie.accept}</button>
      </div>
    </div>
  </div>
);

const Navigation = ({ t, lang, setLang, dark: bd, setDark, page, navigate, scrolled, openCmd }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const navClass = scrolled ? (bd?'nav-scrolled-dark':'nav-scrolled-light') : 'bg-transparent';
  const navLink=(p)=>`text-sm font-medium h-line transition-colors ${page===p?(bd?'text-white':'text-zinc-900'):(bd?'text-zinc-400 hover:text-white':'text-zinc-500 hover:text-zinc-900')}`;
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navClass}`}>
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <button onClick={()=>navigate('home')} className="flex items-center gap-2.5">
            <Logo size={34}/>
            <span className={`text-base font-bold tracking-tight ${bd?'text-white':'text-zinc-900'}`}>Blackstone<span className={bd?'text-zinc-500':'text-zinc-400'}> Agency</span></span>
          </button>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={()=>navigate('leistungen')} className={navLink('leistungen')}>{t.nav.leistungen}</button>
            <button onClick={()=>navigate('branchen')} className={navLink('branchen')}>{t.nav.branchen}</button>
            <button onClick={()=>navigate('portfolio')} className={navLink('portfolio')}>{t.nav.cases}</button>
            <button onClick={()=>navigate('tutorials')} className={navLink('tutorials')}>{t.nav.tut}</button>
            <div className="relative" onMouseEnter={()=>setMoreOpen(true)} onMouseLeave={()=>setMoreOpen(false)}>
              <button onClick={()=>setMoreOpen(v=>!v)} aria-expanded={moreOpen} aria-haspopup="true" className={`flex items-center gap-1 ${navLink('')}`}>
                {t.nav.more}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{transform:moreOpen?'rotate(180deg)':'none',transition:'transform .2s'}}><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {moreOpen&&(
                <div role="menu" className="absolute right-0 top-full pt-3 w-56 anim-fade">
                  <div className={`rounded-2xl p-2 ${bd?'glass-dark':'glass-light'}`} style={{border:bd?'1px solid rgba(255,255,255,0.1)':'1px solid rgba(0,0,0,0.08)',boxShadow:'0 24px 60px -20px rgba(0,0,0,.55)'}}>
                    {[['services','#services'],['process','#process'],['pricing','#pricing'],['about','about'],['blog','blog'],['karriere','karriere']].map(([k,target])=>(
                      <button key={k} role="menuitem" onClick={()=>{navigate(target);setMoreOpen(false);}} className={`block w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${bd?'text-zinc-300 hover:text-white hover:bg-white/5':'text-zinc-600 hover:text-zinc-900 hover:bg-black/5'}`}>{t.nav[k]}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className={`hidden sm:flex items-center gap-0.5 rounded-full p-1 border ${bd?'border-zinc-800 bg-zinc-900/40':'border-zinc-200 bg-zinc-100/60'}`}>
              {['DE','EN','ES'].map(l=>(
                <button key={l} onClick={()=>setLang(l)} className={`text-xs font-bold px-2.5 py-1 rounded-full transition-all duration-200 ${lang===l?(bd?'bg-white text-zinc-900':'bg-zinc-900 text-white'):(bd?'text-zinc-500 hover:text-white':'text-zinc-400 hover:text-zinc-900')}`}>{l}</button>
              ))}
            </div>
            <button onClick={openCmd} aria-label="Suche öffnen (Cmd+K)" className={`hidden lg:flex items-center gap-1.5 h-9 px-3 rounded-full border text-xs font-semibold transition-all ${bd?'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-600':'border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <span className="opacity-70">⌘K</span>
            </button>
            <button onClick={()=>setDark(!bd)} aria-label={bd?'Helles Design aktivieren':'Dunkles Design aktivieren'} className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${bd?'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-600':'border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 hover:border-zinc-300'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{bd?<><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>:<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>}</svg>
            </button>
            <button onClick={()=>navigate('#contact')} className="hidden sm:block btn-p text-sm px-5 py-2 rounded-full">{t.nav.contact}</button>
            <button onClick={()=>setMenuOpen(!menuOpen)} aria-label={menuOpen?'Menü schließen':'Menü öffnen'} aria-expanded={menuOpen} className="md:hidden p-1">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={bd?'white':'#09090b'} strokeWidth="2">{menuOpen?<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>:<><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>}</svg>
            </button>
          </div>
        </div>
        {menuOpen&&(
          <div className={`md:hidden pb-4 border-t ${bd?'border-zinc-800':'border-zinc-200'} mt-1 anim-slide-down`}>
            {[['services','#services'],['process','#process'],['cases','#cases'],['pricing','#pricing'],['leistungen','leistungen'],['branchen','branchen'],['tut','tutorials'],['about','about'],['blog','blog'],['karriere','karriere'],['contact','#contact']].map(([k,target])=>(
              <button key={k} onClick={()=>{navigate(target);setMenuOpen(false);}} className={`block w-full text-left py-3 px-1 text-sm font-medium ${bd?'text-zinc-300 hover:text-white':'text-zinc-600 hover:text-zinc-900'}`}>{t.nav[k]}</button>
            ))}
            <div className="flex gap-1 mt-3 px-1">
              {['DE','EN','ES'].map(l=>(
                <button key={l} onClick={()=>setLang(l)} className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${lang===l?(bd?'bg-white text-zinc-900':'bg-zinc-900 text-white'):(bd?'text-zinc-500':'text-zinc-400')}`}>{l}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

/* ── ProcessLogoSVG — logo cube with animated face highlights ── */
const ProcessLogoSVG = ({ step = 0, size = 180 }) => {
  const t0=step===0,t1=step===1,t2=step===2,t3=step===3;
  const gl=(on)=>on?'drop-shadow(0 0 14px rgba(255,255,255,.55))':'none';
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className="plogo"
      style={{filter:t3?'drop-shadow(0 0 32px rgba(255,255,255,.18))':'none'}}>
      <defs>
        <linearGradient id="pgB" x1="60" y1="10" x2="60" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" stopOpacity=".18"/><stop offset="100%" stopColor="#fff" stopOpacity=".03"/>
        </linearGradient>
        <radialGradient id="gCtr" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,.12)"/><stop offset="100%" stopColor="transparent"/>
        </radialGradient>
      </defs>
      <rect x="10" y="10" width="100" height="100" rx="24"
        fill={t3?'#131316':'#09090B'} stroke="url(#pgB)" strokeWidth="1.5"/>
      {/* Top face — Discovery */}
      <path d="M60 25L90 42L60 59L30 42L60 25Z"
        fill={t0?'rgba(255,255,255,.55)':'#1c1c22'}
        stroke={t0?'rgba(255,255,255,.95)':'#52525B'} strokeWidth={t0?.8:.5}
        strokeLinejoin="round" style={{filter:gl(t0)}}/>
      {/* Left face — Design */}
      <path d="M30 42L60 59V93L30 76V42Z"
        fill={t1?'rgba(255,255,255,.38)':'#111114'}
        stroke={t1?'rgba(255,255,255,.75)':'#27272A'} strokeWidth={t1?.8:.5}
        strokeLinejoin="round" style={{filter:gl(t1)}}/>
      {/* Right face — Build */}
      <path d="M60 59L90 42V76L60 93V59Z"
        fill={t2?'rgba(255,255,255,.48)':'#222225'}
        stroke={t2?'rgba(255,255,255,.85)':'#3F3F46'} strokeWidth={t2?.8:.5}
        strokeLinejoin="round" style={{filter:gl(t2)}}/>
      {/* Center spine */}
      <path d="M60 25V93" stroke="#fff" strokeWidth={t3?2.5:1.2} strokeLinecap="round"
        opacity={t3?1:.65}/>
      {/* Launch pulse ring */}
      {t3&&<circle cx="60" cy="60" r="20" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth=".8">
        <animate attributeName="r" values="16;34;16" dur="2.4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values=".2;0;.2" dur="2.4s" repeatCount="indefinite"/>
      </circle>}
      {/* Active scan line across cube */}
      <line x1="30" y1={25+step*17} x2="90" y2={25+step*17}
        stroke="rgba(255,255,255,.2)" strokeWidth=".6" strokeDasharray="3 3"/>
    </svg>
  );
};

/* ══════════════════════════════════════════════════
   CPU CHIP — scroll-driven zoom · Blackstone Agency
   ══════════════════════════════════════════════════ */
const ChipSVG = ({ dark: bd, progress }) => {
  const W=380, H=380, CX=70, CY=70, CS=240;
  const PINS=8, PIN_LEN=28;
  const pinPos = Array.from({length:PINS},(_,i)=>CX+(i+1)*(CS/(PINS+1)));
  const scanY  = CY + ((progress*3)%1)*CS;
  const coreS=58, coreGap=20;
  const coreOff=(CS-2*coreS-coreGap)/2;
  const cores=[
    {x:CX+coreOff,       y:CY+coreOff},
    {x:CX+coreOff+coreS+coreGap, y:CY+coreOff},
    {x:CX+coreOff,       y:CY+coreOff+coreS+coreGap},
    {x:CX+coreOff+coreS+coreGap, y:CY+coreOff+coreS+coreGap},
  ];
  const juncX=CX+coreOff+coreS+coreGap/2;
  const juncY=CY+coreOff+coreS+coreGap/2;
  const pc=bd?'#3a3a45':'#b0b0bc';
  const ic=bd?'#caa44e':'#c79a3e';
  const gc_on=bd?'#22c55e':'#16a34a';
  const pp=(progress*2)%1;
  const lerp=(a,b,t)=>a+(b-a)*t;
  const ringGlow=0.10+Math.abs(Math.sin(progress*6))*0.24;
  const holoX=CX+pp*CS-CS*0.5;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
      style={{filter:bd
        ?'drop-shadow(0 0 80px rgba(255,255,255,.05)) drop-shadow(0 30px 100px rgba(0,0,0,.85))'
        :'drop-shadow(0 30px 80px rgba(0,0,0,.18))'}}>
      <defs>
        <radialGradient id="cpuBody" cx="38%" cy="26%" r="74%">
          <stop offset="0%"   stopColor={bd?'#2e2e3a':'#eaeaf2'}/>
          <stop offset="100%" stopColor={bd?'#0d0d14':'#ced0d8'}/>
        </radialGradient>
        <linearGradient id="cpuEdge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor={bd?'rgba(255,255,255,.22)':'rgba(0,0,0,.16)'}/>
          <stop offset="50%"  stopColor={bd?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)'}/>
          <stop offset="100%" stopColor={bd?'rgba(255,255,255,.18)':'rgba(0,0,0,.13)'}/>
        </linearGradient>
        <clipPath id="chipClip">
          <rect x={CX} y={CY} width={CS} height={CS} rx="18"/>
        </clipPath>
        <linearGradient id="dieGlare" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,.18)"/>
          <stop offset="34%" stopColor="rgba(255,255,255,0)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </linearGradient>
        <linearGradient id="iridescent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={bd?'rgba(139,124,255,.12)':'rgba(90,70,210,.07)'}/>
          <stop offset="50%" stopColor={bd?'rgba(16,185,129,.06)':'rgba(5,150,105,.04)'}/>
          <stop offset="100%" stopColor={bd?'rgba(59,130,246,.11)':'rgba(40,90,200,.06)'}/>
        </linearGradient>
        <linearGradient id="holoSweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0)"/>
          <stop offset="50%" stopColor={bd?'rgba(190,180,255,.16)':'rgba(255,255,255,.5)'}/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </linearGradient>
      </defs>

      {/* ── PINS ── */}
      {pinPos.map((pos,i)=>{
        const aT=Math.sin(progress*13+i*.95)>.28;
        const aB=Math.sin(progress*13+i*.95+2.1)>.28;
        const aL=Math.sin(progress*13+i*.95+4.2)>.28;
        const aR=Math.sin(progress*13+i*.95+6.3)>.28;
        return (
          <g key={i}>
            <rect x={pos-1.5} y={CY-PIN_LEN} width={3} height={PIN_LEN} rx={1.5} fill={pc}/>
            <circle cx={pos} cy={CY-PIN_LEN+1} r={4.5} fill={aT?gc_on:ic} style={{transition:'fill .22s'}}/>
            <rect x={pos-1.5} y={CY+CS} width={3} height={PIN_LEN} rx={1.5} fill={pc}/>
            <circle cx={pos} cy={CY+CS+PIN_LEN-1} r={4.5} fill={aB?gc_on:ic} style={{transition:'fill .22s'}}/>
            <rect x={CX-PIN_LEN} y={pos-1.5} width={PIN_LEN} height={3} rx={1.5} fill={pc}/>
            <circle cx={CX-PIN_LEN+1} cy={pos} r={4.5} fill={aL?gc_on:ic} style={{transition:'fill .22s'}}/>
            <rect x={CX+CS} y={pos-1.5} width={PIN_LEN} height={3} rx={1.5} fill={pc}/>
            <circle cx={CX+CS+PIN_LEN-1} cy={pos} r={4.5} fill={aR?gc_on:ic} style={{transition:'fill .22s'}}/>
          </g>
        );
      })}

      {/* ── CHIP BODY ── */}
      <rect x={CX} y={CY} width={CS} height={CS} rx="18"
        fill="url(#cpuBody)" stroke="url(#cpuEdge)" strokeWidth="1.5"/>
      <rect x={CX+7} y={CY+7} width={CS-14} height={CS-14} rx="13"
        fill="none" stroke={bd?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)'} strokeWidth={.5}/>
      {/* Silicon die iridescence + top glare */}
      <rect x={CX} y={CY} width={CS} height={CS} rx="18" fill="url(#iridescent)" pointerEvents="none"/>
      <rect x={CX} y={CY} width={CS} height={CS} rx="18" fill="url(#dieGlare)" pointerEvents="none"/>

      {/* ── KEY NOTCH ── */}
      <rect x={CX+CS/2-14} y={CY-2} width={28} height={6} rx={3}
        fill={bd?'#1a1a22':'#d6d6e0'}
        stroke={bd?'rgba(255,255,255,.1)':'rgba(0,0,0,.08)'} strokeWidth={.5}/>

      {/* ── CORNER REGISTRATION MARKS ── */}
      {[[CX+19,CY+19],[CX+CS-19,CY+19],[CX+19,CY+CS-19],[CX+CS-19,CY+CS-19]].map(([cx,cy],i)=>(
        <g key={`r${i}`}>
          <circle cx={cx} cy={cy} r={6}
            fill={bd?'#1c1c26':'#d4d4de'}
            stroke={bd?'rgba(255,255,255,.18)':'rgba(0,0,0,.14)'} strokeWidth={1}/>
          <circle cx={cx} cy={cy} r={2.5} fill={bd?'#52525b':'#a1a1aa'}/>
        </g>
      ))}

      {/* ── CPU CORES 2×2 ── */}
      {cores.map((c,i)=>{
        const hot=Math.sin(progress*5.5+i*1.8)>.05;
        return (
          <g key={`core${i}`}>
            <rect x={c.x} y={c.y} width={coreS} height={coreS} rx={8}
              fill={hot?(bd?'rgba(255,255,255,.07)':'rgba(0,0,0,.05)'):(bd?'rgba(255,255,255,.03)':'rgba(0,0,0,.03)')}
              stroke={hot?(bd?'rgba(255,255,255,.18)':'rgba(0,0,0,.12)'):(bd?'rgba(255,255,255,.07)':'rgba(0,0,0,.05)')}
              strokeWidth={.8}/>
            {/* 3×3 sub-cell grid */}
            {Array.from({length:9},(_,j)=>{
              const jr=Math.floor(j/3),jc=j%3;
              const on=Math.sin(progress*17+i*3.2+j*1.15)>.14;
              return (
                <rect key={j}
                  x={c.x+6+jc*17} y={c.y+6+jr*17} width={13} height={13} rx={3}
                  fill={on?(bd?'rgba(255,255,255,.46)':'rgba(0,0,0,.36)'):(bd?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)')}
                  style={{transition:'fill .11s'}}/>
              );
            })}
            <text x={c.x+coreS/2} y={c.y+coreS-5} textAnchor="middle"
              fill={bd?'rgba(255,255,255,.19)':'rgba(0,0,0,.19)'}
              fontSize={7} fontWeight={700} fontFamily="monospace">C{i}</text>
          </g>
        );
      })}

      {/* ── BUS TRACES ── */}
      <line x1={CX+coreOff+coreS} y1={juncY} x2={juncX-4} y2={juncY}
        stroke={bd?'rgba(255,255,255,.09)':'rgba(0,0,0,.07)'} strokeWidth={1.5} strokeDasharray="3 2"/>
      <line x1={juncX+4} y1={juncY} x2={CX+coreOff+coreS+coreGap} y2={juncY}
        stroke={bd?'rgba(255,255,255,.09)':'rgba(0,0,0,.07)'} strokeWidth={1.5} strokeDasharray="3 2"/>
      <line x1={juncX} y1={CY+coreOff+coreS} x2={juncX} y2={juncY-4}
        stroke={bd?'rgba(255,255,255,.09)':'rgba(0,0,0,.07)'} strokeWidth={1.5} strokeDasharray="3 2"/>
      <line x1={juncX} y1={juncY+4} x2={juncX} y2={CY+coreOff+coreS+coreGap}
        stroke={bd?'rgba(255,255,255,.09)':'rgba(0,0,0,.07)'} strokeWidth={1.5} strokeDasharray="3 2"/>

      {/* ── CENTER JUNCTION ── */}
      <circle cx={juncX} cy={juncY} r={7}
        fill={bd?'#1e1e28':'#d2d2dc'}
        stroke={bd?'rgba(255,255,255,.15)':'rgba(0,0,0,.12)'} strokeWidth={1}/>
      <circle cx={juncX} cy={juncY} r={3}
        fill={Math.sin(progress*8)>0?(bd?'#22c55e':'#16a34a'):(bd?'#3f3f46':'#a1a1aa')}
        style={{transition:'fill .28s'}}/>

      {/* ── BRAND LABEL ── */}
      <rect x={CX+CS/2-36} y={CY+CS-36} width={72} height={19} rx={5}
        fill={bd?'rgba(255,255,255,.03)':'rgba(0,0,0,.04)'}
        stroke={bd?'rgba(255,255,255,.07)':'rgba(0,0,0,.08)'} strokeWidth={.5}/>
      <text x={CX+CS/2} y={CY+CS-22} textAnchor="middle"
        fill={bd?'rgba(255,255,255,.3)':'rgba(0,0,0,.26)'}
        fontSize={8} fontWeight={800} fontFamily="Inter,monospace" letterSpacing="0.14em">BLACKSTONE</text>

      {/* ── SCAN LINE (clipped) ── */}
      <g clipPath="url(#chipClip)">
        <rect x={CX} y={scanY} width={CS} height={2} rx={.5}
          fill={bd?'rgba(255,255,255,.06)':'rgba(0,0,0,.05)'}/>
        <rect x={CX} y={scanY} width={CS} height={2} rx={.5}
          fill={bd?'rgba(255,255,255,.09)':'rgba(0,0,0,.07)'}
          style={{filter:'blur(2px)'}}/>
      </g>

      {/* ── DECORATIVE TRACES ── */}
      <path d={`M ${CX+34} ${CY} L ${CX+34} ${CY-16} L ${CX+60} ${CY-16}`}
        fill="none" stroke={bd?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)'} strokeWidth={.8}/>
      <path d={`M ${CX+CS-34} ${CY} L ${CX+CS-34} ${CY-16} L ${CX+CS-60} ${CY-16}`}
        fill="none" stroke={bd?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)'} strokeWidth={.8}/>
      <path d={`M ${CX} ${CY+34} L ${CX-16} ${CY+34} L ${CX-16} ${CY+60}`}
        fill="none" stroke={bd?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)'} strokeWidth={.8}/>
      <path d={`M ${CX} ${CY+CS-34} L ${CX-16} ${CY+CS-34} L ${CX-16} ${CY+CS-60}`}
        fill="none" stroke={bd?'rgba(255,255,255,.05)':'rgba(0,0,0,.04)'} strokeWidth={.8}/>

      {/* ── Pulsing outer glow ring ── */}
      <rect x={CX-7} y={CY-7} width={CS+14} height={CS+14} rx="23" fill="none"
        stroke={bd?`rgba(139,124,255,${ringGlow})`:`rgba(90,70,210,${ringGlow})`} strokeWidth={1.5}/>

      {/* ── Holographic sweep ── */}
      <g clipPath="url(#chipClip)">
        <rect x={holoX} y={CY} width={CS*0.5} height={CS} fill="url(#holoSweep)" pointerEvents="none"/>
      </g>

      {/* ── Traveling data pulses along the bus ── */}
      {[
        {x:lerp(CX+coreOff+coreS,juncX,pp), y:juncY},
        {x:lerp(CX+coreOff+coreS+coreGap,juncX,pp), y:juncY},
        {x:juncX, y:lerp(CY+coreOff+coreS,juncY,pp)},
        {x:juncX, y:lerp(CY+coreOff+coreS+coreGap,juncY,pp)},
      ].map((p,i)=>(
        <g key={`pulse${i}`}>
          <circle cx={p.x} cy={p.y} r={3.4} fill={bd?'#5eead4':'#16a34a'} style={{filter:`drop-shadow(0 0 5px ${bd?'#22c55e':'#16a34a'})`}}/>
          <circle cx={p.x} cy={p.y} r={1.4} fill="#fff" opacity={.92}/>
        </g>
      ))}

      {/* ── Junction supercharge ── */}
      <circle cx={juncX} cy={juncY} r={5+Math.abs(Math.sin(progress*8))*4} fill="none"
        stroke={bd?'rgba(94,234,212,.55)':'rgba(22,163,74,.5)'} strokeWidth={1}/>
    </svg>
  );
};

const ChipSection = ({ dark: bd }) => {
  const containerRef=useRef(null);
  const [prog,setProg]=useState(0);
  useEffect(()=>{
    const f=()=>{
      if(!containerRef.current)return;
      const rect=containerRef.current.getBoundingClientRect();
      const total=containerRef.current.offsetHeight-window.innerHeight;
      const scrolled=-rect.top;
      if(scrolled<=0){setProg(0);return;}
      if(scrolled>=total){setProg(1);return;}
      setProg(scrolled/total);
    };
    window.addEventListener('scroll',f,{passive:true});
    f();
    return()=>window.removeEventListener('scroll',f);
  },[]);

  const isMobile=typeof window!=='undefined'&&window.innerWidth<640;
  const maxScale=isMobile?1.28:1.65;
  const scale=prog<0.5
    ?0.07+Math.pow(prog/0.5,.55)*(maxScale+0.07)
    :maxScale+0.07-Math.pow((prog-0.5)/0.5,.65)*0.58;
  const rot=Math.sin(prog*Math.PI)*5.5;
  const glow=Math.sin(prog*Math.PI);
  const textVis=Math.max(0,Math.min(1,(prog-.68)/.22));

  return (
    <div ref={containerRef} style={{height:'280vh',position:'relative'}}>
      <div
        className={`chip-sticky border-t ${bd?'border-zinc-900':'border-zinc-100'}`}
        style={{background:bd?'#030303':'#f8f8f8'}}>

        {/* Ambient radial glow */}
        <div style={{
          position:'absolute',inset:0,pointerEvents:'none',
          background:`radial-gradient(ellipse 48% 48% at 50% 50%,${
            bd?`rgba(45,25,150,${glow*.11})`:`rgba(45,25,150,${glow*.04})`
          },transparent)`,
        }}/>

        {/* Chip */}
        <div className="chip-transform" style={{
          transform:`scale(${scale}) rotate(${rot}deg)`,
          opacity:Math.min(1,prog*12),
        }}>
          <ChipSVG dark={bd} progress={prog}/>
        </div>

        {/* Text reveal */}
        <div style={{
          position:'absolute',bottom:'11%',left:0,right:0,
          textAlign:'center',pointerEvents:'none',
          opacity:textVis,
          transform:`translateY(${(1-textVis)*22}px)`,
          transition:'opacity .18s,transform .18s',
        }}>
          <p style={{fontSize:11,letterSpacing:'0.2em',textTransform:'uppercase',
            color:bd?'rgba(255,255,255,.28)':'rgba(0,0,0,.28)',fontWeight:700,marginBottom:10,fontFamily:'Inter,sans-serif'}}>
            Technology built for scale
          </p>
          <p style={{fontSize:'clamp(15px,2.5vw,26px)',fontWeight:900,letterSpacing:'-.03em',
            color:bd?'#fff':'#09090b',margin:0,fontFamily:'Inter,sans-serif'}}>
            Precision at every layer.
          </p>
        </div>

        {/* Scroll hint */}
        <div style={{
          position:'absolute',bottom:22,left:0,right:0,textAlign:'center',
          opacity:Math.max(0,1-prog*7),pointerEvents:'none',
        }}>
          <div className="bounce" style={{display:'inline-flex',flexDirection:'column',alignItems:'center',gap:6}}>
            <span style={{fontSize:9,letterSpacing:'0.2em',textTransform:'uppercase',
              color:bd?'rgba(255,255,255,.22)':'rgba(0,0,0,.2)',fontWeight:600}}>Scroll to zoom</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke={bd?'rgba(255,255,255,.2)':'rgba(0,0,0,.18)'} strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ScanLine removed */

/* ── Spine — vertical section navigator ── */
const Spine = ({ active, dark: bd }) => {
  const labels=['Hero','Services','Prozess','Portfolio','Preise','Kontakt'];
  return (
    <div className={`spine ${active>0?'show':''}`}>
      {labels.map((l,i)=>(
        <React.Fragment key={i}>
          <div className={`sp-dot ${active===i?'act':''}`} title={l}/>
          {i<labels.length-1&&<div className="sp-line"/>}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ── Word Rotate (21st.dev inspired) ── */
const WordRotate = ({ words }) => {
  const [idx,setIdx]=useState(0);
  const [vis,setVis]=useState(true);
  useEffect(()=>{
    const t=setInterval(()=>{
      setVis(false);
      setTimeout(()=>{setIdx(i=>(i+1)%words.length);setVis(true);},380);
    },2600);
    return()=>clearInterval(t);
  },[words.length]);
  return (
    <span style={{
      display:'inline-block',
      opacity:vis?1:0,
      transform:vis?'translateY(0) skewY(0deg)':'translateY(16px) skewY(1.5deg)',
      transition:'opacity .38s cubic-bezier(.4,0,.2,1),transform .38s cubic-bezier(.4,0,.2,1)',
    }} className="gradient-word">{words[idx]}</span>
  );
};

/* ── HeroSection 3.0 — 2-col + 3D tilt card ── */
/* ── HeroSection 4.0 — Kinetic Manifest: variable-weight editorial hero ── */
/* Replaces the 2-col + 3D-tilt-card hero. One living typographic statement:
   per-glyph weight "gravity well" follows the cursor (writes only --w + letter-spacing),
   a one-shot light-seam sweeps once on load, static near-black mesh + vanishing point,
   rotating gradient keyword via existing WordRotate, honest useCountUp stat-strip.
   Animates transform/opacity/font-variation-settings only. Mobile + reduced-motion safe. */
const HeroSection = ({ t, dark: bd, navigate }) => {
  const th = t.hero;
  const [s1,ref1]=useCountUp('48'); const [s2,ref2]=useCountUp('97'); const [s3,ref3]=useCountUp('340'); const [s4,ref4]=useCountUp('4');
  const sectionRef=useRef(null);
  const cardRef=useRef(null);
  const rotWords=['Websites.','Brands.','Dominance.','Growth.','Markets.'];

  useEffect(()=>{
    const el=sectionRef.current; if(!el)return;
    const card=cardRef.current;
    const move=(e)=>{
      const r=el.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-0.5;
      const y=(e.clientY-r.top)/r.height-0.5;
      el.style.setProperty('--hdx',(e.clientX-r.left)+'px');
      el.style.setProperty('--hdy',(e.clientY-r.top)+'px');
      if(card) card.style.transform=`perspective(900px) rotateY(${x*14}deg) rotateX(${-y*9}deg) translateZ(12px)`;
    };
    const leave=()=>{if(card)card.style.transform='perspective(900px) rotateY(-6deg) rotateX(4deg)';};
    el.addEventListener('mousemove',move,{passive:true});
    el.addEventListener('mouseleave',leave);
    return()=>{el.removeEventListener('mousemove',move);el.removeEventListener('mouseleave',leave);};
  },[]);

  const DashCard=({mini=false})=>(
    <div className={`rounded-2xl overflow-hidden hero-card-glow ${bd?'glass-dark':'glass-light'}`}>
      <div className="browser-chrome" style={{background:bd?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)',borderBottom:`1px solid ${bd?'rgba(255,255,255,.06)':'rgba(0,0,0,.06)'}`}}>
        <div className="dot-r"/><div className="dot-y"/><div className="dot-g"/>
        <div className={`ml-3 flex-1 h-6 rounded-full px-3 flex items-center text-xs ${bd?'bg-zinc-900 text-zinc-600':'bg-zinc-100 text-zinc-400'}`} style={{fontSize:10}}>www.blackstone-agency.de</div>
      </div>
      <div className={mini?'p-4':'p-5 lg:p-6'}>
        <div className={`grid grid-cols-3 mb-3 ${mini?'gap-2':'gap-3 mb-4'}`}>
          {[{l:'Revenue',v:mini?'€284K':'€ 284,920',d:'+18%'},{l:mini?'Conv.':'Conversions',v:'12,847',d:'+34%'},{l:'ROAS',v:'8.4×',d:'+22%'}].map((m,i)=>(
            <div key={i} className={`rounded-xl ${bd?'bg-zinc-900/80':'bg-zinc-50'} ${mini?'p-3':'p-4'}`}>
              <div className={`mb-1 ${bd?'text-zinc-600':'text-zinc-400'}`} style={{fontSize:10}}>{m.l}</div>
              <div className={`font-bold ${bd?'text-white':'text-zinc-900'}`} style={{fontSize:mini?11:13}}>{m.v}</div>
              <div className="font-semibold text-emerald-400 mt-0.5" style={{fontSize:10}}>↑ {m.d}</div>
            </div>
          ))}
        </div>
        <div className={`rounded-xl ${bd?'bg-zinc-900/60':'bg-zinc-50'} ${mini?'p-3':'p-4'}`}>
          <div className={`flex items-center justify-between mb-2 ${bd?'text-zinc-600':'text-zinc-400'}`} style={{fontSize:10}}>
            <span>Performance der letzten 30 Tage</span>
            <span className="text-emerald-400 font-semibold">+24%</span>
          </div>
          <div className={`flex items-end gap-1.5 ${mini?'h-10':'h-16'}`}>
            {[30,52,38,68,82,60,95].map((h,i)=>(
              <div key={i} className="flex-1 rounded-t dash-bar" style={{height:`${h}%`,transformOrigin:'bottom',animation:`bar-grow .9s cubic-bezier(.2,.8,.2,1) ${0.15+i*0.07}s both`,background:i===6?'linear-gradient(180deg,#a78bfa,#7c3aed)':(bd?'rgba(255,255,255,.1)':'rgba(0,0,0,.07)'),boxShadow:i===6?'0 0 14px rgba(124,58,237,.6)':'none'}}/>
            ))}
          </div>
        </div>
        {!mini&&<div className={`mt-3 rounded-xl p-3 flex items-center gap-2.5 ${bd?'bg-zinc-900/40':'bg-zinc-50/80'}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" style={{boxShadow:'0 0 6px #22c55e'}}/>
          <span style={{fontSize:10}} className={bd?'text-zinc-500':'text-zinc-400'}>3 aktive Kampagnen · Update vor 2 Min.</span>
        </div>}
      </div>
    </div>
  );

  return (
    <section ref={sectionRef} className="hero-section">
      <div className="hero-dots" aria-hidden="true"/>
      <div className="hero-dots-glow" aria-hidden="true"/>
      <div aria-hidden="true" style={{position:'absolute',top:'-20%',right:'5%',width:700,height:700,borderRadius:'60% 40% 30% 70%/60% 30% 70% 40%',background:'rgba(124,58,237,0.1)',filter:'blur(110px)',animation:'blob 13s ease-in-out infinite',pointerEvents:'none'}}/>
      <div aria-hidden="true" style={{position:'absolute',bottom:'-15%',left:'-5%',width:600,height:600,borderRadius:'50%',background:'rgba(16,185,129,0.07)',filter:'blur(110px)',animation:'blob 15s ease-in-out infinite',animationDelay:'-6s',pointerEvents:'none'}}/>
      <div aria-hidden="true" style={{position:'absolute',top:'30%',right:'-8%',width:400,height:400,borderRadius:'50%',background:'rgba(59,130,246,0.06)',filter:'blur(90px)',animation:'blob 11s ease-in-out infinite',animationDelay:'-3s',pointerEvents:'none'}}/>
      <div className="hero-beam" aria-hidden="true"/>
      <div className="hero-aurora" aria-hidden="true"/>
      <div className="hero-spotlight" aria-hidden="true"/>

      <div className="max-w-7xl mx-auto w-full px-5 lg:px-8 py-8" style={{zIndex:4,position:'relative'}}>
        <div className="hero-grid">

          {/* LEFT — text */}
          <div>
            <div className="mb-9 anim-slide-up" style={{animationFillMode:'both'}}>
              <div className="gradient-badge">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" style={{boxShadow:'0 0 7px #22c55e'}}/>
                {th.badge}
              </div>
            </div>
            <h1 className="font-black tracking-tighter mb-7" style={{fontSize:'clamp(52px,8.5vw,116px)',lineHeight:.87}}>
              <span className={`block anim-slide-up ${bd?'text-white':'text-zinc-900'}`} style={{animationDelay:'.07s',animationFillMode:'both'}}>{th.h1}</span>
              <span className="block anim-slide-up" style={{animationDelay:'.15s',animationFillMode:'both'}}>
                <WordRotate words={rotWords}/>
              </span>
            </h1>
            <p className={`text-lg leading-relaxed mb-10 anim-slide-up ${bd?'text-zinc-400':'text-zinc-500'}`} style={{maxWidth:480,animationDelay:'.28s',animationFillMode:'both'}}>{th.sub}</p>
            <div className="flex flex-wrap gap-3 mb-14 anim-slide-up" style={{animationDelay:'.40s',animationFillMode:'both'}}>
              <button onClick={()=>navigate('#contact')} className="btn-p mag px-8 py-4 rounded-full font-bold text-sm flex items-center gap-2.5">
                {th.cta1}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <button onClick={()=>navigate('portfolio')} className={`${bd?'btn-s-dark':'btn-s-light'} mag px-8 py-4 rounded-full font-semibold text-sm`}>{th.cta2}</button>
            </div>
            <div className="flex flex-wrap gap-x-10 gap-y-5 pt-8 stats-row anim-slide-up" style={{animationDelay:'.52s',animationFillMode:'both'}}>
              {[{v:s1,sfx:'M+',pfx:'€',l:th.s1l,r:ref1},{v:s2,sfx:'%',pfx:'',l:th.s2l,r:ref2},{v:s3,sfx:'+',pfx:'',l:th.s3l,r:ref3},{v:s4,sfx:'',pfx:'',l:th.s4l,r:ref4}].map((s,i)=>(
                <div key={i} ref={s.r} className="stat-block">
                  <div className={`font-black tracking-tight tabular-nums leading-none ${bd?'text-white':'text-zinc-900'}`} style={{fontSize:'clamp(26px,3.5vw,42px)'}}>{s.pfx}{s.v}{s.sfx}</div>
                  <div className={`text-xs font-medium mt-1.5 ${bd?'text-zinc-600':'text-zinc-400'}`}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — 3D tilt dashboard (desktop only) */}
          <div className="hidden lg:block">
            <div ref={cardRef} className="tilt-card anim-slide-up dash-shell" style={{animationDelay:'.3s',animationFillMode:'both'}}>
              <DashCard/>
              <div className="dash-toast dash-toast-1" aria-hidden="true"><span className="dt-dot"/>+1 Lead</div>
              <div className="dash-toast dash-toast-2" aria-hidden="true">Conversion ✓</div>
              <div className="dash-toast dash-toast-3" aria-hidden="true">+€2.480</div>
            </div>
          </div>
        </div>

        {/* Mobile dashboard */}
        <div className="lg:hidden mt-10 pb-4 anim-slide-up" style={{animationDelay:'.60s',animationFillMode:'both'}}>
          <div className="anim-float"><DashCard mini/></div>
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center" style={{zIndex:4}}>
        <div className="bounce">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={bd?'rgba(255,255,255,.22)':'rgba(0,0,0,.2)'} strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        </div>
      </div>
    </section>
  );
};
const TrustSection = ({ t, dark: bd }) => {
  const industries = ['Healthcare','Gastronomie','Gebäudereinigung','Gaming & Esports','E-Commerce','Immobilien','B2B SaaS','Handwerk'];
  return (
    <section className={`py-14 border-y ${bd?'border-zinc-900':'border-zinc-100'}`} style={{zIndex:3,position:'relative'}}>
      <div className="max-w-7xl mx-auto px-5">
        <p className={`text-center text-xs font-semibold tracking-widest uppercase mb-8 ${bd?'text-zinc-700':'text-zinc-300'}`}>{t.trust.label}</p>
        <div className="ticker-wrap"><div className="ticker-inner">
          {[...industries,...industries].map((ind,i)=>(
            <span key={i} className={`inline-flex items-center gap-2 mx-8 text-sm font-semibold ${bd?'text-zinc-600':'text-zinc-300'}`}><span className="w-1 h-1 rounded-full bg-current opacity-50"/>{ind}</span>
          ))}
        </div></div>
      </div>
    </section>
  );
};

const ServicesSection = ({ t, dark: bd, onService }) => {
  const icons=[
    <><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>,
    <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
    <><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></>,
    <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
    <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
  ];
  const clr=['rgba(124,58,237','rgba(59,130,246','rgba(16,185,129','rgba(245,158,11','rgba(239,68,68','rgba(168,85,247'];
  const ico=['#a78bfa','#60a5fa','#34d399','#fbbf24','#f87171','#c084fc'];
  const prices=['ab €3.500','ab €1.500/mo','ab €1.200/mo','ab €2.500','ab €1.800/mo','ab €4.500'];
  const tags=[['React / Next.js','Core Web Vitals','CMS','SEO'],['Meta Ads','Google Ads','TikTok','ROAS'],['Instagram','TikTok','LinkedIn','Community'],['4K','Color Grading','Motion','Thumbnails'],['Keyword Research','Backlinks','Rankings','Authority'],['Logo','Brand Guide','Voice','Templates']];

  const SvcBtn=({i})=>(
    <button onClick={()=>onService(SERVICES_DETAIL[i])} className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${bd?'text-zinc-500 hover:text-white':'text-zinc-400 hover:text-zinc-900'}`}>
      {t.services.more}<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </button>
  );

  return (
    <section id="services" className={`py-28 px-5 relative border-t ${bd?'border-zinc-900':'border-zinc-100'}`} style={{zIndex:3}}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <div className={`${bd?'badge-dark':'badge-light'} mb-5 reveal`}>{t.services.badge}</div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className={`text-[clamp(30px,4.5vw,56px)] font-black tracking-tight reveal ${bd?'text-white':'text-zinc-900'}`} style={{maxWidth:540}}>{t.services.h}</h2>
            <p className={`text-base max-w-xs reveal ${bd?'text-zinc-500':'text-zinc-400'}`}>{t.services.sub}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* FEATURED — Web Design */}
          <div className={`md:col-span-4 rounded-2xl p-8 relative overflow-hidden glow-card reveal d1 ${bd?'card-dark':'card-light'}`}>
            <div className="gc-glow"/>
            <div aria-hidden="true" style={{position:'absolute',top:-60,right:-60,width:300,height:300,borderRadius:'50%',background:`${clr[0]},.12)`,filter:'blur(80px)',pointerEvents:'none'}}/>
            <div className="relative" style={{zIndex:2}}>
              <div className="featured-grid mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:`${clr[0]},.12)`,border:`1px solid ${clr[0]},.2)`}}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ico[0]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{icons[0]}</svg>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{background:`${clr[0]},.1)`,color:ico[0],border:`1px solid ${clr[0]},.18)`}}>Featured</span>
                  </div>
                  <h3 className={`text-2xl font-black mb-3 ${bd?'text-white':'text-zinc-900'}`}>{SERVICES_DETAIL[0].title_de}</h3>
                  <p className={`text-sm leading-relaxed mb-5 ${bd?'text-zinc-400':'text-zinc-500'}`} style={{maxWidth:360}}>{SERVICES_DETAIL[0].desc_de.slice(0,160)}…</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {tags[0].map(tag=>(
                      <span key={tag} className="svc-tag" style={{background:`${clr[0]},.09)`,color:ico[0],border:`1px solid ${clr[0]},.16)`}}>{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={()=>onService(SERVICES_DETAIL[0])} className="btn-p px-6 py-3 rounded-xl text-sm flex items-center gap-2 cursor-pointer">
                      {t.services.more}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <span className={`text-sm font-bold ${bd?'text-zinc-500':'text-zinc-400'}`}>{prices[0]}</span>
                  </div>
                </div>
                {/* Mini UI preview */}
                <div className={`hidden md:block rounded-xl overflow-hidden ml-4`} style={{minWidth:180}}>
                  <div style={{background:bd?'rgba(255,255,255,.03)':'rgba(0,0,0,.03)',border:`1px solid ${bd?'rgba(255,255,255,.07)':'rgba(0,0,0,.07)'}`,borderRadius:12,padding:12}}>
                    <div className="flex gap-1.5 mb-3"><div style={{width:8,height:8,borderRadius:'50%',background:'#ff5f57'}}/><div style={{width:8,height:8,borderRadius:'50%',background:'#ffbd2e'}}/><div style={{width:8,height:8,borderRadius:'50%',background:'#28c840'}}/></div>
                    {[70,90,55,80,45].map((w,i)=><div key={i} style={{height:i===0?10:7,borderRadius:4,background:bd?'rgba(255,255,255,.08)':'rgba(0,0,0,.07)',width:`${w}%`,marginBottom:6}}/>)}
                    <div className="flex gap-2 mt-3">
                      <div style={{height:26,borderRadius:8,background:`${clr[0]},.3)`,flex:1}}/>
                      <div style={{height:26,borderRadius:8,background:bd?'rgba(255,255,255,.06)':'rgba(0,0,0,.06)',width:52}}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Marketing */}
          <div className={`md:col-span-2 rounded-2xl p-7 relative overflow-hidden glow-card reveal d2 ${bd?'card-dark':'card-light'}`}>
            <div className="gc-glow"/>
            <div aria-hidden="true" style={{position:'absolute',bottom:-30,right:-30,width:160,height:160,borderRadius:'50%',background:`${clr[1]},.1)`,filter:'blur(50px)',pointerEvents:'none'}}/>
            <div className="relative" style={{zIndex:2}}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 svc-icon" style={{background:`${clr[1]},.1)`,border:`1px solid ${clr[1]},.18)`}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ico[1]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{icons[1]}</svg>
              </div>
              {/* Mini chart */}
              <div className="flex items-end gap-1 mb-5" style={{height:36}}>
                {[40,65,48,80,58,90,72].map((h,i)=>(
                  <div key={i} style={{flex:1,height:`${h}%`,borderRadius:'3px 3px 0 0',background:i===5?ico[1]:(bd?'rgba(255,255,255,.1)':'rgba(0,0,0,.07)')}}/>
                ))}
              </div>
              <h3 className={`text-base font-bold mb-2 ${bd?'text-white':'text-zinc-900'}`}>{SERVICES_DETAIL[1].title_de}</h3>
              <p className={`text-sm leading-relaxed mb-5 ${bd?'text-zinc-500':'text-zinc-500'}`}>{SERVICES_DETAIL[1].desc_de.slice(0,90)}…</p>
              <SvcBtn i={1}/>
            </div>
          </div>

          {/* Social, Video, SEO */}
          {[2,3,4].map((si,ri)=>(
            <div key={si} className={`md:col-span-2 rounded-2xl p-7 relative overflow-hidden glow-card reveal d${ri+3} ${bd?'card-dark':'card-light'}`}>
              <div className="gc-glow"/>
              <div aria-hidden="true" style={{position:'absolute',top:-20,left:-20,width:130,height:130,borderRadius:'50%',background:`${clr[si]},.1)`,filter:'blur(45px)',pointerEvents:'none'}}/>
              <div className="relative" style={{zIndex:2}}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 svc-icon" style={{background:`${clr[si]},.1)`,border:`1px solid ${clr[si]},.18)`}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ico[si]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{icons[si]}</svg>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tags[si].slice(0,2).map(tag=>(
                    <span key={tag} className="svc-tag" style={{background:`${clr[si]},.08)`,color:ico[si],border:`1px solid ${clr[si]},.15)`,fontSize:10}}>{tag}</span>
                  ))}
                </div>
                <h3 className={`text-base font-bold mb-2 ${bd?'text-white':'text-zinc-900'}`}>{SERVICES_DETAIL[si].title_de}</h3>
                <p className={`text-sm leading-relaxed mb-5 ${bd?'text-zinc-500':'text-zinc-500'}`}>{SERVICES_DETAIL[si].desc_de.slice(0,90)}…</p>
                <SvcBtn i={si}/>
              </div>
            </div>
          ))}

          {/* Brand Architecture — full width */}
          <div className={`md:col-span-6 rounded-2xl p-8 relative overflow-hidden glow-card reveal d6 ${bd?'card-dark':'card-light'}`}
            style={{background:bd?'linear-gradient(135deg,rgba(168,85,247,.06),rgba(255,255,255,.02))':'linear-gradient(135deg,rgba(168,85,247,.04),rgba(255,255,255,.8))'}}>
            <div className="gc-glow"/>
            <div aria-hidden="true" style={{position:'absolute',top:'50%',right:'4%',transform:'translateY(-50%)',width:320,height:320,borderRadius:'50%',background:`${clr[5]},.1)`,filter:'blur(90px)',pointerEvents:'none'}}/>
            <div className="relative flex flex-col md:flex-row md:items-center gap-6" style={{zIndex:2}}>
              <div className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center" style={{background:`${clr[5]},.12)`,border:`1px solid ${clr[5]},.2)`}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ico[5]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{icons[5]}</svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className={`text-xl font-black ${bd?'text-white':'text-zinc-900'}`}>{SERVICES_DETAIL[5].title_de}</h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${bd?'bg-zinc-800 text-zinc-400':'bg-zinc-100 text-zinc-500'}`}>{prices[5]}</span>
                </div>
                <p className={`text-sm leading-relaxed ${bd?'text-zinc-400':'text-zinc-500'}`}>{SERVICES_DETAIL[5].desc_de.slice(0,155)}…</p>
              </div>
              <button onClick={()=>onService(SERVICES_DETAIL[5])} className="flex-shrink-0 btn-p px-6 py-3 rounded-xl text-sm flex items-center gap-2 cursor-pointer">
                {t.services.more}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
/* ── Apple-style sticky process — logo cube rotates per step ── */
const ProcessSection = ({ t, dark: bd }) => {
  const tp = t.process;
  const [step,setStep]=useState(0);
  const [pct,setPct]=useState(0);
  const containerRef=useRef(null);
  useEffect(()=>{
    const f=()=>{
      if(!containerRef.current)return;
      const rect=containerRef.current.getBoundingClientRect();
      const total=containerRef.current.offsetHeight-window.innerHeight;
      const scrolled=-rect.top;
      if(scrolled<0||scrolled>total){if(scrolled<0)setStep(0);return;}
      const prog=scrolled/total;
      setPct(prog*100);
      setStep(Math.min(Math.floor(prog*4),3));
    };
    window.addEventListener('scroll',f,{passive:true});
    f();
    return()=>window.removeEventListener('scroll',f);
  },[]);

  const stepColors=['rgba(255,255,255,0.9)','rgba(255,255,255,0.7)','rgba(255,255,255,0.8)','rgba(255,255,255,1)'];

  return (
    <div ref={containerRef} id="process" style={{height:'480vh',position:'relative'}}>
      <div style={{position:'sticky',top:0,height:'100vh',overflow:'hidden',zIndex:3}}
        className={`border-t ${bd?'border-zinc-900':'border-zinc-100'}`}>

        {/* Section header — fades out as you scroll in */}
        <div className="absolute top-0 left-0 right-0 pt-10 pb-6 text-center" style={{opacity:Math.max(0,1-pct*0.08),transition:'opacity .2s',zIndex:2}}>
          <div className={`${bd?'badge-dark':'badge-light'} mb-4`}>{tp.badge}</div>
          <h2 className={`text-[clamp(28px,4vw,52px)] font-black tracking-tight ${bd?'text-white':'text-zinc-900'}`}>{tp.h}</h2>
        </div>

        {/* Main layout */}
        <div className="flex items-center justify-center h-full px-5 lg:px-12">
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* LEFT — Animated logo cube */}
            <div className="flex flex-col items-center gap-8">
              {/* Giant bg number */}
              <div className="relative flex items-center justify-center" style={{width:220,height:220}}>
                <div className="proc-halo" aria-hidden="true" style={{opacity:0.22+step*0.16}}/>
                <div className="proc-ring" aria-hidden="true"/>
                <div className="bg-num" style={{fontSize:'clamp(80px,16vw,220px)',position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',color:stepColors[step],opacity:.05}}>
                  0{step+1}
                </div>
                <ProcessLogoSVG step={step} size={180}/>
              </div>

              {/* Step progress dots */}
              <div className="flex items-center gap-3">
                {tp.steps.map((_,i)=>(
                  <div key={i} className={`step-dot ${i===step?'on':''}`}/>
                ))}
              </div>

              {/* Progress bar */}
              <div className={`w-40 h-px ${bd?'bg-zinc-800':'bg-zinc-200'} relative overflow-hidden rounded-full`}>
                <div className="absolute left-0 top-0 h-full rounded-full bg-white transition-all duration-300" style={{width:`${pct}%`,maxWidth:'100%'}}/>
              </div>
            </div>

            {/* RIGHT — Step content panels */}
            <div className="relative" style={{minHeight:280}}>
              {tp.steps.map((s,i)=>(
                <div key={i} className={`proc-panel ${i===step?'act':''}`}
                  style={{position:i===0&&step===0?'relative':'absolute',top:i===0&&step===0?'auto':0}}>
                  <div className={`text-xs font-bold tracking-widest uppercase mb-4 ${bd?'text-zinc-600':'text-zinc-400'}`}>{s.n} / 04</div>
                  <h3 className={`font-black tracking-tight mb-5 ${bd?'text-white':'text-zinc-900'}`} style={{fontSize:'clamp(28px,4vw,44px)'}}>{s.t}</h3>
                  <p className={`text-lg leading-relaxed mb-8 ${bd?'text-zinc-400':'text-zinc-500'}`}>{s.d}</p>
                  {/* Decorative tags */}
                  <div className="flex flex-wrap gap-2">
                    {[['Discovery','Analyse','Briefing'],['Konzept','Wireframe','Design'],['Dev','Test','Deploy'],['Launch','Optimierung','Scale']][i].map(tag=>(
                      <span key={tag} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${bd?'bg-zinc-800/80 text-zinc-400':'bg-zinc-100 text-zinc-500'}`}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom hint */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <div className={`flex items-center gap-2 text-xs ${bd?'text-zinc-700':'text-zinc-300'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
            Scroll um fortzufahren
          </div>
        </div>
      </div>
    </div>
  );
};

const PortfolioSection = ({ t, dark: bd, navigate }) => {
  const tp = t.portfolio;
  return (
    <section id="cases" className={`py-28 px-5 border-t ${bd?'border-zinc-900':'border-zinc-100'}`} style={{zIndex:3}}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <div className={`${bd?'badge-dark':'badge-light'} mb-5 reveal`}>{tp.badge}</div>
            <h2 className={`text-[clamp(30px,4.5vw,56px)] font-black tracking-tight reveal ${bd?'text-white':'text-zinc-900'}`}>{tp.h}</h2>
          </div>
          <p className={`text-base max-w-xs reveal ${bd?'text-zinc-500':'text-zinc-400'}`}>{tp.sub}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {PORTFOLIO.map((p,i)=>(
            <div key={p.id} className={`rounded-2xl overflow-hidden port-card glow-card reveal d${i+1} ${bd?'card-dark':'card-light'}`}>
              <div className="gc-glow"/>
              {/* Preview header */}
              <div className="port-preview relative" style={{background:p.preview_bg,minHeight:200}}>
                <div className="port-preview-inner">
                  <div className="browser-chrome" style={{background:'rgba(0,0,0,0.35)',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                    <div className="dot-r"/><div className="dot-y"/><div className="dot-g"/>
                    <div className="ml-3 flex-1 h-5 rounded-full px-3 flex items-center text-white/35" style={{background:'rgba(0,0,0,0.3)',fontSize:10}}>{p.url.replace('https://','').replace('http://','')}</div>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-white/35 hover:text-white transition-colors p-1">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  </div>
                  <div className="p-5">
                    {[60,85,42,70].map((w,j)=><div key={j} style={{height:j===0?11:7,borderRadius:4,background:'rgba(255,255,255,0.12)',width:`${w}%`,marginBottom:8}}/>)}
                    <div className="flex gap-2 mt-3">
                      <div style={{height:26,borderRadius:8,background:p.color,width:88,opacity:.85}}/>
                      <div style={{height:26,borderRadius:8,background:'rgba(255,255,255,.1)',width:60}}/>
                    </div>
                  </div>
                </div>
                {/* Metrics overlay */}
                <div className="absolute bottom-0 left-0 right-0 px-5 py-4" style={{background:'linear-gradient(to top,rgba(0,0,0,.75),transparent)'}}>
                  <div className="flex gap-6">
                    {p.metrics.map((m,j)=>(
                      <div key={j}>
                        <div className="text-xl font-black text-white">{m.v}</div>
                        <div className="text-white/55" style={{fontSize:11}}>{m.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Category badge */}
                <div className="absolute top-12 right-4">
                  <span style={{background:p.color+'22',border:`1px solid ${p.color}44`,color:p.color,fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:9999,letterSpacing:'0.07em',textTransform:'uppercase'}}>{p.category}</span>
                </div>
                {/* Large bg number */}
                <div className="port-number text-white">{String(i+1).padStart(2,'0')}</div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.tags.map(tag=>(
                    <span key={tag} className={`text-xs font-medium px-2.5 py-1 rounded-full ${bd?'bg-zinc-800/80 text-zinc-400':'bg-zinc-100 text-zinc-500'}`}>{tag}</span>
                  ))}
                </div>
                <h3 className={`text-lg font-black mb-2 ${bd?'text-white':'text-zinc-900'}`}>{p.name}</h3>
                <p className={`text-sm leading-relaxed mb-5 ${bd?'text-zinc-500':'text-zinc-500'}`}>{p.desc_de}</p>
                <a href={p.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full transition-all"
                  style={{background:`${p.color}18`,color:p.color,border:`1px solid ${p.color}33`}}>
                  {tp.visit}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10 reveal">
          <button onClick={()=>navigate('portfolio')} className={`${bd?'btn-s-dark':'btn-s-light'} px-7 py-3 rounded-full text-sm font-semibold`}>{tp.viewAll} →</button>
        </div>
      </div>
    </section>
  );
};

const PricingSection = ({ t, dark: bd, billing, setBilling, navigate }) => {
  const tp = t.pricing;
  const planColors=['rgba(255,255,255','rgba(124,58,237','rgba(255,255,255'];
  return (
    <section id="pricing" className={`py-28 px-5 border-t ${bd?'border-zinc-900':'border-zinc-100'}`} style={{zIndex:3}}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <div className={`${bd?'badge-dark':'badge-light'} mb-5 reveal`}>{tp.badge}</div>
            <h2 className={`text-[clamp(30px,4.5vw,56px)] font-black tracking-tight reveal ${bd?'text-white':'text-zinc-900'}`}>{tp.h}</h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3">
            <p className={`text-sm reveal ${bd?'text-zinc-500':'text-zinc-400'}`}>{tp.sub}</p>
            <div className={`inline-flex items-center gap-0.5 p-1 rounded-full border reveal ${bd?'border-zinc-800 bg-zinc-900/50':'border-zinc-200 bg-zinc-100/70'}`}>
              {['mo','yr'].map(b=>(
                <button key={b} onClick={()=>setBilling(b)} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${billing===b?(bd?'bg-white text-zinc-900':'bg-zinc-900 text-white'):(bd?'text-zinc-400 hover:text-white':'text-zinc-500 hover:text-zinc-900')}`}>
                  {b==='mo'?tp.mo:tp.yr}{b==='yr'&&<span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">{tp.save}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {tp.packages.map((pkg,i)=>(
            <div key={i} className={`relative rounded-2xl p-8 reveal d${i+1} ${pkg.popular?'pop-card':(bd?'card-dark':'card-light')}`}
              style={pkg.popular?{boxShadow:'0 0 0 1px rgba(255,255,255,.16),0 40px 80px rgba(0,0,0,.55)'}:{}}>
              {pkg.popular&&(
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="popular-badge bg-white text-zinc-900 text-xs font-black px-5 py-1.5 rounded-full tracking-wider uppercase shadow-xl">★ Most Popular</span>
                </div>
              )}
              <div className="mb-6">
                <div className={`plan-tag mb-3 ${pkg.popular?'bg-violet-500/15 text-violet-400':''}${!pkg.popular&&bd?' bg-zinc-800 text-zinc-500':''}${!pkg.popular&&!bd?' bg-zinc-100 text-zinc-500':''}`}>{pkg.name}</div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className={`text-lg font-bold ${bd?'text-zinc-500':'text-zinc-400'}`}>€</span>
                  <span className={`price-num ${bd?'text-white':'text-zinc-900'}`}>{billing==='mo'?pkg.pm:pkg.py}</span>
                  <span className={`text-sm ${bd?'text-zinc-500':'text-zinc-400'}`}>/mo</span>
                </div>
                <p className={`text-sm leading-relaxed ${bd?'text-zinc-500':'text-zinc-500'}`}>{pkg.desc}</p>
              </div>

              <div className={`w-full h-px mb-6 ${bd?'bg-zinc-800':'bg-zinc-100'}`}/>

              <ul className="space-y-3 mb-8">
                {pkg.feats.map((f,j)=>(
                  <li key={j} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={pkg.popular?'#a78bfa':(bd?'#52525b':'#a1a1aa')} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <span className={`text-sm ${bd?'text-zinc-300':'text-zinc-600'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <button onClick={()=>navigate('#contact')} className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 cursor-pointer ${pkg.popular?'btn-p':(bd?'btn-s-dark':'btn-s-light')}`}>
                {pkg.cta}
              </button>
            </div>
          ))}
        </div>
        <p className={`text-center text-xs mt-8 reveal ${bd?'text-zinc-700':'text-zinc-300'}`}>{t.x.priceNote}</p>
      </div>
    </section>
  );
};

const ContactSection = ({ t, dark: bd }) => {
  const tc = t.contact;
  const [form,setForm]=useState({name:'',email:'',company:'',budget:'',msg:''});
  const [status,setStatus]=useState('idle'); // idle | sending | done | error
  const [consent,setConsent]=useState(false);
  const [errMsg,setErrMsg]=useState('');
  const inp=bd?'inp-dark':'inp-light';
  // TODO Owner: kostenlosen Web3Forms Access-Key auf https://web3forms.com holen und hier eintragen
  const WEB3FORMS_KEY='YOUR_WEB3FORMS_ACCESS_KEY';
  const submit=async(e)=>{
    e.preventDefault();
    const fd=new FormData(e.target);
    if(fd.get('botcheck')){return;} // Honeypot ausgeloest -> still ignorieren
    if(!consent){setStatus('error');setErrMsg(tc.consentErr);return;}
    setStatus('sending');setErrMsg('');
    fd.append('access_key',WEB3FORMS_KEY);
    fd.append('subject','Neue Projektanfrage — Blackstone Agency');
    fd.append('from_name','Blackstone Website');
    try{
      const res=await fetch('https://api.web3forms.com/submit',{method:'POST',body:fd});
      const data=await res.json();
      if(data.success){setStatus('done');}
      else{setStatus('error');setErrMsg(data.message||tc.error);}
    }catch(err){setStatus('error');setErrMsg(tc.error);}
  };
  const socials=[
    {n:'LinkedIn',p:<><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></>},
    {n:'Instagram',p:<><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></>},
    {n:'E-Mail',p:<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>},
  ];
  return (
    <section id="contact" className={`py-28 px-5 border-t ${bd?'border-zinc-900':'border-zinc-100'}`} style={{zIndex:3}}>
      <div className="max-w-7xl mx-auto">
        <div className="contact-split" style={{display:'block'}}>

          {/* LEFT — info */}
          <div className="mb-12 lg:mb-0">
            <div className={`${bd?'badge-dark':'badge-light'} mb-6 reveal`}>{tc.badge}</div>
            <h2 className={`text-[clamp(30px,4vw,52px)] font-black tracking-tight mb-5 reveal ${bd?'text-white':'text-zinc-900'}`} style={{lineHeight:.92}}>{tc.h}</h2>
            <p className={`text-base leading-relaxed mb-10 reveal ${bd?'text-zinc-400':'text-zinc-500'}`} style={{maxWidth:380}}>{tc.sub}</p>

            {/* Contact details */}
            <div className="space-y-5 mb-10 reveal">
              {[
                {icon:<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,label:'E-Mail',val:tc.info,href:`mailto:${tc.info}`},
                {icon:<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,label:t.x.cLocLabel,val:t.x.cLocVal,href:null},
                {icon:<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,label:t.x.cAnsLabel,val:t.x.cAnsVal,href:null},
              ].map((item,i)=>(
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bd?'bg-zinc-900 border border-zinc-800':'bg-zinc-50 border border-zinc-200'}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={bd?'#71717a':'#52525b'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg>
                  </div>
                  <div>
                    <div className={`text-xs font-semibold mb-0.5 ${bd?'text-zinc-600':'text-zinc-400'}`}>{item.label}</div>
                    {item.href
                      ? <a href={item.href} className={`text-sm font-semibold transition-colors ${bd?'text-white hover:text-zinc-300':'text-zinc-900 hover:text-zinc-600'}`}>{item.val}</a>
                      : <span className={`text-sm font-medium ${bd?'text-zinc-300':'text-zinc-700'}`}>{item.val}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex gap-3 reveal">
              {socials.map(s=>(
                <a key={s.n} href={s.n==='E-Mail'?`mailto:${tc.info}`:'#'}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${bd?'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white':'border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-800'}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{s.p}</svg>
                </a>
              ))}
            </div>

            {/* Guarantee card */}
            <div className={`mt-10 rounded-2xl p-6 reveal ${bd?'bg-zinc-900/60 border border-zinc-800':'bg-zinc-50 border border-zinc-100'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span className={`text-sm font-bold ${bd?'text-white':'text-zinc-900'}`}>{t.x.cGuarH}</span>
              </div>
              <p className={`text-xs leading-relaxed ${bd?'text-zinc-500':'text-zinc-500'}`}>{t.x.cGuarP}</p>
            </div>
          </div>

          {/* RIGHT — form */}
          <div className="reveal">
            {status==='done'?(
              <div className={`rounded-2xl p-16 text-center h-full flex flex-col items-center justify-center ${bd?'card-dark':'card-light'}`}>
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-6">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 className={`text-xl font-bold mb-2 ${bd?'text-white':'text-zinc-900'}`}>{tc.success}</h3>
              </div>
            ):(
              <div className={`rounded-2xl p-8 ${bd?'card-dark':'card-light'}`}>
                <form onSubmit={submit} className="space-y-5" noValidate>
                  <input type="text" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{position:'absolute',left:'-9999px',width:1,height:1,opacity:0}}/>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cf-name" className={`block text-xs font-semibold mb-2 ${bd?'text-zinc-500':'text-zinc-400'}`}>{tc.name} *</label>
                      <input id="cf-name" name="name" required type="text" placeholder="Max Mustermann" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className={`${inp} w-full px-4 py-3.5 rounded-xl text-sm`}/>
                    </div>
                    <div>
                      <label htmlFor="cf-email" className={`block text-xs font-semibold mb-2 ${bd?'text-zinc-500':'text-zinc-400'}`}>{tc.email} *</label>
                      <input id="cf-email" name="email" required type="email" placeholder="name@firma.de" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className={`${inp} w-full px-4 py-3.5 rounded-xl text-sm`}/>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cf-company" className={`block text-xs font-semibold mb-2 ${bd?'text-zinc-500':'text-zinc-400'}`}>{tc.company}</label>
                      <input id="cf-company" name="company" type="text" placeholder="Muster GmbH" value={form.company} onChange={e=>setForm({...form,company:e.target.value})} className={`${inp} w-full px-4 py-3.5 rounded-xl text-sm`}/>
                    </div>
                    <div>
                      <label htmlFor="cf-budget" className={`block text-xs font-semibold mb-2 ${bd?'text-zinc-500':'text-zinc-400'}`}>{tc.budget}</label>
                      <select id="cf-budget" name="budget" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} className={`${inp} w-full px-4 py-3.5 rounded-xl text-sm cursor-pointer`}>
                        <option value="">{t.x.cSelect}</option>
                        {tc.budgets.map(b=><option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="cf-msg" className={`block text-xs font-semibold mb-2 ${bd?'text-zinc-500':'text-zinc-400'}`}>{tc.msg} *</label>
                    <textarea id="cf-msg" name="message" required rows={5} placeholder={tc.msg} value={form.msg} onChange={e=>setForm({...form,msg:e.target.value})} className={`${inp} w-full px-4 py-3.5 rounded-xl text-sm resize-none`}/>
                  </div>
                  <label className={`flex items-start gap-3 text-xs leading-relaxed cursor-pointer ${bd?'text-zinc-400':'text-zinc-500'}`}>
                    <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 flex-shrink-0 cursor-pointer accent-violet-500"/>
                    <span>{tc.consent} <a href="/datenschutz" className={`underline ${bd?'text-zinc-300 hover:text-white':'text-zinc-700 hover:text-zinc-900'}`}>{tc.privacy}</a></span>
                  </label>
                  {status==='error'&&<p role="alert" className="text-sm font-medium text-red-400">{errMsg}</p>}
                  <button type="submit" disabled={status==='sending'} className="btn-p w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                    {status==='sending'?tc.sending:tc.cta}
                    {status!=='sending'&&<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
                  </button>
                  <p aria-live="polite" className="sr-only">{status==='sending'?tc.sending:status==='error'?errMsg:''}</p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const AboutPage = ({ dark: bd, t, navigate }) => {
  const ta = t.about;
  const teamGlyphs=['⬡','◇','○','△'];
  const gradients=['linear-gradient(135deg,#3f3f46,#18181b)','linear-gradient(135deg,#1e3a5f,#0a1a2e)','linear-gradient(135deg,#1a3a2a,#0a1a10)','linear-gradient(135deg,#2a1a4a,#120820)'];
  return (
    <div className="page-enter pt-24 pb-20 px-5" style={{zIndex:3,position:'relative'}}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-20 reveal">
          <div className={`${bd?'badge-dark':'badge-light'} mb-6`}>{ta.badge}</div>
          <h1 className={`text-[clamp(40px,7vw,80px)] font-black tracking-tight mb-6 ${bd?'text-white':'text-zinc-900'}`}>{ta.h}</h1>
          <p className={`text-xl max-w-2xl leading-relaxed ${bd?'text-zinc-400':'text-zinc-500'}`}>{ta.sub}</p>
        </div>
        <div className={`rounded-2xl p-8 mb-12 reveal ${bd?'card-dark':'card-light'}`}>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl font-black text-white" style={{background:'linear-gradient(135deg,#3f3f46,#09090b)',border:'1px solid rgba(255,255,255,0.1)'}}>BA</div>
            <div className="flex-1">
              <div className={`text-xs font-semibold tracking-widest uppercase mb-2 ${bd?'text-zinc-600':'text-zinc-400'}`}>{ta.founder}</div>
              <h2 className={`text-2xl font-black mb-1 ${bd?'text-white':'text-zinc-900'}`}>Blackstone Agency</h2>
              <p className={`text-sm mb-4 ${bd?'text-zinc-500':'text-zinc-400'}`}>Hamburg, Deutschland · seit 2023</p>
              <div className="flex flex-wrap gap-2">{['Strategie','Brand Architecture','Performance Marketing','Business Development'].map(skill=>(<span key={skill} className={`text-xs px-3 py-1 rounded-full font-medium ${bd?'bg-zinc-800 text-zinc-400':'bg-zinc-100 text-zinc-500'}`}>{skill}</span>))}</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20 items-start">
          <div className="reveal-l">
            <h2 className={`text-2xl font-black mb-5 ${bd?'text-white':'text-zinc-900'}`}>{ta.story_h}</h2>
            {ta.story.split('\n\n').map((para,i)=>(<p key={i} className={`text-base leading-relaxed mb-4 ${bd?'text-zinc-400':'text-zinc-500'}`}>{para}</p>))}
          </div>
          <div className="reveal-r">
            <div className="grid grid-cols-2 gap-4">
              {t.x.aboutStats.map((s,i)=>(
                <div key={i} className={`rounded-xl p-5 ${bd?'card-dark':'card-light'}`}><div className={`text-3xl font-black mb-1 ${bd?'text-white':'text-zinc-900'}`}>{s.n}</div><div className={`text-xs ${bd?'text-zinc-600':'text-zinc-400'}`}>{s.l}</div></div>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-20">
          <h2 className={`text-2xl font-black mb-8 text-center reveal ${bd?'text-white':'text-zinc-900'}`}>{ta.values_h}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {ta.values.map((v,i)=>(<div key={i} className={`rounded-2xl p-6 reveal d${i+1} ${bd?'card-dark':'card-light'}`}><div className="w-8 h-8 rounded-full flex items-center justify-center mb-4 text-lg" style={{background:'rgba(255,255,255,0.06)'}}>{['⬡','○','◇','△'][i]}</div><h3 className={`font-bold mb-2 ${bd?'text-white':'text-zinc-900'}`}>{v.t}</h3><p className={`text-sm leading-relaxed ${bd?'text-zinc-500':'text-zinc-500'}`}>{v.d}</p></div>))}
          </div>
        </div>
        <div className="mb-20">
          <h2 className={`text-2xl font-black mb-8 text-center reveal ${bd?'text-white':'text-zinc-900'}`}>{ta.team_h}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {ta.team.map((member,i)=>(<div key={i} className={`rounded-2xl p-5 text-center reveal d${i+1} ${bd?'card-dark':'card-light'}`}><div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center text-sm font-black text-white" style={{background:gradients[i]}}>{teamGlyphs[i]}</div><div className={`font-bold text-sm mb-1 ${bd?'text-white':'text-zinc-900'}`}>{member.name}</div><div className={`text-xs font-medium mb-2 ${bd?'text-zinc-500':'text-zinc-400'}`}>{member.role}</div><div className={`text-xs ${bd?'text-zinc-700':'text-zinc-300'}`}>{member.bg}</div></div>))}
          </div>
        </div>
        <div className="mb-16">
          <h2 className={`text-2xl font-black mb-8 text-center reveal ${bd?'text-white':'text-zinc-900'}`}>{ta.why_h}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ta.why.map((w,i)=>(<div key={i} className={`rounded-xl p-5 flex gap-4 reveal d${i+1} ${bd?'card-dark':'card-light'}`}><div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg></div><div><div className={`font-semibold text-sm mb-1 ${bd?'text-white':'text-zinc-900'}`}>{w.t}</div><div className={`text-xs leading-relaxed ${bd?'text-zinc-500':'text-zinc-500'}`}>{w.d}</div></div></div>))}
          </div>
        </div>
        <div className={`rounded-2xl p-10 text-center reveal ${bd?'glass-dark':'glass-light'}`} style={{border:bd?'1px solid rgba(255,255,255,0.1)':'1px solid rgba(0,0,0,0.08)'}}>
          <h3 className={`text-2xl font-black mb-3 ${bd?'text-white':'text-zinc-900'}`}>{t.x.aboutCtaH}</h3>
          <p className={`text-sm mb-6 ${bd?'text-zinc-400':'text-zinc-500'}`}>{t.x.aboutCtaSub}</p>
          <button onClick={()=>navigate('#contact')} className="btn-p px-8 py-3.5 rounded-full font-bold text-sm">{t.x.aboutCta}</button>
        </div>
      </div>
    </div>
  );
};

const PortfolioPage = ({ t, dark: bd }) => {
  const tp = t.portfolio;
  return (
    <div className="page-enter pt-24 pb-20 px-5" style={{zIndex:3,position:'relative'}}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 reveal">
          <div className={`${bd?'badge-dark':'badge-light'} mb-6`}>{tp.badge}</div>
          <h1 className={`text-[clamp(40px,7vw,80px)] font-black tracking-tight mb-6 ${bd?'text-white':'text-zinc-900'}`}>{tp.h}</h1>
          <p className={`text-xl max-w-2xl leading-relaxed ${bd?'text-zinc-400':'text-zinc-500'}`}>{tp.sub}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {PORTFOLIO.map((p,i)=>(
            <div key={p.id} className={`rounded-2xl overflow-hidden reveal d${i%2+1} ${bd?'card-dark':'card-light'}`}>
              <div style={{background:p.preview_bg,minHeight:220,position:'relative'}}>
                <div className="browser-chrome" style={{background:'rgba(0,0,0,0.3)',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                  <div className="dot-r"/><div className="dot-y"/><div className="dot-g"/>
                  <div className="ml-3 flex-1 h-5 rounded-full px-3 flex items-center text-xs text-white/40" style={{background:'rgba(0,0,0,0.3)'}}>{p.url.replace('https://','').replace('http://','')}</div>
                </div>
                <div className="p-6 flex flex-col gap-3">{[60,85,40,70,55].map((w,j)=><div key={j} style={{height:j===0?14:9,borderRadius:6,background:'rgba(255,255,255,0.1)',width:`${w}%`}}/>)}</div>
                <div className="absolute bottom-0 left-0 right-0 px-6 py-4" style={{background:'linear-gradient(to top,rgba(0,0,0,0.7),transparent)'}}>
                  <div className="flex gap-6">{p.metrics.map((m,j)=>(<div key={j}><div className="text-2xl font-black text-white">{m.v}</div><div className="text-xs text-white/55">{m.l}</div></div>))}</div>
                </div>
              </div>
              <div className="p-7">
                <span style={{color:p.color,background:p.color+'18',border:`1px solid ${p.color}33`,fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:9999,letterSpacing:'0.08em',textTransform:'uppercase',display:'inline-block',marginBottom:12}}>{p.category}</span>
                <h3 className={`text-xl font-black mb-3 ${bd?'text-white':'text-zinc-900'}`}>{p.name}</h3>
                <p className={`text-sm leading-relaxed mb-5 ${bd?'text-zinc-400':'text-zinc-500'}`}>{p.desc_de}</p>
                <div className="flex flex-wrap gap-2 mb-5">{p.tags.map(tag=><span key={tag} className={`text-xs px-2.5 py-1 rounded-full ${bd?'bg-zinc-800 text-zinc-400':'bg-zinc-100 text-zinc-500'}`}>{tag}</span>)}</div>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn-p inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm">
                  {tp.visit}<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LegalSection = ({ title, dark: bd, children }) => (
  <div className="page-enter pt-24 pb-20 px-5" style={{zIndex:3,position:'relative'}}>
    <div className="max-w-3xl mx-auto">
      <h1 className={`text-4xl font-black tracking-tight mb-10 ${bd?'text-white':'text-zinc-900'}`}>{title}</h1>
      <div className={`space-y-7 ${bd?'text-zinc-400':'text-zinc-600'}`}>{children}</div>
    </div>
  </div>
);
const LH = ({ dark: bd, children }) => <h2 className={`text-lg font-bold mt-8 mb-2 ${bd?'text-white':'text-zinc-900'}`}>{children}</h2>;
const LP = ({ children }) => <p className="text-sm leading-relaxed">{children}</p>;

const ImpressumPage = ({ dark: bd }) => (
  <LegalSection title="Impressum" dark={bd}>
    <LH dark={bd}>Angaben gemäß § 5 TMG</LH><LP>Blackstone Agency<br/>Musterstraße 12<br/>20099 Hamburg<br/>Deutschland</LP>
    <LH dark={bd}>Kontakt</LH><LP>E-Mail: info@blackstone-agency.de<br/>Web: www.blackstone-agency.de</LP>
    <LH dark={bd}>Umsatzsteuer-ID</LH><LP>DE000000000 (wird nach Registrierung ergänzt)</LP>
    <LH dark={bd}>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</LH><LP>Blackstone Agency, Musterstraße 12, 20099 Hamburg</LP>
    <LH dark={bd}>Streitschlichtung</LH><LP>Die EU-Kommission stellt eine OS-Plattform bereit: https://ec.europa.eu/consumers/odr/. Wir nehmen nicht an Verbraucherstreitbeilegungsverfahren teil.</LP>
    <LH dark={bd}>Haftung für Inhalte</LH><LP>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte verantwortlich. Nach §§ 8–10 TMG sind wir nicht verpflichtet, fremde Informationen zu überwachen.</LP>
    <LH dark={bd}>Urheberrecht</LH><LP>Die erstellten Inhalte unterliegen dem deutschen Urheberrecht. Vervielfältigung bedarf der schriftlichen Zustimmung des Erstellers.</LP>
  </LegalSection>
);

const DatenschutzPage = ({ dark: bd }) => (
  <LegalSection title="Datenschutzerklärung" dark={bd}>
    <LH dark={bd}>1. Verantwortlicher</LH><LP>Blackstone Agency, Musterstraße 12, 20099 Hamburg, E-Mail: info@blackstone-agency.de</LP>
    <LH dark={bd}>2. Erhebung personenbezogener Daten</LH><LP>Beim Websitebesuch werden Server-Log-Daten gespeichert: Browsertyp, Betriebssystem, Referrer-URL, Hostname, Uhrzeit. Diese sind nicht bestimmten Personen zuordenbar.</LP>
    <LH dark={bd}>3. Kontaktformular</LH><LP>Angaben aus Kontaktformularen werden zur Bearbeitung gespeichert und nicht ohne Einwilligung weitergegeben. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.</LP>
    <LH dark={bd}>4. Cookies</LH><LP>Wir verwenden Session-Cookies (werden nach Browserschluss gelöscht) und persistente Cookies. Sie können Cookies im Browser deaktivieren.</LP>
    <LH dark={bd}>5. Ihre Rechte</LH><LP>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit und Widerspruch. Kontakt: info@blackstone-agency.de</LP>
    <LH dark={bd}>6. Datensicherheit</LH><LP>Wir verwenden SSL-Verschlüsselung mit der höchsten vom Browser unterstützten Stufe.</LP>
    <LH dark={bd}>7. Aktualität</LH><LP>Diese Erklärung wird bei Bedarf angepasst. Stand: Juni 2026</LP>
  </LegalSection>
);

const AGBPage = ({ dark: bd }) => (
  <LegalSection title="Allgemeine Geschäftsbedingungen" dark={bd}>
    <LH dark={bd}>§ 1 Geltungsbereich</LH><LP>Diese AGB gelten für alle Verträge zwischen Blackstone Agency, Hamburg und dem Kunden.</LP>
    <LH dark={bd}>§ 2 Leistungen</LH><LP>Die Agentur erbringt Leistungen in Digital Marketing, Web Design, Branding, Social Media und Performance Marketing gemäß Angebot.</LP>
    <LH dark={bd}>§ 3 Vergütung</LH><LP>Zahlung innerhalb 14 Tagen nach Rechnungsstellung. Retainer monatlich im Voraus. Bei Verzug behält sich die Agentur Leistungseinstellung vor.</LP>
    <LH dark={bd}>§ 4 Urheberrecht</LH><LP>Erstellte Werke bleiben bis zur vollständigen Zahlung Eigentum der Agentur. Mit Zahlung erhält der Kunde exklusive Nutzungsrechte.</LP>
    <LH dark={bd}>§ 5 Mitwirkung</LH><LP>Der Kunde stellt notwendige Informationen rechtzeitig bereit. Verzögerungen durch fehlende Mitwirkung begründen keine Haftung der Agentur.</LP>
    <LH dark={bd}>§ 6 Haftung</LH><LP>Haftung beschränkt auf Vorsatz und grobe Fahrlässigkeit. Haftung für entgangenen Gewinn und Folgeschäden ausgeschlossen.</LP>
    <LH dark={bd}>§ 7 Kündigung</LH><LP>Retainer monatlich kündbar mit 30 Tagen Frist. Projektverträge grundsätzlich nicht ordentlich kündbar.</LP>
    <LH dark={bd}>§ 8 Gerichtsstand</LH><LP>Deutsches Recht. Gerichtsstand Hamburg für Kaufleute. Stand: Juni 2026</LP>
  </LegalSection>
);

const CookiesPage = ({ dark: bd }) => (
  <LegalSection title="Cookie-Richtlinie" dark={bd}>
    <LH dark={bd}>Was sind Cookies?</LH><LP>Kleine Textdateien, die beim Websitebesuch auf Ihrem Gerät gespeichert werden und Einstellungen sowie Nutzungserlebnis verbessern.</LP>
    <LH dark={bd}>Welche Cookies verwenden wir?</LH><LP>Notwendige Cookies (nicht deaktivierbar), Analyse-Cookies (z. B. Google Analytics) und Marketing-Cookies für relevante Werbung.</LP>
    <LH dark={bd}>Kontrolle</LH><LP>Cookies können im Browser deaktiviert werden. Bei Deaktivierung kann die Funktionalität eingeschränkt sein. Einstellungen jederzeit über das Cookie-Banner änderbar.</LP>
    <LH dark={bd}>Kontakt</LH><LP>Fragen zur Cookie-Richtlinie: info@blackstone-agency.de</LP>
  </LegalSection>
);

const BlogPage = ({ dark: bd }) => (
  <div className="page-enter pt-24 pb-20 px-5" style={{zIndex:3,position:'relative'}}>
    <div className="max-w-4xl mx-auto text-center">
      <div className={`${bd?'badge-dark':'badge-light'} mb-6`}>Blog</div>
      <h1 className={`text-5xl font-black tracking-tight mb-6 ${bd?'text-white':'text-zinc-900'}`}>Coming Soon.</h1>
      <p className={`text-lg ${bd?'text-zinc-400':'text-zinc-500'}`}>Hier erscheinen bald Insights, Strategien und Fallstudien aus der Praxis.</p>
    </div>
  </div>
);

const KarrierePage = ({ dark: bd, navigate, t }) => (
  <div className="page-enter pt-24 pb-20 px-5" style={{zIndex:3,position:'relative'}}>
    <div className="max-w-3xl mx-auto">
      <div className={`${bd?'badge-dark':'badge-light'} mb-6`}>{t.nav.karriere}</div>
      <h1 className={`text-5xl font-black tracking-tight mb-6 ${bd?'text-white':'text-zinc-900'}`}>{t.x.karH}</h1>
      <p className={`text-xl mb-10 ${bd?'text-zinc-400':'text-zinc-500'}`}>{t.x.karSub}</p>
      {[{role:'Senior Frontend Developer',tags:['React','Next.js','TypeScript']},{role:'Performance Marketing Manager',tags:['Meta Ads','Google Ads','Analytics']},{role:'UX/UI Designer',tags:['Figma','Design Systems','Motion']}].map((job,i)=>(
        <div key={i} className={`rounded-2xl p-6 mb-4 ${bd?'card-dark':'card-light'}`}>
          <div className="flex items-start justify-between gap-4">
            <div><h3 className={`font-bold text-lg mb-2 ${bd?'text-white':'text-zinc-900'}`}>{job.role}</h3><p className={`text-xs mb-3 ${bd?'text-zinc-600':'text-zinc-400'}`}>{t.x.karTypes[i]}</p><div className="flex flex-wrap gap-2">{job.tags.map(t=><span key={t} className={`text-xs px-2.5 py-1 rounded-full ${bd?'bg-zinc-800 text-zinc-400':'bg-zinc-100 text-zinc-500'}`}>{t}</span>)}</div></div>
            <button onClick={()=>navigate('#contact')} className="btn-p px-4 py-2 rounded-full text-xs font-bold flex-shrink-0">{t.x.karApply}</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Footer = ({ t, dark: bd, navigate }) => {
  const tf = t.footer;
  const socials=[
    {n:'LinkedIn',p:<><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></>},
    {n:'Instagram',p:<><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></>},
    {n:'TikTok',p:<><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></>},
    {n:'E-Mail',p:<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>},
  ];
  return (
    <footer className={`border-t ${bd?'border-zinc-900':'border-zinc-100'}`} style={{zIndex:3,position:'relative'}}>
      {/* Editorial big tagline */}
      <div className={`px-5 pt-16 pb-12 border-b ${bd?'border-zinc-900':'border-zinc-100'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className={`footer-big ${bd?'text-white':'text-zinc-900'}`} style={{maxWidth:760}}>
              We build<br/>
              <span className="gradient-word">digital dominance.</span>
            </div>
            <div className="flex flex-col items-start lg:items-end gap-4">
              <button onClick={()=>navigate('#contact')} className="btn-p px-8 py-4 rounded-full font-bold text-sm flex items-center gap-2.5 cursor-pointer">
                Projekt starten
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
              <p className={`text-xs ${bd?'text-zinc-600':'text-zinc-400'}`}>Hamburg · info@blackstone-agency.de</p>
            </div>
          </div>
        </div>
      </div>

      {/* Links grid */}
      <div className="px-5 py-12">
        <div className="max-w-7xl mx-auto footer-links-grid">
          {/* Brand */}
          <div className="mb-10 lg:mb-0">
            <button onClick={()=>navigate('home')} className="flex items-center gap-2.5 mb-4 cursor-pointer">
              <Logo size={32}/>
              <span className={`text-sm font-bold tracking-tight ${bd?'text-white':'text-zinc-900'}`}>Blackstone<span className={bd?'text-zinc-500':'text-zinc-400'}> Agency</span></span>
            </button>
            <p className={`text-sm leading-relaxed mb-5 ${bd?'text-zinc-500':'text-zinc-500'}`} style={{maxWidth:240}}>{tf.tagline}</p>
            <div className="flex gap-2">
              {socials.map(s=>(
                <a key={s.n} href={s.n==='E-Mail'?'mailto:info@blackstone-agency.de':'#'}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${bd?'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white':'border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-700'}`}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{s.p}</svg>
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div className="mb-8 lg:mb-0">
            <div className={`text-xs font-bold tracking-widest uppercase mb-5 ${bd?'text-zinc-600':'text-zinc-400'}`}>{tf.company}</div>
            <ul className="space-y-3">
              {tf.comp_links.map((link,i)=>(
                <li key={link}>
                  <button onClick={()=>navigate(tf.comp_routes[i])} className={`text-sm h-line transition-colors text-left cursor-pointer ${bd?'text-zinc-500 hover:text-white':'text-zinc-500 hover:text-zinc-900'}`}>{link}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className={`text-xs font-bold tracking-widest uppercase mb-5 ${bd?'text-zinc-600':'text-zinc-400'}`}>{tf.legal}</div>
            <ul className="space-y-3">
              {tf.legal_links.map((link,i)=>(
                <li key={link}>
                  <button onClick={()=>navigate(tf.legal_routes[i])} className={`text-sm h-line transition-colors text-left cursor-pointer ${bd?'text-zinc-500 hover:text-white':'text-zinc-500 hover:text-zinc-900'}`}>{link}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={`border-t px-5 py-6 ${bd?'border-zinc-900':'border-zinc-100'}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className={`text-xs ${bd?'text-zinc-700':'text-zinc-400'}`}>{tf.copy}</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{boxShadow:'0 0 6px #22c55e'}}/>
            <span className={`text-xs ${bd?'text-zinc-700':'text-zinc-400'}`}>{tf.status}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

/* ── Mouse-tracking glow on .glow-card elements ── */
function initGlowCards() {
  window.addEventListener('mousemove', e => {
    document.querySelectorAll('.glow-card').forEach(el => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--gx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--gy', (e.clientY - r.top) + 'px');
    });
  }, { passive: true });
}

/* ── Magnetic button pull effect ── */
function initMagneticBtns() {
  const attach = () => {
    document.querySelectorAll('.mag').forEach(btn => {
      if (btn._magInit) return;
      btn._magInit = true;
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.17}px, ${dy * 0.17}px)`;
      }, { passive: true });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  };
  setTimeout(attach, 500);
  window.addEventListener('scroll', attach, { once: true, passive: true });
}

const FlowFieldSection = ({ t, dark: bd }) => {
  const tf = t.flow;
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, particles = [], raf = 0, tm = 0;
    const mouse = { x: -9999, y: -9999, active: false };
    const COUNT = window.innerWidth < 640 ? 70 : 160;
    const accent  = bd ? [139,124,255] : [90,70,210];
    const accent2 = bd ? [16,185,129] : [5,150,105];
    function resize() {
      const r = wrap.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function field(x, y, t2) {
      return Math.sin(x * 0.0016 + t2 * 0.00022) * Math.cos(y * 0.0016 - t2 * 0.00016) * Math.PI * 2
           + Math.sin((x + y) * 0.0009 + t2 * 0.0003) * Math.PI;
    }
    function init() {
      particles = [];
      for (let i = 0; i < COUNT; i++) particles.push({
        x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0,
        life: Math.random() * 220 + 60, mix: Math.random(), sz: Math.random() * 1.5 + 0.4
      });
    }
    function frame() {
      tm += 16;
      ctx.fillStyle = bd ? 'rgba(3,3,3,0.085)' : 'rgba(248,248,248,0.11)';
      ctx.fillRect(0, 0, w, h);
      for (const p of particles) {
        const a = field(p.x, p.y, tm);
        p.vx += Math.cos(a) * 0.10; p.vy += Math.sin(a) * 0.10;
        if (mouse.active) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < 17000) { const d = Math.sqrt(d2) || 1, f = (1 - d / 130) * 1.7; p.vx += dx / d * f; p.vy += dy / d * f; }
        }
        p.vx *= 0.93; p.vy *= 0.93;
        const px = p.x, py = p.y;
        p.x += p.vx; p.y += p.vy; p.life--;
        if (p.x < 0 || p.x > w || p.y < 0 || p.y > h || p.life < 0) {
          p.x = Math.random() * w; p.y = Math.random() * h; p.vx = p.vy = 0; p.life = Math.random() * 220 + 60;
        }
        const c = p.mix < 0.5 ? accent : accent2;
        const sp = Math.min(1, Math.hypot(p.vx, p.vy) / 3);
        ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.10 + sp * 0.55})`;
        ctx.lineWidth = p.sz;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
      raf = requestAnimationFrame(frame);
    }
    function staticFrame() {
      ctx.fillStyle = bd ? '#030303' : '#f8f8f8'; ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 140; i++) {
        ctx.fillStyle = `rgba(139,124,255,${Math.random() * 0.4})`;
        ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.6, 0, 7); ctx.fill();
      }
    }
    resize(); init();
    const onMove = (e) => { const r = wrap.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.active = true; };
    const onLeave = () => { mouse.active = false; mouse.x = mouse.y = -9999; };
    const onTouch = (e) => { const tt = e.touches[0]; const r = wrap.getBoundingClientRect(); mouse.x = tt.clientX - r.left; mouse.y = tt.clientY - r.top; mouse.active = true; };
    const onResize = () => { resize(); init(); };
    if (reduce) { staticFrame(); }
    else {
      wrap.addEventListener('mousemove', onMove, { passive: true });
      wrap.addEventListener('mouseleave', onLeave);
      wrap.addEventListener('touchmove', onTouch, { passive: true });
      window.addEventListener('resize', onResize);
      raf = requestAnimationFrame(frame);
    }
    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener('mousemove', onMove);
      wrap.removeEventListener('mouseleave', onLeave);
      wrap.removeEventListener('touchmove', onTouch);
      window.removeEventListener('resize', onResize);
    };
  }, [bd]);
  return (
    <section className={`flow-section border-t ${bd?'border-zinc-900':'border-zinc-100'}`} style={{zIndex:3}}>
      <div ref={wrapRef} className="flow-wrap">
        <canvas ref={canvasRef} className="flow-canvas" aria-hidden="true"/>
        <div className="flow-overlay">
          <div className={`${bd?'badge-dark':'badge-light'} mb-6 reveal`} style={{backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)'}}>{tf.badge}</div>
          <h2 className={`flow-title font-black tracking-tighter reveal ${bd?'text-white':'text-zinc-900'}`}>{tf.h}</h2>
          <p className={`flow-sub reveal ${bd?'text-zinc-400':'text-zinc-500'}`}>{tf.sub}</p>
          <div className={`flow-hint reveal ${bd?'text-zinc-600':'text-zinc-400'}`}>{tf.hint}</div>
        </div>
      </div>
    </section>
  );
};

const GrowthCalculator = ({ t, dark: bd, navigate }) => {
  const tc = t.calc;
  const [budget,setBudget]=useState(2500);
  const [ind,setInd]=useState(0);
  const mult=[
    {reach:38,lead:0.011,roas:5.2},
    {reach:30,lead:0.014,roas:4.4},
    {reach:26,lead:0.018,roas:4.0},
    {reach:28,lead:0.013,roas:4.6},
    {reach:18,lead:0.022,roas:6.1},
    {reach:34,lead:0.012,roas:3.8},
  ];
  const m=mult[ind]||mult[0];
  const reach=Math.round(budget*m.reach);
  const leads=Math.round(budget*m.reach*m.lead);
  const roas=m.roas.toFixed(1);
  const fmt=n=>new Intl.NumberFormat('de-DE').format(n);
  return (
    <section id="calculator" className={`py-28 px-5 border-t ${bd?'border-zinc-900':'border-zinc-100'}`} style={{zIndex:3}}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className={`${bd?'badge-dark':'badge-light'} mb-5 reveal inline-block`}>{tc.badge}</div>
          <h2 className={`text-[clamp(30px,4.5vw,56px)] font-black tracking-tight reveal ${bd?'text-white':'text-zinc-900'}`}>{tc.h}</h2>
          <p className={`text-base max-w-xl mx-auto mt-4 reveal ${bd?'text-zinc-500':'text-zinc-400'}`}>{tc.sub}</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-5 reveal">
          <div className={`rounded-2xl p-8 ${bd?'card-dark':'card-light'}`}>
            <label className={`block text-xs font-semibold tracking-widest uppercase mb-3 ${bd?'text-zinc-500':'text-zinc-400'}`}>{tc.budgetLabel}</label>
            <div className={`text-4xl font-black mb-5 ${bd?'text-white':'text-zinc-900'}`}>€{fmt(budget)}<span className={`text-base font-medium ${bd?'text-zinc-600':'text-zinc-400'}`}>{tc.perMonth}</span></div>
            <input type="range" min="500" max="20000" step="100" value={budget} onChange={e=>setBudget(+e.target.value)} className="growth-slider" aria-label={tc.budgetLabel}/>
            <div className={`flex justify-between text-xs mt-2 ${bd?'text-zinc-600':'text-zinc-400'}`}><span>€500</span><span>€20.000</span></div>
            <label className={`block text-xs font-semibold tracking-widest uppercase mt-8 mb-3 ${bd?'text-zinc-500':'text-zinc-400'}`}>{tc.industryLabel}</label>
            <div className="flex flex-wrap gap-2">
              {tc.industries.map((label,i)=>(
                <button key={i} onClick={()=>setInd(i)} className={`text-sm px-4 py-2 rounded-full font-medium transition-all duration-200 cursor-pointer ${ind===i?(bd?'bg-white text-zinc-900':'bg-zinc-900 text-white'):(bd?'bg-zinc-800/60 text-zinc-400 hover:text-white':'bg-zinc-100 text-zinc-500 hover:text-zinc-900')}`}>{label}</button>
              ))}
            </div>
          </div>
          <div className={`rounded-2xl p-8 relative overflow-hidden ${bd?'card-dark':'card-light'}`}>
            <div className="cta-orb" style={{width:240,height:240,top:-60,right:-60,background:'radial-gradient(circle,rgba(124,108,246,.45),transparent 70%)'}}/>
            <div className="relative space-y-6">
              <div>
                <div className={`text-xs font-semibold tracking-widest uppercase mb-1 ${bd?'text-zinc-500':'text-zinc-400'}`}>{tc.out_reach}</div>
                <div className={`calc-num text-3xl md:text-4xl font-black ${bd?'text-white':'text-zinc-900'}`} key={'r'+reach}>{fmt(reach)}+</div>
              </div>
              <div className={`w-full h-px ${bd?'bg-zinc-800':'bg-zinc-100'}`}/>
              <div>
                <div className={`text-xs font-semibold tracking-widest uppercase mb-1 ${bd?'text-zinc-500':'text-zinc-400'}`}>{tc.out_leads}</div>
                <div className={`calc-num text-3xl md:text-4xl font-black ${bd?'text-white':'text-zinc-900'}`} key={'l'+leads}>~{fmt(leads)}</div>
              </div>
              <div className={`w-full h-px ${bd?'bg-zinc-800':'bg-zinc-100'}`}/>
              <div>
                <div className={`text-xs font-semibold tracking-widest uppercase mb-1 ${bd?'text-zinc-500':'text-zinc-400'}`}>{tc.out_roas}</div>
                <div className="calc-num text-3xl md:text-4xl font-black g-text" key={'o'+roas}>{roas}×</div>
              </div>
              <button onClick={()=>navigate('#contact')} className="btn-p w-full py-3.5 rounded-xl text-sm font-bold mt-2 cursor-pointer">{tc.cta}</button>
            </div>
          </div>
        </div>
        <p className={`text-center text-xs mt-8 max-w-2xl mx-auto reveal ${bd?'text-zinc-700':'text-zinc-300'}`}>{tc.disclaimer}</p>
      </div>
    </section>
  );
};

const GuaranteeSection = ({ t, dark: bd }) => {
  const tg = t.guarantee;
  const icons=[
    <><path d="M9 12l2 2 4-4"/><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/></>,
    <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/><path d="M8 2v4"/><path d="M16 2v4"/><path d="M9 16l2 2 4-4"/></>,
    <><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9h.01"/><path d="M9 13h.01"/></>,
    <><path d="M3 3v18h18"/><path d="M7 14l3-3 3 2 4-5"/></>,
  ];
  return (
    <section className={`py-28 px-5 border-t ${bd?'border-zinc-900':'border-zinc-100'}`} style={{zIndex:3}}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className={`${bd?'badge-dark':'badge-light'} mb-5 reveal inline-block`}>{tg.badge}</div>
          <h2 className={`text-[clamp(30px,4.5vw,56px)] font-black tracking-tight reveal ${bd?'text-white':'text-zinc-900'}`}>{tg.h}</h2>
          <p className={`text-base max-w-xl mx-auto mt-4 reveal ${bd?'text-zinc-500':'text-zinc-400'}`}>{tg.sub}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tg.items.map((it,i)=>(
            <div key={i} className={`guarantee-card rounded-2xl p-7 glow-card reveal d${i+1} ${bd?'card-dark':'card-light'}`}>
              <div className={`guarantee-icon w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${bd?'bg-zinc-800':'bg-zinc-100'}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={bd?'#a78bfa':'#7c6cf6'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons[i]}</svg>
              </div>
              <h3 className={`text-lg font-black mb-2 ${bd?'text-white':'text-zinc-900'}`}>{it.t}</h3>
              <p className={`text-sm leading-relaxed ${bd?'text-zinc-500':'text-zinc-400'}`}>{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQSection = ({ t, dark: bd }) => {
  const tf = t.faq;
  const ta = tf.assist;
  const [open,setOpen]=useState(0);
  const [q,setQ]=useState('');
  const [ans,setAns]=useState(null);
  const [typed,setTyped]=useState('');
  const [thinking,setThinking]=useState(false);
  const timer=useRef(null); const think=useRef(null);
  const ask=(text)=>{
    const raw = text!=null ? text : q;
    const query=(raw||'').toLowerCase().trim();
    if(!query)return;
    if(text!=null)setQ(text);
    let best=null,score=0;
    for(const e of tf.kb){ let s=0; for(const k of e.k){ if(query.includes(k)) s+=k.length; } if(s>score){score=s;best=e;} }
    const answer = score>0 ? best.a : ta.fallback;
    clearInterval(timer.current); clearTimeout(think.current);
    setThinking(true); setAns(null); setTyped('');
    think.current=setTimeout(()=>{
      setThinking(false); setAns({matched:score>0});
      let i=0;
      timer.current=setInterval(()=>{ i+=2; setTyped(answer.slice(0,i)); if(i>=answer.length)clearInterval(timer.current); },14);
    },520);
  };
  useEffect(()=>()=>{clearInterval(timer.current);clearTimeout(think.current);},[]);
  return (
    <section id="faq" className={`py-28 px-5 border-t ${bd?'border-zinc-900':'border-zinc-100'}`} style={{zIndex:3}}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className={`${bd?'badge-dark':'badge-light'} mb-5 reveal inline-block`}>{tf.badge}</div>
          <h2 className={`text-[clamp(30px,4.5vw,56px)] font-black tracking-tight reveal ${bd?'text-white':'text-zinc-900'}`}>{tf.h}</h2>
        </div>

        {/* ── Knowledge Assistant ── */}
        <div className={`faq-assist rounded-2xl p-6 mb-12 reveal ${bd?'card-dark':'card-light'}`}>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="faq-orb" aria-hidden="true"/>
            <span className={`text-sm font-bold ${bd?'text-white':'text-zinc-900'}`}>{ta.title}</span>
          </div>
          <form onSubmit={e=>{e.preventDefault();ask();}} className="flex gap-2">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder={ta.placeholder} aria-label={ta.title}
              autoComplete="off" spellCheck={false}
              className={`flex-1 px-4 py-3 rounded-xl text-sm ${bd?'inp-dark':'inp-light'}`}/>
            <button type="submit" aria-label={ta.send}
              className="btn-p px-5 rounded-xl flex items-center justify-center cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
          <div className="flex flex-wrap gap-2 mt-3">
            {ta.chips.map((c,i)=>(
              <button key={i} onClick={()=>ask(c)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium cursor-pointer transition-all duration-200 ${bd?'bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800':'bg-zinc-100 text-zinc-500 hover:text-zinc-900'}`}>{c}</button>
            ))}
          </div>
          {(thinking||ans)&&(
            <div className={`faq-answer mt-4 p-4 rounded-xl text-sm leading-relaxed ${bd?'bg-zinc-900/70 text-zinc-300':'bg-zinc-50 text-zinc-600'}`} aria-live="polite">
              {thinking
                ? <span className="faq-think"><span/><span/><span/></span>
                : <>{typed}<span className="faq-caret" aria-hidden="true"/></>}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {tf.items.map((it,i)=>{
            const isOpen=open===i;
            return (
              <div key={i} className={`faq-item rounded-2xl reveal d${(i%6)+1} ${bd?'card-dark':'card-light'}`}>
                <button onClick={()=>setOpen(isOpen?-1:i)} aria-expanded={isOpen} className={`w-full flex items-center justify-between gap-4 text-left px-6 py-5 cursor-pointer ${bd?'text-white':'text-zinc-900'}`}>
                  <span className="font-bold text-base">{it.q}</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,transform:isOpen?'rotate(45deg)':'none',transition:'transform .3s cubic-bezier(.4,0,.2,1)'}}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <div className="faq-body" style={{maxHeight:isOpen?'260px':'0',opacity:isOpen?1:0}}>
                  <p className={`px-6 pb-5 text-sm leading-relaxed ${bd?'text-zinc-400':'text-zinc-500'}`}>{it.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const MasteryOrbit = ({ t, dark: bd }) => {
  const to = t.orbit;
  const tiltRef = useRef(null);
  const stageRef = useRef(null);
  const viewportRef = useRef(null);
  const dragging = useRef(false);

  useEffect(() => {
    const tilt = tiltRef.current;
    const stage = stageRef.current;
    const vp = viewportRef.current;
    if (!tilt || !stage || !vp) return;

    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Static tilted ring for reduced motion: no rAF, no auto-rotate, no drag.
    if (reduce) {
      stage.style.transform = 'rotateY(0deg)';
      tilt.style.setProperty('--tilt', '-10deg');
      return;
    }

    const AUTO = 9;        // deg/sec idle auto-rotation
    const sec = tilt.closest('.orbit-section');

    let rot = 0;           // current rotateY (deg)
    let vel = AUTO;        // angular velocity (deg/sec)
    let last = performance.now();
    let raf = 0;

    // Pointer drag state
    let activeId = null;
    let lastX = 0;
    let lastT = 0;
    let dragVel = 0;       // velocity sampled while dragging (deg/sec)
    const DEG_PER_PX = 0.35;

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05); // clamp to avoid jank after tab switch
      last = now;
      if (!dragging.current) {
        rot += vel * dt;
        // Ease velocity back toward idle auto-rotation (inertia decay).
        vel += (AUTO - vel) * Math.min(dt * 2.6, 1);
      }
      stage.style.transform = `rotateY(${rot}deg)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Mouse tilt (kept) — pointermove on the section, skipped while dragging.
    const onTilt = (e) => {
      if (dragging.current) return;
      const r = sec.getBoundingClientRect();
      const y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.setProperty('--tilt', (-y * 16 - 8) + 'deg');
    };
    sec.addEventListener('pointermove', onTilt, { passive: true });

    const onDown = (e) => {
      activeId = e.pointerId;
      dragging.current = true;
      vp.classList.add('orbit-grabbing');
      lastX = e.clientX;
      lastT = performance.now();
      dragVel = 0;
      try { vp.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!dragging.current || e.pointerId !== activeId) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dts = Math.max((now - lastT) / 1000, 0.001);
      const dDeg = dx * DEG_PER_PX;
      rot += dDeg;
      dragVel = dDeg / dts; // deg/sec, for release momentum
      lastX = e.clientX;
      lastT = now;
      e.preventDefault();
    };
    const onUp = (e) => {
      if (e.pointerId !== activeId) return;
      dragging.current = false;
      vp.classList.remove('orbit-grabbing');
      activeId = null;
      try { vp.releasePointerCapture(e.pointerId); } catch (_) {}
      // Hand the drag's exit velocity to the inertia loop (clamped).
      vel = Math.max(-1200, Math.min(1200, dragVel || AUTO));
    };

    vp.addEventListener('pointerdown', onDown);
    vp.addEventListener('pointermove', onMove);
    vp.addEventListener('pointerup', onUp);
    vp.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(raf);
      sec.removeEventListener('pointermove', onTilt);
      vp.removeEventListener('pointerdown', onDown);
      vp.removeEventListener('pointermove', onMove);
      vp.removeEventListener('pointerup', onUp);
      vp.removeEventListener('pointercancel', onUp);
    };
  }, []);

  const items = to.items, n = items.length, R = 270;
  const icons = [
    <><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    <><path d="M3 3v18h18"/><path d="M7 14l3-4 3 2 4-6"/></>,
    <><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M3 9h18"/></>,
    <><path d="M12 2l3 7 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5 9 9z"/></>,
    <><path d="M4 5h16"/><path d="M4 12h10"/><path d="M4 19h7"/></>,
    <><path d="M18 8a6 6 0 0 1-6 6 6 6 0 0 1-6-6"/><circle cx="12" cy="6" r="3"/><path d="M9 20h6"/></>,
    <><path d="M3 12h4l3 8 4-16 3 8h4"/></>,
    <><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 7v5l3 2"/></>,
  ];
  return (
    <section className={`orbit-section border-t ${bd?'border-zinc-900':'border-zinc-100'}`} style={{zIndex:3,position:'relative'}}>
      <div className="max-w-7xl mx-auto px-5 text-center">
        <div className={`${bd?'badge-dark':'badge-light'} mb-5 reveal inline-block`}>{to.badge}</div>
        <h2 className={`text-[clamp(30px,4.5vw,56px)] font-black tracking-tight reveal ${bd?'text-white':'text-zinc-900'}`}>{to.h}</h2>
        <p className={`text-base max-w-xl mx-auto mt-4 mb-12 reveal ${bd?'text-zinc-500':'text-zinc-400'}`}>{to.sub}</p>
        <div ref={viewportRef} className="orbit-viewport reveal" role="group" aria-label={to.h} style={{touchAction:'pan-y'}}>
          <div className="orbit-core" aria-hidden="true"><Logo size={54}/></div>
          <div ref={tiltRef} className="orbit-tilt">
            <div ref={stageRef} className="orbit-stage">
              {items.map((it,i)=>(
                <div key={i} className={`orbit-card ${bd?'glass-dark':'glass-light'}`}
                  style={{transform:`rotateY(${i*(360/n)}deg) translateZ(${R}px)`}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={bd?'#8b7cff':'#5a46d2'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[i]}</svg>
                  <span className={bd?'text-white':'text-zinc-900'}>{it}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={`text-xs mt-12 reveal ${bd?'text-zinc-600':'text-zinc-400'}`} style={{letterSpacing:'.2em',textTransform:'uppercase',fontWeight:600}}>{to.hint}</div>
      </div>
    </section>
  );
};

const LeistungenPage = ({ dark: bd, t, navigate }) => {
  const tl = t.leistungen;
  return (
    <div className="page-enter pt-24 pb-20 px-5" style={{zIndex:3,position:'relative'}}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 reveal">
          <div className={`${bd?'badge-dark':'badge-light'} mb-6`}>{tl.badge}</div>
          <h1 className={`text-[clamp(38px,6.5vw,76px)] font-black tracking-tight mb-6 ${bd?'text-white':'text-zinc-900'}`}>{tl.h}</h1>
          <p className={`text-xl max-w-2xl leading-relaxed ${bd?'text-zinc-400':'text-zinc-500'}`}>{tl.sub}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5 mb-16">
          {tl.services.map((s,i)=>(
            <div key={i} className={`rounded-2xl p-8 glow-card reveal d${(i%6)+1} ${bd?'card-dark':'card-light'}`}>
              <div className={`text-xs font-bold tracking-widest uppercase mb-3 ${bd?'text-zinc-600':'text-zinc-400'}`}>0{i+1}</div>
              <h3 className={`text-2xl font-black mb-3 ${bd?'text-white':'text-zinc-900'}`}>{s.t}</h3>
              <p className={`text-sm leading-relaxed mb-5 ${bd?'text-zinc-400':'text-zinc-500'}`}>{s.d}</p>
              <div className="flex flex-wrap gap-2">{s.tags.map(tag=>(<span key={tag} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${bd?'bg-zinc-800/80 text-zinc-400':'bg-zinc-100 text-zinc-500'}`}>{tag}</span>))}</div>
            </div>
          ))}
        </div>
        <div className={`rounded-2xl p-10 text-center reveal ${bd?'glass-dark':'glass-light'}`} style={{border:bd?'1px solid rgba(255,255,255,0.1)':'1px solid rgba(0,0,0,0.08)'}}>
          <h3 className={`text-2xl font-black mb-3 ${bd?'text-white':'text-zinc-900'}`}>{tl.cta_h}</h3>
          <p className={`text-sm mb-6 ${bd?'text-zinc-400':'text-zinc-500'}`}>{tl.cta_sub}</p>
          <button onClick={()=>navigate('#contact')} className="btn-p px-8 py-3.5 rounded-full font-bold text-sm cursor-pointer">{tl.cta}</button>
        </div>
      </div>
    </div>
  );
};

const BranchenPage = ({ dark: bd, t, navigate }) => {
  const tb = t.branchen;
  const [sel,setSel]=useState(0);
  const it=tb.items[sel]||tb.items[0];
  return (
    <div className="page-enter pt-24 pb-20 px-5" style={{zIndex:3,position:'relative'}}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-14 reveal">
          <div className={`${bd?'badge-dark':'badge-light'} mb-6`}>{tb.badge}</div>
          <h1 className={`text-[clamp(38px,6.5vw,76px)] font-black tracking-tight mb-6 ${bd?'text-white':'text-zinc-900'}`}>{tb.h}</h1>
          <p className={`text-xl max-w-2xl leading-relaxed ${bd?'text-zinc-400':'text-zinc-500'}`}>{tb.sub}</p>
        </div>
        <div className="grid lg:grid-cols-12 gap-5 mb-16">
          <div className="lg:col-span-4 flex flex-col gap-2 reveal-l">
            {tb.items.map((x,i)=>(
              <button key={i} onClick={()=>setSel(i)} className={`text-left px-5 py-4 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${i===sel?(bd?'bg-white text-zinc-900':'bg-zinc-900 text-white'):(bd?'card-dark text-zinc-300 hover:text-white':'card-light text-zinc-600 hover:text-zinc-900')}`}>
                {x.t}
                <span className={`text-xs font-black ${i===sel?'opacity-50':'text-zinc-600'}`}>0{i+1}</span>
              </button>
            ))}
          </div>
          <div className="lg:col-span-8 reveal-r">
            <div key={sel} className={`rounded-2xl p-8 glow-card anim-fade ${bd?'card-dark':'card-light'}`}>
              <h2 className={`text-3xl font-black mb-6 ${bd?'text-white':'text-zinc-900'}`}>{it.t}</h2>
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div><div className={`text-xs font-bold tracking-widest uppercase mb-2 ${bd?'text-zinc-600':'text-zinc-400'}`}>{tb.painLabel}</div><p className={`text-sm leading-relaxed ${bd?'text-zinc-400':'text-zinc-500'}`}>{it.pain}</p></div>
                <div><div className={`text-xs font-bold tracking-widest uppercase mb-2 ${bd?'text-zinc-600':'text-zinc-400'}`}>{tb.approachLabel}</div><p className={`text-sm leading-relaxed ${bd?'text-zinc-400':'text-zinc-500'}`}>{it.approach}</p></div>
              </div>
              <div className={`rounded-xl p-5 mb-6 ${bd?'bg-zinc-900/60':'bg-zinc-50'}`}>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black g-text">{it.result}</span>
                  <span className={`text-sm ${bd?'text-zinc-500':'text-zinc-400'}`}>{it.resultLabel}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">{it.tags.map(tag=>(<span key={tag} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${bd?'bg-zinc-800/80 text-zinc-400':'bg-zinc-100 text-zinc-500'}`}>{tag}</span>))}</div>
            </div>
          </div>
        </div>
        <div className={`rounded-2xl p-10 text-center reveal ${bd?'glass-dark':'glass-light'}`} style={{border:bd?'1px solid rgba(255,255,255,0.1)':'1px solid rgba(0,0,0,0.08)'}}>
          <h3 className={`text-2xl font-black mb-3 ${bd?'text-white':'text-zinc-900'}`}>{tb.cta_h}</h3>
          <p className={`text-sm mb-6 ${bd?'text-zinc-400':'text-zinc-500'}`}>{tb.cta_sub}</p>
          <button onClick={()=>navigate('#contact')} className="btn-p px-8 py-3.5 rounded-full font-bold text-sm cursor-pointer">{tb.cta}</button>
        </div>
      </div>
    </div>
  );
};

const KontaktPage = ({ dark: bd, t }) => {
  const tk = t.kontaktpage;
  return (
    <div className="page-enter" style={{zIndex:3,position:'relative'}}>
      <div className="pt-24 pb-2 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 reveal">
            <div className={`${bd?'badge-dark':'badge-light'} mb-6`}>{tk.badge}</div>
            <h1 className={`text-[clamp(38px,6.5vw,76px)] font-black tracking-tight mb-6 ${bd?'text-white':'text-zinc-900'}`}>{tk.h}</h1>
            <p className={`text-xl max-w-2xl leading-relaxed ${bd?'text-zinc-400':'text-zinc-500'}`}>{tk.sub}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {tk.channels.map((c,i)=>(
              <div key={i} className={`rounded-2xl p-6 reveal d${i+1} ${bd?'card-dark':'card-light'}`}>
                <div className={`text-xs font-semibold tracking-widest uppercase mb-2 ${bd?'text-zinc-600':'text-zinc-400'}`}>{c.t}</div>
                <div className={`text-base font-bold ${bd?'text-white':'text-zinc-900'}`}>{c.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ContactSection t={t} dark={bd}/>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   SHARED RUNNER — CodeRunner
   Sandboxed iframe for HTML/JS (srcDoc), Pyodide-on-demand for Python.
   Reused by TutorialsPage AND any future CodeLab page.
   Place this block ABOVE TutorialsPage in app.jsx.
   No imports — React hooks are globals per project convention.
   ───────────────────────────────────────────────────────────── */

/* Pyodide is loaded lazily & cached on window so multiple runners share it. */
function loadPyodideOnce(onLog){
  if(window.__bsPyodide) return window.__bsPyodide;
  window.__bsPyodide = new Promise((resolve,reject)=>{
    const boot=()=>{
      if(!window.loadPyodide){reject(new Error('Pyodide-Loader nicht verfügbar'));return;}
      window.loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/'})
        .then(py=>resolve(py)).catch(reject);
    };
    if(window.loadPyodide){boot();return;}
    onLog&&onLog('· Python-Laufzeit wird geladen …');
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
    s.onload=boot;
    s.onerror=()=>reject(new Error('Python-Laufzeit konnte nicht geladen werden'));
    document.head.appendChild(s);
  });
  return window.__bsPyodide;
}

/* lang: 'html' | 'js' | 'python' */
const CodeRunner = ({ dark: bd, lang='html', starter='', runLabel='Run', resetLabel='Reset', editLabel='Code', outLabel='Output', height=200 }) => {
  const [code,setCode]=useState(starter);
  const [out,setOut]=useState('');        // for js/python text output
  const [srcDoc,setSrcDoc]=useState('');  // for html/canvas iframe
  const [busy,setBusy]=useState(false);
  const taRef=useRef(null);

  useEffect(()=>{ setCode(starter); setOut(''); setSrcDoc(''); },[starter]);

  // Tab key inserts two spaces instead of moving focus
  const onKey=(e)=>{
    if(e.key==='Tab'){
      e.preventDefault();
      const el=e.target, s=el.selectionStart, en=el.selectionEnd;
      const next=code.slice(0,s)+'  '+code.slice(en);
      setCode(next);
      requestAnimationFrame(()=>{el.selectionStart=el.selectionEnd=s+2;});
    }
  };

  const reset=()=>{ setCode(starter); setOut(''); setSrcDoc(''); };

  const run=async()=>{
    setOut(''); setSrcDoc(''); setBusy(true);
    try{
      if(lang==='html'){
        // Full document or fragment — both work via srcDoc in a sandboxed iframe
        const doc = /<html|<!doctype/i.test(code)
          ? code
          : `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;font-family:system-ui,sans-serif;background:#fff;color:#111}</style></head><body>${code}</body></html>`;
        setSrcDoc(doc);
      } else if(lang==='js'){
        // Capture console.* into the output pane, sandboxed inside the iframe
        const doc=`<!doctype html><html><head><meta charset="utf-8"></head><body><script>
          (function(){
            var send=function(t){parent.postMessage({__bsRunner:1,line:t},'*');};
            ['log','info','warn','error'].forEach(function(k){
              var orig=console[k];
              console[k]=function(){
                send(Array.prototype.map.call(arguments,function(a){
                  try{return typeof a==='object'?JSON.stringify(a):String(a);}catch(e){return String(a);}
                }).join(' '));
                orig&&orig.apply(console,arguments);
              };
            });
            window.onerror=function(m){send('⚠ '+m);};
            try{ ${' CODE '} }catch(e){send('⚠ '+e.message);}
          })();
        <\/script></body></html>`.replace(' CODE ', code);
        // one-shot message listener
        const lines=[];
        const onMsg=(ev)=>{ if(ev.data&&ev.data.__bsRunner){ lines.push(ev.data.line); setOut(lines.join('\n')); } };
        window.addEventListener('message',onMsg);
        setSrcDoc(doc);
        setTimeout(()=>window.removeEventListener('message',onMsg),3000);
      } else if(lang==='python'){
        setOut('· '+runLabel+' …');
        const py=await loadPyodideOnce((m)=>setOut(m));
        let buf='';
        py.setStdout({batched:(s)=>{buf+=s+'\n'; setOut(buf);}});
        py.setStderr({batched:(s)=>{buf+='⚠ '+s+'\n'; setOut(buf);}});
        try{
          const res=await py.runPythonAsync(code);
          if(buf==='' && res!==undefined && res!==null) setOut(String(res));
          else if(res!==undefined && res!==null) setOut(buf+String(res));
        }catch(e){ setOut(buf+'⚠ '+(e.message||String(e))); }
      }
    }catch(e){ setOut('⚠ '+(e.message||String(e))); }
    finally{ setBusy(false); }
  };

  const isVisual = lang==='html';
  return (
    <div className={`coderunner rounded-2xl overflow-hidden border ${bd?'cr-dark':'cr-light'}`}>
      <div className={`flex items-center justify-between px-4 py-2.5 border-b ${bd?'border-zinc-800':'border-zinc-200'}`}>
        <div className="flex items-center gap-1.5">
          <span className="cr-dot" style={{background:'#ff5f57'}}/>
          <span className="cr-dot" style={{background:'#febc2e'}}/>
          <span className="cr-dot" style={{background:'#28c840'}}/>
          <span className={`ml-2 text-[11px] font-semibold tracking-widest uppercase ${bd?'text-zinc-500':'text-zinc-400'}`}>{editLabel} · {lang}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reset} className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer ${bd?'text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600':'text-zinc-500 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300'}`}>{resetLabel}</button>
          <button onClick={run} disabled={busy} className="btn-p text-xs px-4 py-1.5 rounded-full font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            {busy?'…':runLabel}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <textarea
          ref={taRef}
          value={code}
          onChange={e=>setCode(e.target.value)}
          onKeyDown={onKey}
          spellCheck={false}
          className={`cr-editor w-full p-4 font-mono text-[13px] leading-relaxed resize-none outline-none ${bd?'bg-transparent text-zinc-200':'bg-transparent text-zinc-800'}`}
          style={{minHeight:height}}
        />
        <div className={`cr-output border-t lg:border-t-0 lg:border-l ${bd?'border-zinc-800':'border-zinc-200'}`} style={{minHeight:height}}>
          {isVisual
            ? <iframe title="preview" sandbox="allow-scripts" srcDoc={srcDoc} className="w-full h-full" style={{minHeight:height,border:'0',background:'#fff'}}/>
            : <>
                {/* Hidden runner iframe for JS console capture */}
                {lang==='js' && srcDoc && <iframe title="js-runner" sandbox="allow-scripts" srcDoc={srcDoc} style={{display:'none'}}/>}
                <pre className={`p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap m-0 ${bd?'text-emerald-300':'text-emerald-700'}`} style={{minHeight:height}}>
                  {out || <span className={bd?'text-zinc-600':'text-zinc-400'}>{outLabel} →</span>}
                </pre>
              </>}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   TUTORIALS PAGE — route key 'tutorials', i18n key t.tut
   ───────────────────────────────────────────────────────────── */
const TutorialsPage = ({ dark: bd, t }) => {
  const tt = t.tut;

  // Difficulty tiers -> visual style
  const diffStyle = {
    1:{label:tt.d_easy,   ring:'#22c55e'},
    2:{label:tt.d_easy,   ring:'#22c55e'},
    3:{label:tt.d_mid,    ring:'#eab308'},
    4:{label:tt.d_mid,    ring:'#eab308'},
    5:{label:tt.d_hard,   ring:'#f97316'},
    6:{label:tt.d_expert, ring:'#ef4444'},
  };

  // Lesson code starters — kept in component (code, not copy)
  const starters = {
    1:`<h1>Hallo Welt</h1>
<p>Meine erste Webseite.</p>
<button onclick="alert('Es lebt!')">Klick mich</button>`,
    2:`<style>
  .grid{display:grid;gap:12px;
        grid-template-columns:repeat(auto-fit,minmax(120px,1fr))}
  .card{padding:24px;border-radius:14px;
        background:linear-gradient(135deg,#3f3f46,#18181b);
        color:#fff;font-family:system-ui;text-align:center}
</style>
<div class="grid">
  <div class="card">1</div>
  <div class="card">2</div>
  <div class="card">3</div>
  <div class="card">4</div>
</div>`,
    3:`// DOM + Events: zähle Klicks
let count = 0;
console.log("Start bei " + count);
function click(){ count++; console.log("Klicks: " + count); }
click(); click(); click();
console.log("Fertig.");`,
    4:`// Async + fetch: echte HTTP-Anfrage
async function run(){
  const res = await fetch('https://api.github.com/repos/facebook/react');
  const data = await res.json();
  console.log("Repo:  " + data.full_name);
  console.log("Stars: " + data.stargazers_count.toLocaleString());
}
run().catch(e => console.log("Fehler: " + e.message));`,
    5:`# Ein echter Algorithmus: Quicksort
def quicksort(a):
    if len(a) <= 1:
        return a
    pivot = a[len(a)//2]
    left  = [x for x in a if x < pivot]
    mid   = [x for x in a if x == pivot]
    right = [x for x in a if x > pivot]
    return quicksort(left) + mid + quicksort(right)

data = [9, 3, 7, 1, 8, 2, 5, 4, 6, 0]
print("Vorher: ", data)
print("Nachher:", quicksort(data))`,
    6:`<canvas id="c" width="320" height="200"
        style="background:#0a0a0c;border-radius:12px"></canvas>
<script>
const ctx = c.getContext('2d');
let t = 0;
function frame(){
  ctx.clearRect(0,0,320,200);
  for(let i=0;i<60;i++){
    const x = 160 + Math.cos(t/30 + i/3)*120;
    const y = 100 + Math.sin(t/20 + i/4)*70;
    ctx.fillStyle = 'hsl(' + (i*6 + t) + ',80%,60%)';
    ctx.beginPath(); ctx.arc(x,y,3,0,7); ctx.fill();
  }
  t++; requestAnimationFrame(frame);
}
frame();
<\/script>`,
  };

  // lang per lesson for the runner
  const langOf = {1:'html',2:'html',3:'js',4:'js',5:'python',6:'html'};

  return (
    <div className="page-enter pt-24 pb-20 px-5" style={{zIndex:3,position:'relative'}}>
      <div className="max-w-5xl mx-auto">

        {/* Hero */}
        <div className="mb-16 reveal">
          <div className={`${bd?'badge-dark':'badge-light'} mb-6`}>{tt.badge}</div>
          <h1 className={`text-[clamp(40px,7vw,80px)] font-black tracking-tight mb-6 ${bd?'text-white':'text-zinc-900'}`}>{tt.h}</h1>
          <p className={`text-xl max-w-2xl leading-relaxed ${bd?'text-zinc-400':'text-zinc-500'}`}>{tt.sub}</p>
          <p className={`mt-5 text-sm max-w-2xl leading-relaxed ${bd?'text-zinc-600':'text-zinc-400'}`}>{tt.note}</p>
        </div>

        {/* Lessons */}
        <div className="space-y-12">
          {tt.lessons.map((les,i)=>{
            const n=i+1; const d=diffStyle[n];
            return (
              <div key={n} className={`rounded-2xl p-6 lg:p-8 reveal ${bd?'card-dark':'card-light'}`}>
                <div className="flex items-start gap-4 mb-5">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-base font-black text-white"
                       style={{background:'linear-gradient(135deg,#3f3f46,#09090b)',border:'1px solid rgba(255,255,255,0.1)'}}>
                    {String(n).padStart(2,'0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1.5">
                      <h2 className={`text-xl lg:text-2xl font-black ${bd?'text-white':'text-zinc-900'}`}>{les.t}</h2>
                      <span className="tut-diff text-[11px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
                            style={{color:d.ring,border:`1px solid ${d.ring}55`,background:`${d.ring}14`}}>
                        {d.label}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${bd?'text-zinc-400':'text-zinc-500'}`}>{les.d}</p>
                  </div>
                </div>
                <CodeRunner
                  dark={bd}
                  lang={langOf[n]}
                  starter={starters[n]}
                  runLabel={tt.run}
                  resetLabel={tt.reset}
                  editLabel={tt.code}
                  outLabel={tt.output}
                  height={langOf[n]==='python'?180:210}
                />
              </div>
            );
          })}
        </div>

        {/* Closing CTA — the honest punchline */}
        <div className={`rounded-2xl p-10 text-center reveal mt-16 ${bd?'glass-dark':'glass-light'}`}
             style={{border:bd?'1px solid rgba(255,255,255,0.1)':'1px solid rgba(0,0,0,0.08)'}}>
          <h2 className={`text-2xl lg:text-3xl font-black mb-3 ${bd?'text-white':'text-zinc-900'}`}>{tt.cta_h}</h2>
          <p className={`text-base max-w-xl mx-auto mb-7 ${bd?'text-zinc-400':'text-zinc-500'}`}>{tt.cta_sub}</p>
          <button onClick={()=>navigate('#contact')} className="btn-p px-8 py-4 rounded-full font-bold text-sm inline-flex items-center gap-2.5 cursor-pointer">
            {tt.cta}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const CodeLab = ({ t, dark: bd }) => {
  const tl = t.codelab;
  const SNIPPETS = {
    html: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body{margin:0;font-family:system-ui,sans-serif;background:#0b0b12;
        color:#fff;display:grid;place-items:center;height:100vh}
      .card{padding:28px 34px;border-radius:18px;
        background:linear-gradient(135deg,#7c3aed,#3b82f6);
        box-shadow:0 20px 60px rgba(124,58,237,.45)}
      h1{margin:0;font-size:26px;letter-spacing:-.02em}
      p{margin:8px 0 0;opacity:.85;font-size:14px}
      button{margin-top:16px;padding:9px 18px;border:0;border-radius:10px;
        font-weight:700;cursor:pointer;background:#fff;color:#09090b}
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Hello from Blackstone</h1>
      <p id="out">Click to run live JavaScript.</p>
      <button onclick="document.getElementById('out').textContent='It runs. '+new Date().toLocaleTimeString()">
        Run JS
      </button>
    </div>
  </body>
</html>`,
    python: `# Live Python — runs in your browser via Pyodide
def fib(n):
    a, b = 0, 1
    out = []
    for _ in range(n):
        out.append(a)
        a, b = b, a + b
    return out

print("Blackstone CodeLab — Python runtime")
print("First 12 Fibonacci numbers:")
print(fib(12))

squares = [x * x for x in range(1, 8)]
print("Squares:", squares)`
  };

  const [lang, setLang] = useState('html');
  const [code, setCode] = useState(SNIPPETS.html);
  const [htmlDoc, setHtmlDoc] = useState('');
  const [pyOut, setPyOut] = useState('');
  const [pyErr, setPyErr] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | running | ready
  const pyodideRef = useRef(null);

  const switchLang = (next) => {
    if (next === lang) return;
    setLang(next);
    setCode(SNIPPETS[next]);
    setHtmlDoc('');
    setPyOut('');
    setPyErr(false);
    setStatus('idle');
  };

  const loadPyodide = useCallback(async () => {
    if (pyodideRef.current) return pyodideRef.current;
    setStatus('loading');
    const mod = await import('https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.mjs');
    const py = await mod.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/' });
    pyodideRef.current = py;
    return py;
  }, []);

  const run = useCallback(async () => {
    if (lang === 'html') {
      setHtmlDoc(code);
      setStatus('ready');
      return;
    }
    // Python
    setPyErr(false);
    setPyOut('');
    try {
      const py = await loadPyodide();
      setStatus('running');
      py.runPython(`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = sys.stdout
`);
      let runtimeErr = '';
      try {
        await py.runPythonAsync(code);
      } catch (err) {
        runtimeErr = String(err && err.message ? err.message : err);
      }
      const captured = py.runPython('sys.stdout.getvalue()');
      py.runPython('sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__');
      const combined = (captured || '') + (runtimeErr ? '\n' + runtimeErr : '');
      setPyErr(!!runtimeErr);
      setPyOut(combined.trim() ? combined : tl.empty);
      setStatus('ready');
    } catch (err) {
      setPyErr(true);
      setPyOut(tl.loadError + '\n' + String(err && err.message ? err.message : err));
      setStatus('ready');
    }
  }, [lang, code, loadPyodide, tl.empty, tl.loadError]);

  const busy = status === 'loading' || status === 'running';
  const tabBase = 'text-xs font-bold px-3.5 py-2 rounded-lg transition-all duration-200 cursor-pointer';
  const tabActive = bd ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white';
  const tabIdle = bd ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900';

  return (
    <section id="codelab" className={`py-28 px-5 border-t ${bd ? 'border-zinc-900' : 'border-zinc-100'}`} style={{ zIndex: 3 }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className={`${bd ? 'badge-dark' : 'badge-light'} mb-5 reveal inline-block`}>{tl.badge}</div>
          <h2 className={`text-[clamp(30px,4.5vw,56px)] font-black tracking-tight reveal ${bd ? 'text-white' : 'text-zinc-900'}`}>{tl.h}</h2>
          <p className={`text-base max-w-xl mx-auto mt-4 reveal ${bd ? 'text-zinc-500' : 'text-zinc-400'}`}>{tl.sub}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5 reveal">
          {/* ── Editor ── */}
          <div className={`rounded-2xl p-5 sm:p-6 flex flex-col ${bd ? 'card-dark' : 'card-light'}`}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className={`inline-flex p-1 rounded-xl ${bd ? 'bg-zinc-800/60' : 'bg-zinc-100'}`} role="tablist" aria-label={tl.langLabel}>
                <button role="tab" aria-selected={lang === 'html'} onClick={() => switchLang('html')} className={`${tabBase} ${lang === 'html' ? tabActive : tabIdle}`}>HTML</button>
                <button role="tab" aria-selected={lang === 'python'} onClick={() => switchLang('python')} className={`${tabBase} ${lang === 'python' ? tabActive : tabIdle}`}>Python</button>
              </div>
              <button onClick={run} disabled={busy} className={`btn-p px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer ${busy ? 'opacity-60 cursor-wait' : ''}`}>
                {busy
                  ? (<><span className="codelab-spin" aria-hidden="true"/>{status === 'loading' ? tl.loadingPy : tl.running}</>)
                  : (<><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>{tl.run}</>)}
              </button>
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
              aria-label={tl.editorLabel}
              className={`codelab-editor flex-1 w-full rounded-xl p-4 text-[13px] resize-none ${bd ? 'inp-dark' : 'inp-light'}`}
            />
            <p className={`text-[11px] mt-3 ${bd ? 'text-zinc-600' : 'text-zinc-400'}`}>{lang === 'python' ? tl.pyHint : tl.htmlHint}</p>
          </div>

          {/* ── Output ── */}
          <div className={`rounded-2xl p-5 sm:p-6 flex flex-col ${bd ? 'card-dark' : 'card-light'}`}>
            <div className={`text-xs font-semibold tracking-widest uppercase mb-4 ${bd ? 'text-zinc-500' : 'text-zinc-400'}`}>{tl.output}</div>

            {lang === 'html' ? (
              htmlDoc
                ? (<iframe sandbox="allow-scripts" srcDoc={htmlDoc} title={tl.output} className="codelab-frame flex-1 w-full rounded-xl"/>)
                : (<div className={`codelab-placeholder flex-1 rounded-xl ${bd ? 'bg-zinc-900/50 text-zinc-600' : 'bg-zinc-50 text-zinc-400'}`}>{tl.idleHtml}</div>)
            ) : (
              status === 'loading'
                ? (<div className={`codelab-placeholder flex-1 rounded-xl ${bd ? 'bg-zinc-900/50 text-zinc-500' : 'bg-zinc-50 text-zinc-400'}`}><span className="codelab-spin codelab-spin-dark" aria-hidden="true"/>{tl.loadingRuntime}</div>)
                : pyOut
                  ? (<pre className={`codelab-console flex-1 rounded-xl m-0 text-[13px] ${bd ? 'bg-zinc-900/70' : 'bg-zinc-50'} ${pyErr ? 'codelab-err' : (bd ? 'text-zinc-200' : 'text-zinc-800')}`}>{pyOut}</pre>)
                  : (<div className={`codelab-placeholder flex-1 rounded-xl ${bd ? 'bg-zinc-900/50 text-zinc-600' : 'bg-zinc-50 text-zinc-400'}`}>{tl.idlePy}</div>)
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const CraftSection = ({ t, dark: bd }) => {
  const tc = t.craft;
  const wrapRef = useRef(null);
  const scrollRef = useRef(null);
  const timers = useRef([]);
  const [lines, setLines] = useState([]);   // rendered log lines (full text revealed per-char)
  const [typed, setTyped] = useState('');    // currently-typing tail of the active line
  const [active, setActive] = useState(-1);  // index of line being typed
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [runId, setRunId] = useState(0);     // bump to replay

  const log = tc.log; // [{p:'$'|'✓'|'›'|'!', txt, w:weightForProgress}]
  const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const after = (ms, fn) => { const id = setTimeout(fn, ms); timers.current.push(id); return id; };

  const finish = useCallback(() => {
    clearAll();
    setLines(log.map(l => l.txt));
    setTyped(''); setActive(-1); setProgress(100); setDone(true);
  }, [log]);

  const play = useCallback(() => {
    clearAll();
    setLines([]); setTyped(''); setActive(-1); setProgress(0); setDone(false);
    if (reduce) { finish(); return; }
    let acc = 0;            // accumulated progress weight
    const total = log.reduce((s, l) => s + (l.w || 1), 0);
    let delay = 260;
    log.forEach((line, i) => {
      const isCmd = line.p === '$';
      const charStep = isCmd ? 26 : 9;          // commands type slower, output faster
      const dur = Math.min(line.txt.length * charStep, isCmd ? 900 : 520);
      after(delay, () => {
        setActive(i); setTyped('');
        // reveal char-by-char without per-char React churn: a few stepped slices
        const steps = Math.max(4, Math.round(dur / 70));
        for (let s = 1; s <= steps; s++) {
          after(Math.round((dur / steps) * s), () => setTyped(line.txt.slice(0, Math.ceil(line.txt.length * s / steps))));
        }
        after(dur + 30, () => {
          setLines(prev => [...prev, line.txt]);
          setTyped(''); setActive(-1);
          acc += (line.w || 1);
          setProgress(Math.min(100, Math.round(acc / total * 100)));
        });
      });
      delay += dur + (isCmd ? 240 : 150);
    });
    after(delay + 200, () => { setProgress(100); setDone(true); });
  }, [log, reduce, finish]);

  // Start only when scrolled into view (perf + drama); restart on replay
  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    if (reduce) { finish(); return; }
    let started = false;
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting && !started) { started = true; play(); } });
    }, { threshold: 0.35 });
    io.observe(el);
    return () => { io.disconnect(); clearAll(); };
    // eslint-disable-next-line
  }, [runId]);

  // keep the terminal scrolled to the newest line
  useEffect(() => {
    const sc = scrollRef.current; if (sc) sc.scrollTop = sc.scrollHeight;
  }, [lines, typed]);

  useEffect(() => () => clearAll(), []);

  const prefixColor = (p) => p === '✓' ? (bd ? '#34d399' : '#059669')
    : p === '$' ? (bd ? '#a78bfa' : '#7c6cf6')
    : p === '!' ? (bd ? '#fbbf24' : '#d97706')
    : (bd ? '#52525b' : '#a1a1aa');

  const renderLine = (txt, p, i, typing) => (
    <div key={i} className="craft-line" style={{ animationDelay: typing ? '0s' : '0s' }}>
      <span className="craft-pfx" style={{ color: prefixColor(p) }}>{p}</span>
      <span className={`craft-txt ${bd ? 'text-zinc-300' : 'text-zinc-700'}`}>
        {txt}{typing && <span className="craft-caret" aria-hidden="true"/>}
      </span>
    </div>
  );

  return (
    <section id="craft" className={`py-28 px-5 border-t ${bd ? 'border-zinc-900' : 'border-zinc-100'}`} style={{ zIndex: 3, position: 'relative' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className={`${bd ? 'badge-dark' : 'badge-light'} mb-5 reveal inline-block`}>{tc.badge}</div>
          <h2 className={`text-[clamp(30px,4.5vw,56px)] font-black tracking-tight reveal ${bd ? 'text-white' : 'text-zinc-900'}`}>{tc.h}</h2>
          <p className={`text-base max-w-xl mx-auto mt-4 reveal ${bd ? 'text-zinc-500' : 'text-zinc-400'}`}>{tc.sub}</p>
        </div>

        <div ref={wrapRef} className="craft-grid grid lg:grid-cols-2 gap-5 reveal">
          {/* ── Live build terminal ── */}
          <div className={`craft-term-shell rounded-2xl ${bd ? 'card-dark' : 'card-light'}`}>
            <div className={`craft-bar ${bd ? 'border-zinc-800' : 'border-zinc-100'}`}>
              <span className="craft-dots" aria-hidden="true"><i style={{ background: '#ff5f56' }}/><i style={{ background: '#ffbd2e' }}/><i style={{ background: '#27c93f' }}/></span>
              <span className={`craft-file ${bd ? 'text-zinc-500' : 'text-zinc-400'}`}>{tc.file}</span>
              <span className={`craft-pill ${done ? 'is-ok' : ''} ${bd ? 'craft-pill-dark' : 'craft-pill-light'}`}>
                <span className="craft-pill-dot"/>{done ? tc.deployed : tc.building}
              </span>
            </div>

            <div ref={scrollRef} className="craft-screen" role="log" aria-live="polite" aria-label={tc.file}>
              {lines.map((txt, i) => renderLine(txt, log[i] ? log[i].p : '›', i, false))}
              {active > -1 && log[active] && renderLine(typed, log[active].p, 'a' + active, true)}
              {done && (
                <div className={`craft-success ${bd ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {tc.shipped}
                </div>
              )}
            </div>

            <div className={`craft-progress-wrap ${bd ? 'border-zinc-800' : 'border-zinc-100'}`}>
              <div className={`craft-progress-track ${bd ? 'bg-zinc-800/70' : 'bg-zinc-100'}`}>
                <div className="craft-progress-fill" style={{ width: progress + '%' }}/>
              </div>
              <span className={`craft-pct ${bd ? 'text-zinc-500' : 'text-zinc-400'}`}>{progress}%</span>
              <button onClick={() => setRunId(r => r + 1)} className={`craft-replay cursor-pointer ${bd ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`} aria-label={tc.replay}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                {tc.replay}
              </button>
            </div>
          </div>

          {/* ── Lighthouse 100/100 reveal ── */}
          <div className={`craft-score-card rounded-2xl p-8 relative overflow-hidden ${bd ? 'card-dark' : 'card-light'} ${done ? 'is-revealed' : ''}`}>
            <div className="cta-orb" style={{ width: 240, height: 240, top: -70, right: -70, background: 'radial-gradient(circle,rgba(52,211,153,.4),transparent 70%)' }}/>
            <div className="relative">
              <div className={`text-xs font-semibold tracking-widest uppercase mb-1 ${bd ? 'text-zinc-500' : 'text-zinc-400'}`}>{tc.scoreLabel}</div>
              <div className={`text-lg font-black mb-7 ${bd ? 'text-white' : 'text-zinc-900'}`}>{tc.scoreSub}</div>
              <div className="craft-gauges">
                {tc.metrics.map((m, i) => (
                  <div key={i} className="craft-gauge" style={{ transitionDelay: (0.12 * i) + 's' }}>
                    <svg viewBox="0 0 72 72" width="72" height="72" aria-hidden="true">
                      <defs>
                        <linearGradient id={`craftRing${i}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={bd ? '#34d399' : '#10b981'}/>
                          <stop offset="100%" stopColor={bd ? '#a7f3d0' : '#059669'}/>
                        </linearGradient>
                      </defs>
                      <circle cx="36" cy="36" r="30" fill="none" stroke={bd ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)'} strokeWidth="6"/>
                      <circle className="craft-ring" cx="36" cy="36" r="30" fill="none" stroke={`url(#craftRing${i})`} strokeWidth="6" strokeLinecap="round"
                        strokeDasharray="188.5" strokeDashoffset={done ? 0 : 188.5}
                        transform="rotate(-90 36 36)" style={{ transitionDelay: (0.15 + 0.12 * i) + 's' }}/>
                    </svg>
                    <div className="craft-gauge-num g-text">100</div>
                    <div className={`craft-gauge-lbl ${bd ? 'text-zinc-500' : 'text-zinc-400'}`}>{m}</div>
                  </div>
                ))}
              </div>
              <p className={`craft-foot text-sm leading-relaxed mt-7 ${bd ? 'text-zinc-500' : 'text-zinc-400'}`}>{tc.foot}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Routing + dynamic SEO (clean paths via History API, dynamic <head>) ── */
const ORIGIN=(typeof window!=='undefined'&&window.location&&/^https?:/.test(window.location.origin||''))?window.location.origin:'https://blackstone-agency.vercel.app';
const SITE='Blackstone Agency';
const OG_IMG=ORIGIN+'/og-image.png';
const PATHS={home:'/',leistungen:'/leistungen',branchen:'/branchen',tutorials:'/tutorials',about:'/ueber-uns',portfolio:'/portfolio',kontakt:'/kontakt',blog:'/blog',karriere:'/karriere',impressum:'/impressum',datenschutz:'/datenschutz',agb:'/agb',cookies:'/cookies'};
const PAGE_BY_PATH=Object.fromEntries(Object.entries(PATHS).map(([k,v])=>[v,k]));
const LANGMETA={DE:{code:'de',locale:'de_DE'},EN:{code:'en',locale:'en_US'},ES:{code:'es',locale:'es_ES'}};
const SEO={
  DE:{
    home:{t:'Blackstone Agency — Digitalagentur für Web Design & Performance Marketing',d:'Premium-Digitalagentur für Web Design, Performance Marketing & Brand Architecture. Wir bauen digitale Marktführer.'},
    leistungen:{t:'Leistungen — Web Design, SEO & Performance Marketing | '+SITE,d:'Web Design, Performance Marketing, SEO und Brand Architecture — für messbar mehr Anfragen und Umsatz.'},
    branchen:{t:'Branchen — Spezialisierte Digitallösungen | '+SITE,d:'Maßgeschneiderte Web- & Marketing-Strategien für Ihre Branche, mit Erfahrung über viele Sektoren hinweg.'},
    tutorials:{t:'Tutorials — Code & Marketing lernen | '+SITE,d:'Kostenlose Tutorials zu Web-Entwicklung, SEO und Performance Marketing — direkt im Browser ausführbar.'},
    about:{t:'Über uns — Premium-Digitalagentur | '+SITE,d:'Wer wir sind und wie wir digitale Marktführer bauen. Strategie, Design und Technologie aus einer Hand.'},
    portfolio:{t:'Portfolio — Echte Projekte, echte Ergebnisse | '+SITE,d:'Ausgewählte Projekte und messbare Resultate aus Web Design und Performance Marketing.'},
    kontakt:{t:'Kontakt — Erstgespräch anfragen | '+SITE,d:'Kontaktieren Sie Blackstone Agency für ein unverbindliches Erstgespräch zu Ihrem Projekt.'},
    blog:{t:'Insights — Blog für Web, SEO & Marketing | '+SITE,d:'Fachartikel zu SEO, Performance Marketing, Conversion und Web Design.'},
    karriere:{t:'Karriere — Werde Teil von Blackstone | '+SITE,d:'Offene Positionen und Kultur bei Blackstone Agency.'},
    impressum:{t:'Impressum | '+SITE,d:'Impressum und Anbieterkennzeichnung der Blackstone Agency.'},
    datenschutz:{t:'Datenschutz | '+SITE,d:'Datenschutzerklärung der Blackstone Agency.'},
    agb:{t:'AGB | '+SITE,d:'Allgemeine Geschäftsbedingungen der Blackstone Agency.'},
    cookies:{t:'Cookie-Richtlinie | '+SITE,d:'Informationen zur Verwendung von Cookies bei Blackstone Agency.'},
  },
  EN:{
    home:{t:'Blackstone Agency — Digital Agency for Web Design & Performance Marketing',d:'Premium digital agency for web design, performance marketing & brand architecture. We build digital market leaders.'},
    leistungen:{t:'Services — Web Design, SEO & Performance Marketing | '+SITE,d:'Web design, performance marketing, SEO and brand architecture — for measurably more leads and revenue.'},
    branchen:{t:'Industries — Specialised Digital Solutions | '+SITE,d:'Tailored web & marketing strategies for your industry, with experience across many sectors.'},
    tutorials:{t:'Tutorials — Learn Code & Marketing | '+SITE,d:'Free tutorials on web development, SEO and performance marketing — runnable right in your browser.'},
    about:{t:'About — Premium Digital Agency | '+SITE,d:'Who we are and how we build digital market leaders. Strategy, design and technology from one team.'},
    portfolio:{t:'Portfolio — Real Projects, Real Results | '+SITE,d:'Selected projects and measurable results in web design and performance marketing.'},
    kontakt:{t:'Contact — Request a Free Consultation | '+SITE,d:'Contact Blackstone Agency for a free, no-obligation consultation about your project.'},
    blog:{t:'Insights — Blog on Web, SEO & Marketing | '+SITE,d:'In-depth articles on SEO, performance marketing, conversion and web design.'},
    karriere:{t:'Careers — Join Blackstone | '+SITE,d:'Open positions and culture at Blackstone Agency.'},
    impressum:{t:'Imprint | '+SITE,d:'Imprint and provider identification of Blackstone Agency.'},
    datenschutz:{t:'Privacy Policy | '+SITE,d:'Privacy policy of Blackstone Agency.'},
    agb:{t:'Terms & Conditions | '+SITE,d:'General terms and conditions of Blackstone Agency.'},
    cookies:{t:'Cookie Policy | '+SITE,d:'Information about the use of cookies at Blackstone Agency.'},
  },
  ES:{
    home:{t:'Blackstone Agency — Agencia Digital de Diseño Web y Marketing',d:'Agencia digital premium de diseño web, performance marketing y arquitectura de marca. Construimos líderes digitales.'},
    leistungen:{t:'Servicios — Diseño Web, SEO y Performance Marketing | '+SITE,d:'Diseño web, performance marketing, SEO y arquitectura de marca — para más clientes e ingresos medibles.'},
    branchen:{t:'Sectores — Soluciones Digitales Especializadas | '+SITE,d:'Estrategias web y de marketing a medida para tu sector, con experiencia en múltiples industrias.'},
    tutorials:{t:'Tutoriales — Aprende Código y Marketing | '+SITE,d:'Tutoriales gratuitos de desarrollo web, SEO y performance marketing — ejecutables en el navegador.'},
    about:{t:'Nosotros — Agencia Digital Premium | '+SITE,d:'Quiénes somos y cómo construimos líderes digitales. Estrategia, diseño y tecnología en un solo equipo.'},
    portfolio:{t:'Portafolio — Proyectos Reales, Resultados Reales | '+SITE,d:'Proyectos seleccionados y resultados medibles en diseño web y performance marketing.'},
    kontakt:{t:'Contacto — Solicita una Consulta Gratuita | '+SITE,d:'Contacta con Blackstone Agency para una consulta gratuita y sin compromiso sobre tu proyecto.'},
    blog:{t:'Insights — Blog de Web, SEO y Marketing | '+SITE,d:'Artículos en profundidad sobre SEO, performance marketing, conversión y diseño web.'},
    karriere:{t:'Empleo — Únete a Blackstone | '+SITE,d:'Posiciones abiertas y cultura en Blackstone Agency.'},
    impressum:{t:'Aviso Legal | '+SITE,d:'Aviso legal e identificación del prestador de Blackstone Agency.'},
    datenschutz:{t:'Privacidad | '+SITE,d:'Política de privacidad de Blackstone Agency.'},
    agb:{t:'Términos y Condiciones | '+SITE,d:'Términos y condiciones generales de Blackstone Agency.'},
    cookies:{t:'Política de Cookies | '+SITE,d:'Información sobre el uso de cookies en Blackstone Agency.'},
  },
};
const stripSlash=(p)=>{p=(p||'/').split('?')[0].split('#')[0];return (p.length>1&&p.endsWith('/'))?p.slice(0,-1):p;};
const pageFromPath=()=>PAGE_BY_PATH[stripSlash(typeof window!=='undefined'?window.location.pathname:'/')]||'home';
const initLang=()=>{try{const q=new URLSearchParams(window.location.search).get('lang');const v=(q||localStorage.getItem('lang')||'DE').toUpperCase();return LANGMETA[v]?v:'DE';}catch(e){return 'DE';}};
const _setMeta=(sel,val)=>{const el=document.querySelector(sel);if(el)el.setAttribute('content',val);};
const _upLink=(rel,hreflang,href)=>{const sel='link[rel="'+rel+'"]'+(hreflang?'[hreflang="'+hreflang+'"]':':not([hreflang])');let el=document.querySelector(sel);if(!el){el=document.createElement('link');el.setAttribute('rel',rel);if(hreflang)el.setAttribute('hreflang',hreflang);document.head.appendChild(el);}el.setAttribute('href',href);};
const applySEO=(page,lang)=>{
  const pack=SEO[lang]||SEO.DE;const m=pack[page]||pack.home;const lm=LANGMETA[lang]||LANGMETA.DE;
  const url=ORIGIN+(PATHS[page]||'/');
  document.title=m.t;
  document.documentElement.lang=lm.code;
  _setMeta('meta[name="description"]',m.d);
  _setMeta('meta[property="og:title"]',m.t);
  _setMeta('meta[property="og:description"]',m.d);
  _setMeta('meta[property="og:url"]',url);
  _setMeta('meta[property="og:locale"]',lm.locale);
  _setMeta('meta[name="twitter:title"]',m.t);
  _setMeta('meta[name="twitter:description"]',m.d);
  _setMeta('meta[property="og:image"]',OG_IMG);
  _setMeta('meta[name="twitter:image"]',OG_IMG);
  _upLink('canonical',null,url);
  _upLink('alternate','de',url);
  _upLink('alternate','en',url+'?lang=en');
  _upLink('alternate','es',url+'?lang=es');
  _upLink('alternate','x-default',url);
};

/* ═══════════ NEU: 5 Premium-Elemente ═══════════ */

// 1) Command Palette (⌘K / Ctrl+K) — Sprung zu jeder Seite/Sektion
const CommandPalette = ({ open, setOpen, t, dark:bd, navigate }) => {
  const [q,setQ]=useState('');
  const [idx,setIdx]=useState(0);
  const inputRef=useRef(null);
  const items=[
    {label:t.nav.leistungen,target:'leistungen'},
    {label:t.nav.branchen,target:'branchen'},
    {label:t.nav.cases,target:'portfolio'},
    {label:t.nav.tut,target:'tutorials'},
    {label:t.nav.about,target:'about'},
    {label:t.nav.blog,target:'blog'},
    {label:t.nav.karriere,target:'karriere'},
    {label:t.nav.services,target:'#services'},
    {label:t.nav.process,target:'#process'},
    {label:t.nav.pricing,target:'#pricing'},
    {label:t.nav.contact,target:'#contact'},
  ];
  const filtered=items.filter(i=>i.label.toLowerCase().includes(q.trim().toLowerCase()));
  useEffect(()=>{ if(open){setQ('');setIdx(0);const id=setTimeout(()=>inputRef.current&&inputRef.current.focus(),30);return ()=>clearTimeout(id);} },[open]);
  useEffect(()=>{ setIdx(0); },[q]);
  if(!open) return null;
  const go=(it)=>{ if(it){navigate(it.target);} setOpen(false); };
  const onKey=(e)=>{
    if(e.key==='ArrowDown'){e.preventDefault();setIdx(i=>Math.min(i+1,filtered.length-1));}
    else if(e.key==='ArrowUp'){e.preventDefault();setIdx(i=>Math.max(i-1,0));}
    else if(e.key==='Enter'){e.preventDefault();go(filtered[idx]);}
    else if(e.key==='Escape'){e.preventDefault();setOpen(false);}
  };
  return (
    <div className="cmdk-bg" onClick={()=>setOpen(false)}>
      <div className={`cmdk-panel ${bd?'glass-dark':'glass-light'}`} onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Command Menu">
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{borderColor:bd?'rgba(255,255,255,.08)':'rgba(0,0,0,.08)'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={bd?'#a1a1aa':'#71717a'} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)} onKeyDown={onKey} placeholder={t.x.cmdPlaceholder} className={`flex-1 bg-transparent outline-none text-sm ${bd?'text-white placeholder-zinc-500':'text-zinc-900 placeholder-zinc-400'}`}/>
          <kbd className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${bd?'bg-zinc-800 text-zinc-400':'bg-zinc-200 text-zinc-500'}`}>ESC</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length===0&&<div className={`px-3 py-6 text-center text-sm ${bd?'text-zinc-500':'text-zinc-400'}`}>{t.x.cmdEmpty}</div>}
          {filtered.map((it,i)=>(
            <button key={it.target} onMouseEnter={()=>setIdx(i)} onClick={()=>go(it)} className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors ${i===idx?(bd?'bg-white/10 text-white':'bg-black/5 text-zinc-900'):(bd?'text-zinc-300':'text-zinc-600')}`}>
              <span>{it.label}</span>
              {i===idx&&<span className={`text-xs ${bd?'text-zinc-500':'text-zinc-400'}`}>↵</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// 2) Vorher/Nachher-Slider
const BeforeAfterSlider = ({ t, dark:bd }) => {
  const tx=t.x;
  const [pos,setPos]=useState(50);
  const ref=useRef(null);
  const drag=useRef(false);
  const setFromX=(clientX)=>{ const el=ref.current; if(!el)return; const r=el.getBoundingClientRect(); let p=((clientX-r.left)/r.width)*100; setPos(Math.max(0,Math.min(100,p))); };
  useEffect(()=>{
    const move=(e)=>{ if(!drag.current)return; if(e.type==='mousemove'&&e.buttons===0){drag.current=false;return;} setFromX(e.touches?e.touches[0].clientX:e.clientX); };
    const up=()=>{drag.current=false;};
    window.addEventListener('mousemove',move); window.addEventListener('mouseup',up);
    window.addEventListener('touchmove',move,{passive:true}); window.addEventListener('touchend',up);
    return ()=>{window.removeEventListener('mousemove',move);window.removeEventListener('mouseup',up);window.removeEventListener('touchmove',move);window.removeEventListener('touchend',up);};
  },[]);
  return (
    <section className={`py-28 px-5 border-t ${bd?'border-zinc-900':'border-zinc-100'}`} style={{zIndex:3,position:'relative'}}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 reveal">
          <div className={`${bd?'badge-dark':'badge-light'} mb-5 inline-block`}>{tx.baBadge}</div>
          <h2 className={`text-[clamp(30px,4.5vw,52px)] font-black tracking-tight mb-4 ${bd?'text-white':'text-zinc-900'}`}>{tx.baH}</h2>
          <p className={`text-base max-w-xl mx-auto ${bd?'text-zinc-400':'text-zinc-500'}`}>{tx.baSub}</p>
        </div>
        <div ref={ref} className="ba-wrap reveal" onMouseDown={e=>{e.preventDefault();drag.current=true;setFromX(e.clientX);}} onTouchStart={e=>{drag.current=true;setFromX(e.touches[0].clientX);}}>
          {/* AFTER — premium */}
          <div className="ba-layer ba-after">
            <div className="bam">
              <div className="bam-bar"><span className="bam-dot" style={{background:'#ff5f57'}}/><span className="bam-dot" style={{background:'#febc2e'}}/><span className="bam-dot" style={{background:'#28c840'}}/><span className="bam-url">blackstone-agency.vercel.app</span></div>
              <div className="bam-body bam-after-body">
                <div className="bam-h g-text">We build Brands.</div>
                <div className="bam-sub">{tx.baAfterCap}</div>
                <div className="bam-row"><span className="bam-pill">Web</span><span className="bam-pill">SEO</span><span className="bam-pill">Ads</span></div>
              </div>
            </div>
            <span className="ba-tag" style={{right:14}}>{tx.baAfter}</span>
          </div>
          {/* BEFORE — dated */}
          <div className="ba-layer ba-before" style={{clipPath:`inset(0 ${100-pos}% 0 0)`}}>
            <div className="bam">
              <div className="bam-bar bam-bar-old"><span className="bam-dot" style={{background:'#b8ad97'}}/><span className="bam-dot" style={{background:'#b8ad97'}}/><span className="bam-url-old">www.alte-seite.de</span></div>
              <div className="bam-body bam-before-body">
                <div className="bam-h-old">WILLKOMMEN!</div>
                <div className="bam-cta-old">★ JETZT ANRUFEN ★</div>
                <div className="bam-link-old">Startseite · Über · Kontakt · Impressum</div>
              </div>
            </div>
            <span className="ba-tag" style={{left:14}}>{tx.baBefore}</span>
          </div>
          <div className="ba-handle" style={{left:pos+'%'}} role="slider" aria-valuenow={Math.round(pos)} aria-valuemin={0} aria-valuemax={100} aria-label={tx.baBadge} tabIndex={0} onKeyDown={e=>{if(e.key==='ArrowLeft'){e.preventDefault();setPos(p=>Math.max(0,p-4));}if(e.key==='ArrowRight'){e.preventDefault();setPos(p=>Math.min(100,p+4));}}}>
            <div className="ba-knob"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#09090b" strokeWidth="2.5"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/></svg></div>
          </div>
        </div>
      </div>
    </section>
  );
};

// 3) Sofort-Website-Audit (Lead-Magnet, Demo-Heuristik)
const AuditRing = ({ value, label, dark:bd, delay=0 }) => {
  const [v,setV]=useState(0);
  useEffect(()=>{ const id=setTimeout(()=>setV(value),delay); return ()=>clearTimeout(id); },[value,delay]);
  const r=34, c=2*Math.PI*r, off=c-(v/100)*c;
  const col=value>=80?'#10b981':value>=50?'#eab308':'#ef4444';
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{width:84,height:84}}>
        <svg width="84" height="84" viewBox="0 0 84 84" style={{transform:'rotate(-90deg)'}}>
          <circle cx="42" cy="42" r={r} fill="none" stroke={bd?'rgba(255,255,255,.1)':'rgba(0,0,0,.08)'} strokeWidth="7"/>
          <circle cx="42" cy="42" r={r} fill="none" stroke={col} strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} style={{transition:'stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)'}}/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-lg font-black" style={{color:col}}>{Math.round(v)}</div>
      </div>
      <span className={`text-xs font-semibold ${bd?'text-zinc-400':'text-zinc-500'}`}>{label}</span>
    </div>
  );
};
const SiteAuditSection = ({ t, dark:bd, navigate }) => {
  const tx=t.x;
  const [url,setUrl]=useState('');
  const [state,setState]=useState('idle');
  const [scores,setScores]=useState(null);
  const run=(e)=>{
    e.preventDefault();
    if(!/\.[a-z]{2,}/i.test(url.trim())){setState('error');return;}
    setState('loading');
    setTimeout(()=>{
      let h=0; const s=url.trim().toLowerCase(); for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;
      const mk=(seed,min)=>min+(seed%(101-min));
      setScores([mk(h,55),mk(h>>3,48),mk(h>>6,62),mk(h>>9,53)]);
      setState('done');
    },1400);
  };
  const overall=scores?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0;
  return (
    <section id="audit" className={`py-28 px-5 border-t ${bd?'border-zinc-900':'border-zinc-100'}`} style={{zIndex:3,position:'relative'}}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 reveal">
          <div className={`${bd?'badge-dark':'badge-light'} mb-5 inline-block`}>{tx.auditBadge}</div>
          <h2 className={`text-[clamp(30px,4.5vw,52px)] font-black tracking-tight mb-4 ${bd?'text-white':'text-zinc-900'}`}>{tx.auditH}</h2>
          <p className={`text-base max-w-xl mx-auto ${bd?'text-zinc-400':'text-zinc-500'}`}>{tx.auditSub}</p>
        </div>
        <form onSubmit={run} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-6 reveal">
          <input value={url} onChange={e=>{setUrl(e.target.value);if(state==='error')setState('idle');}} placeholder={tx.auditPh} aria-label={tx.auditPh} className={`${bd?'inp-dark':'inp-light'} flex-1 px-4 py-3.5 rounded-xl text-sm`}/>
          <button type="submit" disabled={state==='loading'} className="btn-p px-6 py-3.5 rounded-xl font-bold text-sm cursor-pointer disabled:opacity-60">{state==='loading'?tx.auditAnalyzing:tx.auditBtn}</button>
        </form>
        {state==='error'&&<p role="alert" className="text-center text-sm text-red-400 mb-6">{tx.auditErr}</p>}
        {state==='done'&&scores&&(
          <div className={`rounded-2xl p-8 anim-fade ${bd?'card-dark':'card-light'}`}>
            <div className="flex flex-col items-center mb-8">
              <div className="text-5xl font-black g-text mb-1">{overall}</div>
              <div className={`text-xs font-semibold uppercase tracking-wider ${bd?'text-zinc-500':'text-zinc-400'}`}>{tx.auditScoreLabel}</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
              {scores.map((s,i)=><AuditRing key={i} value={s} label={tx.auditM[i]} dark={bd} delay={i*140}/>)}
            </div>
            <ul className="space-y-2.5 mb-8 max-w-xl mx-auto">
              {tx.auditTips.map((tip,i)=>(
                <li key={i} className={`flex items-start gap-2.5 text-sm ${bd?'text-zinc-300':'text-zinc-600'}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" style={{flexShrink:0,marginTop:2}}><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            <div className="text-center">
              <button onClick={()=>navigate('#contact')} className="btn-p px-7 py-3.5 rounded-full font-bold text-sm cursor-pointer">{tx.auditCta}</button>
              <p className={`text-xs mt-4 ${bd?'text-zinc-600':'text-zinc-400'}`}>{tx.auditDisc}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// 4) Tech-Stack-Marquee
const TechStackMarquee = ({ t, dark:bd }) => {
  const items=['React','Next.js','TypeScript','Tailwind','Node.js','GA4','Meta Ads','Google Ads','Figma','WordPress','Shopify','Webflow','Vercel','SEO'];
  const row=[...items,...items];
  return (
    <section className={`py-14 border-y overflow-hidden ${bd?'border-zinc-900':'border-zinc-100'}`} style={{zIndex:3,position:'relative'}}>
      <p className={`text-center text-xs font-semibold uppercase tracking-widest mb-7 ${bd?'text-zinc-600':'text-zinc-400'}`}>{t.x.stackH}</p>
      <div className="marquee-mask">
        <div className="marquee-track">
          {row.map((it,i)=><span key={i} className={`mq-item ${bd?'text-zinc-500':'text-zinc-400'}`}>{it}</span>)}
        </div>
      </div>
    </section>
  );
};

// 5) Erstgespräch-Buchung (Cal.com, lazy; Fallback = Kontakt)
const CAL_LINK=''; // TODO Owner: Cal.com-Link eintragen, z.B. 'blackstone/erstgespraech' — sonst Fallback auf Kontaktformular
const BookingSection = ({ t, dark:bd, navigate }) => {
  const tx=t.x;
  const book=()=>{
    if(!CAL_LINK){ navigate('#contact'); return; }
    try{
      if(!window.Cal){
        const s=document.createElement('script'); s.src='https://app.cal.com/embed/embed.js'; s.async=true;
        s.onload=()=>{ try{ window.Cal('init'); window.Cal('modal',{calLink:CAL_LINK}); }catch(e){ navigate('#contact'); } };
        document.body.appendChild(s);
      } else { window.Cal('modal',{calLink:CAL_LINK}); }
    }catch(e){ navigate('#contact'); }
  };
  return (
    <section className={`py-24 px-5 border-t ${bd?'border-zinc-900':'border-zinc-100'}`} style={{zIndex:3,position:'relative'}}>
      <div className={`max-w-3xl mx-auto rounded-3xl p-10 sm:p-14 text-center reveal ${bd?'glass-dark':'glass-light'}`} style={{border:bd?'1px solid rgba(255,255,255,.1)':'1px solid rgba(0,0,0,.08)'}}>
        <div className={`${bd?'badge-dark':'badge-light'} mb-5 inline-block`}>{tx.bookBadge}</div>
        <h2 className={`text-[clamp(28px,4vw,46px)] font-black tracking-tight mb-4 ${bd?'text-white':'text-zinc-900'}`}>{tx.bookH}</h2>
        <p className={`text-base max-w-lg mx-auto mb-8 ${bd?'text-zinc-400':'text-zinc-500'}`}>{tx.bookSub}</p>
        <button onClick={book} className="btn-p px-8 py-4 rounded-full font-bold text-base cursor-pointer inline-flex items-center gap-2.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {tx.bookBtn}
        </button>
      </div>
    </section>
  );
};

function App() {
  const [page,setPage]=useState(()=>pageFromPath());
  const [lang,setLang]=useState(()=>initLang());
  const [dark,setDark]=useState(()=>{try{const s=localStorage.getItem('theme');return s?s==='dark':true;}catch(e){return true;}});
  const [billing,setBilling]=useState('mo');
  const [scrolled,setScrolled]=useState(false);
  const [cookie,setCookie]=useState(()=>!sessionStorage.getItem('cookieOk'));
  const [modal,setModal]=useState(null);
  const [cmdOpen,setCmdOpen]=useState(false);
  const [activeSection,setActiveSection]=useState(0);
  useEffect(()=>{const h=(e)=>{if((e.metaKey||e.ctrlKey)&&(e.key==='k'||e.key==='K')){e.preventDefault();setCmdOpen(o=>!o);}};window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h);},[]);
  const t=T[lang];

  const sectionIds=['services','process','cases','pricing','contact'];

  const pushPath=useCallback((target)=>{
    const p=PATHS[target]||'/';
    if(stripSlash(window.location.pathname)!==stripSlash(p)){
      try{history.pushState({page:target},'',p+window.location.search);}catch(e){}
    }
  },[]);
  const navigate=useCallback((target)=>{
    if(target.startsWith('#')){
      const id=target.slice(1);
      if(page!=='home'){setPage('home');pushPath('home');setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth'}),350);}
      else{document.getElementById(id)?.scrollIntoView({behavior:'smooth'});}
      return;
    }
    setPage(target);pushPath(target);
    if(target==='home')setTimeout(()=>window.scrollTo({top:0,behavior:'smooth'}),50);
  },[page,pushPath]);

  useEffect(()=>{
    const f=()=>{
      setScrolled(window.scrollY>55);
      // Determine active section for spine
      let found=0;
      sectionIds.forEach((id,i)=>{
        const el=document.getElementById(id);
        if(el&&el.getBoundingClientRect().top<window.innerHeight*0.5)found=i+1;
      });
      setActiveSection(found);
    };
    window.addEventListener('scroll',f,{passive:true});
    return()=>window.removeEventListener('scroll',f);
  },[]);
  useEffect(()=>{initScrollProgress();initBackToTop(dark);const c=initCursorGlow(dark);initGlowCards();initMagneticBtns();return c;},[]);
  useEffect(()=>{const el=document.getElementById('cursor-glow');if(el)el.style.background=dark?'radial-gradient(circle,rgba(255,255,255,0.04) 0%,transparent 70%)':'radial-gradient(circle,rgba(0,0,0,0.03) 0%,transparent 70%)';initBackToTop(dark);},[dark]);
  useEffect(()=>{window.scrollTo({top:0,behavior:'smooth'});const c=initReveal();return c;},[page]);
  useEffect(()=>{document.body.className=dark?'page-dark':'page-light';try{localStorage.setItem('theme',dark?'dark':'light');}catch(e){}},[dark]);
  // Back/forward → sync page from URL
  useEffect(()=>{const onPop=()=>setPage(pageFromPath());window.addEventListener('popstate',onPop);return()=>window.removeEventListener('popstate',onPop);},[]);
  // Dynamic <head> (title, meta, canonical, hreflang, <html lang>) on page/lang change
  useEffect(()=>{applySEO(page,lang);},[page,lang]);
  // Persist language + reflect it in the URL (?lang=, no extra history entry)
  useEffect(()=>{try{localStorage.setItem('lang',lang);}catch(e){}const base=stripSlash(window.location.pathname)||'/';const q=lang!=='DE'?('?lang='+LANGMETA[lang].code):'';try{history.replaceState(history.state,'',base+q);}catch(e){}},[lang]);

  const goContact=()=>navigate('#contact');
  const pages={
    home:<><HeroSection t={t} dark={dark} navigate={navigate}/><TrustSection t={t} dark={dark}/><TechStackMarquee t={t} dark={dark}/><ServicesSection t={t} dark={dark} onService={svc=>setModal(svc)}/><ChipSection dark={dark}/><ProcessSection t={t} dark={dark}/><MasteryOrbit t={t} dark={dark}/><PortfolioSection t={t} dark={dark} navigate={navigate}/><BeforeAfterSlider t={t} dark={dark}/><GrowthCalculator t={t} dark={dark} navigate={navigate}/><GuaranteeSection t={t} dark={dark}/><SiteAuditSection t={t} dark={dark} navigate={navigate}/><FlowFieldSection t={t} dark={dark}/><CodeLab t={t} dark={dark}/><CraftSection t={t} dark={dark}/><BookingSection t={t} dark={dark} navigate={navigate}/><PricingSection t={t} dark={dark} billing={billing} setBilling={setBilling} navigate={navigate}/><FAQSection t={t} dark={dark}/><ContactSection t={t} dark={dark}/></>,
    about:<AboutPage dark={dark} t={t} navigate={navigate}/>,
    portfolio:<PortfolioPage t={t} dark={dark}/>,
    impressum:<ImpressumPage dark={dark}/>,
    datenschutz:<DatenschutzPage dark={dark}/>,
    agb:<AGBPage dark={dark}/>,
    cookies:<CookiesPage dark={dark}/>,
    blog:<BlogPage dark={dark}/>,
    karriere:<KarrierePage dark={dark} navigate={navigate} t={t}/>,
    leistungen:<LeistungenPage dark={dark} t={t} navigate={navigate}/>,
    branchen:<BranchenPage dark={dark} t={t} navigate={navigate}/>,
    kontakt:<KontaktPage dark={dark} t={t}/>,
    tutorials:<TutorialsPage dark={dark} t={t}/>,
  };

  return (
    <>
      <ParticleCanvas dark={dark}/>
      {page==='home'&&<Spine active={activeSection} dark={dark}/>}
      <Navigation t={t} lang={lang} setLang={setLang} dark={dark} setDark={setDark} page={page} navigate={navigate} scrolled={scrolled} openCmd={()=>setCmdOpen(true)}/>
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} t={t} dark={dark} navigate={navigate}/>
      <main style={{position:'relative',zIndex:3,minHeight:'100vh'}}>{pages[page]||pages.home}</main>
      <Footer t={t} dark={dark} navigate={navigate}/>
      {modal&&<ServiceModal svc={modal} dark={dark} onClose={()=>setModal(null)} onContact={goContact} t={t}/>}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
