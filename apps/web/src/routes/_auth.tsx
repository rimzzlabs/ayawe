import { createFileRoute, redirect } from "@tanstack/react-router"
import { loadMe } from "@/lib/session"

/** Every route under `_auth` needs a signed-in user. */
export const Route = createFileRoute("/_auth")({
  // Private or a sign-in step. Keep it out of search results.
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const me = await loadMe()
    if (!me.ok) throw me.error
    if (!me.value) throw redirect({ to: "/sign-in" })
    return { me: me.value }
  },
})
