import { SignOutIcon } from "@phosphor-icons/react"
import type { ReactNode } from "react"
import { AppHeader } from "@/components/app-header"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { UserMenu } from "@/components/user-menu"
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
        <UserMenu me={props.me}>
          <DropdownMenuItem onClick={props.onSignOut}>
            <SignOutIcon />
            Sign out
          </DropdownMenuItem>
        </UserMenu>
      </AppHeader>
      <main className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-sm">{props.children}</div>
      </main>
    </div>
  )
}
