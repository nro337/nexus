import '@testing-library/jest-dom';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../src/i18n/locales/en.json';

// Initialize i18n for tests (no suspense, synchronous)
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: { en },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
}
