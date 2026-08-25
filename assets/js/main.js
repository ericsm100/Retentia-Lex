/**
 * Retentia Lex — Comportamiento de interfaz
 * Navegación, revelado al hacer scroll, indicadores de progreso,
 * demostración interactiva y seguimiento de conversiones.
 */
(function () {
  'use strict';

  var CONFIG = window.RETENTIA_CONFIG || {};
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.documentElement.classList.remove('no-js');

  /* ============================================================
     Analítica — capa única para el seguimiento de conversiones
     ============================================================ */
  function track(eventName, payload) {
    var analytics = CONFIG.analytics || {};
    if (analytics.enabled === false) return;

    var data = Object.assign({ event: eventName }, payload || {});

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(data);

    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload || {});
    }
    if (analytics.debug) {
      console.info('[Retentia Lex] analytics:', data);
    }
  }
  window.retentiaTrack = track;

  /* ============================================================
     Enlace activo en la navegación
     ============================================================ */
  function markActiveNav() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    var links = document.querySelectorAll('.nav__link');
    Array.prototype.forEach.call(links, function (link) {
      var href = (link.getAttribute('href') || '').split('/').pop();
      if (href && href === path) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ============================================================
     Navegación móvil
     ============================================================ */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primary-nav');
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      if (!nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setOpen(false);
    });
  }

  /* ============================================================
     Cabecera al hacer scroll + barra CTA en móvil
     ============================================================ */
  function initScrollChrome() {
    var header = document.querySelector('.site-header');
    var mobileCta = document.querySelector('.mobile-cta');
    if (mobileCta) document.body.classList.add('has-mobile-cta');

    var ticking = false;
    function update() {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle('is-stuck', y > 8);
      if (mobileCta) mobileCta.classList.toggle('is-visible', y > 520);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* ============================================================
     Revelado suave al entrar en pantalla
     ============================================================ */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(items, function (el, index) {
      var group = el.closest('[data-reveal-group]');
      if (group && !el.style.getPropertyValue('--reveal-delay')) {
        var siblings = Array.prototype.slice.call(group.querySelectorAll('.reveal'));
        var position = siblings.indexOf(el);
        if (position > -1) el.style.setProperty('--reveal-delay', Math.min(position, 5) * 70 + 'ms');
      }
      observer.observe(el);
    });
  }

  /* ============================================================
     Indicador de progreso del proceso (Cómo funciona)
     ============================================================ */
  function initSteps() {
    var blocks = document.querySelectorAll('[data-steps]');
    if (!blocks.length) return;

    Array.prototype.forEach.call(blocks, function (block) {
      var steps = block.querySelectorAll('.step');
      var fill = block.querySelector('.steps__rail-fill');
      if (!steps.length) return;

      function activateUpTo(index) {
        Array.prototype.forEach.call(steps, function (step, i) {
          step.classList.toggle('is-active', i <= index);
        });
        if (fill) fill.style.width = ((index + 1) / steps.length) * 100 + '%';
      }

      if (reduceMotion || !('IntersectionObserver' in window)) {
        activateUpTo(steps.length - 1);
        return;
      }

      var highest = -1;
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var index = Array.prototype.indexOf.call(steps, entry.target);
          if (index > highest) {
            highest = index;
            activateUpTo(highest);
          }
        });
      }, { rootMargin: '0px 0px -35% 0px', threshold: 0.4 });

      Array.prototype.forEach.call(steps, function (step) { observer.observe(step); });
    });
  }

  /* ============================================================
     Demostración: conversación y pipeline por fases
     ============================================================ */
  function initDemo() {
    var demo = document.querySelector('[data-demo]');
    if (!demo) return;

    var stages = demo.querySelectorAll('[data-demo-stage]');
    if (!stages.length) return;

    function runSequence() {
      Array.prototype.forEach.call(stages, function (stage, index) {
        window.setTimeout(function () { stage.classList.add('is-on'); }, index * 520);
      });
    }

    if (reduceMotion || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(stages, function (stage) { stage.classList.add('is-on'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runSequence();
        observer.disconnect();
      });
    }, { threshold: 0.3 });

    observer.observe(demo);
  }

  /* ============================================================
     Acordeón FAQ — sólo uno abierto por grupo
     ============================================================ */
  function initFaq() {
    var groups = document.querySelectorAll('[data-faq]');
    Array.prototype.forEach.call(groups, function (group) {
      var items = group.querySelectorAll('details');
      Array.prototype.forEach.call(items, function (item) {
        item.addEventListener('toggle', function () {
          if (!item.open) return;
          track('faq_open', { question: (item.querySelector('summary') || {}).textContent });
          Array.prototype.forEach.call(items, function (other) {
            if (other !== item) other.open = false;
          });
        });
      });
    });
  }

  /* ============================================================
     Enlaces de reserva de cita (agenda externa)
     ============================================================ */
  function initBooking() {
    var booking = CONFIG.booking || {};
    if (!booking.url) return;
    var links = document.querySelectorAll('[data-booking]');
    Array.prototype.forEach.call(links, function (link) {
      link.setAttribute('href', booking.url);
      if (booking.openInNewTab) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener');
      }
    });
  }

  /* ============================================================
     Seguimiento de clics en CTA
     ============================================================ */
  function initCtaTracking() {
    document.addEventListener('click', function (event) {
      var cta = event.target.closest('[data-cta]');
      if (!cta) return;
      track('cta_click', {
        cta_id: cta.getAttribute('data-cta'),
        cta_text: (cta.textContent || '').trim().slice(0, 80),
        page: document.title
      });
    });
  }

  /* ============================================================
     Año actual en el pie
     ============================================================ */
  function initYear() {
    var nodes = document.querySelectorAll('[data-year]');
    Array.prototype.forEach.call(nodes, function (node) {
      node.textContent = String(new Date().getFullYear());
    });
  }

  function init() {
    markActiveNav();
    initNav();
    initScrollChrome();
    initReveal();
    initSteps();
    initDemo();
    initFaq();
    initBooking();
    initCtaTracking();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
