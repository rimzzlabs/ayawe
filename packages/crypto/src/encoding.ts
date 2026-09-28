const CHUNK_SIZE = 0x8000

export function toBase64(bytes: Uint8Array) {
  // String.fromCharCode(...bytes) overflows the call stack on large input, so encode in chunks.
  let binary = ""
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE))
  }
  return btoa(binary)
}

export function fromBase64(text: string) {
  return Uint8Array.from(atob(text), (char) => char.charCodeAt(0))
}

export function toRecoveryCode(bytes: Uint8Array) {
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
  return hex.match(/.{4}/g)?.join("-") ?? hex
}

export function fromRecoveryCode(code: string, byteLength: number) {
  const hex = code.toLowerCase().replace(/[^0-9a-f]/g, "")
  if (hex.length !== byteLength * 2) return null
  return Uint8Array.from(hex.match(/.{2}/g) ?? [], (pair) => Number.parseInt(pair, 16))
}
