import { GithubLogoIcon, TerminalIcon, WarningIcon } from "@phosphor-icons/react"
import { useState, useTransition } from "react"
import { AppHeader } from "@/components/app-header"
import { PageHeading } from "@/components/page-heading"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { devSignIn, fetchMe, type Providers } from "@/lib/api"
import { type Screen, screenForUser } from "@/lib/screen"

const STEPS = [
  {
    title: "Sign in with GitHub",
    text: "GitHub only tells ayawe who you are. It never sees your secrets.",
  },
  {
    title: "Set a vault password",
    text: "Your browser uses it to encrypt everything. The server never gets it.",
  },
  {
    title: "Paste your .env",
    text: "Make a folder for each project. Copy the secrets out on any device.",
  },
]

interface LandingScreenProps {
  providers: Providers
  error?: string
  onSignedIn: (screen: Screen) => void
}

export function LandingScreen(props: LandingScreenProps) {
  const [error, setError] = useState(props.error)
  const [pending, startTransition] = useTransition()
  const hasProvider = props.providers.github || props.providers.dev

  function handleDevSignIn() {
    startTransition(async () => {
      const signedIn = await devSignIn()
      const me = signedIn.ok ? await fetchMe() : signedIn
      if (!me.ok || !me.value) {
        setError(me.ok ? "The dev sign-in failed" : me.error.message)
        return
      }
      props.onSignedIn(await screenForUser(me.value))
    })
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-12 p-4 sm:p-8">
      <AppHeader />

      <main className="flex flex-1 flex-col justify-center gap-10">
        <div className="flex max-w-xl flex-col gap-4">
          <PageHeading className="font-heading text-4xl leading-tight outline-none sm:text-5xl">
            Your env files, on every machine you use.
          </PageHeading>
          <p className="text-muted-foreground">
            Stop sending secrets to yourself in chat apps. ayawe keeps your env variables in one
            place, encrypted in your browser before they leave it.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <WarningIcon />
            <AlertTitle>Sign-in failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2">
          {props.providers.github && (
            <Button size="lg" nativeButton={false} render={<a href="/api/auth/github" />}>
              <GithubLogoIcon data-icon="inline-start" />
              Continue with GitHub
            </Button>
          )}
          {props.providers.dev && (
            <Button
              size="lg"
              variant="outline"
              onClick={handleDevSignIn}
              disabled={pending}
              focusableWhenDisabled
            >
              {pending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <TerminalIcon data-icon="inline-start" />
              )}
              Continue as dev user
            </Button>
          )}
          {!hasProvider && (
            <Alert>
              <WarningIcon />
              <AlertTitle>No sign-in method is set up</AlertTitle>
              <AlertDescription>
                Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET on the server.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <ol className="grid gap-6 border-t pt-8 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-1">
              <span aria-hidden="true" className="font-mono text-muted-foreground text-xs">
                0{index + 1}
              </span>
              <span className="font-medium">{step.title}</span>
              <span className="text-muted-foreground text-sm">{step.text}</span>
            </li>
          ))}
        </ol>
      </main>

      <footer className="flex flex-wrap justify-between gap-2 text-muted-foreground text-xs">
        <span>“Aya wé” is Sundanese for “it’s somewhere”.</span>
        <span>Open source, MIT license.</span>
      </footer>
    </div>
  )
}
