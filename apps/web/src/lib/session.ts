import type { Keyring } from "@ayawe/crypto/keyring"
import { ok, type Result } from "@ayawe/crypto/result"
import { fetchKeyring, fetchMe, type Me } from "./api"

export interface Session {
  me: Me
  keyring: Keyring
  dataKey: CryptoKey
}

interface SessionState {
  /** `undefined` until the server answers. `null` when nobody is signed in. */
  me: Me | null | undefined
  /** `undefined` until the server answers. `null` when the user has no vault yet. */
  keyring: Keyring | null | undefined
  /** Only in memory. A reload forgets it, so the user unlocks again. */
  dataKey: CryptoKey | null
  /** Shown once after setup, then cleared. */
  recoveryCode: string | null
}

// After this long, the next navigation asks the server again, so a session that ended
// elsewhere (sign-out on another tab, an expired cookie) shows up without a reload.
const ME_MAX_AGE_MS = 5 * 60 * 1000

const SIGNED_OUT: SessionState = {
  me: undefined,
  keyring: undefined,
  dataKey: null,
  recoveryCode: null,
}

// Module state, not React state: route guards in `beforeLoad` read it before anything renders.
let state = SIGNED_OUT
let meLoadedAt = 0

export async function loadMe(): Promise<Result<Me | null>> {
  const fresh = Date.now() - meLoadedAt < ME_MAX_AGE_MS
  if (state.me !== undefined && fresh) return ok(state.me)
  const me = await fetchMe()
  if (!me.ok) return me
  meLoadedAt = Date.now()
  // A different user or a sign-out elsewhere: the old vault key must not stay in memory.
  if (me.value?.login !== state.me?.login && state.me !== undefined) state = { ...SIGNED_OUT }
  state = { ...state, me: me.value }
  return me
}

/** Forgets the cached user and asks the server again, for example after a sign-in. */
export function reloadMe() {
  state = { ...state, me: undefined }
  return loadMe()
}

export async function loadKeyring(): Promise<Result<Keyring | null>> {
  if (state.keyring !== undefined) return ok(state.keyring)
  const keyring = await fetchKeyring()
  if (keyring.ok) state = { ...state, keyring: keyring.value }
  return keyring
}

export function getSession(): Session | null {
  if (!state.me || !state.keyring || !state.dataKey) return null
  return { me: state.me, keyring: state.keyring, dataKey: state.dataKey }
}

export function unlock(dataKey: CryptoKey) {
  state = { ...state, dataKey }
}

export function lock() {
  state = { ...state, dataKey: null }
}

interface NewVault {
  keyring: Keyring
  dataKey: CryptoKey
  /** Only after setup. A recovery reuses the code the user already has. */
  recoveryCode?: string
}

/** Stores a vault that was just created or recovered, and unlocks it. */
export function openNewVault(params: NewVault) {
  state = {
    ...state,
    me: state.me ? { ...state.me, hasKeyring: true } : state.me,
    keyring: params.keyring,
    dataKey: params.dataKey,
    recoveryCode: params.recoveryCode ?? null,
  }
}

export function peekRecoveryCode() {
  return state.recoveryCode
}

export function clearRecoveryCode() {
  state = { ...state, recoveryCode: null }
}

export function clearSession() {
  state = { ...SIGNED_OUT, me: null }
}
