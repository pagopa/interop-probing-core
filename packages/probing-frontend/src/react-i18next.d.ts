import type home from '@/locales/en/test.json'
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      home: typeof home
    }
  }
}
