import type { Result } from "@ayawe/crypto/result"

export async function checkHealth(): Promise<Result<boolean>> {
  try {
    const res = await fetch("/api/health")
    if (!res.ok) return { ok: false, error: new Error(`API returned ${res.status}`) }
    return { ok: true, value: true }
  } catch {
    return { ok: false, error: new Error("The API is not reachable") }
  }
}
