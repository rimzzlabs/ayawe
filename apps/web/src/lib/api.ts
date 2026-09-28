import { isKeyring, type Keyring } from "@ayawe/crypto/keyring"
import { err, ok, type Result } from "@ayawe/crypto/result"
import { isSealed, type Sealed } from "@ayawe/crypto/seal"

export const ENV_NAME_PATTERN = /^[a-z0-9._-]{1,64}$/i

interface RequestParams {
  token: string
  path: string
  init?: RequestInit
}

interface SaveEnvParams {
  token: string
  name: string
  sealed: Sealed
}

async function readError(res: Response) {
  try {
    const body = (await res.json()) as { error?: string }
    return new Error(body.error ?? `The request failed (${res.status})`)
  } catch {
    return new Error(`The request failed (${res.status})`)
  }
}

async function request(params: RequestParams): Promise<Result<Response>> {
  try {
    const res = await fetch(`/api${params.path}`, {
      ...params.init,
      headers: { Authorization: `Bearer ${params.token}`, "Content-Type": "application/json" },
    })
    if (res.status === 401) return err(new Error("The access token is wrong"))
    return ok(res)
  } catch {
    return err(new Error("The server is not reachable"))
  }
}

async function requestEmpty(params: RequestParams): Promise<Result<null>> {
  const result = await request(params)
  if (!result.ok) return result
  if (!result.value.ok) return err(await readError(result.value))
  return ok(null)
}

export async function fetchKeyring(token: string): Promise<Result<Keyring | null>> {
  const result = await request({ token, path: "/keyring" })
  if (!result.ok) return result
  if (result.value.status === 404) return ok(null)
  if (!result.value.ok) return err(await readError(result.value))

  const body: unknown = await result.value.json()
  return isKeyring(body) ? ok(body) : err(new Error("The server returned a damaged keyring"))
}

export function saveKeyring(token: string, keyring: Keyring) {
  return requestEmpty({ token, path: "/keyring", init: { method: "PUT", body: JSON.stringify(keyring) } })
}

export async function listEnvs(token: string): Promise<Result<string[]>> {
  const result = await request({ token, path: "/envs" })
  if (!result.ok) return result
  if (!result.value.ok) return err(await readError(result.value))

  const names = (await result.value.json()) as string[]
  return ok(names.toSorted((a, b) => a.localeCompare(b)))
}

export async function fetchEnv(token: string, name: string): Promise<Result<Sealed>> {
  const result = await request({ token, path: `/envs/${encodeURIComponent(name)}` })
  if (!result.ok) return result
  if (!result.value.ok) return err(await readError(result.value))

  const body: unknown = await result.value.json()
  return isSealed(body) ? ok(body) : err(new Error("The server returned a damaged value"))
}

export function saveEnv(params: SaveEnvParams) {
  return requestEmpty({
    token: params.token,
    path: `/envs/${encodeURIComponent(params.name)}`,
    init: { method: "PUT", body: JSON.stringify(params.sealed) },
  })
}

export function deleteEnv(token: string, name: string) {
  return requestEmpty({ token, path: `/envs/${encodeURIComponent(name)}`, init: { method: "DELETE" } })
}
