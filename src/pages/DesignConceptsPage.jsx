import React, { useCallback, useEffect, useState } from 'react';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { useUi } from '../i18n/LanguageContext.jsx';

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
  const [lightbox, setLightbox] = useState(null);
  const { intro, shots } = archive;

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

        <section className="concept-hero">
          <p className="case-eyebrow">{intro.eyebrow}</p>
          <h1>{intro.title}</h1>
          <p className="concept-hero__description">{intro.description}</p>

          <div className="concept-hero__footer">
            <span>{intro.meta}</span>
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
