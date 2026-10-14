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
 */

const DELTA = 6; // px of travel before a change of direction counts

export function attachPinnedHeader(header) {
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
  let frame = null;

  const measure = () => {
    const anchor = header.classList.contains('is-pinned') ? spacer : header;
    naturalTop = anchor.getBoundingClientRect().top + window.scrollY;
    naturalHeight = header.classList.contains('is-pinned')
      ? spacer.offsetHeight
      : header.offsetHeight;
  };

  const pin = () => {
    spacer.style.height = `${header.offsetHeight}px`;
    spacer.style.display = 'block';
    header.classList.add('is-pinned');
  };

  const unpin = () => {
    header.classList.remove('is-pinned', 'is-shown');
    spacer.style.display = 'none';
  };

  const update = () => {
    frame = null;
    const y = window.scrollY;
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

    if (Math.abs(y - lastY) < DELTA) {
      return;
    }

    if (header.classList.contains('is-pinned')) {
      header.classList.toggle('is-shown', y < lastY);
    }

    lastY = y;
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
