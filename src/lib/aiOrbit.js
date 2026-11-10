/*
 * The AI projects page: frames from every AI project lie in a loose ring and
 * slowly turn around the shape in the middle. The frames are links rendered by
 * React; this module only moves them. Hovering or focusing a frame stops the
 * ring and tells the page which project it belongs to.
 *
 * attachAiOrbit(stage, { onActive }) → cleanup. Frames are `[data-orbit-item]`
 * children carrying `data-project` (an index into the page's project list).
 */

// One full turn, in seconds.
const TURN = 140;

export function attachAiOrbit(stage, { onActive = () => {} } = {}) {
  if (!stage) {
    return () => {};
  }

  const frames = [...stage.querySelectorAll('[data-orbit-item]')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rx = 0;
  let ry = 0;
  let unit = 0;
  let angle = 0;
  let speed = 1;
  let target = 1;
  let frame = 0;
  let last = performance.now();
  let active = null;

  // Fixed per frame: where on the ring it sits, how far off the line and how big.
  const layout = frames.map((element, index) => ({
    element,
    slot: (index / frames.length) * Math.PI * 2,
    offset: (((index * 7) % 5) - 2) * 0.05,
    size: 0.8 + ((index * 5) % 4) * 0.12,
    project: Number(element.dataset.project),
  }));

  function measure() {
    const rect = stage.getBoundingClientRect();
    const narrow = rect.width < 720;
    rx = rect.width * (narrow ? 0.34 : 0.29);
    ry = rect.height * (narrow ? 0.3 : 0.32);
    unit = Math.min(rect.width * (narrow ? 0.24 : 0.12), 210);
  }

  function place() {
    for (const item of layout) {
      const theta = item.slot + angle;
      const x = Math.cos(theta) * rx * (1 + item.offset);
      const y = Math.sin(theta) * ry * (1 + item.offset);
      const w = unit * item.size;
      item.element.style.width = `${w}px`;
      item.element.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      // Lower frames lie over upper ones, as on a table seen from the front.
      item.element.style.zIndex = String(Math.round(1000 + y));
    }
  }

  function tick(now) {
    const delta = Math.min(0.05, (now - last) / 1000);
    last = now;
    speed += (target - speed) * 0.06;
    angle += ((Math.PI * 2) / TURN) * delta * speed;
    place();
    frame = document.hidden ? 0 : requestAnimationFrame(tick);
  }

  function start() {
    if (reduceMotion || frame) {
      return;
    }
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function setActive(project) {
    if (project === active) {
      return;
    }
    active = project;
    stage.dataset.active = project === null ? '' : String(project);
    for (const item of layout) {
      item.element.classList.toggle('is-dim', project !== null && item.project !== project);
    }
    onActive(project);
  }

  function enter(event) {
    const element = event.target.closest('[data-orbit-item]');
    if (!element) {
      return;
    }
    target = 0;
    setActive(Number(element.dataset.project));
  }

  function leave(event) {
    const next = event.relatedTarget?.closest?.('[data-orbit-item]');
    if (next && stage.contains(next)) {
      return;
    }
    target = 1;
    setActive(null);
  }

  function onVisibility() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      start();
    }
  }

  const resizeObserver = new ResizeObserver(() => {
    measure();
    place();
  });

  measure();
  place();
  resizeObserver.observe(stage);
  stage.addEventListener('pointerover', enter);
  stage.addEventListener('pointerout', leave);
  stage.addEventListener('focusin', enter);
  stage.addEventListener('focusout', leave);
  document.addEventListener('visibilitychange', onVisibility);
  start();

  return () => {
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    stage.removeEventListener('pointerover', enter);
    stage.removeEventListener('pointerout', leave);
    stage.removeEventListener('focusin', enter);
    stage.removeEventListener('focusout', leave);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
