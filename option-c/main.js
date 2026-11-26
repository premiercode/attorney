/* Option C: "The brief". Progressive enhancement only; the page works without this file. */
(function () {
  'use strict';

  /* 1. Footnotes: hovering or focusing a marker lights its margin note, and vice versa. */
  function pair(ref) {
    var id = (ref.getAttribute('href') || '').slice(1);
    var note = id ? document.getElementById(id) : null;
    return note;
  }

  document.querySelectorAll('a.fn').forEach(function (ref) {
    var note = pair(ref);
    if (!note) return;
    var on = function () { ref.classList.add('is-lit'); note.classList.add('is-lit'); };
    var off = function () { ref.classList.remove('is-lit'); note.classList.remove('is-lit'); };
    ref.addEventListener('mouseenter', on);
    ref.addEventListener('mouseleave', off);
    ref.addEventListener('focus', on);
    ref.addEventListener('blur', off);
    note.addEventListener('mouseenter', on);
    note.addEventListener('mouseleave', off);

    // On wide screens the note is already beside the text, so don't jump; just light it.
    ref.addEventListener('click', function (e) {
      if (window.matchMedia('(min-width: 1100px)').matches) {
        var r = note.getBoundingClientRect();
        if (r.top >= 0 && r.bottom <= window.innerHeight) {
          e.preventDefault();
          on();
        }
      }
    });
  });

  /* 2. Quick exit: replace history so Back doesn't return here. */
  var exit = document.querySelector('[data-quick-exit]');
  if (exit) {
    exit.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.replace(exit.href);
    });
  }

  /* 3. Preview form: validate, show inline errors, never send. */
  var form = document.getElementById('consult-form');
  if (!form) return;
  form.setAttribute('novalidate', '');

  var status = form.querySelector('[data-status]');
  var desc = form.querySelector('#f-desc');
  var count = form.querySelector('[data-count]');

  var messages = {
    'f-name': 'Please enter your name.',
    'f-phone': 'Please enter a phone number.',
    'f-email': 'Please enter a valid email address.',
    'f-area': 'Please choose a practice area, or “Not sure.”',
    'f-ack': 'Please check “I understand” to continue.'
  };

  function errFor(field) {
    var ids = (field.getAttribute('aria-describedby') || '').split(' ');
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el && el.classList.contains('err')) return el;
    }
    return null;
  }

  function check(field) {
    var err = errFor(field);
    if (!err) return true;
    if (field.checkValidity()) {
      field.removeAttribute('aria-invalid');
      err.hidden = true;
      err.textContent = '';
      return true;
    }
    field.setAttribute('aria-invalid', 'true');
    err.textContent = messages[field.id] || field.validationMessage;
    err.hidden = false;
    return false;
  }

  var required = Array.prototype.slice.call(form.querySelectorAll('[required]'));

  required.forEach(function (field) {
    var evt = field.type === 'checkbox' || field.tagName === 'SELECT' ? 'change' : 'blur';
    field.addEventListener(evt, function () {
      if (field.getAttribute('aria-invalid') === 'true' || field.value) check(field);
    });
    field.addEventListener('input', function () {
      if (field.getAttribute('aria-invalid') === 'true') check(field);
    });
  });

  if (desc && count) {
    var update = function () { count.textContent = desc.value.length + ' of 300 used.'; };
    desc.addEventListener('input', update);
    update();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';
    var firstBad = null;
    required.forEach(function (field) {
      if (!check(field) && !firstBad) firstBad = field;
    });
    if (firstBad) {
      firstBad.focus();
      status.textContent = 'Please fix the marked fields above.';
      return;
    }
    status.textContent = 'Preview only. Nothing was sent.';
  });
})();
