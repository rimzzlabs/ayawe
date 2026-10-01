import { CheckIcon, PlusIcon } from "@phosphor-icons/react"
import { REPO_URL } from "@/lib/links"

const BUILT_IN = [
  "Folders of .env values, encrypted in the browser with AES-256-GCM",
  "GitHub sign-in with an allow list, so only your accounts get in",
  "A vault password, a recovery code, and an auto-lock",
  "A Worker and a D1 database on Cloudflare's free plan",
]

const YOURS_TO_ADD = [
  "Organizations, shared folders, and roles for a team",
  "A CLI that loads values into CI and deploys",
  "An audit log, or a history for each value",
]

export function Fit() {
  return (
    <section aria-labelledby="fit" className="flex flex-col gap-8 border-t pt-12">
      <div className="flex flex-col gap-2">
        <h2 id="fit" className="font-heading text-3xl">
          A starting point you can grow
        </h2>
        <p className="max-w-xl text-muted-foreground">
          ayawe does one job well: it keeps your most sensitive values encrypted before they reach a
          server. The code is small and MIT licensed, so you can extend it to fit your team.
        </p>
      </div>

      <div className="grid gap-px border bg-border sm:grid-cols-2">
        <div className="flex flex-col gap-4 bg-background p-5">
          <h3 className="font-semibold text-xs uppercase tracking-widest">Built in</h3>
          <ul className="flex flex-col gap-3">
            {BUILT_IN.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm">
                <CheckIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-4 bg-muted/40 p-5">
          <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">
            Yours to add
          </h3>
          <ul className="flex flex-col gap-3">
            {YOURS_TO_ADD.map((item) => (
              <li key={item} className="flex gap-2.5 text-muted-foreground text-sm">
                <PlusIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-auto text-muted-foreground text-xs">
            The{" "}
            <a
              href={`${REPO_URL}#extend-it`}
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-4"
            >
              README
            </a>{" "}
            shows where each part lives, so you know where to start.
          </p>
        </div>
      </div>
    </section>
  )
}
