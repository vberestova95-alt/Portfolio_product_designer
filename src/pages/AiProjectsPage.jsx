import React, { useEffect, useRef } from 'react';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { WorkCard } from '../components/WorkCard.jsx';
import { useUi } from '../i18n/LanguageContext.jsx';
import { PLAIN_TONES, attachHeroMosaic } from '../lib/heroMosaic.js';
import { attachWorkStack } from '../lib/workStack.js';

/*
 * The page behind the blue practice card on the home page: projects I built
 * end to end with AI tools. Same intro as the concept archive, same card stack
 * as the home page's selected work, so it reads as part of the site rather
 * than a separate gallery. The intro is set on the home hero's squares — plain
 * grey cubes here, with no photos — so the page opens the way the site does.
 */
export function AiProjectsPage({ archive, profile }) {
  const text = useUi().case;
  const stackRef = useRef(null);
  const mosaicRef = useRef(null);
  const titleRef = useRef(null);
  const backRef = useRef(null);
  const { intro, items } = archive;

  useEffect(() => attachWorkStack(stackRef.current), []);
  useEffect(
    () =>
      // Plain cubes here, no photos and no letters: one face a grey that
      // almost sinks into the ground, the other a tone up.
      attachHeroMosaic(mosaicRef.current, {
        maxBoards: 0,
        tones: PLAIN_TONES,
        anchor: titleRef.current,
        // The row behind the back link stays empty, as the nav's does at home.
        header: backRef.current,
      }),
    [],
  );

  return (
    <div className="case-page concept-page ai-projects-page">
      <div className="case-page__shell">
        {profile ? <SiteHeader profile={profile} /> : null}

        <section className="concept-hero concept-hero--mosaic">
          <canvas className="hero-mosaic" ref={mosaicRef} aria-hidden="true" />

          {/* The card that leads here is on the home page; going back returns to it. */}
          <a className="case-back-link concept-hero__back" href="/" ref={backRef}>
            <span aria-hidden="true">←</span>
            <span>{text.back}</span>
          </a>

          <div className="concept-hero__copy">
            <h1 ref={titleRef}>{intro.title}</h1>
            <p className="concept-hero__description">{intro.description}</p>
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
