import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage, useUi } from '../i18n/LanguageContext.jsx';
import { LANGUAGES } from '../i18n/language.js';
import { track } from '../lib/analytics.js';
import { ContactLink } from './ContactLink.jsx';

const LANGUAGE_LABELS = { ru: 'Ru', en: 'Eng' };

// Options shown but inert, with a tooltip, e.g. { ru: 'Скоро появится' }.
const DISABLED_LANGUAGES = {};

/*
 * Two-option switch styled like the section links. It sits at the end of the
 * site nav, so on a phone it travels into the burger panel with it.
 */
function LanguageSwitch({ onChange }) {
  const { lang, setLang } = useLanguage();
  const text = useUi().nav;

  // One language left (see i18n/language.js) — nothing to switch between.
  if (LANGUAGES.length < 2) {
    return null;
  }

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

              if (code !== lang) {
                track('lang_switch', { to: code });
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
 * it unfolds in place. The cleared hero (CubePool) offers it too. On a phone
 * both open it as a bottom sheet.
 *
 * With `sheet`, a phone gets the list as a bottom sheet instead: rendered into
 * <body>, since the pill can sit inside a transformed box that would trap a
 * fixed element.
 */
const SHEET_QUERY = '(max-width: 640px)';
const SHEET_EXIT_MS = 240;

export function useMatchMedia(query, enabled = true) {
  const [matches, setMatches] = useState(
    () => enabled && typeof window !== 'undefined' && window.matchMedia(query).matches,
  );

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const media = window.matchMedia(query);
    const handleChange = () => setMatches(media.matches);

    handleChange();
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [query, enabled]);

  return matches;
}

/*
 * A bottom sheet's presence: mounted a frame before it is shown, so it slides
 * in, and kept mounted for the slide-out after closing.
 */
function useSheetPresence(isOpen, enabled) {
  const [isMounted, setIsMounted] = useState(false);
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsMounted(false);
      setIsShown(false);
      return undefined;
    }

    if (isOpen) {
      setIsMounted(true);
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setIsShown(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    setIsShown(false);
    const timer = window.setTimeout(() => setIsMounted(false), SHEET_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [enabled, isOpen]);

  return [isMounted, isShown];
}

export function ContactMenu({ email, linkedin, telegram, onPick, sheet = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const sheetRef = useRef(null);
  const listId = useId();
  const text = useUi().nav;
  const asSheet = useMatchMedia(SHEET_QUERY, sheet);
  const [isSheetMounted, isSheetShown] = useSheetPresence(isOpen, asSheet);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (
        !rootRef.current?.contains(event.target) &&
        !sheetRef.current?.contains(event.target)
      ) {
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
        onClick={() => {
          if (!isOpen) {
            track('contact_menu_open');
          }

          setIsOpen((current) => !current);
        }}
      >
        {text.contactMe}
      </button>

      {asSheet ? null : (
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
      )}

      {asSheet && isSheetMounted
        ? createPortal(
            <div className={`contact-sheet${isSheetShown ? ' is-open' : ''}`} ref={sheetRef}>
              <button
                type="button"
                className="contact-sheet__backdrop"
                aria-label={text.closeMenu}
                tabIndex={-1}
                onClick={() => setIsOpen(false)}
              />
              <div
                className="contact-sheet__panel"
                id={listId}
                role="dialog"
                aria-modal="true"
                aria-label={text.contactMe}
              >
                <span className="contact-sheet__handle" aria-hidden="true" />
                <ul className="contact-sheet__list">
                  {options.map((option) => (
                    <li key={option.key}>
                      <a
                        className="contact-sheet__option"
                        href={option.href}
                        target={option.external ? '_blank' : undefined}
                        rel={option.external ? 'noopener noreferrer' : undefined}
                        onClick={pick}
                      >
                        {text.contactVia[option.key]}
                        <span aria-hidden="true">→</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>,
            document.body,
          )
        : null}
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
 * On a phone the burger opens a bottom sheet instead, like "contact me": the
 * sections as rows, the language switch, then every way to reach me. It is
 * rendered into <body>, since the pinned header's blur would trap a fixed
 * element.
 *
 * `siteNav={false}` keeps the plain contact row (the standalone pet tracker
 * page lives on its own domain and has no site to navigate).
 */
export function NavMenu({ contacts, email, telegram, siteNav = true, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const sheetRef = useRef(null);
  const menuId = useId();
  const text = useUi().nav;
  const path = currentPath();
  const asSheet = useMatchMedia(SHEET_QUERY);
  const [isSheetMounted, isSheetShown] = useSheetPresence(isOpen, asSheet);
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
      if (
        !rootRef.current?.contains(event.target) &&
        !sheetRef.current?.contains(event.target)
      ) {
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

  const close = () => setIsOpen(false);
  const linkedin = contacts.find((contact) => contact.label === 'LinkedIn')?.href;
  // In the sheet every way to reach me is a row of its own: the CV, then the
  // options "contact me" opens (or, without the site nav, the plain contacts).
  const sheetContacts = siteNav
    ? [
        ...pillContacts.map((contact) => ({ key: contact.label, contact, label: contact.label })),
        linkedin
          ? { key: 'linkedin', contact: { label: 'LinkedIn', href: linkedin }, label: text.contactVia.linkedin }
          : null,
        email
          ? { key: 'email', contact: { label: 'Email', href: `mailto:${email}` }, label: text.contactVia.email }
          : null,
        telegram
          ? { key: 'telegram', contact: { label: 'Telegram', href: telegram }, label: text.contactVia.telegram }
          : null,
      ].filter(Boolean)
    : visibleContacts.map((contact) => ({ key: contact.label, contact, label: contact.label }));

  return (
    <div
      className={`nav-menu${isOpen ? ' is-open' : ''}${className ? ` ${className}` : ''}`}
      ref={rootRef}
    >
      {asSheet && isSheetMounted
        ? createPortal(
            <div className={`contact-sheet nav-sheet${isSheetShown ? ' is-open' : ''}`} ref={sheetRef}>
              <button
                type="button"
                className="contact-sheet__backdrop"
                aria-label={text.closeMenu}
                tabIndex={-1}
                onClick={close}
              />
              <div
                className="contact-sheet__panel"
                id={menuId}
                role="dialog"
                aria-modal="true"
                aria-label={text.siteNav}
              >
                <span className="contact-sheet__handle" aria-hidden="true" />

                {siteNav ? (
                  <nav className="nav-sheet__sections" aria-label={text.siteNav}>
                    {SITE_LINKS.map((link) => (
                      <a
                        key={link.key}
                        className="nav-sheet__link"
                        href={link.href}
                        aria-current={link.href === path ? 'page' : undefined}
                        onClick={close}
                      >
                        {text.links[link.key]}
                        <span aria-hidden="true">→</span>
                      </a>
                    ))}
                  </nav>
                ) : null}

                <div className="nav-sheet__language">
                  <LanguageSwitch onChange={close} />
                </div>

                <ul className="contact-sheet__list" aria-label={text.contactLinks}>
                  {sheetContacts.map((item) => (
                    <li key={item.key}>
                      <ContactLink contact={item.contact} className="contact-sheet__option" onClick={close}>
                        {item.label}
                        <span aria-hidden="true">→</span>
                      </ContactLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>,
            document.body,
          )
        : null}

      <div className="nav-menu__links" id={asSheet ? undefined : menuId} hidden={asSheet || undefined}>
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
              sheet
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
