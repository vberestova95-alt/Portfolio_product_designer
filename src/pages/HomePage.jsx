import React, { useEffect, useRef, useState } from 'react';
/*
 * One object carries the whole site: the hero, the practice card and the
 * footer all render this same knot, at different scales and orientations. The
 * hero used to run a bubble clip instead, which read as a separate visual
 * language — the two files are still in assets/ if that direction comes back.
 */
import editorialObject from '../assets/editorial-object.webp';
import logoChatGpt from '../assets/ai-logos/chatgpt.svg';
import logoClaude from '../assets/ai-logos/claude.svg';
import logoCodex from '../assets/ai-logos/codex.svg';
import logoFigma from '../assets/ai-logos/figma.svg';
import logoGithub from '../assets/ai-logos/github.svg';
import logoLuma from '../assets/ai-logos/luma.svg';
import logoMidjourney from '../assets/ai-logos/midjourney.svg';
import logoRecraft from '../assets/ai-logos/recraft.svg';
import { BrandLogo } from '../components/BrandLogo.jsx';
import { CubePool, ReloadIcon } from '../components/CubePool.jsx';
import { ContactMenu, NavMenu, useMatchMedia } from '../components/NavMenu.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { WorkCard } from '../components/WorkCard.jsx';
import { useLanguage, useUi } from '../i18n/LanguageContext.jsx';
import { MOSAIC_PHOTOS } from '../data/mosaicMedia.js';
import {
  EMPTY_SQUARES,
  LIGHT_TONES,
  PLAIN_TONES,
  attachHeroMosaic,
} from '../lib/heroMosaic.js';
import { attachHeroObject } from '../lib/heroObject.js';
import { attachLogoPool } from '../lib/logoPool.js';
import { attachPinnedHeader } from '../lib/pinnedHeader.js';
import { SHOW_OBJECT_GRAPHICS } from '../lib/siteGraphics.js';
import { attachCaseCube } from '../lib/caseCube.js';
import { attachShotTrail } from '../lib/shotTrail.js';
import { attachWorkStack } from '../lib/workStack.js';

// Keep the section in code, but hidden until the copy is rewritten.
const SHOW_ACHIEVEMENTS_SECTION = false;

// Client logo band under the hero copy. Assets, data and styles are all still
// in place — flip this back to true to bring the row back.
const SHOW_CLIENT_LOGOS = false;

// The film-photo cubes on the hero's rule. Hidden while the mosaic background
// carries the photos; flip back to true to bring them (and the rule) back.
const SHOW_HERO_CUBES = false;

// The cases as one cube that rolls over on scroll (lib/caseCube.js), on a
// desktop only — narrower screens, and anyone who asks for less motion, keep
// the sticky stack of cards. Flip to false for the stack everywhere.
const SHOW_CASE_CUBE = true;
const CASE_CUBE_QUERY = '(min-width: 1241px) and (prefers-reduced-motion: no-preference)';

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
function HeroTitle({ titleRef }) {
  const { lang } = useLanguage();

  if (lang === 'ru') {
    return (
      <h1 ref={titleRef}>
        Продуктовый
        <br className="hero-br--mobile" /> дизайнер
        <br className="hero-br--desktop" /> сложных
        <br className="hero-br--mobile" /> цифровых систем
      </h1>
    );
  }

  return (
    <h1 ref={titleRef}>
      Product Designer
      <br className="hero-br--mobile" /> for
      <br className="hero-br--desktop" /> complex
      <br className="hero-br--mobile" /> digital systems
    </h1>
  );
}

/*
 * The blue practice card. Its floor is a pool of logo cubes that tumble in as
 * the card scrolls into view and can be pushed around with the pointer — see
 * lib/logoPool.js. Each one carries an AI tool's logo.
 *
 * The whole card links to the AI projects page, like the concept teaser beside
 * it. A click that lands on a cube is play, not navigation — the cube gets its
 * kick and the page stays put. The footer is the pile's floor, so the link
 * label is never buried under cubes.
 *
 * Kick every cube out through the top and the card says so, with a way to
 * bring them back and a way to write — the same pair as the cleared hero.
 */
// The tools behind the AI projects (icons: LobeHub Icons, MIT), one cube each.
const AI_TOOL_LOGOS = [
  logoClaude,
  logoCodex,
  logoChatGpt,
  logoGithub,
  logoRecraft,
  logoFigma,
  logoMidjourney,
  logoLuma,
];
const LOGO_CUBES = AI_TOOL_LOGOS.map((logo, index) => ({ id: `cube-${index}`, logo }));
const AI_PROJECTS_HREF = '/ai-projects';

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

// The tumbling logo cubes on the practice card. Hidden while the card carries
// the mosaic; flip back to true to bring them back.
const SHOW_LOGO_POOL = false;

/*
 * The practice card's mosaic: the copy sits at the top (the heading) and at
 * the bottom left (the link), so those squares sit darker.
 */
function practiceShade(xf, yf) {
  const heading = 1 - smoothstepUnit(0.28, 0.58, yf);
  const link = smoothstepUnit(0.78, 0.92, yf) * (1 - smoothstepUnit(0.35, 0.6, xf));
  return Math.max(heading * 0.85, link * 0.8);
}

function smoothstepUnit(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function PracticeCard({ contact }) {
  const text = useUi().home;
  const cardRef = useRef(null);
  const poolRef = useRef(null);
  const mosaicRef = useRef(null);
  const pressedCubeRef = useRef(false);
  const [isCleared, setIsCleared] = useState(false);

  useEffect(() => (SHOW_LOGO_POOL ? attachLogoPool(poolRef.current) : undefined), []);
  useEffect(
    () =>
      SHOW_LOGO_POOL
        ? undefined
        : attachHeroMosaic(mosaicRef.current, {
            shade: practiceShade,
            maxBoards: 0,
            tones: PLAIN_TONES,
          }),
    [],
  );

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
      className={`editorial-card editorial-card--blue editorial-card--practice${
        SHOW_LOGO_POOL ? '' : ' editorial-card--mosaic'
      }`}
      data-reveal
    >
      {SHOW_LOGO_POOL ? null : (
        <canvas className="hero-mosaic practice-card__mosaic" ref={mosaicRef} aria-hidden="true" />
      )}

      <a
        className="practice-card__hit"
        href={AI_PROJECTS_HREF}
        onPointerDown={handleHitPointerDown}
        onClick={handleHitClick}
      >
        <span className="visually-hidden">{text.practiceLink}</span>
      </a>

      {/* One face throughout — the accent set in the heading's own type. */}
      <h3 className="editorial-card__title" data-pool-ceiling>
        {text.practiceTitle.start} {text.practiceTitle.accent}
        {text.practiceTitle.end}
      </h3>

      {SHOW_LOGO_POOL ? (
        <div className="logo-pool" ref={poolRef} aria-hidden="true">
          {LOGO_CUBES.map((cube) => (
            // Logos land the right way up, like the photos.
            <span key={cube.id} className="logo-cube" data-cube data-upright>
              <img src={cube.logo} alt="" draggable={false} />
            </span>
          ))}
        </div>
      ) : null}

      {isCleared ? (
        <div className="practice-card__cleared" role="status">
          <p className="practice-card__cleared-copy">{text.practiceCleared.copy}</p>
          <div className="practice-card__actions">
            <button
              type="button"
              className="cube-pool__reload"
              aria-label={text.practiceCleared.restore}
              title={text.practiceCleared.restore}
              onClick={handleRestore}
            >
              <ReloadIcon />
            </button>
            <ContactMenu
              email={contact.email}
              linkedin={contact.linkedin}
              telegram={contact.telegram}
              sheet
            />
          </div>
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
 * row ([data-pool-floor] on .hero-panel__intro). Each round all four carry film
 * photos from the photo hobby, dealt at random from assets/film
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
  // row so all four settle side by side rather than one perched on another.
  // On a phone the four share the row with the reload button (about 96px of
  // gutters, button and gap), so the size comes from what is left.
  if (width <= 640) {
    return Math.min(80, (width - 96) / 4.3);
  }

  return Math.min(100, Math.max(72, width * 0.062));
}

/*
 * The cases as one cube. Its first face is the word, over the grey squares;
 * the rest are the case covers, which roll in one by one as the page
 * scrolls. The section is tall and the cube sticks to the screen while it
 * passes — lib/caseCube.js turns it.
 */
function CaseCube({ cases }) {
  const sectionRef = useRef(null);
  const mosaicRef = useRef(null);

  useEffect(() => attachCaseCube(sectionRef.current), []);
  // The grey squares as on the design concepts intro: the default lean, darker
  // to the left and along the floor, where the word sits.
  useEffect(
    () =>
      attachHeroMosaic(mosaicRef.current, {
        maxBoards: 0,
        tones: PLAIN_TONES,
      }),
    [],
  );

  return (
    <div className="case-cube" ref={sectionRef} style={{ '--cube-faces': cases.length + 1 }}>
      <div className="case-cube__stage">
        <div className="case-cube__body" data-cube-body>
          <div className="case-cube__face case-cube__face--title is-on is-front" data-cube-face>
            <canvas className="hero-mosaic case-cube__mosaic" ref={mosaicRef} aria-hidden="true" />
            <h2 className="case-cube__title">Cases</h2>
          </div>

          {cases.map((item, index) => (
            <div key={item.id} className="case-cube__face" data-cube-face>
              <WorkCard item={item} index={index} total={cases.length} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// The scattered Dribbble shots on the concept card. Off while the card carries
// the squares, where the shots assemble on hover instead; flip back to true to
// bring the scatter back.
const SHOW_CONCEPT_SHOTS = false;

/*
 * The concept card. With the shots: on desktop the six are scattered and
 * revealed on hover (lib/shotTrail.js); up to 1240px the card shows two of
 * them — the first and the fourth — large, under the link, running out past
 * its floor (.concept-teaser--pair in global.css). Without them, the card is
 * white with light squares, as on the page it links to, and under the copy
 * sit mosaics that assemble into the shots while the pointer is over the card.
 */
function ConceptTeaser({ teaser }) {
  const trailRef = useRef(null);
  const mosaicRef = useRef(null);
  const copyRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => (SHOW_CONCEPT_SHOTS ? attachShotTrail(trailRef.current) : undefined), []);
  useEffect(
    () =>
      SHOW_CONCEPT_SHOTS
        ? undefined
        : attachHeroMosaic(mosaicRef.current, {
            photos: teaser.shots.map((shot) => shot.src),
            shade: practiceShade,
            maxBoards: 2,
            tones: LIGHT_TONES,
            theme: 'light',
            assemble: true,
            below: copyRef.current,
            anchor: footerRef.current,
          }),
    [],
  );

  return (
    <article
      className={`editorial-card concept-teaser ${
        SHOW_CONCEPT_SHOTS ? 'concept-teaser--pair' : 'concept-teaser--mosaic'
      }`}
      ref={trailRef}
      data-reveal
    >
      {SHOW_CONCEPT_SHOTS ? null : (
        <canvas className="hero-mosaic practice-card__mosaic" ref={mosaicRef} aria-hidden="true" />
      )}

      <a className="concept-teaser__hit" href={teaser.href}>
        <span className="visually-hidden">{teaser.linkLabel}</span>
      </a>

      {SHOW_CONCEPT_SHOTS ? (
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
      ) : null}

      <div className="concept-teaser__copy" ref={copyRef}>
        <h3 className="editorial-card__title">{teaser.title}</h3>
        <p className="editorial-card__copy">{teaser.description}</p>
      </div>

      <div className="concept-teaser__footer" ref={footerRef}>
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
  // Ways to write, offered wherever the cubes have all been kicked out.
  const contact = {
    email: profile.email,
    linkedin: profile.contacts.find((item) => item.label === 'LinkedIn')?.href,
    telegram: profile.telegram,
  };

  const mosaicRef = useRef(null);
  const copyRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => attachHeroObject(heroRef.current, objectRef.current), []);
  const showCube = useMatchMedia(CASE_CUBE_QUERY, SHOW_CASE_CUBE);
  useEffect(() => (showCube ? undefined : attachWorkStack(stackRef.current)), [showCube]);

  // The hero's top row comes back as a bar on scroll up, as on every page —
  // once the blue hero itself has left the screen.
  const topRef = useRef(null);
  useEffect(() => attachPinnedHeader(topRef.current, { hideOver: heroRef.current }), []);

  // The mosaic background, with the summary's plate cut to its grid. The
  // squares round the game are plain grey cubes, as on the AI projects intro.
  useEffect(
    () =>
      attachHeroMosaic(mosaicRef.current, {
        photos: MOSAIC_PHOTOS,
        tones: PLAIN_TONES,
        copy: copyRef.current,
        anchor: titleRef.current,
        header: topRef.current,
        emptySquares: EMPTY_SQUARES,
      }),
    [],
  );

  return (
    <div className="home-page">
      <section className="hero-shell" data-track-area="hero">
        <div className="home-shell hero-panel" ref={heroRef}>
          <canvas className="hero-mosaic" ref={mosaicRef} aria-hidden="true" />
          <div className="hero-panel__top" ref={topRef} data-pool-ceiling>
            <a className="hero-panel__brand" href="/" onClick={handleBrandClick}>
              <BrandLogo name={profile.name} />
            </a>
            <NavMenu
              contacts={profile.contacts}
              email={profile.email}
              telegram={profile.telegram}
            />
          </div>

          {/*
            * Editorial composition: the headline set large on the panel floor,
            * at the left; the mosaic's photos fill the right. The summary sits
            * in a plate cut to the mosaic's grid, just above the headline —
            * lib/heroMosaic.js places it once the grid is measured. The cubes
            * and the rule they stood on are switched off (SHOW_HERO_CUBES).
            */}
          <div className="hero-panel__grid">
            <HeroTitle titleRef={titleRef} />

            {SHOW_HERO_CUBES ? (
              <div className="hero-panel__intro">
                <span className="hero-panel__rule" data-pool-floor />
              </div>
            ) : null}
          </div>

          <div className="hero-panel__plate" ref={copyRef}>
            {profile.summary.map((paragraph) => (
              <p key={paragraph} className="hero-panel__lead">
                {paragraph}
              </p>
            ))}
          </div>

          {SHOW_HERO_CUBES ? (
            <CubePool
              count={4}
              cubeSize={heroCubeSize}
              align="end"
              className="hero-panel__cubes"
              photos={FILM_PHOTOS}
              photoCount={4}
              featured={FILM_PHOTOS_OF_ME}
              featuredCount={2}
              restoreLabel={text.practiceCleared.restore}
              contact={contact}
            />
          ) : null}

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

      <section className="section home-shell" id="work" data-track-area="work-cards">
        {showCube ? (
          <CaseCube cases={cases} />
        ) : (
          <div className="work-stack" ref={stackRef}>
            {cases.map((item, index) => (
              <WorkCard key={item.id} item={item} index={index} total={cases.length} />
            ))}
          </div>
        )}
      </section>

      <section className="section home-shell practice-section" data-track-area="practice">
        <div className="two-column-section">
          <ConceptTeaser teaser={designConceptTeaser} />

          <PracticeCard contact={contact} />
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

      <section className="section home-shell experience-section" data-track-area="experience">
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
