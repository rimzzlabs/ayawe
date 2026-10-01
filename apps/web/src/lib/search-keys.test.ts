import { describe, expect, it } from "vitest"
import { levenshtein, searchEntries } from "./search-keys"

function entries(...keys: string[]) {
  return keys.map((key) => ({ key, value: "" }))
}

function keys(list: { key: string }[]) {
  return list.map((entry) => entry.key)
}

const SAMPLE = entries(
  "DATABASE_URL",
  "DATABASE_POOL_SIZE",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_URL",
  "URL",
)

describe("levenshtein", () => {
  it("counts edits", () => {
    expect(levenshtein("secret", "secret")).toBe(0)
    expect(levenshtein("secrt", "secret")).toBe(1)
    expect(levenshtein("kitten", "sitting")).toBe(3)
    expect(levenshtein("", "abc")).toBe(3)
  })
})

describe("searchEntries", () => {
  it("returns every entry in saved order for an empty query", () => {
    expect(searchEntries(SAMPLE, "  ")).toBe(SAMPLE)
  })

  it("ignores case and puts exact, prefix, then substring matches first", () => {
    expect(keys(searchEntries(SAMPLE, "url"))).toEqual(["URL", "DATABASE_URL", "NEXT_PUBLIC_URL"])
  })

  it("matches the starts of words", () => {
    expect(keys(searchEntries(SAMPLE, "du"))).toEqual(["DATABASE_URL"])
    expect(keys(searchEntries(SAMPLE, "dbps"))).toEqual([])
    expect(keys(searchEntries(SAMPLE, "dps"))).toEqual(["DATABASE_POOL_SIZE"])
    expect(keys(searchEntries(SAMPLE, "sws"))).toEqual(["STRIPE_WEBHOOK_SECRET"])
  })

  it("treats spaces in the query like underscores", () => {
    expect(keys(searchEntries(SAMPLE, "database url"))).toEqual(["DATABASE_URL"])
  })

  it("allows a small typo in each word", () => {
    expect(keys(searchEntries(SAMPLE, "datbase"))).toEqual(["DATABASE_URL", "DATABASE_POOL_SIZE"])
    expect(keys(searchEntries(SAMPLE, "STRIPE_SECRT"))).toEqual([
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
    ])
  })

  it("does not allow typos in very short words", () => {
    expect(keys(searchEntries(SAMPLE, "xy"))).toEqual([])
  })

  it("ranks direct matches above typo matches", () => {
    const list = entries("SECRT_TOKEN", "SECRET")
    expect(keys(searchEntries(list, "secrt"))).toEqual(["SECRT_TOKEN", "SECRET"])
  })
})
