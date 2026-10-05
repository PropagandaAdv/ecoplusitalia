/**
 * EcoPlus Group · Homepage
 * Componente unico React + Tailwind. Icone: solo lucide-react, strokeWidth 1.5.
 *
 * Hero cinematica scroll-driven in due atti (un unico video di 10 s, due segmenti concatenati):
 *   1. un manipolo dentale si apre in vista esplosa, un filo d'acqua scorre al suo interno;
 *   2. la camera attraversa l'apertura, entra nell'acqua ed esce in uno studio dentistico luminoso.
 * Desktop: video scrubbato dallo scroll (Blob + lerp + seek gated).
 * Mobile / tablet verticale: versione leggera, tre fotogrammi in dissolvenza guidata dallo scroll.
 * prefers-reduced-motion: immagine statica con tutti i testi, nessun video scaricato.
 *
 * Tutti i contenuti provengono da ecoplusitalia.com (ottobre 2026). Nessun dato inventato.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  AlertCircle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  Droplets,
  Facebook,
  FileText,
  FlaskConical,
  GlassWater,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Stethoscope,
  Truck,
  Wifi,
  Wrench,
  X,
  Youtube,
} from 'lucide-react';

/* ────────────────────────────────────────────────────────────── CONFIG ── */

const CONFIG = {
  /* Endpoint POST JSON per il modulo (es. Formspree o CRM). Vuoto = apre il client email con il messaggio compilato. */
  formEndpoint: '',
  email: 'info@ecoplusitalia.com',
  pec: 'ecoplus_srl@pec.it',
  phoneDisplay: '+39 051 6259183',
  phoneHref: 'tel:+390516259183',
  phoneAlt: '060',
  address: 'Via della Meccanica, 9/11/13',
  city: '40068 San Lazzaro di Savena (BO)',
  vat: 'IT 02368211203',
  sdi: 'BA6ET11',
  links: {
    dental: 'https://www.ecoplusitalia.com/Dental',
    dentalProducts: 'https://www.ecoplusitalia.com/Dental/Products',
    dentalCatalog: 'https://irp.cdn-website.com/2a00e5e2/files/uploaded/IT+Dentale+Medicale.pdf',
    aquae: 'https://www.ecoplusitalia.com/AquaeFontis',
    aquaeProducts: 'https://www.ecoplusitalia.com/AquaeFontis/Products',
    aquaeCatalog: 'https://irp.cdn-website.com/2a00e5e2/files/uploaded/Catalogo+Aquae+Fontis+2026.pdf',
    nautical: 'http://www.nauticalwateritaly.com/',
    publications: 'https://www.ecoplusitalia.com/Pubblicazioni',
    people: 'https://www.ecoplusitalia.com/People',
    privacy: 'https://www.ecoplusitalia.com/privacy',
    reserved: 'https://www.ecoplusitalia.com/ReservedArea',
    facebook: 'https://facebook.com/ecoplusitaliagroup/',
    linkedin: 'https://linkedin.com/company/ecoplusgroup/',
    youtube: 'https://www.youtube.com/channel/UCk8yGCrkS_ZdfQIg3NZ5v5Q',
  },
};

const ASSETS = {
  logo: '/assets/logo-ecoplus.png',
  heroVideo: '/assets/hero-scrub.mp4',
  heroVideoBytes: 4473642,
  heroPoster: '/assets/hero-poster.jpg',
  heroMid: '/assets/hero-mid.jpg',
  heroEnding: '/assets/hero-ending.jpg',
  heroMobile: '/assets/hero-mobile.jpg',
  dental: '/assets/linea-dentale.jpg',
  water: '/assets/linea-acqua.jpg',
  research: '/assets/ricerca.jpg',
};

/* I cinque gate dell'hero statica/leggera: identici in CSS (classi sotto) e in JS. */
const HERO_LIGHT_GATES = [
  '(max-width: 720px)',
  '(orientation: portrait) and (max-width: 1024px)',
  '(orientation: portrait) and (pointer: coarse)',
  '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)',
];
const REDUCED = '(prefers-reduced-motion: reduce)';

/* Didascalie dell'hero, ognuna con la sua banda di scroll (0..1). */
const HERO_BANDS = [
  {
    range: [0, 0.27],
    eyebrow: 'Trattamento acque · Ambito odontoiatrico',
    title: (
      <>
        L&apos;acqua del tuo riunito, <Grad>finalmente sicura</Grad>.
      </>
    ),
    text: 'Dal 2003 trattiamo e disinfettiamo l’acqua degli studi dentistici. Con un sistema brevettato e prodotto in Italia.',
    ctas: true,
  },
  {
    range: [0.3, 0.55],
    eyebrow: 'L’anello debole',
    title: (
      <>
        Lo strumento è sterile. <Grad>E l&apos;acqua che ci scorre dentro?</Grad>
      </>
    ),
    text: 'Turbine, contrangoli e ablatori escono dall’autoclave e tornano collegati al circuito idrico del riunito. Se quell’acqua è contaminata, la sterilizzazione si ferma lì.',
  },
  {
    range: [0.58, 0.79],
    eyebrow: 'Osmo Steril',
    title: (
      <>
        Osmosi inversa + <Grad>biossido di cloro</Grad>.
      </>
    ),
    text: 'Filtra l’acqua in ingresso e la disinfetta in automatico. Previene il biofilm nei circuiti e limita virus e batteri nell’aerosol.',
  },
];
const HERO_FINAL_START = 0.82;

/* ───────────────────────────────────────────────────── TOKEN DI CLASSE ── */

const CONTAINER = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8';
const EYEBROW = 'text-xs font-semibold uppercase tracking-wider sm:text-sm';
const GLASS =
  'rounded-2xl border border-white/60 bg-white/70 shadow-glass backdrop-blur-md supports-[not(backdrop-filter:blur(1px))]:bg-white/90';
const FOCUS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 focus-visible:ring-offset-white';
const BTN = `inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition duration-300 ease-out ${FOCUS}`;
const BTN_PRIMARY = `${BTN} bg-brand-blue text-white shadow-soft hover:-translate-y-0.5 hover:bg-[#0E3A73]`;
const BTN_GREEN = `${BTN} bg-brand-green text-brand-blue shadow-soft hover:-translate-y-0.5 hover:bg-[#74C232]`;
const BTN_GHOST = `${BTN} border border-slate-300 bg-white/60 text-brand-blue hover:-translate-y-0.5 hover:border-brand-blue hover:bg-white`;

/* ─────────────────────────────────────────────────────────── UTILITIES ── */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const smoothstep = (p, e0, e1) => {
  const t = clamp((p - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: window.matchMedia(REDUCED).matches ? 'auto' : 'smooth' });
  if (id === 'contatti') setTimeout(() => document.getElementById('f-nome')?.focus({ preventScroll: true }), 700);
};

/* Gradiente blu → verde solo sulle parole chiave dei titoli.
   Il verde del gradiente è #4A8A17 (verde brand scurito): #66B226 su bianco si ferma a 2,6:1. */
function Grad({ children }) {
  return (
    <span className="bg-gradient-to-r from-brand-blue to-[#4A8A17] bg-clip-text text-transparent">
      {children}
    </span>
  );
}

function useMedia(query) {
  const get = () => typeof window !== 'undefined' && window.matchMedia(query).matches;
  const [match, setMatch] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener('change', on);
    on();
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

/* Modalità hero decisa dal vivo: rotazioni, resize e preferenze la ricalcolano. */
function useHeroMode() {
  const compute = () => {
    if (typeof window === 'undefined') return 'static';
    if (window.matchMedia(REDUCED).matches) return 'static';
    if (HERO_LIGHT_GATES.some((q) => window.matchMedia(q).matches)) return 'light';
    const c = navigator.connection;
    if (c && (c.saveData || ['slow-2g', '2g', '3g'].includes(c.effectiveType))) return 'light';
    return 'scrub';
  };
  const [mode, setMode] = useState(compute);
  useEffect(() => {
    const mqls = [...HERO_LIGHT_GATES, REDUCED].map((q) => window.matchMedia(q));
    const on = () => setMode(compute());
    mqls.forEach((m) => m.addEventListener('change', on));
    return () => mqls.forEach((m) => m.removeEventListener('change', on));
  }, []);
  return mode;
}

function useInView(ref, { rootMargin = '0px 0px -12% 0px', threshold = 0.15 } = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return undefined;
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, inView, rootMargin, threshold]);
  return inView;
}

/* Entrata morbida: opacità + piccola salita. Con reduced motion è già nello stato finale. */
function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  return (
    <Tag
      ref={ref}
      className={`transition-[opacity,transform] duration-[900ms] ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms' }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* Elemento firma: il "filo d'acqua". Una linea verticale che si disegna con lo scroll
   e porta una goccia verde, come l'acqua che attraversa il circuito del riunito. */
function WaterThread({ className = '', dark = false }) {
  const ref = useRef(null);
  const pathRef = useRef(null);
  const dropRef = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const reduced = window.matchMedia(REDUCED);
    let raf = null;
    let last = -1;
    const draw = () => {
      raf = null;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = reduced.matches ? 1 : clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
      if (Math.abs(p - last) < 0.003) return;
      last = p;
      pathRef.current?.style.setProperty('stroke-dashoffset', (1 - p).toFixed(4));
      if (dropRef.current) {
        dropRef.current.style.transform = `translateY(${(p * r.height).toFixed(1)}px)`;
        dropRef.current.style.opacity = p > 0.02 && p < 0.995 ? '1' : '0';
      }
    };
    const on = () => {
      if (raf === null) raf = requestAnimationFrame(draw);
    };
    let active = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !active) {
        active = true;
        window.addEventListener('scroll', on, { passive: true });
        on();
      } else if (!e.isIntersecting && active) {
        active = false;
        window.removeEventListener('scroll', on);
      }
    });
    io.observe(el);
    window.addEventListener('resize', on);
    reduced.addEventListener('change', on);
    on();
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      reduced.removeEventListener('change', on);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={ref} aria-hidden="true" className={`pointer-events-none relative w-3 ${className}`}>
      <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 12 100">
        <line x1="6" y1="0" x2="6" y2="100" stroke={dark ? 'rgba(255,255,255,0.14)' : '#E2E8F0'} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <line
          ref={pathRef}
          x1="6"
          y1="0"
          x2="6"
          y2="100"
          pathLength="1"
          strokeDasharray="1 1"
          strokeDashoffset="1"
          stroke={dark ? '#66B226' : '#0B2D59'}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        ref={dropRef}
        className="absolute -top-1.5 left-1/2 -ml-1.5 block h-3 w-3 rounded-full bg-brand-green opacity-0 shadow-[0_0_14px_rgba(102,178,38,0.7)] transition-opacity duration-300"
      />
    </div>
  );
}

function SectionHead({ eyebrow, title, text, dark = false, center = false, id }) {
  return (
    <div className={`max-w-3xl ${center ? 'mx-auto text-center' : ''}`}>
      <Reveal as="p" className={`${EYEBROW} mb-4 ${dark ? 'text-brand-green' : 'text-[#3F7A12]'}`}>
        {eyebrow}
      </Reveal>
      <Reveal
        as="h2"
        id={id}
        delay={80}
        className={`text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl ${dark ? 'text-white' : 'text-brand-blue'}`}
      >
        {title}
      </Reveal>
      {text && (
        <Reveal
          as="p"
          delay={160}
          className={`mt-5 max-w-[60ch] text-lg font-light leading-relaxed ${center ? 'mx-auto' : ''} ${
            dark ? 'text-slate-300' : 'text-brand-ink/80'
          }`}
        >
          {text}
        </Reveal>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── HEADER ── */

const NAV = [
  { id: 'soluzioni', label: 'Soluzioni' },
  { id: 'perche-noi', label: 'Perché Ecoplus' },
  { id: 'ricerca', label: 'Ricerca' },
  { id: 'contatti', label: 'Contatti' },
];

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    let last = null;
    const on = () => {
      const s = window.scrollY > 24;
      if (s !== last) {
        last = s;
        setScrolled(s);
      }
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    panelRef.current?.querySelector('a,button')?.focus();
    const mq = window.matchMedia('(min-width: 1024px)');
    const close = () => mq.matches && setOpen(false);
    mq.addEventListener('change', close);
    return () => {
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', close);
    };
  }, [open]);

  const go = (id) => (e) => {
    e.preventDefault();
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border px-4 py-2 transition-[background-color,box-shadow,border-color] duration-500 ease-out sm:px-6 ${
          scrolled || open ? 'border-slate-200 bg-white/85 shadow-soft backdrop-blur-md' : 'border-white/50 bg-white/55 backdrop-blur-md'
        }`}
      >
        <a href="#top" onClick={go('top')} className={`flex shrink-0 items-center rounded-full ${FOCUS}`} aria-label="Ecoplus Group, torna all'inizio">
          <img src={ASSETS.logo} alt="Ecoplus Group" width="705" height="389" className="h-11 w-auto sm:h-12" />
        </a>
        <nav aria-label="Principale" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  onClick={go(n.id)}
                  className={`rounded-full px-4 py-2 text-[15px] font-semibold text-brand-ink transition-colors duration-300 hover:bg-brand-mist hover:text-brand-blue ${FOCUS}`}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <a href={CONFIG.phoneHref} className={`hidden items-center gap-2 rounded-full px-3 py-2 text-[15px] font-semibold text-brand-blue xl:flex ${FOCUS}`}>
            <Phone size={18} strokeWidth={1.5} aria-hidden="true" />
            {CONFIG.phoneDisplay}
          </a>
          <a href="#contatti" onClick={go('contatti')} className={`${BTN_PRIMARY} hidden min-h-[44px] px-5 py-2 sm:inline-flex`}>
            Contattaci
          </a>
          <button
            ref={toggleRef}
            type="button"
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-brand-blue hover:bg-brand-mist lg:hidden ${FOCUS}`}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Chiudi il menu' : 'Apri il menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>
      </div>
      <div
        id="menu-mobile"
        ref={panelRef}
        hidden={!open}
        className="mx-auto mt-2 max-w-7xl rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-glass backdrop-blur-md lg:hidden"
      >
        <nav aria-label="Menu mobile">
          <ul className="flex flex-col">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} onClick={go(n.id)} className={`flex min-h-[48px] items-center rounded-xl px-4 text-lg font-semibold text-brand-blue hover:bg-brand-mist ${FOCUS}`}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-2 grid gap-2 border-t border-slate-200 pt-3 sm:grid-cols-2">
            <a href={CONFIG.phoneHref} className={BTN_GHOST}>
              <Phone size={18} strokeWidth={1.5} aria-hidden="true" /> {CONFIG.phoneDisplay}
            </a>
            <a href="#contatti" onClick={go('contatti')} className={BTN_PRIMARY}>
              Contattaci
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

/* ──────────────────────────────────────────────────────────────── HERO ── */

function HeroCtas({ onFocus, tabbable = true }) {
  const t = tabbable ? undefined : -1;
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <a
        href="#contatti"
        tabIndex={t}
        onFocus={onFocus}
        onClick={(e) => {
          e.preventDefault();
          scrollToId('contatti');
        }}
        className={BTN_PRIMARY}
      >
        Contattaci <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
      </a>
      <a
        href="#soluzioni"
        tabIndex={t}
        onFocus={onFocus}
        onClick={(e) => {
          e.preventDefault();
          scrollToId('soluzioni');
        }}
        className={BTN_GHOST}
      >
        Scopri le soluzioni
      </a>
    </div>
  );
}

/* Contenuto finale dell'hero: il pannello glass sopra lo studio. */
function HeroFinal({ onFocus, animated = false, tabbable = true }) {
  const part = (th) =>
    animated
      ? {
          className: '[--kc:clamp(0,calc((var(--k)_-_var(--th))_*_3),1)] [opacity:var(--kc)] [transform:translateY(calc((1_-_var(--kc))_*_1.25rem))]',
          style: { '--th': th },
        }
      : { className: '', style: undefined };
  return (
    <div className={`${GLASS} max-w-xl p-6 sm:p-8 lg:p-10`}>
      <p {...part(0)} className={`${EYEBROW} mb-4 text-[#3F7A12] ${part(0).className}`}>
        Per studi, cliniche e distributori
      </p>
      <h2 {...part(0.08)} className={`text-3xl font-bold leading-[1.08] tracking-tight text-brand-blue sm:text-4xl lg:text-5xl ${part(0.08).className}`}>
        Più sicurezza per <Grad>pazienti e operatori</Grad>.
      </h2>
      <p {...part(0.22)} className={`mt-4 max-w-[46ch] text-lg font-light leading-relaxed text-brand-ink ${part(0.22).className}`}>
        Acqua ultra-pura e microbiologicamente sicura in ogni momento, senza interventi manuali quotidiani.
      </p>
      <div {...part(0.36)} className={`mt-7 ${part(0.36).className}`}>
        <HeroCtas onFocus={onFocus} tabbable={tabbable} />
      </div>
    </div>
  );
}

function HeroBandContent({ band, h1 = false }) {
  const Title = h1 ? 'h1' : 'p';
  return (
    <div className={`${GLASS} max-w-xl p-6 sm:p-8 lg:p-10`}>
      <p className={`${EYEBROW} mb-4 text-[#3F7A12] [opacity:var(--k,1)] [transform:translateY(calc((1_-_var(--k,1))_*_0.75rem))]`}>{band.eyebrow}</p>
      <Title
        id={h1 ? 'hero-title' : undefined}
        className="text-3xl font-bold leading-[1.06] tracking-tight text-brand-blue sm:text-4xl lg:text-[3.4rem] [--kc:clamp(0,calc((var(--k,1)_-_0.08)_*_2.6),1)] [opacity:var(--kc)] [transform:translateY(calc((1_-_var(--kc))_*_-1.25rem))]"
      >
        {band.title}
      </Title>
      <p className="mt-4 max-w-[46ch] text-lg font-light leading-relaxed text-brand-ink [--kc:clamp(0,calc((var(--k,1)_-_0.3)_*_2.6),1)] [opacity:var(--kc)]">
        {band.text}
      </p>
      {band.ctas && (
        <div className="mt-7 [--kc:clamp(0,calc((var(--k,1)_-_0.45)_*_3),1)] [opacity:var(--kc)] [transform:translateY(calc((1_-_var(--kc))_*_0.75rem))]">
          <HeroCtas />
        </div>
      )}
    </div>
  );
}

function HeroScrub({ onFail }) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const videoRef = useRef(null);
  const posterRef = useRef(null);
  const ringRef = useRef(null);
  const ringWrapRef = useRef(null);
  const progressRef = useRef(null);
  const cueRef = useRef(null);
  const bandRefs = useRef([]);
  const finalRef = useRef(null);
  const [finalLive, setFinalLive] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    const stage = stageRef.current;
    const ctrl = new AbortController();
    let objectUrl = null;
    let watchdog = null;
    let rafId = null;
    let lastTick = 0;
    let target = 0;
    let shown = 0;
    let heroOnScreen = true;
    let seekBusy = false;
    let pendingTime = null;
    let ready = false;
    let finalOn = false;
    const loadStart = performance.now();
    let loadK = 0;
    const cache = new Map();

    const heroProgress = () => {
      const r = section.getBoundingClientRect();
      const range = section.offsetHeight - window.innerHeight;
      return range > 0 ? clamp(-r.top / range, 0, 1) : 0;
    };
    /* Scrive nel DOM solo quando il valore cambia davvero. */
    const write = (el, key, value, fmt) => {
      if (!el) return;
      const prev = cache.get(el)?.[key];
      if (prev !== undefined && Math.abs(prev - value) < 0.004) return;
      cache.set(el, { ...(cache.get(el) || {}), [key]: value });
      fmt(el, value);
    };

    const requestSeek = (t) => {
      if (!ready || !video.duration) return;
      if (seekBusy) {
        pendingTime = t;
        return;
      }
      seekBusy = true;
      video.currentTime = t;
    };
    const onSeeked = () => {
      seekBusy = false;
      if (pendingTime !== null) {
        const t = pendingTime;
        pendingTime = null;
        requestSeek(t);
      }
    };

    const updateCaptions = (p) => {
      HERO_BANDS.forEach((band, i) => {
        const [a, b] = band.range;
        const f = Math.min(0.025, (b - a) / 3);
        const fadeIn = i === 0 ? 1 : smoothstep(p, a, a + f);
        const fadeOut = 1 - smoothstep(p, b - f, b);
        const scrollK = clamp((p - a) / Math.min(0.05, (b - a) * 0.35), 0, 1);
        const k = i === 0 ? Math.max(scrollK, loadK) : scrollK;
        const el = bandRefs.current[i];
        write(el, 'o', fadeIn * fadeOut, (e, v) => {
          e.style.opacity = v.toFixed(3);
          e.style.visibility = v < 0.01 ? 'hidden' : 'visible';
          e.style.pointerEvents = v > 0.5 ? 'auto' : 'none';
        });
        write(el, 'k', k, (e, v) => e.style.setProperty('--k', v.toFixed(3)));
      });
      const o = smoothstep(p, HERO_FINAL_START, HERO_FINAL_START + 0.03);
      const k = clamp((p - HERO_FINAL_START) / 0.1, 0, 1);
      write(finalRef.current, 'o', o, (e, v) => {
        e.style.opacity = v.toFixed(3);
        e.style.visibility = v < 0.01 ? 'hidden' : 'visible';
        e.style.pointerEvents = v > 0.5 ? 'auto' : 'none';
      });
      write(finalRef.current, 'k', k, (e, v) => e.style.setProperty('--k', v.toFixed(3)));
      const live = o > 0.5;
      if (live !== finalOn) {
        finalOn = live;
        setFinalLive(live);
      }
      write(progressRef.current, 'p', p, (e, v) => e.style.setProperty('stroke-dashoffset', (1 - v).toFixed(4)));
      write(cueRef.current, 'o', 1 - smoothstep(p, 0.02, 0.07), (e, v) => {
        e.style.opacity = v.toFixed(3);
      });
    };

    const tick = (now) => {
      const dt = Math.min(100, now - (lastTick || now));
      lastTick = now;
      loadK = easeOutCubic(clamp((now - loadStart) / 1200, 0, 1));
      const k = 0.14;
      shown += (target - shown) * (1 - Math.pow(1 - k, dt / 16.667));
      const settled = Math.abs(target - shown) < 0.0005;
      if (settled) shown = target;
      if (ready) requestSeek(shown * Math.max(0, video.duration - 0.04));
      updateCaptions(shown);
      if (settled && loadK >= 1) {
        rafId = null;
        lastTick = 0;
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };
    const kick = () => {
      if (rafId === null && heroOnScreen) rafId = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      target = heroProgress();
      kick();
    };

    /* Il loop parte acceso; l'observer serve solo a spegnerlo fuori schermo. */
    const io = new IntersectionObserver(([e]) => {
      heroOnScreen = e.isIntersecting;
      if (heroOnScreen) onScroll();
    });
    io.observe(section);

    const fail = () => {
      clearTimeout(watchdog);
      ringWrapRef.current?.classList.add('opacity-0');
      stage.dataset.state = 'failed';
      onFail?.();
    };

    /* Il video arriva come Blob: lo scrub funziona anche su host senza supporto HTTP Range. */
    const loadBlob = async () => {
      const arm = () => {
        clearTimeout(watchdog);
        watchdog = setTimeout(() => ctrl.abort(), 20000);
      };
      arm();
      const res = await fetch(ASSETS.heroVideo, { priority: 'low', signal: ctrl.signal });
      if (!res.ok || !res.body) throw new Error(`video ${res.status}`);
      const total = Number(res.headers.get('Content-Length')) || ASSETS.heroVideoBytes;
      const reader = res.body.getReader();
      const chunks = [];
      let got = 0;
      let lastRing = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        arm();
        chunks.push(value);
        got += value.length;
        const frac = Math.min(1, got / total);
        const now = performance.now();
        if (now - lastRing > 100 || frac === 1) {
          lastRing = now;
          ringRef.current?.style.setProperty('stroke-dashoffset', (1 - frac).toFixed(3));
        }
      }
      clearTimeout(watchdog);
      ringRef.current?.style.setProperty('stroke-dashoffset', '0');
      objectUrl = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }));
      video.src = objectUrl;
      video.load();
    };

    const onCanPlay = () => {
      ready = true;
      stage.dataset.state = 'ready';
      ringWrapRef.current?.classList.add('opacity-0');
      requestSeek(shown * Math.max(0, video.duration - 0.04));
    };
    const onVideoError = () => {
      seekBusy = false;
      pendingTime = null;
      if (!ready) fail();
    };

    video.addEventListener('seeked', onSeeked);
    video.addEventListener('canplay', onCanPlay, { once: true });
    video.addEventListener('error', onVideoError);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    /* Il poster vince la gara di banda: il Blob parte dopo il poster (o dopo 4 s). */
    let started = false;
    const start = () => {
      if (started || ctrl.signal.aborted) return;
      started = true;
      loadBlob().catch((err) => {
        if (err?.name === 'AbortError' && ctrl.signal.reason === 'unmount') return;
        fail();
      });
    };
    const posterImg = posterRef.current;
    if (posterImg?.complete) start();
    else posterImg?.addEventListener('load', start, { once: true });
    posterImg?.addEventListener('error', start, { once: true });
    const safety = setTimeout(start, 4000);

    onScroll();
    kick();

    return () => {
      ctrl.abort('unmount');
      clearTimeout(watchdog);
      clearTimeout(safety);
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onVideoError);
      posterImg?.removeEventListener('load', start);
      posterImg?.removeEventListener('error', start);
      if (rafId !== null) cancelAnimationFrame(rafId);
      video.removeAttribute('src');
      video.load();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [onFail]);

  /* Se il focus da tastiera arriva alle CTA finali, la hero salta al suo finale. */
  const revealFinal = useCallback(() => {
    const s = sectionRef.current;
    if (!s) return;
    const top = s.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + s.offsetHeight - window.innerHeight, behavior: 'auto' });
  }, []);

  return (
    <section ref={sectionRef} id="top" aria-labelledby="hero-title" className="relative h-[620vh] bg-brand-mist">
      <div ref={stageRef} data-state="loading" className="group/stage sticky top-0 h-[100svh] overflow-clip">
        <img
          ref={posterRef}
          src={ASSETS.heroPoster}
          alt=""
          width="1920"
          height="1080"
          fetchpriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover group-data-[state=failed]/stage:hidden"
        />
        {/* Se il video non arriva, il finale resta comunque leggibile sopra lo studio */}
        <img src={ASSETS.heroEnding} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 hidden h-full w-full object-cover group-data-[state=failed]/stage:block" />
        <video
          ref={videoRef}
          muted
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 [transform:translateZ(0)] group-data-[state=ready]/stage:opacity-100"
        />
        {/* Velo morbido a sinistra e in alto: tiene calmo lo spazio dei testi senza spegnere il video */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,246,248,0.55)_0%,rgba(244,246,248,0.18)_42%,rgba(244,246,248,0)_62%),linear-gradient(180deg,rgba(244,246,248,0.6)_0%,rgba(244,246,248,0)_18%)]"
        />

        {HERO_BANDS.map((band, i) => (
          <div
            key={band.eyebrow}
            ref={(el) => {
              bandRefs.current[i] = el;
            }}
            className="absolute inset-0 flex items-center pt-16 [--k:0]"
            style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? 'visible' : 'hidden', pointerEvents: i === 0 ? 'auto' : 'none' }}
            aria-hidden={i === 0 ? undefined : 'true'}
          >
            <div className={CONTAINER}>
              <HeroBandContent band={band} h1={i === 0} />
            </div>
          </div>
        ))}

        <div ref={finalRef} className="absolute inset-0 flex items-center pt-16 [--k:0]" style={{ opacity: 0, visibility: 'hidden', pointerEvents: 'none' }}>
          <div className={CONTAINER}>
            <HeroFinal onFocus={revealFinal} animated tabbable={finalLive} />
          </div>
        </div>

        {/* Indicatore: il filo d'acqua si riempie con lo scroll; l'anello mostra il caricamento del video */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6" aria-hidden="true">
          <div className={`${CONTAINER} flex items-center gap-4`}>
            <span ref={cueRef} className={`${EYEBROW} flex shrink-0 items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-brand-blue backdrop-blur-md`}>
              Scorri
              <ChevronDown size={18} strokeWidth={1.5} className="animate-bounce motion-reduce:animate-none" />
            </span>
            <svg width="100%" height="4" className="block overflow-visible">
              <line x1="0" y1="2" x2="100%" y2="2" stroke="rgba(11,45,89,0.15)" strokeWidth="1" />
              <line ref={progressRef} x1="0" y1="2" x2="100%" y2="2" pathLength="1" stroke="#66B226" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset="1" />
            </svg>
            <span ref={ringWrapRef} className="flex shrink-0 items-center transition-opacity duration-500">
              <svg viewBox="0 0 48 48" className="h-6 w-6 -rotate-90">
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(11,45,89,0.15)" strokeWidth="3" />
                <circle ref={ringRef} cx="24" cy="24" r="20" fill="none" stroke="#0B2D59" strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset="1" strokeLinecap="round" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Versione leggera (telefoni, tablet in verticale, connessioni lente):
   tre fotogrammi del film in dissolvenza guidata dallo scroll, nessun video. */
function HeroLight() {
  const sectionRef = useRef(null);
  const layerRefs = useRef([]);
  const capRefs = useRef([]);
  const frames = [ASSETS.heroMobile, ASSETS.heroMid, ASSETS.heroEnding];

  useEffect(() => {
    const section = sectionRef.current;
    let raf = null;
    const last = [];
    const draw = () => {
      raf = null;
      const r = section.getBoundingClientRect();
      const range = section.offsetHeight - window.innerHeight;
      const p = range > 0 ? clamp(-r.top / range, 0, 1) : 0;
      const w = [1, smoothstep(p, 0.28, 0.42), smoothstep(p, 0.62, 0.76)];
      const c = [1 - smoothstep(p, 0.24, 0.32), smoothstep(p, 0.34, 0.42) * (1 - smoothstep(p, 0.58, 0.66)), smoothstep(p, 0.7, 0.8)];
      w.forEach((v, i) => {
        if (Math.abs((last[i] ?? -1) - v) < 0.004) return;
        last[i] = v;
        const el = layerRefs.current[i];
        if (el) el.style.opacity = v.toFixed(3);
      });
      c.forEach((v, i) => {
        const key = `c${i}`;
        if (Math.abs((last[key] ?? -1) - v) < 0.004) return;
        last[key] = v;
        const el = capRefs.current[i];
        if (!el) return;
        el.style.opacity = v.toFixed(3);
        el.style.visibility = v < 0.01 ? 'hidden' : 'visible';
        el.style.transform = `translateY(${((1 - v) * 16).toFixed(1)}px)`;
      });
    };
    const on = () => {
      if (raf === null) raf = requestAnimationFrame(draw);
    };
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    draw();
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  const caps = [HERO_BANDS[0], HERO_BANDS[1]];
  return (
    <section ref={sectionRef} id="top" aria-labelledby="hero-title" className="relative h-[300svh] bg-brand-mist">
      <div className="sticky top-0 h-[100svh] overflow-clip">
        {frames.map((src, i) => (
          <img
            key={src}
            ref={(el) => {
              layerRefs.current[i] = el;
            }}
            src={src}
            alt=""
            aria-hidden="true"
            loading={i === 0 ? 'eager' : 'lazy'}
            fetchpriority={i === 0 ? 'high' : undefined}
            className="absolute inset-0 h-full w-full object-cover object-[72%_50%]"
            style={{ opacity: i === 0 ? 1 : 0 }}
          />
        ))}
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,246,248,0.1)_30%,rgba(244,246,248,0.55)_100%)]" />
        {caps.map((band, i) => (
          <div
            key={band.eyebrow}
            ref={(el) => {
              capRefs.current[i] = el;
            }}
            className="absolute inset-x-0 bottom-0 pb-6 pt-24"
            style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? 'visible' : 'hidden' }}
            aria-hidden={i === 0 ? undefined : 'true'}
          >
            <div className={CONTAINER}>
              <HeroBandContent band={band} h1={i === 0} />
            </div>
          </div>
        ))}
        <div
          ref={(el) => {
            capRefs.current[2] = el;
          }}
          className="absolute inset-x-0 bottom-0 pb-6"
          style={{ opacity: 0, visibility: 'hidden' }}
        >
          <div className={CONTAINER}>
            <HeroFinal />
          </div>
        </div>
      </div>
    </section>
  );
}

/* Reduced motion: un'unica composizione statica, tutti i messaggi visibili. */
function HeroStatic() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative bg-brand-mist">
      <div className="relative min-h-[100svh]">
        <img src={ASSETS.heroEnding} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-[72%_50%]" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,246,248,0.6)_0%,rgba(244,246,248,0.15)_60%)]" />
        <div className={`${CONTAINER} relative flex min-h-[100svh] items-center pb-12 pt-28`}>
          <HeroBandContent band={HERO_BANDS[0]} h1 />
        </div>
      </div>
    </section>
  );
}

function Hero() {
  const mode = useHeroMode();
  const [failed, setFailed] = useState(false);
  const onFail = useCallback(() => setFailed(true), []);
  if (mode === 'static') return <HeroStatic />;
  if (mode === 'light') return <HeroLight />;
  return <HeroScrub onFail={failed ? undefined : onFail} />;
}

/* ─────────────────────────────────────────────────────────── SOLUZIONI ── */

const LINES = [
  {
    id: 'dentale',
    icon: Stethoscope,
    tag: 'Linea dentale medicale',
    title: 'Osmo Steril, l’acqua sicura per tutto lo studio',
    text: 'Apparecchiature centralizzate, brevettate e prodotte in Italia, per il trattamento completo e la disinfezione automatica dell’acqua usata in tutto lo studio odontoiatrico.',
    points: ['Osmo Steril MONO, TRIO e PLURI', 'Acqua demineralizzata per autoclavi, conforme EN 1717', 'Accessori e ricambi dedicati'],
    image: ASSETS.dental,
    alt: 'Spray d’acqua limpida dalla testina di un manipolo dentale in uno studio luminoso',
    primary: { label: 'Scopri la linea dentale', href: CONFIG.links.dental },
    secondary: { label: 'Catalogo PDF', href: CONFIG.links.dentalCatalog },
  },
  {
    id: 'acqua',
    icon: GlassWater,
    tag: 'Aquae Fontis · Acqua per uso alimentare',
    title: 'L’acqua migliore è quella di casa tua',
    text: 'Depuratori a osmosi inversa collegati alla rete idrica: acqua pura, equilibrata in sali e dal gusto leggero. Per la casa, per le comunità e le aziende.',
    points: ['Depuratori sotto lavello, cabinati o a doppio corpo', 'Fontane fredda, calda o ambiente per comunità', 'Meno bottiglie di plastica, con la Drinking Revolution'],
    image: ASSETS.water,
    alt: 'Un bicchiere che si riempie di acqua limpida dal rubinetto di una cucina luminosa',
    primary: { label: 'Scopri Aquae Fontis', href: CONFIG.links.aquae },
    secondary: { label: 'Catalogo PDF', href: CONFIG.links.aquaeCatalog },
  },
];

function LineCard({ line, delay }) {
  const Icon = line.icon;
  return (
    <Reveal as="article" delay={delay} className="group h-full" aria-labelledby={`line-${line.id}`}>
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-glass">
        <div className="relative aspect-[4/3] overflow-hidden bg-brand-mist sm:aspect-[16/10]">
          <img
            src={line.image}
            alt={line.alt}
            loading="lazy"
            decoding="async"
            width="1600"
            height="1200"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
          />
          <div className={`${GLASS} absolute left-4 top-4 flex items-center gap-2 rounded-full px-4 py-2`}>
            <Icon size={20} strokeWidth={1.5} className="text-brand-blue" aria-hidden="true" />
            <span className="text-sm font-semibold text-brand-blue">{line.tag}</span>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-6 sm:p-8">
          <h3 id={`line-${line.id}`} className="text-2xl font-bold leading-tight tracking-tight text-brand-blue sm:text-[1.75rem]">
            {line.title}
          </h3>
          <p className="mt-3 max-w-[56ch] text-base font-light leading-relaxed text-brand-ink/85 sm:text-lg">{line.text}</p>
          <ul className="mt-6 space-y-3">
            {line.points.map((pt) => (
              <li key={pt} className="flex items-start gap-3 text-base text-brand-ink">
                <CheckCircle2 size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#3F7A12]" aria-hidden="true" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
            <a href={line.primary.href} target="_blank" rel="noopener noreferrer" className={BTN_PRIMARY}>
              {line.primary.label}
              <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
              <span className="sr-only">(si apre in una nuova scheda)</span>
            </a>
            <a href={line.secondary.href} target="_blank" rel="noopener noreferrer" className={`${BTN} px-4 text-brand-blue underline-offset-4 hover:underline`}>
              <FileText size={18} strokeWidth={1.5} aria-hidden="true" />
              {line.secondary.label}
              <span className="sr-only">(PDF, si apre in una nuova scheda)</span>
            </a>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function Solutions() {
  return (
    <section id="soluzioni" aria-labelledby="soluzioni-title" className="relative scroll-mt-24 bg-white py-20 sm:py-28 lg:py-32">
      <div className={`${CONTAINER} relative`}>
        <div className="flex gap-6 sm:gap-10">
          <WaterThread className="hidden h-40 shrink-0 sm:block" />
          <SectionHead
            id="soluzioni-title"
            eyebrow="Le nostre linee"
            title={
              <>
                Due linee, una sola idea: <Grad>acqua pura</Grad>.
              </>
            }
            text="Nasciamo nel trattamento dell’acqua per lo studio odontoiatrico, dove il rischio di infezioni crociate non va trascurato. Con lo stesso rigore abbiamo creato Aquae Fontis, per l’acqua da bere."
          />
        </div>
        <div className="mt-14 grid gap-6 lg:mt-16 lg:grid-cols-2 lg:gap-8">
          {LINES.map((l, i) => (
            <LineCard key={l.id} line={l} delay={i * 120} />
          ))}
        </div>
        <Reveal className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-brand-mist px-6 py-5 sm:flex-row sm:items-center">
          <p className="text-base text-brand-ink">
            <span className="font-semibold text-brand-blue">Anche in barca.</span> Con Nautical Water Italy portiamo più comfort a bordo.
          </p>
          <a href={CONFIG.links.nautical} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-[44px] items-center gap-2 rounded-full font-semibold text-brand-blue underline-offset-4 hover:underline ${FOCUS}`}>
            Visita il sito <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
            <span className="sr-only">(si apre in una nuova scheda)</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────── PERCHÉ NOI ── */

const PROFILES = [
  {
    id: 'studio',
    label: 'Studio odontoiatrico',
    icon: Stethoscope,
    title: 'Un riunito protetto, senza pensieri quotidiani',
    points: [
      { icon: ShieldCheck, t: 'Più sicurezza', d: 'Riduce il rischio legato all’acqua contaminata durante le cure e impedisce la formazione del biofilm nei riuniti.' },
      { icon: Wrench, t: 'Manutenzione minima', d: 'Filtri da sostituire una volta l’anno, BIOXTERIL® da cambiare ogni trenta giorni.' },
      { icon: Building2, t: 'Si installa accanto alla poltrona', d: 'Il modello MONO sta direttamente vicino alla poltrona.' },
    ],
  },
  {
    id: 'clinica',
    label: 'Clinica',
    icon: Building2,
    title: 'Un solo impianto per tutte le postazioni',
    points: [
      { icon: Droplets, t: 'Sistema centralizzato', d: 'Osmo Steril tratta l’acqua destinata a tutti gli utilizzi clinici, in modo completamente automatico.' },
      { icon: Wifi, t: 'Wi-Fi integrato', d: 'Monitoraggio in tempo reale e notifiche email in caso di anomalie o scadenze.' },
      { icon: Wrench, t: 'Meno guasti', d: 'Previene ostruzioni da calcare e biofilm in manipoli, turbine e circuiti. TRIO e PLURI entrano in un mobile standard.' },
    ],
  },
  {
    id: 'distributore',
    label: 'Distributore',
    icon: Truck,
    title: 'Una gamma completa, documentata e brevettata',
    points: [
      { icon: BadgeCheck, t: 'Un prodotto che si distingue', d: 'Brevetto sulla combinazione di osmosi inversa e biossido di cloro, progettato e prodotto in Italia.' },
      { icon: FileText, t: 'Cataloghi pronti', d: 'Linea dentale medicale, acqua per autoclavi conforme EN 1717, accessori e ricambi.' },
      { icon: FlaskConical, t: 'Studi indipendenti', d: 'Efficacia valutata dall’Università di Pisa e in un lavoro con Università di Bologna, ASL, ARPA e ISS.' },
    ],
  },
];

const FACTS = [
  { value: '2003', label: 'l’anno in cui abbiamo iniziato a trattare l’acqua' },
  { value: '20+', label: 'anni al fianco degli studi odontoiatrici' },
  { value: '3', label: 'modelli Osmo Steril: MONO, TRIO, PLURI' },
  { value: '100%', label: 'brevettato e prodotto in Italia' },
];

function WhyUs() {
  const [active, setActive] = useState(PROFILES[0].id);
  const tabRefs = useRef([]);
  const current = PROFILES.find((p) => p.id === active);

  const onKeyDown = (e, i) => {
    const n = PROFILES.length;
    let next = null;
    if (e.key === 'ArrowRight') next = (i + 1) % n;
    if (e.key === 'ArrowLeft') next = (i - 1 + n) % n;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = n - 1;
    if (next === null) return;
    e.preventDefault();
    setActive(PROFILES[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="perche-noi" aria-labelledby="perche-title" className="relative scroll-mt-24 overflow-clip bg-brand-blue py-20 text-white sm:py-28 lg:py-32">
      {/* Ambiente: luce verde molto lenta, quasi impercettibile */}
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-brand-green/10 blur-3xl motion-safe:animate-[pulse_9s_ease-in-out_infinite]" />
      <div className={`${CONTAINER} relative`}>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="flex gap-6 sm:gap-10 lg:col-span-5">
            <WaterThread dark className="hidden h-56 shrink-0 sm:block" />
            <div>
              <SectionHead
                dark
                id="perche-title"
                eyebrow="Perché Ecoplus"
                title={
                  <>
                    Ricerca, metodo e <span className="text-brand-green">un brevetto</span> che fa la differenza.
                  </>
                }
                text="Dal 2003 lavoriamo con un obiettivo: proteggere la salute delle persone attraverso la sanificazione e la purificazione dell’acqua, soprattutto nel dentale."
              />
              <Reveal delay={240} className="mt-8">
                <a href="#contatti" onClick={(e) => { e.preventDefault(); scrollToId('contatti'); }} className={`${BTN_GREEN} focus-visible:ring-offset-brand-blue`}>
                  Parla con noi <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
                </a>
              </Reveal>
            </div>
          </div>

          <Reveal delay={120} className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-md">
              <div role="tablist" aria-label="Scegli il tuo profilo" className="grid grid-cols-1 gap-1 sm:grid-cols-3">
                {PROFILES.map((p, i) => {
                  const Icon = p.icon;
                  const on = p.id === active;
                  return (
                    <button
                      key={p.id}
                      ref={(el) => {
                        tabRefs.current[i] = el;
                      }}
                      type="button"
                      role="tab"
                      id={`tab-${p.id}`}
                      aria-selected={on}
                      aria-controls={`panel-${p.id}`}
                      tabIndex={on ? 0 : -1}
                      onClick={() => setActive(p.id)}
                      onKeyDown={(e) => onKeyDown(e, i)}
                      className={`flex min-h-[48px] items-center justify-center gap-2 rounded-full px-4 py-3 text-base font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green ${
                        on ? 'bg-white text-brand-blue' : 'text-white/85 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <div
                key={current.id}
                role="tabpanel"
                id={`panel-${current.id}`}
                aria-labelledby={`tab-${current.id}`}
                tabIndex={0}
                className="p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green sm:p-8 motion-safe:animate-[fadeUp_.6s_cubic-bezier(.22,1,.36,1)]"
              >
                <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{current.title}</h3>
                <ul className="mt-6 space-y-5">
                  {current.points.map(({ icon: Icon, t, d }) => (
                    <li key={t} className="flex gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-brand-green">
                        <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-lg font-semibold text-white">{t}</p>
                        <p className="mt-1 max-w-[52ch] font-light leading-relaxed text-slate-300">{d}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-4 sm:mt-20 lg:grid-cols-4 lg:gap-6">
          {FACTS.map((f, i) => (
            <Reveal key={f.label} delay={i * 90} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6">
              <dt className="sr-only">{f.label}</dt>
              <dd>
                <span className="block text-4xl font-bold tracking-tight text-white sm:text-5xl">{f.value}</span>
                <span className="mt-2 block text-sm leading-snug text-slate-300 sm:text-base">{f.label}</span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────── RICERCA ── */

const STUDIES = [
  {
    who: 'Università di Pisa',
    what: 'Valutazione della capacità disinfettante di Osmo Steril applicato al circuito idrico del riunito, pubblicata sull’International Journal of Environmental Research and Public Health.',
  },
  {
    who: 'Università di Bologna · ASL Ospedale Bellaria · ARPA · ISS',
    what: 'Bonifica di un riunito dentale con osmosi inversa e biossido di cloro, e confronto tra diversi sistemi di sanificazione dei circuiti idrici.',
  },
  {
    who: 'Linee guida ISS e Regione Emilia-Romagna',
    what: 'Rischio legionellosi negli studi odontoiatrici e sterilizzazione in odontoiatria: i riferimenti che raccogliamo per i professionisti.',
  },
];

function Research() {
  return (
    <section id="ricerca" aria-labelledby="ricerca-title" className="relative scroll-mt-24 bg-brand-mist py-20 sm:py-28 lg:py-32">
      <div className={CONTAINER}>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="relative order-last lg:order-first">
            <div className="overflow-hidden rounded-2xl shadow-glass">
              <img
                src={ASSETS.research}
                alt="Provette con campioni d’acqua limpida su un banco di laboratorio luminoso"
                loading="lazy"
                decoding="async"
                width="1920"
                height="1080"
                className="aspect-[4/3] h-full w-full object-cover lg:aspect-[5/4]"
              />
            </div>
            <div className={`${GLASS} absolute -bottom-6 left-4 right-4 flex items-center gap-4 p-5 sm:left-auto sm:right-6 sm:max-w-xs`}>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-blue text-white">
                <FlaskConical size={24} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold leading-snug text-brand-blue">Il biossido di cloro attacca la parete delle cellule dei microrganismi, anche quando sono inattivi.</p>
            </div>
          </Reveal>
          <div>
            <SectionHead
              id="ricerca-title"
              eyebrow="Prove, non promesse"
              title={
                <>
                  Un&apos;efficacia <Grad>verificata dalla ricerca</Grad>.
                </>
              }
              text="Lo stato dell’acqua del riunito si verifica con una semplice analisi batteriologica. Quella di Osmo Steril è stata studiata da università ed enti pubblici."
            />
            <ol className="mt-10 space-y-4">
              {STUDIES.map((s, i) => (
                <Reveal as="li" key={s.who} delay={i * 100} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
                  <span className="text-sm font-bold tabular-nums text-[#3F7A12]">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="font-semibold text-brand-blue">{s.who}</p>
                    <p className="mt-1 font-light leading-relaxed text-brand-ink/85">{s.what}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
            <Reveal delay={300} className="mt-8">
              <a href={CONFIG.links.publications} target="_blank" rel="noopener noreferrer" className={BTN_GHOST}>
                Leggi tutte le pubblicazioni <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
                <span className="sr-only">(si apre in una nuova scheda)</span>
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────── CONTATTI ── */

const PROFILE_OPTIONS = [
  { value: 'dentista', label: 'Dentista / studio odontoiatrico' },
  { value: 'clinica', label: 'Clinica odontoiatrica' },
  { value: 'distributore', label: 'Distributore del dentale' },
  { value: 'acqua', label: 'Acqua per uso alimentare (casa, comunità, azienda)' },
];

const EMPTY = { nome: '', azienda: '', email: '', telefono: '', profilo: '', messaggio: '', privacy: false, website: '' };

function validate(v) {
  const e = {};
  if (v.nome.trim().length < 2) e.nome = 'Scrivi il tuo nome e cognome.';
  if (v.azienda.trim().length < 2) e.azienda = 'Indica lo studio, la clinica o l’azienda.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Inserisci un indirizzo email valido, ad esempio nome@studio.it.';
  if (v.telefono.trim() && !/^[+()\d\s./-]{6,20}$/.test(v.telefono.trim())) e.telefono = 'Il numero contiene caratteri non validi.';
  if (!v.profilo) e.profilo = 'Scegli il profilo che ti descrive meglio.';
  if (v.messaggio.trim().length < 10) e.messaggio = 'Raccontaci in poche parole di cosa hai bisogno (almeno 10 caratteri).';
  if (!v.privacy) e.privacy = 'Serve il consenso al trattamento dei dati per poterti rispondere.';
  return e;
}

function Field({ id, label, error, optional, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between gap-2 text-sm font-semibold text-brand-blue">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-slate-500">facoltativo</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-sm text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 flex items-start gap-1.5 text-sm text-[#B42318]">
          <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

const INPUT =
  'block w-full min-h-[48px] rounded-2xl border bg-white px-4 py-3 text-base text-brand-ink placeholder:text-slate-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-0';

function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [via, setVia] = useState('endpoint');
  const formRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    if (status === 'success' || status === 'error') statusRef.current?.focus();
  }, [status]);

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValues((prev) => {
      const next = { ...prev, [k]: v };
      if (touched[k]) setErrors(validate(next));
      return next;
    });
  };
  const blur = (k) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors(validate(values));
  };
  const show = (k) => (touched[k] ? errors[k] : undefined);
  const describedBy = (k, hint) => (show(k) ? `${k === 'privacy' ? 'f-privacy' : `f-${k}`}-error` : hint ? `f-${k}-hint` : undefined);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    const errs = validate(values);
    setErrors(errs);
    setTouched({ nome: true, azienda: true, email: true, telefono: true, profilo: true, messaggio: true, privacy: true });
    const first = Object.keys(errs)[0];
    if (first) {
      formRef.current?.querySelector(`#f-${first}`)?.focus();
      return;
    }
    if (values.website) {
      setStatus('success');
      return;
    }
    const profileLabel = PROFILE_OPTIONS.find((o) => o.value === values.profilo)?.label;
    setStatus('sending');
    try {
      if (CONFIG.formEndpoint) {
        const res = await fetch(CONFIG.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ...values, profilo: profileLabel, website: undefined, origine: 'Homepage ecoplusitalia.com' }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setVia('endpoint');
      } else {
        const body = [
          `Nome: ${values.nome}`,
          `Studio / azienda: ${values.azienda}`,
          `Email: ${values.email}`,
          `Telefono: ${values.telefono || '-'}`,
          `Profilo: ${profileLabel}`,
          '',
          values.messaggio,
          '',
          'Consenso privacy: sì',
        ].join('\n');
        window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(`Richiesta informazioni · ${profileLabel}`)}&body=${encodeURIComponent(body)}`;
        setVia('mailto');
      }
      setStatus('success');
      setValues(EMPTY);
      setTouched({});
      setErrors({});
    } catch {
      setStatus('error');
    }
  };

  const border = (k) => (show(k) ? 'border-[#B42318]' : 'border-slate-200 hover:border-slate-300');

  return (
    <section id="contatti" aria-labelledby="contatti-title" className="relative scroll-mt-24 bg-white py-20 sm:py-28 lg:py-32">
      <div className={CONTAINER}>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHead
              id="contatti-title"
              eyebrow="Contattaci"
              title={
                <>
                  Mettiamo in sicurezza <Grad>l&apos;acqua del tuo studio</Grad>.
                </>
              }
              text="Raccontaci chi sei e di cosa hai bisogno. Ti rispondiamo con una consulenza sulla soluzione più adatta, per il tuo studio, la tua clinica o la tua rete di vendita."
            />
            <Reveal delay={200} as="ul" className="mt-10 space-y-4">
              {[
                { icon: Phone, label: 'Telefono', value: `${CONFIG.phoneDisplay} / ${CONFIG.phoneAlt}`, href: CONFIG.phoneHref },
                { icon: Mail, label: 'Email', value: CONFIG.email, href: `mailto:${CONFIG.email}` },
                { icon: MapPin, label: 'Sede', value: `${CONFIG.address}, ${CONFIG.city}` },
                { icon: Clock, label: 'Orari', value: 'Lun-Ven 9:00-13:00 · 14:00-18:00' },
              ].map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-mist text-brand-blue">
                    <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">{label}</p>
                    {href ? (
                      <a href={href} className={`rounded text-lg font-semibold text-brand-blue underline-offset-4 hover:underline ${FOCUS}`}>
                        {value}
                      </a>
                    ) : (
                      <p className="text-lg text-brand-ink">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </Reveal>
          </div>

          <Reveal delay={120} className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-brand-mist/60 p-6 shadow-soft sm:p-8 lg:p-10">
              {status === 'success' ? (
                <div ref={statusRef} tabIndex={-1} role="status" className="flex flex-col items-start gap-4 py-8 focus:outline-none">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/15 text-[#3F7A12]">
                    <CheckCircle2 size={30} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <h3 className="text-2xl font-bold text-brand-blue sm:text-3xl">{via === 'mailto' ? 'Il tuo messaggio è pronto.' : 'Grazie, abbiamo ricevuto la tua richiesta.'}</h3>
                  <p className="max-w-[52ch] text-lg font-light leading-relaxed text-brand-ink">
                    {via === 'mailto'
                      ? `Si è aperto il tuo programma di posta con la richiesta già compilata per ${CONFIG.email}: premi Invia per spedirla. Se non si è aperto, scrivici direttamente o chiamaci.`
                      : 'Ti ricontattiamo nei giorni lavorativi. Se hai fretta, chiamaci: siamo in sede dal lunedì al venerdì.'}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a href={CONFIG.phoneHref} className={BTN_PRIMARY}>
                      <Phone size={18} strokeWidth={1.5} aria-hidden="true" /> Chiamaci
                    </a>
                    <button type="button" onClick={() => setStatus('idle')} className={BTN_GHOST}>
                      Invia un’altra richiesta
                    </button>
                  </div>
                </div>
              ) : (
                <form ref={formRef} onSubmit={onSubmit} noValidate aria-describedby="form-note" className="grid gap-5 sm:grid-cols-2">
                  {status === 'error' && (
                    <div ref={statusRef} tabIndex={-1} role="alert" className="flex items-start gap-3 rounded-2xl border border-[#B42318]/30 bg-[#FEF3F2] p-4 text-[#B42318] focus:outline-none sm:col-span-2">
                      <AlertCircle size={20} strokeWidth={1.5} className="mt-0.5 shrink-0" aria-hidden="true" />
                      <p>
                        Non siamo riusciti a inviare la richiesta. Riprova tra poco, oppure scrivici a{' '}
                        <a className="font-semibold underline" href={`mailto:${CONFIG.email}`}>
                          {CONFIG.email}
                        </a>
                        .
                      </p>
                    </div>
                  )}
                  <Field id="f-nome" label="Nome e cognome" error={show('nome')}>
                    <input id="f-nome" name="nome" autoComplete="name" value={values.nome} onChange={set('nome')} onBlur={blur('nome')} aria-invalid={!!show('nome')} aria-describedby={describedBy('nome')} required className={`${INPUT} ${border('nome')}`} />
                  </Field>
                  <Field id="f-azienda" label="Studio / azienda" error={show('azienda')}>
                    <input id="f-azienda" name="azienda" autoComplete="organization" value={values.azienda} onChange={set('azienda')} onBlur={blur('azienda')} aria-invalid={!!show('azienda')} aria-describedby={describedBy('azienda')} required className={`${INPUT} ${border('azienda')}`} />
                  </Field>
                  <Field id="f-email" label="Email" error={show('email')}>
                    <input id="f-email" name="email" type="email" inputMode="email" autoComplete="email" value={values.email} onChange={set('email')} onBlur={blur('email')} aria-invalid={!!show('email')} aria-describedby={describedBy('email')} required className={`${INPUT} ${border('email')}`} />
                  </Field>
                  <Field id="f-telefono" label="Telefono" optional error={show('telefono')}>
                    <input id="f-telefono" name="telefono" type="tel" inputMode="tel" autoComplete="tel" value={values.telefono} onChange={set('telefono')} onBlur={blur('telefono')} aria-invalid={!!show('telefono')} aria-describedby={describedBy('telefono')} className={`${INPUT} ${border('telefono')}`} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field id="f-profilo" label="Profilo" error={show('profilo')}>
                      <div className="relative">
                        <select id="f-profilo" name="profilo" value={values.profilo} onChange={set('profilo')} onBlur={blur('profilo')} aria-invalid={!!show('profilo')} aria-describedby={describedBy('profilo')} required className={`${INPUT} ${border('profilo')} appearance-none pr-12`}>
                          <option value="" disabled>
                            Scegli il tuo profilo
                          </option>
                          {PROFILE_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={20} strokeWidth={1.5} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-blue" aria-hidden="true" />
                      </div>
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field id="f-messaggio" label="Messaggio" error={show('messaggio')} hint="Ad esempio: quante postazioni ha lo studio, o quale prodotto ti interessa.">
                      <textarea id="f-messaggio" name="messaggio" rows={5} value={values.messaggio} onChange={set('messaggio')} onBlur={blur('messaggio')} aria-invalid={!!show('messaggio')} aria-describedby={describedBy('messaggio', true)} required className={`${INPUT} ${border('messaggio')} resize-y`} />
                    </Field>
                  </div>
                  {/* Honeypot anti-spam: invisibile alle persone */}
                  <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                    <label htmlFor="f-website">Sito web</label>
                    <input id="f-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-start gap-3">
                      <input
                        id="f-privacy"
                        name="privacy"
                        type="checkbox"
                        checked={values.privacy}
                        onChange={set('privacy')}
                        onBlur={blur('privacy')}
                        aria-invalid={!!show('privacy')}
                        aria-describedby={describedBy('privacy')}
                        required
                        className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 accent-[#0B2D59] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2"
                      />
                      <label htmlFor="f-privacy" className="text-sm leading-relaxed text-brand-ink">
                        Ho letto l’
                        <a href={CONFIG.links.privacy} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-blue underline underline-offset-2">
                          informativa privacy
                          <span className="sr-only"> (si apre in una nuova scheda)</span>
                        </a>{' '}
                        e acconsento al trattamento dei miei dati per ricevere una risposta.
                      </label>
                    </div>
                    {show('privacy') && (
                      <p id="f-privacy-error" className="mt-2 flex items-start gap-1.5 text-sm text-[#B42318]">
                        <AlertCircle size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" aria-hidden="true" />
                        {show('privacy')}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-start gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                    <p id="form-note" className="text-sm text-slate-500">
                      Tutti i campi sono obbligatori, tranne il telefono.
                    </p>
                    <button type="submit" disabled={status === 'sending'} aria-busy={status === 'sending'} className={`${BTN_PRIMARY} w-full disabled:cursor-wait disabled:opacity-80 sm:w-auto`}>
                      {status === 'sending' ? (
                        <>
                          <Loader2 size={18} strokeWidth={1.5} className="animate-spin" aria-hidden="true" /> Invio in corso
                        </>
                      ) : (
                        <>
                          Invia la richiesta <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────── FOOTER ── */

function Footer() {
  const social = [
    { icon: Facebook, href: CONFIG.links.facebook, label: 'Facebook' },
    { icon: Linkedin, href: CONFIG.links.linkedin, label: 'LinkedIn' },
    { icon: Youtube, href: CONFIG.links.youtube, label: 'YouTube' },
  ];
  return (
    <footer className="bg-brand-ink text-slate-300">
      <div className={`${CONTAINER} py-14 sm:py-16`}>
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            {/* Su fondo scuro il marchio resta intatto, appoggiato su una tessera chiara */}
            <span className="inline-flex rounded-2xl bg-white px-5 py-3">
              <img src={ASSETS.logo} alt="Ecoplus Group" width="705" height="389" loading="lazy" className="h-12 w-auto" />
            </span>
            <p className="mt-6 max-w-[40ch] font-light leading-relaxed">Ecoplus S.r.l. · Sistemi per il trattamento acque, in ambito odontoiatrico e per uso alimentare.</p>
            <ul className="mt-6 flex gap-2">
              {social.map(({ icon: Icon, href, label }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (si apre in una nuova scheda)`} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white transition-colors duration-300 hover:border-brand-green hover:text-brand-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green">
                    <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-white">Contatti</p>
            <address className="mt-4 space-y-2 not-italic leading-relaxed">
              <p>
                {CONFIG.address}
                <br />
                {CONFIG.city} · Italia
              </p>
              <p>
                <a href={CONFIG.phoneHref} className="rounded hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green">
                  Tel. {CONFIG.phoneDisplay} / {CONFIG.phoneAlt}
                </a>
              </p>
              <p>
                <a href={`mailto:${CONFIG.email}`} className="rounded hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green">
                  {CONFIG.email}
                </a>
              </p>
              <p>PEC: {CONFIG.pec}</p>
            </address>
          </div>
          <nav aria-label="Link utili" className="md:col-span-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-white">Link utili</p>
            <ul className="mt-4 space-y-2">
              {[
                { label: 'Pubblicazioni', href: CONFIG.links.publications },
                { label: 'Lavora con noi', href: CONFIG.links.people },
                { label: 'Area riservata', href: CONFIG.links.reserved },
                { label: 'Privacy policy', href: CONFIG.links.privacy },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[32px] items-center rounded hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green">
                    {l.label}
                    <span className="sr-only"> (si apre in una nuova scheda)</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-sm text-slate-400 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Ecoplus S.r.l. · P.IVA {CONFIG.vat} · SDI {CONFIG.sdi}</p>
          <p>Immagini dell’hero e delle sezioni generate con AI.</p>
        </div>
      </div>
    </footer>
  );
}

/* ──────────────────────────────────────────────────────────────── PAGE ── */

export default function EcoplusHomepage() {
  /* Mette in pausa le animazioni in loop quando la scheda è nascosta */
  useEffect(() => {
    const on = () => document.body.classList.toggle('paused', document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-brand-ink antialiased selection:bg-brand-green/30">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
        body.paused *, body.paused *::before, body.paused *::after { animation-play-state: paused !important }
      `}</style>
      <a href="#main" className="sr-only z-[60] rounded-full bg-brand-blue px-5 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Vai al contenuto
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        <Hero />
        <Solutions />
        <WhyUs />
        <Research />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
