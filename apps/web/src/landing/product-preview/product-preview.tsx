import { CopyIcon, DotsThreeIcon, EyeIcon, EyeSlashIcon, FolderIcon } from "@phosphor-icons/react"

interface PreviewRow {
  name: string
  /** A value to show as revealed. Hidden rows show the fixed mask, as the app does. */
  revealed?: string
  extraLines?: number
}

// Sample data only. The one revealed value is public by design (a NEXT_PUBLIC_ variable).
const ROWS: PreviewRow[] = [
  { name: "DATABASE_URL" },
  { name: "STRIPE_SECRET_KEY" },
  { name: "NEXT_PUBLIC_APP_URL", revealed: "https://app.example.com" },
  { name: "JWT_PRIVATE_KEY", revealed: "-----BEGIN PRIVATE KEY-----", extraLines: 26 },
]

/** A static picture of a folder in the vault. It is not interactive. */
export function ProductPreview() {
  return (
    <figure
      role="img"
      aria-label="A folder named api-production with four variables. Two values are masked, and two are revealed."
      className="border bg-card shadow-foreground/5 shadow-xl"
    >
      <div aria-hidden="true">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <span className="flex min-w-0 items-center gap-2">
            <FolderIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-heading text-lg">api-production</span>
            <span className="hidden text-muted-foreground text-xs sm:inline">· 4 variables</span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5 border px-2.5 py-1 font-semibold text-[0.625rem] uppercase tracking-widest">
            <CopyIcon className="size-3" />
            Copy .env
          </span>
        </div>
        <ul className="divide-y">
          {ROWS.map((row) => (
            <li key={row.name} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-2/5 min-w-0 truncate font-medium font-mono text-xs sm:text-sm">
                {row.name}
              </span>
              <span className="flex min-w-0 flex-1 items-baseline gap-2 font-mono text-xs sm:text-sm">
                {row.revealed ? (
                  <span className="min-w-0 truncate">{row.revealed}</span>
                ) : (
                  <span className="text-muted-foreground tracking-[0.2em]">••••••••••••</span>
                )}
                {row.extraLines && (
                  <span className="hidden shrink-0 font-sans text-muted-foreground text-xs sm:inline">
                    +{row.extraLines} lines
                  </span>
                )}
              </span>
              <span className="flex shrink-0 items-center gap-2 text-muted-foreground">
                {row.revealed ? (
                  <EyeSlashIcon className="size-3.5" />
                ) : (
                  <EyeIcon className="size-3.5" />
                )}
                <CopyIcon className="size-3.5" />
                <DotsThreeIcon weight="bold" className="hidden size-3.5 sm:block" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}
