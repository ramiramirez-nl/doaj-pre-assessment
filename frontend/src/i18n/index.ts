import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import tr from './tr.json';
import es from './es.json';
import fr from './fr.json';
import de from './de.json';
import ar from './ar.json';
import id from './id.json';
import zh from './zh.json';

const saved = localStorage.getItem('doaj-lang');
const browser = navigator.language.split('-')[0];
const supported = ['en', 'tr', 'es', 'fr', 'de', 'ar', 'id', 'zh'];
const lng = saved ?? (supported.includes(browser) ? browser : 'en');

i18n.use(initReactI18next).init({
  resources: {
    en: { t: en },
    tr: { t: tr },
    es: { t: es },
    fr: { t: fr },
    de: { t: de },
    ar: { t: ar },
    id: { t: id },
    zh: { t: zh },
  },
  lng,
  fallbackLng: 'en',
  defaultNS: 't',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (l) => {
  localStorage.setItem('doaj-lang', l);
  // Arabic is RTL; all others are LTR
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
});

// Set initial direction
document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';

export default i18n;
