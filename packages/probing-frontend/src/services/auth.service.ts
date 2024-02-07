import awsConfigs from '@/config/aws-exports'
import { Auth, Amplify } from 'aws-amplify'

Amplify.configure(awsConfigs)
type User = {
  username: string
  attributes: {
    email: string
    email_verified: boolean
    sub: string
  }
  signInUserSession: {
    idToken: { jwtToken: string }
    refreshToken: { token: string }
    accessToken: { jwtToken: string }
  }
}

interface LoginForm {
  username: string
  password: string
}

async function login(loginForm: LoginForm): Promise<User | unknown> {
  try {
    const { username, password } = loginForm
    const {
      signInUserSession: user,
      attributes,
      username: loggedUsername,
    }: User = await Auth.signIn(username, password)

    const { idToken, refreshToken, accessToken } = user
    const { jwtToken: token } = idToken
    const { token: refreshTokenToken } = refreshToken
    const { jwtToken: accessTokenToken } = accessToken

    const { email } = attributes

    sessionStorage.setItem('email', email)
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('username', loggedUsername)
    sessionStorage.setItem('refreshToken', refreshTokenToken)
    sessionStorage.setItem('accessToken', accessTokenToken)

    return user
  } catch (error) {
    throw error
  }
}
async function logout() {
  try {
    await Auth.signOut()
    sessionStorage.clear()
  } catch (error) {
    throw error
  }
}

async function passwordRecovery(username: string) {
  try {
    await Auth.forgotPassword(username)
  } catch (error) {
    throw error
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
  } catch (error) {
    throw error
  }
}

async function getSessionToken(): Promise<string | null> {
  try {
    const token = sessionStorage.getItem('token')
    return token
  } catch (error) {
    console.error('Error retrieving token from session storage:', error)
    return null
  }
}
const authService = { login, logout, passwordRecovery, passwordReset, getSessionToken }
export default authService
