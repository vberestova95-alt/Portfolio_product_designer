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
 */

const BOTTOM_CLEARANCE = 12; // px left under a tall card once it has pinned

export function attachWorkStack(stack) {
  if (!stack) {
    return undefined;
  }

  let frame = null;

  const update = () => {
    frame = null;
    const viewport = window.innerHeight;

    stack.querySelectorAll('.work-card').forEach((card) => {
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
  };

  const schedule = () => {
    if (frame === null) {
      frame = requestAnimationFrame(update);
    }
  };

  // Card heights change as images load and fonts swap, not only on resize.
  const observer = new ResizeObserver(schedule);
  stack.querySelectorAll('.work-card').forEach((card) => observer.observe(card));
  window.addEventListener('resize', schedule);
  update();

  return () => {
    observer.disconnect();
    window.removeEventListener('resize', schedule);
    if (frame !== null) {
      cancelAnimationFrame(frame);
    }
  };
}
