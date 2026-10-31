/*
 * Yandex.Metrika, started from code rather than from index.html so that it only
 * loads after the visitor agrees (see consent.js). The loader is Yandex's own
 * snippet. public/404.html and public/500.html carry the same one inline.
 */
const COUNTER_ID = 110240395;

export function startMetrika() {
  if (typeof window === 'undefined' || window.ym) {
    return;
  }

  (function (m, e, t, r, i, k, a) {
    m[i] =
      m[i] ||
      function () {
        (m[i].a = m[i].a || []).push(arguments);
      };
    m[i].l = 1 * new Date();
    k = e.createElement(t);
    a = e.getElementsByTagName(t)[0];
    k.async = 1;
    k.src = r;
    a.parentNode.insertBefore(k, a);
  })(window, document, 'script', `https://mc.yandex.ru/metrika/tag.js?id=${COUNTER_ID}`, 'ym');

  window.ym(COUNTER_ID, 'init', {
    ssr: true,
    webvisor: true,
    clickmap: true,
    accurateTrackBounce: true,
    trackLinks: true,
  });
}
