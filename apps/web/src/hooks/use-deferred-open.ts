import { useEffect, useState } from "react"

/**
 * Base UI skips the enter transition of a popup that mounts already open.
 * This keeps the popup closed for the first commit, so it still animates in.
 */
export function useDeferredOpen(open: boolean | undefined) {
  const [mounted, setMounted] = useState(false)

  // Syncs with the DOM: the closed state must reach the screen before the open state.
  useEffect(() => {
    setMounted(true)
  }, [])

  if (open === undefined) return undefined
  return mounted && open
}
