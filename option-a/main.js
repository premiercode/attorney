/* Option A: Quiet authority. Progressive enhancement only; the page works fully without this file. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  /* ---- Slow reveals and drawn gold rules ---- */
  var targets = document.querySelectorAll('.reveal, .rule, .steps, .interlude');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    /* Anything already on screen at start-up is shown at once, without a late fade. */
    var instant = [];
    targets.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
        el.classList.add('is-instant', 'is-in');
        instant.push(el);
      } else {
        io.observe(el);
      }
    });
    if (instant.length) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          instant.forEach(function (el) { el.classList.remove('is-instant'); });
        });
      });
    }

    /* Safety net: never leave content hidden if an observer callback is missed. */
    window.addEventListener('load', function () {
      setTimeout(function () {
        targets.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in');
        });
      }, 300);
    });
  }

  /* ---- Quick exit: replace this page in history so Back doesn't return here ---- */
  var exit = document.querySelector('.quick-exit');
  if (exit) {
    exit.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.replace(exit.href);
    });
  }

  /* ---- Sample article links are disabled in the preview ---- */
  document.querySelectorAll('a[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* ---- Preview form: validate inline, never send ---- */
  var form = document.getElementById('consult-form');
  if (!form) return;

  form.setAttribute('novalidate', '');
  var status = form.querySelector('.form__status');
  var desc = form.querySelector('#f-desc');
  var counter = form.querySelector('[data-count]');

  function updateCount() {
    if (!desc || !counter) return;
    counter.textContent = desc.value.length + ' / 300';
  }
  if (desc) { desc.addEventListener('input', updateCount); updateCount(); }

  function messageFor(field) {
    var v = field.validity;
    var label = field.id === 'f-ack' ? '' : (form.querySelector('label[for="' + field.id + '"]') || {}).textContent;
    if (v.valueMissing) {
      if (field.type === 'checkbox') return 'Please check "I understand" to continue.';
      if (field.tagName === 'SELECT') return 'Please choose a practice area, or "Not sure".';
      return 'Please enter your ' + (label || 'details').trim().toLowerCase() + '.';
    }
    if (v.typeMismatch && field.type === 'email') return 'Please enter an email address like name@example.com.';
    return field.validationMessage;
  }

  function showError(field) {
    var err = document.getElementById(field.id + '-err');
    if (field.checkValidity()) {
      field.removeAttribute('aria-invalid');
      if (err) { err.hidden = true; err.textContent = ''; }
      return true;
    }
    field.setAttribute('aria-invalid', 'true');
    if (err) { err.textContent = messageFor(field); err.hidden = false; }
    return false;
  }

  var fields = form.querySelectorAll('input[required], select[required], textarea[required]');
  fields.forEach(function (f) {
    var evt = (f.type === 'checkbox' || f.tagName === 'SELECT') ? 'change' : 'blur';
    f.addEventListener(evt, function () { if (f.hasAttribute('aria-invalid') || f.value) showError(f); });
    f.addEventListener('input', function () { if (f.hasAttribute('aria-invalid')) showError(f); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';
    var firstInvalid = null;
    fields.forEach(function (f) {
      if (!showError(f) && !firstInvalid) firstInvalid = f;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    /* Honeypot filled: silently do nothing (a real backend would discard it). */
    var hp = form.querySelector('[name="company_website"]');
    if (hp && hp.value) return;

    status.textContent = 'Preview only. Nothing was sent.';
  });
})();
