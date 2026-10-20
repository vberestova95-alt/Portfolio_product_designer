/*
 * The case cube: the cases as one solid block that rolls over on scroll.
 *
 * The block is the front of a cube held on screen (the stage is sticky) while
 * its section scrolls past. Its faces are the "Cases" title and then each case
 * cover, in order. Scrolling down rolls the cube up and away, a face at a
 * time: the face on show tips back over the top edge as the next one comes up
 * from below — the same turn as the hero's grey squares, only one big square.
 *
 * Only two faces are ever on the cube at once, so it takes any number of
 * cases: the one on show and the next. Each turn takes the middle of its stretch
 * of scroll; either side of it the face rests flat, to be read and clicked.
 * Mid-turn the cube eases back so its leading edge never comes nearer than the
 * face at rest, and each face is shaded by how far it has turned from the viewer.
 *
 * The cube does not stick to the scroll position: it follows it with a little
 * lag, so a flick of the wheel or a trackpad's stops turn it in one glide and
 * each face settles into place rather than stopping dead.
 *
 * A link tabbed to on a face out of view scrolls the page to that face.
 */

const SHADE = 0.6; // darkness of a face turned edge-on
const TURN_FROM = 0.22; // share of a face's stretch of scroll held before it turns
const TURN_TO = 0.78; // … and from where the next face rests
const EASE_BACK = 1.2; // extra retreat mid-turn, in half-heights of the cube
const FOLLOW_MS = 140; // time constant of the lag behind the scroll position

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

// Eased in and out to a standstill: no speed left at either end of a turn.
function smootherstep(a, b, x) {
  const t = clamp01((x - a) / (b - a));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export function attachCaseCube(section) {
  const cube = section?.querySelector('[data-cube-body]');

  if (!cube) {
    return undefined;
  }

  const faces = Array.from(cube.querySelectorAll('[data-cube-face]'));
  const steps = faces.length - 1;
  let frame = null;
  let shown = null; // the progress on screen, catching up with the scroll's
  let lastTime = 0;

  // Where the page has to be for face `index` to rest flat in front: the
  // middle of its rest, which falls on a whole step.
  const scrollFor = (index) => {
    const travel = Math.max(1, section.offsetHeight - window.innerHeight);
    const top = window.scrollY + section.getBoundingClientRect().top;

    return top + (travel * index) / Math.max(1, steps);
  };

  const update = (time = performance.now()) => {
    frame = null;

    const rect = section.getBoundingClientRect();
    const travel = Math.max(1, section.offsetHeight - window.innerHeight);
    const target = clamp01(-rect.top / travel) * steps;

    // Frame-rate independent: the same lag at 60 and at 120 Hz. A jump of
    // more than a face (a reload mid-page, an anchor link) is not played out.
    const dt = Math.min(64, time - lastTime);
    lastTime = time;

    if (shown === null || Math.abs(target - shown) > 1.5) {
      shown = target;
    } else {
      shown += (target - shown) * (1 - Math.exp(-dt / FOLLOW_MS));
    }

    if (Math.abs(target - shown) < 0.0005) {
      shown = target;
    } else {
      frame = requestAnimationFrame(update);
    }

    const progress = shown;
    const index = Math.min(steps - 1, Math.floor(progress));
    const t = steps > 0 ? smootherstep(TURN_FROM, TURN_TO, progress - index) : 0;

    const depth = cube.offsetHeight / 2;
    const angle = (t * Math.PI) / 2;
    // Pulled back so the cube's leading edge stays where the face was — and
    // further mid-turn, so the two faces together still fit the screen.
    const back =
      depth * (Math.cos(angle) + Math.sin(angle) - 1) + depth * EASE_BACK * Math.sin(angle * 2);
    const turn = t * 90;

    faces.forEach((face, i) => {
      let rotation = null;
      let shade = 0;

      if (i === index) {
        rotation = turn;
        shade = Math.sin(angle);
      } else if (i === index + 1) {
        rotation = turn - 90;
        shade = Math.cos(angle);
      }

      if (rotation === null) {
        face.classList.remove('is-on', 'is-front');
        return;
      }

      face.classList.add('is-on');
      face.classList.toggle('is-front', shade < 0.5);
      face.style.transform =
        `translateZ(${(-depth - back).toFixed(2)}px) ` +
        `rotateX(${rotation.toFixed(3)}deg) translateZ(${depth.toFixed(2)}px)`;
      face.style.setProperty('--face-shade', (shade * SHADE).toFixed(3));
    });
  };

  const schedule = () => {
    if (frame === null) {
      lastTime = performance.now();
      frame = requestAnimationFrame(update);
    }
  };

  const handleFocus = (event) => {
    const face = event.target.closest('[data-cube-face]');
    const index = faces.indexOf(face);

    if (index >= 0 && !face.classList.contains('is-front')) {
      window.scrollTo({ top: scrollFor(index), behavior: 'auto' });
    }
  };

  const observer = new ResizeObserver(schedule);
  observer.observe(cube);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  cube.addEventListener('focusin', handleFocus);
  update();

  return () => {
    observer.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    cube.removeEventListener('focusin', handleFocus);

    if (frame !== null) {
      cancelAnimationFrame(frame);
    }
  };
}
