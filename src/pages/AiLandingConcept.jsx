import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ConceptHeader, CubeShape, projectFrames } from '../components/AiConcept.jsx';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { aiLandingDetails } from '../data/aiLandingDetails.js';
import { attachAiVortex } from '../lib/aiVortex.js';
import '../styles/aiConcept.css';

// How long each project stays in the middle before the next one comes up.
const CYCLE_MS = 7000;

/*
 * The AI landing, all on one screen: the work spirals out of the blue cube,
 * and the frames are the way into the cases — pointing at one names its
 * project in the middle, a click opens it. With nothing pointed at, the middle
 * goes through the projects on its own. Along the bottom, the numbers on the
 * left and the tools on the right. Opened by the main site's AI projects link
 * and, on its own, as the home of the AI subdomain (`standalone`).
 */
export function AiLandingConcept({ page, projects, caseStudies, profile, standalone = false }) {
  const canvasRef = useRef(null);
  const shapeRef = useRef(null);
  const copyRef = useRef(null);
  const footRef = useRef(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  // The middle holds still while the mouse is on a frame or on the text itself.
  const [onFrame, setOnFrame] = useState(false);
  const [onText, setOnText] = useState(false);
  const held = onFrame || onText;
  const { hero, pipeline, numbers } = page;

  activeRef.current = active;

  // Projects take turns along the arms, so one project's frames never bunch up.
  // A case shows its picked details; one without them, its own screenshots.
  const frames = useMemo(() => {
    const lists = projects.map(
      (item) =>
        aiLandingDetails[item.href] ??
        projectFrames(item, caseStudies[item.href], 5).map((src) => ({ src })),
    );
    const longest = Math.max(...lists.map((list) => list.length));
    const mixed = [];
    for (let round = 0; round < longest; round += 1) {
      lists.forEach((list, project) => {
        if (list[round]) {
          mixed.push({ ...list[round], project });
        }
      });
    }
    return mixed;
  }, [projects, caseStudies]);

  useEffect(
    () =>
      attachAiVortex(canvasRef.current, {
        frames,
        // A trial look: `?beads=square` shows rounded squares, like the cube, instead of circles.
        shape: new URLSearchParams(window.location.search).get('beads') === 'square' ? 'square' : 'circle',
        clear: shapeRef.current,
        avoid: [copyRef.current, footRef.current],
        getFocus: () => activeRef.current,
        onHover: (project) => {
          setOnFrame(project !== null);
          if (project !== null) {
            setActive(project);
          }
        },
        onPick: (project) => setActive(project),
        onSelect: (project) => window.location.assign(projects[project].href),
      }),
    [frames, projects],
  );

  // Every 7 s the middle moves on by itself, unless the mouse holds it or motion is off.
  useEffect(() => {
    if (held || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    const timer = window.setTimeout(
      () => setActive((current) => (current + 1) % projects.length),
      CYCLE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [active, held, projects.length]);

  const current = projects[active];

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
          <div
            className="ai-hero__copy"
            ref={copyRef}
            onPointerEnter={() => setOnText(true)}
            onPointerLeave={() => setOnText(false)}
            onFocus={() => setOnText(true)}
            onBlur={() => setOnText(false)}
          >
            {/* The page's title, for screen readers and search; on screen the project leads. */}
            <h1 className="visually-hidden">{hero.title}</h1>

            <div className="ai-hero__project" key={current.id} aria-live="polite">
              <h2>{current.title}</h2>
              <p className="ai-hero__description">{current.description}</p>
            </div>

            <a className="ai-pill" href={current.href}>
              View case
            </a>
          </div>
        </div>

        <div className="ai-hero__foot" ref={footRef}>
          <ul className="ai-facts" aria-label={numbers.title}>
            {numbers.items.map((item) => (
              <li key={`${item.value}-${item.label}`}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>

          <ul className="ai-tools" aria-label="Tools">
            {pipeline.tools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
