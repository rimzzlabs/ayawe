import type { ReactNode } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Wordmark } from "@/components/wordmark"

interface AppHeaderProps {
  children?: ReactNode
}

export function AppHeader(props: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <Wordmark />
      <div className="flex min-w-0 items-center gap-2">
        {props.children}
        <ThemeToggle />
      </div>
    </header>
  )
}
