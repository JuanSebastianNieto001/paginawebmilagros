/* =========================================================
   Milagros Tortas Temáticas — interacciones
   Plugins: GSAP + ScrollTrigger, Lenis (smooth scroll), SplitType
   ========================================================= */
(function () {
  'use strict';

  const WHATSAPP = '573176476868';
  const BOARD_W = 1440;
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  // En celulares/tablets se evitan efectos costosos para que todo vaya fluido.
  const lite = window.matchMedia('(hover: none), (pointer: coarse)').matches || window.innerWidth <= 1000;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isMobileLayout = () => window.innerWidth <= 1000;
  const isHome = !!document.getElementById('intro');
  const has = (sel) => !!document.querySelector(sel);

  /* ---------- Navegación entre páginas ----------
     Al recargar siempre se arranca arriba con la intro. Si se llega desde otra página
     de la web (p. ej. "Te escuchamos"), se salta el video y se va a la sección pedida. */
  const NAV_KEY = 'milagros:internal-nav';
  let fromInner = false;
  try { fromInner = sessionStorage.getItem(NAV_KEY) === '1'; sessionStorage.removeItem(NAV_KEY); } catch (err) { /* sin storage */ }
  const navEntry = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  if (navEntry && navEntry.type === 'reload') fromInner = false;
  const pendingHash = fromInner && location.hash ? location.hash : null;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  window.scrollTo(0, 0);
  window.addEventListener('beforeunload', () => window.scrollTo(0, 0));
  window.addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });

  /* ---------- Escala del tablero (lienzo de 1440px) ---------- */
  const boardWrap = document.getElementById('boardWrap');
  function fitBoard() {
    if (!boardWrap) return;
    const s = isMobileLayout() ? 1 : Math.min(1.2, window.innerWidth / BOARD_W);
    boardWrap.style.setProperty('--s', s.toFixed(4));
  }
  fitBoard();
  window.addEventListener('resize', () => { fitBoard(); if (hasGsap) ScrollTrigger.refresh(); });

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
    const offset = isMobileLayout() ? -72 : -90;
    if (lenis) lenis.scrollTo(el, { offset, duration: 1.4 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  /* ---------- Cortina entre páginas ---------- */
  function leaveTo(href) {
    try { sessionStorage.setItem(NAV_KEY, '1'); } catch (err) { /* sin storage */ }
    if (!hasGsap || reduceMotion) { location.href = href; return; }
    const cur = document.createElement('div');
    cur.className = 'page-curtain';
    cur.innerHTML = '<span></span><span></span><span></span><span></span><span></span>';
    document.body.appendChild(cur);
    if (lenis) lenis.stop();
    gsap.fromTo(cur.children, { scaleY: 0 }, {
      scaleY: 1, duration: 0.5, ease: 'power3.inOut', stagger: { each: 0.05, from: 'center' },
      onComplete: () => { location.href = href; }
    });
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-page-link]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    leaveTo(a.getAttribute('href'));
  });

  function afterUnlock() {
    // Lenis mide la página al desbloquearla; recién entonces se puede bajar a la sección pedida
    if (pendingHash) setTimeout(() => { if (lenis) lenis.resize(); scrollToTarget(pendingHash); }, 200);
  }

  if (!isHome) { setupInnerPage(); return; }

  /* ---------- Intro ---------- */
  const intro = document.getElementById('intro');
  const video = document.getElementById('introVideo');
  const progress = intro.querySelector('.intro__progress span');
  let introFinished = false;

  function hideIntro() {
    intro.classList.add('is-done');
    intro.setAttribute('aria-hidden', 'true');
  }

  function unlockPage() {
    root.classList.remove('is-intro');
    window.scrollTo(0, 0);
    if (lenis) { lenis.resize(); lenis.scrollTo(0, { immediate: true }); lenis.start(); }
    if (hasGsap) ScrollTrigger.refresh();
    afterUnlock();
  }

  function finishIntro() {
    if (introFinished) return;
    introFinished = true;
    clearTimeout(safety);
    video.pause();

    if (!hasGsap) { unlockPage(); hideIntro(); return; }

    const cols = intro.querySelectorAll('.intro__curtain span');
    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });

    tl.to(intro.querySelector('.intro__progress'), { autoAlpha: 0, duration: 0.2 }, 0)
      // 1. El último cuadro (logo) se acerca y se desenfoca en rosa
      .to(video, lite
        ? { scale: 1.06, duration: 0.5, ease: 'power2.in' }
        : { scale: 1.08, filter: 'blur(6px) saturate(1.15)', duration: 0.6, ease: 'power2.in' }, 0)
      .to(intro.querySelector('.intro__veil'), { opacity: 1, duration: 0.5 }, 0)
      // 2. Cortina ciruela que sube por columnas desde el centro
      .to(cols, { scaleY: 1, duration: 0.45, stagger: { each: 0.04, from: 'center' } }, 0.2)
      .set([video, intro.querySelector('.intro__veil')], { autoAlpha: 0 })
      .set(intro, { background: 'none' })
      .add(() => { tl.pause(); fontsReady.then(() => { heroReveal(); tl.resume(); }); })
      // 3. La cortina se abre hacia arriba revelando la web
      .set(cols, { transformOrigin: 'top' })
      .to(cols, { scaleY: 0, duration: 0.8, stagger: { each: 0.06, from: 'edges' }, ease: 'power3.inOut' })
      .add(unlockPage, '-=0.5')
      .add(hideIntro);
  }

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

  if (fromInner) {
    // Volviendo desde otra página: sin video, solo la cortina
    if (hasGsap) gsap.set(intro.querySelectorAll('.intro__curtain span'), { scaleY: 1 });
    requestAnimationFrame(() => finishIntro());
  } else {
    video.currentTime = 0;
    const playAttempt = video.play();
    if (playAttempt && playAttempt.catch) playAttempt.catch(() => setTimeout(finishIntro, 900));
  }

  /* ---------- Sin GSAP: solo lo esencial ---------- */
  if (!hasGsap) { setupBasics(); return; }

  gsap.registerPlugin(ScrollTrigger);
  const canSplit = typeof window.SplitType !== 'undefined';
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();

  /* ---------- Estado inicial del hero (oculto tras la intro) ---------- */
  const heroTitle = document.querySelector('.hero__title');
  const heroFly = document.querySelector('[data-fly="hero"]');
  gsap.set('.nav', { autoAlpha: 0, y: -20 });
  gsap.set(heroTitle, { autoAlpha: 0 });
  gsap.set('[data-hero="tag"], [data-hero="script"], .hero__pin, .hero__sp1, .hero__sp2', { autoAlpha: 0 });
  gsap.set('[data-hero="note"]', { autoAlpha: 0, y: -60, rotation: -8 });
  gsap.set('[data-hero="plum"]', { autoAlpha: 0, y: 50 });
  gsap.set('[data-hero="arch"]', { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set('[data-hero="flowers"]', { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 100%' });
  gsap.set('.hero .line--h', { scaleX: 0 });
  gsap.set('.hero .line--v, .hero__thread', { scaleY: 0 });
  gsap.set('.hero__band', { scaleX: 0, transformOrigin: 'left center' });
  gsap.set('.hero__washi', { autoAlpha: 0 });
  gsap.set(heroFly, { autoAlpha: 0, x: -140, y: 60 });

  function heroReveal() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.nav', { autoAlpha: 1, y: 0, duration: 0.7, clearProps: 'transform,opacity,visibility' }, 0.1)
      .to('.hero__band', { scaleX: 1, duration: 1, ease: 'expo.inOut' }, 0.1)
      .to('.hero .line--h', { scaleX: 1, duration: 1.1, ease: 'expo.inOut', stagger: 0.08 }, 0.2)
      .to('.hero .line--v, .hero__thread', { scaleY: 1, duration: 1.1, ease: 'expo.inOut', stagger: 0.08 }, 0.3)
      .to('[data-hero="arch"]', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut' }, 0.15)
      .to('[data-hero="tag"]', { autoAlpha: 1, duration: 0.6, stagger: 0.12 }, 0.4)
      .to('[data-hero="note"]', { autoAlpha: 1, y: 0, rotation: -1.5, duration: 1.1, ease: 'back.out(1.4)' }, 0.55)
      .to(heroFly, { autoAlpha: 1, x: 0, y: 0, duration: 1.4, ease: 'power3.out', onComplete: () => setupButterflies.floatHero && setupButterflies.floatHero() }, 0.5)
      .to('[data-hero="plum"]', { autoAlpha: 1, y: 0, duration: 1 }, 0.8)
      .to('[data-hero="flowers"]', { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'back.out(1.2)' }, 1)
      .to('[data-hero="script"], .hero__pin, .hero__sp1, .hero__sp2, .hero__washi', { autoAlpha: 1, duration: 0.7, stagger: 0.06 }, 1.1);

    if (canSplit) {
      const split = new SplitType(heroTitle, { types: 'lines,words', lineClass: 'split-line' });
      tl.set(heroTitle, { autoAlpha: 1 }, 0.6)
        .fromTo(split.words, { yPercent: 115 }, { yPercent: 0, duration: 1, stagger: 0.05, onComplete: () => split.revert() }, 0.65);
    } else {
      tl.fromTo(heroTitle, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.6);
    }
  }

  setupBasics();

  if (reduceMotion) return;

  /* ---------- Títulos: palabras que suben ---------- */
  document.querySelectorAll('[data-split]').forEach((el) => {
    if (!canSplit) {
      gsap.from(el, { autoAlpha: 0, y: 40, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
      return;
    }
    fontsReady.then(() => {
      const split = new SplitType(el, { types: 'lines,words', lineClass: 'split-line' });
      gsap.from(split.words, {
        yPercent: 115, duration: 1, ease: 'power4.out', stagger: 0.04,
        scrollTrigger: { trigger: el, start: 'top 88%' },
        onComplete: () => split.revert()
      });
    });
  });

  /* ---------- Reveals genéricos ---------- */
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, { autoAlpha: 0, y: 36, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  /* ---------- Papeles que caen sobre el tablero ---------- */
  gsap.utils.toArray('[data-drop]').forEach((el, i) => {
    if (el.dataset.hero) return; // los del hero los maneja heroReveal
    const rot = parseFloat(el.dataset.rot) || 0;
    gsap.fromTo(el,
      { autoAlpha: 0, y: -50, rotation: rot + (i % 2 ? 7 : -7) },
      { autoAlpha: 1, y: 0, rotation: rot, duration: 1.1, ease: 'back.out(1.3)', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  /* ---------- Líneas y bandas que se dibujan ---------- */
  gsap.utils.toArray('.board > section:not(.hero) .line--h').forEach((el) => {
    gsap.from(el, { scaleX: 0, duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 92%' } });
  });
  if (has('.pedir__band')) gsap.from('.pedir__band', { scaleX: 0, transformOrigin: 'left center', duration: 1.2, ease: 'expo.inOut', scrollTrigger: { trigger: '.pedir', start: 'top 75%' } });

  /* ---------- Chinches y destellos ---------- */
  gsap.utils.toArray('[data-pin]').forEach((el) => {
    gsap.from(el, { scale: 0, duration: 0.7, ease: 'back.out(2)', scrollTrigger: { trigger: el, start: 'top 92%' } });
  });
  gsap.utils.toArray('[data-sparkle]').forEach((el, i) => {
    gsap.to(el, { scale: 0.55, rotation: 45, opacity: 0.6, duration: 1.2 + i * 0.3, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.4 });
  });

  /* ---------- Tarjetas de tortas ---------- */
  gsap.set('[data-card]', { autoAlpha: 0 });
  ScrollTrigger.batch('[data-card]', {
    start: 'top 90%',
    onEnter: (batch) => gsap.fromTo(batch,
      { autoAlpha: 0, y: 60, rotation: (i) => (i % 2 ? 3 : -3) },
      { autoAlpha: 1, y: 0, rotation: 0, duration: 1, ease: 'power4.out', stagger: 0.12, overwrite: true })
  });

  /* ---------- Arcos fotográficos ---------- */
  if (has('[data-arch]')) gsap.from('[data-arch]', { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut', scrollTrigger: { trigger: '[data-arch]', start: 'top 85%' } });

  /* ---------- Mariposas: vuelo suave + reaccionan al scroll ---------- */
  setupButterflies();

  function setupButterflies() {
    // Aleteo lento en reposo: el vuelo lo hace GSAP; el aleteo, el CSS
    const flies = gsap.utils.toArray('[data-fly]');
    // El flotado se aplica a la capa interna (.fly__body) para no chocar con la entrada
    // ni con el vuelo del scroll, que mueven la capa externa (.fly).
    const float = (fly) => {
      const body = fly.querySelector('.fly__body');
      gsap.to(body, { y: 14, duration: 2.6, ease: 'sine.inOut', repeat: -1, yoyo: true });
      gsap.to(body, { x: 10, rotation: 5, duration: 3.4, ease: 'sine.inOut', repeat: -1, yoyo: true });
    };
    flies.forEach((fly) => { if (fly !== heroFly) float(fly); });
    setupButterflies.floatHero = () => float(heroFly);

    // La mariposa del hero vuela hacia arriba y a la derecha mientras bajas
    if (heroFly && !lite) {
      gsap.to(heroFly, {
        xPercent: 60, yPercent: -90, rotation: 6, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 }
      });
    }
    // La pequeña cruza la sección Historia
    const small = document.querySelector('[data-fly="small"]');
    if (small && !lite && has('.historia')) {
      gsap.to(small, {
        xPercent: -140, yPercent: 120, rotation: 30, ease: 'none',
        scrollTrigger: { trigger: '.historia', start: 'top bottom', end: 'bottom top', scrub: 1.5 }
      });
    }
    // Al hacer scroll aletean rápido, como asustadas
    let flyTimer;
    ScrollTrigger.create({
      onUpdate: () => {
        flies.forEach((f) => f.classList.add('is-flying'));
        clearTimeout(flyTimer);
        flyTimer = setTimeout(() => flies.forEach((f) => f.classList.remove('is-flying')), 500);
      }
    });
  }

  /* ---------- Jarrones: entran uno a uno y luego se mecen ---------- */
  const vases = document.querySelector('[data-vases]');
  if (vases) {
    const parts = vases.querySelectorAll('.vases__v');
    gsap.set(parts, { yPercent: 40, autoAlpha: 0 });
    gsap.set('.vases__shelf', { xPercent: -100 });
    ScrollTrigger.create({
      trigger: vases, start: 'top 90%', once: true,
      onEnter: () => {
        gsap.timeline({ onComplete: () => { gsap.set(parts, { clearProps: 'transform,opacity,visibility' }); vases.classList.add('is-in'); } })
          .to('.vases__shelf', { xPercent: 0, duration: 0.9, ease: 'expo.out' })
          .to(parts, { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.6)', stagger: 0.15 }, 0.3);
      }
    });
    // Inclinación 3D al pasar el mouse
    if (finePointer) {
      vases.closest('.plum').addEventListener('mousemove', (e) => {
        const r = vases.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        gsap.to(vases, { rotationY: x * 8, transformPerspective: 900, duration: 0.6, ease: 'power2.out' });
      });
      vases.closest('.plum').addEventListener('mouseleave', () => gsap.to(vases, { rotationY: 0, duration: 0.8 }));
    }
  }

  /* ---------- Flores del hero: se mecen con el viento ---------- */
  if (has('.hero__flowers')) gsap.to('.hero__flowers', { rotation: 2.2, duration: 3.2, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2.2 });

  /* ---------- Parallax suave de las piezas al hacer scroll (escritorio) ---------- */
  if (!lite) {
    [['.hero__note', -40], ['.hero__plum', 30], ['.hero__arch', -20], ['.tortas__plum', -30], ['.historia__note', -50], ['.historia__arch', 25]].forEach(([sel, d]) => {
      if (!has(sel)) return;
      gsap.to(sel, { y: d, ease: 'none', scrollTrigger: { trigger: sel, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  /* ---------- Botones magnéticos ---------- */
  if (finePointer) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.5, ease: 'power3.out' });
      });
      btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' }));
    });
  }

  fontsReady.then(() => ScrollTrigger.refresh());

  /* =========================================================
     Funciones base (funcionan con o sin GSAP)
     ========================================================= */
  function setupBasics() {
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
    const nav = document.getElementById('nav');
    function closeMenu() {
      if (!links.classList.contains('is-open')) return;
      links.classList.remove('is-open');
      nav.classList.remove('is-menu-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menú');
      if (lenis) lenis.start();
    }
    burger.addEventListener('click', () => {
      const open = !links.classList.contains('is-open');
      links.classList.toggle('is-open', open);
      nav.classList.toggle('is-menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      if (lenis) open ? lenis.stop() : lenis.start();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

    // Nav: al bajar desaparece. Con mouse, vuelve al acercar el puntero al borde superior;
    // en pantallas táctiles (sin mouse) vuelve al hacer scroll hacia arriba.
    const sections = ['inicio', 'tortas', 'pedir', 'historia', 'contacto'].map((id) => document.getElementById(id));
    const navLinks = links.querySelectorAll('a');
    const HIDE_AFTER = 160;
    let lastY = 0;
    let scrollingUp = false;
    let pointerNearTop = false;
    const updateNav = () => {
      const y = window.scrollY;
      const wantsNav = finePointer ? pointerNearTop : scrollingUp;
      nav.classList.toggle('is-scrolled', y > 60);
      nav.classList.toggle('is-hidden', y > HIDE_AFTER && !wantsNav && !links.classList.contains('is-open'));
    };
    if (finePointer) {
      document.addEventListener('mousemove', (e) => {
        const near = e.clientY < 110 || nav.matches(':hover');
        if (near !== pointerNearTop) { pointerNearTop = near; updateNav(); }
      }, { passive: true });
      document.documentElement.addEventListener('mouseleave', () => { pointerNearTop = false; updateNav(); });
    }
    let scrollQueued = false;
    const onScroll = () => {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(() => {
        scrollQueued = false;
        const y = window.scrollY;
        if (Math.abs(y - lastY) > 4) scrollingUp = y < lastY;
        lastY = y;
        updateNav();

        if (!isHome) return;
        let current = 'inicio';
        sections.forEach((s) => { if (s && s.getBoundingClientRect().top < window.innerHeight * 0.45) current = s.id; });
        navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + current));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    bindQuoteForm(document.getElementById('quoteForm'), document.getElementById('formHint'), '.field');
    bindQuoteForm(document.getElementById('miliForm'), document.querySelector('.mili-form__hint'), '.mili-field');
    bindFeedbackForm(document.getElementById('feedbackForm'));
    setupMili();
  }

  /* ---------- Te escuchamos: sugerencias y comentarios → WhatsApp ---------- */
  function bindFeedbackForm(form) {
    if (!form) return;
    const hint = form.querySelector('.form__hint');
    const thanks = document.getElementById('feedbackThanks');
    const ratingText = form.querySelector('.hearts__text');
    const labels = ['', 'Puede mejorar', 'Regular', 'Bien', 'Muy bien', '¡Me encantó!'];
    form.querySelectorAll('.hearts input').forEach((r) => r.addEventListener('change', () => {
      ratingText.textContent = labels[+r.value] || '';
    }));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      form.querySelectorAll('.field').forEach((f) => f.classList.remove('is-invalid'));
      if (!data.mensaje || data.mensaje.trim().length < 5) {
        form.elements.mensaje.closest('.field').classList.add('is-invalid');
        hint.textContent = 'Cuéntanos un poquito más en tu mensaje.';
        form.elements.mensaje.focus();
        return;
      }
      hint.textContent = '';
      const hearts = data.calificacion ? '❤️'.repeat(+data.calificacion) + ' (' + data.calificacion + '/5)' : null;
      const lines = [
        '💌 Te escuchamos · Milagros Tortas Temáticas',
        '',
        '• Tipo: ' + (data.tipo || 'Comentario'),
        hearts ? '• Calificación: ' + hearts : null,
        data.nombre && data.nombre.trim() ? '• Nombre: ' + data.nombre.trim() : null,
        data.contacto && data.contacto.trim() ? '• Contacto: ' + data.contacto.trim() : null,
        '',
        data.mensaje.trim()
      ].filter((l) => l !== null);
      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
      form.classList.add('is-sent');
      if (thanks) thanks.classList.add('is-visible');
    });
    const again = document.getElementById('feedbackAgain');
    if (again) again.addEventListener('click', () => {
      form.reset();
      ratingText.textContent = '';
      form.classList.remove('is-sent');
      thanks.classList.remove('is-visible');
    });
  }

  /* ---------- Páginas internas (Te escuchamos) ---------- */
  function setupInnerPage() {
    const cur = document.querySelector('.page-curtain');
    const reveal = () => {
      root.classList.remove('is-intro');
      if (lenis) { lenis.resize(); lenis.start(); }
      if (!hasGsap || reduceMotion) { if (cur) cur.remove(); return; }
      gsap.registerPlugin(ScrollTrigger);
      const tl = gsap.timeline();
      if (cur) tl.to(cur.children, { scaleY: 0, transformOrigin: 'top', duration: 0.8, ease: 'power3.inOut', stagger: { each: 0.06, from: 'edges' }, onComplete: () => cur.remove() });
      tl.from('[data-in]', { autoAlpha: 0, y: 40, duration: 0.9, ease: 'power3.out', stagger: 0.08 }, 0.35)
        .from('[data-in-drop]', { autoAlpha: 0, y: -60, rotation: (i) => (i % 2 ? 8 : -8), duration: 1.1, ease: 'back.out(1.4)', stagger: 0.12 }, 0.5)
        .from('.listen .line--h', { scaleX: 0, duration: 1.2, ease: 'expo.inOut' }, 0.3);
      gsap.utils.toArray('[data-sparkle]').forEach((el, i) => {
        gsap.to(el, { scale: 0.55, rotation: 45, opacity: 0.6, duration: 1.2 + i * 0.3, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.4 });
      });
      gsap.utils.toArray('[data-fly]').forEach((fly) => {
        const body = fly.querySelector('.fly__body');
        gsap.to(body, { y: 14, duration: 2.6, ease: 'sine.inOut', repeat: -1, yoyo: true });
        gsap.to(body, { x: 10, rotation: 5, duration: 3.4, ease: 'sine.inOut', repeat: -1, yoyo: true });
      });
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, { autoAlpha: 0, y: 36, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
      });
      const vases = document.querySelector('[data-vases]');
      if (vases) vases.classList.add('is-in');
    };
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, new Promise((r) => setTimeout(r, 1200))]).then(() => requestAnimationFrame(reveal));
    setupBasics();
  }

  // Valida el pedido y lo abre en WhatsApp con el mensaje ya armado.
  function bindQuoteForm(form, hint, fieldSel) {
    if (!form) return;
    const fecha = form.elements.fecha;
    const min = new Date();
    min.setDate(min.getDate() + 3);
    const pad = (n) => String(n).padStart(2, '0');
    fecha.min = min.getFullYear() + '-' + pad(min.getMonth() + 1) + '-' + pad(min.getDate());

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      form.querySelectorAll(fieldSel).forEach((f) => f.classList.remove('is-invalid'));

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

    function invalid(name, msg) {
      const input = form.elements[name];
      input.closest(fieldSel).classList.add('is-invalid');
      hint.textContent = msg;
      input.focus();
    }
  }

  /* ---------- Mili: la tortica asistente ---------- */
  function setupMili() {
    const mili = document.getElementById('mili');
    if (!mili) return;
    const bot = document.getElementById('miliBot');
    const bubble = document.getElementById('miliBubble');
    const panel = document.getElementById('miliPanel');
    const lean = document.getElementById('miliLean');
    const eyes = document.getElementById('miliEyes');
    const views = panel.querySelectorAll('.mili-view');
    const messages = ['¡Hola! ¿Pedimos tu torta? 🎂', 'Escríbeme, te ayudo 💬', '¿Qué vamos a celebrar? 🎉', 'Pide tu torta conmigo 🍒'];
    let msgIndex = 0;

    const isOpen = () => mili.classList.contains('is-open');
    const showView = (name) => views.forEach((v) => v.classList.toggle('is-active', v.dataset.view === name));

    function open(view) {
      mili.classList.add('is-open');
      bot.setAttribute('aria-expanded', 'true');
      bubble.classList.remove('is-visible');
      showView(view || 'home');
      mood('love');
    }
    function close() {
      if (!isOpen()) return;
      mili.classList.remove('is-open');
      bot.setAttribute('aria-expanded', 'false');
      bot.focus({ preventScroll: true });
    }

    bot.addEventListener('click', () => (isOpen() ? close() : open()));
    bubble.addEventListener('click', () => open());
    document.getElementById('miliClose').addEventListener('click', close);
    panel.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => {
      showView(b.dataset.go);
      if (b.dataset.go === 'order') panel.querySelector('input[name="nombre"]').focus({ preventScroll: true });
    }));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    document.addEventListener('pointerdown', (e) => { if (isOpen() && !mili.contains(e.target)) close(); });

    // Globo que recuerda que puedes hablarle
    function cycleBubble() {
      if (!isOpen() && !root.classList.contains('is-intro')) {
        bubble.textContent = messages[msgIndex++ % messages.length];
        bubble.classList.add('is-visible');
        setTimeout(() => bubble.classList.remove('is-visible'), 4000);
      }
      setTimeout(cycleBubble, 12000);
    }
    setTimeout(cycleBubble, 5000);

    if (reduceMotion) return;

    /* Estados de ánimo: cada 2 s hace algo distinto para verse viva */
    const MOODS = { hop: 1000, wiggle: 900, spin: 1100, jelly: 900, peek: 1400, dance: 1400, wave: 1200, wink: 600, look: 1500 };
    const WEIGHTS = { hop: 4, wiggle: 3, jelly: 2, wave: 3, look: 3, wink: 2, peek: 2, dance: 2, spin: 1 };
    let lastMood = '';
    let moodTimer = null;
    let watching = false;

    function pickMood() {
      const pool = [];
      Object.keys(WEIGHTS).forEach((m) => { if (m !== lastMood) for (let i = 0; i < WEIGHTS[m]; i++) pool.push(m); });
      return pool[Math.floor(Math.random() * pool.length)];
    }
    function mood(name) {
      const cls = 'mili--' + name;
      clearTimeout(moodTimer);
      Object.keys(MOODS).concat('love').forEach((m) => mili.classList.remove('mili--' + m));
      // Reinicia la animación aunque se repita el estado
      void mili.offsetWidth;
      mili.classList.add(cls);
      moodTimer = setTimeout(() => mili.classList.remove(cls), MOODS[name] || 1300);
      lastMood = name;
    }
    setInterval(() => {
      if (isOpen() || watching || root.classList.contains('is-intro') || document.hidden) return;
      mood(pickMood());
    }, 2000);
    bot.addEventListener('mouseenter', () => { if (!isOpen()) mood('wave'); });

    /* Al hacer scroll, Mili se inclina hacia la web y la sigue con los ojos */
    if (!hasGsap) return;
    const leanRot = gsap.quickTo(lean, 'rotation', { duration: 0.45, ease: 'power3.out' });
    const leanX = gsap.quickTo(lean, 'x', { duration: 0.45, ease: 'power3.out' });
    const leanSkew = gsap.quickTo(lean, 'skewX', { duration: 0.45, ease: 'power3.out' });
    const eyeX = gsap.quickTo(eyes, 'x', { duration: 0.35, ease: 'power2.out' });
    const eyeY = gsap.quickTo(eyes, 'y', { duration: 0.35, ease: 'power2.out' });
    const leanY = gsap.quickTo(lean, 'y', { duration: 0.45, ease: 'power3.out' });
    const leanScaleY = gsap.quickTo(lean, 'scaleY', { duration: 0.45, ease: 'power3.out' });
    let idleTimer = null;
    let lastScrollY = window.scrollY;
    let lastT = performance.now();

    function watch(velocity) {
      if (isOpen()) return;
      const speed = Math.min(1, Math.abs(velocity) / 2200);
      const down = velocity > 0;
      if (!watching) { watching = true; mili.classList.add('is-watching'); }
      // Se inclina hacia la página (izquierda) y mira en la dirección del scroll:
      // hacia abajo si bajas (se agacha un poco), hacia arriba si subes (se estira).
      leanRot(-(6 + speed * 10));
      leanX(-(4 + speed * 6));
      leanSkew(down ? speed * 5 : -speed * 5);
      leanY(down ? 3 : -5);
      leanScaleY(down ? 0.95 : 1.05);
      eyeX(-2);
      eyeY(down ? 4 : -4);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        watching = false;
        mili.classList.remove('is-watching');
        leanRot(0); leanX(0); leanSkew(0); leanY(0); leanScaleY(1); eyeX(0); eyeY(0);
        if (Math.random() < 0.35) mood('look');
      }, 420);
    }

    if (lenis) {
      lenis.on('scroll', (e) => { if (Math.abs(e.velocity) > 6) watch(e.velocity * 60); });
    } else {
      window.addEventListener('scroll', () => {
        const now = performance.now();
        const dt = Math.max(16, now - lastT);
        const v = (window.scrollY - lastScrollY) / dt * 1000;
        lastScrollY = window.scrollY; lastT = now;
        if (Math.abs(v) > 40) watch(v);
      }, { passive: true });
    }
  }

})();
