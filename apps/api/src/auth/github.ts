import { Hono } from "hono"
import { deleteCookie, getCookie, setCookie } from "hono/cookie"
import type { AppContext, AppEnv } from "../env"
import { randomToken } from "../lib/crypto"
import { createSession } from "./session"
import { upsertGitHubUser } from "./users"

const STATE_COOKIE = "ayawe_oauth_state"
const USER_AGENT = "ayawe"

interface GitHubTokenResponse {
  access_token?: string
  error_description?: string
}

interface GitHubUser {
  id: number
  login: string
  avatar_url: string | null
}

function callbackUrl(c: AppContext) {
  return `${c.env.APP_URL}/api/auth/github/callback`
}

function redirectWithError(c: AppContext, message: string) {
  return c.redirect(`${c.env.APP_URL}/?error=${encodeURIComponent(message)}`)
}

function isAllowed(c: AppContext, login: string) {
  const allowed = c.env.ALLOWED_GITHUB_USERS?.trim()
  if (!allowed) return true
  return allowed
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .includes(login.toLowerCase())
}

async function fetchGitHubUser(c: AppContext, code: string) {
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: c.env.GITHUB_CLIENT_ID,
      client_secret: c.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: callbackUrl(c),
    }),
  })
  const token = (await tokenResponse.json()) as GitHubTokenResponse
  if (!token.access_token) throw new Error(token.error_description ?? "GitHub refused the sign-in")

  const userResponse = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token.access_token}`, "User-Agent": USER_AGENT },
  })
  if (!userResponse.ok) throw new Error("GitHub did not return the profile")
  return (await userResponse.json()) as GitHubUser
}

export const githubRoutes = new Hono<AppEnv>()

githubRoutes.get("/", (c) => {
  const state = randomToken(16)
  setCookie(c, STATE_COOKIE, state, {
    httpOnly: true,
    secure: c.env.APP_URL.startsWith("https://"),
    sameSite: "Lax",
    path: "/api/auth",
    maxAge: 600,
  })

  const params = new URLSearchParams({
    client_id: c.env.GITHUB_CLIENT_ID,
    redirect_uri: callbackUrl(c),
    state,
  })
  return c.redirect(`https://github.com/login/oauth/authorize?${params}`)
})

githubRoutes.get("/callback", async (c) => {
  const expectedState = getCookie(c, STATE_COOKIE)
  deleteCookie(c, STATE_COOKIE, { path: "/api/auth" })

  const code = c.req.query("code")
  if (!code || !expectedState || c.req.query("state") !== expectedState) {
    return redirectWithError(c, "The sign-in expired. Try again")
  }

  try {
    const profile = await fetchGitHubUser(c, code)
    if (!isAllowed(c, profile.login)) {
      return redirectWithError(c, `The GitHub user ${profile.login} has no access to this vault`)
    }

    const userId = await upsertGitHubUser(c, {
      id: profile.id,
      login: profile.login,
      avatarUrl: profile.avatar_url,
    })
    await createSession(c, userId)
    return c.redirect(`${c.env.APP_URL}/`)
  } catch (error) {
    console.error(error)
    return redirectWithError(c, "The sign-in with GitHub failed. Try again")
  }
})
