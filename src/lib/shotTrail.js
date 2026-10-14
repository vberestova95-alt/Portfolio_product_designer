/*
 * Hover reveal for the concept shots.
 *
 * One shot at a time. The scatter positions are fixed in CSS and every shot
 * rests at opacity 0; whichever one the pointer is closest to is the one that
 * shows. Moving across the card hands the reveal from one shot to the next —
 * the card under the cursor appears, the previous one clears, and the plate is
 * never carrying more than a single image.
 *
 * The active shot also leans towards the pointer by a fraction of its own
 * distance, so it reads as answering the cursor rather than just switching on.
 *
 * JS writes --shot-dx / --shot-dy (the lean) and toggles `is-near`; everything
 * else stays declarative in CSS.
 */

// Per-shot lean strength and easing. Index matches DOM order, which matches the
// scatter positions in global.css.
const SHOTS = [
  { pull: 0.1, ease: 0.16 },
  { pull: 0.06, ease: 0.11 },
  { pull: 0.12, ease: 0.19 },
  { pull: 0.07, ease: 0.13 },
  { pull: 0.09, ease: 0.1 },
  { pull: 0.11, ease: 0.15 },
];

/*
 * The lean is capped tighter vertically than horizontally: the scatter sits
 * directly under the copy, and a shot that can travel 30px up would put its
 * corner into the last line of the paragraph.
 */
const MAX_LEAN_X = 30;
const MAX_LEAN_Y = 12;

export function attachShotTrail(container) {
  if (!container) {
    return undefined;
  }

  const shots = [...container.querySelectorAll('[data-shot]')];

  if (!shots.length) {
    return undefined;
  }

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = window.matchMedia?.('(pointer: coarse)').matches;
  // Up to 1240px the card shows a fixed pair of shots instead (see
  // .concept-teaser--pair), so there is no reveal to hand around.
  const isNarrow = window.matchMedia?.('(max-width: 1240px)').matches;

  if (isCoarsePointer || isNarrow) {
    container.classList.add('is-static');
    return () => container.classList.remove('is-static');
  }

  const state = shots.map((node, index) => {
    const config = SHOTS[index % SHOTS.length];
    return { node, ...config, x: 0, y: 0, targetX: 0, targetY: 0 };
  });

  let frame = null;
  let active = null;

  const clamp = (value, limit) => Math.min(limit, Math.max(-limit, value));

  // Centre of a shot in container coordinates, before its own lean is applied.
  const centreOf = (item, rect) => {
    const box = item.node.getBoundingClientRect();
    return {
      x: box.left + box.width / 2 - rect.left - item.x,
      y: box.top + box.height / 2 - rect.top - item.y,
    };
  };

  /*
   * Nearest centre wins, with no cut-off distance: the pointer is always inside
   * one shot's territory, so there is always exactly one card on screen and the
   * handover between them has no gap to fall into.
   */
  const setActive = (pointerX, pointerY) => {
    const rect = container.getBoundingClientRect();
    let next = null;
    let shortest = Infinity;

    state.forEach((item) => {
      const centre = centreOf(item, rect);
      const dx = pointerX - centre.x;
      const dy = pointerY - centre.y;
      const distance = Math.hypot(dx, dy);

      item.leanX = clamp(dx * item.pull, MAX_LEAN_X);
      item.leanY = clamp(dy * item.pull, MAX_LEAN_Y);

      if (distance < shortest) {
        shortest = distance;
        next = item;
      }
    });

    if (next !== active) {
      active?.node.classList.remove('is-near');
      next?.node.classList.add('is-near');
      active = next;
    }

    // Only the shot on screen follows the pointer; the rest settle back so they
    // are in place the next time the reveal reaches them.
    state.forEach((item) => {
      const isActive = item === active;
      item.targetX = isActive ? item.leanX : 0;
      item.targetY = isActive ? item.leanY : 0;
    });
  };

  const render = () => {
    let moving = false;

    state.forEach((item) => {
      const dx = item.targetX - item.x;
      const dy = item.targetY - item.y;

      if (Math.abs(dx) > 0.08 || Math.abs(dy) > 0.08) {
        moving = true;
        item.x += dx * item.ease;
        item.y += dy * item.ease;
      } else {
        item.x = item.targetX;
        item.y = item.targetY;
      }

      item.node.style.setProperty('--shot-dx', `${item.x.toFixed(2)}px`);
      item.node.style.setProperty('--shot-dy', `${item.y.toFixed(2)}px`);
    });

    frame = moving ? requestAnimationFrame(render) : null;
  };

  const requestRender = () => {
    if (frame === null) {
      frame = requestAnimationFrame(render);
    }
  };

  const track = (event) => {
    const rect = container.getBoundingClientRect();
    setActive(event.clientX - rect.left, event.clientY - rect.top);

    if (!prefersReducedMotion) {
      requestRender();
    }
  };

  const handlePointerLeave = () => {
    active?.node.classList.remove('is-near');
    active = null;

    state.forEach((item) => {
      item.targetX = 0;
      item.targetY = 0;
    });

    requestRender();
  };

  container.addEventListener('pointerenter', track);
  container.addEventListener('pointermove', track);
  container.addEventListener('pointerleave', handlePointerLeave);

  if (prefersReducedMotion) {
    // Keep the swap, drop the travel: CSS shortens the transition and the lean
    // is never rendered because requestRender is the only writer.
    container.classList.add('is-calm');
  }

  return () => {
    container.removeEventListener('pointerenter', track);
    container.removeEventListener('pointermove', track);
    container.removeEventListener('pointerleave', handlePointerLeave);
    container.classList.remove('is-calm');
    active?.node.classList.remove('is-near');

    if (frame !== null) {
      cancelAnimationFrame(frame);
    }
  };
}
