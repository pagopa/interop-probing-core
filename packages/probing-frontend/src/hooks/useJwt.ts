import { useSyncExternalStore } from 'react'
type JwtUser = {
  'cognito:username': string
  exp: string
  email: string
}
function subscribe(callback: () => void): () => void {
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener('storage', callback)
  }
}
function getSnapshot(): string | null {
  return window.localStorage.getItem('token')
}
export function useJwt(): JwtUser {
  const jwt = useSyncExternalStore(subscribe, getSnapshot)
  return parseJwt(jwt)
}

function parseJwt(jwt: string | null): JwtUser {
  return jwt ? JSON.parse(window.atob(jwt.split('.')[1])) : null
}
