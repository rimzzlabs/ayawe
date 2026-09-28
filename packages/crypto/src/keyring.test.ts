import { describe, expect, it } from "vitest"
import {
  changePassword,
  createKeyring,
  isKeyring,
  unlockWithPassword,
  unlockWithRecoveryCode,
} from "./keyring"
import { open, seal } from "./seal"

const ENV = "DATABASE_URL=postgres://localhost/app\nAPI_KEY=secret"

describe("keyring", () => {
  it("unlocks with the password and decrypts the value", async () => {
    const created = await createKeyring("correct horse")
    const sealed = await seal(created.dataKey, ENV)

    const unlocked = await unlockWithPassword(created.keyring, "correct horse")
    if (!unlocked.ok) throw unlocked.error
    const opened = await open(unlocked.value, sealed)

    expect(opened).toEqual({ ok: true, value: ENV })
  })

  it("rejects a wrong password", async () => {
    const created = await createKeyring("correct horse")
    const unlocked = await unlockWithPassword(created.keyring, "wrong horse")
    expect(unlocked.ok).toBe(false)
  })

  it("unlocks with the recovery code, then sets a new password", async () => {
    const created = await createKeyring("forgotten")
    const sealed = await seal(created.dataKey, ENV)

    const recovered = await unlockWithRecoveryCode(created.keyring, created.recoveryCode)
    if (!recovered.ok) throw recovered.error
    const keyring = await changePassword({
      keyring: created.keyring,
      dataKey: recovered.value,
      password: "new password",
    })

    const unlocked = await unlockWithPassword(keyring, "new password")
    if (!unlocked.ok) throw unlocked.error
    expect(await open(unlocked.value, sealed)).toEqual({ ok: true, value: ENV })
    expect((await unlockWithPassword(keyring, "forgotten")).ok).toBe(false)
  })

  it("accepts a recovery code with other case and spacing", async () => {
    const created = await createKeyring("pw")
    const messy = created.recoveryCode.toUpperCase().replaceAll("-", " ")
    expect((await unlockWithRecoveryCode(created.keyring, messy)).ok).toBe(true)
  })

  it("rejects a recovery code with the wrong format", async () => {
    const created = await createKeyring("pw")
    expect((await unlockWithRecoveryCode(created.keyring, "abcd")).ok).toBe(false)
  })

  it("stores no plaintext in the keyring", async () => {
    const created = await createKeyring("correct horse")
    const json = JSON.stringify(created.keyring)
    expect(isKeyring(JSON.parse(json))).toBe(true)
    expect(json).not.toContain("correct horse")
    expect(json).not.toContain(created.recoveryCode.replaceAll("-", ""))
  })
})
