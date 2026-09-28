import { isKeyring, type Keyring } from "@ayawe/crypto/keyring"
import { err, ok, type Result } from "@ayawe/crypto/result"
import { isSealed, type Sealed } from "@ayawe/crypto/seal"

export interface Me {
  login: string
  avatarUrl: string | null
  hasKeyring: boolean
}

export interface Providers {
  github: boolean
  dev: boolean
}

export interface FolderSummary {
  id: string
  name: string
  updatedAt: number
}

export interface Folder extends FolderSummary {
  secrets: Sealed | null
}

async function readError(res: Response) {
  try {
    const body = (await res.json()) as { error?: string }
    return new Error(body.error ?? `The request failed (${res.status})`)
  } catch {
    return new Error(`The request failed (${res.status})`)
  }
}

async function request(path: string, init?: RequestInit): Promise<Result<Response>> {
  try {
    const headers = init?.body ? { "Content-Type": "application/json" } : undefined
    return ok(await fetch(`/api${path}`, { ...init, headers }))
  } catch {
    return err(new Error("The server is not reachable"))
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<Result<T>> {
  const result = await request(path, init)
  if (!result.ok) return result
  if (!result.value.ok) return err(await readError(result.value))
  return ok((await result.value.json()) as T)
}

async function requestEmpty(path: string, init?: RequestInit): Promise<Result<null>> {
  const result = await request(path, init)
  if (!result.ok) return result
  if (!result.value.ok) return err(await readError(result.value))
  return ok(null)
}

function jsonBody(method: string, body: unknown): RequestInit {
  return { method, body: JSON.stringify(body) }
}

export async function fetchMe(): Promise<Result<Me | null>> {
  const result = await request("/me")
  if (!result.ok) return result
  if (result.value.status === 401) return ok(null)
  if (!result.value.ok) return err(await readError(result.value))
  return ok((await result.value.json()) as Me)
}

export function fetchProviders() {
  return requestJson<Providers>("/auth/providers")
}

export function devSignIn() {
  return requestEmpty("/auth/dev", { method: "POST" })
}

export function signOut() {
  return requestEmpty("/me/sign-out", { method: "POST" })
}

export async function fetchKeyring(): Promise<Result<Keyring | null>> {
  const result = await request("/keyring")
  if (!result.ok) return result
  if (result.value.status === 404) return ok(null)
  if (!result.value.ok) return err(await readError(result.value))

  const body: unknown = await result.value.json()
  return isKeyring(body) ? ok(body) : err(new Error("The server returned a damaged keyring"))
}

export function saveKeyring(keyring: Keyring) {
  return requestEmpty("/keyring", jsonBody("PUT", keyring))
}

export function listFolders() {
  return requestJson<FolderSummary[]>("/folders")
}

export function createFolder(name: string) {
  return requestJson<FolderSummary>("/folders", jsonBody("POST", { name }))
}

export async function fetchFolder(id: string): Promise<Result<Folder>> {
  const result = await requestJson<Folder>(`/folders/${id}`)
  if (!result.ok) return result
  const secrets = result.value.secrets
  if (secrets !== null && !isSealed(secrets)) {
    return err(new Error("The server returned damaged secrets"))
  }
  return result
}

export function renameFolder(id: string, name: string) {
  return requestJson<FolderSummary>(`/folders/${id}`, jsonBody("PATCH", { name }))
}

export function saveSecrets(id: string, sealed: Sealed) {
  return requestJson<{ updatedAt: number }>(`/folders/${id}/secrets`, jsonBody("PUT", sealed))
}

export function deleteFolder(id: string) {
  return requestEmpty(`/folders/${id}`, { method: "DELETE" })
}
