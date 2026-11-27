/* Option C: "The brief". Progressive enhancement only; the page works without this file. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* 1. Glossed terms: hovering a red-underlined term lights its margin note, and the reverse. */
  document.querySelectorAll('.gloss[data-gloss]').forEach(function (term) {
    var note = document.querySelector('.note[data-note="' + term.getAttribute('data-gloss') + '"]');
    if (!note) return;
    var on = function () { term.classList.add('is-lit'); note.classList.add('is-lit'); };
    var off = function () { term.classList.remove('is-lit'); note.classList.remove('is-lit'); };
    [term, note].forEach(function (el) {
      el.addEventListener('mouseenter', on);
      el.addEventListener('mouseleave', off);
    });
  });

  /* 2. Side-head rules: the double rule over each heading draws in once, as the section arrives. */
  var heads = Array.prototype.slice.call(document.querySelectorAll('.side-head'));
  if (reduce || !hasIO) {
    heads.forEach(function (h) { h.classList.add('is-in'); });
  } else {
    var ruleIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); ruleIO.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    heads.forEach(function (h) { ruleIO.observe(h); });
  }

  /* 3. Running head: once the cover is out of view, a slim line names the part being read. */
  var rh = document.querySelector('[data-running-head]');
  var rhName = rh && rh.querySelector('[data-rh-section]');
  var cover = document.querySelector('.cover');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main [data-section]'));
  if (rh && rhName && cover && hasIO) {
    rh.hidden = false;
    var setShown = function (shown) {
      rh.classList.toggle('is-shown', shown);
      // If focus is inside the bar as it hides, hand it to the hero heading first.
      if (!shown && rh.contains(document.activeElement)) {
        var h = document.getElementById('hero-h');
        h.setAttribute('tabindex', '-1');
        h.focus({ preventScroll: true });
      }
      // inert keeps the hidden bar out of the tab order and the accessibility tree.
      rh.inert = !shown;
      // Browsers without inert: at least keep the hidden bar's links out of the tab order.
      if (!('inert' in HTMLElement.prototype)) {
        rh.querySelectorAll('a').forEach(function (a) { a.tabIndex = shown ? 0 : -1; });
      }
    };
    setShown(false);
    new IntersectionObserver(function (entries) {
      setShown(!entries[0].isIntersecting);
    }, { rootMargin: '-60px 0px 0px 0px' }).observe(cover);

    // The current section is the last one whose top has passed the upper third of the screen.
    var update = function () {
      var line = window.innerHeight * 0.33;
      var current = sections[0];
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= line) current = sections[i];
      }
      var name = current ? current.getAttribute('data-section') : '';
      if (rhName.textContent !== name) rhName.textContent = name;
    };
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });
    update();
  }

  /* 4. Quick exit: replace history so Back doesn't return here. */
  var exit = document.querySelector('[data-quick-exit]');
  if (exit) {
    exit.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.replace(exit.href);
    });
  }

  /* 5. Preview form: validate, show inline errors, never send. */
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
    var updateCount = function () { count.textContent = desc.value.length + ' of 300 used.'; };
    desc.addEventListener('input', updateCount);
    updateCount();
  }

  // Set the message a tick after clearing it so a repeat submit is announced again.
  var announce = function (msg) { setTimeout(function () { status.textContent = msg; }, 50); };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';
    var firstBad = null;
    required.forEach(function (field) {
      if (!check(field) && !firstBad) firstBad = field;
    });
    if (firstBad) {
      firstBad.focus();
      announce('Please fix the marked fields above.');
      return;
    }
    announce('Preview only. Nothing was sent.');
  });
})();
