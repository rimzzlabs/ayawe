import { WarningIcon } from "@phosphor-icons/react"
import { Suspense, use, useState } from "react"
import { RecoverScreen } from "@/auth/recover-screen"
import { RecoveryCodeScreen } from "@/auth/recovery-code-screen"
import { SetupScreen } from "@/auth/setup-screen"
import { UnlockScreen } from "@/auth/unlock-screen"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Toaster } from "@/components/ui/toast"
import { LandingScreen } from "@/landing/landing-screen"
import { signOut } from "@/lib/api"
import { landingScreen, resolveStartScreen } from "@/lib/screen"
import { VaultScreen } from "@/vault/vault-screen"

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

  async function handleSignOut() {
    await signOut()
    setScreen(await landingScreen())
  }

  switch (screen.kind) {
    case "landing":
      return (
        <LandingScreen providers={screen.providers} error={screen.error} onSignedIn={setScreen} />
      )
    case "setup":
      return (
        <SetupScreen
          me={screen.me}
          onCreated={(session, recoveryCode) =>
            setScreen({ kind: "recovery-code", session, recoveryCode })
          }
          onSignOut={handleSignOut}
        />
      )
    case "recovery-code":
      return (
        <RecoveryCodeScreen
          me={screen.session.me}
          recoveryCode={screen.recoveryCode}
          onContinue={() => setScreen({ kind: "vault", session: screen.session, folders: [] })}
          onSignOut={handleSignOut}
        />
      )
    case "unlock":
      return (
        <UnlockScreen
          me={screen.me}
          keyring={screen.keyring}
          onUnlocked={setScreen}
          onForgot={() => setScreen({ kind: "recover", me: screen.me, keyring: screen.keyring })}
          onSignOut={handleSignOut}
        />
      )
    case "recover":
      return (
        <RecoverScreen
          me={screen.me}
          keyring={screen.keyring}
          onRecovered={setScreen}
          onBack={() => setScreen({ kind: "unlock", me: screen.me, keyring: screen.keyring })}
          onSignOut={handleSignOut}
        />
      )
    case "vault":
      return (
        <VaultScreen
          session={screen.session}
          folders={screen.folders}
          onLock={() =>
            setScreen({ kind: "unlock", me: screen.session.me, keyring: screen.session.keyring })
          }
          onSignOut={handleSignOut}
        />
      )
    case "error":
      return (
        <main className="mx-auto flex min-h-svh max-w-md items-center p-4">
          <title>ayawe cannot start</title>
          <Alert variant="destructive">
            <WarningIcon />
            <AlertTitle>ayawe cannot start</AlertTitle>
            <AlertDescription>{screen.message}. Reload the page to try again.</AlertDescription>
          </Alert>
        </main>
      )
  }
}
