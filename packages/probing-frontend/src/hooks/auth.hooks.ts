import { useMutation } from '@tanstack/react-query'
import authService from '@/services/auth.service'

function useLogin() {
  return useMutation(authService.login)
}

export const AuthHooks = { useLogin }
