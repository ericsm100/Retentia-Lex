# Retentia Lex — Sitio web

Sitio web corporativo y orientado a conversión de **Retentia Lex**, agencia de automatización
con IA para despachos de abogados.

Está construido como un sitio **estático**: HTML semántico, una hoja de estilos y tres ficheros
JavaScript pequeños. No requiere compilación, dependencias ni servidor de aplicaciones, lo que
mantiene la carga rápida y el despliegue sencillo.

---

## Estructura

```
.
├── index.html                     Inicio
├── automatizacion-clientes.html   Área 01 — Automatización de Clientes
├── gestion-documental.html        Área 02 — Gestión Documental
├── como-funciona.html             Proceso y metodología
├── sobre-nosotros.html            La agencia y sus principios
├── contacto.html                  Solicitud de auditoría (formulario)
├── gracias.html                   Confirmación tras el envío (noindex)
├── preguntas-frecuentes.html      FAQ ampliada
├── casos-de-exito.html            Estructura preparada (noindex hasta tener contenido)
├── recursos.html                  Blog / recursos, estructura preparada (noindex)
├── aviso-legal.html               Aviso legal
├── politica-privacidad.html       Política de privacidad
├── cookies.html                   Política de cookies
├── 404.html                       Página de error (noindex)
├── robots.txt · sitemap.xml · site.webmanifest
└── assets/
    ├── css/styles.css             Sistema de diseño completo
    ├── js/config.js               ⭐ Configuración de integraciones
    ├── js/main.js                 Navegación, animaciones, analítica
    ├── js/forms.js                Validación y envío de formularios
    └── img/                       Favicon, icono táctil e imagen social
```

## Ver el sitio en local

Cualquier servidor estático sirve. Por ejemplo:

```bash
npx serve .
# o
python3 -m http.server 8000
```

Abrir `http://localhost:8000`. También funciona abriendo los `.html` directamente,
aunque es preferible un servidor para que las rutas se comporten como en producción.

## Despliegue

Al ser estático, se publica tal cual en Netlify, Vercel, Cloudflare Pages, GitHub Pages
o cualquier alojamiento con soporte HTML. No hay paso de build.

Antes de publicar conviene:

1. **Sustituir el dominio.** Las etiquetas `canonical`, Open Graph, `sitemap.xml` y `robots.txt`
   apuntan a `https://www.retentialex.com`. Si el dominio final es otro, hay que reemplazarlo:
   ```bash
   grep -rl "www.retentialex.com" . --include="*.html" --include="*.xml" --include="*.txt" \
     | xargs sed -i "s|www.retentialex.com|SU-DOMINIO.com|g"
   ```
2. **Completar los documentos legales.** `aviso-legal.html`, `politica-privacidad.html` y
   `cookies.html` contienen la estructura correcta, pero los datos identificativos del titular
   están marcados entre corchetes (`[Razón social]`, `[NIF o CIF]`, `[Dirección completa]`).
   Deben completarse y, preferiblemente, revisarse por un profesional. Cada página muestra un
   aviso visible recordándolo; ese aviso (`<div class="notice">`) debe eliminarse al completarlos.
3. **Configurar el correo de contacto** si no es `contacto@retentialex.com`
   (aparece en `assets/js/config.js`, en el pie y en `contacto.html`).
4. **Configurar la página 404** en el proveedor de alojamiento para que sirva `404.html`.

---

## Integraciones

Todo se configura en un único fichero: **`assets/js/config.js`**.

### CRM / destino de los formularios

El formulario funciona desde el primer momento. Sin endpoint configurado opera en
**modo demostración**: valida los campos, muestra la confirmación y registra el evento de
analítica, pero no envía datos a ningún sitio.

Para conectarlo a un CRM, un webhook de Zapier/Make/n8n o un endpoint propio:

```js
crm: {
  endpoint: 'https://hooks.zapier.com/hooks/catch/000000/abcdef/',
  method: 'POST',
  headers: {},          // p. ej. { 'X-Api-Key': '...' }
  includeMetadata: true // añade página, referrer, fecha y parámetros UTM
}
```

Se envía un JSON con los campos del formulario (`nombre`, `despacho`, `email`, `telefono`,
`profesionales`, `objetivo`, `mensaje`, `consentimiento`) y un objeto `_meta` con el contexto
de la visita. Si el envío falla, se muestra un mensaje de error con el correo de contacto
como alternativa.

> Nota: al enviar desde el navegador a un dominio externo, el endpoint debe permitir CORS.
> Si el CRM no lo permite, lo habitual es interponer un webhook (Zapier, Make, n8n) o una
> función serverless del propio alojamiento.

### Sistema de agenda

```js
booking: { url: 'https://cal.com/su-cuenta/auditoria', openInNewTab: true }
```

Cualquier enlace con el atributo `data-booking` pasará automáticamente a apuntar a esa URL.
Es el punto de entrada previsto para la reserva de llamadas comerciales.

### Analítica y conversiones

El seguimiento ya está instrumentado y **no carga ningún script de terceros**: los eventos se
empujan a `window.dataLayer` (Google Tag Manager) y a `gtag()` si existe. Basta con añadir el
contenedor de GTM o de Analytics para empezar a recibirlos.

| Evento | Cuándo se dispara | Datos |
| --- | --- | --- |
| `cta_click` | Clic en cualquier CTA | `cta_id`, `cta_text`, `page` |
| `lead_submit` | Envío válido del formulario | `form_id`, `objective`, `team_size` |
| `lead_success` | Carga de `gracias.html` | `page` |
| `faq_open` | Apertura de una pregunta frecuente | `question` |

Cada CTA lleva un identificador propio en `data-cta` (`hero-principal`, `cabecera`,
`barra-movil`, `cta-final-home`…), de modo que se puede medir qué llamada a la acción convierte.

**Importante:** si se activa analítica con cookies, hay que actualizar `cookies.html` e
incorporar el aviso de consentimiento previo. Hoy el sitio no instala ninguna cookie.

---

## Sistema de diseño

Los tokens están al principio de `assets/css/styles.css`:

| Token | Valor | Uso |
| --- | --- | --- |
| `--c-ink` | `#0A0A0A` | Titulares y texto principal |
| `--c-sapphire` | `#1A365D` | Color de marca, CTA y acentos |
| `--c-titanium` | `#4A5568` | Texto secundario |
| `--c-platinum` | `#F7FAFC` | Fondos de descanso visual |
| `--c-white` | `#FFFFFF` | Fondo base |
| `--c-line` | `#E5EAF0` | Bordes y separadores |

Tipografía: **Inter** para todo el texto y **Newsreader** (cursiva) únicamente para acentos
editoriales puntuales — numeración de niveles y destacados. Ambas se cargan desde Google Fonts
con `display=swap` y una pila de reserva del sistema.

Componentes reutilizables: `.btn`, `.card`, `.ui-panel` (interfaz simulada), `.flow` (flujos de
proceso), `.ladder` (escalera de valor), `.levels`, `.steps` (proceso con progreso), `.pipeline`,
`.faq`, `.pills`, `.form-panel`.

## Accesibilidad y rendimiento

- HTML semántico, un único `<h1>` por página y jerarquía `H2`/`H3` coherente.
- Enlace «saltar al contenido», foco visible, `aria-*` en navegación, acordeones y formularios.
- Errores de formulario anunciados con `role="alert"` y `aria-invalid`.
- Acordeones basados en `<details>`: funcionan sin JavaScript.
- Se respeta `prefers-reduced-motion`: las animaciones se desactivan por completo.
- Sin imágenes de mapa de bits en las páginas: los diagramas y las interfaces simuladas son
  SVG en línea y CSS. La única imagen del proyecto es la de vista previa social.

## Añadir contenido más adelante

- **Casos de éxito** (`casos-de-exito.html`) y **Recursos** (`recursos.html`) ya tienen la
  página, el enlace en el pie y una plantilla HTML comentada dentro de cada fichero.
  Al publicar contenido real hay que cambiar su `<meta name="robots">` a `index, follow`
  y añadirlas a `sitemap.xml`.
- Para una página nueva, lo más rápido es duplicar `sobre-nosotros.html`, que contiene la
  cabecera, el pie y los bloques estándar, y sustituir el contenido de `<main>`.
