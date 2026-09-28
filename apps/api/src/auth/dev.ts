import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import type { AppEnv } from "../env"
import { isDevLoginEnabled } from "./providers"
import { createSession } from "./session"
import { upsertGitHubUser } from "./users"

const DEV_GITHUB_ID = -1

export const devRoutes = new Hono<AppEnv>()

// Local only: sign in as a fake user, so contributors can run the app without a GitHub OAuth app.
devRoutes.post("/", async (c) => {
  if (!isDevLoginEnabled(c)) throw new HTTPException(404, { message: "Not found" })

  const userId = await upsertGitHubUser(c, { id: DEV_GITHUB_ID, login: "dev", avatarUrl: null })
  await createSession(c, userId)
  return c.body(null, 204)
})
