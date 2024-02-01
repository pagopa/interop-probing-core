import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import homeIt from '@/locales/it/test.json'
import homeEn from '@/locales/en/test.json'

i18n.use(initReactI18next).init({
  debug: false,
  fallbackLng: 'it',
  interpolation: {
    escapeValue: false,
  },
  defaultNS: 'common',
  resources: {
    it: {
      home: homeIt,
    },
    en: {
      home: homeEn,
    },
  },
})

export default i18n
