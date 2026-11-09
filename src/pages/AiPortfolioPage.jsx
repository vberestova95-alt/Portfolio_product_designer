import React, { useEffect, useRef } from 'react';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { WorkCard } from '../components/WorkCard.jsx';
import { useUi } from '../i18n/LanguageContext.jsx';
import { PLAIN_TONES, attachHeroMosaic } from '../lib/heroMosaic.js';
import { attachWorkStack } from '../lib/workStack.js';
import '../styles/aiPortfolio.css';

/*
 * The AI portfolio landing: one link to send out, four short blocks — the
 * intro on the site's plain cubes, how I run AI agents, the numbers, and the
 * work. The cards are read straight from the portfolio data, so a case added
 * there shows up here too. `standalone` is the AI subdomain build, where this
 * page is the home: no way back, no links to the rest of the site.
 */
function SectionHeader({ title, lead }) {
  return (
    <header className="section-header section-header--no-label" data-reveal>
      <div className="section-header__content">
        <h2>{title}</h2>
        {lead ? <p>{lead}</p> : null}
      </div>
    </header>
  );
}

function WorkGroup({ group, items }) {
  const stackRef = useRef(null);

  useEffect(() => attachWorkStack(stackRef.current), []);

  return (
    <div className="ai-work__group">
      <header className="ai-work__group-header" data-reveal>
        <h3>{group.title}</h3>
        <p>{group.lead}</p>
      </header>

      <div className="work-stack" ref={stackRef}>
        {items.map((item, index) => (
          <WorkCard key={item.id} item={item} index={index} total={items.length} />
        ))}
      </div>
    </div>
  );
}

export function AiPortfolioPage({ page, aiWork, productWork, profile, standalone = false }) {
  const text = useUi().case;
  const mosaicRef = useRef(null);
  const titleRef = useRef(null);
  const topRef = useRef(null);
  const { hero, pipeline, numbers, cases } = page;

  // A product built with AI already sits in the first group; it is not listed twice.
  const aiHrefs = new Set(aiWork.map((item) => item.href));
  const itemsByGroup = {
    ai: aiWork,
    product: productWork.filter((item) => !aiHrefs.has(item.href)),
  };

  useEffect(
    () =>
      // The same plain cubes as the AI projects intro: no photos, no letters.
      attachHeroMosaic(mosaicRef.current, {
        maxBoards: 0,
        tones: PLAIN_TONES,
        anchor: titleRef.current,
        header: topRef.current,
      }),
    [],
  );

  return (
    <div className="case-page concept-page ai-portfolio-page">
      <div className="case-page__shell">
        {profile ? <SiteHeader profile={profile} showReturnHome={!standalone} /> : null}

        <section className="concept-hero concept-hero--mosaic ai-portfolio-hero">
          <canvas className="hero-mosaic" ref={mosaicRef} aria-hidden="true" />

          <div className="ai-portfolio-hero__top" ref={topRef}>
            {standalone ? null : (
              <a className="case-back-link concept-hero__back" href="/">
                <span aria-hidden="true">←</span>
                <span>{text.allWork}</span>
              </a>
            )}
            <p className="ai-portfolio-hero__eyebrow">{hero.eyebrow}</p>
          </div>

          <div className="concept-hero__copy">
            <h1 ref={titleRef}>{hero.title}</h1>
            <p className="concept-hero__description">{hero.description}</p>
          </div>
        </section>

        <section className="section ai-pipeline" aria-label={pipeline.title}>
          <SectionHeader title={pipeline.title} lead={pipeline.lead} />

          <ol className="ai-pipeline__steps" data-reveal>
            {pipeline.steps.map((step, index) => (
              <li key={step.title} className="ai-pipeline__step">
                <span className="ai-pipeline__index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>

          <ul className="ai-pipeline__tools" aria-label="Tools" data-reveal>
            {pipeline.tools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </section>

        <section className="section ai-numbers" aria-labelledby="ai-numbers-title" data-reveal>
          <h2 id="ai-numbers-title" className="ai-numbers__title">
            {numbers.title}
          </h2>

          {numbers.groups.map((group) => (
            <div key={group.label} className="ai-numbers__group">
              <p className="ai-numbers__label">{group.label}</p>
              {/* The case hero's metric plates; `source` is a note for us, not shown. */}
              <div className="case-stat-grid case-stat-grid--hero ai-numbers__grid">
                {group.items.map((item) => (
                  <div key={`${item.value}-${item.label}`} className="case-stat-card">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="section ai-work" aria-label={cases.title}>
          <SectionHeader title={cases.title} lead={cases.lead} />

          {cases.groups.map((group) => (
            <WorkGroup key={group.id} group={group} items={itemsByGroup[group.id] ?? []} />
          ))}
        </section>
      </div>

      {profile ? <SiteFooter profile={profile} /> : null}
    </div>
  );
}
