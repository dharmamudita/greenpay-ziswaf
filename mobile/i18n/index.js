import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import id from './locales/id.json';
import en from './locales/en.json';

const LANGUAGE_KEY = 'appLanguage';

const languageDetectorPlugin = {
  type: 'languageDetector',
  async: true,
  init: () => {},
  detect: async function (callback) {
    try {
      const language = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (language) {
        return callback(language);
      }
      return callback('id'); // default fallback
    } catch (error) {
      console.log('Error reading language', error);
      return callback('id');
    }
  },
  cacheUserLanguage: async function (language) {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.log('Error saving language', error);
    }
  }
};

i18n
  .use(initReactI18next)
  .use(languageDetectorPlugin)
  .init({
    resources: {
      id: { translation: id },
      en: { translation: en }
    },
    fallbackLng: 'id',
    interpolation: {
      escapeValue: false // react is already safe from xss
    }
  });

export default i18n;
