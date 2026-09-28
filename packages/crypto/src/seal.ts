import { fromBase64, toBase64 } from "./encoding"
import { err, ok, type Result } from "./result"

const IV_BYTES = 12

export interface Sealed {
  iv: string
  ciphertext: string
}

export async function seal(dataKey: CryptoKey, plaintext: string): Promise<Sealed> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    dataKey,
    new TextEncoder().encode(plaintext),
  )
  return { iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(ciphertext)) }
}

export async function open(dataKey: CryptoKey, sealed: Sealed): Promise<Result<string>> {
  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(sealed.iv) },
      dataKey,
      fromBase64(sealed.ciphertext),
    )
    return ok(new TextDecoder().decode(plaintext))
  } catch {
    return err(new Error("The value cannot be decrypted with this key"))
  }
}

export function isSealed(value: unknown): value is Sealed {
  if (typeof value !== "object" || value === null) return false
  const sealed = value as Partial<Sealed>
  return typeof sealed.iv === "string" && typeof sealed.ciphertext === "string"
}
