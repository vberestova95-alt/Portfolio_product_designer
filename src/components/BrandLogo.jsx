import React from 'react';

/*
 * The "V.Berestova" mark, shared by every page header. The full name stays in
 * the link for screen readers and search; the mark itself is decoration. Its
 * face is loaded for these glyphs only (see index.html).
 */
export function BrandLogo({ name }) {
  return (
    <>
      <span className="brand-logo" aria-hidden="true">
        V.Berestova
      </span>
      <span className="visually-hidden">{name}</span>
    </>
  );
}
