import type { ReactNode } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Wordmark } from "@/components/wordmark"

interface AppHeaderProps {
  /** Rendered to the right of the theme toggle, for example the user menu. */
  children?: ReactNode
}

export function AppHeader(props: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <Wordmark />
      <div className="flex items-center gap-1">
        <ThemeToggle />
        {props.children}
      </div>
    </header>
  )
}
