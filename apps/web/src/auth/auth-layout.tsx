import type { ReactNode } from "react"
import { Wordmark } from "@/components/wordmark"

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout(props: AuthLayoutProps) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-8 p-4">
      <Wordmark />
      <div className="w-full max-w-sm">{props.children}</div>
    </main>
  )
}
