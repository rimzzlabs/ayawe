import type { Result } from "@ayawe/crypto/result"

export async function copyText(text: string): Promise<Result<null>> {
  try {
    await navigator.clipboard.writeText(text)
    return { ok: true, value: null }
  } catch {
    return { ok: false, error: new Error("The browser blocked the clipboard") }
  }
}
