import fr from './locales/fr.js';
import en from './locales/en.js';
import es from './locales/es.js';
import ar from './locales/ar.js';

let _i18n = null;
let _ready = null;
let _t = (key, opts) => key;

function getClient() {
  if (!_ready) {
    _ready = (async () => {
      const { default: i18next } = await import('https://esm.sh/i18next@23.16.4');
      const { default: LanguageDetector } = await import('https://esm.sh/i18next-browser-languagedetector@8.0.0');

      await i18next.use(LanguageDetector).init({
        fallbackLng: 'fr',
        debug: false,
        detection: {
          order: ['localStorage', 'navigator'],
          caches: ['localStorage'],
        },
        resources: {
          fr: { translation: fr },
          en: { translation: en },
          es: { translation: es },
          ar: { translation: ar },
        },
        interpolation: { escapeValue: false },
      });

      _i18n = i18next;
      _t = i18next.t.bind(i18next);
    })();
  }
  return _ready;
}

export const i18nReady = getClient();

export function t(key, options) {
  return _t(key, options);
}

export async function changeLanguage(lng) {
  await i18nReady;
  await _i18n.changeLanguage(lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
}

export async function getCurrentLanguage() {
  await i18nReady;
  return _i18n.language;
}

export async function onLanguageChanged(callback) {
  await i18nReady;
  _i18n.on('languageChanged', callback);
}

export async function translatePage() {
  await i18nReady;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.title = t(key);
  });
  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    const key = el.getAttribute('data-i18n-alt');
    el.alt = t(key);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    el.innerHTML = t(key);
  });
  document.querySelectorAll('[data-i18n-content]').forEach(el => {
    const key = el.getAttribute('data-i18n-content');
    el.setAttribute('content', t(key));
  });
}

export function currentLang() {
  return _i18n ? _i18n.language : 'fr';
}

export function localized(value) {
  if (!value) return '';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('{')) {
      try { value = JSON.parse(trimmed); }
      catch { return value; }
    } else {
      return value;
    }
  }
  if (typeof value !== 'object') return String(value);
  const lang = currentLang();
  return value[lang] || value.fr || Object.values(value)[0] || '';
}
