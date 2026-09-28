import { isKeyring } from "@ayawe/crypto/keyring"
import { isSealed } from "@ayawe/crypto/seal"
import { Hono } from "hono"
import { bearerAuth } from "hono/bearer-auth"
import { HTTPException } from "hono/http-exception"
import { timingSafeEqual } from "hono/utils/buffer"
import type { Env } from "./env"

const KEYRING_KEY = "keyring"
const ENV_PREFIX = "env:"
const ENV_NAME = /^[a-z0-9._-]{1,64}$/i

const app = new Hono<{ Bindings: Env }>()

function parseEnvName(name: string) {
  if (!ENV_NAME.test(name)) {
    throw new HTTPException(400, { message: "Use 1 to 64 letters, digits, dots, dashes, or underscores" })
  }
  return `${ENV_PREFIX}${name}`
}

app.get("/api/health", (c) => c.json({ ok: true }))

// The server stores only ciphertext. The token only stops other people from writing or deleting data.
app.use(
  "/api/*",
  // bearerAuth types its context without our Bindings, so cast env here.
  bearerAuth({ verifyToken: (token, c) => timingSafeEqual(token, (c.env as Env).AYAWE_TOKEN) }),
)

app.get("/api/keyring", async (c) => {
  const keyring = await c.env.VAULT.get(KEYRING_KEY, "json")
  if (!keyring) throw new HTTPException(404, { message: "No keyring exists yet" })
  return c.json(keyring)
})

app.put("/api/keyring", async (c) => {
  const body = await c.req.json()
  if (!isKeyring(body)) throw new HTTPException(400, { message: "The keyring has the wrong shape" })
  await c.env.VAULT.put(KEYRING_KEY, JSON.stringify(body))
  return c.body(null, 204)
})

app.get("/api/envs", async (c) => {
  const list = await c.env.VAULT.list({ prefix: ENV_PREFIX })
  return c.json(list.keys.map((key) => key.name.slice(ENV_PREFIX.length)))
})

app.get("/api/envs/:name", async (c) => {
  const sealed = await c.env.VAULT.get(parseEnvName(c.req.param("name")), "json")
  if (!sealed) throw new HTTPException(404, { message: "No env exists with this name" })
  return c.json(sealed)
})

app.put("/api/envs/:name", async (c) => {
  const key = parseEnvName(c.req.param("name"))
  const body = await c.req.json()
  if (!isSealed(body)) throw new HTTPException(400, { message: "The value must be encrypted" })
  await c.env.VAULT.put(key, JSON.stringify(body))
  return c.body(null, 204)
})

app.delete("/api/envs/:name", async (c) => {
  await c.env.VAULT.delete(parseEnvName(c.req.param("name")))
  return c.body(null, 204)
})

app.onError((error, c) => {
  if (error instanceof HTTPException) return c.json({ error: error.message }, error.status)
  console.error(error)
  return c.json({ error: "Internal error" }, 500)
})

export default app
