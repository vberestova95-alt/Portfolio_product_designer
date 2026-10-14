import React from 'react';

/*
 * The "v.b." mark from the photo portfolio, shared by every page header. The
 * full name stays in the link for screen readers and search; the mark itself is
 * decoration. Its face is loaded for these three glyphs only (see index.html).
 */
export function BrandLogo({ name }) {
  return (
    <>
      <span className="brand-logo" aria-hidden="true">
        v.b.
      </span>
      <span className="visually-hidden">{name}</span>
    </>
  );
}
