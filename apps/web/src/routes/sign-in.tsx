import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { SignInScreen } from "@/auth/sign-in-screen"
import { fetchProviders } from "@/lib/api"
import { loadMe } from "@/lib/session"

interface SignInSearch {
  /** GitHub sign-in errors come back as `/sign-in?error=...`. */
  error?: string
}

export const Route = createFileRoute("/sign-in")({
  // Private or a sign-in step. Keep it out of search results.
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  validateSearch: (search: Record<string, unknown>): SignInSearch => ({
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  beforeLoad: async () => {
    const me = await loadMe()
    if (!me.ok) throw me.error
    if (me.value) throw redirect({ to: "/vault" })
  },
  loader: async () => {
    const providers = await fetchProviders()
    if (!providers.ok) throw providers.error
    return providers.value
  },
  component: SignInRoute,
})

function SignInRoute() {
  const providers = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate()

  return (
    <SignInScreen
      providers={providers}
      error={search.error}
      onSignedIn={() => navigate({ to: "/vault" })}
    />
  )
}
