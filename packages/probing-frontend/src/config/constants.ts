export const STORAGE_KEY_SESSION_TOKEN = 'jwt'

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
