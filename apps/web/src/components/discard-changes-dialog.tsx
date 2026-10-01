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

interface DiscardChangesDialogProps {
  open: boolean
  onKeepEditing: () => void
  onDiscard: () => void
}

export function DiscardChangesDialog(props: DiscardChangesDialogProps) {
  return (
    <ResponsiveAlertDialog
      open={props.open}
      onOpenChange={(open) => {
        if (!open) props.onKeepEditing()
      }}
    >
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Discard unsaved changes?</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            You have changes that aren't saved yet. If you leave now, they're gone.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose render={<Button variant="outline" />}>
            Keep editing
          </ResponsiveDialogClose>
          <Button variant="destructive" onClick={props.onDiscard}>
            Discard
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveAlertDialog>
  )
}
