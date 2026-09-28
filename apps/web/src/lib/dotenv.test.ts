import { describe, expect, it } from "vitest"
import { mergeEntries, parseDotenv, serializeDotenv } from "./dotenv"

describe("parseDotenv", () => {
  it("reads plain, quoted, exported, and commented lines", () => {
    const text = [
      "# comment",
      "",
      "DATABASE_URL=postgres://localhost/app",
      "export API_KEY=abc123",
      'GREETING="hello world"',
      "SINGLE='keep $raw'",
      "WITH_COMMENT=value # note",
      "EMPTY=",
      "not a line",
    ].join("\n")

    expect(parseDotenv(text)).toEqual([
      { key: "DATABASE_URL", value: "postgres://localhost/app" },
      { key: "API_KEY", value: "abc123" },
      { key: "GREETING", value: "hello world" },
      { key: "SINGLE", value: "keep $raw" },
      { key: "WITH_COMMENT", value: "value" },
      { key: "EMPTY", value: "" },
    ])
  })

  it("keeps an equals sign inside the value", () => {
    expect(parseDotenv("TOKEN=a=b=c")).toEqual([{ key: "TOKEN", value: "a=b=c" }])
  })

  it("reads a double-quoted value that spans lines", () => {
    const text = 'KEY="-----BEGIN KEY-----\nabc\n-----END KEY-----"\nNEXT=1'
    expect(parseDotenv(text)).toEqual([
      { key: "KEY", value: "-----BEGIN KEY-----\nabc\n-----END KEY-----" },
      { key: "NEXT", value: "1" },
    ])
  })

  it("reads Windows line endings", () => {
    expect(parseDotenv("A=1\r\nB=2")).toEqual([
      { key: "A", value: "1" },
      { key: "B", value: "2" },
    ])
  })
})

describe("serializeDotenv", () => {
  it("quotes values only when needed and round-trips", () => {
    const entries = [
      { key: "PLAIN", value: "abc" },
      { key: "SPACED", value: "hello world" },
      { key: "MULTILINE", value: 'line one\nsays "hi"' },
      { key: "EMPTY", value: "" },
    ]
    const text = serializeDotenv(entries)
    expect(text).toBe(
      'PLAIN=abc\nSPACED="hello world"\nMULTILINE="line one\\nsays \\"hi\\""\nEMPTY=',
    )
    expect(parseDotenv(text)).toEqual(entries)
  })
})

describe("mergeEntries", () => {
  it("updates existing keys in place and appends new keys", () => {
    const base = [
      { key: "A", value: "1" },
      { key: "B", value: "2" },
    ]
    const incoming = [
      { key: "B", value: "20" },
      { key: "C", value: "3" },
    ]
    expect(mergeEntries(base, incoming)).toEqual([
      { key: "A", value: "1" },
      { key: "B", value: "20" },
      { key: "C", value: "3" },
    ])
  })
})
