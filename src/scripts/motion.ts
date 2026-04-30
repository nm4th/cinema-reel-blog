/**
 * CINEMA REEL 新宿 — motion enhancement layer.
 *
 * Pure progressive enhancement: every effect here is decorative.
 * If this script fails to load, the site is fully usable and visible
 * (the .has-js class is what opts elements into hidden-start animations).
 * All animations honor prefers-reduced-motion.
 */

// Mark <html> as having JS the moment this script executes.
// Without this class, .reveal-* classes default to fully visible
// so the page never gets stuck in "stays at opacity 0" state.
document.documentElement.classList.add('has-js');

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── Scroll-triggered reveal ─────────────────────────────────
function initScrollReveal() {
  const targets = document.querySelectorAll<HTMLElement>(
    '.reveal-up, .reveal-fade, .reveal-clip, [data-reveal]'
  );
  if (targets.length === 0) return;

  if (reduce) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  targets.forEach((el) => io.observe(el));
}

// ─── Top-of-page scroll progress bar ─────────────────────────
function initScrollProgress() {
  const bar = document.querySelector<HTMLElement>('.scroll-progress');
  if (!bar) return;
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = `scaleX(${ratio})`;
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
  update();
}

// ─── Hero cursor-follow spotlight ────────────────────────────
function initHeroSpotlight() {
  const hero = document.querySelector<HTMLElement>('.hero');
  if (!hero || reduce) return;
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    hero.style.setProperty('--mx', `${x}%`);
    hero.style.setProperty('--my', `${y}%`);
  });
  hero.addEventListener('mouseleave', () => {
    hero.style.setProperty('--mx', '50%');
    hero.style.setProperty('--my', '50%');
  });
}

// ─── Hero background parallax ────────────────────────────────
function initHeroParallax() {
  const heroBg = document.querySelector<HTMLElement>('.hero-bg');
  if (!heroBg || reduce) return;
  let ticking = false;
  const update = () => {
    const offset = window.scrollY * 0.35;
    heroBg.style.transform = `translateY(${offset}px) scale(1.08)`;
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
}

// ─── Magnetic-feel buttons (subtle) ──────────────────────────
function initMagneticButtons() {
  if (reduce) return;
  const selectors = [
    '.btn-primary',
    '.post-cta-btn',
    '.sticky-cta-btn',
    '.cta-pill',
  ];
  document
    .querySelectorAll<HTMLElement>(selectors.join(','))
    .forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
}

// ─── Scene-card 3D tilt ──────────────────────────────────────
function initSceneCardTilt() {
  if (reduce) return;
  document
    .querySelectorAll<HTMLElement>('.scene-card')
    .forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1100px) rotateX(${
          -y * 4
        }deg) rotateY(${x * 4}deg) translateY(-3px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
}

// ─── Count-up stats (when entering viewport) ─────────────────
function initCountUp() {
  const els = document.querySelectorAll<HTMLElement>('[data-count]');
  els.forEach((el) => {
    const raw = el.getAttribute('data-count') ?? '0';
    const target = parseFloat(raw);
    const decimals = raw.split('.')[1]?.length ?? 0;
    const suffix = el.getAttribute('data-count-suffix') ?? '';

    if (reduce) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const start = 0;
          const duration = 1500;
          const t0 = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            const v = start + (target - start) * eased;
            el.textContent = v.toFixed(decimals) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
  });
}

// ─── FAQ accordion ───────────────────────────────────────────
function initFaq() {
  document
    .querySelectorAll<HTMLDetailsElement>('.faq-item')
    .forEach((details) => {
      // Native <details> handles toggle; we just add a small UX nicety:
      // close other items when one opens (single-open mode).
      details.addEventListener('toggle', () => {
        if (!details.open) return;
        document
          .querySelectorAll<HTMLDetailsElement>('.faq-item[open]')
          .forEach((d) => {
            if (d !== details) d.open = false;
          });
      });
    });
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initScrollProgress();
  initHeroSpotlight();
  initHeroParallax();
  initMagneticButtons();
  initSceneCardTilt();
  initCountUp();
  initFaq();
});
