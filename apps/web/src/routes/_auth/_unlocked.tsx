import { LockIcon, SignOutIcon } from "@phosphor-icons/react"
import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router"
import { AppHeader } from "@/components/app-header"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { UserMenu } from "@/components/user-menu"
import { useIdleLock } from "@/hooks/use-idle-lock"
import { getSession } from "@/lib/session"

/** Every route under `_unlocked` needs the vault key in memory. */
export const Route = createFileRoute("/_auth/_unlocked")({
  beforeLoad: ({ location }) => {
    // The pages get this snapshot through the route context. A live read could find no key
    // while "Lock vault" navigates away, because /lock clears the key before this page leaves.
    const session = getSession()
    // After a reload the key is gone. Unlock, then come back to the same page.
    if (!session) throw redirect({ to: "/unlock", search: { redirect: location.href } })
    return { session }
  },
  component: VaultLayout,
})

function VaultLayout() {
  const context = Route.useRouteContext()
  const navigate = useNavigate()
  useIdleLock()

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-10 p-4 sm:p-8">
      <AppHeader homeTo="/vault">
        <UserMenu me={context.session.me}>
          <DropdownMenuItem onClick={() => navigate({ to: "/lock" })}>
            <LockIcon />
            Lock vault
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate({ to: "/sign-out" })}>
            <SignOutIcon />
            Sign out
          </DropdownMenuItem>
        </UserMenu>
      </AppHeader>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
