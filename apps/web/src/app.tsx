import { Suspense, use, useState } from "react"
import { ConnectScreen } from "@/auth/connect-screen"
import { RecoverScreen } from "@/auth/recover-screen"
import { RecoveryCodeScreen } from "@/auth/recovery-code-screen"
import { SetupScreen } from "@/auth/setup-screen"
import { UnlockScreen } from "@/auth/unlock-screen"
import { Spinner } from "@/components/ui/spinner"
import { Toaster } from "@/components/ui/toast"
import { type Screen, screenForToken } from "@/lib/screen"
import { clearToken, readToken } from "@/lib/token-storage"
import { VaultScreen } from "@/vault/vault-screen"

async function resolveStartScreen(): Promise<Screen> {
  const token = readToken()
  return token ? screenForToken(token) : { kind: "connect" }
}

const startScreenPromise = resolveStartScreen()

export function App() {
  return (
    <Toaster>
      <Suspense
        fallback={
          <div className="flex min-h-svh items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <Screens />
      </Suspense>
    </Toaster>
  )
}

function Screens() {
  const startScreen = use(startScreenPromise)
  const [screen, setScreen] = useState(startScreen)

  function handleDisconnect() {
    clearToken()
    setScreen({ kind: "connect" })
  }

  switch (screen.kind) {
    case "connect":
      return <ConnectScreen error={screen.error} onConnected={setScreen} />
    case "setup":
      return (
        <SetupScreen
          token={screen.token}
          onCreated={(session, recoveryCode) =>
            setScreen({ kind: "recovery-code", session, recoveryCode })
          }
        />
      )
    case "recovery-code":
      return (
        <RecoveryCodeScreen
          recoveryCode={screen.recoveryCode}
          onContinue={() => setScreen({ kind: "vault", session: screen.session })}
        />
      )
    case "unlock":
      return (
        <UnlockScreen
          token={screen.token}
          keyring={screen.keyring}
          onUnlocked={(session) => setScreen({ kind: "vault", session })}
          onForgot={() =>
            setScreen({ kind: "recover", token: screen.token, keyring: screen.keyring })
          }
          onDisconnect={handleDisconnect}
        />
      )
    case "recover":
      return (
        <RecoverScreen
          token={screen.token}
          keyring={screen.keyring}
          onRecovered={(session) => setScreen({ kind: "vault", session })}
          onBack={() => setScreen({ kind: "unlock", token: screen.token, keyring: screen.keyring })}
        />
      )
    case "vault":
      return (
        <VaultScreen
          session={screen.session}
          onLock={() =>
            setScreen({
              kind: "unlock",
              token: screen.session.token,
              keyring: screen.session.keyring,
            })
          }
        />
      )
  }
}
