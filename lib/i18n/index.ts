import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
import lg from './lg';
import rny from './rny';

const resources = {
  en: { translation: en },
  lg: { translation: lg },
  rny: { translation: rny },
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