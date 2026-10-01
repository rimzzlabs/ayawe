import { ArrowUpRightIcon, GithubLogoIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { REPO_URL } from "@/lib/links"

export function GithubCard() {
  return (
    <section aria-labelledby="github-card">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 id="github-card">Open source, MIT licensed</h2>
          </CardTitle>
          <CardDescription>
            Read the encryption code, the API, and this page on GitHub before you put a secret in.
            Issues and pull requests are welcome.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            nativeButton={false}
            render={<a href={REPO_URL} target="_blank" rel="noreferrer" />}
          >
            <GithubLogoIcon data-icon="inline-start" />
            View source on GitHub
            <ArrowUpRightIcon data-icon="inline-end" />
            <span className="sr-only">(opens in a new tab)</span>
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}
