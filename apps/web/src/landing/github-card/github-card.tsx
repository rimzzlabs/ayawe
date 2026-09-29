import { ArrowUpRightIcon, StarIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { REPO_URL } from "@/lib/links"

export function GithubCard() {
  return (
    <section aria-labelledby="github-card">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 id="github-card">See it for yourself</h2>
          </CardTitle>
          <CardDescription>
            Don't just trust a landing page. The encryption, the API, and this very page are all
            open on GitHub. Poke around, fork it, or drop a star if ayawe saved you a trip to
            Telegram.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            nativeButton={false}
            render={<a href={REPO_URL} target="_blank" rel="noreferrer" />}
          >
            <StarIcon data-icon="inline-start" />
            Star on GitHub
            <ArrowUpRightIcon data-icon="inline-end" />
            <span className="sr-only">(opens in a new tab)</span>
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}
