# Milagros Tortas Temáticas — Web

Landing page de **Milagros Tortas Temáticas**: tortas temáticas artesanales con el sabor de hogar.

## Estructura

```
index.html              Página principal (diseño collage)
css/styles.css          Estilos: lienzo de 1440px escalado en escritorio, flujo apilado en celular
js/main.js              Intro, transiciones, animaciones y Mili
assets/img/             Logo, mariposa, flores y jarrones (WebP)
assets/video/           Video de intro (intro-milagros-v4.mp4)
design/                 Exports originales de los diseños (referencia)
```

## Qué incluye

- **Intro en video** a pantalla completa cada vez que se carga o recarga la página.
  Al terminar, en poco más de un segundo el último cuadro se desenfoca, sube una cortina ciruela por columnas y se abre mostrando la web.
- **Siempre arranca arriba**: al recargar, la página vuelve al hero aunque antes estuvieras más abajo o hubiera un `#ancla` en la URL.
- **Diseño collage**: notas de papel con chinches, cinta washi, arcos fotográficos, bloques ciruela y haces de luz. En escritorio el lienzo de 1440px se escala al ancho de la pantalla; en celular (≤1000px) pasa a un flujo apilado.
- **Animaciones**: los papeles caen sobre el tablero al hacer scroll, las líneas se dibujan, los títulos suben palabra por palabra, destellos que titilan, parallax de las piezas.
- **Mariposas**: aletean (el PNG se divide en dos alas con perspectiva 3D), flotan y vuelan por la pantalla mientras haces scroll.
- **Jarrones**: cada jarrón se recorta del mismo PNG y se mece a su ritmo; hay pétalos que flotan desde la flor y un reflejo de luz que barre el vidrio.
- **Formulario → WhatsApp**: arma el mensaje de cotización y abre WhatsApp. Valida que la fecha tenga mínimo 3 días de anticipación.
- **Mili, la tortica asistente**: siempre abajo a la derecha. Cada 2 segundos hace algo distinto (salta, baila, gira, saluda, guiña, mira alrededor…) y, mientras haces scroll, se inclina hacia la web y la sigue con los ojos. Muestra globos de diálogo y al tocarla abre un panel con WhatsApp, Instagram y un formulario para pedir la torta.
- Header que desaparece al bajar: con mouse reaparece al acercar el puntero al borde superior; en celular, al hacer scroll hacia arriba.
- Menú móvil a pantalla completa.
- En celular se desactivan efectos costosos (desenfoques, recortes animados) para que las animaciones vayan fluidas.
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
