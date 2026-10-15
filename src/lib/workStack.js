/*
 * Pin point for the sticky case cards.
 *
 * Each card pins a little lower than the one before it, so the pinned ones
 * peek out above the card sliding over them. That only works while a card is
 * shorter than the screen: a sticky element pins by its top edge, so a card
 * taller than the viewport would stop with its bottom still off screen, and the
 * next card would cover that strip before it had ever been seen. On a phone the
 * cards run close to the full screen height, so this is the common case there.
 *
 * For those cards the pin point is lifted — negative if need be — until the
 * card's bottom edge lands just inside the viewport. The card then scrolls all
 * the way through before it stops, and the stack forms on its lower edge.
 *
 * As the next card slides over a pinned one, the pinned card recedes: its
 * `--stack-cover` runs from 0 to 1 with how much of it is covered, and the
 * stylesheet turns that into a slight shrink and a dimming veil (phones only —
 * see the 640px block in global.css).
 */

const BOTTOM_CLEARANCE = 12; // px left under a tall card once it has pinned

export function attachWorkStack(stack) {
  if (!stack) {
    return undefined;
  }

  let frame = null;
  let coverFrame = null;
  const cards = Array.from(stack.querySelectorAll('.work-card'));
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');

  const updateCover = () => {
    coverFrame = null;

    cards.forEach((card, index) => {
      const next = cards[index + 1];

      if (!next || reduceMotion?.matches) {
        card.style.removeProperty('--stack-cover');
        return;
      }

      const rect = card.getBoundingClientRect();
      const covered = (rect.bottom - next.getBoundingClientRect().top) / rect.height;
      const progress = Math.min(1, Math.max(0, covered));

      card.style.setProperty('--stack-cover', progress.toFixed(3));
    });
  };

  const scheduleCover = () => {
    if (coverFrame === null) {
      coverFrame = requestAnimationFrame(updateCover);
    }
  };

  const update = () => {
    frame = null;
    const viewport = window.innerHeight;

    cards.forEach((card) => {
      // Reset first, so the natural offset is read rather than the last override.
      card.style.removeProperty('--stack-top');
      const style = getComputedStyle(card);

      if (style.position !== 'sticky') {
        return;
      }

      const natural = parseFloat(style.top) || 0;
      const fit = viewport - card.offsetHeight - BOTTOM_CLEARANCE;

      if (fit < natural) {
        card.style.setProperty('--stack-top', `${Math.round(fit)}px`);
      }
    });

    updateCover();
  };

  const schedule = () => {
    if (frame === null) {
      frame = requestAnimationFrame(update);
    }
  };

  // Card heights change as images load and fonts swap, not only on resize.
  const observer = new ResizeObserver(schedule);
  cards.forEach((card) => observer.observe(card));
  window.addEventListener('resize', schedule);
  window.addEventListener('scroll', scheduleCover, { passive: true });
  update();

  return () => {
    observer.disconnect();
    window.removeEventListener('resize', schedule);
    window.removeEventListener('scroll', scheduleCover);
    if (frame !== null) {
      cancelAnimationFrame(frame);
    }
    if (coverFrame !== null) {
      cancelAnimationFrame(coverFrame);
    }
  };
}
