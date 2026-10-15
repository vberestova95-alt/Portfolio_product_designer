import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { attachLogoPool } from '../lib/logoPool.js';
import { ContactMenu } from './NavMenu.jsx';

/*
 * A handful of loose physics cubes for a panel that is not the practice card —
 * the hero and the footer. They land on the panel's [data-pool-floor] (or its
 * bottom edge), can be shoved and kicked out through the top. The pool's
 * parent is its box: the physics reads its bounds and the pointer from there,
 * and it should clip.
 *
 * With `photos` (a list of image URLs), each round deals `photoCount` of them
 * at random onto random cubes, at least `featuredCount` of them from
 * `featured` (a subset of `photos`); `labels` puts a word on a cube each. Photo and
 * label cubes stay upright (data-upright), so they never land on their side. With `restoreLabel`, kicking every cube out
 * brings up a button that drops a fresh, newly dealt round. With `contact`
 * ({ email, linkedin, telegram }) as well, the empty panel offers a "Contact
 * me" pill instead (a bottom sheet on a phone), so it becomes a way to write,
 * and a round reload button stays on the floor at all times — at its right
 * end, above the divider — to deal a fresh round whenever. It is marked
 * [data-pool-obstacle], so the cubes are walled off from it and never cover it.
 */
function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

function deal(count, photos, photoCount, labels, featured, featuredCount) {
  const slots = Array(count).fill(null);
  const mustHave = shuffle(featured).slice(0, Math.min(featuredCount, photoCount));
  const rest = shuffle(photos.filter((src) => !mustHave.includes(src))).slice(
    0,
    photoCount - mustHave.length,
  );
  const picks = [
    ...labels.map((text) => ({ text })),
    ...[...mustHave, ...rest].map((src) => ({ src })),
  ];
  const places = shuffle([...slots.keys()]).slice(0, picks.length);

  places.forEach((place, index) => {
    slots[place] = picks[index];
  });

  return slots;
}

/* The restore action as an icon: a circular "reload" arrow. Shared with the
   practice card's cleared state on the home page. */
export function ReloadIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4.5h-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CubePool({
  count,
  cubeSize,
  align,
  className = '',
  photos = [],
  photoCount = 0,
  labels = [],
  featured = [],
  featuredCount = 0,
  restoreLabel,
  contact,
}) {
  const poolRef = useRef(null);
  const dealRound = () => deal(count, photos, photoCount, labels, featured, featuredCount);
  const [slots, setSlots] = useState(dealRound);
  const [round, setRound] = useState(0);
  const [restoreTop, setRestoreTop] = useState(null);
  // The floor the pinned reload button is mounted into (hero only).
  const [floorNode, setFloorNode] = useState(null);

  useEffect(() => attachLogoPool(poolRef.current, { cubeSize, align }), [cubeSize, align]);

  useEffect(() => {
    if (contact) {
      setFloorNode(poolRef.current?.parentElement?.querySelector('[data-pool-floor]') ?? null);
    }
  }, [contact]);

  useEffect(() => {
    const box = poolRef.current?.parentElement;

    if (!box || !restoreLabel) {
      return undefined;
    }

    // Centred in the open space the cubes had: from the ceiling (the hero's
    // top bar) down to their floor.
    const handleCleared = () => {
      const boxRect = box.getBoundingClientRect();
      const floor = box.querySelector('[data-pool-floor]');
      const ceilingNode = box.querySelector('[data-pool-ceiling]');
      // A pinned header (lib/pinnedHeader.js) is fixed to the viewport; the
      // spacer left in its place, just before it, still marks where it was.
      const ceiling = ceilingNode?.classList.contains('is-pinned')
        ? ceilingNode.previousElementSibling
        : ceilingNode;
      const floorTop = floor ? floor.getBoundingClientRect().top - boxRect.top : boxRect.height;
      const ceilingBottom = ceiling ? ceiling.getBoundingClientRect().bottom - boxRect.top : 0;

      setRestoreTop((ceilingBottom + floorTop) / 2);
    };

    box.addEventListener('logopool:cleared', handleCleared);
    return () => box.removeEventListener('logopool:cleared', handleCleared);
  }, [restoreLabel]);

  // The new photos have to be in the DOM before the physics reads the tiles.
  useEffect(() => {
    if (round > 0) {
      poolRef.current?.parentElement?.dispatchEvent(new CustomEvent('logopool:restore'));
    }
  }, [round]);

  const handleRestore = () => {
    setSlots(dealRound());
    setRestoreTop(null);
    setRound((value) => value + 1);
  };

  return (
    <>
      <div className={`logo-pool ${className}`} ref={poolRef} aria-hidden="true">
        {slots.map((slot, index) => {
          if (slot?.src) {
            return (
              <span key={index} className="logo-cube logo-cube--photo" data-cube data-upright>
                <img src={slot.src} alt="" draggable={false} />
              </span>
            );
          }

          if (slot?.text) {
            return (
              <span key={index} className="logo-cube logo-cube--label" data-cube data-upright>
                {slot.text}
              </span>
            );
          }

          return <span key={index} className="logo-cube" data-cube />;
        })}
      </div>

      {contact && floorNode
        ? createPortal(
            <button
              type="button"
              className="cube-pool__reload cube-pool__reload--pinned"
              aria-label={restoreLabel}
              title={restoreLabel}
              onClick={handleRestore}
              onPointerDown={(event) => event.stopPropagation()}
              data-pool-obstacle
            >
              <ReloadIcon />
            </button>,
            floorNode,
          )
        : null}

      {restoreTop !== null && contact ? (
        <div className="cube-pool__cleared" style={{ top: restoreTop }}>
          <ContactMenu
            email={contact.email}
            linkedin={contact.linkedin}
            telegram={contact.telegram}
            sheet
          />
        </div>
      ) : null}

      {restoreTop !== null && !contact ? (
        <button
          type="button"
          className="cube-pool__restore"
          style={{ top: restoreTop }}
          onClick={handleRestore}
        >
          {restoreLabel}
        </button>
      ) : null}
    </>
  );
}
