import {
  CloudIcon,
  DatabaseIcon,
  DevicesIcon,
  FileTextIcon,
  KeyIcon,
  LockSimpleIcon,
  PasswordIcon,
} from "@phosphor-icons/react"
import { Crossing, Marker, Node, StepDown, Zone } from "@/landing/how-it-works/diagram-parts"

const STEPS = [
  {
    title: "Your password becomes a key",
    text: "600,000 rounds of PBKDF2 turn your vault password into a key. The password itself never leaves the tab.",
  },
  {
    title: "Your browser locks the secrets",
    text: "Each folder gets sealed with AES-256-GCM before it's sent anywhere.",
  },
  {
    title: "The server keeps gibberish",
    text: "A Cloudflare Worker saves the ciphertext in D1. No key lives there, so nobody there can read it.",
  },
  {
    title: "Any device, same key",
    text: "Type the same password on another machine and you get the same key back. Lost it? Use the recovery code.",
  },
]

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works" className="flex flex-col gap-8 border-t pt-12">
      <div className="flex flex-col gap-2">
        <h2 id="how-it-works" className="font-heading text-3xl">
          How it works
        </h2>
        <p className="max-w-xl text-muted-foreground">
          Plain text never leaves your device. Here's the whole trip.
        </p>
      </div>

      <figure className="flex flex-col gap-3">
        <div className="flex flex-col">
          <Zone icon={DevicesIcon} title="Your device" note="Plain text lives here">
            <Node icon={PasswordIcon} label="Vault password" value="••••••••••" marker={1} />
            <StepDown>PBKDF2 ×600k</StepDown>
            <Node icon={KeyIcon} label="Key, kept in this tab" marker={4} />
            <StepDown>AES-256-GCM</StepDown>
            <Node
              icon={FileTextIcon}
              label="Your secrets"
              value="API_KEY=sk_live_4eC39…"
              marker={2}
            />
          </Zone>

          <Crossing marker={3}>HTTPS, ciphertext only</Crossing>

          <Zone icon={CloudIcon} title="Cloudflare" note="No key, can't decrypt" untrusted>
            <Node icon={LockSimpleIcon} label="Worker receives" value="q8Zt0xLmP3…Rw4=" />
            <StepDown>stores</StepDown>
            <Node icon={DatabaseIcon} label="D1 database" value="q8Zt0xLmP3…Rw4=" />
          </Zone>
        </div>
        <figcaption className="text-muted-foreground text-xs">
          Folder names are the one thing the server can read. Keep secrets out of them.
        </figcaption>
      </figure>

      <ol className="grid gap-6 sm:grid-cols-2">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <Marker number={index + 1} />
            <div className="flex flex-col gap-1">
              <h3 className="font-medium text-sm leading-5">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
