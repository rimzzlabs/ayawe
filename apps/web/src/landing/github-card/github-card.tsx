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
            <h2 id="github-card">Wanna know more?</h2>
          </CardTitle>
          <CardDescription>
            Read the code, open an issue, or send a pull request. Everything lives on GitHub.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            nativeButton={false}
            render={<a href={REPO_URL} target="_blank" rel="noreferrer" />}
          >
            <GithubLogoIcon data-icon="inline-start" />
            Visit GitHub
            <ArrowUpRightIcon data-icon="inline-end" />
            <span className="sr-only">(opens in a new tab)</span>
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}
