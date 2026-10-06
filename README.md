# Milagros Tortas Temáticas — Web

Landing page de **Milagros Tortas Temáticas**: tortas temáticas artesanales con el sabor de hogar.

## Estructura

```
index.html              Página principal (diseño collage)
te-escuchamos.html      Página "Te escuchamos": sugerencias y comentarios
css/styles.css          Estilos: lienzo de 1440px escalado en escritorio, flujo apilado en celular
js/main.js              Intro, transiciones, animaciones y Mili
assets/img/             Logo, mariposa, flores, jarrones, favicons e imagen para redes (og-image.jpg)
assets/img/tortas/      24 tortas recortadas sin fondo (WebP con transparencia, máx. 440×640)
assets/img/productos/   7 productos recortados sin fondo (WebP con transparencia, máx. 560×420)
_fotos-originales/      Fotos originales de WhatsApp y recortes en PNG. Viven en el repo pero no se publican (.vercelignore)
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
- **Torta que se arma en la ventana del hero**: la Princesa Jasmine recortada en 6 piezas, cada una con la curva
  del borde real de su piso. Aparece la base, caen los pisos uno a uno con un rebote, llega la lámpara con destellos,
  y queda entera (unos 2 s, una vez por visita; se repite al recargar). El reflejo de la ventana pasa por encima. Se pausa cuando no se ve
  y, con movimiento reducido, muestra la torta completa quieta. Los cortes están en `armado` dentro de `index.html`
  (atributo `data-pie` = borde inferior de cada pieza, en % del alto).
- **Torta que se arma en la ventana de la historia**: la Boda en mármol (5 piezas, las orquídeas caen al final),
  con el mismo mecanismo; se arma una vez cuando la ventana entra en pantalla.
- **Galería de tortas**: 24 tortas recortadas sin fondo que flotan sobre tarjetas blancas, ciruela y rosadas.
  Se filtran por celebración (Infantiles, Bebés, Quince años, Ceremonias, Para grandes) y se ven de a 6 con flechas.
  Los colores se reparten según la posición para que nunca queden dos iguales juntos, también en celular.
  Las fotos ocultas no se descargan hasta que se muestran.
- **Más antojos**: sección con cupcakes, ramo de fresas, caja sorpresa, cake pops y galletas, en notas de papel con chinche.
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
- Google Fonts, dos letras pegadas:
  - **Dancing Script** para lucirse en grande: títulos, nombres de tortas y productos, hashtags, números de paso y el menú móvil.
  - **Courgette**, más abierta y con letras más grandes, para todo lo que se lee de corrido: párrafos, botones,
    menú, etiquetas, filtros, formularios y el chat de Mili. Tiene un solo grosor, así que la web desactiva la
    negrita inventada por el navegador (`font-synthesis: style`).

Se sirven desde el mismo dominio para ahorrar tres conexiones a CDN externos en cada visita.

## Rendimiento

Medido con Chrome sin caché: la primera visita baja ~1 MB en escritorio y ~0,8 MB en celular (antes 2,6 MB en ambos),
con 28 peticiones a 3 dominios, el sitio y Google Fonts (antes 30 peticiones a 7 dominios):

- El video de la intro se recomprimió a 30 fps: 1080p (372 KB) para escritorio y 720p (178 KB) para celular, con `faststart` para que empiece a reproducirse apenas llega el primer tramo.
- Las fotos de tortas son recortes cuadrados de 480 px (unos 15–28 KB cada una); los arcos no llevan foto para no tapar el reflejo animado.
- El favicon es un PNG de 32 px (antes cargaba el logo de 274 KB en cada visita) y el logo del menú va a su tamaño real (120 px).
- Flores y mariposa recomprimidas (WebP q80).
### Fluidez del scroll

Medido con Chrome controlado por script, con la CPU frenada para imitar equipos lentos.

| | Antes | Ahora |
|---|---|---|
| Retardo de la rueda (llega al destino) | 767 ms | 228 ms |
| Cuadros perdidos, celular gama media (CPU ÷4) | 26 | 14 |
| Cuadros perdidos, celular lento (CPU ÷6) | 84 | 32 |
| Recálculo de estilos durante el gesto (CPU ÷6) | 1449 ms | 953 ms |

Qué se hizo:

- **Scroll suave solo con mouse.** Lenis pasa de `duration: 1.15` a `lerp: 0.35`, así la página llega
  al destino en ~230 ms en vez de ~770 ms. En pantallas táctiles no se usa: el scroll nativo lo mueve
  el compositor del sistema, que es más fluido y gasta menos batería. Como sin Lenis no hay a quién
  pedirle que pare, el menú móvil bloquea el fondo con `html.is-menu-open`.
- **Las animaciones de entrada se pausan fuera de pantalla.** Un `IntersectionObserver` pausa mariposas,
  jarrones, pétalos, flores y destellos cuando salen de la vista, y los reanuda al volver. El navegador
  dejaba de verlos pero seguía dibujándolos.
- **Los disparadores de scroll se destruyen al usarse** (`once: true`). No cambia nada a la vista, porque
  esas animaciones ya se reproducían una sola vez, pero la lista que el navegador revisa en cada scroll
  se vacía sola. Tampoco se crean disparadores para piezas que están ocultas en ese tamaño de pantalla.
- **Mili no sigue el scroll en celular.** Inclinarse y mover los ojos obligaba a redibujar su SVG en cada
  cuadro justo mientras se hace scroll. Con mouse se conserva; en táctil mantiene sus gestos, su globo y
  su panel.
- El menú calcula la posición de las secciones una sola vez en vez de medirlas en cada cuadro,
  y solo reescribe el enlace activo cuando cambia de sección.
- Las mariposas y la inclinación de Mili tocan el DOM solo al cambiar de estado, no en cada cuadro.
- En pantallas táctiles ya se desactivan desenfoques, sombras filtradas y haces de luz; respeta `prefers-reduced-motion`.

## Ver en local

Es un sitio estático. Abre `index.html` con un servidor local, por ejemplo:

```bash
npx serve .
```

## Fotos

### De dónde salen

- 26 fotos enviadas por WhatsApp (octubre 2026): 19 tortas y los 7 productos. Están en `_fotos-originales/whatsapp/`
  con un nombre claro (`02-spiderman.jpeg`…). Llegaron 28 archivos; la 06 y la 07 eran copias idénticas de la 05.
- 5 portadas de reels de [@milagros_tortas_tematica](https://www.instagram.com/milagros_tortas_tematica/):
  Adiós veintes, River Plate, Super Mario, Conejita y mariposas, Bluey y Bingo.

### Cómo se recortaron

1. **Fondo**: [BiRefNet](https://github.com/ZhengPeng7/BiRefNet) (vía `rembg`, modelo `birefnet-general`).
   Para Rayo McQueen y Barril de 60 se usó `birefnet-massive`, que conserva entero el plato giratorio.
2. **Retoque de bordes**: se quitan motas sueltas y se reemplaza el color de la pared que queda en el contorno
   por el color del objeto, para que no aparezca un halo claro sobre las tarjetas ciruela.
3. **Ajustes a mano**:
   - Spider-Man, Once Caldas y Superhéroes: se quitó el pie oscuro del soporte que asomaba debajo.
   - Boda en mármol: la base se cortó con una elipse que sigue su curva, sin la cola del plato.
   - Conejita: se borró la marca de agua "Milagros Tortas Temáticas" que el video tenía sobre el plato.
   - Super Mario: se le subió la exposición (venía con poca luz) escalando los tres canales por igual.
   - Galletas en paleta: se aislaron las seis galletas y sus cintas doradas, sin el celofán.
   - Galletas decoradas: todas tocaban el borde de la foto; se dejó la muelita más completa.
   - Donde el borde de la foto cortaba el objeto (moño de la caja, palitos de los cake pops) se suavizó con un desvanecido.
4. **Salida**: PNG maestro de hasta 1400 px en `_fotos-originales/recortes-png/` y WebP con transparencia
   para la web (25–50 KB cada uno).

Se descartaron Monsters Inc. y Feliz 80 (las marcas de agua y los efectos del video quedaban encima de la torta),
la Cars del Instagram (la nueva de Rayo McQueen es mejor) y Bodas/Chocolate como categorías sin foto.

### Agregar una torta

Copia el recorte (WebP o PNG con transparencia) en `assets/img/tortas/` y agrega una tarjeta dentro de
`<!-- GALERIA:INICIO -->` en `index.html`:

```html
<article class="card" data-card data-cat="infantiles" data-tone="white" hidden>
  <div class="card__media"><img src="assets/img/tortas/mi-torta.webp" alt="Descripción de la torta" width="440" height="600" loading="lazy" decoding="async"></div>
  <div class="card__head"><h3>Nombre</h3><span class="script card__hash">#hashtag</span></div>
</article>
```

`data-cat` puede ser `infantiles`, `bebes`, `quince`, `ceremonias` o `grandes`. El color (`data-tone`) lo
reasigna el JavaScript según la posición, así que da igual cuál pongas. Las 6 primeras tarjetas van sin `hidden`.

## Pendiente

- Completar la ciudad en la sección de contacto.
- Si el sitio pasa a un dominio propio, actualizar la URL absoluta de `og:image` en `index.html`.
