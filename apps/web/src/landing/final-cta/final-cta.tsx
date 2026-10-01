import { ArrowRightIcon, GithubLogoIcon } from "@phosphor-icons/react"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { REPO_URL } from "@/lib/links"

export function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta"
      className="flex flex-col items-start gap-6 border bg-card p-6 sm:p-10"
    >
      <div className="flex flex-col gap-2">
        <h2 id="final-cta" className="font-heading text-3xl sm:text-4xl">
          Run your own vault in about 10 minutes
        </h2>
        <p className="max-w-xl text-muted-foreground">
          Fork the repo, deploy the Worker to Cloudflare's free plan, and allow your GitHub account.
          Then grow it into what your team needs.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
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
      </div>
    </section>
  )
}
