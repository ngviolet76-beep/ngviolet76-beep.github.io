/* 공개 주소를 정하면 아래 따옴표 안에 넣으세요. 예: https://www.example.co.kr
   비워 두면 지금 열린 주소를 그대로 씁니다. */
const SITE_URL = 'https://ngviolet76-beep.github.io';

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const base = (SITE_URL || location.origin).replace(/\/$/, '');
  /* 언어별 폴더에서는 사진 경로 앞에 ../ 를 붙입니다 */
  const ROOT = document.documentElement.dataset.base || '';
  const LANG = document.documentElement.lang.slice(0, 2);
  const LABELS = {
    ko: ['사진 크게 보기', '닫기', '이전 사진', '다음 사진', '바닥난방 제품과 시공 사진'],
    en: ['Enlarge photo', 'Close', 'Previous photo', 'Next photo', 'Floor heating products and installation'],
    ja: ['写真を拡大', '閉じる', '前の写真', '次の写真', '床暖房の製品と施工の写真'],
    zh: ['放大照片', '关闭', '上一张', '下一张', '地暖产品和施工照片'],
    mn: ['Зургийг томруулах', 'Хаах', 'Өмнөх зураг', 'Дараах зураг', 'Шалны халаалтын бүтээгдэхүүн, угсралт'],
    de: ['Foto vergrößern', 'Schließen', 'Vorheriges Foto', 'Nächstes Foto', 'Produkte und Installation der Fußbodenheizung'],
    es: ['Ampliar foto', 'Cerrar', 'Foto anterior', 'Foto siguiente', 'Productos e instalación de calefacción por suelo'],
  }[LANG] || [];

  /* 언어 선택 창: 바깥을 누르면 닫힙니다 */
  const langBox = document.querySelector('details.lang');
  if (langBox) {
    document.addEventListener('click', (e) => {
      if (langBox.open && !langBox.contains(e.target)) langBox.open = false;
    });
  }

  if (/^https?:/.test(base)) {
    const page = (ROOT ? location.pathname.split('/').slice(-2, -1)[0] + '/' : '') + (location.pathname.split('/').pop() || 'index.html');
    const canonical = document.querySelector('link[rel="canonical"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (canonical) canonical.href = base + '/' + page;
    if (ogUrl) ogUrl.content = base + '/' + page;
    if (ogImage) ogImage.content = base + '/images/hero.jpg';
  }

  /* 상단 메뉴 */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav-list');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
  }

  /* 로고 파일이 있으면 글자 이름 대신 로고를 보여줍니다 */
  document.querySelectorAll('.brand-logo').forEach((logo) => {
    const ok = () => logo.closest('.brand').classList.add('has-logo');
    if (logo.complete && logo.naturalWidth > 0) ok();
    else logo.addEventListener('load', ok);
  });

  /* 첫 화면 사진·영상: 파일이 불러와지면 hero--media를 붙입니다 */
  const hero = document.getElementById('hero');
  if (hero) {
    const ready = (el) => { el.classList.add('is-ready'); hero.classList.add('hero--media'); };
    const img = document.getElementById('hero-image');
    if (img) {
      if (img.complete && img.naturalWidth > 0) ready(img);
      else img.addEventListener('load', () => ready(img));
    }
    const video = document.getElementById('hero-video');
    if (video) {
      if (video.readyState >= 2) ready(video);
      else video.addEventListener('loadeddata', () => ready(video));
    }
  }

  /* 스크롤 등장 */
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    [...group.children].forEach((child, i) => {
      child.classList.add('reveal');
      child.style.setProperty('--d', (i * 0.08).toFixed(2) + 's');
    });
  });
  const revealItems = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealItems.forEach((el) => io.observe(el));
  }

  /* 큰 숫자 올라가기: 화면에 보일 때 0에서 입력값까지 */
  const counters = document.querySelectorAll('[data-count]');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const fmt = new Intl.NumberFormat('ko-KR');
    const countIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        countIo.unobserve(e.target);
        const el = e.target.querySelector('[data-num]');
        const target = Number(e.target.dataset.count);
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / 1400, 1);
          el.textContent = fmt.format(Math.round(target * (1 - Math.pow(1 - t, 3))));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => countIo.observe(c));
  }

  /* 큰 사진 띠의 느린 움직임 (넓은 화면에서만) */
  const bands = document.querySelectorAll('.band');
  if (bands.length && !reduceMotion && window.matchMedia('(min-width:900px)').matches) {
    let ticking = false;
    const update = () => {
      bands.forEach((band) => {
        const r = band.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        band.querySelector('.slot').style.transform = 'translateY(' + (p * -5).toFixed(2) + '%)';
      });
      ticking = false;
    };
    update();
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
  }

  /* images 폴더에 icon-로 시작하는 파일이 있으면 그 아이콘을 씁니다 */
  document.querySelectorAll('[data-icon]').forEach((channel) => {
    const probe = new Image();
    probe.onload = () => {
      const svg = channel.querySelector('svg');
      if (!svg) return;
      probe.alt = '';
      svg.replaceWith(probe);
    };
    probe.src = ROOT + 'images/icon-' + channel.dataset.icon + '.png';
  });

  /* 제품 사진: 있는 파일만 찾아서 보여줍니다 */
  const probeImage = (src) => new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(src);
    im.onerror = () => resolve(null);
    im.src = src;
  });
  const productSrc = (n) => ROOT + 'images/product-' + n + '.jpg';
  const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const findPhotos = (from, to) =>
    Promise.all(range(from, to).map((n) => probeImage(productSrc(n)))).then((list) => list.filter(Boolean));

  let lightbox, lbImg, lbList = [], lbIndex = 0;
  const showAt = (i) => {
    lbIndex = (i + lbList.length) % lbList.length;
    lbImg.src = lbList[lbIndex];
  };
  const openLightbox = (list, i) => {
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.className = 'lightbox';
      lightbox.setAttribute('role', 'dialog');
      lightbox.setAttribute('aria-modal', 'true');
      lightbox.setAttribute('aria-label', LABELS[0]);
      lightbox.innerHTML = '<img alt="' + LABELS[4] + '"><button class="lb-btn lb-close" aria-label="' + LABELS[1] + '">×</button><button class="lb-btn lb-prev" aria-label="' + LABELS[2] + '">‹</button><button class="lb-btn lb-next" aria-label="' + LABELS[3] + '">›</button>';
      document.body.appendChild(lightbox);
      lbImg = lightbox.querySelector('img');
      lightbox.querySelector('.lb-close').onclick = () => { lightbox.hidden = true; };
      lightbox.querySelector('.lb-prev').onclick = () => showAt(lbIndex - 1);
      lightbox.querySelector('.lb-next').onclick = () => showAt(lbIndex + 1);
      lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.hidden = true; });
      document.addEventListener('keydown', (e) => {
        if (lightbox.hidden) return;
        if (e.key === 'Escape') lightbox.hidden = true;
        if (e.key === 'ArrowLeft') showAt(lbIndex - 1);
        if (e.key === 'ArrowRight') showAt(lbIndex + 1);
      });
    }
    lightbox.hidden = false;
    lbList = list;
    showAt(i);
  };
  const addPhotos = (holder, list) => {
    list.forEach((src, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', LABELS[0]);
      const im = document.createElement('img');
      im.src = src;
      im.alt = LABELS[4];
      im.loading = 'lazy';
      b.appendChild(im);
      b.addEventListener('click', () => openLightbox(list, i));
      holder.appendChild(b);
    });
  };

  /* 제품 사진이 3장 이상이면 메뉴에 사진 페이지가 나타납니다 */
  findPhotos(1, 3).then((list) => {
    if (list.length >= 3) {
      document.querySelectorAll('[data-gallery-link]').forEach((li) => { li.hidden = false; });
    }
  });

  const gallerySec = document.getElementById('product-gallery');
  if (gallerySec) {
    findPhotos(4, 24).then((list) => {
      if (!list.length) return;
      gallerySec.hidden = false;
      addPhotos(document.getElementById('mosaic'), list.slice(0, 12));
      const rest = list.slice(12);
      if (rest.length) addPhotos(document.getElementById('rail'), rest);
    });
  }

  const galleryGrid = document.getElementById('gallery-grid');
  if (galleryGrid) {
    findPhotos(1, 24).then((list) => {
      if (list.length) {
        galleryGrid.innerHTML = '';
        addPhotos(galleryGrid, list);
      }
    });
  }
})();
