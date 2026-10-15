/*
 * Header that comes back on scroll up.
 *
 * The header stays in its place in the page. Once it has scrolled out of view
 * it is lifted out as a fixed bar, parked above the viewport: scrolling up
 * slides it in, scrolling down slides it away. Back at the top of the page it
 * drops into its own place again. A spacer of its height holds the gap while
 * it is lifted out, so the content below never moves.
 *
 * Classes: `is-pinned` (fixed, styled as a bar) and `is-shown` (slid in).
 *
 * A change of direction only counts once the page has travelled TRAVEL px
 * that way. A finger scroll is full of small reversals — a lifted fingertip,
 * momentum easing out, the browser bar sliding away — and reacting to each
 * one made the bar flick in and out while scrolling down.
 *
 * `hideOver` (an element — the home page passes its blue hero) keeps the bar
 * away while any of that element is still on screen: a light bar over the
 * blue panel only fights it, and the panel's own row is right there anyway.
 */

const TRAVEL = 60; // px of travel in one direction before the bar follows it

export function attachPinnedHeader(header, { hideOver } = {}) {
  if (!header || typeof window === 'undefined') {
    return undefined;
  }

  const spacer = document.createElement('div');
  spacer.setAttribute('aria-hidden', 'true');
  spacer.style.display = 'none';
  header.before(spacer);

  let naturalTop = 0;
  let naturalHeight = 0;
  let lastY = window.scrollY;
  // Travel in the current direction: positive is down, negative up.
  let travel = 0;
  let frame = null;

  const measure = () => {
    const anchor = header.classList.contains('is-pinned') ? spacer : header;
    naturalTop = anchor.getBoundingClientRect().top + window.scrollY;
    naturalHeight = header.classList.contains('is-pinned')
      ? spacer.offsetHeight
      : header.offsetHeight;
  };

  /*
   * The bar is parked above the viewport the moment it is lifted out. Without
   * the transition held back for that one change, it would be drawn in place
   * and then slide up out of view — a flash across the top of the screen.
   */
  const pin = () => {
    spacer.style.height = `${header.offsetHeight}px`;
    spacer.style.display = 'block';
    header.style.transition = 'none';
    header.classList.add('is-pinned');
    // Commit the parked position before the transition comes back.
    void header.offsetHeight;
    header.style.removeProperty('transition');
  };

  // Same on the way back: a parked bar drops into its own place without
  // sliding down into it.
  const unpin = () => {
    header.style.transition = 'none';
    header.classList.remove('is-pinned', 'is-shown');
    spacer.style.display = 'none';
    void header.offsetHeight;
    header.style.removeProperty('transition');
    travel = 0;
  };

  const update = () => {
    frame = null;
    // Rubber-band overscroll past either end is not a real change of direction.
    const maxY = document.documentElement.scrollHeight - window.innerHeight;
    const y = Math.min(Math.max(window.scrollY, 0), Math.max(maxY, 0));
    const pinned = header.classList.contains('is-pinned');

    // Back where the header lives: hand it back to the page.
    if (y <= naturalTop) {
      if (pinned) {
        unpin();
      }

      lastY = y;
      return;
    }

    // Lift it out only once its own place has left the screen, so the swap is
    // never seen.
    if (!pinned && y > naturalTop + naturalHeight) {
      pin();
    }

    const step = y - lastY;
    lastY = y;

    if (step === 0) {
      return;
    }

    // Same direction adds up; a reversal starts the count again.
    travel = Math.sign(step) === Math.sign(travel) ? travel + step : step;

    if (!header.classList.contains('is-pinned')) {
      return;
    }

    const overPanel = hideOver ? hideOver.getBoundingClientRect().bottom > 0 : false;

    if (overPanel || travel >= TRAVEL) {
      header.classList.remove('is-shown');
    } else if (travel <= -TRAVEL) {
      header.classList.add('is-shown');
    }
  };

  const onScroll = () => {
    if (frame === null) {
      frame = window.requestAnimationFrame(update);
    }
  };

  const onResize = () => {
    measure();
    onScroll();
  };

  measure();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);

  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);

    if (frame !== null) {
      window.cancelAnimationFrame(frame);
    }

    unpin();
    spacer.remove();
  };
}
