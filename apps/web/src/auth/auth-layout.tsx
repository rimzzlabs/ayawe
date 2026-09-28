import { SignOutIcon } from "@phosphor-icons/react"
import type { ReactNode } from "react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { UserBadge } from "@/components/user-badge"
import type { Me } from "@/lib/api"

interface AuthLayoutProps {
  me: Me
  onSignOut: () => void
  children: ReactNode
}

export function AuthLayout(props: AuthLayoutProps) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col gap-8 p-4 sm:p-8">
      <AppHeader>
        <UserBadge me={props.me} />
        <Button variant="ghost" size="icon-sm" aria-label="Sign out" onClick={props.onSignOut}>
          <SignOutIcon />
        </Button>
      </AppHeader>
      <main className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-sm">{props.children}</div>
      </main>
    </div>
  )
}
