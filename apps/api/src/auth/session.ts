import { deleteCookie, getCookie, setCookie } from "hono/cookie"
import { createMiddleware } from "hono/factory"
import { HTTPException } from "hono/http-exception"
import type { AppContext, AppEnv } from "../env"
import { randomToken, sha256 } from "../lib/crypto"

const SESSION_COOKIE = "ayawe_session"
const SESSION_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

function isSecure(c: AppContext) {
  return c.env.APP_URL.startsWith("https://")
}

export async function createSession(c: AppContext, userId: string) {
  const token = randomToken()
  const expiresAt = Date.now() + SESSION_DAYS * DAY_MS
  await c.env.DB.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(await sha256(token), userId, expiresAt)
    .run()

  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isSecure(c),
    sameSite: "Lax",
    path: "/",
    expires: new Date(expiresAt),
  })
}

export async function destroySession(c: AppContext) {
  const token = getCookie(c, SESSION_COOKIE)
  if (token) {
    await c.env.DB.prepare("DELETE FROM sessions WHERE id = ?")
      .bind(await sha256(token))
      .run()
  }
  deleteCookie(c, SESSION_COOKIE, { path: "/", secure: isSecure(c) })
}

export const requireUser = createMiddleware<AppEnv>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) throw new HTTPException(401, { message: "Sign in first" })

  const session = await c.env.DB.prepare(
    "SELECT user_id AS userId FROM sessions WHERE id = ? AND expires_at > ?",
  )
    .bind(await sha256(token), Date.now())
    .first<{ userId: string }>()
  if (!session) throw new HTTPException(401, { message: "The session expired. Sign in again" })

  c.set("userId", session.userId)
  await next()
})
