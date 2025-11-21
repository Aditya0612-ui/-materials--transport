// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslations from './locales/en.json';
import mrTranslations from './locales/mr.json';

const resources = {
  en: {
    translation: enTranslations
  },
  mr: {
    translation: mrTranslations
  }
};

// Get saved language preference or default to Marathi
const savedLanguage = localStorage.getItem('preferredLanguage') || 'mr';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: savedLanguage, // use saved language or default to Marathi as per client requirement
    fallbackLng: 'en', // fallback language
    
    interpolation: {
      escapeValue: false // react already does escaping
    },
    
    // Additional configuration
    debug: false, // set to true for development debugging
    
    // Cache configuration
    cache: {
      enabled: true
    },
    
    // React specific options
    react: {
      useSuspense: false
    }
  });

export default i18n;
