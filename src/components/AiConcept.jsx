import React, { useEffect, useRef } from 'react';
import { attachAiCube } from '../lib/aiCube.js';
import { BrandLogo } from './BrandLogo.jsx';
import { PrivacyLinks } from './ConsentBanner.jsx';

/*
 * Parts of the AI landing (/ai-portfolio, /ai-projects and the AI subdomain):
 * a quiet header with the site's mark, the blue cube, the numbered work index
 * and the closing line. The look borrows from editorial studio sites — a light
 * grey page, small caps labels, a black index — set in the site's own faces.
 */

const IMAGE_PATTERN = /\.(webp|jpe?g|png|avif)(\?.*)?$/i;

/*
 * Every image a case study uses, in the order it appears, so the hero and
 * the ring show real frames of the work rather than only the covers.
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

/* The subdomain's header: the site's mark, the page's anchors, a way to write. */
export function ConceptHeader({ profile }) {
  const links = [
    { key: 'how', href: '#how', label: 'How I work' },
    { key: 'work', href: '#work', label: 'Work' },
    { key: 'contact', href: `mailto:${profile.email}`, label: 'Contact' },
  ];

  return (
    <header className="ai-header">
      <a className="ai-header__mark" href="/">
        <BrandLogo name={profile.name} />
      </a>

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
 * The numbered work list. Hovering a row brings that project's cover up next
 * to the cursor; on touch screens the row is just a link.
 */
export function WorkIndex({ items }) {
  const previewRef = useRef(null);
  const imageRef = useRef(null);

  function show(event, item) {
    const preview = previewRef.current;
    if (!preview || !item.image?.src) {
      return;
    }
    imageRef.current.src = item.image.src;
    preview.classList.add('is-on');
    move(event);
  }

  function move(event) {
    const preview = previewRef.current;
    if (!preview) {
      return;
    }
    const box = preview.parentElement.getBoundingClientRect();
    preview.style.transform = `translate(${event.clientX - box.left}px, ${event.clientY - box.top}px)`;
  }

  function hide() {
    previewRef.current?.classList.remove('is-on');
  }

  return (
    <div className="ai-index" onPointerLeave={hide}>
      <ol className="ai-index__list">
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              className="ai-index__row"
              href={item.href}
              onPointerEnter={(event) => show(event, item)}
              onPointerMove={move}
            >
              <span className="ai-index__number">{String(index + 1).padStart(3, '0')}</span>
              <span className="ai-index__title">{item.title}</span>
              <span className="ai-index__meta">
                <span>{item.category}</span>
                {item.metrics?.length ? <span>{item.metrics.join(' · ')}</span> : null}
              </span>
              <span className="ai-index__arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </li>
        ))}
      </ol>

      <div className="ai-index__preview" ref={previewRef} aria-hidden="true">
        <img ref={imageRef} alt="" />
      </div>
    </div>
  );
}

export function ConceptFooter({ profile }) {
  return (
    <footer className="ai-footer">
      <a className="ai-footer__line" href={`mailto:${profile.email}`}>
        Let’s build the next one
      </a>

      <div className="ai-footer__row">
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <ul>
          {profile.contacts.map((contact) => (
            <li key={contact.label}>
              <a href={contact.href} target="_blank" rel="noreferrer">
                {contact.label}
              </a>
            </li>
          ))}
        </ul>
        <PrivacyLinks />
      </div>
    </footer>
  );
}
