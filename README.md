# Milagros Tortas Temáticas — Web

Landing page de **Milagros Tortas Temáticas**: tortas temáticas artesanales con el sabor de hogar.

## Estructura

```
index.html              Página principal
css/styles.css          Estilos (responsive, desktop y móvil)
js/main.js              Intro, transiciones y animaciones
assets/img/             Logo
assets/video/           Video de intro (intro-milagros-v4.mp4)
design/                 Export original del diseño (referencia)
```

## Qué incluye

- **Intro en video** a pantalla completa cada vez que se carga o recarga la página.
  Al terminar, en poco más de un segundo el último cuadro se desenfoca, sube una cortina ciruela por columnas y se abre mostrando la web.
- **Siempre arranca arriba**: al recargar, la página vuelve al hero aunque antes estuvieras más abajo o hubiera un `#ancla` en la URL.
- **Animaciones**: títulos que suben línea por línea, manifiesto que se ilumina al leer, tarjetas con entrada escalonada e inclinación 3D al pasar el mouse, cinta infinita que reacciona al scroll, parallax de ornamentos florales, botones magnéticos.
- **"Así nace tu torta"**: escena fija en la que la torta se arma capa por capa mientras haces scroll.
- **Formulario → WhatsApp**: arma el mensaje de cotización y abre WhatsApp. Valida que la fecha tenga mínimo 3 días de anticipación.
- Menú móvil a pantalla completa, nav que se compacta y se oculta al bajar, botón flotante de WhatsApp.
- Respeta `prefers-reduced-motion`.

## Plugins (vía CDN)

- [GSAP 3 + ScrollTrigger](https://gsap.com/) — animaciones y scroll
- [Lenis](https://lenis.darkroom.engineering/) — smooth scroll
- [SplitType](https://github.com/lukePeavey/SplitType) — división de texto en líneas y palabras
- Google Fonts: Cormorant Garamond, Jost, Sacramento

## Ver en local

Es un sitio estático. Abre `index.html` con un servidor local, por ejemplo:

```bash
npx serve .
```

## Pendiente

Las fotos son marcadores de posición (`.ph`). Para poner una foto real, agrega un `<img>` dentro del bloque `.ph` correspondiente:

```html
<div class="ph ph--rose"><img src="assets/img/torta-cumple.jpg" alt="Torta de cumpleaños"></div>
```

También falta completar la ciudad en la sección de contacto.
