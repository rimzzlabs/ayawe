import {
  ClipboardTextIcon,
  CopyIcon,
  DeviceMobileIcon,
  FileLockIcon,
  type Icon,
  LockKeyIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react"

interface Feature {
  icon: Icon
  title: string
  text: string
}

const FEATURES: Feature[] = [
  {
    icon: ClipboardTextIcon,
    title: "Paste the whole file",
    text: "Paste a .env into a key field and every line becomes a variable. Quoted, exported, and commented lines all parse.",
  },
  {
    icon: CopyIcon,
    title: "Copy it back as .env",
    text: "One click copies the folder as a valid .env file, quoted and escaped where a value needs it.",
  },
  {
    icon: FileLockIcon,
    title: "Keys and certificates stay intact",
    text: "Multi-line values, such as PEM private keys, keep every line break through save and copy.",
  },
  {
    icon: MagnifyingGlassIcon,
    title: "Find any key in a keystroke",
    text: "Search matches word starts and small typos. Type dps to find DATABASE_POOL_SIZE.",
  },
  {
    icon: LockKeyIcon,
    title: "Locks itself",
    text: "The key lives only in memory. A reload or 15 idle minutes locks the vault again.",
  },
  {
    icon: DeviceMobileIcon,
    title: "Works from your phone",
    text: "Rotate a value from a bottom sheet when you are away from your laptop.",
  },
]

export function Features() {
  return (
    <section aria-labelledby="features" className="flex flex-col gap-8 border-t pt-12">
      <div className="flex flex-col gap-2">
        <h2 id="features" className="font-heading text-3xl">
          Made for .env files, not general notes
        </h2>
        <p className="max-w-xl text-muted-foreground">
          The vault understands the format, so moving a project to a new machine takes one paste.
        </p>
      </div>

      <ul className="grid gap-px border bg-border sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <li key={feature.title} className="flex flex-col gap-2 bg-background p-5">
            <feature.icon className="size-5 text-muted-foreground" aria-hidden="true" />
            <h3 className="font-medium text-sm">{feature.title}</h3>
            <p className="text-muted-foreground text-sm">{feature.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
