import type { ReactNode } from "react"

interface VisibilityProps {
  children: ReactNode
}

// Both versions render, and the `data-signed-in` flag on <html> picks one with CSS. The flag
// is set before the first paint (index.html) and updated by `lib/session.ts`, so the page never
// swaps from one version to the other while it starts. `display: contents` keeps the layout.

export function SignedOut(props: VisibilityProps) {
  return <span className="contents in-data-signed-in:hidden">{props.children}</span>
}

export function SignedIn(props: VisibilityProps) {
  return <span className="in-data-signed-in:contents hidden">{props.children}</span>
}
