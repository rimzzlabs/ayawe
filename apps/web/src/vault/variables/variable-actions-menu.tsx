import { DotsThreeIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface VariableActionsMenuProps {
  variableKey: string
  onEdit: () => void
  onDelete: () => void
}

export function VariableActionsMenu(props: VariableActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${props.variableKey}`} />
        }
      >
        <DotsThreeIcon weight="bold" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-40">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={props.onEdit}>
            <PencilSimpleIcon />
            Edit
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onClick={props.onDelete}>
            <TrashIcon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
