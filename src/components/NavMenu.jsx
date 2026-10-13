import React, { useEffect, useId, useRef, useState } from 'react';
import { useLanguage, useUi } from '../i18n/LanguageContext.jsx';
import { LANGUAGES } from '../i18n/language.js';
import { ContactLink } from './ContactLink.jsx';

/*
 * Two-state segmented switch. It sits at the end of the contact links, so on a
 * phone it travels into the burger panel with them instead of crowding the row.
 */
function LanguageSwitch({ onChange }) {
  const { lang, setLang } = useLanguage();
  const text = useUi().nav;

  return (
    <div className="lang-switch" role="group" aria-label={text.language}>
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          className={`lang-switch__option${code === lang ? ' is-active' : ''}`}
          aria-pressed={code === lang}
          lang={code}
          onClick={() => {
            setLang(code);
            onChange?.();
          }}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/*
 * Contact links for the top row. Above the mobile breakpoint they sit inline as
 * pills; below it they collapse behind a burger, so the row can keep the logo
 * and the toggle on one line instead of stacking into two.
 */
export function NavMenu({ contacts, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();
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

  return (
    <div
      className={`nav-menu${isOpen ? ' is-open' : ''}${className ? ` ${className}` : ''}`}
      ref={rootRef}
    >
      <nav className="nav-menu__links" id={menuId} aria-label={text.contactLinks}>
        {contacts.map((contact) => (
          <ContactLink
            key={contact.label}
            contact={contact}
            className="contact-link"
            onClick={() => setIsOpen(false)}
          />
        ))}
        <LanguageSwitch onChange={() => setIsOpen(false)} />
      </nav>

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
