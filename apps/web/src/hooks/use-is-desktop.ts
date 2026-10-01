import { useMediaQuery } from "@/hooks/use-media-query"

// Tailwind `lg`. Tablets and phones are narrower.
const DESKTOP_QUERY = "(min-width: 64rem)"

export function useIsDesktop() {
  return useMediaQuery(DESKTOP_QUERY)
}
