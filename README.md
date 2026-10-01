# Milagros Tortas Temáticas — Web

Landing page de **Milagros Tortas Temáticas**: tortas temáticas artesanales con el sabor de hogar.

## Estructura

```
index.html              Página principal (diseño collage)
te-escuchamos.html      Página "Te escuchamos": sugerencias y comentarios
css/styles.css          Estilos: lienzo de 1440px escalado en escritorio, flujo apilado en celular
js/main.js              Intro, transiciones, animaciones y Mili
assets/img/             Logo, mariposa, flores, jarrones, favicons e imagen para redes (og-image.jpg)
assets/img/tortas/      Fotos de tortas del Instagram @milagros_tortas_tematica (*-card.webp 480×480 y fondo desenfocado *-bg.webp)
assets/video/           Video de intro: intro-milagros-1080.mp4 (escritorio) e intro-milagros-720.mp4 (celular)
js/vendor/              GSAP, ScrollTrigger, Lenis y SplitType alojados aquí (sin CDN externos)
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
- **Te escuchamos**: página aparte (enlace en el menú) donde la gente elige el tipo de mensaje, califica con corazones y escribe su sugerencia; se envía por WhatsApp. Entre páginas hay una transición de cortina, y al volver a la portada desde ahí se salta el video y baja a la sección elegida.
- **Formulario → WhatsApp**: arma el mensaje de cotización y abre WhatsApp. Valida que la fecha tenga mínimo 3 días de anticipación.
- **Mili, la tortica asistente**: siempre abajo a la derecha. Cada 2 segundos hace algo distinto (salta, baila, gira, saluda, guiña, mira alrededor…) y, mientras haces scroll, se inclina hacia la web y la sigue con los ojos. Muestra globos de diálogo y al tocarla abre un panel con WhatsApp, Instagram y un formulario para pedir la torta.
- Header que desaparece al bajar: con mouse reaparece al acercar el puntero al borde superior; en celular, al hacer scroll hacia arriba.
- Menú móvil a pantalla completa.
- En celular se desactivan efectos costosos (desenfoques, recortes animados) para que las animaciones vayan fluidas.
- Respeta `prefers-reduced-motion`.

## Plugins (alojados en `js/vendor/`)

- [GSAP 3.12.5 + ScrollTrigger](https://gsap.com/) — animaciones y scroll
- [Lenis 1.1.13](https://lenis.darkroom.engineering/) — smooth scroll
- [SplitType 0.3.4](https://github.com/lukePeavey/SplitType) — división de texto en líneas y palabras
- Google Fonts: Dancing Script (una sola cursiva ligada y legible para toda la web)

Se sirven desde el mismo dominio para ahorrar tres conexiones a CDN externos en cada visita.

## Rendimiento

Medido con Chrome sin caché: la primera visita baja ~1 MB en escritorio y ~0,8 MB en celular (antes 2,6 MB en ambos),
con 28 peticiones a 3 dominios, el sitio y Google Fonts (antes 30 peticiones a 7 dominios):

- El video de la intro se recomprimió a 30 fps: 1080p (372 KB) para escritorio y 720p (178 KB) para celular, con `faststart` para que empiece a reproducirse apenas llega el primer tramo.
- Las fotos de tortas son recortes cuadrados de 480 px (unos 15–28 KB cada una); los arcos no llevan foto para no tapar el reflejo animado.
- El favicon es un PNG de 32 px (antes cargaba el logo de 274 KB en cada visita) y el logo del menú va a su tamaño real (120 px).
- Flores y mariposa recomprimidas (WebP q80).
- El detector de sección activa del menú se agrupa en un solo cuadro por scroll.
- En pantallas táctiles ya se desactivan desenfoques, sombras filtradas y haces de luz; respeta `prefers-reduced-motion`.

## Ver en local

Es un sitio estático. Abre `index.html` con un servidor local, por ejemplo:

```bash
npx serve .
```

## Fotos

Las fotos de `assets/img/tortas/` salen de las portadas de los reels de
[@milagros_tortas_tematica](https://www.instagram.com/milagros_tortas_tematica/), recortadas en cuadrado (480×480).
Cada tarjeta muestra la foto completa (`object-fit: contain`) sobre su propio fondo desenfocado (`*-bg.webp`, 90×60),
porque las portadas son verticales y las tarjetas apaisadas. Los arcos del hero y de la historia no llevan foto:
conservan el degradado con el reflejo animado.

| Tarjeta       | Archivo                       | Reel          |
|---------------|-------------------------------|---------------|
| Cumpleaños    | torta-hello-30-card.webp      | DduintJzdES   |
| Infantiles    | torta-monsters-card.webp      | DdsEUEAKAV9   |
| Personajes    | torta-cars-card.webp          | DdjuEhRncaP   |
| Baby shower   | torta-baby-shower-card.webp   | Dc2K4ijCC04   |
| Fanáticos     | torta-futbol-river-card.webp  | DdIO0ryhDj-   |
| Videojuegos   | torta-super-mario-card.webp   | DcxHcJvEa79   |

La portada del reel de Super Mario venía con poca luz, así que se le subió la exposición escalando
los tres canales en la misma proporción (se conservan tono y saturación) hasta igualar el brillo de las demás.

Para cambiar una foto, reemplaza el `<img>` dentro del bloque `.ph` correspondiente (y su `background-image` inline).

## Pendiente

- Los arcos del hero y de la historia siguen con marcador de posición (`.ph__label`); si algún día llevan foto, agrega un `<img>` dentro del `.ph`.
- Foto de una torta de boda: en el Instagram no había, así que la tarjeta "Bodas" pasó a "Personajes".
- Completar la ciudad en la sección de contacto.
- Si el sitio pasa a un dominio propio, actualizar la URL absoluta de `og:image` en `index.html`.
