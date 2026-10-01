import { createFileRoute, redirect } from "@tanstack/react-router"
import { lock } from "@/lib/session"

// A route, not a button handler, so the unsaved-changes blocker can stop it like any navigation.
// Keep link preloading off for this route: a preload runs `beforeLoad`, which locks the vault.
export const Route = createFileRoute("/lock")({
  beforeLoad: () => {
    lock()
    throw redirect({ to: "/unlock" })
  },
})
