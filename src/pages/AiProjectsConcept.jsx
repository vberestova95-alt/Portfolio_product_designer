import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ConceptFooter,
  ConceptHeader,
  FluidShape,
  WorkIndex,
  projectFrames,
} from '../components/AiConcept.jsx';
import { attachAiOrbit } from '../lib/aiOrbit.js';
import '../styles/aiConcept.css';

/*
 * The AI projects page, concept version: on black, frames from every project
 * turn slowly in a ring around the fluid shape. Pointing at a frame stops the
 * ring, dims the other projects and names this one in the middle; a click
 * opens its case. The numbered index below is the same as on the landing.
 */
export function AiProjectsConcept({ intro, projects, caseStudies, profile, standalone = false }) {
  const stageRef = useRef(null);
  const [active, setActive] = useState(null);

  // Projects take turns around the ring, so one project's frames never bunch up.
  const frames = useMemo(() => {
    const lists = projects.map((item) => projectFrames(item, caseStudies[item.href], 3));
    const longest = Math.max(...lists.map((list) => list.length));
    const ring = [];
    for (let round = 0; round < longest; round += 1) {
      lists.forEach((list, project) => {
        if (list[round]) {
          ring.push({ src: list[round], project });
        }
      });
    }
    return ring;
  }, [projects, caseStudies]);

  useEffect(() => attachAiOrbit(stageRef.current, { onActive: setActive }), [frames]);

  const current = active === null ? null : projects[active];

  return (
    <div className="ai-concept ai-concept--projects">
      <section className="ai-ring">
        <ConceptHeader profile={profile} current="projects" standalone={standalone} tone="dark" />

        <div className="ai-ring__stage" ref={stageRef}>
          {frames.map((frame, index) => {
            const item = projects[frame.project];
            return (
              <a
                key={`${frame.src}-${index}`}
                className="ai-ring__frame"
                href={item.href}
                data-orbit-item=""
                data-project={frame.project}
                aria-label={item.title}
                // Each project is reachable once by keyboard; the rest are pictures.
                tabIndex={frames.findIndex((f) => f.project === frame.project) === index ? 0 : -1}
              >
                <img src={frame.src} alt="" loading="lazy" decoding="async" />
              </a>
            );
          })}

          <div className="ai-ring__center" aria-live="polite">
            <FluidShape className="ai-ring__shape" />
            <p className={`ai-ring__caption${current ? ' is-on' : ''}`}>
              {current ? (
                <>
                  <span className="ai-ring__title">{current.title}</span>
                  <span className="ai-ring__category">{current.category}</span>
                </>
              ) : null}
            </p>
          </div>
        </div>

        <p className="ai-ring__hint" aria-hidden="true">
          Every frame opens its project
        </p>
      </section>

      <section className="ai-dark ai-dark--flush">
        <div className="ai-work">
          <header className="ai-work__head">
            <p className="ai-label">{intro.eyebrow}</p>
            <h1 className="ai-work__statement">{intro.title}</h1>
            <p className="ai-work__lead">{intro.description}</p>
          </header>

          <WorkIndex items={projects} />
        </div>

        <ConceptFooter profile={profile} />
      </section>
    </div>
  );
}
