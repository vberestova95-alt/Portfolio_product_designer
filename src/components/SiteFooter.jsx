import React from 'react';
import editorialObject from '../assets/editorial-object.webp';
import { SHOW_OBJECT_GRAPHICS } from '../lib/siteGraphics.js';
import { ContactLink } from './ContactLink.jsx';
import { CubePool } from './CubePool.jsx';

// Four blank cubes in the panel's own ink, lying on its bottom edge. The width
// is the tray's — half the panel on desktop, all of it when stacked.
function footerCubeSize(width) {
  // Never wider than one row of five allows, so none lands on the pills.
  return Math.min(92, width / 6, Math.max(72, width * 0.11));
}

/* Closing panel, shared by the home page and every internal page. */
export function SiteFooter({ profile }) {
  return (
    <footer className="home-footer">
      <div className="home-shell home-footer__panel">
        {SHOW_OBJECT_GRAPHICS ? (
          <img className="home-footer__graphic" src={editorialObject} alt="" aria-hidden="true" />
        ) : null}

        {/* Their own tray, so the pile lands clear of the copy and the pills. */}
        <div className="home-footer__cubes">
          <CubePool
            count={4}
            cubeSize={footerCubeSize}
            className="logo-pool--ink"
          />
        </div>

        <div className="home-footer__intro">
          <h2>{profile.availability.title}</h2>
          {profile.availability.paragraphs.map((paragraph) => (
            <p key={paragraph} className="home-footer__lead">
              {paragraph}
            </p>
          ))}
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
