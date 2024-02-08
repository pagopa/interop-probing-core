import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import authService from '@/api/auth/auth.service'

function useLogin() {
  const { t } = useTranslation('feedback')
  return useMutation(authService.login, {
    meta: {
      successToastLabel: t('auth.loginSuccessMessage'),
      errorToastLabel: t('auth.loginError'),
      loadingLabel: t('auth.loginSpinnerMessage'),
    },
  })
}

function usePasswordRecovery() {
  const { t } = useTranslation('feedback')
  return useMutation(authService.passwordRecovery, {
    meta: {
      successToastLabel: t('auth.generic.success'),
      errorToastLabel: t('auth.recoverError'),
      loadingLabel: ' ',
    },
  })
}

function usePasswordReset() {
  const { t } = useTranslation('feedback')
  return useMutation(authService.passwordReset, {
    meta: {
      successToastLabel: t('auth.resetSuccessMessage'),
      errorToastLabel: t('auth.resetError'),
      loadingLabel: ' ',
    },
  })
}

function useLogout() {
  const { t } = useTranslation('feedback')
  return useMutation(authService.logout, {
    meta: {
      successToastLabel: t('auth.logoutSuccessMessage'),
      errorToastLabel: t('generic.error'),
      loadingLabel: ' ',
    },
  })
}

export const AuthHooks = { useLogin, usePasswordRecovery, usePasswordReset, useLogout }
