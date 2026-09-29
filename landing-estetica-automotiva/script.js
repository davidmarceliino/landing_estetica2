/* EstéticaPro — interações e animações da landing (GSAP + ScrollTrigger) */
(function () {
  const hasGsap = window.gsap && window.ScrollTrigger;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* Reveal ao aparecer na tela */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* Navbar: sombra ao rolar + CTA fixo no mobile */
  const navbar = document.getElementById('navbar');
  const mobileCta = document.getElementById('mobileCta');
  const hero = document.querySelector('.hero');
  const ctaFinal = document.getElementById('cta-final');
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      navbar.classList.toggle('is-scrolled', window.scrollY > 10);
      if (mobileCta && hero && ctaFinal) {
        const show = hero.getBoundingClientRect().bottom < 0 &&
                     ctaFinal.getBoundingClientRect().top > window.innerHeight;
        mobileCta.classList.toggle('is-visible', show);
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Menu mobile */
  const menuBtn = document.getElementById('navbarMenu');
  const nav = document.getElementById('navbarNav');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuBtn.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* Mockup: abas do painel */
  const tabs = document.querySelectorAll('.mockup .tab');
  const panels = document.querySelectorAll('.mockup .panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });
      panels.forEach(p => {
        const active = p.dataset.panel === tab.dataset.view;
        p.hidden = !active;
        p.classList.toggle('is-active', active);
      });
    });
  });

  /* Contadores do mockup */
  document.querySelectorAll('[data-count]').forEach(el => {
    const end = parseInt(el.dataset.count, 10);
    const start = performance.now();
    (function tick(now) {
      const p = Math.min(Math.max((now - start) / 1200, 0), 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString('pt-BR');
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  });

  /* Hero: luz segue o mouse + mockup inclina */
  const mockup = document.querySelector('.mockup');
  if (hero && mockup && window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
      const m = mockup.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (e.clientX - m.left) / m.width - 0.5));
      const y = Math.max(-1, Math.min(1, (e.clientY - m.top) / m.height - 0.5));
      mockup.style.setProperty('--ry', (x * 8) + 'deg');
      mockup.style.setProperty('--rx', (-y * 8) + 'deg');
    });
    hero.addEventListener('mouseleave', () => {
      mockup.style.setProperty('--ry', '0deg');
      mockup.style.setProperty('--rx', '0deg');
    });
  }

  /* FAQ: mantém apenas um item aberto */
  const faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) faqItems.forEach(o => { if (o !== item) o.open = false; });
    });
  });

  /* Faixa de serviços: anda sozinha, acelera com o scroll e inverte ao subir */
  const track = document.querySelector('.marquee__track');
  if (track) {
    track.style.animation = 'none';
    let mx = 0, lastY = window.scrollY, lastT = performance.now();
    (function loop(now) {
      const dt = Math.min(now - lastT, 50);
      const dy = window.scrollY - lastY;
      lastY = window.scrollY; lastT = now;
      const half = track.scrollWidth / 2;
      mx -= dt * 0.06 + dy * 0.8;
      if (mx <= -half) mx += half;
      if (mx > 0) mx -= half;
      track.style.transform = 'translate3d(' + mx + 'px,0,0)';
      requestAnimationFrame(loop);
    })(lastT);
  }

  if (!hasGsap) return;

  /* ==============================================
     ANIMAÇÕES DE SCROLL (GSAP)
     ============================================== */

  /* Barra de progresso no topo */
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.prepend(bar);
  gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  /* Hero: texto sobe e some, mockup deita para trás */
  gsap.to('.hero__content', {
    y: -80, opacity: 0, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 20%', scrub: true }
  });
  gsap.to('.hero__mockup', {
    rotateX: 22, scale: 0.88, y: 60, transformPerspective: 1200, transformOrigin: 'center top', ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  /* Manifesto: palavras acendem conforme o scroll */
  const manifesto = document.querySelector('.manifesto__text');
  if (manifesto) {
    manifesto.innerHTML = manifesto.textContent.trim().split(/\s+/)
      .map(w => '<span class="w">' + w + '</span>').join(' ');
    gsap.to(manifesto.querySelectorAll('.w'), {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: manifesto, start: 'top 80%', end: 'bottom 45%', scrub: true }
    });
  }

  const mm = gsap.matchMedia();

  /* Desktop: funcionalidades rolam na horizontal com a seção fixa */
  mm.add('(min-width: 1001px)', () => {
    const sec = document.querySelector('.funcionalidades');
    const grid = sec.querySelector('.grid');
    grid.classList.add('is-horizontal');
    grid.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    const dist = () => grid.scrollWidth - sec.querySelector('.container').clientWidth + 40;
    const tween = gsap.to(grid, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true }
    });
    gsap.from(grid.querySelectorAll('.feat'), {
      rotate: 6, y: 60, stagger: 0.05, ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top 80%', end: 'top top', scrub: true }
    });
    return () => { tween.kill(); grid.classList.remove('is-horizontal'); gsap.set(grid, { clearProps: 'x' }); };
  });

  /* Vídeo cresce ao entrar */
  gsap.fromTo('.video__player', { scale: 0.8, borderRadius: 60 }, {
    scale: 1, borderRadius: 28, ease: 'none',
    scrollTrigger: { trigger: '.video__player', start: 'top bottom', end: 'top 20%', scrub: true }
  });

  /* Passos: linha se preenche */
  gsap.fromTo('.steps__line', { scaleX: 0 }, {
    scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: '.steps', start: 'top 85%', end: 'bottom 60%', scrub: true }
  });

  /* Antes × Depois: colunas vêm dos lados */
  gsap.from('.compare__col--antes', {
    xPercent: -25, rotate: -4, ease: 'none',
    scrollTrigger: { trigger: '.compare', start: 'top bottom', end: 'top 35%', scrub: true }
  });
  gsap.from('.compare__col--depois', {
    xPercent: 25, rotate: 4, ease: 'none',
    scrollTrigger: { trigger: '.compare', start: 'top bottom', end: 'top 35%', scrub: true }
  });

  /* Para quem é: cards em alturas diferentes + parallax nas fotos */
  gsap.utils.toArray('.publico__card').forEach((card, i) => {
    gsap.fromTo(card, { y: i % 2 ? 140 : 60 }, {
      y: 0, ease: 'none',
      scrollTrigger: { trigger: '.publico', start: 'top bottom', end: 'bottom 70%', scrub: true }
    });
    gsap.fromTo(card.querySelector('img'), { yPercent: -10 }, {
      yPercent: 10, ease: 'none',
      scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* CTA final: título cresce */
  gsap.from('.cta-final__title', {
    scale: 0.8, opacity: 0.3, ease: 'none',
    scrollTrigger: { trigger: '.cta-final', start: 'top bottom', end: 'top 30%', scrub: true }
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
