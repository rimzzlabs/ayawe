import type { Entry } from "@/lib/dotenv"
import { VariableActionsMenu } from "@/vault/variables/variable-actions-menu"
import { VariableValue } from "@/vault/variables/variable-value"

interface VariableCardListProps {
  entries: Entry[]
  onEdit: (entry: Entry) => void
  onDelete: (entry: Entry) => void
}

export function VariableCardList(props: VariableCardListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {props.entries.map((entry) => (
        <li key={entry.key} className="flex flex-col gap-3 border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate font-mono font-semibold text-sm" title={entry.key}>
              {entry.key}
            </span>
            <VariableActionsMenu
              variableKey={entry.key}
              onEdit={() => props.onEdit(entry)}
              onDelete={() => props.onDelete(entry)}
            />
          </div>
          <VariableValue entry={entry} className="bg-muted/60 py-1 pr-1 pl-3" />
        </li>
      ))}
    </ul>
  )
}
