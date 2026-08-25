/**
 * Retentia Lex — Formularios
 * Validación accesible, envío preparado para CRM y seguimiento
 * de conversiones. Ver assets/js/config.js para las integraciones.
 */
(function () {
  'use strict';

  var CONFIG = window.RETENTIA_CONFIG || {};

  var MESSAGES = {
    required: 'Este campo es obligatorio.',
    email: 'Introduzca un email válido.',
    tel: 'Introduzca un teléfono válido.',
    select: 'Seleccione una opción.',
    radio: 'Seleccione una opción.',
    consent: 'Debe aceptar el tratamiento de sus datos para continuar.',
    minlength: 'Añada algo más de detalle, por favor.'
  };

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var TEL_RE = /^[+0-9()\s.-]{7,20}$/;

  function fieldOf(input) {
    return input.closest('.field') || input.closest('fieldset') || input.parentElement;
  }

  function errorNodeOf(input) {
    var describedBy = input.getAttribute('aria-describedby');
    if (describedBy) {
      var byId = document.getElementById(describedBy.split(' ')[0]);
      if (byId && byId.classList.contains('error-msg')) return byId;
    }
    var field = fieldOf(input);
    return field ? field.querySelector('.error-msg') : null;
  }

  function showError(input, message) {
    var field = fieldOf(input);
    var node = errorNodeOf(input);
    if (field) field.classList.add('has-error');
    if (node) node.textContent = message;
    input.setAttribute('aria-invalid', 'true');
  }

  function clearError(input) {
    var field = fieldOf(input);
    var node = errorNodeOf(input);
    if (field) field.classList.remove('has-error');
    if (node) node.textContent = '';
    input.removeAttribute('aria-invalid');
  }

  function validateInput(input) {
    var value = (input.value || '').trim();
    var type = input.type;

    if (type === 'checkbox') {
      if (input.required && !input.checked) {
        showError(input, MESSAGES.consent);
        return false;
      }
      clearError(input);
      return true;
    }

    if (input.required && !value) {
      showError(input, input.tagName === 'SELECT' ? MESSAGES.select : MESSAGES.required);
      return false;
    }
    if (value && type === 'email' && !EMAIL_RE.test(value)) {
      showError(input, MESSAGES.email);
      return false;
    }
    if (value && type === 'tel' && !TEL_RE.test(value)) {
      showError(input, MESSAGES.tel);
      return false;
    }
    var min = parseInt(input.getAttribute('minlength'), 10);
    if (value && min && value.length < min) {
      showError(input, MESSAGES.minlength);
      return false;
    }
    clearError(input);
    return true;
  }

  function validateRadioGroup(fieldset) {
    var radios = fieldset.querySelectorAll('input[type="radio"]');
    if (!radios.length) return true;
    var required = Array.prototype.some.call(radios, function (r) { return r.required; });
    if (!required) return true;

    var checked = Array.prototype.some.call(radios, function (r) { return r.checked; });
    var node = fieldset.querySelector('.error-msg');
    if (!checked) {
      fieldset.classList.add('has-error');
      if (node) node.textContent = MESSAGES.radio;
      fieldset.setAttribute('aria-invalid', 'true');
      return false;
    }
    fieldset.classList.remove('has-error');
    if (node) node.textContent = '';
    fieldset.removeAttribute('aria-invalid');
    return true;
  }

  function collectData(form) {
    var data = {};
    var formData = new FormData(form);
    formData.forEach(function (value, key) {
      if (key === '_gotcha') return;
      if (data[key] !== undefined) {
        data[key] = [].concat(data[key], value);
      } else {
        data[key] = typeof value === 'string' ? value.trim() : value;
      }
    });

    if ((CONFIG.crm || {}).includeMetadata !== false) {
      data._meta = {
        formId: form.getAttribute('id') || 'form',
        page: window.location.pathname,
        pageTitle: document.title,
        referrer: document.referrer || null,
        submittedAt: new Date().toISOString(),
        utm: readUtm()
      };
    }
    return data;
  }

  function readUtm() {
    var params = new URLSearchParams(window.location.search);
    var utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach(function (key) {
      var value = params.get(key);
      if (value) utm[key] = value;
    });
    return Object.keys(utm).length ? utm : null;
  }

  function setStatus(form, type, message) {
    var box = form.querySelector('.form-status');
    if (!box) return;
    box.className = 'form-status is-visible form-status--' + type;
    box.textContent = message;
  }

  function hideStatus(form) {
    var box = form.querySelector('.form-status');
    if (!box) return;
    box.className = 'form-status';
    box.textContent = '';
  }

  function initForm(form) {
    var inputs = form.querySelectorAll('input, select, textarea');
    var fieldsets = form.querySelectorAll('fieldset[data-required-group]');

    Array.prototype.forEach.call(inputs, function (input) {
      if (input.type === 'radio' || input.name === '_gotcha') return;
      input.addEventListener('blur', function () { validateInput(input); });
      input.addEventListener('input', function () {
        var field = fieldOf(input);
        if (field && field.classList.contains('has-error')) validateInput(input);
      });
    });

    Array.prototype.forEach.call(fieldsets, function (fieldset) {
      fieldset.addEventListener('change', function () {
        if (fieldset.classList.contains('has-error')) validateRadioGroup(fieldset);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      hideStatus(form);

      var firstInvalid = null;
      var valid = true;

      Array.prototype.forEach.call(inputs, function (input) {
        if (input.type === 'radio' || input.name === '_gotcha') return;
        if (!validateInput(input)) {
          valid = false;
          if (!firstInvalid) firstInvalid = input;
        }
      });

      Array.prototype.forEach.call(fieldsets, function (fieldset) {
        if (!validateRadioGroup(fieldset)) {
          valid = false;
          if (!firstInvalid) firstInvalid = fieldset.querySelector('input');
        }
      });

      if (!valid) {
        setStatus(form, 'error', 'Revise los campos marcados para poder enviar la solicitud.');
        if (firstInvalid) {
          firstInvalid.focus({ preventScroll: true });
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Trampa antispam: si está rellena, se descarta silenciosamente.
      var honeypot = form.querySelector('input[name="_gotcha"]');
      if (honeypot && honeypot.value) return;

      submitForm(form);
    });
  }

  function submitForm(form) {
    var button = form.querySelector('[type="submit"]');
    var originalLabel = button ? button.textContent : '';
    var data = collectData(form);
    var crm = CONFIG.crm || {};

    if (button) {
      button.disabled = true;
      button.textContent = 'Enviando…';
    }

    function onSuccess() {
      if (typeof window.retentiaTrack === 'function') {
        window.retentiaTrack('lead_submit', {
          form_id: form.getAttribute('id') || 'form',
          objective: data.objetivo || null,
          team_size: data.profesionales || null
        });
      }
      form.reset();
      if (button) {
        button.disabled = false;
        button.textContent = originalLabel;
      }
      var redirect = form.getAttribute('data-success-url') || CONFIG.successUrl;
      if (redirect) {
        window.location.href = redirect;
        return;
      }
      setStatus(form, 'ok', 'Solicitud recibida. Le responderemos al email indicado para concretar la auditoría.');
    }

    function onError() {
      if (button) {
        button.disabled = false;
        button.textContent = originalLabel;
      }
      var email = (CONFIG.contact || {}).email;
      setStatus(form, 'error',
        'No hemos podido enviar la solicitud en este momento.' +
        (email ? ' Puede escribirnos directamente a ' + email + '.' : ' Inténtelo de nuevo en unos minutos.'));
    }

    // Sin endpoint configurado: modo demostración, sin envío de datos.
    if (!crm.endpoint) {
      window.setTimeout(onSuccess, 350);
      return;
    }

    fetch(crm.endpoint, {
      method: crm.method || 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json', Accept: 'application/json' }, crm.headers || {}),
      body: JSON.stringify(data)
    })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        onSuccess();
      })
      .catch(onError);
  }

  function init() {
    var forms = document.querySelectorAll('[data-form]');
    Array.prototype.forEach.call(forms, initForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
