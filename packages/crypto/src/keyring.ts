import { fromBase64, fromRecoveryCode, toBase64, toRecoveryCode } from "./encoding"
import { err, ok, type Result } from "./result"

const PBKDF2_ITERATIONS = 600_000
const KEY_BYTES = 32
const IV_BYTES = 12
const SALT_BYTES = 16

export interface KeySlot {
  iv: string
  wrappedKey: string
}

export interface PasswordSlot extends KeySlot {
  salt: string
  iterations: number
}

/**
 * Envelope encryption: one random data key encrypts every value.
 * The keyring stores two wrapped copies of that data key,
 * one for the password and one for the recovery code.
 * If both the password and the recovery code are lost, the data cannot be decrypted.
 */
export interface Keyring {
  version: 1
  password: PasswordSlot
  recovery: KeySlot
}

export interface NewKeyring {
  keyring: Keyring
  dataKey: CryptoKey
  recoveryCode: string
}

interface PasswordKeyParams {
  password: string
  salt: Uint8Array<ArrayBuffer>
  iterations: number
}

interface ChangePasswordParams {
  keyring: Keyring
  dataKey: CryptoKey
  password: string
}

function randomBytes(length: number) {
  return crypto.getRandomValues(new Uint8Array(length))
}

// PBKDF2 with 600k iterations is slow on purpose (~0.3s): it makes password guessing expensive.
async function derivePasswordKey(params: PasswordKeyParams) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(params.password),
    "PBKDF2",
    false,
    ["deriveKey"],
  )
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: params.salt, iterations: params.iterations },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["wrapKey", "unwrapKey"],
  )
}

function importRecoveryKey(bytes: Uint8Array<ArrayBuffer>) {
  return crypto.subtle.importKey("raw", bytes, "AES-GCM", false, ["wrapKey", "unwrapKey"])
}

async function wrapDataKey(dataKey: CryptoKey, wrappingKey: CryptoKey): Promise<KeySlot> {
  const iv = randomBytes(IV_BYTES)
  const wrapped = await crypto.subtle.wrapKey("raw", dataKey, wrappingKey, { name: "AES-GCM", iv })
  return { iv: toBase64(iv), wrappedKey: toBase64(new Uint8Array(wrapped)) }
}

async function unwrapDataKey(slot: KeySlot, wrappingKey: CryptoKey): Promise<Result<CryptoKey>> {
  try {
    const dataKey = await crypto.subtle.unwrapKey(
      "raw",
      fromBase64(slot.wrappedKey),
      wrappingKey,
      { name: "AES-GCM", iv: fromBase64(slot.iv) },
      "AES-GCM",
      true,
      ["encrypt", "decrypt"],
    )
    return ok(dataKey)
  } catch {
    return err(new Error("The key is incorrect"))
  }
}

async function createPasswordSlot(dataKey: CryptoKey, password: string): Promise<PasswordSlot> {
  const salt = randomBytes(SALT_BYTES)
  const passwordKey = await derivePasswordKey({ password, salt, iterations: PBKDF2_ITERATIONS })
  const slot = await wrapDataKey(dataKey, passwordKey)
  return { ...slot, salt: toBase64(salt), iterations: PBKDF2_ITERATIONS }
}

export async function createKeyring(password: string): Promise<NewKeyring> {
  const dataKey = await crypto.subtle.importKey("raw", randomBytes(KEY_BYTES), "AES-GCM", true, [
    "encrypt",
    "decrypt",
  ])
  const recoveryBytes = randomBytes(KEY_BYTES)
  const recoveryKey = await importRecoveryKey(recoveryBytes)

  const keyring: Keyring = {
    version: 1,
    password: await createPasswordSlot(dataKey, password),
    recovery: await wrapDataKey(dataKey, recoveryKey),
  }
  return { keyring, dataKey, recoveryCode: toRecoveryCode(recoveryBytes) }
}

export async function unlockWithPassword(keyring: Keyring, password: string) {
  const passwordKey = await derivePasswordKey({
    password,
    salt: fromBase64(keyring.password.salt),
    iterations: keyring.password.iterations,
  })
  return unwrapDataKey(keyring.password, passwordKey)
}

export async function unlockWithRecoveryCode(keyring: Keyring, recoveryCode: string) {
  const bytes = fromRecoveryCode(recoveryCode, KEY_BYTES)
  if (!bytes) return err(new Error("The recovery code has the wrong format"))
  return unwrapDataKey(keyring.recovery, await importRecoveryKey(bytes))
}

export async function changePassword(params: ChangePasswordParams): Promise<Keyring> {
  return { ...params.keyring, password: await createPasswordSlot(params.dataKey, params.password) }
}

export function isKeyring(value: unknown): value is Keyring {
  if (typeof value !== "object" || value === null) return false
  const keyring = value as Partial<Keyring>
  return (
    keyring.version === 1 &&
    typeof keyring.password?.salt === "string" &&
    typeof keyring.password.iterations === "number" &&
    typeof keyring.password.iv === "string" &&
    typeof keyring.password.wrappedKey === "string" &&
    typeof keyring.recovery?.iv === "string" &&
    typeof keyring.recovery.wrappedKey === "string"
  )
}
