import React, { useEffect, useRef } from 'react';
import { useUi } from '../i18n/LanguageContext.jsx';

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

export function WorkCard({ item, index, total }) {
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
