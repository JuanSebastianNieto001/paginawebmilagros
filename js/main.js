/* =========================================================
   Milagros Tortas Temáticas — interacciones
   Plugins: GSAP + ScrollTrigger, Lenis (smooth scroll), SplitType
   ========================================================= */
(function () {
  'use strict';

  const WHATSAPP = '573176476868';
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* ---------- Siempre arrancar arriba en cada recarga ---------- */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  window.scrollTo(0, 0);
  window.addEventListener('beforeunload', () => window.scrollTo(0, 0));
  // Si el navegador restaura la página desde caché (atrás/adelante), recargar para ver la intro.
  window.addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.stop();
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  const scrollToTarget = (target) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    const offset = window.innerWidth <= 860 ? -64 : -72;
    if (lenis) lenis.scrollTo(el, { offset, duration: 1.4 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  /* ---------- Intro ---------- */
  const intro = document.getElementById('intro');
  const video = document.getElementById('introVideo');
  const progress = intro.querySelector('.intro__progress span');
  let introFinished = false;

  function unlockPage() {
    root.classList.remove('is-intro');
    intro.classList.add('is-done');
    intro.setAttribute('aria-hidden', 'true');
    window.scrollTo(0, 0);
    if (lenis) { lenis.scrollTo(0, { immediate: true }); lenis.start(); }
    if (hasGsap) ScrollTrigger.refresh();
  }

  function finishIntro() {
    if (introFinished) return;
    introFinished = true;
    clearTimeout(safety);
    video.pause();

    if (!hasGsap) { unlockPage(); return; }

    const cols = intro.querySelectorAll('.intro__curtain span');
    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });

    tl.to(intro.querySelector('.intro__progress'), { autoAlpha: 0, duration: 0.2 }, 0)
      // 1. El último cuadro (logo) se acerca y se desenfoca en rosa
      .to(video, { scale: 1.08, filter: 'blur(6px) saturate(1.15)', duration: 0.6, ease: 'power2.in' }, 0)
      .to(intro.querySelector('.intro__veil'), { opacity: 1, duration: 0.5 }, 0)
      // 2. Cortina ciruela que sube por columnas desde el centro
      .to(cols, { scaleY: 1, duration: 0.45, stagger: { each: 0.04, from: 'center' } }, 0.2)
      .set([video, intro.querySelector('.intro__veil')], { autoAlpha: 0 })
      .set(intro, { backgroundColor: 'transparent' })
      .add(() => { tl.pause(); fontsReady.then(() => { heroReveal(); tl.resume(); }); })
      // 3. La cortina se abre hacia arriba revelando la web
      .set(cols, { transformOrigin: 'top' })
      .to(cols, { scaleY: 0, duration: 0.55, stagger: { each: 0.04, from: 'edges' }, ease: 'power3.inOut' })
      .fromTo('#page', { scale: 1.03, filter: 'blur(3px)' }, { scale: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out', clearProps: 'transform,filter' }, '<')
      .add(unlockPage, '-=0.4');
  }

  // Tiempo máximo de seguridad por si el video no carga
  let safety = setTimeout(finishIntro, 9000);

  video.addEventListener('loadedmetadata', () => {
    clearTimeout(safety);
    safety = setTimeout(finishIntro, (video.duration || 6) * 1000 + 4000);
  });
  video.addEventListener('timeupdate', () => {
    if (video.duration) progress.style.transform = 'scaleX(' + (video.currentTime / video.duration) + ')';
  });
  video.addEventListener('ended', () => { progress.style.transform = 'scaleX(1)'; finishIntro(); });
  video.addEventListener('error', () => setTimeout(finishIntro, 600));
  document.addEventListener('keydown', (e) => { if (!introFinished && (e.key === 'Escape' || e.key === 'Enter')) finishIntro(); });

  // Reiniciar el video desde cero en cada carga
  video.currentTime = 0;
  const playAttempt = video.play();
  if (playAttempt && playAttempt.catch) playAttempt.catch(() => setTimeout(finishIntro, 900));

  /* ---------- Sin GSAP: solo lo esencial ---------- */
  if (!hasGsap) { setupBasics(); return; }

  gsap.registerPlugin(ScrollTrigger);
  const canSplit = typeof window.SplitType !== 'undefined';

  /* ---------- Estado inicial del hero (oculto tras la intro) ---------- */
  const heroTitle = document.querySelector('.hero__title');
  // El título se divide en líneas justo antes de animarlo (con las fuentes ya cargadas),
  // para que las líneas coincidan con el texto final y no haya saltos al terminar.
  gsap.set(heroTitle, { autoAlpha: 0 });
  gsap.set('[data-hero]', { autoAlpha: 0, y: 30 });
  gsap.set('[data-hero-media]', { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set('.nav, .topbar', { autoAlpha: 0, y: -20 });
  gsap.set('.ornament--hero-l, .ornament--hero-r', { autoAlpha: 0 });

  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();

  function heroReveal() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.topbar, .nav', { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06, clearProps: 'transform,opacity,visibility' }, 0.1);
    if (canSplit) {
      const split = new SplitType(heroTitle, { types: 'lines,words', lineClass: 'split-line' });
      tl.set(heroTitle, { autoAlpha: 1 }, 0)
        .fromTo(split.words, { yPercent: 115 }, {
          yPercent: 0, duration: 0.9, stagger: 0.04,
          onComplete: () => split.revert()
        }, 0.1);
    } else {
      tl.fromTo(heroTitle, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.1);
    }
    tl.to('.hero__eyebrow', { autoAlpha: 1, y: 0, duration: 0.7 }, 0.05)
      .to('.hero__script, .hero__actions', { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.4)
      .to('[data-hero-media]', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut' }, 0.5)
      .to('.hero__cue', { autoAlpha: 1, y: 0, duration: 0.6 }, 0.8)
      .to('.hero__meta', { autoAlpha: 1, y: 0, duration: 0.6 }, 1)
      .to('.ornament--hero-l', { autoAlpha: 0.2, duration: 1.2 }, 0.5)
      .to('.ornament--hero-r', { autoAlpha: 0.18, duration: 1.2 }, 0.6);
  }

  setupBasics();

  if (reduceMotion) return;

  /* ---------- Títulos: líneas que suben ---------- */
  document.querySelectorAll('[data-split]').forEach((el) => {
    if (el === heroTitle) return;
    if (!canSplit) {
      gsap.from(el, { autoAlpha: 0, y: 40, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
      return;
    }
    const split = new SplitType(el, { types: 'lines,words', lineClass: 'split-line' });
    gsap.from(split.words, {
      yPercent: 115, duration: 1.2, ease: 'power4.out', stagger: 0.05,
      scrollTrigger: { trigger: el, start: 'top 85%' },
      onComplete: () => split.revert()
    });
  });

  /* ---------- Reveals genéricos ---------- */
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, { autoAlpha: 0, y: 36, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  /* ---------- Manifiesto: las palabras se iluminan al leer ---------- */
  const quote = document.querySelector('[data-words]');
  if (quote && canSplit) {
    const qs = new SplitType(quote, { types: 'words', wordClass: 'word' });
    gsap.to(qs.words, {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: quote, start: 'top 80%', end: 'bottom 45%', scrub: true }
    });
  }
  gsap.from('.manifesto__line', { scaleX: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.manifesto', start: 'top 80%' } });

  /* ---------- Tarjetas de tortas ---------- */
  ScrollTrigger.batch('[data-card]', {
    start: 'top 88%',
    onEnter: (batch) => gsap.fromTo(batch,
      { autoAlpha: 0, y: 70, clipPath: 'inset(12% 0% 0% 0%)' },
      { autoAlpha: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power4.out', stagger: 0.14, overwrite: true })
  });
  gsap.set('[data-card]', { autoAlpha: 0 });

  // Leve inclinación 3D al pasar el mouse (solo con puntero fino)
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-card] .card__media').forEach((media) => {
      const ph = media.querySelector('.ph');
      media.addEventListener('mousemove', (e) => {
        const r = media.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(ph, { rotateY: x * 6, rotateX: -y * 6, x: x * 10, y: y * 10, transformPerspective: 900, duration: 0.6, ease: 'power2.out' });
      });
      media.addEventListener('mouseleave', () => gsap.to(ph, { rotateY: 0, rotateX: 0, x: 0, y: 0, duration: 0.8, ease: 'power3.out' }));
    });
  }

  /* ---------- Cinta infinita que reacciona al scroll ---------- */
  const track = document.querySelector('.marquee__track');
  if (track) {
    const loop = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
    ScrollTrigger.create({
      trigger: '.marquee', start: 'top bottom', end: 'bottom top',
      onUpdate: (self) => {
        const dir = self.direction;
        const boost = gsap.utils.clamp(1, 6, 1 + Math.abs(self.getVelocity()) / 400);
        gsap.to(loop, {
          timeScale: dir * boost, duration: 0.25, overwrite: true,
          onComplete: () => gsap.to(loop, { timeScale: dir, duration: 1.2, ease: 'power2.out' })
        });
      }
    });
  }

  /* ---------- Así nace tu torta: escena pineada ---------- */
  setupBuild();

  function setupBuild() {
    const section = document.getElementById('build');
    if (!section) return;
    const steps = section.querySelectorAll('.build__step');
    const bar = document.getElementById('buildBar');
    const q = (s) => section.querySelector(s);

    gsap.set([q('.b-l1'), q('.b-l2'), q('.b-l3'), q('.b-drip'), q('.b-deco'), q('.b-cherry'), q('.b-candle'), q('.b-flame'), q('.b-topper'), q('.b-conf')], { autoAlpha: 0 });

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out', duration: 1 },
      scrollTrigger: {
        trigger: section, start: 'top top', end: '+=320%', pin: true, scrub: 0.8, anticipatePin: 1,
        onUpdate: (self) => {
          const i = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
          steps.forEach((s, n) => s.classList.toggle('is-active', n === i));
          bar.style.transform = 'scaleX(' + self.progress + ')';
        }
      }
    });

    tl.to(q('.b-blue'), { autoAlpha: 0, duration: 1.2 }, 0.2)
      .fromTo(q('.b-l1'), { autoAlpha: 0, y: -240 }, { autoAlpha: 1, y: 0, ease: 'bounce.out', duration: 1.3 }, 0.5)
      .fromTo(q('.b-l2'), { autoAlpha: 0, y: -260 }, { autoAlpha: 1, y: 0, ease: 'bounce.out', duration: 1.2 }, 1.8)
      .fromTo(q('.b-l3'), { autoAlpha: 0, y: -280 }, { autoAlpha: 1, y: 0, ease: 'bounce.out', duration: 1.1 }, 3)
      .fromTo(q('.b-drip'), { autoAlpha: 0, scaleY: 0, transformOrigin: '50% 0%' }, { autoAlpha: 1, scaleY: 1, duration: 1.2 }, 4.2)
      .fromTo(q('.b-deco'), { autoAlpha: 0, y: 120, scale: 0.6, transformOrigin: '50% 100%' }, { autoAlpha: 1, y: 0, scale: 1, ease: 'back.out(1.4)', duration: 1.2 }, 5.4)
      .fromTo(q('.b-cherry'), { autoAlpha: 0, y: -320 }, { autoAlpha: 1, y: 0, ease: 'bounce.out', duration: 1 }, 6.8)
      .fromTo(q('.b-candle'), { autoAlpha: 0, scaleY: 0, transformOrigin: '50% 100%' }, { autoAlpha: 1, scaleY: 1, duration: 0.6 }, 7.8)
      .fromTo(q('.b-topper'), { autoAlpha: 0, scale: 0.2, rotate: -12, transformOrigin: '0% 100%' }, { autoAlpha: 1, scale: 1, rotate: 0, ease: 'back.out(1.8)', duration: 0.8 }, 8.2)
      .fromTo(q('.b-flame'), { autoAlpha: 0, scale: 0, transformOrigin: '50% 100%' }, { autoAlpha: 1, scale: 1, duration: 0.5 }, 8.6)
      .fromTo(q('.b-conf'), { autoAlpha: 0, y: -140, rotate: 0 }, { autoAlpha: 1, y: 0, rotate: 12, duration: 1.2 }, 8.8)
      .to({}, { duration: 0.6 });

    // Llamas que titilan
    gsap.to(q('.b-flame'), { scaleY: 1.12, repeat: -1, yoyo: true, duration: 0.35, ease: 'sine.inOut', transformOrigin: '50% 100%' });
  }

  /* ---------- Proceso ---------- */
  gsap.from('.steps__rule', { scaleX: 0, duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: '.steps', start: 'top 85%' } });
  gsap.from('[data-step]', { autoAlpha: 0, y: 50, duration: 1.1, stagger: 0.18, ease: 'power3.out', scrollTrigger: { trigger: '.steps', start: 'top 80%' } });
  gsap.utils.toArray('.step__num').forEach((n) => {
    gsap.from(n, { yPercent: 60, rotate: -8, duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: n, start: 'top 90%' } });
  });

  /* ---------- Historia: la foto se descubre ---------- */
  gsap.fromTo('[data-clip]', { clipPath: 'inset(15% 15% 15% 15%)' }, {
    clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
    scrollTrigger: { trigger: '.historia', start: 'top 80%', end: 'center center', scrub: true }
  });
  gsap.from('.historia__list li', { autoAlpha: 0, x: -24, stagger: 0.12, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: '.historia__list', start: 'top 90%' } });

  /* ---------- Galería ---------- */
  gsap.from('[data-tile]', {
    autoAlpha: 0, y: 80, rotate: (i) => (i % 2 ? 3 : -3), duration: 1.1, stagger: 0.1, ease: 'power4.out',
    scrollTrigger: { trigger: '.galeria__grid', start: 'top 88%' }
  });

  /* ---------- Parallax ---------- */
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax) || 0.1;
    gsap.to(el, { y: () => speed * window.innerHeight * 2, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
  });
  gsap.utils.toArray('[data-parallax-inner]').forEach((el) => {
    gsap.fromTo(el, { yPercent: -18 }, { yPercent: 18, ease: 'none', scrollTrigger: { trigger: el.closest('figure'), start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---------- Botones magnéticos ---------- */
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.5, ease: 'power3.out' });
      });
      btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' }));
    });
  }

  // Recalcular posiciones cuando carguen fuentes
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

  /* =========================================================
     Funciones base (funcionan con o sin GSAP)
     ========================================================= */
  function setupBasics() {
    // Links internos con scroll suave
    document.querySelectorAll('[data-scroll-to]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (!href || href.charAt(0) !== '#') return;
        e.preventDefault();
        closeMenu();
        scrollToTarget(href);
      });
    });

    // Menú móvil
    const burger = document.getElementById('burger');
    const links = document.getElementById('navLinks');
    function closeMenu() {
      if (!links.classList.contains('is-open')) return;
      links.classList.remove('is-open');
      document.getElementById('nav').classList.remove('is-menu-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menú');
      if (lenis) lenis.start();
    }
    burger.addEventListener('click', () => {
      const open = !links.classList.contains('is-open');
      links.classList.toggle('is-open', open);
      document.getElementById('nav').classList.toggle('is-menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      if (lenis) open ? lenis.stop() : lenis.start();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

    // Nav: compacta al bajar, se oculta al hacer scroll hacia abajo y vuelve al subir
    const nav = document.getElementById('nav');
    const wa = document.querySelector('.wa-float');
    const sections = ['tortas', 'proceso', 'historia', 'galeria', 'contacto'].map((id) => document.getElementById(id));
    const navLinks = links.querySelectorAll('a');
    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 60);
      nav.classList.toggle('is-hidden', y > 700 && y > lastY && !links.classList.contains('is-open'));
      wa.classList.toggle('is-visible', y > window.innerHeight * 0.8);
      lastY = y;

      let current = null;
      sections.forEach((s) => { if (s && s.getBoundingClientRect().top < window.innerHeight * 0.4) current = s.id; });
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + current));
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Formulario → WhatsApp
    const form = document.getElementById('quoteForm');
    const hint = document.getElementById('formHint');
    const fecha = document.getElementById('fecha');
    const min = new Date();
    min.setDate(min.getDate() + 3);
    const pad = (n) => String(n).padStart(2, '0');
    fecha.min = min.getFullYear() + '-' + pad(min.getMonth() + 1) + '-' + pad(min.getDate());

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      form.querySelectorAll('.field').forEach((f) => f.classList.remove('is-invalid'));

      if (!data.nombre.trim()) return invalid('nombre', 'Cuéntanos tu nombre.');
      if (!data.fecha) return invalid('fecha', 'Elige la fecha del evento.');
      if (data.fecha < fecha.min) return invalid('fecha', 'Los pedidos temáticos requieren mínimo 3 días de anticipación.');
      hint.textContent = '';

      const [yy, mm, dd] = data.fecha.split('-');
      const lines = [
        '¡Hola Milagros! Quiero cotizar una torta 🎂',
        '',
        '• Nombre: ' + data.nombre.trim(),
        '• Fecha del evento: ' + dd + '/' + mm + '/' + yy,
        data.tema ? '• Tema: ' + data.tema.trim() : null,
        data.porciones ? '• Porciones: ' + data.porciones : null,
        data.mensaje ? '• Detalles: ' + data.mensaje.trim() : null
      ].filter((l) => l !== null);
      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });

    function invalid(id, msg) {
      const input = document.getElementById(id);
      input.closest('.field').classList.add('is-invalid');
      hint.textContent = msg;
      input.focus();
    }
  }

})();
