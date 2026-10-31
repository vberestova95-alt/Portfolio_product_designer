import React, { useEffect, useRef } from 'react';
import editorialObject from '../assets/editorial-object.webp';
import { PLAIN_TONES, attachHeroMosaic } from '../lib/heroMosaic.js';
import { SHOW_OBJECT_GRAPHICS } from '../lib/siteGraphics.js';
import { PrivacyLinks } from './ConsentBanner.jsx';
import { ContactLink } from './ContactLink.jsx';
import { CubePool } from './CubePool.jsx';

// Four blank cubes in the panel's own ink, lying on its bottom edge. The width
// is the tray's — half the panel on desktop, all of it when stacked.
function footerCubeSize(width) {
  // Never wider than one row of five allows, so none lands on the pills.
  return Math.min(92, width / 6, Math.max(72, width * 0.11));
}

// The blank cubes on the panel's floor. Hidden while the panel carries the
// mosaic's plain cubes; flip back to true to bring them back.
const SHOW_FOOTER_CUBES = false;

// The grey squares behind the panel. Off — the panel is plain; flip back to
// true to bring them back.
const SHOW_FOOTER_MOSAIC = false;

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// The panel stacks the copy over the pills up to this width (see global.css).
const STACKED_QUERY = '(max-width: 900px)';

/*
 * Which squares sit under the copy, where none may go. Side by
 * side, the copy holds the left and the pills the top right corner. Stacked,
 * the copy fills the panel, so there are no squares at all.
 */
function footerShade(xf, yf) {
  if (window.matchMedia(STACKED_QUERY).matches) {
    return 1;
  }

  const pills = smooth(0.6, 0.72, xf) * (1 - smooth(0.25, 0.4, yf));
  return Math.max(1 - smooth(0.32, 0.6, xf), pills);
}

/* Closing panel, shared by the home page and every internal page. */
export function SiteFooter({ profile }) {
  const mosaicRef = useRef(null);

  // The same plain grey squares as the rest of the site, kept clear of the
  // copy. None once the panel stacks (footerShade).
  useEffect(
    () =>
      SHOW_FOOTER_CUBES || !SHOW_FOOTER_MOSAIC
        ? undefined
        : attachHeroMosaic(mosaicRef.current, {
            maxBoards: 0,
            shade: footerShade,
            tones: PLAIN_TONES,
          }),
    [],
  );

  return (
    <footer className="home-footer">
      <div className="home-shell home-footer__panel">
        {SHOW_FOOTER_CUBES || !SHOW_FOOTER_MOSAIC ? null : (
          <canvas className="hero-mosaic home-footer__mosaic" ref={mosaicRef} aria-hidden="true" />
        )}

        {SHOW_OBJECT_GRAPHICS ? (
          <img className="home-footer__graphic" src={editorialObject} alt="" aria-hidden="true" />
        ) : null}

        {/* Their own tray, so the pile lands clear of the copy and the pills. */}
        {SHOW_FOOTER_CUBES ? (
          <div className="home-footer__cubes">
            <CubePool count={4} cubeSize={footerCubeSize} className="logo-pool--ink" />
          </div>
        ) : null}

        <div className="home-footer__intro">
          <h2>{profile.availability.title}</h2>
          {profile.availability.paragraphs.map((paragraph) => (
            <p key={paragraph} className="home-footer__lead">
              {paragraph}
            </p>
          ))}
          <PrivacyLinks />
        </div>

        <div className="home-footer__links">
          {profile.contacts.map((contact) => (
            <ContactLink key={contact.label} contact={contact} />
          ))}
        </div>
      </div>
    </footer>
  );
}
