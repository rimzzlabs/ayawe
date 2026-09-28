import { Hono } from "hono"
import type { AppContext, AppEnv } from "../env"

export function isDevLoginEnabled(c: AppContext) {
  return c.env.DEV_LOGIN === "true" && c.env.APP_URL.startsWith("http://localhost")
}

export const providerRoutes = new Hono<AppEnv>()

providerRoutes.get("/", (c) =>
  c.json({
    github: Boolean(c.env.GITHUB_CLIENT_ID && c.env.GITHUB_CLIENT_SECRET),
    dev: isDevLoginEnabled(c),
  }),
)
