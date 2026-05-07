/* ============================================================
   LAHLOU HAMMAM & SPA — Main JS
   ============================================================ */

/* ── NAVIGATION ──────────────────────────────────────────── */
function initNav() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  hamburger?.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileMenu?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger?.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Highlight active page
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    const match = href.split('/').pop();
    if (match === page || (!page && match === 'index.html') || (page === '' && match === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ── BACK TO TOP ─────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 450));
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── TOAST ───────────────────────────────────────────────── */
let toastEl;
function showToast(message, emoji = '✨') {
  if (!toastEl) {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    toastEl = container;
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${emoji}</span> ${message}`;
  toastEl.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3200);
}

/* ── GALLERY LIGHTBOX ────────────────────────────────────── */
function initGallery() {
  const items = document.querySelectorAll('.gallery-item[data-src], .promo-gallery-item[data-src]');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  if (!lightbox) return;

  items.forEach(item => {
    item.addEventListener('click', () => {
      lightboxImg.src = item.dataset.src;
      lightboxImg.alt = item.dataset.alt || '';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') item.click(); });
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
  });

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightboxImg.src = '';
    document.body.style.overflow = '';
  };
  closeBtn?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}

/* ── BOOKING FORM ────────────────────────────────────────── */
function initBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Envoi en cours…';

    setTimeout(() => {
      form.style.display = 'none';
      const success = document.getElementById('booking-success');
      if (success) success.classList.add('show');
      showToast('Votre demande a été envoyée avec succès !', '💐');
    }, 1200);
  });

  form.querySelectorAll('.form-control[required]').forEach(field => {
    field.addEventListener('blur', () => checkField(field));
    field.addEventListener('input', () => clearError(field));
  });
}

/* ── CONTACT FORM ────────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Envoi…';

    setTimeout(() => {
      document.getElementById('form-fields').style.display = 'none';
      document.getElementById('form-success').classList.add('show');
      showToast('Message envoyé ! Nous vous répondrons bientôt.', '✉️');
    }, 1000);
  });
}

/* ── FORM VALIDATION HELPERS ─────────────────────────────── */
function validateForm(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    if (!checkField(field)) valid = false;
  });
  return valid;
}

function checkField(field) {
  const isEmpty = !field.value.trim();
  const errEl = field.parentElement.querySelector('.form-error');
  if (isEmpty) {
    field.classList.add('invalid');
    if (errEl) errEl.classList.add('show');
    return false;
  } else {
    clearError(field);
    return true;
  }
}

function clearError(field) {
  field.classList.remove('invalid');
  const errEl = field.parentElement.querySelector('.form-error');
  if (errEl) errEl.classList.remove('show');
}

/* ── RESET BOOKING FORM ──────────────────────────────────── */
function resetBooking() {
  const form = document.getElementById('booking-form');
  const success = document.getElementById('booking-success');
  if (form) { form.style.display = 'block'; form.reset(); }
  if (success) success.classList.remove('show');
  const btn = form?.querySelector('[type="submit"]');
  if (btn) { btn.disabled = false; btn.textContent = 'Confirmer la Réservation'; }
}

/* ── RESET CONTACT FORM ──────────────────────────────────── */
function resetContact() {
  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  const fields = document.getElementById('form-fields');
  if (form) form.reset();
  if (fields) fields.style.display = 'block';
  if (success) success.classList.remove('show');
  const btn = form?.querySelector('[type="submit"]');
  if (btn) { btn.disabled = false; btn.textContent = 'Envoyer le Message'; }
}

/* ── REVIEWS CAROUSEL ────────────────────────────────────── */
function initReviewsCarousel() {
  const wrapper = document.querySelector('.reviews-carousel');
  if (!wrapper) return;

  const track    = wrapper.querySelector('.carousel-track');
  const viewport = wrapper.querySelector('.carousel-viewport');
  if (!track || !viewport) return;

  const GAP           = 20;   // matches 1.25rem CSS gap
  const SPEED         = 0.45; // px per frame (~27px/s at 60fps)
  const TRANSITION_MS = 420;

  // Clone all cards for seamless infinite loop
  const origCards = Array.from(track.children);
  const n = origCards.length;
  origCards.forEach(c => {
    const clone = c.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });

  let pos       = 0;
  let paused    = false;
  let animating = false;
  let touchTimer;
  let resizeTimer;

  function cardW() {
    const c = track.querySelector('.carousel-card');
    return c ? c.offsetWidth + GAP : 340;
  }
  function totalW() { return cardW() * n; }

  function applyPos(p, transition) {
    if (transition) track.style.transition = `transform ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1)`;
    track.style.transform = `translateX(${p}px)`;
  }

  // Responsive card widths via CSS custom property
  function updateWidths() {
    const cols = window.innerWidth <= 640 ? 1 : window.innerWidth <= 900 ? 2 : 3;
    const cw   = Math.floor((viewport.offsetWidth - (cols - 1) * GAP) / cols);
    document.documentElement.style.setProperty('--carousel-card-w', cw + 'px');
  }
  updateWidths();
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updateWidths();
      pos = 0;
      track.style.transition = '';
      track.style.transform  = 'translateX(0)';
    }, 200);
  });

  // RAF auto-scroll loop
  function tick() {
    if (!paused && !animating) {
      pos -= SPEED;
      if (pos <= -totalW()) pos += totalW();
      track.style.transform = `translateX(${pos}px)`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Pause on hover / touch
  wrapper.addEventListener('mouseenter', () => { paused = true; });
  wrapper.addEventListener('mouseleave', () => { if (!animating) paused = false; });
  wrapper.addEventListener('touchstart', () => { paused = true; clearTimeout(touchTimer); }, { passive: true });
  wrapper.addEventListener('touchend',   () => { touchTimer = setTimeout(() => { paused = false; }, 2500); }, { passive: true });

  // Arrow navigation
  function slide(dir) {
    if (animating) return;
    animating = true;
    paused    = true;
    pos -= dir * cardW();
    if (pos <= -totalW()) pos += totalW();
    if (pos > 0)          pos -= totalW();
    applyPos(pos, true);
    setTimeout(() => {
      track.style.transition = '';
      animating = false;
      paused    = false;
    }, TRANSITION_MS + 30);
  }

  wrapper.querySelector('.carousel-btn--prev')?.addEventListener('click', () => slide(-1));
  wrapper.querySelector('.carousel-btn--next')?.addEventListener('click', () => slide(1));
}

/* ── SMOOTH SCROLL FOR ANCHOR LINKS ─────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ── SCROLL REVEAL ANIMATION ─────────────────────────────── */
function initReveal() {
  if (!('IntersectionObserver' in window)) return;
  const els = document.querySelectorAll('.service-card, .feature-card, .testimonial-card, .pricing-item, .gallery-item');
  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, (Array.from(entry.target.parentElement?.children || []).indexOf(entry.target) % 4) * 80);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
}

/* ── INIT ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initBackToTop();
  initGallery();
  initBookingForm();
  initContactForm();
  initSmoothScroll();
  initReviewsCarousel();
  setTimeout(initReveal, 100);
});
