import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { UnlockScreen } from "@/auth/unlock-screen"
import { internalPath } from "@/lib/internal-path"
import { getSession, loadKeyring, unlock } from "@/lib/session"

interface UnlockSearch {
  /** The page to open after the unlock, for example the folder the user reloaded. */
  redirect?: string
}

export const Route = createFileRoute("/_auth/unlock")({
  validateSearch: (search: Record<string, unknown>): UnlockSearch => ({
    redirect: internalPath(search.redirect),
  }),
  beforeLoad: async ({ search }) => {
    if (getSession()) throw redirect({ href: search.redirect ?? "/vault" })
    const keyring = await loadKeyring()
    if (!keyring.ok) throw keyring.error
    if (!keyring.value) throw redirect({ to: "/setup" })
    return { keyring: keyring.value }
  },
  component: UnlockRoute,
})

function UnlockRoute() {
  const context = Route.useRouteContext()
  const search = Route.useSearch()
  const navigate = useNavigate()

  return (
    <UnlockScreen
      me={context.me}
      keyring={context.keyring}
      onUnlocked={(dataKey) => {
        unlock(dataKey)
        navigate({ href: search.redirect ?? "/vault" })
      }}
      onForgot={() => navigate({ to: "/recover" })}
    />
  )
}
