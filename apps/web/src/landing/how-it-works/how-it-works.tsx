import {
  CloudIcon,
  DatabaseIcon,
  DevicesIcon,
  FileTextIcon,
  KeyIcon,
  LockSimpleIcon,
  PasswordIcon,
} from "@phosphor-icons/react"
import { Marker } from "@/components/marker"
import { Crossing, Node, StepDown, Zone } from "@/landing/how-it-works/diagram-parts"

// Each step matches the marker with the same number in the diagram, from top to bottom.
const STEPS = [
  {
    title: "Your password becomes a key",
    text: "PBKDF2-SHA-256 runs 600,000 iterations in your browser to derive the key. The password is never sent anywhere.",
  },
  {
    title: "Your browser encrypts the folder",
    text: "Each folder is sealed with AES-256-GCM before it leaves the tab.",
  },
  {
    title: "Only ciphertext crosses the network",
    text: "The request carries the sealed folder over HTTPS. Without your key, nothing in it is readable.",
  },
  {
    title: "The server stores what it cannot read",
    text: "A Cloudflare Worker saves the ciphertext in D1. The key never reaches the server, so a database leak exposes no values.",
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
          Encryption and decryption happen in your browser. The server stores ciphertext and never
          has a key for it.
        </p>
      </div>

      <figure className="flex flex-col gap-3">
        <div className="flex flex-col">
          <Zone icon={DevicesIcon} title="Your browser" note="Plain text exists only here">
            <Node icon={PasswordIcon} label="Vault password" value="••••••••••" marker={1} />
            <StepDown>PBKDF2 ×600k</StepDown>
            <Node icon={KeyIcon} label="Encryption key, in memory only" />
            <StepDown>AES-256-GCM</StepDown>
            <Node
              icon={FileTextIcon}
              label="Your .env values"
              value="STRIPE_SECRET_KEY=sk_live_4eC39…"
              marker={2}
            />
          </Zone>

          <Crossing marker={3}>HTTPS, ciphertext only</Crossing>

          <Zone icon={CloudIcon} title="Cloudflare" note="Ciphertext only, no key" untrusted>
            <Node
              icon={LockSimpleIcon}
              label="Worker receives"
              value="q8Zt0xLmP3…Rw4="
              marker={4}
            />
            <StepDown>stores</StepDown>
            <Node icon={DatabaseIcon} label="D1 database" value="q8Zt0xLmP3…Rw4=" />
          </Zone>
        </div>
        <figcaption className="text-muted-foreground text-xs">
          Folder names are stored as plain text, so keep secrets out of them.
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

      <p className="max-w-xl text-muted-foreground text-sm">
        On another machine, the same vault password derives the same key. If you forget the
        password, the recovery code from setup unlocks the vault and lets you set a new one.
      </p>
    </section>
  )
}
