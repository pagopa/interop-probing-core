import awsConfigs from '@/config/aws-exports'
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
    localStorage.setItem('token', jwt)
  } catch {
    throw new AuthenticationError()
  }
}
async function logout() {
  try {
    await Auth.signOut()
    localStorage.clear()
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
  new_password,
}: {
  username: string
  code: string
  new_password: string
}) {
  try {
    await Auth.forgotPasswordSubmit(username, code, new_password)
  } catch {
    throw new AuthenticationError()
  }
}

const authService = { login, logout, passwordRecovery, passwordReset }
export default authService
