import { useMutation, useQuery } from '@tanstack/react-query'
import authService from '@/services/auth.service'

function useLogin() {
  return useMutation(authService.login)
}

function usePasswordRecovery() {
  return useMutation(authService.passwordRecovery)
}
function usePasswordReset() {
  return useMutation(authService.passwordReset)
}
function useLogout() {
  return useMutation(authService.logout)
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
