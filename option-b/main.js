/* Option B: Modern counsel. Progressive enhancement only; the page works fully without this file. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- The consultation path draws itself in once, when it is seen ---------- */
  var path = document.querySelector('[data-path]');
  if (path) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      path.classList.add('is-drawn');
    } else {
      var pathIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { path.classList.add('is-drawn'); pathIo.disconnect(); }
        });
      }, { threshold: 0.35 });
      pathIo.observe(path);
      /* Never leave it half drawn when printing. */
      window.addEventListener('beforeprint', function () { path.classList.add('is-drawn'); });
    }
  }

  /* ---------- Current-section highlight in the nav ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a[href^="#"]'));
  if ('IntersectionObserver' in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link) { return; }
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.remove('is-current'); });
          link.classList.add('is-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) { spy.observe(section); }
    });
  }

  /* ---------- Insight cards are samples: links do nothing ---------- */
  document.querySelectorAll('a[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* ---------- Preview form ---------- */
  var form = document.getElementById('consult-form');
  if (!form) { return; }
  form.noValidate = true; /* JS shows its own inline errors; without JS the browser's native validation runs. */
  var status = form.querySelector('.form-status');
  var textarea = form.querySelector('#f-msg');
  var counter = form.querySelector('[data-count]');

  if (textarea && counter) {
    var updateCount = function () { counter.textContent = textarea.value.length + ' of 300 used'; };
    textarea.addEventListener('input', updateCount);
    updateCount();
  }

  /* Each check maps a control (or radio group) to its inline error message. */
  var checks = [
    { el: form.querySelector('#f-name'), err: 'f-name-err' },
    { el: form.querySelector('#f-phone'), err: 'f-phone-err' },
    { el: form.querySelector('#f-email'), err: 'f-email-err' },
    { el: form.querySelector('#f-area'), err: 'f-area-err' },
    { el: form.querySelector('#f-time'), err: 'f-time-err' },
    { group: 'contact_method', wrap: form.querySelector('.field--radios'), err: 'f-method-err' },
    { el: form.querySelector('#f-msg'), err: 'f-msg-err' },
    { el: form.querySelector('#f-ack'), wrap: form.querySelector('.field--check'), err: 'f-ack-err' }
  ];

  function isValid(check) {
    if (check.group) {
      return !!form.querySelector('input[name="' + check.group + '"]:checked');
    }
    if (check.el.type !== 'checkbox' && check.el.value.trim() === '' && check.el.required) { return false; }
    return check.el.checkValidity();
  }

  function setState(check, ok) {
    var msg = document.getElementById(check.err);
    if (msg) { msg.hidden = ok; }
    if (check.group) {
      check.wrap.classList.toggle('is-invalid', !ok);
      form.querySelectorAll('input[name="' + check.group + '"]').forEach(function (r) {
        if (ok) { r.removeAttribute('aria-invalid'); } else { r.setAttribute('aria-invalid', 'true'); }
      });
      return;
    }
    if (ok) { check.el.removeAttribute('aria-invalid'); } else { check.el.setAttribute('aria-invalid', 'true'); }
    if (check.wrap) { check.wrap.classList.toggle('is-invalid', !ok); }
  }

  function firstFocusable(check) {
    return check.group ? form.querySelector('input[name="' + check.group + '"]') : check.el;
  }

  /* Clear an error as soon as the visitor fixes it. */
  checks.forEach(function (check) {
    var targets = check.group
      ? Array.prototype.slice.call(form.querySelectorAll('input[name="' + check.group + '"]'))
      : [check.el];
    targets.forEach(function (t) {
      var evt = (t.tagName === 'SELECT' || t.type === 'radio' || t.type === 'checkbox') ? 'change' : 'input';
      t.addEventListener(evt, function () {
        var msg = document.getElementById(check.err);
        if (msg && !msg.hidden && isValid(check)) { setState(check, true); }
      });
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';

    var firstBad = null;
    checks.forEach(function (check) {
      var ok = isValid(check);
      setState(check, ok);
      if (!ok && !firstBad) { firstBad = check; }
    });

    if (firstBad) {
      var target = firstFocusable(firstBad);
      if (target) { target.focus(); }
      return;
    }

    status.textContent = 'Preview only. Nothing was sent.';
  });
})();
