import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Entry } from "@/lib/dotenv"
import { VariableActionsMenu } from "@/vault/variables/variable-actions-menu"
import { VariableValue } from "@/vault/variables/variable-value"

interface VariableTableProps {
  entries: Entry[]
  onEdit: (entry: Entry) => void
  onDelete: (entry: Entry) => void
}

export function VariableTable(props: VariableTableProps) {
  return (
    <div className="border">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-2/5 px-4">Key</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="w-14">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.entries.map((entry) => (
            <TableRow key={entry.key}>
              <TableCell className="px-4 py-2.5">
                <span className="block truncate font-medium font-mono text-sm" title={entry.key}>
                  {entry.key}
                </span>
              </TableCell>
              <TableCell className="py-2.5">
                <VariableValue entry={entry} />
              </TableCell>
              <TableCell className="py-2.5 pr-3 text-right">
                <VariableActionsMenu
                  variableKey={entry.key}
                  onEdit={() => props.onEdit(entry)}
                  onDelete={() => props.onDelete(entry)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
