import type { Keyring } from "@ayawe/crypto/keyring"
import { fetchKeyring } from "./api"

export interface Session {
  token: string
  keyring: Keyring
  dataKey: CryptoKey
  names: string[]
}

export type Screen =
  | { kind: "connect"; error?: string }
  | { kind: "setup"; token: string }
  | { kind: "recovery-code"; recoveryCode: string; session: Session }
  | { kind: "unlock"; token: string; keyring: Keyring }
  | { kind: "recover"; token: string; keyring: Keyring }
  | { kind: "vault"; session: Session }

export async function screenForToken(token: string): Promise<Screen> {
  const keyring = await fetchKeyring(token)
  if (!keyring.ok) return { kind: "connect", error: keyring.error.message }
  if (!keyring.value) return { kind: "setup", token }
  return { kind: "unlock", token, keyring: keyring.value }
}
