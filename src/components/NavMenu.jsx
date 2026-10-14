import React, { useEffect, useId, useRef, useState } from 'react';
import { useLanguage, useUi } from '../i18n/LanguageContext.jsx';
import { LANGUAGES } from '../i18n/language.js';
import { ContactLink } from './ContactLink.jsx';

const LANGUAGE_LABELS = { ru: 'Ru', en: 'Eng' };

// The Russian version isn't ready yet: its option stays visible but inert.
const DISABLED_LANGUAGES = { ru: 'Скоро появится' };

/*
 * Two-option switch styled like the section links. It sits at the end of the
 * site nav, so on a phone it travels into the burger panel with it.
 */
function LanguageSwitch({ onChange }) {
  const { lang, setLang } = useLanguage();
  const text = useUi().nav;

  return (
    <div className="lang-switch" role="group" aria-label={text.language}>
      {LANGUAGES.map((code) => {
        const soon = DISABLED_LANGUAGES[code];

        return (
          <button
            key={code}
            type="button"
            className={`lang-switch__option${code === lang ? ' is-active' : ''}${soon ? ' is-disabled' : ''}`}
            aria-pressed={code === lang}
            aria-disabled={soon ? true : undefined}
            data-tooltip={soon}
            lang={code}
            onClick={() => {
              if (soon) {
                return;
              }

              setLang(code);
              onChange?.();
            }}
          >
            {LANGUAGE_LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}

/*
 * "Contact me": a filled pill that opens a short list of ways to reach me —
 * LinkedIn, email and, where the profile has one (the Russian version),
 * Telegram. On desktop it drops down under the pill; inside the burger panel
 * it unfolds in place.
 */
function ContactMenu({ email, linkedin, telegram, onPick }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const listId = useId();
  const text = useUi().nav;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const options = [
    linkedin ? { key: 'linkedin', href: linkedin, external: true } : null,
    { key: 'email', href: `mailto:${email}` },
    telegram ? { key: 'telegram', href: telegram, external: true } : null,
  ].filter(Boolean);

  const pick = () => {
    setIsOpen(false);
    onPick?.();
  };

  return (
    <div className={`contact-menu${isOpen ? ' is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="contact-link contact-link--primary contact-menu__toggle"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((current) => !current)}
      >
        {text.contactMe}
      </button>

      <ul className="contact-menu__list" id={listId}>
        {options.map((option) => (
          <li key={option.key}>
            <a
              className="contact-menu__option"
              href={option.href}
              target={option.external ? '_blank' : undefined}
              rel={option.external ? 'noopener noreferrer' : undefined}
              onClick={pick}
            >
              {text.contactVia[option.key]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/*
 * Site sections, one page each. The logo is the way home, so home is not
 * listed. Dribbble is the on-site archive of the shots, not the external
 * profile.
 */
const SITE_LINKS = [
  { key: 'aiProjects', href: '/ai-projects' },
  { key: 'dribbble', href: '/design-concepts' },
  { key: 'experience', href: '/experience' },
];

function currentPath() {
  if (typeof window === 'undefined') {
    return '/';
  }

  const path = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
  return path || '/';
}

/*
 * Top row: site navigation and the language switch on the left; on
 * the right the CV and a filled "contact me" button (ContactMenu) at the far end. Below
 * the tablet breakpoint all of it collapses behind a burger, so the row keeps
 * the logo and the toggle on one line.
 *
 * `siteNav={false}` keeps the plain contact row (the standalone pet tracker
 * page lives on its own domain and has no site to navigate).
 */
export function NavMenu({ contacts, email, telegram, siteNav = true, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();
  const text = useUi().nav;
  const path = currentPath();
  // With the site nav on, Dribbble is reached through its archive page instead.
  const visibleContacts = siteNav
    ? contacts.filter((contact) => contact.label !== 'Dribbble')
    : contacts;
  // With the site nav on, only the CV stays a pill on the right; LinkedIn is
  // reached through "contact me".
  const pillContacts = siteNav ? visibleContacts.filter((contact) => contact.label === 'CV') : visibleContacts;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      className={`nav-menu${isOpen ? ' is-open' : ''}${className ? ` ${className}` : ''}`}
      ref={rootRef}
    >
      <div className="nav-menu__links" id={menuId}>
        {siteNav ? (
          <nav className="site-nav" aria-label={text.siteNav}>
            {SITE_LINKS.map((link) => (
              <a
                key={link.key}
                className="site-nav__link"
                href={link.href}
                aria-current={link.href === path ? 'page' : undefined}
                onClick={() => setIsOpen(false)}
              >
                {text.links[link.key]}
              </a>
            ))}
            <LanguageSwitch onChange={() => setIsOpen(false)} />
          </nav>
        ) : null}

        <nav className="nav-menu__contacts" aria-label={text.contactLinks}>
          {siteNav ? null : <LanguageSwitch onChange={() => setIsOpen(false)} />}
          {pillContacts.map((contact) => (
            <ContactLink
              key={contact.label}
              contact={contact}
              className="contact-link"
              onClick={() => setIsOpen(false)}
            />
          ))}
          {siteNav && email ? (
            <ContactMenu
              email={email}
              linkedin={contacts.find((contact) => contact.label === 'LinkedIn')?.href}
              telegram={telegram}
              onPick={() => setIsOpen(false)}
            />
          ) : null}
        </nav>
      </div>

      <button
        className="nav-menu__burger"
        type="button"
        aria-label={isOpen ? text.closeMenu : text.openMenu}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
    </div>
  );
}
