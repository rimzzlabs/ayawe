import { useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

const IDLE_LIMIT_MS = 15 * 60 * 1000
const CHECK_EVERY_MS = 30 * 1000
const ACTIVITY_EVENTS = ["pointerdown", "pointermove", "keydown", "wheel", "touchstart"] as const

/**
 * Locks the vault after 15 minutes without input. The check compares timestamps,
 * so a laptop that wakes from sleep locks as soon as the tab is visible again.
 */
export function useIdleLock() {
  const navigate = useNavigate()

  // Syncs with the browser: input events, tab visibility, and a timer.
  useEffect(() => {
    let lastActivity = Date.now()

    function markActive() {
      lastActivity = Date.now()
    }

    function lockWhenIdle() {
      if (Date.now() - lastActivity < IDLE_LIMIT_MS) return
      // Restart the count, so a navigation that unsaved changes block does not repeat every check.
      markActive()
      navigate({ to: "/lock" })
    }

    for (const name of ACTIVITY_EVENTS) {
      window.addEventListener(name, markActive, { passive: true })
    }
    document.addEventListener("visibilitychange", lockWhenIdle)
    const timer = window.setInterval(lockWhenIdle, CHECK_EVERY_MS)

    return () => {
      for (const name of ACTIVITY_EVENTS) window.removeEventListener(name, markActive)
      document.removeEventListener("visibilitychange", lockWhenIdle)
      window.clearInterval(timer)
    }
  }, [navigate])
}
