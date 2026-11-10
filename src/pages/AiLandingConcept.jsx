import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ConceptHeader, CubeShape, WorkList, projectFrames } from '../components/AiConcept.jsx';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { aiLandingDetails } from '../data/aiLandingDetails.js';
import { attachAiVortex } from '../lib/aiVortex.js';
import '../styles/aiConcept.css';

// How long each project stays in the middle before the next one comes up.
const CYCLE_MS = 7000;
// The visitor's answer to "Do you like carousels?": 'carousel' or 'list'.
const VIEW_KEY = 'vb_ai_view';

function readView() {
  try {
    const view = window.localStorage.getItem(VIEW_KEY);
    return view === 'carousel' || view === 'list' ? view : null;
  } catch {
    return null;
  }
}

function saveView(view) {
  try {
    window.localStorage.setItem(VIEW_KEY, view);
  } catch {
    // Without storage the page simply asks again next time.
  }
}

/*
 * The AI landing, all on one screen. A first visit is asked whether it likes
 * carousels. Yes: the work spirals out of the blue cube, and the frames are
 * the way into the cases — pointing at one names its project in the middle,
 * a click opens it; with nothing pointed at, the middle goes through the
 * projects on its own. No: the cases as a plain list. The answer is kept, and
 * a switch at the top stops the carousel or sets it going again. Along the
 * bottom, the numbers on the left and the tools on the right. Opened by the
 * main site's AI projects link and, on its own, as the home of the AI
 * subdomain (`standalone`).
 */
export function AiLandingConcept({ page, projects, caseStudies, profile, standalone = false }) {
  const canvasRef = useRef(null);
  const shapeRef = useRef(null);
  const copyRef = useRef(null);
  const footRef = useRef(null);
  const activeRef = useRef(0);
  const [view, setView] = useState(readView);
  const [active, setActive] = useState(0);
  // The middle holds still while the mouse is on a frame or on the text itself.
  const [onFrame, setOnFrame] = useState(false);
  const [onText, setOnText] = useState(false);
  const held = onFrame || onText;
  const carousel = view === 'carousel';
  const { hero, pipeline, numbers } = page;

  activeRef.current = active;

  function choose(next) {
    saveView(next);
    setOnFrame(false);
    setOnText(false);
    setView(next);
  }

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

  useEffect(() => {
    if (!carousel) {
      return undefined;
    }
    return attachAiVortex(canvasRef.current, {
      frames,
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
    });
  }, [carousel, frames, projects]);

  // Every 7 s the middle moves on by itself, unless the mouse holds it or motion is off.
  useEffect(() => {
    if (!carousel || held || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    const timer = window.setTimeout(
      () => setActive((current) => (current + 1) % projects.length),
      CYCLE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [carousel, active, held, projects.length]);

  const current = projects[active];

  return (
    <div className={`ai-concept ai-concept--landing ai-concept--${view ?? 'ask'}`}>
      <section className="ai-hero">
        {carousel ? <canvas className="ai-hero__vortex" ref={canvasRef} aria-hidden="true" /> : null}
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

        {/* The page's title, for screen readers and search; on screen the work leads. */}
        <h1 className="visually-hidden">{hero.title}</h1>

        {view ? (
          <button
            type="button"
            className="ai-switch"
            role="switch"
            aria-checked={!carousel}
            onClick={() => choose(carousel ? 'list' : 'carousel')}
          >
            <span className="ai-switch__track" aria-hidden="true">
              <span className="ai-switch__knob" />
            </span>
            Stop the carousel
          </button>
        ) : null}

        {view === 'list' ? (
          <WorkList items={projects} />
        ) : (
          <div className="ai-hero__center">
            <CubeShape shapeRef={shapeRef} className="ai-hero__shape" />
            {carousel ? (
              <div
                className="ai-hero__copy"
                ref={copyRef}
                onPointerEnter={() => setOnText(true)}
                onPointerLeave={() => setOnText(false)}
                onFocus={() => setOnText(true)}
                onBlur={() => setOnText(false)}
              >
                <div className="ai-hero__project" key={current.id} aria-live="polite">
                  <h2>{current.title}</h2>
                  <p className="ai-hero__description">{current.description}</p>
                </div>

                <a className="ai-pill" href={current.href}>
                  View case
                </a>
              </div>
            ) : (
              <div className="ai-hero__copy">
                <div className="ai-hero__project">
                  <h2>Do you like carousels?</h2>
                  <p className="ai-hero__description">
                    Yes, and the cases spin around the cube. No, and they line up as a list.
                  </p>
                </div>
                <div className="ai-hero__answers">
                  <button type="button" className="ai-pill" onClick={() => choose('carousel')}>
                    Yes
                  </button>
                  <button type="button" className="ai-pill ai-pill--ghost" onClick={() => choose('list')}>
                    No
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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
