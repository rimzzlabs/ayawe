import { TrashIcon } from "@phosphor-icons/react"
import { useState, useTransition } from "react"
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
import { toast } from "@/components/ui/toast"
import { deleteFolder, type FolderSummary } from "@/lib/api"

interface DeleteFolderButtonProps {
  folder: FolderSummary
  onDeleted: (id: string) => void
}

export function DeleteFolderButton(props: DeleteFolderButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Delete folder"
        onClick={() => setOpen(true)}
      >
        <TrashIcon />
      </Button>
      <DeleteFolderDialog
        folder={props.folder}
        open={open}
        onOpenChange={setOpen}
        onDeleted={props.onDeleted}
      />
    </>
  )
}

interface DeleteFolderDialogProps {
  folder: FolderSummary
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: (id: string) => void
}

export function DeleteFolderDialog(props: DeleteFolderDialogProps) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const deleted = await deleteFolder(props.folder.id)
      if (!deleted.ok) {
        toast.add({ title: deleted.error.message, type: "error" })
        return
      }
      toast.add({ title: `Deleted ${props.folder.name}`, type: "success" })
      props.onOpenChange(false)
      props.onDeleted(props.folder.id)
    })
  }

  return (
    <ResponsiveAlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Delete {props.folder.name}?</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            This deletes the folder and all its secrets. You cannot undo this.
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
