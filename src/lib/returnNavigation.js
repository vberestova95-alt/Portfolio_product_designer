const STORAGE_KEY = 'portfolio:return-positions';
const PENDING_KEY = 'portfolio:pending-return';
const MAX_ENTRY_AGE = 2 * 60 * 60 * 1000;
const MAX_ENTRIES = 12;
const RETURN_CONTAINER_SELECTOR = '.work-card, .editorial-card, .case-next__card';

function readEntries() {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '[]');

    if (!Array.isArray(stored)) {
      return [];
    }

    const cutoff = Date.now() - MAX_ENTRY_AGE;
    return stored.filter(
      (entry) =>
        entry &&
        typeof entry.id === 'string' &&
        typeof entry.sourcePath === 'string' &&
        typeof entry.destinationPath === 'string' &&
        typeof entry.scrollY === 'number' &&
        typeof entry.createdAt === 'number' &&
        entry.createdAt >= cutoff,
    );
  } catch {
    return [];
  }
}

function writeEntries(entries) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    // Navigation should still work when session storage is unavailable.
  }
}

function saveReturnEntry(entry) {
  const entries = readEntries();
  entries.push(entry);
  writeEntries(entries);
}

function updateReturnEntry(entry) {
  const entries = readEntries().map((stored) => (stored.id === entry.id ? entry : stored));
  writeEntries(entries);
}

function findEntryById(id) {
  return id ? readEntries().find((entry) => entry.id === id) || null : null;
}

function getHistoryState() {
  const state = window.history.state;
  return state && typeof state === 'object' ? state : {};
}

function connectPendingEntry(pathname) {
  try {
    const pendingId = window.sessionStorage.getItem(PENDING_KEY);
    const entry = findEntryById(pendingId);
    window.sessionStorage.removeItem(PENDING_KEY);

    if (!entry || entry.destinationPath !== pathname) {
      return;
    }

    window.history.replaceState(
      { ...getHistoryState(), portfolioReturnId: entry.id },
      '',
      window.location.href,
    );
  } catch {
    // The regular link remains a safe fallback without session storage.
  }
}

function createEntryId() {
  return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getAnchorContainer(anchor) {
  return anchor.closest(RETURN_CONTAINER_SELECTOR) || anchor;
}

function findDestinationAnchor(destinationPath, normalizePathname) {
  return Array.from(document.querySelectorAll('a[href]')).find((anchor) => {
    try {
      const url = new URL(anchor.href, window.location.href);
      return (
        url.origin === window.location.origin &&
        normalizePathname(url.pathname) === destinationPath
      );
    } catch {
      return false;
    }
  });
}

/*
 * Distance from the top of the document to an element's own place in the flow.
 *
 * getBoundingClientRect() alone is not enough here: the work cards are
 * `position: sticky`, so once one is pinned its rect reports the pin offset
 * rather than where the card actually lives. Measuring off that produced a
 * target that moved every time we scrolled to it — which is exactly the
 * jumping back and forth this file used to cause on return. Taking the sticky
 * out for the length of one measurement gives a value that does not drift.
 */
function getDocumentTop(element) {
  const previousPosition = element.style.position;
  element.style.position = 'static';
  const top = window.scrollY + element.getBoundingClientRect().top;
  element.style.position = previousPosition;
  return top;
}

/*
 * The target is rebuilt from the destination card rather than replayed as a raw
 * offset, so content that reflows above it (a late image, a font swap) moves
 * the target with it instead of shifting the page under the reader.
 */
function resolveTarget(entry, normalizePathname) {
  const anchor = findDestinationAnchor(entry.destinationPath, normalizePathname);

  if (anchor && typeof entry.anchorDelta === 'number') {
    return Math.max(0, getDocumentTop(getAnchorContainer(anchor)) + entry.anchorDelta);
  }

  return Math.max(0, entry.scrollY);
}

function scrollToTarget(entry, top) {
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(entry.scrollX || 0, top);
  root.style.scrollBehavior = previousScrollBehavior;
}

function isUnmodifiedPrimaryClick(event) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

/*
 * `listingPaths` are detail pages that list cases of their own (the AI
 * projects page). Leaving one for a case records it as the place to come back
 * to, the way the home page is — instead of treating it as case → case.
 */
export function attachReturnNavigation({
  pathname,
  detailPaths,
  listingPaths = new Set(),
  normalizePathname,
}) {
  if (typeof window === 'undefined') {
    return undefined;
  }

  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  connectPendingEntry(pathname);

  let timeoutIds = [];
  let animationFrameId = 0;
  let resizeObserver;
  let watchers = null;

  const stopRestoring = () => {
    timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    timeoutIds = [];
    window.cancelAnimationFrame(animationFrameId);
    resizeObserver?.disconnect();
    resizeObserver = undefined;
    watchers?.();
    watchers = null;
  };

  /*
   * One correct jump, then a short watch for late layout shifts — and the watch
   * gives up the moment it agrees with the page twice running, or the moment
   * the reader scrolls. Re-asserting a position for seconds after arrival is
   * what made the cards feel like they were fighting the scroll.
   */
  const scheduleRestore = () => {
    const entry = findEntryById(getHistoryState().portfolioReturnSourceId);

    if (!entry || entry.sourcePath !== pathname) {
      return;
    }

    let settled = 0;

    const restore = () => {
      const top = resolveTarget(entry, normalizePathname);

      if (Math.abs(window.scrollY - top) <= 1) {
        settled += 1;

        if (settled >= 2) {
          stopRestoring();
        }

        return;
      }

      settled = 0;
      scrollToTarget(entry, top);
    };

    // A manual scroll means the reader has taken over — never scroll over that.
    const handleUserScroll = () => stopRestoring();
    const scrollEvents = ['wheel', 'touchmove', 'keydown'];
    scrollEvents.forEach((type) =>
      window.addEventListener(type, handleUserScroll, { passive: true }),
    );
    watchers = () =>
      scrollEvents.forEach((type) => window.removeEventListener(type, handleUserScroll));

    restore();
    animationFrameId = window.requestAnimationFrame(() => {
      animationFrameId = window.requestAnimationFrame(restore);
    });
    timeoutIds.push(
      window.setTimeout(restore, 120),
      window.setTimeout(restore, 420),
      window.setTimeout(restore, 900),
      window.setTimeout(stopRestoring, 1200),
    );

    if ('ResizeObserver' in window) {
      resizeObserver = new window.ResizeObserver(restore);
      resizeObserver.observe(document.documentElement);
    }
  };

  scheduleRestore();

  const handlePageShow = (event) => {
    if (event.persisted) {
      stopRestoring();
      scheduleRestore();
    }
  };

  const handleClick = (event) => {
    if (!isUnmodifiedPrimaryClick(event) || !(event.target instanceof Element)) {
      return;
    }

    const anchor = event.target.closest('a[href]');

    if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) {
      return;
    }

    let destinationUrl;

    try {
      destinationUrl = new URL(anchor.href, window.location.href);
    } catch {
      return;
    }

    if (destinationUrl.origin !== window.location.origin) {
      return;
    }

    const destinationPath = normalizePathname(destinationUrl.pathname);
    const returnEntry = findEntryById(getHistoryState().portfolioReturnId);

    if (
      detailPaths.has(pathname) &&
      (anchor.classList.contains('case-back-link') || anchor.hasAttribute('data-return-home')) &&
      returnEntry?.destinationPath === pathname
    ) {
      event.preventDefault();
      window.history.back();
      return;
    }

    if (
      detailPaths.has(pathname) &&
      !listingPaths.has(pathname) &&
      detailPaths.has(destinationPath) &&
      destinationPath !== pathname &&
      (returnEntry?.sourcePath === '/' || listingPaths.has(returnEntry?.sourcePath))
    ) {
      event.preventDefault();
      /*
       * Case → case: the reader comes back to a card they were never parked on,
       * so the saved offset into the old card means nothing. Landing just above
       * the new card puts it at the top of the stack, where it would have been
       * had they scrolled down to it.
       */
      const updatedEntry = {
        ...returnEntry,
        destinationPath,
        anchorDelta: -24,
        createdAt: Date.now(),
      };

      updateReturnEntry(updatedEntry);
      window.sessionStorage.setItem(PENDING_KEY, updatedEntry.id);
      window.location.replace(destinationUrl.href);
      return;
    }

    if (!detailPaths.has(destinationPath) || destinationPath === pathname) {
      return;
    }

    const container = getAnchorContainer(anchor);
    /*
     * How far into the card the reader had scrolled, measured against the
     * card's place in the flow rather than its rect — a pinned sticky card
     * reports the pin, and that offset would put them somewhere else on return.
     */
    const entry = {
      id: createEntryId(),
      sourcePath: pathname,
      destinationPath,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      anchorDelta: window.scrollY - getDocumentTop(container),
      createdAt: Date.now(),
    };

    saveReturnEntry(entry);

    try {
      window.sessionStorage.setItem(PENDING_KEY, entry.id);
      window.history.replaceState(
        { ...getHistoryState(), portfolioReturnSourceId: entry.id },
        '',
        window.location.href,
      );
    } catch {
      // Browser Back continues to work even if exact restoration is unavailable.
    }
  };

  document.addEventListener('click', handleClick, true);
  window.addEventListener('pageshow', handlePageShow);

  return () => {
    document.removeEventListener('click', handleClick, true);
    window.removeEventListener('pageshow', handlePageShow);
    stopRestoring();
  };
}
