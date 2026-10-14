import React, { useEffect, useRef } from 'react';
import { BrandLogo } from './BrandLogo.jsx';
import { NavMenu } from './NavMenu.jsx';
import { attachPinnedHeader } from '../lib/pinnedHeader.js';

/*
 * Top bar for the internal pages. The home page carries the same information
 * inside its hero panel, so it does not use this. It scrolls away with the
 * page and comes back as a bar on scroll up (lib/pinnedHeader.js).
 */
export function SiteHeader({ profile, brandHref = '/', showReturnHome = true }) {
  const headerRef = useRef(null);

  useEffect(() => attachPinnedHeader(headerRef.current), []);

  return (
    <header className="site-topbar" ref={headerRef}>
      <a
        className="site-topbar__brand"
        href={brandHref}
        data-return-home={showReturnHome ? '' : undefined}
      >
        <BrandLogo name={profile.name} />
      </a>

      <NavMenu
        contacts={profile.contacts}
        email={profile.email}
        telegram={profile.telegram}
        siteNav={showReturnHome}
        className="nav-menu--ink"
      />
    </header>
  );
}
