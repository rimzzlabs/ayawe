import {
  ArrowRightIcon,
  ClipboardTextIcon,
  CloudArrowUpIcon,
  GithubLogoIcon,
  PasswordIcon,
} from "@phosphor-icons/react"
import { Link } from "@tanstack/react-router"
import { AppHeader } from "@/components/app-header"
import { PageHeading } from "@/components/page-heading"
import { Button } from "@/components/ui/button"
import { Faq } from "@/landing/faq/faq"
import { Features } from "@/landing/features/features"
import { FinalCta } from "@/landing/final-cta/final-cta"
import { Fit } from "@/landing/fit/fit"
import { GithubCard } from "@/landing/github-card/github-card"
import { HowItWorks } from "@/landing/how-it-works/how-it-works"
import { ProductPreview } from "@/landing/product-preview/product-preview"
import { SelfHost } from "@/landing/self-host/self-host"
import { SignedIn, SignedOut } from "@/landing/session-visibility"
import { REPO_URL } from "@/lib/links"

const STEPS = [
  {
    icon: CloudArrowUpIcon,
    title: "Deploy your copy",
    text: "Fork the repo and deploy it to Cloudflare's free plan. Only the GitHub accounts you allow can sign in.",
  },
  {
    icon: PasswordIcon,
    title: "Set a vault password",
    text: "Your browser derives the encryption key from it. Setup also gives you a one-time recovery code.",
  },
  {
    icon: ClipboardTextIcon,
    title: "Paste your .env",
    text: "Make a folder for each project or environment. Paste the file in, then copy it back out as .env on any machine.",
  },
]

export function LandingScreen() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-12 p-4 sm:p-8">
      <AppHeader>
        <SignedOut>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/sign-in" />}>
            Sign in
          </Button>
        </SignedOut>
        <SignedIn>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/vault" />}>
            Open vault
          </Button>
        </SignedIn>
      </AppHeader>

      <main className="flex flex-1 flex-col gap-12">
        <div className="flex flex-col gap-8 pt-6 sm:pt-12">
          <div className="flex max-w-xl flex-col gap-4">
            <PageHeading className="font-heading text-4xl leading-tight outline-none sm:text-5xl">
              Your .env files, in one encrypted vault
            </PageHeading>
            <p className="text-muted-foreground">
              Keep every project's environment variables in one place and copy them to any machine.
              Your browser encrypts them with AES-256-GCM before upload, so the server only ever
              stores ciphertext.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <SignedOut>
                {/* Each instance is private to its owner, so visitors deploy their own copy. */}
                <Button size="lg" nativeButton={false} render={<Link to="/" hash="self-host" />}>
                  Host your own
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  nativeButton={false}
                  render={<a href={REPO_URL} target="_blank" rel="noreferrer" />}
                >
                  <GithubLogoIcon data-icon="inline-start" />
                  View source
                  <span className="sr-only">(opens in a new tab)</span>
                </Button>
              </SignedOut>
              <SignedIn>
                <Button size="lg" nativeButton={false} render={<Link to="/vault" />}>
                  Open vault
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
              </SignedIn>
              {/* A router link, not a plain "#" link: the router handles the scroll. */}
              <Button
                size="lg"
                variant="ghost"
                nativeButton={false}
                render={<Link to="/" hash="how-it-works" />}
              >
                How it works
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Free and open source · MIT licensed · Runs on Cloudflare's free plan
            </p>
          </div>

          <ProductPreview />
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

        <Features />

        <HowItWorks />

        <Fit />

        <SelfHost />

        <GithubCard />

        <Faq />

        <FinalCta />
      </main>

      <footer className="flex flex-wrap justify-between gap-2 border-t pt-6 text-muted-foreground text-xs">
        <span>“Aya wé” is Sundanese for “it’s around here somewhere.”</span>
        <span>Free and open source. MIT licensed.</span>
      </footer>
    </div>
  )
}
