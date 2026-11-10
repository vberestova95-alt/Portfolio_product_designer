import React, { useEffect, useRef } from 'react';
import { attachAiCube } from '../lib/aiCube.js';
import { BrandLogo } from './BrandLogo.jsx';

/*
 * Parts of the AI landing (/ai-portfolio, /ai-projects and the AI subdomain):
 * the frames it shows, the blue cube, and the subdomain's own header.
 */

const IMAGE_PATTERN = /\.(webp|jpe?g|png|avif)(\?.*)?$/i;

/*
 * Every image a case study uses, in the order it appears, so the hero shows
 * real frames of the work rather than only the covers.
 */
export function collectImages(value, found = new Set()) {
  if (typeof value === 'string') {
    if (IMAGE_PATTERN.test(value)) {
      found.add(value);
    }
  } else if (Array.isArray(value)) {
    value.forEach((entry) => collectImages(entry, found));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((entry) => collectImages(entry, found));
  }
  return found;
}

/* A project's cover first, then up to `limit - 1` frames from its case. */
export function projectFrames(item, caseStudy, limit = 4) {
  const frames = [item.image?.src, ...collectImages(caseStudy)].filter(Boolean);
  return [...new Set(frames)].slice(0, limit);
}

/* The blue cube in its clear shell (lib/aiCube.js), over a plain square fallback. */
export function CubeShape({ className = '', shapeRef }) {
  const canvasRef = useRef(null);

  useEffect(() => attachAiCube(canvasRef.current), []);

  return (
    <div className={`ai-shape ${className}`} ref={shapeRef} aria-hidden="true">
      <canvas className="ai-shape__canvas" ref={canvasRef} />
    </div>
  );
}

/*
 * The subdomain's header: the site's mark, a way to write, and the privacy
 * page — the one-screen page has no footer to carry it. `switcher` sits in
 * the middle of its row.
 */
export function ConceptHeader({ profile, switcher = null }) {
  const links = [
    { key: 'privacy', href: '/privacy', label: 'Privacy' },
    { key: 'contact', href: `mailto:${profile.email}`, label: 'Contact' },
  ];

  return (
    <header className="ai-header">
      <a className="ai-header__mark" href="/">
        <BrandLogo name={profile.name} />
      </a>

      {switcher}

      <nav className="ai-header__nav" aria-label="AI portfolio">
        {links.map((link) => (
          <a key={link.key} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

/*
 * The cases as a plain list, for those who would rather not ride the
 * carousel: each title over a line, its one-line pitch beside it, and a
 * preview of the case following the pointer along the list.
 */
export function WorkList({ items }) {
  const previewRef = useRef(null);
  const imageRef = useRef(null);

  function move(event) {
    const preview = previewRef.current;
    if (!preview) {
      return;
    }
    const box = preview.parentElement.getBoundingClientRect();
    preview.style.transform = `translate(${event.clientX - box.left}px, ${event.clientY - box.top}px)`;
  }

  function show(event, item) {
    if (!previewRef.current || !item.image?.src) {
      return;
    }
    imageRef.current.src = item.image.src;
    previewRef.current.classList.add('is-on');
    move(event);
  }

  function hide() {
    previewRef.current?.classList.remove('is-on');
  }

  return (
    <div className="ai-list" onPointerLeave={hide}>
      <ul className="ai-list__rows">
        {items.map((item) => (
          <li key={item.id}>
            <a
              className="ai-list__row"
              href={item.href}
              onPointerEnter={(event) => show(event, item)}
              onPointerMove={move}
            >
              <span className="ai-list__title">{item.title}</span>
              <span className="ai-list__description">{item.description}</span>
            </a>
          </li>
        ))}
      </ul>
      <div className="ai-list__preview" ref={previewRef} aria-hidden="true">
        {/* Starts on the first cover, so the image is never empty before a hover. */}
        <img ref={imageRef} src={items[0]?.image?.src} alt="" />
      </div>
    </div>
  );
}
