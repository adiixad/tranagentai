// ============ Mobile menu ============
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const closeBtn = document.querySelector('.mobile-close');
  const menu = document.querySelector('.mobile-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => menu.classList.add('open'));
  closeBtn && closeBtn.addEventListener('click', () => menu.classList.remove('open'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
}

// ============ Scroll reveal ============
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(i => obs.observe(i));
}

// ============ Animated counters ============
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const decimals = el.dataset.count.includes('.') ? 1 : 0;
      let start = 0;
      const duration = 1400;
      const startTime = performance.now();
      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const val = start + (target - start) * eased;
        el.textContent = (decimals ? val.toFixed(1) : Math.round(val)).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(c => obs.observe(c));
}

// ============ Active nav link highlight ============
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path) link.classList.add('active-link');
  });
}

// ============ FAQ accordion ============
function initFaqAccordion() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q && q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        const ans = i.querySelector('.faq-a');
        if (ans) ans.style.display = 'none';
      });
      if (!isOpen) {
        item.classList.add('open');
        if (a) a.style.display = 'block';
      }
    });
  });
}

// ============ Simple form handling (login + newsletter etc.) ============
function initForms() {
  document.querySelectorAll('form[data-form]').forEach(form => {
    if (form.id === 'contact-form') return; // handled separately by initContactForm()
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const successEl = form.parentElement.querySelector('.form-success');
      form.style.display = 'none';
      if (successEl) successEl.style.display = 'block';

      if (form.id === 'login-form') {
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 900);
      }
    });
  });
}

// ============ Contact form -> Google Sheet submission ============
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const errorEl = form.querySelector('.form-error');
  const successEl = form.parentElement.querySelector('.form-success');
  const originalBtnText = submitBtn ? submitBtn.textContent : '';

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const sheetUrl = window.GOOGLE_SHEET_WEB_APP_URL;
    if (!sheetUrl || sheetUrl.indexOf('PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') !== -1) {
      console.error('Google Sheet Web App URL is not configured. Set window.GOOGLE_SHEET_WEB_APP_URL in contact.html.');
      if (errorEl) errorEl.style.display = 'block';
      return;
    }

    if (errorEl) errorEl.style.display = 'none';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }

    const formData = new FormData(form);
    const payload = {
      fullName: formData.get('fullName') || '',
      workEmail: formData.get('workEmail') || '',
      company: formData.get('company') || '',
      trainingType: formData.get('trainingType') || '',
      message: formData.get('message') || '',
      pageUrl: window.location.href,
      submittedAt: new Date().toISOString()
    };

    fetch(sheetUrl, {
      method: 'POST',
      // Apps Script Web Apps don't support custom request headers from the
      // browser without a CORS preflight, so we send plain text and parse
      // it as JSON on the Apps Script side.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.result !== 'success') throw new Error('Sheet write failed');
        form.style.display = 'none';
        if (successEl) successEl.style.display = 'block';
      })
      .catch((err) => {
        console.error('Contact form submission error:', err);
        if (errorEl) errorEl.style.display = 'block';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initScrollReveal();
  initCounters();
  setActiveNav();
  initFaqAccordion();
  initForms();
  initContactForm();
});
