import React, { useEffect, useRef } from 'react';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { WorkCard } from '../components/WorkCard.jsx';
import { useUi } from '../i18n/LanguageContext.jsx';
import { attachWorkStack } from '../lib/workStack.js';

/*
 * The page behind the blue practice card on the home page: projects I built
 * end to end with AI tools. Same intro as the concept archive, same card stack
 * as the home page's selected work, so it reads as part of the site rather
 * than a separate gallery.
 */
export function AiProjectsPage({ archive, profile }) {
  const text = useUi().case;
  const stackRef = useRef(null);
  const { intro, items } = archive;

  useEffect(() => attachWorkStack(stackRef.current), []);

  return (
    <div className="case-page concept-page ai-projects-page">
      <div className="case-page__shell">
        {profile ? <SiteHeader profile={profile} /> : null}

        <section className="concept-hero">
          {/* The card that leads here is on the home page; going back returns to it. */}
          <a className="case-back-link concept-hero__back" href="/">
            <span aria-hidden="true">←</span>
            <span>{text.back}</span>
          </a>
          <h1>{intro.title}</h1>
          <p className="concept-hero__description">{intro.description}</p>
        </section>

        <div className="work-stack" ref={stackRef}>
          {items.map((item, index) => (
            <WorkCard key={item.id} item={item} index={index} total={items.length} />
          ))}
        </div>
      </div>

      {profile ? <SiteFooter profile={profile} /> : null}
    </div>
  );
}
