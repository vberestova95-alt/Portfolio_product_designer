import React from 'react';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { useUi } from '../i18n/LanguageContext.jsx';

/* What the site collects and why, set in the same ruled rows as the experience page. */
export function PrivacyPage({ profile }) {
  const text = useUi().privacyPage;

  return (
    <div className="case-page concept-page experience-page privacy-page">
      <div className="case-page__shell">
        <SiteHeader profile={profile} />

        <section className="concept-hero">
          <h1>{text.title}</h1>
          <p className="concept-hero__description">{text.description}</p>
        </section>

        <section className="section experience-section">
          <div className="experience-table">
            {text.sections.map((section) => (
              <article key={section.title} className="experience-row" data-reveal>
                <div className="experience-row__title">
                  <h3>{section.title}</h3>
                </div>

                <div className="experience-row__body">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.items ? (
                    <ul className="privacy-page__list">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {section.link ? (
                    <a className="experience-contacts__link" href={section.link.href}>
                      {section.link.label}
                    </a>
                  ) : null}
                  {section.showEmail ? (
                    <a className="experience-contacts__link" href={`mailto:${profile.email}`}>
                      {profile.email}
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
          <p className="privacy-page__updated">{text.updated}</p>
        </section>
      </div>

      <SiteFooter profile={profile} />
    </div>
  );
}
