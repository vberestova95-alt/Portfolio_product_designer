import React, { useEffect, useMemo, useRef } from 'react';
import {
  ConceptFooter,
  ConceptHeader,
  CubeShape,
  WorkIndex,
  projectFrames,
} from '../components/AiConcept.jsx';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { attachAiVortex } from '../lib/aiVortex.js';
import '../styles/aiConcept.css';

/*
 * The AI landing: the work spirals out of the blue cube on the first screen;
 * then how I run agents, the numbers, and the numbered index of the work on
 * black. Opened by the main site's AI projects link and, on its own, as the
 * home of the AI subdomain (`standalone`).
 */
export function AiLandingConcept({ page, projects, caseStudies, profile, standalone = false }) {
  const canvasRef = useRef(null);
  const shapeRef = useRef(null);
  const copyRef = useRef(null);
  const { hero, pipeline, numbers, cases } = page;

  const images = useMemo(
    () => projects.flatMap((item) => projectFrames(item, caseStudies[item.href], 5)),
    [projects, caseStudies],
  );

  useEffect(
    () =>
      attachAiVortex(canvasRef.current, {
        images,
        clear: shapeRef.current,
        avoid: [copyRef.current],
      }),
    [images],
  );

  return (
    <div className="ai-concept ai-concept--landing">
      <section className="ai-hero">
        <canvas className="ai-hero__vortex" ref={canvasRef} aria-hidden="true" />
        {/* Reached from the main site, the page keeps the site's own header;
            on the subdomain it is the home, with a header of its own. */}
        {standalone ? (
          <ConceptHeader profile={profile} />
        ) : (
          <div className="ai-topbar">
            <div className="case-page__shell">
              <SiteHeader profile={profile} />
            </div>
          </div>
        )}

        <div className="ai-hero__center">
          <CubeShape shapeRef={shapeRef} className="ai-hero__shape" />
          <div className="ai-hero__copy" ref={copyRef}>
            <p className="ai-hero__eyebrow">{hero.eyebrow}</p>
            <h1>
              {hero.title} <span>{hero.short}</span>
            </h1>
            <a className="ai-pill" href="#work">
              See the work
            </a>
          </div>
        </div>

        <p className="ai-hero__foot" aria-hidden="true">
          <span>Scroll</span>
          <span>{String(projects.length).padStart(3, '0')} projects</span>
        </p>
      </section>

      <section className="ai-manifesto" id="how" aria-labelledby="ai-how">
        <p className="ai-label" id="ai-how">
          {pipeline.title}
        </p>
        <p className="ai-manifesto__lead" data-reveal>
          {pipeline.lead}
        </p>

        <ol className="ai-steps">
          {pipeline.steps.map((step, index) => (
            <li key={step.title} className="ai-step" data-reveal>
              <span className="ai-step__index">{String(index + 1).padStart(2, '0')}</span>
              <h2 className="ai-step__title">{step.title}</h2>
              <p className="ai-step__text">{step.text}</p>
            </li>
          ))}
        </ol>

        <ul className="ai-tools" aria-label="Tools">
          {pipeline.tools.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>
      </section>

      <section className="ai-dark" id="work">
        <div className="ai-numbers" aria-labelledby="ai-numbers-title">
          <p className="ai-label" id="ai-numbers-title">
            {numbers.title}
          </p>
          <ul className="ai-numbers__row">
            {numbers.items.map((item) => (
              <li key={`${item.value}-${item.label}`} data-reveal>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="ai-work" aria-labelledby="ai-work-title">
          <header className="ai-work__head">
            <p className="ai-label" id="ai-work-title">
              {cases.title}
            </p>
            <p className="ai-work__lead">{cases.lead}</p>
          </header>

          <WorkIndex items={projects} />
        </div>

        <ConceptFooter profile={profile} />
      </section>
    </div>
  );
}
