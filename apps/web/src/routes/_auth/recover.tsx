import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { RecoverScreen } from "@/auth/recover-screen"
import { loadKeyring, openNewVault } from "@/lib/session"

export const Route = createFileRoute("/_auth/recover")({
  beforeLoad: async () => {
    const keyring = await loadKeyring()
    if (!keyring.ok) throw keyring.error
    if (!keyring.value) throw redirect({ to: "/setup" })
    return { keyring: keyring.value }
  },
  component: RecoverRoute,
})

function RecoverRoute() {
  const context = Route.useRouteContext()
  const navigate = useNavigate()

  return (
    <RecoverScreen
      me={context.me}
      keyring={context.keyring}
      onRecovered={(recovered) => {
        openNewVault(recovered)
        navigate({ to: "/vault" })
      }}
      onBack={() => navigate({ to: "/unlock" })}
    />
  )
}
