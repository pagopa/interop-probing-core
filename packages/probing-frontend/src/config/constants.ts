import type { ProductSwitchItem } from '@pagopa/mui-italia'
import type { TFunction } from 'i18next'

export const documentationLink = 'https://docs.pagopa.it/interoperabilita-1'
export const assistanceLink = 'https://selfcare.pagopa.it/assistenza'
export const productSwitchItem: ProductSwitchItem = {
  id: 'prod-interop',
  title: `Interoperabilità`,
  productUrl: '',
  linkType: 'internal',
}
export const STORAGE_KEY_SESSION_TOKEN = 'token'

export const LANGUAGES = {
  it: { it: 'Italiano', en: 'Inglese' },
  en: { it: 'Italian', en: 'English' },
} as const

export const passwordRules = {
  minLength: 12,
  hasLowerCase: /[a-z]/,
  hasUpperCase: /[A-Z]/,
  hasDigit: /\d/,
  hasSpecialChar: /[@$!%*?&_]/,
  email: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
} as const

export const RootLink = {
  label: 'PagoPA S.p.A.',
  href: 'https://www.pagopa.it',
  ariaLabel: 'Vai al sito di PagoPA S.p.A.',
  title: 'Vai al sito di PagoPA S.p.A.',
}

export const headLabels = (t: TFunction<'common', 'table'>): Array<string> => {
  return [
    t('eServiceName'),
    t('version'),
    t('producer'),
    t('eServiceStatus'),
    t('lastDetectionDate'),
    '',
  ]
}
