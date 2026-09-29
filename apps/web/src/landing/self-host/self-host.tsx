import type { ReactNode } from "react"
import { CodeBlock } from "@/components/code-block"
import { Marker } from "@/components/marker"

// TODO: confirm the public repository URL before this page goes live.
const REPO_URL = "https://github.com/rimzzlabs/ayawe"

const WORKER_URL = "https://ayawe.<your-subdomain>.workers.dev"

interface StepProps {
  number: number
  title: string
  children: ReactNode
}

function Step(props: StepProps) {
  return (
    <li className="flex gap-3">
      <Marker number={props.number} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <h3 className="font-medium text-sm leading-5">{props.title}</h3>
        {props.children}
      </div>
    </li>
  )
}

export function SelfHost() {
  return (
    <section aria-labelledby="self-host" className="flex flex-col gap-8 border-t pt-12">
      <div className="flex flex-col gap-2">
        <h2 id="self-host" className="font-heading text-3xl">
          Host it yourself
        </h2>
        <p className="max-w-xl text-muted-foreground">
          Rather not trust someone else's server? Run your own copy on Cloudflare's free plan. It
          takes about 10 minutes and needs Node, pnpm, and a Cloudflare account.
        </p>
      </div>

      <ol className="flex flex-col gap-8">
        <Step number={1} title="Get the code">
          <CodeBlock label="clone commands">
            {`git clone ${REPO_URL}.git\ncd ayawe\npnpm install`}
          </CodeBlock>
        </Step>

        <Step number={2} title="Create the database">
          <CodeBlock label="database commands">
            {"cd apps/api\npnpm exec wrangler login\npnpm exec wrangler d1 create ayawe"}
          </CodeBlock>
          <p className="text-muted-foreground text-sm">
            Paste the <code className="font-mono text-foreground">database_id</code> it prints into{" "}
            <code className="font-mono text-foreground">apps/api/wrangler.jsonc</code>.
          </p>
        </Step>

        <Step number={3} title="Make a GitHub OAuth app">
          <p className="text-muted-foreground text-sm">
            Create one at{" "}
            <a
              href="https://github.com/settings/developers"
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-4"
            >
              GitHub developer settings
            </a>{" "}
            and use this callback URL:
          </p>
          <CodeBlock label="callback URL">{`${WORKER_URL}/api/auth/github/callback`}</CodeBlock>
        </Step>

        <Step number={4} title="Add your secrets">
          <CodeBlock label="secret commands">
            {[
              "pnpm exec wrangler secret put APP_URL",
              "pnpm exec wrangler secret put GITHUB_CLIENT_ID",
              "pnpm exec wrangler secret put GITHUB_CLIENT_SECRET",
              "pnpm exec wrangler secret put ALLOWED_GITHUB_USERS",
            ].join("\n")}
          </CodeBlock>
          <p className="text-muted-foreground text-sm">
            <code className="font-mono text-foreground">APP_URL</code> is your Worker URL. Set{" "}
            <code className="font-mono text-foreground">ALLOWED_GITHUB_USERS</code> to your GitHub
            username so nobody else can sign in.
          </p>
        </Step>

        <Step number={5} title="Deploy">
          <CodeBlock label="deploy command">{"pnpm exec moon run api:deploy"}</CodeBlock>
          <p className="text-muted-foreground text-sm">
            This builds the app, runs the database migrations, and ships the Worker. Run it again
            whenever you pull updates.
          </p>
        </Step>
      </ol>
    </section>
  )
}
