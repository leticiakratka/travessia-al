/* =========================================================
   TRAVESSIA — Interaction layer
   ========================================================= */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;

// ============ Lenis smooth scroll ============
window.lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  smoothTouch: false,
  wheelMultiplier: 1,
});

if (gsap && ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  window.lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    window.lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
} else {
  function raf(time) {
    window.lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// Anchor links routed through Lenis
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length <= 1) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    window.lenis.scrollTo(target, { offset: -60, duration: 1.4 });
  });
});

// ============ Nav state ============
const nav = document.getElementById('nav');
window.lenis.on('scroll', ({ scroll }) => {
  nav.classList.toggle('is-scrolled', scroll > 40);
});

// ============ Nav compact during scroll-driven sections ============
(function () {
  const jornadaEl = document.getElementById('jornada');
  const navEl = document.getElementById('nav');
  if (!jornadaEl || !navEl) return;
  const activeCompactSections = new Set();
  const updateCompactNav = () => {
    navEl.classList.toggle('nav--compact', activeCompactSections.size > 0);
  };
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activeCompactSections.add(entry.target);
        else activeCompactSections.delete(entry.target);
      });
      updateCompactNav();
    },
    { threshold: 0.05 }
  );
  observer.observe(jornadaEl);
}());

// ============ GSAP + ScrollTrigger entrances ============
function markVisible(element) {
  if (!element) return;
  element.classList.add('is-visible');
}

function initGsapReveals() {
  if (!gsap || !ScrollTrigger || prefersReducedMotion) {
    document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => markVisible(el));
    return;
  }

  const isMobile = window.matchMedia('(max-width: 820px)').matches;
  const simpleReveals = [
    ...document.querySelectorAll('.reveal:not(.reveal-stagger):not(.hero__grid):not(.metodo__inner)')
  ];
  simpleReveals.forEach((el) => {
    const distance = el.matches('.quem__grid, .last-call__inner') ? 28 : 20;
    gsap.from(el, {
      y: distance,
      opacity: 0,
      filter: 'blur(8px)',
      duration: 0.9,
      ease: 'power3.out',
      clearProps: 'opacity,transform,filter',
      scrollTrigger: {
        trigger: el,
        start: 'top 86%',
        once: true,
        onEnter: () => markVisible(el),
      },
    });
  });

  document.querySelectorAll('.reveal-stagger:not(.metodo__grid)').forEach((group) => {
    const items = Array.from(group.children);
    if (!items.length) return;

    gsap.from(items, {
      y: group.matches('.metodo__grid, .tools, .acompanhamento__grid, .faq__list') ? 26 : 20,
      opacity: 0,
      filter: 'blur(8px)',
      duration: 0.82,
      ease: 'power3.out',
      stagger: 0.1,
      clearProps: 'opacity,transform,filter',
      scrollTrigger: {
        trigger: group,
        start: 'top 84%',
        once: true,
        onEnter: () => {
          markVisible(group);
          items.forEach((item) => markVisible(item));
        },
      },
    });
  });

  const metodoHead = document.querySelector('.metodo__head');
  if (metodoHead) {
    gsap.from(metodoHead, {
      y: 24,
      opacity: 0,
      filter: 'blur(8px)',
      duration: 0.9,
      ease: 'power3.out',
      clearProps: 'opacity,transform,filter',
      scrollTrigger: {
        trigger: metodoHead,
        start: isMobile ? 'top 76%' : 'top 84%',
        once: true,
      },
    });
  }

  const metodoGrid = document.querySelector('.metodo__grid');
  const metodoCards = metodoGrid ? Array.from(metodoGrid.querySelectorAll('.metodo__card')) : [];
  if (metodoGrid && metodoCards.length) {
    markVisible(metodoGrid);
    metodoCards.forEach((card) => markVisible(card));

    const cardEnter = isMobile ? [18, 42, 66] : [24, 58, 92];
    const enterStart = isMobile ? ['top 86%', 'top 82%', 'top 78%'] : ['top 84%', 'top 80%', 'top 76%'];
    const enterEnd = isMobile ? ['top 72%', 'top 68%', 'top 64%'] : ['top 70%', 'top 66%', 'top 62%'];
    metodoCards.forEach((card, index) => {
      gsap.fromTo(card, {
        '--metodo-card-enter': `${cardEnter[index] || 0}px`,
        opacity: 0,
        filter: 'blur(10px)',
      }, {
        '--metodo-card-enter': '0px',
        opacity: 1,
        filter: 'blur(0px)',
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: enterStart[index] || 'top 94%',
          end: enterEnd[index] || 'top 66%',
          scrub: 0.35,
        },
      });
    });

    const cardLift = isMobile ? [0, 18, 36] : [0, 30, 60];
    metodoCards.forEach((card, index) => {
      const distance = cardLift[index] || 0;
      gsap.to(card, {
        '--metodo-card-shift': `${-distance}px`,
        ease: 'none',
        scrollTrigger: {
          trigger: metodoGrid,
          start: isMobile ? 'top 18%' : 'top 12%',
          end: isMobile ? 'bottom 34%' : 'bottom 38%',
          scrub: 0.55,
        },
      });
    });
  }

  document.querySelectorAll('[data-course-destrave]').forEach((group) => {
    const intro = group.querySelector('[data-course-intro]');
    const list = group.querySelector('[data-course-list]');
    const cards = list ? Array.from(list.querySelectorAll('.curso-card')) : [];
    const fxItems = Array.from(group.querySelectorAll('[data-course-fx]'));
    if (!intro || !list || !cards.length) return;

    gsap.from(cards, {
      y: 28,
      opacity: 0,
      filter: 'blur(8px)',
      duration: 0.78,
      ease: 'power3.out',
      stagger: 0.09,
      clearProps: 'opacity,transform,filter',
      scrollTrigger: {
        trigger: group,
        start: isMobile ? 'top 86%' : 'top 78%',
        once: true,
      },
    });

    if (isMobile) return;

    fxItems.forEach((item) => {
      const depth = parseFloat(item.dataset.depth || '0.1');
      gsap.fromTo(item, {
        '--fx-y': `${-280 * depth}px`,
        '--fx-x': `${-90 * depth}px`,
        '--fx-rotate': `${-7 * depth}deg`,
      }, {
        '--fx-y': `${720 * depth}px`,
        '--fx-x': `${130 * depth}px`,
        '--fx-rotate': `${12 * depth}deg`,
        ease: 'none',
        scrollTrigger: {
          trigger: group,
          start: 'top 110%',
          end: 'bottom -10%',
          scrub: 0.45,
        },
      });
    });
  });

  ScrollTrigger.refresh();
}

function initHeroIntro() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  if (!gsap || prefersReducedMotion) {
    markVisible(hero.querySelector('.hero__grid'));
    return;
  }

  const heroTimeline = gsap.timeline({
    defaults: {
      ease: 'power3.out',
    }
  });

  heroTimeline
    .from('.hero__title-line', {
      y: 34,
      opacity: 0,
      filter: 'blur(10px)',
      duration: 0.9,
      stagger: 0.1,
      clearProps: 'opacity,transform,filter',
    })
    .from('.hero__lede', {
      y: 22,
      opacity: 0,
      filter: 'blur(8px)',
      duration: 0.82,
      clearProps: 'opacity,transform,filter',
    }, 0.22)
    .from('.hero__ctas > *', {
      y: 18,
      opacity: 0,
      filter: 'blur(6px)',
      duration: 0.7,
      stagger: 0.08,
      clearProps: 'opacity,transform,filter',
    }, 0.34)
    .from('.hero__proof-item', {
      y: 20,
      opacity: 0,
      filter: 'blur(6px)',
      duration: 0.72,
      stagger: 0.08,
      clearProps: 'opacity,transform,filter',
    }, 0.48)
    .from('.hero__visual', {
      x: 34,
      y: 16,
      opacity: 0,
      scale: 0.97,
      filter: 'blur(14px)',
      duration: 1.08,
      clearProps: 'opacity,transform,filter',
    }, 0.14)
    .from('.hero__visual-stamp, .hero__visual-quote', {
      y: 16,
      opacity: 0,
      filter: 'blur(8px)',
      duration: 0.72,
      stagger: 0.1,
      clearProps: 'opacity,transform,filter',
    }, 0.6);
}

if (!prefersReducedMotion && gsap && ScrollTrigger) {
  initHeroIntro();
  initGsapReveals();
} else {
  initHeroIntro();
  initGsapReveals();
}

// ============ Nota-paper entrance (dossie__note-paper) ============
(function setupNoteReveal() {
  const papers = document.querySelectorAll('[data-paper-reveal]');
  if (!papers.length) return;
  if (!('IntersectionObserver' in window)) {
    papers.forEach((el) => el.classList.add('in'));
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  papers.forEach((el) => obs.observe(el));
}());

// ============ Strike-through reveal (data-strike) ============
(function setupStrikeReveal() {
  const strikes = document.querySelectorAll('[data-strike]');
  if (!strikes.length) return;
  if (!('IntersectionObserver' in window)) {
    strikes.forEach((el) => el.classList.add('in-view'));
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  strikes.forEach((el) => obs.observe(el));
}());

// ============ Strict reveal — dedicated observer for blocks that must
// animate only when the user actually has them centered in view.
// Fires exactly once per element.
(function setupStrictReveals() {
  const els = document.querySelectorAll('[data-strict-reveal]');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.35, rootMargin: '0px 0px -10% 0px' }
  );
  els.forEach((el) => observer.observe(el));
})();

// ============ Dossiê (Dobra 02) — rule mark animation ============
(function initDossieRules() {
  const marks = document.querySelectorAll('.dossie__mark--rule');
  if (!marks.length) return;
  if (!('IntersectionObserver' in window)) {
    marks.forEach((m) => m.classList.add('is-drawn'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-drawn');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.8, rootMargin: '0px 0px -10% 0px' }
  );
  marks.forEach((m) => observer.observe(m));
})();

// ============ Parallax ============
const parallaxEls = document.querySelectorAll('.parallax');
const heroEl = document.querySelector('.hero');
const isMobileViewport = () => window.matchMedia('(max-width: 720px)').matches;

window.lenis.on('scroll', ({ scroll }) => {
  parallaxEls.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    // only apply when near viewport
    if (rect.bottom < -200 || rect.top > vh + 200) return;
    const strength = parseFloat(el.dataset.parallax || 0.1);
    const center = rect.top + rect.height / 2;
    const offset = (center - vh / 2) * strength * -1;
    const img = el.querySelector('img');
    if (img) {
      img.style.transform = `scale(1.08) translate3d(0, ${offset}px, 0)`;
    } else {
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    }
  });

  // Hero bg parallax on mobile — drives --hero-bg-offset
  if (heroEl && isMobileViewport()) {
    const rect = heroEl.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) {
      const offset = scroll * 0.25;
      heroEl.style.setProperty('--hero-bg-offset', `${-offset}px`);
    }
  }
});

// ============ FAQ accordion ============
document.querySelectorAll('.faq-item').forEach((item) => {
  const q = item.querySelector('.faq-item__q');
  const a = item.querySelector('.faq-item__a');
  q.addEventListener('click', () => {
    const open = item.classList.toggle('is-open');
    a.style.maxHeight = open ? a.scrollHeight + 'px' : '0px';
  });
});

// ============ UTM forwarding pro checkout ============
// Captura parâmetros de tracking (utm_*, gclid, fbclid, ttclid) da URL atual,
// persiste em sessionStorage e injeta nos links pro checkout (data-checkout
// ou qualquer link pra pay.voompcreators.com.br).
(function forwardTrackingParams() {
  const TRACKING_KEYS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'utm_id', 'gclid', 'fbclid', 'ttclid', 'msclkid', 'src', 'sck'
  ];
  const STORAGE_KEY = 'travessia_tracking';

  // 1. Lê params da URL atual e mescla com o que já tava em sessionStorage
  const urlParams = new URLSearchParams(window.location.search);
  let stored = {};
  try {
    stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
  } catch (e) { stored = {}; }

  const tracking = { ...stored };
  let hasNew = false;
  TRACKING_KEYS.forEach((key) => {
    const value = urlParams.get(key);
    if (value) { tracking[key] = value; hasNew = true; }
  });

  if (hasNew) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tracking)); } catch (e) {}
  }

  // 2. Se não tem nada pra propagar, sai
  const entries = Object.entries(tracking);
  if (entries.length === 0) return;

  // 3. Injeta nos links de checkout
  const selector = 'a[data-checkout], a[href*="pay.voompcreators.com.br"]';
  document.querySelectorAll(selector).forEach((a) => {
    try {
      const url = new URL(a.href, window.location.origin);
      entries.forEach(([k, v]) => url.searchParams.set(k, v));
      a.href = url.toString();
    } catch (e) {}
  });
})();
