import React, { useEffect, useState } from 'react';
import { useUi } from '../i18n/LanguageContext.jsx';
import {
  DENIED,
  GRANTED,
  PRIVACY_HREF,
  decideConsent,
  onConsentOpen,
  openConsent,
  readConsent,
} from '../lib/consent.js';

/*
 * Asks once, on any page, and leaves the page usable while it waits. Declining
 * stays one click away, next to accepting and the same size.
 */
export function ConsentBanner() {
  const text = useUi().consent;
  const [open, setOpen] = useState(() => readConsent() === null);

  useEffect(() => onConsentOpen(() => setOpen(true)), []);

  if (!open) {
    return null;
  }

  const choose = (choice) => {
    decideConsent(choice);
    setOpen(false);
  };

  return (
    <section className="consent-banner" aria-label={text.label}>
      <p className="consent-banner__text">
        {text.message}{' '}
        <a className="consent-banner__link" href={PRIVACY_HREF}>
          {text.policy}
        </a>
      </p>

      <div className="consent-banner__actions">
        <button className="consent-banner__button" type="button" onClick={() => choose(DENIED)}>
          {text.decline}
        </button>
        <button
          className="consent-banner__button consent-banner__button--accept"
          type="button"
          onClick={() => choose(GRANTED)}
        >
          {text.accept}
        </button>
      </div>
    </section>
  );
}

/* The policy and a way back to the banner, for pages that end without a footer too. */
export function PrivacyLinks() {
  const text = useUi().consent;

  return (
    <p className="privacy-links">
      <a href={PRIVACY_HREF}>{text.policy}</a>
      <button type="button" onClick={openConsent}>
        {text.settings}
      </button>
    </p>
  );
}
