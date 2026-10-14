import React from 'react';
import { BrandLogo } from './BrandLogo.jsx';
import { NavMenu } from './NavMenu.jsx';

/*
 * Top bar for the internal pages. The home page carries the same information
 * inside its hero panel, so it does not use this. Deliberately static — it
 * scrolls away with the page instead of following it down.
 */
export function SiteHeader({ profile, brandHref = '/', showReturnHome = true }) {
  return (
    <header className="site-topbar">
      <a
        className="site-topbar__brand"
        href={brandHref}
        data-return-home={showReturnHome ? '' : undefined}
      >
        <BrandLogo name={profile.name} />
      </a>

      <NavMenu contacts={profile.contacts} className="nav-menu--ink" />
    </header>
  );
}
