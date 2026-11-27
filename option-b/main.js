/* Option B: Main Street firm. Progressive enhancement only; the page works fully without this file. */
(function () {
  'use strict';

  /* Quick exit: replace this page in history so Back doesn't return here. */
  document.querySelectorAll('[data-quick-exit]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.replace(link.href);
    });
  });

  /* Mobile menu: close after choosing a link, and on Escape. */
  var menu = document.querySelector('.mobile-menu');
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) menu.open = false;
    });
    // Close when keyboard focus leaves the menu, so the open panel can't cover the next focused control.
    menu.addEventListener('focusout', function (e) {
      if (menu.open && e.relatedTarget && !menu.contains(e.relatedTarget)) menu.open = false;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.open && (menu.contains(document.activeElement) || document.activeElement === document.body)) {
        menu.open = false;
        menu.querySelector('summary').focus();
      }
    });
  }

  /* Motion idea: each section's oxblood rule draws in when the section enters view.
     Text is never hidden; only the decorative rule animates. */
  var sections = document.querySelectorAll('.section');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    sections.forEach(function (s) { s.classList.add('is-seen'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-seen');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* Preview form: validate natively, show inline errors, never send anything. */
  var form = document.querySelector('.consult-form');
  if (!form) return;
  form.noValidate = true; /* JS shows inline errors; without JS the browser's native validation runs. */
  var status = form.querySelector('#form-status');
  var statusTimer = null;

  var messages = {
    name: 'Error: Please enter your name.',
    phone: 'Error: Please enter a phone number.',
    email: 'Error: Please enter an email address, like name@example.com.',
    practice_area: 'Error: Please choose a practice area, or "Not sure".',
    contact_method: 'Error: Please choose how you would like us to contact you.',
    acknowledge: 'Error: Please check "I understand" to continue.'
  };

  function describedBy(el, id, add) {
    var ids = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    ids = ids.filter(function (x) { return x !== id; });
    if (add) ids.push(id);
    if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
    else el.removeAttribute('aria-describedby');
  }

  function errorFor(name) {
    var map = { name: 'f-name-err', phone: 'f-phone-err', email: 'f-email-err',
      practice_area: 'f-area-err', contact_method: 'f-method-err', acknowledge: 'f-ack-err' };
    return document.getElementById(map[name]);
  }

  function setError(name, show) {
    var err = errorFor(name);
    if (!err) return;
    var inputs = form.querySelectorAll('[name="' + name + '"]');
    var group = err.closest('.field');
    if (show) {
      var el = inputs[0];
      var msg = messages[name];
      if (name === 'email' && el.value && el.validity.typeMismatch) msg = 'Error: That email address looks incomplete. Please check it.';
      err.textContent = msg;
      err.hidden = false;
    } else {
      err.textContent = '';
      err.hidden = true;
    }
    if (group) group.classList.toggle('is-invalid', show);
    inputs.forEach(function (input) {
      if (input.type !== 'radio') {
        input.setAttribute('aria-invalid', show ? 'true' : 'false');
      }
      describedBy(input, err.id, show);
    });
  }

  function validateField(name) {
    var inputs = form.querySelectorAll('[name="' + name + '"]');
    if (!inputs.length) return true;
    var valid = Array.prototype.every.call(inputs, function (i) { return i.checkValidity(); });
    setError(name, !valid);
    return valid;
  }

  var required = Object.keys(messages);

  /* Clear an error as soon as the field becomes valid. */
  form.addEventListener('input', function (e) {
    var name = e.target.name;
    if (required.indexOf(name) > -1 && !errorFor(name).hidden) validateField(name);
  });
  form.addEventListener('change', function (e) {
    var name = e.target.name;
    if (required.indexOf(name) > -1 && !errorFor(name).hidden) validateField(name);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearTimeout(statusTimer);
    status.textContent = '';

    var firstInvalid = null;
    required.forEach(function (name) {
      if (!validateField(name) && !firstInvalid) firstInvalid = form.querySelector('[name="' + name + '"]');
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    /* Honeypot filled: treat as a bot and silently do nothing (at launch the server discards it too). */
    if (form.elements.company_website && form.elements.company_website.value) return;

    /* Re-set the text after a short delay so a repeat submit is announced again. */
    statusTimer = setTimeout(function () {
      status.textContent = 'Preview only. Nothing was sent.';
    }, 100);
  });
})();
