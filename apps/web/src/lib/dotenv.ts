export interface Entry {
  key: string
  value: string
}

export const ENV_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_.-]*$/

const NEEDS_QUOTES = /[\s#"'\\]/

function unescapeDoubleQuoted(value: string) {
  return value.replace(/\\([nr"\\])/g, (_match, char: string) => {
    if (char === "n") return "\n"
    if (char === "r") return "\r"
    return char
  })
}

function parseValue(raw: string) {
  if (raw.length >= 2 && raw.startsWith('"') && raw.endsWith('"')) {
    return unescapeDoubleQuoted(raw.slice(1, -1))
  }
  if (raw.length >= 2 && raw.startsWith("'") && raw.endsWith("'")) return raw.slice(1, -1)
  return raw.split(" #")[0]?.trim() ?? ""
}

// A line loop, not map/filter: a double-quoted value can span several lines (for example a PEM key).
export function parseDotenv(text: string): Entry[] {
  const lines = text.split(/\r?\n/)
  const entries: Entry[] = []

  for (let i = 0; i < lines.length; i += 1) {
    const line = (lines[i] ?? "").trim()
    if (!line || line.startsWith("#")) continue

    const assignment = line.replace(/^export\s+/, "")
    const separator = assignment.indexOf("=")
    if (separator <= 0) continue

    const key = assignment.slice(0, separator).trim()
    let raw = assignment.slice(separator + 1).trim()
    if (!ENV_KEY_PATTERN.test(key)) continue

    if (raw.startsWith('"') && (raw.length === 1 || !raw.endsWith('"'))) {
      while (i + 1 < lines.length && !raw.endsWith('"')) {
        i += 1
        raw += `\n${lines[i] ?? ""}`
      }
    }
    entries.push({ key, value: parseValue(raw) })
  }
  return entries
}

function formatValue(value: string) {
  if (value === "" || !NEEDS_QUOTES.test(value)) return value
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")
  return `"${escaped}"`
}

export function serializeDotenv(entries: Entry[]) {
  return entries.map((entry) => `${entry.key}=${formatValue(entry.value)}`).join("\n")
}

export function mergeEntries(base: Entry[], incoming: Entry[]) {
  const incomingByKey = new Map(incoming.map((entry) => [entry.key, entry]))
  const updated = base.map((entry) => incomingByKey.get(entry.key) ?? entry)
  const baseKeys = new Set(base.map((entry) => entry.key))
  return [...updated, ...incoming.filter((entry) => !baseKeys.has(entry.key))]
}

export function isDotenvPaste(text: string) {
  return text.includes("\n") || text.includes("=")
}
