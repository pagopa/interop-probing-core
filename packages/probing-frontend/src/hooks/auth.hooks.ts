import { useMutation, useQuery } from '@tanstack/react-query'
import authService from '@/services/auth.service'
import { useTranslation } from 'react-i18next'

function useLogin() {
  const { t } = useTranslation('feedback')
  const { mutate: login } = useMutation(authService.login, {
    meta: {
      successToastLabel: t('auth.loginSuccessMessage'),
      errorToastLabel: t('auth.loginError'),
      loadingLabel: t('auth.loginSpinnerMessage'),
    },
  })

  return { login }
}
function usePasswordRecovery() {
  const { t } = useTranslation('feedback')
  return useMutation(authService.passwordRecovery, {
    meta: {
      successToastLabel: t('auth.recoverSuccessMessage'),
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

function useToken() {
  const { data: jwt, refetch } = useQuery({
    queryKey: ['token'],
    queryFn: authService.getSessionToken,
    staleTime: Infinity,
  })

  return { jwt, refetch }
}

export const AuthHooks = { useLogin, usePasswordRecovery, usePasswordReset, useToken, useLogout }
