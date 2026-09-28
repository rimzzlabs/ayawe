import type { AppContext } from "../env"

interface GitHubProfile {
  id: number
  login: string
  avatarUrl: string | null
}

export async function upsertGitHubUser(c: AppContext, profile: GitHubProfile) {
  const user = await c.env.DB.prepare(
    `INSERT INTO users (id, github_id, github_login, avatar_url, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (github_id) DO UPDATE SET github_login = excluded.github_login, avatar_url = excluded.avatar_url
     RETURNING id`,
  )
    .bind(crypto.randomUUID(), profile.id, profile.login, profile.avatarUrl, Date.now())
    .first<{ id: string }>()
  if (!user) throw new Error("The user was not saved")
  return user.id
}
