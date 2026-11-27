/* Option C: Warm counsel. Progressive enhancement only; the page works fully without this file. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  /* ---------- Quick exit: replace this page in history so Back doesn't return here ---------- */
  document.querySelectorAll('[data-quick-exit]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      window.location.replace(link.href);
    });
  });

  /* ---------- Settle-in reveal (CSS hides .settle only under .js and no reduced motion) ---------- */
  var settles = Array.prototype.slice.call(document.querySelectorAll('.settle'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    settles.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    // Siblings arrive one after another, like pages set down in turn.
    settles.forEach(function (el) {
      var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
        return c.classList.contains('settle');
      });
      el.style.setProperty('--settle-delay', (siblings.indexOf(el) * 90) + 'ms');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    settles.forEach(function (el) { io.observe(el); });
    // A focused control inside a card that hasn't settled yet makes the card visible at once.
    document.addEventListener('focusin', function (e) {
      var s = e.target.closest && e.target.closest('.settle');
      if (s) s.classList.add('is-in');
    });
  }

  /* ---------- Preview form ---------- */
  var form = document.getElementById('consult-form');
  if (!form) return;
  form.noValidate = true;

  var status = document.getElementById('form-status');
  var statusTimer = null;
  var attempted = false;

  function announce(message, state) {
    // Clear first, then set after a short pause, so a repeat submit is announced again.
    clearTimeout(statusTimer);
    status.textContent = '';
    status.removeAttribute('data-state');
    statusTimer = setTimeout(function () {
      if (state) status.setAttribute('data-state', state);
      status.textContent = message;
    }, 100);
  }

  function messageFor(control) {
    var v = control.validity;
    if (v.valueMissing) return control.dataset.msgMissing || 'This field is required.';
    if (v.typeMismatch) return control.dataset.msgType || 'Check the format of this field.';
    if (v.patternMismatch) return control.dataset.msgPattern || 'Check the format of this field.';
    if (v.tooLong) return 'Keep this under ' + control.maxLength + ' characters.';
    return control.validationMessage;
  }

  // The element that carries aria-invalid / aria-describedby for a field.
  function targetOf(field) {
    return field.matches('fieldset') ? field : field.querySelector('input, select, textarea');
  }

  function setError(field, message) {
    // For the radio group, describe each radio too: screen readers don't reliably read a fieldset's description.
    if (field.matches('fieldset')) {
      field.querySelectorAll('input[type="radio"]').forEach(function (r) {
        var ids = (r.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (x) { return x && x !== (field.querySelector('.field__error') || {}).id; });
        if (message) { ids.push(field.querySelector('.field__error').id); r.setAttribute('aria-invalid', 'true'); } else { r.removeAttribute('aria-invalid'); }
        if (ids.length) r.setAttribute('aria-describedby', ids.join(' ')); else r.removeAttribute('aria-describedby');
      });
    }
    var target = targetOf(field);
    var error = field.querySelector('.field__error');
    if (!target || !error) return;
    var base = target.dataset.describedby || '';
    if (message) {
      error.textContent = 'Error: ' + message;
      error.hidden = false;
      target.setAttribute('aria-invalid', 'true');
      // The radios carry the description themselves; describing the fieldset too would read it twice.
      if (!field.matches('fieldset')) target.setAttribute('aria-describedby', (base + ' ' + error.id).trim());
    } else {
      error.textContent = '';
      error.hidden = true;
      target.removeAttribute('aria-invalid');
      if (base) target.setAttribute('aria-describedby', base);
      else target.removeAttribute('aria-describedby');
    }
  }

  function validate(field) {
    var controls = field.querySelectorAll('input, select, textarea');
    var invalid = null;
    for (var i = 0; i < controls.length; i++) {
      if (!controls[i].checkValidity()) { invalid = controls[i]; break; }
    }
    setError(field, invalid ? messageFor(invalid) : '');
    return invalid;
  }

  var fields = Array.prototype.slice.call(form.querySelectorAll('[data-field]'))
    .filter(function (f) { return f.querySelector('.field__error'); });

  fields.forEach(function (field) {
    field.addEventListener('change', function () { if (attempted) validate(field); });
    field.addEventListener('input', function () { if (attempted) validate(field); });
  });

  // Character count for the short description (maxlength enforces the limit).
  var desc = document.getElementById('f-desc');
  var count = document.getElementById('f-desc-count');
  if (desc && count) {
    desc.addEventListener('input', function () {
      var left = desc.maxLength - desc.value.length;
      count.textContent = left + (left === 1 ? ' character left.' : ' characters left.');
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    attempted = true;

    var firstInvalid = null;
    var invalidCount = 0;
    fields.forEach(function (field) {
      var bad = validate(field);
      if (bad) {
        invalidCount++;
        if (!firstInvalid) firstInvalid = bad;
      }
    });

    if (firstInvalid) {
      announce(invalidCount === 1
        ? 'One field needs attention. It is marked Error.'
        : invalidCount + ' fields need attention. Each is marked Error.', 'error');
      firstInvalid.focus();
      return;
    }

    // Honeypot filled means a bot. At launch the server drops it; here we just stop quietly.
    var honeypot = form.querySelector('[name="company_website"]');
    if (honeypot && honeypot.value) return;

    announce('Preview only. Nothing was sent.');
  });
})();
