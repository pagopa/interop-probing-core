import { awsConfigs } from '@/config/aws-exports'
import { STORAGE_KEY_SESSION_TOKEN } from '@/config/constants'
import { AuthenticationError } from '@/utils/errors.utils'
import { Amplify } from 'aws-amplify'
import { signIn, signOut, resetPassword, confirmResetPassword } from '@aws-amplify/auth'
import { AuthSession, fetchAuthSession } from '@aws-amplify/core'

Amplify.configure(awsConfigs)

const TokenStorage = {
  set(jwt: string): void {
    localStorage.setItem(STORAGE_KEY_SESSION_TOKEN, jwt)
  },
  clear(): void {
    localStorage.removeItem(STORAGE_KEY_SESSION_TOKEN)
  },
}

interface LoginForm {
  username: string
  password: string
}

async function login(loginForm: LoginForm): Promise<void> {
  try {
    const { username, password } = loginForm
    await signIn({ username, password })
    const session: AuthSession = await fetchAuthSession()
    const jwt = session.tokens?.idToken?.toString()
    if (!jwt) throw new AuthenticationError()
    TokenStorage.set(jwt)
  } catch {
    TokenStorage.clear()
    throw new AuthenticationError()
  }
}

async function logout() {
  try {
    await signOut()
  } catch {
    throw new AuthenticationError()
  } finally {
    TokenStorage.clear()
  }
}

async function passwordRecovery(username: string) {
  try {
    await resetPassword({ username })
  } catch {
    throw new AuthenticationError()
  }
}

async function passwordReset({
  username,
  code,
  newPassword,
}: {
  username: string
  code: string
  newPassword: string
}) {
  try {
    await confirmResetPassword({ username, newPassword, confirmationCode: code })
  } catch {
    throw new AuthenticationError()
  }
}

const authService = { login, logout, passwordRecovery, passwordReset }
export default authService
