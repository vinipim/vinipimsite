export const COOKIE_NAME = "session"
export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000
export const AXIOS_TIMEOUT_MS = 30000

export function getLoginUrl(redirectTo?: string): string {
  const baseUrl = import.meta.env.VITE_OAUTH_SERVER_URL || ""
  const appId = import.meta.env.VITE_APP_ID || ""
  const currentOrigin = window.location.origin
  const redirect = redirectTo || window.location.pathname
  const redirectUri = `${currentOrigin}/api/auth/callback`
  const state = btoa(redirectUri)

  return `${baseUrl}/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&response_type=code`
}
