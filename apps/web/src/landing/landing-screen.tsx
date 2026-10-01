import {
  ArrowRightIcon,
  ClipboardTextIcon,
  GithubLogoIcon,
  PasswordIcon,
} from "@phosphor-icons/react"
import { Link } from "@tanstack/react-router"
import { AppHeader } from "@/components/app-header"
import { PageHeading } from "@/components/page-heading"
import { Button } from "@/components/ui/button"
import { GithubCard } from "@/landing/github-card/github-card"
import { HowItWorks } from "@/landing/how-it-works/how-it-works"
import { SelfHost } from "@/landing/self-host/self-host"

const STEPS = [
  {
    icon: GithubLogoIcon,
    title: "Sign in with GitHub",
    text: "Just so ayawe knows it's you. GitHub never touches your secrets.",
  },
  {
    icon: PasswordIcon,
    title: "Pick a vault password",
    text: "It locks everything right in your browser. You also get a recovery code, just in case.",
  },
  {
    icon: ClipboardTextIcon,
    title: "Paste your .env",
    text: "One folder per project. Paste the whole file in, copy it back out anywhere.",
  },
]

interface LandingScreenProps {
  /** A signed-in visitor gets "Open vault" instead of the sign-in links. */
  signedIn: boolean
}

export function LandingScreen(props: LandingScreenProps) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-12 p-4 sm:p-8">
      <AppHeader>
        {!props.signedIn && (
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/sign-in" />}>
            Sign in
          </Button>
        )}
      </AppHeader>

      <main className="flex flex-1 flex-col justify-center gap-10">
        <div className="flex max-w-xl flex-col gap-4">
          <PageHeading className="font-heading text-4xl leading-tight outline-none sm:text-5xl">
            Dead Simple Vault For Your Secret
          </PageHeading>
          <p className="text-muted-foreground">
            No more pasting .env files into Telegram and deleting them after. Put them here once,
            grab them from any machine. It all gets encrypted in your browser, so the server only
            ever sees gibberish.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {props.signedIn ? (
            <Button size="lg" nativeButton={false} render={<Link to="/vault" />}>
              Open vault
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          ) : (
            <Button size="lg" nativeButton={false} render={<Link to="/sign-in" />}>
              Get started
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          )}
        </div>

        <ol className="grid gap-6 border-t pt-8 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.title} className="flex flex-col gap-1">
              <step.icon className="mb-1 size-5 text-muted-foreground" aria-hidden="true" />
              <span className="font-medium">{step.title}</span>
              <span className="text-muted-foreground text-sm">{step.text}</span>
            </li>
          ))}
        </ol>

        <HowItWorks />

        <SelfHost />

        <GithubCard />
      </main>

      <footer className="flex flex-wrap justify-between gap-2 text-muted-foreground text-xs">
        <span>“Aya wé” is Sundanese for “it’s around here somewhere.”</span>
        <span>Free and open source. MIT licensed.</span>
      </footer>
    </div>
  )
}
