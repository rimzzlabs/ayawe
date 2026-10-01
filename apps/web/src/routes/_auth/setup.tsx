import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { SetupScreen } from "@/auth/setup-screen"
import { loadKeyring, openNewVault } from "@/lib/session"

export const Route = createFileRoute("/_auth/setup")({
  beforeLoad: async () => {
    const keyring = await loadKeyring()
    if (!keyring.ok) throw keyring.error
    if (keyring.value) throw redirect({ to: "/unlock" })
  },
  component: SetupRoute,
})

function SetupRoute() {
  const context = Route.useRouteContext()
  const navigate = useNavigate()

  return (
    <SetupScreen
      me={context.me}
      onCreated={(created) => {
        openNewVault(created)
        navigate({ to: "/setup/recovery-code" })
      }}
    />
  )
}
