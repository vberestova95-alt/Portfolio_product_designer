/*
 * The AI landing's hero: frames of the AI projects leave the shape in the
 * middle along spiral arms, grow as they travel out and, near the edge of the
 * screen, smear into coloured comets. Each frame is a card with a piece of a
 * case's interface on it. One 2D canvas; the comets are drawn on a
 * small offscreen canvas and scaled up, which is what blurs them for free.
 *
 * The frames are the way into the cases. Pointing at one brings the swirl to rest,
 * dims the other projects' frames and reports the project (`onHover`); a click
 * opens it (`onSelect`). On touch a tap only picks the project (`onPick`), and
 * the page's button opens it. `getFocus` names the project the page is showing,
 * whose frames stay brighter than the rest.
 *
 * attachAiVortex(canvas, { frames, clear, avoid, getFocus, onHover, onPick,
 * onSelect }) → cleanup. `frames` are { src, project }. `clear` is the element
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

// The cards are pieces cut from the screenshots, at this aspect.
const CARD_ASPECT = 1.5;
// Each piece is this share of the screenshot's width (or of what fits).
const PIECE_SHARE = 0.32;
const PIECES_PER_IMAGE = 2;

/*
 * The liveliest pieces of a screenshot: a grid of candidate crops, each
 * scored on a tiny copy by its contrast and colour, with mostly blank paper
 * counting against it. That finds the buttons, charts and cards instead of a
 * white margin with a line of small type, which is what a whole screen
 * shrunk into a frame reads as.
 */
function pickPieces(image, count) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const cropWidth = Math.min(width, height * CARD_ASPECT) * PIECE_SHARE;
  const cropHeight = cropWidth / CARD_ASPECT;
  const probe = document.createElement('canvas');
  probe.width = 30;
  probe.height = 20;
  const context = probe.getContext('2d', { willReadFrequently: true });
  const candidates = [];

  for (let row = 0; row < 5; row += 1) {
    for (let column = 0; column < 6; column += 1) {
      const x = ((width - cropWidth) * column) / 5;
      const y = ((height - cropHeight) * row) / 4;
      context.drawImage(image, x, y, cropWidth, cropHeight, 0, 0, 30, 20);
      const { data } = context.getImageData(0, 0, 30, 20);
      let sum = 0;
      let sumSquares = 0;
      let saturation = 0;
      let blank = 0;
      for (let index = 0; index < data.length; index += 4) {
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const light = 0.299 * r + 0.587 * g + 0.114 * b;
        const max = Math.max(r, g, b);
        sum += light;
        sumSquares += light * light;
        saturation += max ? (max - Math.min(r, g, b)) / max : 0;
        if (light > 236 || light < 14) {
          blank += 1;
        }
      }
      const pixels = data.length / 4;
      const mean = sum / pixels;
      const spread = Math.sqrt(Math.max(0, sumSquares / pixels - mean * mean));
      const score = spread + (saturation / pixels) * 90 - (blank / pixels) * 120;
      candidates.push({ x, y, score });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const chosen = [];
  for (const candidate of candidates) {
    // Pieces of one screenshot should not repeat each other.
    const apart = chosen.every(
      (piece) =>
        Math.abs(piece.x - candidate.x) > cropWidth * 0.6 ||
        Math.abs(piece.y - candidate.y) > cropHeight * 0.6,
    );
    if (apart) {
      chosen.push(candidate);
    }
    if (chosen.length === count) {
      break;
    }
  }
  return chosen.map((piece) => ({ ...piece, width: cropWidth, height: cropHeight }));
}

// A piece, cut once into its own canvas so drawing a card is one call.
function toTile(image, piece, tileWidth = 300) {
  const tile = document.createElement('canvas');
  tile.width = tileWidth;
  tile.height = Math.round(tileWidth / CARD_ASPECT);
  tile
    .getContext('2d')
    .drawImage(image, piece.x, piece.y, piece.width, piece.height, 0, 0, tile.width, tile.height);
  return tile;
}

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
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
    // Cards keep roughly level, each with a slight lean of its own.
    tilt: (((index * 29) % 13) / 13 - 0.5) * 0.42,
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

      // A card: the piece of interface on a white tile, lifted by a soft shadow.
      const cardWidth = size * 1.85;
      const cardHeight = cardWidth / CARD_ASPECT;
      const tilt = item.tilt + Math.sin(point.angle) * 0.12;
      const radius = cardHeight * 0.16;
      context.save();
      context.globalAlpha = alpha;
      context.translate(point.x, point.y);
      context.rotate(tilt);
      roundedRect(context, -cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, radius);
      context.shadowColor = 'rgba(13, 17, 23, 0.16)';
      context.shadowBlur = size * 0.4;
      context.shadowOffsetY = size * 0.14;
      context.fillStyle = '#ffffff';
      context.fill();
      context.shadowColor = 'transparent';
      context.clip();
      if (tile) {
        context.drawImage(tile.canvas, -cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight);
      }
      context.lineWidth = Math.max(1, size * 0.03);
      context.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      context.stroke();
      context.restore();

      if (tile && alpha > 0.35) {
        drawn.push({
          x: point.x,
          y: point.y,
          tilt,
          halfWidth: cardWidth / 2,
          halfHeight: cardHeight / 2,
          project: tile.project,
        });
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
    const turn = -frameAt.tilt;
    const dx = x - frameAt.x;
    const dy = y - frameAt.y;
    const lx = dx * Math.cos(turn) - dy * Math.sin(turn);
    const ly = dx * Math.sin(turn) + dy * Math.cos(turn);
    return Math.abs(lx) <= frameAt.halfWidth * scale && Math.abs(ly) <= frameAt.halfHeight * scale;
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
    clock += delta * pace;
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
  Promise.all(frames.map((entry) => loadImage(entry.src))).then((loaded) => {
    if (cancelled) {
      return;
    }
    // Pieces of the same screenshot go to different places in the swirl.
    const pieces = loaded.map((image, index) =>
      image
        ? pickPieces(image, PIECES_PER_IMAGE).map((piece) => ({
            canvas: toTile(image, piece),
            project: frames[index].project,
          }))
        : [],
    );
    tiles = [];
    for (let round = 0; round < PIECES_PER_IMAGE; round += 1) {
      pieces.forEach((list) => list[round] && tiles.push(list[round]));
    }
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
