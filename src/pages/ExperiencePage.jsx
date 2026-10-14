import React from 'react';
import { ContactLink } from '../components/ContactLink.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { useUi } from '../i18n/LanguageContext.jsx';

/*
 * "Experience" in the header: the work history from the home page, followed by
 * every way to reach me, set in the same ruled rows so the two read as one list.
 */
export function ExperiencePage({ experiences, profile }) {
  const text = useUi().experiencePage;

  return (
    <div className="case-page concept-page experience-page">
      <div className="case-page__shell">
        <SiteHeader profile={profile} />

        <section className="concept-hero">
          <h1>{text.title}</h1>
          <p className="concept-hero__description">{text.description}</p>
        </section>

        <section className="section experience-section">
          <div className="experience-table">
            {experiences.map((item) => (
              <article key={item.id} className="experience-row" data-reveal>
                <div className="experience-row__title">
                  <h3>{item.company}</h3>
                  <p>
                    {item.role}
                    <span className="experience-row__period">{item.period}</span>
                  </p>
                </div>

                <div className="experience-row__body">
                  <p>{item.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section experience-section experience-contacts">
          <h2 className="experience-contacts__title">{text.contactsTitle}</h2>

          <div className="experience-table">
            <article className="experience-row" data-reveal>
              <div className="experience-row__title">
                <h3>{text.emailLabel}</h3>
              </div>
              <div className="experience-row__body">
                <a className="experience-contacts__link" href={`mailto:${profile.email}`}>
                  {profile.email}
                </a>
              </div>
            </article>

            {profile.contacts.map((contact) => (
              <article key={contact.label} className="experience-row" data-reveal>
                <div className="experience-row__title">
                  <h3>{contact.label}</h3>
                </div>
                <div className="experience-row__body">
                  <ContactLink contact={contact} className="experience-contacts__link">
                    {text.contactLinks[contact.label]}
                  </ContactLink>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <SiteFooter profile={profile} />
    </div>
  );
}
