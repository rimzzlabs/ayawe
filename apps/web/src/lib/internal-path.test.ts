import { describe, expect, it } from "vitest"
import { internalPath } from "./internal-path"

describe("internalPath", () => {
  it("keeps a path on this site, with its search and hash", () => {
    expect(internalPath("/vault/abc")).toBe("/vault/abc")
    expect(internalPath("/vault?x=1#top")).toBe("/vault?x=1#top")
  })

  it("rejects anything that can leave the site", () => {
    expect(internalPath("https://evil.example")).toBeUndefined()
    expect(internalPath("//evil.example")).toBeUndefined()
    expect(internalPath("/\\evil.example")).toBeUndefined()
    expect(internalPath("javascript:alert(1)")).toBeUndefined()
    expect(internalPath("vault")).toBeUndefined()
  })

  it("rejects values that are not strings", () => {
    expect(internalPath(undefined)).toBeUndefined()
    expect(internalPath(["/vault"])).toBeUndefined()
  })
})
