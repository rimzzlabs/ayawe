import { Hono } from "hono"
import { csrf } from "hono/csrf"
import { HTTPException } from "hono/http-exception"
import { devRoutes } from "./auth/dev"
import { githubRoutes } from "./auth/github"
import { providerRoutes } from "./auth/providers"
import type { AppEnv } from "./env"
import { folderRoutes } from "./routes/folders"
import { keyringRoutes } from "./routes/keyring"
import { meRoutes } from "./routes/me"

const app = new Hono<AppEnv>()

// Session cookies travel with every request, so reject state changes from other origins.
app.use("/api/*", (c, next) => csrf({ origin: c.env.APP_URL })(c, next))

app.get("/api/health", (c) => c.json({ ok: true }))
app.route("/api/auth/providers", providerRoutes)
app.route("/api/auth/github", githubRoutes)
app.route("/api/auth/dev", devRoutes)
app.route("/api/me", meRoutes)
app.route("/api/keyring", keyringRoutes)
app.route("/api/folders", folderRoutes)

app.onError((error, c) => {
  if (error instanceof HTTPException) return c.json({ error: error.message }, error.status)
  console.error(error)
  return c.json({ error: "Internal error" }, 500)
})

export default app
