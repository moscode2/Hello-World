(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const PHONE = '254110626022';
  const RESUME_URL = 'https://resume-silk-gamma.vercel.app/';
  const DEFAULT_WA = "Hi Moses, I found your portfolio and I'd like to talk about a project.";
  const waUrl = (text) => `https://wa.me/${PHONE}${text ? '?text=' + encodeURIComponent(text) : ''}`;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── WhatsApp links get their prefilled message from data-wa ── */
  $$('[data-wa]').forEach((a) => { a.href = waUrl(a.dataset.wa || DEFAULT_WA); });

  /* ── Scroll reveal (one simple observer) ── */
  const reveals = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  }

  /* ── Header background on scroll ── */
  const header = $('#site-header');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      header.classList.toggle('scrolled', window.scrollY > 40);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile navigation ── */
  const nav = $('#site-nav');
  const toggle = $('.nav-toggle');
  const setNav = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('nav-open', open);
  };
  toggle.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); toggle.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && !e.target.closest('#site-nav, .nav-toggle')) setNav(false);
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => { if (e.matches) setNav(false); });

  /* ── Active section in nav ── */
  const navLinks = $$('.site-nav a[href^="#"]').filter((a) => !a.classList.contains('btn'));
  if ('IntersectionObserver' in window) {
    const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => {
          if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ── Project screenshots: fall back to a typographic cover if the image is missing ── */
  $$('.mock-screen img').forEach((img) => {
    const fail = () => img.closest('.mock-screen').classList.add('no-img');
    if (img.complete && img.naturalWidth === 0) fail();
    img.addEventListener('error', fail);
  });

  /* ── Project videos: play muted while on screen, pause when off screen,
        with a visible pause/play button. Reduced-motion visitors get no autoplay. ── */
  const videoIO = ('IntersectionObserver' in window && !reduceMotion)
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          const v = e.target;
          if (v.dataset.userPaused === '1') return;
          if (e.isIntersecting) v.play().catch(() => {}); else v.pause();
        });
      }, { threshold: 0.35 })
    : null;

  $$('.mock-screen video').forEach((v) => {
    const screen = v.closest('.mock-screen');
    const sources = $$('source', v);
    (sources.length ? sources[sources.length - 1] : v).addEventListener('error', () => screen.classList.add('no-img'));

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mock-toggle';
    const sync = () => {
      const playing = !v.paused;
      btn.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
      btn.innerHTML = `<i class="fas fa-${playing ? 'pause' : 'play'}" aria-hidden="true"></i>`;
    };
    btn.addEventListener('click', () => {
      if (v.paused) { v.dataset.userPaused = ''; v.play().catch(() => {}); }
      else { v.dataset.userPaused = '1'; v.pause(); }
    });
    v.addEventListener('play', sync);
    v.addEventListener('pause', sync);
    sync();
    screen.appendChild(btn);
    if (videoIO) videoIO.observe(v);
  });

  /* ── CV link: if the PDF isn't uploaded yet, fall back to the live résumé ── */
  const cvLinks = $$('.cv-link');
  if (cvLinks.length && location.protocol.startsWith('http')) {
    fetch(cvLinks[0].getAttribute('href'), { method: 'HEAD' })
      .then((r) => {
        const type = r.headers.get('content-type') || '';
        if (!r.ok || !type.includes('pdf')) throw new Error('no cv');
      })
      .catch(() => {
        cvLinks.forEach((a) => {
          a.href = RESUME_URL;
          a.removeAttribute('download');
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          const label = $('.cv-label', a);
          if (label) label.textContent = 'View résumé';
          const icon = $('i', a);
          if (icon) icon.className = 'fas fa-arrow-up-right-from-square';
        });
      });
  }

  /* ── Dialogs (native <dialog>: focus trap, Esc and focus return come built in) ── */
  const openers = new WeakMap();
  const openDialog = (dlg, opener) => {
    openers.set(dlg, opener);
    dlg.showModal();
  };
  $$('dialog').forEach((dlg) => {
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });   // backdrop click
    dlg.addEventListener('close', () => {
      const o = openers.get(dlg);
      if (o && document.contains(o)) o.focus();
    });
  });
  $$('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
  $$('[data-close-first]').forEach((a) => a.addEventListener('click', () => a.closest('dialog').close()));

  const certDialog = $('#cert-dialog');
  $$('.cert-open').forEach((btn) => {
    btn.addEventListener('click', () => {
      const img = $('#cert-img');
      img.src = btn.dataset.src;
      img.alt = btn.dataset.title;
      $('#cert-title').textContent = btn.dataset.title;
      openDialog(certDialog, btn);
    });
  });

  const csDialog = $('#cs-dialog');
  const csBody = $('#cs-body');
  $$('.cs-open').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tpl = document.getElementById(btn.dataset.template);
      if (!tpl) return;
      csBody.replaceChildren(tpl.content.cloneNode(true));
      const title = $('.cs-title', csBody);
      if (title) {
        title.id = 'cs-title';
        csDialog.setAttribute('aria-labelledby', 'cs-title');
        csDialog.removeAttribute('aria-label');
      }
      csDialog.scrollTop = 0;
      openDialog(csDialog, btn);
    });
  });

  /* ── Contact form ── */
  const form = $('#contact-form');
  const status = $('#form-status');
  const submitBtn = $('.form-submit', form);
  const submitLabel = $('.submit-label', form);
  const field = (key) => $('#f-' + key);

  const rules = {
    name: (v) => v.trim().length >= 2 || 'Please enter your full name.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Please enter a valid email address.',
    enquiry: (v) => !!v || 'Please choose what this is about.',
    message: (v) => v.trim().length >= 10 || 'Please tell me a little more (at least 10 characters).',
  };

  const validate = (key) => {
    const el = field(key);
    const result = rules[key](el.value);
    const msg = result === true ? '' : result;
    $('#err-' + key).textContent = msg;
    if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    return !msg;
  };

  Object.keys(rules).forEach((key) => {
    const el = field(key);
    el.addEventListener('blur', () => validate(key));
    el.addEventListener('input', () => { if (el.getAttribute('aria-invalid')) validate(key); });
    el.addEventListener('change', () => { if (el.getAttribute('aria-invalid')) validate(key); });
  });

  const showStatus = (kind, html) => {
    status.className = 'form-status ' + kind;
    status.innerHTML = html;
  };

  const setLoading = (on) => {
    submitBtn.disabled = on;
    submitBtn.classList.toggle('loading', on);
    submitBtn.setAttribute('aria-busy', String(on));
    submitLabel.textContent = on ? 'Sending…' : 'Send message →';
  };

  /* WhatsApp button in the contact section mirrors what's typed in the form */
  const waContact = $('#wa-contact');
  const updateWaFromForm = () => {
    const name = field('name').value.trim();
    const enquiry = field('enquiry').value;
    const project = field('project').value;
    const msg = field('message').value.trim();
    let text = "Hi Moses, I found your portfolio";
    text += project ? ` and I'd like to talk about a ${project.toLowerCase()} project.` : " and I'd like to talk about a project.";
    if (enquiry) text += ` (${enquiry})`;
    if (name) text += ` My name is ${name}.`;
    if (msg) text += ` ${msg.slice(0, 300)}`;
    waContact.href = waUrl(text);
  };
  ['name', 'enquiry', 'project', 'message'].forEach((k) => {
    field(k).addEventListener('input', updateWaFromForm);
    field(k).addEventListener('change', updateWaFromForm);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    const results = Object.keys(rules).map(validate);
    if (results.includes(false)) {
      const firstBad = Object.keys(rules).find((k) => field(k).getAttribute('aria-invalid'));
      showStatus('bad', 'Please fix the highlighted fields and try again.');
      if (firstBad) field(firstBad).focus();
      return;
    }

    const data = new FormData(form);
    if (data.get('_gotcha')) { showStatus('ok', 'Thanks!'); return; }   // bot caught by honeypot
    data.set('_subject', `Portfolio enquiry: ${data.get('enquiry_type')} — ${data.get('name')}`);

    setLoading(true);
    showStatus('ok', 'Sending your message…');

    try {
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('Request failed: ' + res.status);
      const email = field('email').value.trim();
      form.reset();
      lastPrefillMessage = '';
      updateWaFromForm();
      const safeEmail = email.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      showStatus('ok', `<strong>Thank you, your message has been sent.</strong> I'll reply to ${safeEmail}.`);
    } catch (err) {
      // Fields are left untouched so nothing the visitor typed is lost.
      showStatus('bad',
        `<strong>Sorry, that didn't send.</strong> Your message is still in the form, so you can try again. ` +
        `Or reach me directly: <a href="mailto:moisesmoses002@gmail.com">email</a> or <a href="${waContact.href}" target="_blank" rel="noopener noreferrer">WhatsApp</a>.`);
    } finally {
      setLoading(false);
    }
  });

  /* ── Prefill the form from any CTA (services, hero, project cards…) ── */
  let lastPrefillMessage = '';
  const decode = (s) => { const t = document.createElement('textarea'); t.innerHTML = s; return t.value; };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-prefill-enquiry], [data-prefill-project], [data-prefill-message]');
    if (!a) return;
    const { prefillEnquiry, prefillProject, prefillMessage } = a.dataset;
    if (prefillEnquiry && !field('enquiry').value) field('enquiry').value = prefillEnquiry;
    if (prefillProject) field('project').value = prefillProject;
    if (prefillMessage) {
      const msgEl = field('message');
      if (!msgEl.value.trim() || msgEl.value === lastPrefillMessage) {
        lastPrefillMessage = decode(prefillMessage);
        msgEl.value = lastPrefillMessage;
      }
    }
    ['enquiry'].forEach((k) => { if (field(k).value) validate(k); });
    updateWaFromForm();
  });

  updateWaFromForm();
})();