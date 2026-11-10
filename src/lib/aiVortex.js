/*
 * The AI landing's hero: frames of the AI projects leave the shape in the
 * middle along spiral arms, grow as they travel out and, near the edge of the
 * screen, smear into coloured comets. Each frame is a bead with one detail of
 * a case's interface under a fisheye lens — the cube in the middle made small:
 * a rounded square holding the photo inside a soft clear shell. One 2D canvas; the comets are drawn on a
 * small offscreen canvas and scaled up, which is what blurs them for free.
 *
 * The frames are the way into the cases. Pointing at one brings the swirl to rest,
 * dims the other projects' frames and reports the project (`onHover`); a click
 * opens it (`onSelect`). On touch a tap only picks the project (`onPick`), and
 * the page's button opens it. `getFocus` names the project the page is showing,
 * whose frames stay brighter than the rest.
 *
 * attachAiVortex(canvas, { frames, clear, avoid, getFocus, onHover, onPick,
 * onSelect }) → cleanup. `frames` are { src, crop, project }, `crop` being
 * [left, top, side] in the image's pixels (the middle square if left out). `clear` is the element
 * the arms start around (the shape), so they never cover it; frames fade out
 * as they pass over the `avoid` elements (the text in the middle).
 */

const ITEM_COUNT = 44;
const ARMS = 4;
// One trip from the centre to the edge, in seconds.
const TRIP = 15;
// How far an item turns on its way out, in radians.
const TWIST = 2.6;
// The comets' offscreen canvas is this many times smaller than the screen.
const TRAIL_SCALE = 6;
const COMET_COLORS = ['#1d3bff', '#ff6a1f', '#ffd21f', '#ff2a8a', '#22d3ff', '#7a2bff'];
// How fast the swirl turns while a frame is pointed at, as a share of normal:
// it comes to rest, so the frame stays under the pointer to be clicked.
const HOVER_PACE = 0;
// A lit frame stays lit while the pointer is within this much of its size.
const HOLD_SCALE = 1.3;
// The swirl's rush: how often it comes, in seconds, how long it lasts and how
// many times faster than usual it runs at its peak.
const SURGE_EVERY = 10;
const SURGE_LENGTH = 1.6;
const SURGE_BOOST = 5;

function easeOut(value) {
  return 1 - (1 - value) ** 2;
}

function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

// Each detail is drawn once into tiles this many pixels across.
const TILE = 240;
// How much the lens swells the middle of a detail: 0 is flat glass.
const LENS = 0.45;
// The shell's glass: a cool white, a touch whiter than the page.
const GLASS = [246, 249, 255];

/*
 * A bead is the cube in the middle made small: a soft, very round clear shell
 * (`outer`, the superellipse's power) with a firmer rounded square inside
 * (`inner`) that holds the photo, takes `size` of the shell and turns up to
 * `turn` radians either way.
 */
const LOOK = { outer: 3, inner: 6, size: 0.7, turn: 0.09 };

// The middle square of a screenshot, for a frame given without a crop.
function middleSquare(image) {
  const side = Math.min(image.naturalWidth, image.naturalHeight);
  return [(image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side];
}

// How far a point is from the middle, 1 on the outline of power `power`.
function reach(u, v, power) {
  return (Math.abs(u) ** power + Math.abs(v) ** power) ** (1 / power);
}

// The outline of power `power` around (0, 0) as the current path.
function outline(context, radius, power) {
  context.beginPath();
  for (let step = 0; step < 72; step += 1) {
    const angle = (step / 72) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = Math.sign(cos) * Math.abs(cos) ** (2 / power) * radius;
    const y = Math.sign(sin) * Math.abs(sin) ** (2 / power) * radius;
    if (step) {
      context.lineTo(x, y);
    } else {
      context.moveTo(x, y);
    }
  }
  context.closePath();
}

/*
 * A detail as three tiles. `content`: the crop seen through a fisheye lens,
 * its middle swollen and its edges bent round, filling the tile so it can
 * move. `face`: laid over the content, a milk thickening towards the inner
 * outline, light across it and a cyan-to-violet play near its edge. `glass`: the clear shell over all of it, milky and bright towards
 * its own outline, with a glint at the top left. The first two are in the
 * inner shape's own frame, so it can turn and breathe inside the shell.
 */
function toLensTiles(image, crop) {
  const [left, top, side] = crop ?? middleSquare(image);
  const content = document.createElement('canvas');
  content.width = TILE;
  content.height = TILE;
  const contentContext = content.getContext('2d', { willReadFrequently: true });
  contentContext.fillStyle = '#ffffff';
  contentContext.fillRect(0, 0, TILE, TILE);
  contentContext.drawImage(image, left, top, side, side, 0, 0, TILE, TILE);
  const flat = contentContext.getImageData(0, 0, TILE, TILE).data;
  const lensed = contentContext.createImageData(TILE, TILE);
  const face = document.createElement('canvas');
  const glass = document.createElement('canvas');
  face.width = TILE;
  face.height = TILE;
  glass.width = TILE;
  glass.height = TILE;
  const faceContext = face.getContext('2d');
  const glassContext = glass.getContext('2d');
  const faceData = faceContext.createImageData(TILE, TILE);
  const glassData = glassContext.createImageData(TILE, TILE);
  const half = TILE / 2;
  const last = TILE - 1;
  const pixel = 1 / half;

  for (let y = 0; y < TILE; y += 1) {
    for (let x = 0; x < TILE; x += 1) {
      const u = (x + 0.5 - half) / half;
      const v = (y + 0.5 - half) / half;
      const out = (y * TILE + x) * 4;

      // Content and face: (u, v) across the inner shape.
      const r = reach(u, v, LOOK.inner);
      const bend = 1 - LENS + LENS * r * r;
      const sx = Math.min(last, Math.max(0, half + u * bend * half - 0.5));
      const sy = Math.min(last, Math.max(0, half + v * bend * half - 0.5));
      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      const x1 = Math.min(last, x0 + 1);
      const y1 = Math.min(last, y0 + 1);
      const fx = sx - x0;
      const fy = sy - y0;
      for (let channel = 0; channel < 3; channel += 1) {
        const top0 = flat[(y0 * TILE + x0) * 4 + channel];
        const top1 = flat[(y0 * TILE + x1) * 4 + channel];
        const bottom0 = flat[(y1 * TILE + x0) * 4 + channel];
        const bottom1 = flat[(y1 * TILE + x1) * 4 + channel];
        lensed.data[out + channel] =
          (top0 * (1 - fx) + top1 * fx) * (1 - fy) + (bottom0 * (1 - fx) + bottom1 * fx) * fy;
      }
      lensed.data[out + 3] = 255;

      if (r <= 1) {
        // The face keeps `keep` of the photo and adds `added`, written as one
        // colour at one opacity.
        const milk = 0.03 + 0.3 * r ** 10;
        const slant = (u + v) / 2;
        const shade = 1 - Math.max(0, slant) * 0.18;
        const lift = Math.max(0, -slant) * 0.1;
        const play = 0.22 * r ** 5;
        const hue = Math.atan2(v, u);
        const keep = shade * (1 - lift) * (1 - milk) * (1 - play);
        const alpha = 1 - keep;
        for (let channel = 0; channel < 3; channel += 1) {
          const tint = 200 + 55 * Math.cos(hue + channel * 2.1);
          const added = (tint * play * shade * (1 - lift) + 255 * lift) * (1 - milk) + 255 * milk;
          faceData.data[out + channel] = alpha > 0 ? added / alpha : 0;
        }
        faceData.data[out + 3] = alpha * 255;
      }

      // Glass: (u, v) across the whole shell.
      const shellReach = reach(u, v, LOOK.outer);
      if (shellReach > 1) {
        continue;
      }
      const inside = reach(u, v, LOOK.inner) / LOOK.size;
      // 1 over the inner shape, 0 in the clear shell around it.
      const over = Math.min(1, Math.max(0, (1 - inside) / (pixel / LOOK.size) + 0.5));
      const fresnel = Math.max(0, (shellReach - LOOK.size) / (1 - LOOK.size)) ** 2;
      const glint = Math.max(0, 1 - Math.hypot(u + 0.4, v + 0.48) / 0.42) ** 2 * 0.45;
      const white = Math.min(1, 0.35 + 0.65 * fresnel + glint);
      const alpha = Math.min(1, over * (0.02 + glint) + (1 - over) * (0.16 + 0.66 * fresnel + glint));
      for (let channel = 0; channel < 3; channel += 1) {
        glassData.data[out + channel] = GLASS[channel] * (1 - white) + 255 * white;
      }
      glassData.data[out + 3] = alpha * Math.min(1, (1 - shellReach) / pixel) * 255;
    }
  }
  contentContext.putImageData(lensed, 0, 0);
  faceContext.putImageData(faceData, 0, 0);
  glassContext.putImageData(glassData, 0, 0);
  return { content, face, glass };
}

export function attachAiVortex(
  canvas,
  {
    frames = [],
    clear = null,
    avoid = [],
    getFocus = () => null,
    onHover = () => {},
    onPick = () => {},
    onSelect = () => {},
  } = {},
) {
  if (!canvas) {
    return () => {};
  }

  const context = canvas.getContext('2d');
  const trail = document.createElement('canvas');
  const trailContext = trail.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let tiles = [];
  let drawn = [];
  let width = 0;
  let height = 0;
  let ratio = 1;
  let frame = 0;
  let visible = true;
  let last = performance.now();
  let clock = 0;
  let breath = 0;
  let pace = 1;
  let hovered = null;
  let pointerType = 'mouse';
  // Where the mouse is over the canvas, or null when it is elsewhere.
  let mouseAt = null;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  const items = Array.from({ length: ITEM_COUNT }, (_, index) => ({
    arm: index % ARMS,
    // Spread along the arm so the screen is full from the first frame.
    phase: (index * 0.618) % 1,
    tile: index,
    comet: COMET_COLORS[index % COMET_COLORS.length],
    // A little scatter, so the arms read as a swirl and not as four lines.
    jitter: ((index * 37) % 11) / 11 - 0.5,
    speed: 0.85 + ((index * 13) % 7) / 20,
    // Where each photo is in its slow breath, so they do not pulse together.
    spin: ((index * 17) % 10) * 0.63,
  }));

  function resize() {
    const rect = canvas.getBoundingClientRect();
    ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    trail.width = Math.max(1, Math.round(width / TRAIL_SCALE));
    trail.height = Math.max(1, Math.round(height / TRAIL_SCALE));
  }

  // Measured every frame: the text in the middle changes height as it changes.
  function measureZones() {
    const origin = canvas.getBoundingClientRect();
    return avoid.filter(Boolean).map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left - origin.left,
        top: rect.top - origin.top,
        right: rect.right - origin.left,
        bottom: rect.bottom - origin.top,
      };
    });
  }

  // 1 away from the text, 0 on it, with a soft edge `size` wide around it.
  function openness(zones, x, y, size) {
    let open = 1;
    for (const zone of zones) {
      const dx = Math.max(zone.left - x, 0, x - zone.right);
      const dy = Math.max(zone.top - y, 0, y - zone.bottom);
      open = Math.min(open, Math.min(1, Math.hypot(dx, dy) / (size * 2.2)));
    }
    return open;
  }

  function clearRadius() {
    if (!clear) {
      return Math.min(width, height) * 0.16;
    }
    const rect = clear.getBoundingClientRect();
    return Math.min(rect.width, rect.height) * 0.36;
  }

  // Where an item is at `phase` (0 at the shape, 1 past the screen's corner).
  function place(item, phase, inner, outer, cx, cy) {
    const along = easeOut(phase);
    const radius = inner + (outer - inner) * (phase ** 1.25) + item.jitter * 26 * phase;
    const angle =
      (item.arm / ARMS) * Math.PI * 2 + along * TWIST + clock * 0.06 + item.jitter * 0.35;
    return {
      x: cx + Math.cos(angle) * radius,
      // Slightly flattened, as if the swirl is seen a little from above.
      y: cy + Math.sin(angle) * radius * 0.86,
      angle,
    };
  }

  function draw() {
    const cx = width / 2 + pointer.x * 18;
    const cy = height / 2 + pointer.y * 12;
    const inner = clearRadius();
    const outer = Math.hypot(width, height) * 0.62;
    const base = Math.min(width, height);
    const zones = measureZones();
    const focus = hovered ?? getFocus();
    // Pointing at a frame dims the rest far more than the page's slow cycle does.
    const dim = hovered === null ? 0.8 : 0.2;

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    trailContext.setTransform(1, 0, 0, 1, 0, 0);
    trailContext.clearRect(0, 0, trail.width, trail.height);
    trailContext.setTransform(1 / TRAIL_SCALE, 0, 0, 1 / TRAIL_SCALE, 0, 0);
    trailContext.lineCap = 'round';
    drawn = [];

    // Far ones first, so the ones that have come closer lie on top.
    const ordered = items
      .map((item) => ({ item, phase: (item.phase + (clock * item.speed) / TRIP) % 1 }))
      .sort((a, b) => a.phase - b.phase);

    for (const { item, phase } of ordered) {
      const point = place(item, phase, inner, outer, cx, cy);
      const tile = tiles.length ? tiles[item.tile % tiles.length] : null;
      const lit = !tile || focus === null || tile.project === focus;
      const size = base * (0.024 + phase * 0.088) * (lit && focus !== null ? 1.06 : 1);
      const fadeIn = Math.min(1, phase / 0.08);

      // Past ~70% of the trip an item starts to leave a comet behind it.
      if (phase > 0.68) {
        const tail = place(item, Math.max(0, phase - 0.16), inner, outer, cx, cy);
        const heat = Math.min(1, (phase - 0.68) / 0.22);
        const gradient = trailContext.createLinearGradient(tail.x, tail.y, point.x, point.y);
        gradient.addColorStop(0, `${item.comet}00`);
        gradient.addColorStop(0.45, `${item.comet}ee`);
        gradient.addColorStop(0.85, item.comet);
        gradient.addColorStop(1, '#fff3c4');
        trailContext.globalAlpha = Math.min(1, heat * 1.4) * (lit ? 1 : dim);
        trailContext.strokeStyle = gradient;
        trailContext.lineWidth = size * (1.2 + heat);
        trailContext.beginPath();
        trailContext.moveTo(tail.x, tail.y);
        trailContext.lineTo(point.x, point.y);
        trailContext.stroke();
      }

      // Once it is a comet, the frame itself dissolves into it.
      const solid = phase > 0.8 ? Math.max(0, 1 - (phase - 0.8) / 0.14) : 1;
      const alpha = fadeIn * solid * openness(zones, point.x, point.y, size) * (lit ? 1 : dim);
      if (alpha <= 0.01) {
        continue;
      }

      // A bead: the shell stays level; inside it the photo's shape turns a
      // little and breathes, and the photo drifts and zooms under the lens.
      const radius = size * 0.85;
      const beat = breath + item.spin;
      const core = radius * LOOK.size * (1 + 0.03 * Math.sin(beat * 0.8));
      const zoom = TILE * (0.93 + 0.05 * Math.sin(beat * 0.6));
      const driftX = Math.cos(beat * 0.5) * TILE * 0.01;
      const driftY = Math.sin(beat * 0.5) * TILE * 0.01;
      context.save();
      context.globalAlpha = alpha;
      context.translate(point.x, point.y);
      context.save();
      outline(context, radius, LOOK.outer);
      context.shadowColor = 'rgba(13, 17, 23, 0.12)';
      context.shadowBlur = size * 0.35;
      context.shadowOffsetY = size * 0.12;
      context.fillStyle = 'rgba(246, 249, 255, 0.3)';
      context.fill();
      context.restore();
      if (tile) {
        context.save();
        context.rotate(Math.sin(beat * 0.45) * LOOK.turn);
        outline(context, core, LOOK.inner);
        context.clip();
        context.drawImage(
          tile.content,
          (TILE - zoom) / 2 + driftX,
          (TILE - zoom) / 2 + driftY,
          zoom,
          zoom,
          -core,
          -core,
          core * 2,
          core * 2,
        );
        context.drawImage(tile.face, -core, -core, core * 2, core * 2);
        context.restore();
        context.drawImage(tile.glass, -radius, -radius, radius * 2, radius * 2);
      }
      context.restore();

      if (tile && alpha > 0.35) {
        drawn.push({ x: point.x, y: point.y, radius, project: tile.project });
      }
    }

    trailContext.globalAlpha = 1;
    context.save();
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.globalCompositeOperation = 'destination-over';
    context.imageSmoothingQuality = 'high';
    context.drawImage(trail, 0, 0, width, height);
    context.restore();
  }

  function covers(frameAt, x, y, scale) {
    const u = (x - frameAt.x) / frameAt.radius;
    const v = (y - frameAt.y) / frameAt.radius;
    return reach(u, v, LOOK.outer) <= scale;
  }

  // The project of the frame under a point, the frame on top winning. The lit
  // project keeps the point while it is still close to one of its frames, so
  // the light does not flicker off a frame that is easing to a stop.
  function hit(x, y) {
    if (
      hovered !== null &&
      drawn.some((frameAt) => frameAt.project === hovered && covers(frameAt, x, y, HOLD_SCALE))
    ) {
      return hovered;
    }
    for (let index = drawn.length - 1; index >= 0; index -= 1) {
      if (covers(drawn[index], x, y, 1)) {
        return drawn[index].project;
      }
    }
    return null;
  }

  function setHovered(project) {
    if (project === hovered) {
      return;
    }
    hovered = project;
    canvas.style.cursor = project === null ? '' : 'pointer';
    onHover(project);
    if (reduceMotion) {
      draw();
    }
  }

  function tick(now) {
    const delta = Math.min(0.05, (now - last) / 1000);
    last = now;
    // Stops quickly under the pointer, picks up again slowly once it leaves.
    pace += hovered === null ? (1 - pace) * 0.04 : (HOVER_PACE - pace) * 0.25;
    // The photos breathe on even while the swirl rests under the pointer.
    breath += delta;
    // Every SURGE_EVERY seconds the swirl rushes forward a few steps, then settles.
    const sinceSurge = breath % SURGE_EVERY;
    const surge =
      sinceSurge < SURGE_LENGTH ? Math.sin((Math.PI * sinceSurge) / SURGE_LENGTH) ** 2 * SURGE_BOOST : 0;
    clock += delta * pace * (1 + surge);
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    draw();
    // Frames move under a still mouse too, so what it points at is checked each frame.
    if (mouseAt) {
      setHovered(hit(mouseAt.x, mouseAt.y));
    }
    frame = visible && !document.hidden ? requestAnimationFrame(tick) : 0;
  }

  function start() {
    if (reduceMotion || frame || !visible || document.hidden) {
      return;
    }
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function local(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function onWindowPointerMove(event) {
    pointer.tx = event.clientX / window.innerWidth - 0.5;
    pointer.ty = event.clientY / window.innerHeight - 0.5;
  }

  function onCanvasPointerMove(event) {
    pointerType = event.pointerType;
    if (pointerType !== 'mouse') {
      return;
    }
    mouseAt = local(event);
    setHovered(hit(mouseAt.x, mouseAt.y));
  }

  function onCanvasPointerDown(event) {
    pointerType = event.pointerType;
  }

  function onCanvasLeave() {
    mouseAt = null;
    setHovered(null);
  }

  function onCanvasClick(event) {
    const { x, y } = local(event);
    // A mouse opens what it has lit up; a finger, what it lands on.
    const project = pointerType === 'mouse' && hovered !== null ? hovered : hit(x, y);
    if (project === null) {
      return;
    }
    if (pointerType === 'mouse') {
      onSelect(project);
    } else {
      onPick(project);
    }
  }

  function onVisibility() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      start();
    }
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) {
      start();
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });

  const resizeObserver = new ResizeObserver(() => {
    resize();
    draw();
  });

  resize();
  // Seen mid-flight even before the first animation frame or with motion off.
  clock = 4;
  draw();
  observer.observe(canvas);
  resizeObserver.observe(canvas);
  window.addEventListener('pointermove', onWindowPointerMove, { passive: true });
  canvas.addEventListener('pointermove', onCanvasPointerMove);
  canvas.addEventListener('pointerdown', onCanvasPointerDown);
  canvas.addEventListener('pointerleave', onCanvasLeave);
  canvas.addEventListener('click', onCanvasClick);
  document.addEventListener('visibilitychange', onVisibility);

  let cancelled = false;
  // Several details share a screenshot, so each one is loaded once.
  const sources = [...new Set(frames.map((entry) => entry.src))];
  Promise.all(sources.map(loadImage)).then((loaded) => {
    if (cancelled) {
      return;
    }
    const images = new Map(sources.map((src, index) => [src, loaded[index]]));
    tiles = frames
      .filter((entry) => images.get(entry.src))
      .map((entry) => ({
        ...toLensTiles(images.get(entry.src), entry.crop),
        project: entry.project,
      }));
    draw();
    start();
  });

  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    resizeObserver.disconnect();
    window.removeEventListener('pointermove', onWindowPointerMove);
    canvas.removeEventListener('pointermove', onCanvasPointerMove);
    canvas.removeEventListener('pointerdown', onCanvasPointerDown);
    canvas.removeEventListener('pointerleave', onCanvasLeave);
    canvas.removeEventListener('click', onCanvasClick);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
