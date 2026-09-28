import { TrashIcon } from "@phosphor-icons/react"
import { useTransition } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { deleteFolder, type FolderSummary } from "@/lib/api"

interface DeleteFolderButtonProps {
  folder: FolderSummary
  onDeleted: (id: string) => void
}

export function DeleteFolderButton(props: DeleteFolderButtonProps) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const deleted = await deleteFolder(props.folder.id)
      if (!deleted.ok) {
        toast.add({ title: deleted.error.message, type: "error" })
        return
      }
      toast.add({ title: `Deleted ${props.folder.name}`, type: "success" })
      props.onDeleted(props.folder.id)
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label="Delete folder" />}
      >
        <TrashIcon />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {props.folder.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This deletes the folder and all its secrets. You cannot undo this.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={pending}>
            {pending && <Spinner data-icon="inline-start" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
