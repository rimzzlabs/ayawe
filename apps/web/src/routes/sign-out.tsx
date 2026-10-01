import { createFileRoute, redirect } from "@tanstack/react-router"
import { toast } from "@/components/ui/toast"
import { signOut } from "@/lib/api"
import { clearSession } from "@/lib/session"

// A route, not a button handler, so the unsaved-changes blocker can stop it like any navigation.
// Keep link preloading off for this route: a preload runs `beforeLoad`, which signs out.
export const Route = createFileRoute("/sign-out")({
  beforeLoad: async () => {
    const signedOut = await signOut()
    if (!signedOut.ok) toast.add({ title: signedOut.error.message, type: "error" })
    clearSession()
    throw redirect({ to: "/" })
  },
})
