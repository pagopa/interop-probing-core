import { awsConfigs } from '@/config/aws-exports'
import { STORAGE_KEY_SESSION_TOKEN } from '@/config/constants'
import { AuthenticationError } from '@/utils/errors.utils'
import { Auth, Amplify } from 'aws-amplify'

Amplify.configure(awsConfigs)
type User = {
  signInUserSession: {
    idToken: { jwtToken: string }
  }
}

interface LoginForm {
  username: string
  password: string
}

async function login(loginForm: LoginForm): Promise<void> {
  try {
    const { username, password } = loginForm
    const { signInUserSession }: User = await Auth.signIn(username, password)
    const jwt = signInUserSession.idToken.jwtToken
    localStorage.setItem(STORAGE_KEY_SESSION_TOKEN, jwt)
  } catch {
    throw new AuthenticationError()
  }
}
async function logout() {
  try {
    await Auth.signOut()
    localStorage.removeItem(STORAGE_KEY_SESSION_TOKEN)
  } catch {
    throw new AuthenticationError()
  }
}

async function passwordRecovery(username: string) {
  try {
    await Auth.forgotPassword(username)
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
    await Auth.forgotPasswordSubmit(username, code, newPassword)
  } catch {
    throw new AuthenticationError()
  }
}

const authService = { login, logout, passwordRecovery, passwordReset }
export default authService
