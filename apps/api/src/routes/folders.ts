import { isSealed } from "@ayawe/crypto/seal"
import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { requireUser } from "../auth/session"
import type { AppContext, AppEnv } from "../env"

const MAX_NAME_LENGTH = 64

interface FolderRow {
  id: string
  name: string
  secrets: string | null
  updatedAt: number
}

function parseName(value: unknown) {
  const name = typeof value === "string" ? value.trim() : ""
  if (name.length === 0 || name.length > MAX_NAME_LENGTH) {
    throw new HTTPException(400, { message: `Use 1 to ${MAX_NAME_LENGTH} characters for the name` })
  }
  return name
}

function isUniqueError(error: unknown) {
  return error instanceof Error && error.message.includes("UNIQUE constraint failed")
}

async function findFolder(c: AppContext) {
  const folder = await c.env.DB.prepare(
    "SELECT id, name, secrets, updated_at AS updatedAt FROM folders WHERE id = ? AND user_id = ?",
  )
    .bind(c.req.param("id"), c.get("userId"))
    .first<FolderRow>()
  if (!folder) throw new HTTPException(404, { message: "The folder does not exist" })
  return folder
}

export const folderRoutes = new Hono<AppEnv>()

folderRoutes.use(requireUser)

folderRoutes.get("/", async (c) => {
  const folders = await c.env.DB.prepare(
    "SELECT id, name, updated_at AS updatedAt FROM folders WHERE user_id = ? ORDER BY name COLLATE NOCASE",
  )
    .bind(c.get("userId"))
    .all<Omit<FolderRow, "secrets">>()
  return c.json(folders.results)
})

folderRoutes.post("/", async (c) => {
  const body = await c.req.json<{ name?: unknown }>()
  const name = parseName(body.name)
  const now = Date.now()
  const id = crypto.randomUUID()

  try {
    await c.env.DB.prepare(
      "INSERT INTO folders (id, user_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    )
      .bind(id, c.get("userId"), name, now, now)
      .run()
  } catch (error) {
    if (isUniqueError(error))
      throw new HTTPException(409, { message: "A folder with this name exists" })
    throw error
  }
  return c.json({ id, name, updatedAt: now }, 201)
})

folderRoutes.get("/:id", async (c) => {
  const folder = await findFolder(c)
  return c.json({ ...folder, secrets: folder.secrets ? JSON.parse(folder.secrets) : null })
})

folderRoutes.patch("/:id", async (c) => {
  const folder = await findFolder(c)
  const body = await c.req.json<{ name?: unknown }>()
  const name = parseName(body.name)
  const now = Date.now()

  try {
    await c.env.DB.prepare("UPDATE folders SET name = ?, updated_at = ? WHERE id = ?")
      .bind(name, now, folder.id)
      .run()
  } catch (error) {
    if (isUniqueError(error))
      throw new HTTPException(409, { message: "A folder with this name exists" })
    throw error
  }
  return c.json({ id: folder.id, name, updatedAt: now })
})

folderRoutes.put("/:id/secrets", async (c) => {
  const folder = await findFolder(c)
  const body: unknown = await c.req.json()
  if (!isSealed(body)) throw new HTTPException(400, { message: "The secrets must be encrypted" })

  const now = Date.now()
  await c.env.DB.prepare("UPDATE folders SET secrets = ?, updated_at = ? WHERE id = ?")
    .bind(JSON.stringify(body), now, folder.id)
    .run()
  return c.json({ updatedAt: now })
})

folderRoutes.delete("/:id", async (c) => {
  const folder = await findFolder(c)
  await c.env.DB.prepare("DELETE FROM folders WHERE id = ?").bind(folder.id).run()
  return c.body(null, 204)
})
