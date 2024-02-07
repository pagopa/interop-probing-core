import awsConfigs from '@/config/aws-exports'
import { Auth, Amplify } from 'aws-amplify'

Amplify.configure(awsConfigs)

async function login(loginForm: { username: string; password: string }) {
  try {
    const { username, password } = loginForm
    const user = await Auth.signIn(username, password)
    const token = user.signInUserSession.idToken.jwtToken
    const refreshToken = user.signInUserSession.refreshToken.token
    const accessToken = user.signInUserSession.accessToken.jwtToken
    sessionStorage.setItem('token', token)
    sessionStorage.setItem('refreshToken', refreshToken)
    sessionStorage.setItem('accessToken', accessToken)
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
