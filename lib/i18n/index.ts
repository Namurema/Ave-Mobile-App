import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
import lg from './lg';
import rny from './rny';
import es from './es';
import it from './it';
import sw from './sw';

const resources = {
  en: { translation: en },
  lg: { translation: lg },
  rny: { translation: rny },
  es: { translation: es },
  it: { translation: it },
  sw: { translation: sw },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;