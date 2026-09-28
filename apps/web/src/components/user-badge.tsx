import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Me } from "@/lib/api"

interface UserBadgeProps {
  me: Me
}

export function UserBadge(props: UserBadgeProps) {
  return (
    <span className="flex min-w-0 items-center gap-2 text-sm">
      <Avatar size="sm">
        {props.me.avatarUrl && <AvatarImage src={props.me.avatarUrl} alt="" />}
        <AvatarFallback>{props.me.login.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="truncate">{props.me.login}</span>
    </span>
  )
}
