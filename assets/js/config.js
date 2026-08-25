/**
 * Retentia Lex — Configuración del sitio
 * ---------------------------------------------------------------
 * Punto único de configuración para las integraciones externas.
 * Al conectar un CRM, un sistema de agenda o una herramienta de
 * analítica, basta con editar este fichero: el resto del sitio
 * lee siempre estos valores.
 */
window.RETENTIA_CONFIG = {
  /* -----------------------------------------------------------
     CRM / destino de los formularios
     -----------------------------------------------------------
     endpoint: URL a la que se envían los leads (POST JSON).
               Compatible con HubSpot Forms API, Pipedrive, Zapier,
               Make, n8n o un endpoint propio.
               Si se deja en null, el formulario funciona en modo
               demostración: valida, muestra confirmación y registra
               el evento de analítica, pero no envía datos.
     method:   método HTTP del envío.
     headers:  cabeceras adicionales (p. ej. una API key pública).
  */
  crm: {
    endpoint: null,
    method: 'POST',
    headers: {},
    /* Campos añadidos automáticamente a cada envío */
    includeMetadata: true
  },

  /* -----------------------------------------------------------
     Sistema de agenda / reserva de llamadas
     -----------------------------------------------------------
     Al definir una URL (Cal.com, Calendly, Google Calendar
     Appointment Schedule...), los enlaces con el atributo
     data-booking pasan a apuntar a esa URL.
  */
  booking: {
    url: null,
    openInNewTab: true
  },

  /* -----------------------------------------------------------
     Analítica y seguimiento de conversiones
     -----------------------------------------------------------
     Se empuja a window.dataLayer (GTM) y, si existe, a gtag().
     No se carga ningún script de terceros por defecto: la web no
     instala cookies de analítica hasta que se configure aquí.
  */
  analytics: {
    enabled: true,
    debug: false
  },

  /* -----------------------------------------------------------
     Datos de contacto de la agencia
     -----------------------------------------------------------
     Se muestran en el pie y en la página de contacto.
  */
  contact: {
    email: 'contacto@retentialex.com',
    phone: null
  },

  /* Página de confirmación tras enviar el formulario */
  successUrl: 'gracias.html'
};
