import type { ProductSwitchItem } from '@pagopa/mui-italia'

export const documentationLink =
  'https://developer.pagopa.it/pdnd-interoperabilita/guides/manuale-operativo-pdnd-interoperabilita/probing'
export const assistanceLink = 'https://selfcare.pagopa.it/assistenza?productId=prod-interop'
export const productSwitchItem: ProductSwitchItem = {
  id: 'prod-interop',
  title: `Interoperabilità`,
  productUrl: '',
  linkType: 'internal',
}
export const STORAGE_KEY_SESSION_TOKEN = 'token'
export const API_BASE_PATH = import.meta.env.VITE_BASE_PATH
export const CATALOGUE_BASE_PATH = import.meta.env.VITE_PAGOPA_CATALOGUE
export const LANGUAGES = {
  it: { it: 'Italiano' },
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
