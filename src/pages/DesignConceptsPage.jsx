import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { useUi } from '../i18n/LanguageContext.jsx';
import { PLAIN_TONES, attachHeroMosaic } from '../lib/heroMosaic.js';

function Lightbox({ src, alt, onClose }) {
  const text = useUi().case;

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="case-lightbox" onClick={onClose}>
      <button className="case-lightbox__close" onClick={onClose} aria-label={text.closeImage}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <img
        className="case-lightbox__img"
        src={src}
        alt={alt}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}

export function DesignConceptsPage({ archive, profile }) {
  const text = useUi().case;
  const [lightbox, setLightbox] = useState(null);
  const { intro, shots } = archive;
  const mosaicRef = useRef(null);
  const titleRef = useRef(null);
  const backRef = useRef(null);

  /*
   * The intro on the grey squares, as on the AI projects intro — and every
   * square a way in: the pointer opens a window of four on the next shot,
   * and a click on it shows the shot full size.
   */
  useEffect(
    () =>
      attachHeroMosaic(mosaicRef.current, {
        maxBoards: 0,
        tones: PLAIN_TONES,
        anchor: titleRef.current,
        header: backRef.current,
        peek: true,
        photos: shots.map((shot) => shot.src),
        onPick: (index) => setLightbox({ src: shots[index].src, alt: shots[index].alt }),
      }),
    [],
  );

  const handleImageClick = useCallback((event) => {
    if (event.target.tagName === 'IMG') {
      setLightbox({ src: event.target.src, alt: event.target.alt });
    }
  }, []);

  return (
    <div className="case-page concept-page">
      {lightbox ? (
        <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      ) : null}

      <div className="case-page__shell">
        {profile ? <SiteHeader profile={profile} /> : null}

        <section className="concept-hero concept-hero--mosaic">
          <canvas className="hero-mosaic" ref={mosaicRef} aria-hidden="true" />

          <a className="case-back-link concept-hero__back" href="/" ref={backRef}>
            <span aria-hidden="true">←</span>
            <span>{text.back}</span>
          </a>

          <div className="concept-hero__copy">
            <h1 ref={titleRef}>{intro.title}</h1>
            <p className="concept-hero__description">{intro.description}</p>
          </div>

          <div className="concept-hero__footer">
            <a href={intro.href} target="_blank" rel="noopener noreferrer">
              {intro.hrefLabel}
              <span aria-hidden="true"> →</span>
            </a>
          </div>
        </section>

        <div className="concept-grid" onClick={handleImageClick}>
          {shots.map((shot, index) => {
            const isWide = shot.wide ?? (index % 5 === 0);

            return (
              <figure
                key={shot.src}
                className={`concept-card${isWide ? ' concept-card--wide' : ''}`}
                data-reveal
              >
                <div className="concept-card__media">
                  <img src={shot.src} alt={shot.alt} loading="lazy" />
                </div>
                <figcaption>
                  <span className="concept-card__label">{shot.label}</span>
                  <span className="concept-card__title">{shot.title}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>

      {profile ? <SiteFooter profile={profile} /> : null}
    </div>
  );
}
