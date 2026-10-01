import type { Entry } from "./dotenv"

const WORD_SEPARATOR = /[\s_.-]+/

/** Match quality, best first. */
const Rank = {
  exact: 0,
  prefix: 1,
  substring: 2,
  wordPrefixes: 3,
  typo: 4,
} as const

function splitWords(text: string) {
  return text.split(WORD_SEPARATOR).filter((word) => word !== "")
}

// Two-row dynamic programming. Plain loops: this runs for every key on every keystroke.
export function levenshtein(a: string, b: string) {
  let previous = Array.from({ length: b.length + 1 }, (_value, index) => index)
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i]
    for (let j = 1; j <= b.length; j += 1) {
      const substitution = (previous[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1)
      current[j] = Math.min((previous[j] ?? 0) + 1, (current[j - 1] ?? 0) + 1, substitution)
    }
    previous = current
  }
  return previous[b.length] ?? 0
}

/**
 * True when the query splits into parts that start words of the key, in order.
 * "du" and "dat_ur" both match DATABASE_URL.
 */
function matchesWordPrefixes(query: string, words: string[]): boolean {
  if (query === "") return true
  return words.some((word, index) =>
    Array.from({ length: Math.min(query.length, word.length) }, (_value, i) => i + 1).some(
      (length) =>
        word.startsWith(query.slice(0, length)) &&
        matchesWordPrefixes(query.slice(length), words.slice(index + 1)),
    ),
  )
}

/** Allows one typo in a short word and two in a long word. Words under 3 letters must match exactly. */
function isCloseWord(token: string, word: string) {
  if (token.length < 3) return token === word
  const allowed = token.length > 6 ? 2 : 1
  return Math.abs(token.length - word.length) <= allowed && levenshtein(token, word) <= allowed
}

function rankKey(key: string, query: string) {
  const normalizedKey = key.toLowerCase()
  const queryWords = splitWords(query)
  const joinedQuery = queryWords.join("_")
  const keyWords = splitWords(normalizedKey)

  if (normalizedKey === joinedQuery) return Rank.exact
  if (normalizedKey.startsWith(joinedQuery)) return Rank.prefix
  if (normalizedKey.includes(joinedQuery)) return Rank.substring
  if (matchesWordPrefixes(queryWords.join(""), keyWords)) return Rank.wordPrefixes
  if (queryWords.every((token) => keyWords.some((word) => isCloseWord(token, word)))) {
    return Rank.typo
  }
  return null
}

/**
 * Filters entries by key and sorts the best matches first: exact, prefix, substring,
 * word starts, then keys with a small typo. Equal matches keep their saved order.
 */
export function searchEntries(entries: Entry[], query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (normalizedQuery === "") return entries

  return entries
    .map((entry, index) => ({ entry, index, rank: rankKey(entry.key, normalizedQuery) }))
    .filter((match) => match.rank !== null)
    .toSorted((a, b) => (a.rank ?? 0) - (b.rank ?? 0) || a.index - b.index)
    .map((match) => match.entry)
}
