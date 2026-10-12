// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Hairline under the header once the page scrolls
const header = document.querySelector('.top');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Copy-to-clipboard buttons
document.querySelectorAll('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.textContent = 'Copied';
      btn.classList.add('is-done');
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('is-done');
      }, 1800);
    } catch {
      window.location.href = 'mailto:' + btn.dataset.copy;
    }
  });
});

// --------------------------------------------------------------------------
// Slides, section rail and reveal-on-arrival
// --------------------------------------------------------------------------
const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const slides = [...document.querySelectorAll('.slide')];
const last = slides.length - 1;
const pad = (n) => String(n).padStart(2, '0');

// On-screen header height (the page may be scaled, so read the rendered size)
const headH = () => header.getBoundingClientRect().height;

// Scroll positions where each slide starts and where its content ends
function bounds() {
  const h = headH();
  const max = root.scrollHeight - innerHeight;
  return slides.map((s, i) => {
    const r = s.getBoundingClientRect();
    const top = Math.min(max, Math.round(r.top + scrollY - h));
    const over = r.height - (innerHeight - h);
    // A few pixels of overflow is scaling rounding, not content worth scrolling to
    const end = i === last ? max : Math.min(max, over < 8 ? top : Math.round(top + over));
    return { top, end };
  });
}
const indexAt = (pos, b) => b.reduce((n, s, i) => (s.top <= pos + 2 ? i : n), 0);

// Rail
const rail = document.createElement('nav');
rail.className = 'rail';
rail.setAttribute('aria-label', 'Sections');
rail.innerHTML =
  slides.map((s, i) =>
    `<button type="button" class="rail__item" data-i="${i}" aria-label="Go to ${s.dataset.title}">` +
    `<span class="rail__label">${s.dataset.title}</span><span class="rail__tick"></span></button>`
  ).join('') +
  `<span class="rail__count"><b>01</b>/${pad(slides.length)}</span>`;
document.body.append(rail);
const railItems = [...rail.querySelectorAll('.rail__item')];
const railCount = rail.querySelector('.rail__count b');

let active = -1;
let flashTimer;
function updateRail() {
  const b = bounds();
  const probe = scrollY + (innerHeight - headH()) * 0.5;
  const i = scrollY >= b[last].top - 2 ? last : indexAt(probe, b);
  if (i === active) return;
  active = i;
  railItems.forEach((el, n) => {
    el.classList.toggle('is-active', n === i);
    el.toggleAttribute('aria-current', n === i);
    el.classList.remove('is-flash');
  });
  railCount.textContent = pad(i + 1);
  railItems[i].classList.add('is-flash');
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => railItems[i].classList.remove('is-flash'), 1400);
}
window.addEventListener('scroll', updateRail, { passive: true });
window.addEventListener('resize', updateRail);
updateRail();

// One section per scroll on desktop with a mouse or trackpad.
// Sections taller than the screen scroll smoothly inside before moving on.
const fpQuery = matchMedia('(min-width: 821px) and (hover: hover) and (pointer: fine)');
let fp = false;
let y = scrollY;
let target = scrollY;
let raf = 0;
let tween = null;
let hold = false;
let lastWheel = 0;

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function frame(now) {
  if (tween) {
    const t = Math.min(1, (now - tween.start) / tween.dur);
    tween.p = t;
    y = tween.from + (tween.to - tween.from) * easeInOut(t);
    if (t === 1) { tween = null; target = y; }
    flushReveal();
  } else {
    y += (target - y) * 0.14;
    if (Math.abs(target - y) < 0.5) y = target;
  }
  window.scrollTo({ top: y, behavior: 'instant' });
  raf = tween || y !== target ? requestAnimationFrame(frame) : 0;
}
const run = () => { if (!raf) raf = requestAnimationFrame(frame); };

// Work projects: a sideways carousel inside the Work slide
const carousel = document.querySelector('.carousel');
const track = carousel.querySelector('.carousel__track');
const projects = [...track.children];
const workSlide = slides.indexOf(carousel.closest('.slide'));
const nav = document.querySelector('.carousel__nav');
const [prevBtn, nextBtn] = nav.querySelectorAll('.carousel__btn');
let project = 0;
let busyUntil = 0;

function setProject(i, instant) {
  project = Math.max(0, Math.min(projects.length - 1, i));
  if (instant) track.style.transition = 'none';
  track.style.setProperty('--idx', project);
  projects.forEach((p, n) => {
    p.classList.toggle('is-current', n === project);
    p.inert = fp && n !== project;
    if (instant) p.style.transition = 'none';
  });
  if (instant) {
    track.offsetWidth; // apply the jump before restoring transitions
    track.style.transition = '';
    projects.forEach((p) => { p.style.transition = ''; });
  }
  nav.querySelector('b').textContent = pad(project + 1);
  prevBtn.disabled = project === 0;
  nextBtn.disabled = project === projects.length - 1;
  nav.querySelector('.carousel__hint').textContent =
    project < projects.length - 1 ? 'Scroll for the next project' : 'Scroll down to continue';
}

function slideProject(i) {
  if (i < 0 || i >= projects.length || i === project) return;
  setProject(i);
  busyUntil = performance.now() + 1000;
  hold = true;
  // Soft edges only while the projects are moving
  carousel.classList.add('is-moving');
  clearTimeout(carousel._fade);
  carousel._fade = setTimeout(() => carousel.classList.remove('is-moving'), 650);
}
nav.addEventListener('click', (e) => {
  const btn = e.target.closest('.carousel__btn');
  if (btn && performance.now() >= busyUntil) slideProject(project + Number(btn.dataset.dir));
});

// Shrink the carousel slightly on short screens so a project always fits
function fitWork() {
  carousel.style.zoom = '';
  if (!fp) return;
  const s = slides[workSlide];
  const cs = getComputedStyle(s);
  const head = s.querySelector('.section__head');
  const used = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) +
    head.offsetHeight + parseFloat(getComputedStyle(head).marginBottom);
  const free = innerHeight / scale - header.offsetHeight - used;
  const zoom = Math.min(1, free / carousel.offsetHeight);
  if (zoom < 1) carousel.style.zoom = Math.max(0.6, zoom).toFixed(3);
}

function goTo(i, reverse) {
  const b = bounds();
  i = Math.max(0, Math.min(last, i));
  const to = b[i].top;
  const from = scrollY;
  if (Math.abs(to - from) < 1) return;
  // Arriving at Work from below lands on its last project, otherwise its first
  if (i === workSlide) setProject(reverse ? projects.length - 1 : 0, true);
  tween = { from, to, start: performance.now(), dur: Math.min(1100, 700 + Math.abs(to - from) * 0.2), p: 0 };
  y = from;
  target = to;
  hold = true;
  run();
}

function step(d) {
  const b = bounds();
  const pos = raf ? target : scrollY;
  const i = indexAt(pos, b);
  const { top, end } = b[i];
  if (i === workSlide && pos >= top - 2 && pos <= end + 2) {
    if (d > 0 && project < projects.length - 1) return slideProject(project + 1);
    if (d < 0 && project > 0 && pos <= top + 2) return slideProject(project - 1);
  }
  if (d > 0) {
    if (pos < end - 1) {
      target = Math.min(end, pos + d);
      if (target === end) hold = true;
      run();
    } else if (i < last) goTo(i + 1);
  } else if (pos > top + 1) {
    if (end > top + 1) {
      target = Math.max(top, pos + d);
      if (target === top) hold = true;
      run();
    } else goTo(i);
  } else if (i > 0) goTo(i - 1, true);
}

window.addEventListener('wheel', (e) => {
  if (!fp || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
  e.preventDefault();
  const now = performance.now();
  const gap = now - lastWheel;
  lastWheel = now;
  // Ignore trackpad momentum until the gesture settles
  if (tween || now < busyUntil || (hold && gap < 160)) return;
  hold = false;
  const d = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
  if (Math.abs(d) >= 1) step(d);
}, { passive: false });

window.addEventListener('keydown', (e) => {
  if (!fp || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest('input, textarea, select, [contenteditable]')) return;
  const page = innerHeight - headH() - 80;
  const keys = {
    ArrowDown: () => step(page), PageDown: () => step(page),
    ArrowUp: () => step(-page), PageUp: () => step(-page),
    Home: () => goTo(0), End: () => goTo(last),
  };
  if (e.key === ' ' && !e.target.closest('a, button')) keys[' '] = () => step(e.shiftKey ? -page : page);
  if (active === workSlide) {
    keys.ArrowRight = () => slideProject(project + 1);
    keys.ArrowLeft = () => slideProject(project - 1);
  }
  if (!keys[e.key]) return;
  e.preventDefault();
  if (!tween && performance.now() >= busyUntil) keys[e.key]();
});

// In-page links and the rail glide to their slide
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  const i = id ? slides.findIndex((s) => s.id === id) : 0;
  if (i < 0 || !fp) return;
  e.preventDefault();
  goTo(i);
});
rail.addEventListener('click', (e) => {
  const item = e.target.closest('.rail__item');
  if (!item) return;
  const i = Number(item.dataset.i);
  if (fp) goTo(i);
  else slides[i].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
});

// Keep the animator in sync with scrollbar drags and other native scrolls
window.addEventListener('scroll', () => { if (!raf) y = target = scrollY; }, { passive: true });

// Slides are designed for at least 1440 x 900. Smaller screens shrink the page
// to fit so every slide still fits; larger screens grow it part of the way
// (GROW 0 = natural size, 1 = fill the screen).
const CANVAS_W = 1440;
const CANVAS_H = 900;
const GROW = 0.3;
let scale = 1;

function setScale() {
  const fit = Math.min(innerWidth / CANVAS_W, innerHeight / CANVAS_H);
  scale = !fp ? 1 : fit < 1 ? Math.max(0.5, fit) : 1 + (fit - 1) * GROW;
  root.style.zoom = scale === 1 ? '' : scale.toFixed(4);
  root.style.setProperty('--vh', innerHeight / scale + 'px');
  fitWork();
  updateRail();
}

function setMode() {
  fp = fpQuery.matches && !reduceMotion;
  root.classList.toggle('fp', fp);
  root.style.setProperty('--foot-h', document.querySelector('footer').offsetHeight + 'px');
  setProject(project, true);
  setScale();
}
fpQuery.addEventListener('change', setMode);
window.addEventListener('resize', setScale);
document.fonts.ready.then(fitWork);
setMode();

// Reveal: content rises in, staggered, each time its section comes into view
let pending = [];
function flushReveal() {
  // During a slide change, wait until the move is mostly done so content pops on arrival
  if (!pending.length || (tween && tween.p < 0.55)) return;
  pending
    .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
    .forEach((el, n) => {
      const delay = Math.min(n, 8) * 90;
      el.style.setProperty('--d', delay + 'ms');
      el.classList.add('is-in');
      countUp(el, delay);
    });
  pending = [];
}

function countUp(el, delay) {
  const targets = el.matches('[data-count]') ? [el] : el.querySelectorAll('[data-count]');
  targets.forEach((t) => {
    const m = t.dataset.count.match(/^([^\d]*)([\d.]+)(.*)$/);
    if (!m || Number(m[2]) === 0) return;
    const value = Number(m[2]);
    const decimals = (m[2].split('.')[1] || '').length;
    const render = (v) => { t.textContent = m[1] + v.toFixed(decimals) + m[3]; };
    cancelAnimationFrame(t._raf);
    render(0);
    const start = performance.now() + delay + 300;
    const tick = (now) => {
      const p = Math.max(0, Math.min(1, (now - start) / 1500));
      render(value * (1 - Math.pow(2, -10 * p)));
      if (p < 1) t._raf = requestAnimationFrame(tick);
      else t.textContent = t.dataset.count;
    };
    t._raf = requestAnimationFrame(tick);
  });
}

if (!reduceMotion && 'IntersectionObserver' in window) {
  const items = document.querySelectorAll([
    '.intro__text > *', '.intro__photo',
    '.section__head', '.job__head', '.job__lede', '.pipeline > li',
    '.project__meta', '.project__text > *', '.project__visual > *',
    '.edu', '.tools > div',
    '.contact > *',
  ].join(','));
  const subs = [
    '.intro__links > *', '.diagram__flow > li', '.figures > div',
    '.rbac tbody tr', '.models li', '.contact__other li',
  ];
  subs.forEach((sel) => document.querySelectorAll(sel).forEach((el) => {
    el.classList.add('rv-sub');
    el.style.setProperty('--k', [...el.parentElement.children].indexOf(el));
  }));
  document.querySelectorAll('.figures dt, .edu__gpa span').forEach((el) => { el.dataset.count = el.textContent; });

  const enter = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && !e.target.classList.contains('is-in') && !pending.includes(e.target)) pending.push(e.target);
    });
    flushReveal();
  }, { rootMargin: '0px 0px -10% 0px' });

  // Reset only once fully off screen, so it replays on the next visit
  const exit = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) return;
      e.target.classList.remove('is-in');
      pending = pending.filter((el) => el !== e.target);
    });
  });

  items.forEach((el) => {
    el.classList.add('rv');
    enter.observe(el);
    exit.observe(el);
  });
  root.classList.add('rv-on');
}
