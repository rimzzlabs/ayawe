import type { Keyring } from "@ayawe/crypto/keyring"
import type { Result } from "@ayawe/crypto/result"
import {
  type FolderSummary,
  fetchKeyring,
  fetchMe,
  fetchProviders,
  listFolders,
  type Me,
  type Providers,
} from "./api"

export interface Session {
  me: Me
  keyring: Keyring
  dataKey: CryptoKey
}

export type Screen =
  | { kind: "landing"; providers: Providers; error?: string }
  | { kind: "setup"; me: Me }
  | { kind: "recovery-code"; recoveryCode: string; session: Session }
  | { kind: "unlock"; me: Me; keyring: Keyring }
  | { kind: "recover"; me: Me; keyring: Keyring }
  | { kind: "vault"; session: Session; folders: FolderSummary[] }
  | { kind: "error"; message: string }

export async function screenForUser(me: Me): Promise<Screen> {
  if (!me.hasKeyring) return { kind: "setup", me }

  const keyring = await fetchKeyring()
  if (!keyring.ok) return { kind: "error", message: keyring.error.message }
  if (!keyring.value) return { kind: "setup", me }
  return { kind: "unlock", me, keyring: keyring.value }
}

export async function landingScreen(error?: string): Promise<Screen> {
  const providers = await fetchProviders()
  if (!providers.ok) return { kind: "error", message: providers.error.message }
  return { kind: "landing", providers: providers.value, error }
}

// GitHub sends sign-in errors back as `/?error=...`. Read it once, then clean the URL.
function takeErrorFromUrl() {
  const error = new URLSearchParams(window.location.search).get("error") ?? undefined
  if (error) window.history.replaceState(null, "", "/")
  return error
}

export async function resolveStartScreen(): Promise<Screen> {
  const error = takeErrorFromUrl()
  const me = await fetchMe()
  if (!me.ok) return { kind: "error", message: me.error.message }
  if (!me.value) return landingScreen(error)
  return screenForUser(me.value)
}

export async function openVault(session: Session): Promise<Result<Screen>> {
  const folders = await listFolders()
  if (!folders.ok) return folders
  return { ok: true, value: { kind: "vault", session, folders: folders.value } }
}
