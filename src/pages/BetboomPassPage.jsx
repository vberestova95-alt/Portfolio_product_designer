import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SiteFooter } from '../components/SiteFooter.jsx';
import { SiteHeader } from '../components/SiteHeader.jsx';
import { useUi } from '../i18n/LanguageContext.jsx';

function LazyVideo({ src, alt, className = '', playbackRate = 1 }) {
  const videoRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const node = videoRef.current;

    if (!node || typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = videoRef.current;

    if (!node || !shouldLoad) {
      return undefined;
    }

    node.muted = true;
    node.defaultMuted = true;
    node.playbackRate = playbackRate;

    const play = () => {
      const attempt = node.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(() => {});
      }
    };

    if (node.readyState >= 2) {
      play();
    } else {
      node.addEventListener('loadeddata', play, { once: true });
    }

    return () => node.removeEventListener('loadeddata', play);
  }, [playbackRate, shouldLoad]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={shouldLoad ? src : undefined}
      aria-label={alt}
      autoPlay
      muted
      loop
      playsInline
      preload={shouldLoad ? 'auto' : 'none'}
    />
  );
}

function BeforeAfterSlider({ before, after }) {
  const text = useUi().case;
  const [position, setPosition] = useState(50);
  const [animated, setAnimated] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const steps = [
      [500, 32],
      [950, 68],
      [1450, 50],
    ];

    const timers = steps.map(([delay, value]) =>
      setTimeout(() => {
        setAnimated(true);
        setPosition(value);
      }, delay),
    );
    const resetTimer = setTimeout(() => setAnimated(false), 2000);

    return () => {
      [...timers, resetTimer].forEach(clearTimeout);
    };
  }, []);

  const updatePosition = useCallback((clientX, element) => {
    const rect = element.getBoundingClientRect();
    const nextValue = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(98, Math.max(2, nextValue)));
  }, []);

  const handlePointerMove = useCallback(
    (event) => {
      if (!isDragging) {
        return;
      }

      updatePosition(event.clientX, event.currentTarget);
    },
    [isDragging, updatePosition],
  );

  const handleTouchMove = useCallback(
    (event) => {
      updatePosition(event.touches[0].clientX, event.currentTarget);
    },
    [updatePosition],
  );

  const activeTab = position <= 45 ? 'before' : position >= 55 ? 'after' : null;
  const animationStyle = animated
    ? { transition: 'clip-path 460ms cubic-bezier(0.2, 0.8, 0.2, 1)' }
    : {};
  const handleStyle = animated
    ? {
        left: `${position}%`,
        transition: 'left 460ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      }
    : { left: `${position}%` };

  return (
    <div className="case-ba-wrap">
      <div className="case-ba-tabs">
        <button
          className={`case-ba-tab${activeTab === 'before' ? ' is-active' : ''}`}
          onClick={() => {
            setAnimated(true);
            setPosition(4);
            setTimeout(() => setAnimated(false), 480);
          }}
        >
          {text.before}
        </button>
        <button
          className={`case-ba-tab${activeTab === 'after' ? ' is-active' : ''}`}
          onClick={() => {
            setAnimated(true);
            setPosition(96);
            setTimeout(() => setAnimated(false), 480);
          }}
        >
          {text.after}
        </button>
      </div>

      <div
        className="case-ba-slider"
        onMouseMove={handlePointerMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        <img className="case-ba-slider__img" src={after.src} alt={after.alt} draggable={false} />
        <img
          className="case-ba-slider__before"
          src={before.src}
          alt={before.alt}
          draggable={false}
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)`, ...animationStyle }}
        />
        <div
          className="case-ba-slider__handle"
          style={handleStyle}
          onMouseDown={(event) => {
            event.preventDefault();
            setAnimated(false);
            setIsDragging(true);
          }}
          onTouchStart={() => {
            setAnimated(false);
            setIsDragging(true);
          }}
        >
          <div className="case-ba-slider__line" />
          <div className="case-ba-slider__grip" aria-label={text.dragToCompare}>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M7 5L2 10L7 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13 5L18 10L13 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatGrid({ items, className = '' }) {
  return (
    <div className={`case-stat-grid${className ? ` ${className}` : ''}`}>
      {items.map((item) => (
        <div key={`${item.value}-${item.label}`} className="case-stat-card">
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function HeroMeta({ text, items }) {
  const content = items?.length ? `${text} / ${items.join(' / ')}` : text;
  return <p className="case-hero__meta">{content}</p>;
}

function ContentBlock({ block }) {
  if (block.type === 'list' || block.type === 'ordered-list') {
    const ListTag = block.type === 'ordered-list' ? 'ol' : 'ul';

    return (
      <section className="case-content-block">
        <h3>{block.heading}</h3>
        <ListTag className="case-bullet-list">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ListTag>
      </section>
    );
  }

  if (block.type === 'stats') {
    return (
      <section className="case-content-block">
        <h3>{block.heading}</h3>
        <StatGrid items={block.stats} className="case-stat-grid--compact" />
      </section>
    );
  }

  return (
    <section className="case-content-block">
      <h3>{block.heading}</h3>
      <div className="case-rich-text">
        {block.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

/*
 * A bento block: a small grid of interface details cropped out of the full
 * screenshots. Each tile zooms into a focus point (--fx/--fy) so a specific
 * part of the UI can be shown at a readable size.
 */
function BentoTile({ tile }) {
  const style = {
    '--zoom': tile.zoom ?? 1,
    '--fx': tile.fx ?? '50%',
    '--fy': tile.fy ?? '50%',
  };

  return (
    <figure
      className={`bento-tile bento-tile--${tile.span || 'half'}${
        tile.variant ? ` bento-tile--${tile.variant}` : ''
      }`}
    >
      <div className="bento-tile__media" style={style}>
        {tile.type === 'video' ? (
          <LazyVideo src={tile.src} alt={tile.alt} />
        ) : (
          <img src={tile.src} alt={tile.alt} />
        )}
      </div>
      {tile.caption ? <figcaption>{tile.caption}</figcaption> : null}
    </figure>
  );
}

function BentoGrid({ part }) {
  return (
    <section className="case-bento">
      {part.label ? <span className="case-bento__label">{part.label}</span> : null}
      <div className="case-bento__grid">
        {part.tiles.map((tile, index) => (
          <BentoTile key={`${tile.alt}-${index}`} tile={tile} />
        ))}
      </div>
    </section>
  );
}

function CaseMedia({ media, className = '' }) {
  if (media.type === 'video') {
    return (
      <LazyVideo
        className={className}
        src={media.src}
        alt={media.alt}
      />
    );
  }

  return <img className={className} src={media.src} alt={media.alt} />;
}

function Collapsible({ part }) {
  const [isOpen, setIsOpen] = useState(false);
  const ListTag = part.listType === 'ordered' ? 'ol' : 'ul';

  return (
    <div className={`case-collapsible${isOpen ? ' is-open' : ''}`}>
      <button
        className="case-collapsible__trigger"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
      >
        <span className="case-collapsible__title">{part.title}</span>
        <svg className="case-collapsible__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="case-collapsible__body">
        {part.items?.length ? (
          <ListTag className="case-bullet-list">
            {part.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ListTag>
        ) : null}

        {part.paragraphs?.length ? (
          <div className="case-rich-text">
            {part.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PainCards({ part }) {
  return (
    <div className="case-pain-section">
      {part.heading ? <h3>{part.heading}</h3> : null}
      <div className="case-pain-cards">
        {part.items.map((item, index) => (
          <div key={item} className="case-pain-card">
            <span className="case-pain-card__num">{String(index + 1).padStart(2, '0')}</span>
            <p className="case-pain-card__text">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightCards({ part }) {
  return (
    <div className="case-insight-section">
      {part.heading ? <h3>{part.heading}</h3> : null}
      <div className="case-insight-cards">
        {part.items.map((item) => (
          <div key={item} className="case-insight-card">
            <p>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoteCard({ card }) {
  const ListTag = card.listType === 'ordered' ? 'ol' : 'ul';

  const body = (
    <>
      {card.items?.length ? (
        <ListTag className="case-bullet-list">
          {card.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ListTag>
      ) : null}
      {card.paragraphs?.length ? (
        <div className="case-rich-text">
          {card.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}
    </>
  );

  return (
    <div className={`case-note-card${card.compact ? ' case-note-card--compact' : ''}`}>
      {card.title ? <h3>{card.title}</h3> : null}
      {card.icon ? (
        <div className="case-note-card__icon-row">
          <span className="case-note-card__icon" aria-hidden="true">
            {card.icon}
          </span>
          <div>{body}</div>
        </div>
      ) : (
        body
      )}
    </div>
  );
}

function SectionPart({ part }) {
  const text = useUi().case;

  if (part.type === 'richTextLead') {
    return (
      <div className="case-rich-text case-rich-text--lead">
        {part.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    );
  }

  if (part.type === 'blocks') {
    return (
      <div className="case-study-stack">
        {part.blocks.map((block) => (
          <ContentBlock key={`${block.type}-${block.heading}`} block={block} />
        ))}
      </div>
    );
  }

  if (part.type === 'imageBand') {
    return (
      <div
        className={`case-image-band${part.variant ? ` case-image-band--${part.variant}` : ''}`}
      >
        {part.label ? <span>{part.label}</span> : null}
        <CaseMedia
          media={part.media}
          className={part.media.type === 'video' ? 'case-image-band__video' : ''}
        />
      </div>
    );
  }

  if (part.type === 'featureMedia') {
    return (
      <div className={`case-feature-media${part.wide ? ' case-feature-media--wide' : ''}`}>
        <CaseMedia media={part.media} />
      </div>
    );
  }

  if (part.type === 'bento') {
    return <BentoGrid part={part} />;
  }

  if (part.type === 'noteCard') {
    return <NoteCard card={part} />;
  }

  if (part.type === 'collapsible') {
    return <Collapsible part={part} />;
  }

  if (part.type === 'painCards') {
    return <PainCards part={part} />;
  }

  if (part.type === 'insightCards') {
    return <InsightCards part={part} />;
  }

  if (part.type === 'phonePair') {
    return (
      <div className="case-image-band">
        {part.label ? <span>{part.label}</span> : null}
        <div className="case-phone-pair">
          {part.items.map((item, index) => (
            <div key={`${item.alt}-${index}`} className="case-phone-pair__item">
              {item.type === 'video' ? (
                <LazyVideo
                  src={item.src}
                  alt={item.alt}
                  playbackRate={0.67}
                />
              ) : (
                <img src={item.src} alt={item.alt} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (part.type === 'beforeAfterSlider') {
    return <BeforeAfterSlider before={part.before} after={part.after} />;
  }

  if (part.type === 'siteLink') {
    return (
      <div className="case-site-link">
        <span>{part.label || text.projectLink}</span>
        <a href={part.href} target="_blank" rel="noopener noreferrer">
          {part.text || part.href}
        </a>
      </div>
    );
  }

  return null;
}

/*
 * Closing block of every case: the rest of the work, so the case is a loop
 * rather than a dead end. Cards reuse the home covers and surfaces, keyed by
 * case id for the per-project image fitting.
 */
function NextProjects({ items }) {
  const text = useUi().case;

  if (!items.length) {
    return null;
  }

  return (
    <section className="case-next" data-reveal data-track-area="more-work">
      <header className="case-next__header">
        <p className="section-label">{text.moreWork}</p>
        <h2>{text.otherProjects}</h2>
      </header>

      <div className="case-next__grid">
        {items.map((item) => (
          <a
            key={item.id}
            className={`case-next__card case-next__card--${item.surface}`}
            data-case={item.id}
            href={item.href}
          >
            <span className="case-next__media">
              <img src={item.image.src} alt="" loading="lazy" />
            </span>
            <span className="case-next__meta">
              <span className="case-next__title">{item.title}</span>
              <span className="case-next__cta">
                {text.openCase}
                <span aria-hidden="true"> →</span>
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function Lightbox({ src, alt, onClose }) {
  const text = useUi().case;

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="case-lightbox" onClick={onClose}>
      <button className="case-lightbox__close" onClick={onClose} aria-label={text.closeImage}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <img
        className="case-lightbox__img"
        src={src}
        alt={alt}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}

export function CaseStudyPage({
  caseStudy,
  cases = [],
  profile,
  headerBrandHref,
  showReturnHome = true,
  showSectionBackLink = true,
}) {
  const text = useUi().case;
  const [lightbox, setLightbox] = useState(null);

  const otherCases = cases.filter((item) => item.href !== `/${caseStudy.slug}`);

  const handleImageClick = useCallback((event) => {
    // Covers in the closing block are links, not zoomable case media.
    if (
      event.target.tagName === 'IMG' &&
      !event.target.closest('.case-ba-slider') &&
      !event.target.closest('.case-next')
    ) {
      setLightbox({
        src: event.target.src,
        alt: event.target.alt,
      });
    }
  }, []);

  return (
    <div className={`case-page case-page--${caseStudy.slug}`} onClick={handleImageClick}>
      {lightbox ? (
        <Lightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      ) : null}

      <div className="case-page__shell">
        {profile ? (
          <SiteHeader
            profile={profile}
            brandHref={headerBrandHref}
            showReturnHome={showReturnHome}
          />
        ) : null}

        <section className="case-hero">
          <div className="case-hero__copy">
            <div className="case-hero__intro">
              <h1>{caseStudy.hero.title}</h1>
              <p className="case-hero__description">{caseStudy.hero.description}</p>
            </div>
            <StatGrid items={caseStudy.hero.stats} className="case-stat-grid--hero" />
            <HeroMeta text={caseStudy.hero.meta} items={caseStudy.hero.points} />
          </div>

          <div className="case-hero__media">
            <img src={caseStudy.hero.image.src} alt={caseStudy.hero.image.alt} />
          </div>
        </section>

        <div className="case-chapters">
          {caseStudy.sections.map((section) => (
            <section key={section.id} id={section.id} className="case-study-section" data-reveal>
              {/*
                * Title first: it has to line up with the top of the chapter's
                * content, and a link above it pushed the title down instead.
                */}
              <div className="case-study-section__intro">
                <h2>{section.title}</h2>
                {showSectionBackLink ? (
                  <a className="case-back-link case-section-back" href={caseStudy.backHref}>
                    <span aria-hidden="true">←</span>
                    {/* Cases opened from a listing other than home lead back to it. */}
                    <span>{caseStudy.backHref === '/' ? text.allWork : text.back}</span>
                  </a>
                ) : null}
              </div>

              <div className="case-study-section__content">
                {section.parts.map((part, partIndex) => (
                  <SectionPart key={`${section.id}-${part.type}-${partIndex}`} part={part} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <NextProjects items={otherCases} />
      </div>

      {profile ? <SiteFooter profile={profile} /> : null}
    </div>
  );
}

export const BetboomPassPage = CaseStudyPage;
