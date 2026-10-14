/*
 * Logo cube pool for the blue practice card.
 *
 * The cubes are plain DOM tiles; Matter.js only does the physics and the tiles
 * are moved to match it each frame. The engine is loaded on demand from
 * public/vendor (there is no bundler dependency for it), the first time the card
 * comes near the screen, so the home page pays nothing for it up front.
 *
 * Behaviour:
 * - the cubes drop in from above the card once it scrolls into view and pile up
 *   on its floor, like balls in a ball pit;
 * - the pile is sized to fill about FILL_SHARE of the card's height, and never
 *   reaches up into the copy ([data-pool-ceiling], else the card's paragraph) — the cube size is derived from that, so any
 *   number of logos fits;
 * - moving the pointer through the pile shoves the cubes away from it; a click
 *   or a tap kicks the nearby ones up;
 * - a cube kicked hard enough leaves through the open top of the card and is
 *   gone. Once the last one is out the card hears `logopool:cleared`; sending
 *   it `logopool:restore` drops the full set in again;
 * - the pile rests on the card's footer ([data-pool-floor]) when it has one,
 *   so the link label under it is never buried;
 * - the simulation pauses while the card is off screen;
 * - with reduced motion the pile is settled off screen and drawn once, still.
 *
 * The hero reuses it for a handful of cubes on its divider: it passes
 * `cubeSize` to fix the size, since it has no pile area to fill.
 *
 * A tile marked [data-upright] (the hero's portrait) never turns: it is pushed,
 * kicked and lost like the rest, but always lands face up and level.
 */

const MATTER_SRC = `${import.meta.env.BASE_URL}vendor/matter.min.js`;
const FILL_SHARE = 0.4; // share of the card's height the pile should fill
const PACKING = 0.68; // how much of the pile's area the cubes actually cover
const COPY_CLEARANCE = 20; // px kept between the top of the pile and the copy
const DROP_INTERVAL = 70; // ms between cubes on the first drop
const STEP = 1000 / 60;
const FLOOR_CHECK_EVERY = 20; // frames between checks that the floor has not moved

let matterPromise = null;

function loadMatter() {
  if (window.Matter) {
    return Promise.resolve(window.Matter);
  }

  if (!matterPromise) {
    matterPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = MATTER_SRC;
      script.async = true;
      script.onload = () => resolve(window.Matter);
      script.onerror = () => {
        matterPromise = null;
        reject(new Error('Matter.js failed to load'));
      };
      document.head.appendChild(script);
    });
  }

  return matterPromise;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function attachLogoPool(pool, { cubeSize } = {}) {
  if (!pool) {
    return undefined;
  }

  const card = pool.parentElement;
  const tiles = Array.from(pool.querySelectorAll('[data-cube]'));

  if (!card || !tiles.length) {
    return undefined;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let Matter = null;
  let engine = null;
  let bodies = [];
  let walls = [];
  let size = 0;
  let width = 0;
  let height = 0;
  let floor = 0;
  let framesSinceFloorCheck = 0;
  let frame = null;
  let lastTime = 0;
  let isVisible = false;
  let hasDropped = false;
  let dropTimers = [];
  let disposed = false;
  let pointer = null;
  // Tile indices. A cube can only escape once it has been inside the card, so
  // the first drop from above the top edge does not count as leaving.
  let landed = new Set();
  let escaped = new Set();

  /*
   * The room between the copy and the floor. The last text block's bottom edge
   * is the ceiling, so the pile can never cover the paragraph however the card
   * is sized; the footer's top edge, if there is one, is the floor.
   */
  function readFloor(cardRect = card.getBoundingClientRect()) {
    const footer = card.querySelector('[data-pool-floor]');
    return footer ? footer.getBoundingClientRect().top - cardRect.top : cardRect.height;
  }

  /*
   * The floor element can move without the card changing size — a web font
   * landing or a reveal transition shifts the hero's divider after the first
   * measure. The walls follow it rather than rebuilding the world.
   */
  function syncFloor() {
    const next = readFloor();

    if (Math.abs(next - floor) < 2) {
      return;
    }

    const { Body } = Matter;
    const shift = next - floor;

    floor = next;
    walls.forEach((wall) => {
      Body.setPosition(wall, { x: wall.position.x, y: wall.position.y + shift });
    });
  }

  function measure() {
    const cardRect = card.getBoundingClientRect();
    const copy =
      card.querySelector('[data-pool-ceiling]') ?? card.querySelector('.editorial-card__copy');
    const copyBottom = copy ? copy.getBoundingClientRect().bottom - cardRect.top : 0;

    width = cardRect.width;
    height = cardRect.height;
    floor = readFloor(cardRect);

    const pileHeight = Math.max(
      0,
      Math.min(height * FILL_SHARE, floor - copyBottom - COPY_CLEARANCE),
    );
    const area = width * pileHeight * PACKING;

    size = cubeSize ? cubeSize(width) : clamp(Math.sqrt(area / tiles.length), 34, 128);
    pool.style.setProperty('--cube-size', `${size}px`);
  }

  function buildWorld() {
    const { Engine, Bodies, Composite } = Matter;

    engine = Engine.create({ enableSleeping: false });
    engine.gravity.y = 1.1;

    const thick = 200;
    const tall = height * 4;
    walls = [
      Bodies.rectangle(width / 2, floor + thick / 2, width * 3, thick, { isStatic: true }),
      Bodies.rectangle(-thick / 2, floor - tall / 2, thick, tall, { isStatic: true }),
      Bodies.rectangle(width + thick / 2, floor - tall / 2, thick, tall, { isStatic: true }),
    ];
    Composite.add(engine.world, walls);

    bodies = tiles.map((tile) => {
      const body = Bodies.rectangle(0, 0, size, size, {
        chamfer: { radius: size * 0.2 },
        restitution: 0.42,
        friction: 0.06,
        frictionAir: 0.014,
        density: 0.0016,
      });

      body.freeInertia = body.inertia;
      return body;
    });

    syncUpright();
  }

  function placeAbove(body, index) {
    const { Body } = Matter;
    /*
     * Spread across the floor, one column per cube while they fit in a row,
     * with a little jitter — random x alone stacks them into towers, and an
     * upright cube cannot topple off one.
     */
    const perRow = Math.max(1, Math.min(tiles.length, Math.floor(width / (size * 1.05))));
    const column = width / perRow;
    const x = clamp(
      (index % perRow + 0.5) * column + (Math.random() - 0.5) * (column - size) * 0.8,
      size / 2,
      width - size / 2,
    );
    // Staggered heights so they do not land as one slab.
    const y = -size * (1 + (index % 3) * 0.8) - Math.random() * size;

    Body.setPosition(body, { x, y });
    Body.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: 0 });

    if (body.isUpright) {
      Body.setAngle(body, 0);
      Body.setAngularVelocity(body, 0);
      return;
    }

    Body.setAngle(body, (Math.random() - 0.5) * Math.PI);
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.12);
  }

  /*
   * A tile's upright mark can change between rounds (the hero deals new photos
   * each time), so it is read again before every drop.
   */
  function syncUpright() {
    bodies.forEach((body, index) => {
      body.isUpright = tiles[index].hasAttribute('data-upright');
      Matter.Body.setInertia(body, body.isUpright ? Infinity : body.freeInertia);
      // They cannot tip off a neighbour, so they bounce less and slide more.
      body.restitution = body.isUpright ? 0.18 : 0.42;
      body.friction = body.isUpright ? 0.01 : 0.06;
    });
  }

  /* Rows on the floor — used when there is no time to watch them fall. */
  function placeOnFloor(body, index) {
    const { Body } = Matter;
    const perRow = Math.max(1, Math.floor(width / (size * 1.05)));
    const row = Math.floor(index / perRow);
    const col = index % perRow;
    const offset = row % 2 ? size * 0.5 : 0;

    Body.setPosition(body, {
      x: clamp(size * 0.55 + col * size * 1.05 + offset, size / 2, width - size / 2),
      y: floor - size * 0.55 - row * size * 1.02,
    });
    Body.setAngle(body, body.isUpright ? 0 : (Math.random() - 0.5) * 0.3);
    Body.setAngularVelocity(body, 0);
    Body.setVelocity(body, { x: 0, y: 0 });
  }

  function render() {
    for (let index = 0; index < bodies.length; index += 1) {
      const body = bodies[index];
      const tile = tiles[index];
      const { x, y } = body.position;

      tile.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0) rotate(${body.angle}rad)`;
    }
  }

  function tick(time) {
    frame = null;

    if (disposed || !isVisible || document.hidden) {
      return;
    }

    const delta = lastTime ? Math.min(time - lastTime, 32) : STEP;
    lastTime = time;

    framesSinceFloorCheck += 1;

    if (framesSinceFloorCheck >= FLOOR_CHECK_EVERY) {
      framesSinceFloorCheck = 0;
      syncFloor();
      slidePerched();
    }

    Matter.Engine.update(engine, delta);
    checkEscapes();
    render();
    frame = requestAnimationFrame(tick);
  }

  /*
   * An upright cube cannot tip, so one that lands square on another stays
   * perched there. Once it has come to rest off the floor, it is eased off
   * its neighbour towards the side with more room. Only while the cubes still
   * fit in one row — a full pile is meant to stack.
   */
  function slidePerched() {
    if (bodies.length * size * 1.05 > width) {
      return;
    }

    const { Body } = Matter;

    bodies.forEach((body, index) => {
      if (!body.isUpright || escaped.has(index) || !landed.has(index)) {
        return;
      }

      const resting = Math.hypot(body.velocity.x, body.velocity.y) < 0.3;
      const offFloor = body.position.y < floor - size * 0.9;

      if (!resting || !offFloor) {
        return;
      }

      const below = bodies.find(
        (other, otherIndex) =>
          other !== body &&
          !escaped.has(otherIndex) &&
          Math.abs(other.position.x - body.position.x) < size &&
          other.position.y > body.position.y,
      );
      const away = below ? Math.sign(body.position.x - below.position.x) : 0;
      const roomier = body.position.x < width / 2 ? 1 : -1;

      Body.setVelocity(body, { x: (away || roomier) * 4, y: -1.5 });
    });
  }

  /* Fully above the card's top edge is out of sight, so out of play. */
  function checkEscapes() {
    bodies.forEach((body, index) => {
      if (escaped.has(index)) {
        return;
      }

      const { y } = body.position;

      if (!landed.has(index)) {
        if (y > size) {
          landed.add(index);
        }

        return;
      }

      if (y < -size) {
        escaped.add(index);
        Matter.Composite.remove(engine.world, body);
        tiles[index].classList.add('is-gone');

        if (escaped.size === bodies.length) {
          card.dispatchEvent(new CustomEvent('logopool:cleared'));
        }
      }
    });
  }

  function start() {
    if (frame === null && !reduceMotion) {
      lastTime = 0;
      frame = requestAnimationFrame(tick);
    }
  }

  function stop() {
    if (frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
  }

  function settleStill() {
    bodies.forEach((body, index) => placeOnFloor(body, index));
    Matter.Composite.add(engine.world, bodies);

    for (let step = 0; step < 240; step += 1) {
      Matter.Engine.update(engine, STEP);
    }

    render();
  }

  function drop() {
    syncFloor();
    syncUpright();
    hasDropped = true;
    landed = new Set();
    escaped = new Set();
    tiles.forEach((tile) => tile.classList.remove('is-gone'));
    pool.classList.add('is-active');

    if (reduceMotion) {
      settleStill();
      return;
    }

    bodies.forEach((body, index) => {
      placeAbove(body, index);
      const timer = window.setTimeout(() => {
        Matter.Composite.add(engine.world, body);
      }, index * DROP_INTERVAL);
      dropTimers.push(timer);
    });

    render();
    start();
  }

  /*
   * A resize changes the cube size, and Matter bodies cannot be rescaled
   * cleanly with chamfers, so the world is rebuilt. Once the first drop has
   * happened the cubes come back already resting on the floor.
   */
  function rebuild() {
    dropTimers.forEach((timer) => window.clearTimeout(timer));
    dropTimers = [];
    stop();

    if (engine) {
      Matter.Composite.clear(engine.world, false);
      Matter.Engine.clear(engine);
    }

    measure();
    buildWorld();

    if (!hasDropped) {
      return;
    }

    if (reduceMotion) {
      settleStill();
      return;
    }

    // Cubes that already left stay gone; the rest come back on the floor.
    const remaining = bodies.filter((body, index) => !escaped.has(index));

    bodies.forEach((body, index) => placeOnFloor(body, index));
    landed = new Set(tiles.map((tile, index) => index));
    Matter.Composite.add(engine.world, remaining);
    render();
    start();
  }

  function handleRestore() {
    if (!engine || !hasDropped) {
      return;
    }

    dropTimers.forEach((timer) => window.clearTimeout(timer));
    dropTimers = [];
    bodies.forEach((body) => Matter.Composite.remove(engine.world, body));
    drop();
  }

  /*
   * Pointer play. Cubes within reach are pushed away from the pointer and
   * along its direction of travel, harder the faster it moves.
   */
  function localPoint(event) {
    const rect = card.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top, t: performance.now() };
  }

  function shove(origin, reach, power, carry) {
    const { Body } = Matter;

    bodies.forEach((body) => {
      const dx = body.position.x - origin.x;
      const dy = body.position.y - origin.y;
      const distance = Math.hypot(dx, dy) || 1;

      if (distance > reach) {
        return;
      }

      const falloff = 1 - distance / reach;
      const push = power * falloff;
      const velocity = body.velocity;
      const next = {
        x: velocity.x + (dx / distance) * push + carry.x * falloff,
        y: velocity.y + (dy / distance) * push + carry.y * falloff - push * 0.35,
      };
      const speed = Math.hypot(next.x, next.y);
      const limit = 26;

      Body.setVelocity(
        body,
        speed > limit ? { x: (next.x / speed) * limit, y: (next.y / speed) * limit } : next,
      );
      if (!body.isUpright) {
        Body.setAngularVelocity(body, body.angularVelocity + (Math.random() - 0.5) * 0.25 * falloff);
      }
    });
  }

  function handlePointerMove(event) {
    if (!engine || !hasDropped || reduceMotion || event.pointerType === 'touch') {
      return;
    }

    const point = localPoint(event);

    if (pointer) {
      const dt = Math.max(point.t - pointer.t, 8);
      const vx = ((point.x - pointer.x) / dt) * 16;
      const vy = ((point.y - pointer.y) / dt) * 16;
      const speed = Math.hypot(vx, vy);

      if (speed > 0.4) {
        shove(point, size * 1.35, clamp(speed * 0.35, 1.5, 9), {
          x: clamp(vx * 0.45, -14, 14),
          y: clamp(vy * 0.45, -14, 14),
        });
      }
    }

    pointer = point;
  }

  function handlePointerLeave() {
    pointer = null;
  }

  /* A tap or click kicks the cubes around it upward — the touch version of play. */
  function handlePointerDown(event) {
    if (!engine || !hasDropped || reduceMotion) {
      return;
    }

    shove(localPoint(event), size * 2.6, 14, { x: 0, y: -6 });
  }

  const visibility = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting;

      if (!engine) {
        return;
      }

      if (isVisible && !hasDropped && entry.intersectionRatio >= 0.3) {
        drop();
      } else if (isVisible && hasDropped) {
        start();
      } else if (!isVisible) {
        stop();
      }
    },
    { threshold: [0, 0.3] },
  );

  // Load a screen ahead, so the engine is ready by the time the card arrives.
  const preload = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) {
        return;
      }

      preload.disconnect();
      loadMatter()
        .then((matter) => {
          if (disposed) {
            return;
          }

          Matter = matter;
          measure();
          buildWorld();
          visibility.observe(card);
        })
        .catch(() => {
          // Without the engine the card simply has no cubes.
        });
    },
    { rootMargin: '100% 0px' },
  );

  let resizeFrame = null;
  let lastWidth = 0;
  let lastHeight = 0;
  const resize = new ResizeObserver(([entry]) => {
    const { width: nextWidth, height: nextHeight } = entry.contentRect;

    // Small height shifts (font swap, reveal) are not worth a rebuild.
    if (Math.abs(nextWidth - lastWidth) < 2 && Math.abs(nextHeight - lastHeight) < 24) {
      return;
    }

    lastWidth = nextWidth;
    lastHeight = nextHeight;

    if (!Matter || resizeFrame !== null) {
      return;
    }

    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = null;
      rebuild();
    });
  });

  const handleVisibilityChange = () => {
    if (!document.hidden && isVisible && hasDropped) {
      start();
    }
  };

  preload.observe(card);
  resize.observe(card);
  card.addEventListener('pointermove', handlePointerMove);
  card.addEventListener('pointerleave', handlePointerLeave);
  card.addEventListener('pointerdown', handlePointerDown);
  card.addEventListener('logopool:restore', handleRestore);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    disposed = true;
    stop();
    dropTimers.forEach((timer) => window.clearTimeout(timer));
    preload.disconnect();
    visibility.disconnect();
    resize.disconnect();

    if (resizeFrame !== null) {
      cancelAnimationFrame(resizeFrame);
    }

    card.removeEventListener('pointermove', handlePointerMove);
    card.removeEventListener('pointerleave', handlePointerLeave);
    card.removeEventListener('pointerdown', handlePointerDown);
    card.removeEventListener('logopool:restore', handleRestore);
    document.removeEventListener('visibilitychange', handleVisibilityChange);

    if (engine) {
      Matter.Composite.clear(engine.world, false);
      Matter.Engine.clear(engine);
    }
  };
}
