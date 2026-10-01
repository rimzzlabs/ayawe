/**
 * Accepts only a path on this site, for a redirect after sign-in or unlock.
 * "//evil.example", "/\evil.example", and "https://evil.example" become `undefined`.
 */
export function internalPath(value: unknown) {
  if (typeof value !== "string") return undefined
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return undefined
  return value
}
