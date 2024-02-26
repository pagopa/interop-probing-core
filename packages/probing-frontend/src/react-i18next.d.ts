import type home from '@/locales/en/test.json'
import type common from '@/locales/en/common.json'
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      home: typeof home
      common: typeof common
    }
  }
}
