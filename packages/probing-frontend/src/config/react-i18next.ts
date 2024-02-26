import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import commonIt from '@/locales/it/common.json'
import commonEn from '@/locales/en/common.json'
import feedbackIt from '@/locales/it/feedback.json'
import feedbackEn from '@/locales/en/feedback.json'
import errorIt from '@/locales/it/error.json'
import errorEn from '@/locales/en/error.json'

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
      feedback: feedbackIt,
      error: errorIt,
    },
    en: {
      common: commonEn,
      feedback: feedbackEn,
      error: errorEn,
    },
  },
})

export default i18n
