import React, { useEffect, useRef } from 'react';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { WorkCard } from '../components/WorkCard.jsx';
import { attachWorkStack } from '../lib/workStack.js';

/*
 * The page behind the blue practice card on the home page: projects I built
 * end to end with AI tools. Same intro as the concept archive, same card stack
 * as the home page's selected work, so it reads as part of the site rather
 * than a separate gallery.
 */
export function AiProjectsPage({ archive, profile }) {
  const stackRef = useRef(null);
  const { intro, items } = archive;

  useEffect(() => attachWorkStack(stackRef.current), []);

  return (
    <div className="case-page concept-page ai-projects-page">
      <div className="case-page__shell">
        {profile ? <SiteHeader profile={profile} /> : null}

        <section className="concept-hero">
          <p className="case-eyebrow">{intro.eyebrow}</p>
          <h1>{intro.title}</h1>
          <p className="concept-hero__description">{intro.description}</p>

          <div className="concept-hero__footer">
            <span>{intro.meta}</span>
          </div>
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
