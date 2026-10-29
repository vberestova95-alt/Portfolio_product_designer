/*
 * Display helpers for the dashboard: numbers, durations and the human names
 * of what the collector stores as ids and paths.
 */

const PAGE_NAMES = {
  '/': 'Главная',
  '/betboom-pass': 'BetBoom PASS',
  '/yandex-turkey': 'Yandex News Turkey',
  '/kokoc-group': 'Kokoc Group',
  '/cat-app': 'Fluffy Chumb',
  '/iquoto': 'IQuoto',
  '/ds-plugins': 'Design System Plugins',
  '/design-cringe': 'Design Cringe-meter',
  '/design-concepts': 'Dribbble-концепты',
  '/ai-projects': 'AI-проекты',
  '/experience': 'Опыт',
  '/pet-injection-tracker': 'Pet Injection Tracker',
};

const PROJECT_NAMES = Object.fromEntries(
  Object.entries(PAGE_NAMES).map(([path, name]) => [path.slice(1), name]),
);

const AREA_NAMES = {
  'work-cards': 'карточки на главной',
  practice: 'блок концептов',
  'more-work': '«другие работы» в кейсе',
  hero: 'первый экран',
  experience: 'блок опыта',
  nav: 'меню',
  header: 'шапка',
  footer: 'подвал',
  page: 'страница',
};

const CONTACT_NAMES = {
  email: 'Email',
  linkedin: 'LinkedIn',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  phone: 'Телефон',
  dribbble: 'Dribbble',
  behance: 'Behance',
  github: 'GitHub',
  instagram: 'Instagram',
  x: 'X',
  figma: 'Figma',
};

const DEVICE_NAMES = { desktop: 'Компьютер', mobile: 'Телефон', tablet: 'Планшет' };

export const pageName = (path) => PAGE_NAMES[path] || path;
export const projectName = (id) => PROJECT_NAMES[id] || id;
export const areaName = (area) => AREA_NAMES[area] || area;
export const contactName = (id) => CONTACT_NAMES[id] || id;
export const deviceName = (device) => DEVICE_NAMES[device] || device;
export const fileName = (name) => (/cv/i.test(name) ? 'CV (PDF)' : name);

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(['ru'], { type: 'region' });
  } catch {
    return null;
  }
})();

export function countryName(code) {
  if (!code || code === 'unknown') return 'Не определена';

  try {
    return regionNames?.of(code) || code;
  } catch {
    return code;
  }
}

export function flag(code) {
  if (!code || code.length !== 2) return '🌐';
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}

const compact = new Intl.NumberFormat('ru', { notation: 'compact', maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat('ru');

export function number(value) {
  const n = Number(value) || 0;
  return Math.abs(n) >= 10000 ? compact.format(n) : whole.format(Math.round(n));
}

export function decimal(value, digits = 1) {
  return (Number(value) || 0).toLocaleString('ru', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function percent(value, digits = 0) {
  return `${decimal((Number(value) || 0) * 100, digits)}%`;
}

export function duration(ms) {
  const seconds = Math.round((Number(ms) || 0) / 1000);

  if (seconds < 60) return `${seconds} с`;

  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  if (minutes < 60) return rest ? `${minutes} мин ${rest} с` : `${minutes} мин`;

  return `${Math.floor(minutes / 60)} ч ${minutes % 60} мин`;
}

export function ago(ms, now = Date.now()) {
  const seconds = Math.max(0, Math.round((now - ms) / 1000));

  if (seconds < 5) return 'только что';
  if (seconds < 60) return `${seconds} с назад`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} мин назад`;
  return `${Math.floor(seconds / 3600)} ч назад`;
}

const dayFormat = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short' });
const weekdayFormat = new Intl.DateTimeFormat('ru', { weekday: 'short' });

// Days arrive as YYYY-MM-DD in the site's zone; noon UTC keeps the date put.
const asDate = (day) => new Date(`${day}T12:00:00Z`);

export const dayLabel = (day) => dayFormat.format(asDate(day)).replace('.', '');
export const weekdayLabel = (day) => weekdayFormat.format(asDate(day));
// Monday first: 0 = Mon … 6 = Sun.
export const weekdayIndex = (day) => (asDate(day).getUTCDay() + 6) % 7;
