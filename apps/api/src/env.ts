import type { Context } from "hono"

export interface Env {
  DB: D1Database
  /** The public URL of the app, for example `https://ayawe.example.workers.dev`. */
  APP_URL: string
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  /** Optional comma-separated GitHub logins. When set, only these users can sign in. */
  ALLOWED_GITHUB_USERS?: string
  /** Set to "true" in `.dev.vars` to sign in without GitHub. Works only on localhost. */
  DEV_LOGIN?: string
}

export interface Variables {
  userId: string
}

export interface AppEnv {
  Bindings: Env
  Variables: Variables
}

export type AppContext = Context<AppEnv>
