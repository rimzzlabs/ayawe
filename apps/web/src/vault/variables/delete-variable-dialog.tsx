import { useTransition } from "react"
import {
  ResponsiveAlertDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/responsive-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { Entry } from "@/lib/dotenv"

interface DeleteVariableDialogProps {
  entry: Entry
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Deletes the variable. Returns `true` on success. */
  onConfirm: () => Promise<boolean>
}

export function DeleteVariableDialog(props: DeleteVariableDialogProps) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const deleted = await props.onConfirm()
      if (deleted) props.onOpenChange(false)
    })
  }

  return (
    <ResponsiveAlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="break-all">
            Delete {props.entry.key}?
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Apps that read this variable stop working until you add it again. You cannot undo this.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose render={<Button variant="outline" />}>
            Cancel
          </ResponsiveDialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
            focusableWhenDisabled
          >
            {pending && <Spinner data-icon="inline-start" />}
            Delete
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveAlertDialog>
  )
}
