import React, { useEffect, useRef } from 'react';
/*
 * One object carries the whole site: the hero, the practice card and the
 * footer all render this same knot, at different scales and orientations. The
 * hero used to run a bubble clip instead, which read as a separate visual
 * language — the two files are still in assets/ if that direction comes back.
 */
import editorialObject from '../assets/editorial-object.webp';
import { NavMenu } from '../components/NavMenu.jsx';
import { SiteFooter } from '../components/SiteFooter.jsx';
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
 * React sets `muted` as a property after mount, which is too late for Safari's
 * autoplay check — it sees an unmuted video on first paint and blocks playback.
 * Setting it on the element itself, then calling play(), makes it reliable.
 */
function CoverMotion({ motion }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    node.muted = true;
    node.defaultMuted = true;

    const start = () => {
      const attempt = node.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(() => {});
      }
    };

    if (node.readyState >= 2) {
      start();
    } else {
      node.addEventListener('loadeddata', start, { once: true });
    }

    return () => node.removeEventListener('loadeddata', start);
  }, []);

  return (
    <div
      className="cover-stage__motion"
      aria-hidden="true"
      style={{
        left: motion.left,
        top: motion.top,
        width: motion.width,
        height: motion.height,
      }}
    >
      <video ref={ref} src={motion.src} autoPlay muted loop playsInline preload="auto" />
      {motion.fade ? (
        <span className="cover-stage__fade" style={{ backgroundImage: motion.fade }} />
      ) : null}
      {motion.overlay ? (
        <img className="cover-stage__overlay" src={motion.overlay} alt="" />
      ) : null}
    </div>
  );
}

function WorkCard({ item, index, total }) {
  const text = useUi().home;

  return (
    <article
      className={`work-card work-card--${item.surface} work-card--${item.id}`}
      style={{
        '--stack-index': index,
        '--stack-total': total,
      }}
    >
      <a className="work-card__hit" href={item.href}>
        <span className="visually-hidden">{`${text.openCase}: ${item.title}`}</span>
      </a>

      <div className="work-card__meta">
        <ul className="work-card__stats">
          {item.metrics.map((metric) => (
            <li key={metric}>{metric}</li>
          ))}
        </ul>
        <span className="work-card__kicker">{item.category}</span>
      </div>
      <div className="work-card__body">
        <div className="work-card__copy">
          <h3>{item.title}</h3>
          <p className="work-card__description">{item.description}</p>
          {/* Visual only — the whole card is already the link (work-card__hit). */}
          <span className="work-card__cta" aria-hidden="true">
            {text.viewProject}
            <span className="work-card__cta-arrow">→</span>
          </span>
        </div>
        <div className={`work-card__visual${item.motion ? ' work-card__visual--stage' : ''}`}>
          {item.motion ? (
            <div
              className="cover-stage"
              style={{ '--stage-w': item.stage.width, '--stage-h': item.stage.height }}
            >
              <img className="cover-stage__base" src={item.image.src} alt={item.image.alt} />
              <CoverMotion motion={item.motion} />
            </div>
          ) : (
            <img
              src={item.image.src}
              alt={item.image.alt}
              style={
                item.focus
                  ? {
                      '--zoom': item.focus.zoom,
                      '--fx': item.focus.fx,
                      '--fy': item.focus.fy,
                    }
                  : undefined
              }
            />
          )}
          {item.mobileImage && !item.motion ? (
            <div className="work-card__mobile">
              <img src={item.mobileImage.src} alt={item.mobileImage.alt} />
            </div>
          ) : null}
        </div>
      </div>
    </article>
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
 * lib/logoPool.js. The cubes are blank tiles for now; logos go into LOGO_CUBES.
 */
const LOGO_CUBES = Array.from({ length: 14 }, (_, index) => ({ id: `cube-${index}` }));

function PracticeCard() {
  const text = useUi().home;
  const poolRef = useRef(null);

  useEffect(() => attachLogoPool(poolRef.current), []);

  return (
    <article className="editorial-card editorial-card--blue editorial-card--practice" data-reveal>
      <h3 className="editorial-card__title">
        {text.practiceTitle.start}{' '}
        <span className="serif-accent">{text.practiceTitle.accent}</span>
        {text.practiceTitle.end}
      </h3>
      <p className="editorial-card__copy">{text.practiceCopy}</p>

      <div className="logo-pool" ref={poolRef} aria-hidden="true">
        {LOGO_CUBES.map((cube) => (
          <span key={cube.id} className="logo-cube" data-cube>
            {cube.logo ? <img src={cube.logo} alt="" draggable={false} /> : null}
          </span>
        ))}
      </div>
    </article>
  );
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
          <div className="hero-panel__top">
            <a className="hero-panel__brand" href="/" onClick={handleBrandClick}>
              {profile.name}
            </a>
            <NavMenu contacts={profile.contacts} />
          </div>

          {/*
            * Editorial composition: a ruled row of small copy — portrait and the
            * two summary lines — and the headline set large on
            * the panel floor. The headline still comes first in the document;
            * the grid areas move it under the row.
            */}
          <div className="hero-panel__grid">
            <HeroTitle />

            <div className="hero-panel__intro">
              <div className="hero-panel__portrait">
                <img src={profile.photo.src} alt={profile.photo.alt} />
              </div>

              {profile.summary.map((paragraph) => (
                <p key={paragraph} className="hero-panel__lead">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

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
