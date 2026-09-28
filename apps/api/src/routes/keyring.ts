import { isKeyring } from "@ayawe/crypto/keyring"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { requireUser } from "../auth/session"
import type { AppEnv } from "../env"

export const keyringRoutes = new Hono<AppEnv>()

keyringRoutes.use(requireUser)

keyringRoutes.get("/", async (c) => {
  const row = await c.env.DB.prepare("SELECT keyring FROM users WHERE id = ?")
    .bind(c.get("userId"))
    .first<{ keyring: string | null }>()
  if (!row?.keyring) throw new HTTPException(404, { message: "Set a vault password first" })
  return c.json(JSON.parse(row.keyring))
})

keyringRoutes.put("/", async (c) => {
  const body: unknown = await c.req.json()
  if (!isKeyring(body)) throw new HTTPException(400, { message: "The keyring has the wrong shape" })

  await c.env.DB.prepare("UPDATE users SET keyring = ? WHERE id = ?")
    .bind(JSON.stringify(body), c.get("userId"))
    .run()
  return c.body(null, 204)
})
