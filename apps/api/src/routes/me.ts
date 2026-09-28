import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { destroySession, requireUser } from "../auth/session"
import type { AppEnv } from "../env"

export const meRoutes = new Hono<AppEnv>()

meRoutes.get("/", requireUser, async (c) => {
  const user = await c.env.DB.prepare(
    "SELECT github_login AS login, avatar_url AS avatarUrl, keyring IS NOT NULL AS hasKeyring FROM users WHERE id = ?",
  )
    .bind(c.get("userId"))
    .first<{ login: string; avatarUrl: string | null; hasKeyring: number }>()
  if (!user) throw new HTTPException(401, { message: "Sign in first" })

  return c.json({ login: user.login, avatarUrl: user.avatarUrl, hasKeyring: user.hasKeyring === 1 })
})

meRoutes.post("/sign-out", async (c) => {
  await destroySession(c)
  return c.body(null, 204)
})
