import {
  BrowserIcon,
  CloudIcon,
  DatabaseIcon,
  DesktopIcon,
  FileTextIcon,
  KeyIcon,
  LaptopIcon,
  LockSimpleIcon,
  PasswordIcon,
} from "@phosphor-icons/react"
import type { ReactNode } from "react"
import { Flow, FlowArrow, FlowNode } from "@/landing/how-it-works/flow"

interface StepProps {
  number: number
  title: string
  children: ReactNode
  illustration: ReactNode
}

function Step(props: StepProps) {
  return (
    <li className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-center">
      <div className="flex flex-col gap-1">
        <span aria-hidden="true" className="font-mono text-muted-foreground text-xs">
          0{props.number}
        </span>
        <h3 className="font-medium">{props.title}</h3>
        <p className="text-muted-foreground text-sm">{props.children}</p>
      </div>
      {props.illustration}
    </li>
  )
}

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works" className="flex flex-col gap-8 border-t pt-10">
      <div className="flex flex-col gap-2">
        <h2 id="how-it-works" className="font-heading text-3xl">
          How it works
        </h2>
        <p className="max-w-xl text-muted-foreground">
          Your secrets get locked before they leave your browser. Here's the whole trip.
        </p>
      </div>

      <ol className="flex flex-col gap-10">
        <Step
          number={1}
          title="Your password becomes a key"
          illustration={
            <Flow label="Your vault password goes through PBKDF2 and becomes an encryption key that stays in your browser.">
              <FlowNode icon={PasswordIcon} data>
                ••••••••••
              </FlowNode>
              <FlowArrow>PBKDF2 ×600k</FlowArrow>
              <FlowNode icon={KeyIcon}>key, in this tab only</FlowNode>
            </Flow>
          }
        >
          Your browser runs the vault password through 600,000 rounds of PBKDF2. The password itself
          never goes anywhere.
        </Step>

        <Step
          number={2}
          title="Your browser locks the secrets"
          illustration={
            <Flow label="A plain env variable goes through AES-256-GCM and becomes unreadable ciphertext.">
              <FlowNode icon={FileTextIcon} data>
                API_KEY=sk_live_…
              </FlowNode>
              <FlowArrow>AES-256-GCM</FlowArrow>
              <FlowNode icon={LockSimpleIcon} data>
                q8Zt0x…Rw4=
              </FlowNode>
            </Flow>
          }
        >
          Each folder gets encrypted with AES-256-GCM right in the tab. What leaves your machine is
          gibberish.
        </Step>

        <Step
          number={3}
          title="The server only stores gibberish"
          illustration={
            <Flow label="Your browser sends only ciphertext over HTTPS to a Cloudflare Worker, which saves it in a D1 database.">
              <FlowNode icon={BrowserIcon}>your browser</FlowNode>
              <FlowArrow>HTTPS</FlowArrow>
              <FlowNode icon={CloudIcon}>Cloudflare Worker</FlowNode>
              <FlowArrow />
              <FlowNode icon={DatabaseIcon}>D1</FlowNode>
            </Flow>
          }
        >
          A Cloudflare Worker saves the ciphertext in a D1 database. It has no key, so it can't read
          your secrets. Neither can anyone who breaks in. Folder names aren't encrypted, so keep
          secrets out of them.
        </Step>

        <Step
          number={4}
          title="Unlock on any machine"
          illustration={
            <Flow label="On your laptop and on your desktop, the same vault password makes the same key and unlocks the same secrets.">
              <FlowNode icon={LaptopIcon}>laptop</FlowNode>
              <FlowNode icon={DesktopIcon}>desktop</FlowNode>
              <FlowArrow>same password</FlowArrow>
              <FlowNode icon={KeyIcon}>same key</FlowNode>
            </Flow>
          }
        >
          Sign in on another device, type the same vault password, and you get the same key back.
          Forgot it? Your recovery code opens the vault too. Lose both, and nobody can get your
          secrets back, not even the server.
        </Step>
      </ol>
    </section>
  )
}
