import type { ReactNode } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Me } from "@/lib/api"

interface UserMenuProps {
  me: Me
  /** `DropdownMenuItem` elements, for example Lock and Sign out. */
  children: ReactNode
}

export function UserMenu(props: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Account menu for ${props.me.login}`}
          />
        }
      >
        <Avatar size="sm">
          {props.me.avatarUrl && <AvatarImage src={props.me.avatarUrl} alt="" />}
          <AvatarFallback>{props.me.login.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">{props.me.login}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>{props.children}</DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
