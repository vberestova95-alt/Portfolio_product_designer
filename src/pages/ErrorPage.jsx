import React, { useEffect } from 'react';
import editorialObject from '../assets/editorial-object.webp';
import { useUi } from '../i18n/LanguageContext.jsx';
import { SHOW_OBJECT_GRAPHICS } from '../lib/siteGraphics.js';

export function ErrorPage({
  code,
  label,
  titleStart,
  titleAccent,
  titleEnd,
  description,
  primaryLabel,
  primaryHref = '/',
  onPrimaryAction,
}) {
  const text = useUi().error;
  const brand = useUi().meta.nameSuffix;

  useEffect(() => {
    const previousTitle = document.title;
    const robotsMeta = document.querySelector('meta[name="robots"]');
    const previousRobots = robotsMeta?.getAttribute('content');

    document.title = `${code} - ${brand}`;
    robotsMeta?.setAttribute('content', 'noindex, nofollow');

    return () => {
      document.title = previousTitle;

      if (previousRobots) {
        robotsMeta?.setAttribute('content', previousRobots);
      }
    };
  }, [code, brand]);

  return (
    <div className="error-page">
      <main className="error-page__panel">
        <div className="error-page__topline">
          <a href="/">{brand}</a>
          <span>{code} / {text.portfolio}</span>
        </div>

        <div className="error-page__copy">
          <p className="error-page__eyebrow">{label}</p>
          <h1>
            {titleStart}{' '}
            <span className="serif-accent">{titleAccent}</span>
            {titleEnd}
          </h1>
          <p className="error-page__description">{description}</p>

          <div className="error-page__actions">
            {onPrimaryAction ? (
              <button type="button" onClick={onPrimaryAction}>
                {primaryLabel}
                <span aria-hidden="true">&#8599;</span>
              </button>
            ) : (
              <a href={primaryHref}>
                {primaryLabel}
                <span aria-hidden="true">&#8599;</span>
              </a>
            )}
            <a href="mailto:vberestova95@gmail.com">{text.report}</a>
          </div>
        </div>

        <div className="error-page__visual" aria-hidden="true">
          <span>{code}</span>
          {SHOW_OBJECT_GRAPHICS ? <img src={editorialObject} alt="" /> : null}
        </div>

        <div className="error-page__footer">
          <span>{text.footerLeft}</span>
          <span>{text.footerRight}</span>
        </div>
      </main>
    </div>
  );
}

export function NotFoundPage() {
  const text = useUi().error.notFound;

  return <ErrorPage code="404" {...text} />;
}

export function RuntimeErrorPage() {
  const text = useUi().error.runtime;

  return <ErrorPage code="500" {...text} onPrimaryAction={() => window.location.reload()} />;
}
