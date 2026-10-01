import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { RecoveryCodeScreen } from "@/auth/recovery-code-screen"
import { clearRecoveryCode, peekRecoveryCode } from "@/lib/session"

// `setup_` keeps this page out of the setup page's layout. Its path is still /setup/recovery-code.
export const Route = createFileRoute("/_auth/setup_/recovery-code")({
  beforeLoad: () => {
    // The code exists only in memory, right after setup. After a reload it is gone for good.
    const recoveryCode = peekRecoveryCode()
    if (!recoveryCode) throw redirect({ to: "/vault" })
    return { recoveryCode }
  },
  component: RecoveryCodeRoute,
})

function RecoveryCodeRoute() {
  const context = Route.useRouteContext()
  const navigate = useNavigate()

  return (
    <RecoveryCodeScreen
      me={context.me}
      recoveryCode={context.recoveryCode}
      onContinue={() => {
        clearRecoveryCode()
        navigate({ to: "/vault" })
      }}
    />
  )
}
