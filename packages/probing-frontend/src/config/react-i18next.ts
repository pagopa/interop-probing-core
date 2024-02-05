import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import commonIt from '@/locales/it/common.json'
import commonEn from '@/locales/en/common.json'

i18n.use(initReactI18next).init({
  debug: false,
  fallbackLng: 'it',
  supportedLngs: ['it', 'en'],
  interpolation: {
    escapeValue: false,
  },
  defaultNS: 'common',
  resources: {
    it: {
      common: commonIt,
    },
    en: {
      common: commonEn,
    },
  },
})

export default i18n
