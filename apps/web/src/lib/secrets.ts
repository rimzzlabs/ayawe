import { err, ok, type Result } from "@ayawe/crypto/result"
import { open, type Sealed, seal } from "@ayawe/crypto/seal"
import type { Entry } from "./dotenv"

function isEntryList(value: unknown): value is Entry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Entry).key === "string" &&
        typeof (item as Entry).value === "string",
    )
  )
}

export function sealEntries(dataKey: CryptoKey, entries: Entry[]) {
  return seal(dataKey, JSON.stringify(entries))
}

export async function openEntries(
  dataKey: CryptoKey,
  sealed: Sealed | null,
): Promise<Result<Entry[]>> {
  if (!sealed) return ok([])

  const opened = await open(dataKey, sealed)
  if (!opened.ok) return opened
  try {
    const entries: unknown = JSON.parse(opened.value)
    return isEntryList(entries) ? ok(entries) : err(new Error("The secrets have the wrong shape"))
  } catch {
    return err(new Error("The secrets have the wrong shape"))
  }
}
