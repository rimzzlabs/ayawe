import { GithubLogoIcon, TerminalIcon, WarningIcon } from "@phosphor-icons/react"
import { useState, useTransition } from "react"
import { AppHeader } from "@/components/app-header"
import { PageHeading } from "@/components/page-heading"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { devSignIn, type Providers } from "@/lib/api"
import { reloadMe } from "@/lib/session"

interface SignInScreenProps {
  providers: Providers
  /** An error that GitHub sent back, from the `error` search parameter. */
  error?: string
  onSignedIn: () => void
}

export function SignInScreen(props: SignInScreenProps) {
  const [error, setError] = useState(props.error)
  const [pending, startTransition] = useTransition()
  const hasProvider = props.providers.github || props.providers.dev

  function handleDevSignIn() {
    startTransition(async () => {
      const signedIn = await devSignIn()
      const me = signedIn.ok ? await reloadMe() : signedIn
      if (!me.ok || !me.value) {
        setError(me.ok ? "The dev sign-in failed" : me.error.message)
        return
      }
      props.onSignedIn()
    })
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-8 p-4 sm:p-8">
      <AppHeader />
      <main className="flex flex-1 items-center justify-center">
        <div className="flex w-full max-w-sm flex-col gap-4">
          {error && (
            <Alert variant="destructive">
              <WarningIcon />
              <AlertTitle>Could not sign you in</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Card>
            <CardHeader>
              <CardTitle>
                <PageHeading className="outline-none" focusOnMount={false}>
                  Sign in
                </PageHeading>
              </CardTitle>
              <CardDescription>
                GitHub only tells ayawe who you are. Your secrets stay locked with your vault
                password.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {props.providers.github && (
                <Button
                  size="lg"
                  className="w-full"
                  nativeButton={false}
                  render={<a href="/api/auth/github" />}
                >
                  <GithubLogoIcon data-icon="inline-start" />
                  Continue with GitHub
                </Button>
              )}
              {props.providers.dev && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
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
            </CardContent>
            <CardFooter>
              <p className="text-muted-foreground text-xs">
                New here? Signing in creates your account.
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
