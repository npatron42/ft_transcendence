import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './utils/translations/en.json';
import frTranslations from './utils/translations/fr.json';
import itTranslations from './utils/translations/it.json';
 
i18n
 
  .use(initReactI18next)
 
  .init({
 
    resources: {
 
      en: {
 
        translation: enTranslations,
 
      },
 
      fr: {
 
        translation: frTranslations,
 
      },

      it: {
 
        translation: itTranslations,
 
      },
 
    },
 
    lng:  sessionStorage.getItem('i18nextLng') ||  'fr',
 
    fallbackLng: 'fr',
 
    interpolation: {
 
      escapeValue: false,
 
    },
 
  });
export default i18n;