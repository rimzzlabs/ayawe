import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Wordmark } from "@/components/wordmark"

interface AppHeaderProps {
  /** Where the wordmark links to. The vault links to the folder list. */
  homeTo?: "/" | "/vault"
  /** Rendered to the right of the theme toggle, for example the user menu. */
  children?: ReactNode
}

export function AppHeader(props: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <Link
        to={props.homeTo ?? "/"}
        className="outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <Wordmark />
      </Link>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        {props.children}
      </div>
    </header>
  )
}
