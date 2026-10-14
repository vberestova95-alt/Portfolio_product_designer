import React, { useEffect, useRef, useState } from 'react';
/*
 * One object carries the whole site: the hero, the practice card and the
 * footer all render this same knot, at different scales and orientations. The
 * hero used to run a bubble clip instead, which read as a separate visual
 * language — the two files are still in assets/ if that direction comes back.
 */
import editorialObject from '../assets/editorial-object.webp';
import logoClaudeCode from '../assets/ai-logos/claude-code.svg';
import logoCodex from '../assets/ai-logos/codex.svg';
import logoFigma from '../assets/ai-logos/figma.svg';
import logoLuma from '../assets/ai-logos/luma.svg';
import logoMidjourney from '../assets/ai-logos/midjourney.svg';
import logoRecraft from '../assets/ai-logos/recraft.svg';
import { BrandLogo } from '../components/BrandLogo.jsx';
import { CubePool } from '../components/CubePool.jsx';
import { NavMenu } from '../components/NavMenu.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { WorkCard } from '../components/WorkCard.jsx';
import { useLanguage, useUi } from '../i18n/LanguageContext.jsx';
import { attachHeroObject } from '../lib/heroObject.js';
import { attachLogoPool } from '../lib/logoPool.js';
import { SHOW_OBJECT_GRAPHICS } from '../lib/siteGraphics.js';
import { attachShotTrail } from '../lib/shotTrail.js';
import { attachWorkStack } from '../lib/workStack.js';

// Keep the section in code, but hidden until the copy is rewritten.
const SHOW_ACHIEVEMENTS_SECTION = false;

// Client logo band under the hero copy. Assets, data and styles are all still
// in place — flip this back to true to bring the row back.
const SHOW_CLIENT_LOGOS = false;

/*
 * The brand is already on the page it links to, so a plain navigation to "/" is
 * not guaranteed to do anything visible. Reloading is the explicit behaviour —
 * it puts the hero back at the top and restarts the reveal pass. Modified
 * clicks are left alone so the link still opens in a new tab.
 */
function handleBrandClick(event) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
    return;
  }

  event.preventDefault();
  window.location.reload();
}

/*
 * Without the eyebrow the content would be auto-placed into the label's own
 * column, so the modifier collapses the header to one full-width column and the
 * heading starts flush left, on the same line as whatever follows it.
 */
function SectionHeader({ label, title, description }) {
  return (
    <header className={`section-header${label ? '' : ' section-header--no-label'}`} data-reveal>
      {label ? <p className="section-label">{label}</p> : null}
      <div className="section-header__content">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
    </header>
  );
}

/*
 * The headline is set line by line, so each language gets its own breaks: one
 * set for the wide two-line layout, one for the phone's three lines.
 */
function HeroTitle() {
  const { lang } = useLanguage();

  if (lang === 'ru') {
    return (
      <h1>
        Продуктовый
        <br className="hero-br--mobile" /> <span className="serif-accent">дизайнер</span>
        <br className="hero-br--desktop" /> сложных
        <br className="hero-br--mobile" /> цифровых систем
      </h1>
    );
  }

  return (
    <h1>
      Product <span className="serif-accent">Designer</span>
      <br className="hero-br--mobile" /> for
      <br className="hero-br--desktop" /> complex
      <br className="hero-br--mobile" /> digital systems
    </h1>
  );
}

/*
 * The blue practice card. Its floor is a pool of logo cubes that tumble in as
 * the card scrolls into view and can be pushed around with the pointer — see
 * lib/logoPool.js. Six carry the AI tools' logos, one says "Projects", the rest
 * are blank tiles.
 *
 * The whole card links to the AI projects page, like the concept teaser beside
 * it. A click that lands on a cube is play, not navigation — the cube gets its
 * kick and the page stays put. The footer is the pile's floor, so the link
 * label is never buried under cubes.
 *
 * Kick every cube out through the top and the card says so, with a way to
 * bring them back.
 */
// The tools behind the AI projects (icons: LobeHub Icons, MIT). The rest of
// the fourteen stay blank tiles.
const AI_TOOL_LOGOS = [
  logoClaudeCode,
  logoCodex,
  logoRecraft,
  logoFigma,
  logoMidjourney,
  logoLuma,
];
const LOGO_CUBES = Array.from({ length: 14 }, (_, index) => ({
  id: `cube-${index}`,
  logo: AI_TOOL_LOGOS[index] ?? null,
}));
const AI_PROJECTS_HREF = '/ai-projects';
// One cube in the pile carries the word "Projects", upright so it stays readable.
const PROJECTS_CUBE = AI_TOOL_LOGOS.length;

function isOnCube(pool, event) {
  if (!pool) {
    return false;
  }

  // A little slack around each cube, so a near miss while playing does not
  // whisk the visitor off the page.
  const slack = 12;

  return Array.from(pool.querySelectorAll('[data-cube]:not(.is-gone)')).some((cube) => {
    const rect = cube.getBoundingClientRect();

    return (
      event.clientX >= rect.left - slack &&
      event.clientX <= rect.right + slack &&
      event.clientY >= rect.top - slack &&
      event.clientY <= rect.bottom + slack
    );
  });
}

function PracticeCard() {
  const text = useUi().home;
  const cardRef = useRef(null);
  const poolRef = useRef(null);
  const pressedCubeRef = useRef(false);
  const [isCleared, setIsCleared] = useState(false);

  useEffect(() => attachLogoPool(poolRef.current), []);

  useEffect(() => {
    const card = cardRef.current;
    const handleCleared = () => setIsCleared(true);

    card?.addEventListener('logopool:cleared', handleCleared);
    return () => card?.removeEventListener('logopool:cleared', handleCleared);
  }, []);

  const handleRestore = () => {
    setIsCleared(false);
    cardRef.current?.dispatchEvent(new CustomEvent('logopool:restore'));
  };

  /*
   * Checked on press, not on click: the kick sends the cube flying, so by the
   * time the click arrives it is no longer under the pointer. The tiles only
   * move on the next frame, so at this point they are still where they were.
   */
  const handleHitPointerDown = (event) => {
    pressedCubeRef.current = isOnCube(poolRef.current, event);
  };

  const handleHitClick = (event) => {
    // Keyboard activation (detail 0) has no press — always follow the link.
    if (event.detail !== 0 && pressedCubeRef.current) {
      event.preventDefault();
    }

    pressedCubeRef.current = false;
  };

  return (
    <article
      ref={cardRef}
      className="editorial-card editorial-card--blue editorial-card--practice"
      data-reveal
    >
      <a
        className="practice-card__hit"
        href={AI_PROJECTS_HREF}
        onPointerDown={handleHitPointerDown}
        onClick={handleHitClick}
      >
        <span className="visually-hidden">{text.practiceLink}</span>
      </a>

      <h3 className="editorial-card__title" data-pool-ceiling>
        {text.practiceTitle.start}{' '}
        <span className="serif-accent">{text.practiceTitle.accent}</span>
        {text.practiceTitle.end}
      </h3>

      <div className="logo-pool" ref={poolRef} aria-hidden="true">
        {LOGO_CUBES.map((cube, index) =>
          index === PROJECTS_CUBE ? (
            <span key={cube.id} className="logo-cube logo-cube--label" data-cube data-upright>
              Projects
            </span>
          ) : (
            <span
              key={cube.id}
              className="logo-cube"
              data-cube
              // Logos land the right way up, like the photos and labels.
              data-upright={cube.logo ? '' : undefined}
            >
              {cube.logo ? <img src={cube.logo} alt="" draggable={false} /> : null}
            </span>
          ),
        )}
      </div>

      {isCleared ? (
        <div className="practice-card__cleared" role="status">
          <p className="practice-card__cleared-title serif-accent">{text.practiceCleared.title}</p>
          <p className="practice-card__cleared-copy">{text.practiceCleared.copy}</p>
          <button type="button" className="practice-card__restore" onClick={handleRestore}>
            {text.practiceCleared.restore}
          </button>
        </div>
      ) : null}

      {/* Visual only — the whole card is already the link (practice-card__hit). */}
      <div className="practice-card__footer" data-pool-floor aria-hidden="true">
        <span className="practice-card__cta">
          {text.practiceLink}
          <span>→</span>
        </span>
      </div>
    </article>
  );
}

/*
 * A few of the same cubes in the hero, resting on the divider above the intro
 * row ([data-pool-floor] on .hero-panel__intro). Each round four of the five
 * carry film photos from the photo hobby, the fifth says "About me", all dealt at random from assets/film
 * (square 360px crops); clear them all and a button deals a new round.
 */
const FILM_PHOTO_FILES = import.meta.glob('../assets/film/*.jpg', {
  eager: true,
  import: 'default',
});
const FILM_PHOTOS = Object.values(FILM_PHOTO_FILES);
// Photos of me (files named me-*): every round shows at least two of them.
const FILM_PHOTOS_OF_ME = Object.entries(FILM_PHOTO_FILES)
  .filter(([path]) => /\/me-[^/]+$/.test(path))
  .map(([, src]) => src);

function heroCubeSize(width) {
  // Near desktop size on a phone too, with a cube's worth of slack left in the
  // row so all five settle side by side rather than one perched on another.
  if (width <= 640) {
    return Math.min(72, width / 6);
  }

  return Math.min(88, Math.max(64, width * 0.055));
}

function ConceptTeaser({ teaser }) {
  const trailRef = useRef(null);

  useEffect(() => attachShotTrail(trailRef.current), []);

  return (
    <article className="editorial-card concept-teaser" ref={trailRef} data-reveal>
      <a className="concept-teaser__hit" href={teaser.href}>
        <span className="visually-hidden">{teaser.linkLabel}</span>
      </a>

      <div className="concept-teaser__shots" aria-hidden="true">
        {teaser.shots.map((shot) => (
          <div key={shot.src} className="concept-shot" data-shot>
            {/* The frame carries the reveal so the wrapper is free for the
                pointer lean — one transform each, no fighting. */}
            <span className="concept-shot__frame">
              <img src={shot.src} alt="" loading="lazy" />
            </span>
          </div>
        ))}
      </div>

      <div className="concept-teaser__copy">
        <h3 className="editorial-card__title">{teaser.title}</h3>
        <p className="editorial-card__copy">{teaser.description}</p>
      </div>

      <div className="concept-teaser__footer">
        <span className="concept-teaser__cta">
          {teaser.linkLabel}
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </article>
  );
}

export function HomePage({
  profile,
  cases,
  clients,
  designConceptTeaser,
  achievements,
  experiences,
}) {
  const text = useUi().home;
  const heroRef = useRef(null);
  const objectRef = useRef(null);
  const stackRef = useRef(null);

  useEffect(() => attachHeroObject(heroRef.current, objectRef.current), []);
  useEffect(() => attachWorkStack(stackRef.current), []);

  return (
    <div className="home-page">
      <section className="hero-shell">
        <div className="home-shell hero-panel" ref={heroRef}>
          <div className="hero-panel__top" data-pool-ceiling>
            <a className="hero-panel__brand" href="/" onClick={handleBrandClick}>
              <BrandLogo name={profile.name} />
            </a>
            <NavMenu contacts={profile.contacts} />
          </div>

          {/*
            * Editorial composition: a ruled row of small copy — the two summary
            * lines, with the cubes (film photos among them) resting on its
            * rule — and the headline set large on the panel floor. The headline still comes first in the document;
            * the grid areas move it under the row.
            */}
          <div className="hero-panel__grid">
            <HeroTitle />

            <div className="hero-panel__intro" data-pool-floor>
              {profile.summary.map((paragraph) => (
                <p key={paragraph} className="hero-panel__lead">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <CubePool
            count={5}
            cubeSize={heroCubeSize}
            className="hero-panel__cubes"
            photos={FILM_PHOTOS}
            photoCount={4}
            featured={FILM_PHOTOS_OF_ME}
            featuredCount={2}
            labels={['About me']}
            restoreLabel={text.practiceCleared.restore}
          />

          {SHOW_OBJECT_GRAPHICS ? (
            <div className="hero-panel__object" aria-hidden="true">
              <img ref={objectRef} src={editorialObject} alt="" />
            </div>
          ) : null}

          {SHOW_CLIENT_LOGOS ? (
            <div className="hero-panel__footer">
              <ul className="hero-clients" aria-label={text.clientsLabel}>
                {clients.map((client) => (
                  <li key={client.name} className="hero-client">
                    <img
                      src={client.logo}
                      alt={client.name}
                      style={{
                        '--logo-h': `${client.height}px`,
                        '--logo-y': `${client.nudge}px`,
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section className="section home-shell" id="work">
        <div className="work-stack" ref={stackRef}>
          {cases.map((item, index) => (
            <WorkCard key={item.id} item={item} index={index} total={cases.length} />
          ))}
        </div>
      </section>

      <section className="section home-shell practice-section">
        <div className="two-column-section">
          <ConceptTeaser teaser={designConceptTeaser} />

          <PracticeCard />
        </div>
      </section>

      {SHOW_ACHIEVEMENTS_SECTION ? (
        <section className="section home-shell">
          <SectionHeader label={text.achievementsLabel} title={text.achievementsTitle} />

          <div className="achievement-grid">
            {achievements.map((item, index) => (
              <article key={item} className="achievement-card" data-reveal>
                <span className="achievement-card__index">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section home-shell experience-section">
        <SectionHeader title={text.experienceTitle} />

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

      <SiteFooter profile={profile} />
    </div>
  );
}
