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
import { deleteEnv } from "@/lib/api"
import type { Session } from "@/lib/screen"

interface DeleteEnvButtonProps {
  session: Session
  name: string
  onDeleted: (name: string) => void
}

export function DeleteEnvButton(props: DeleteEnvButtonProps) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const deleted = await deleteEnv(props.session.token, props.name)
      if (!deleted.ok) {
        toast.add({ title: deleted.error.message, type: "error" })
        return
      }
      toast.add({ title: `Deleted ${props.name}`, type: "success" })
      props.onDeleted(props.name)
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button type="button" variant="destructive" />}>
        <TrashIcon data-icon="inline-start" />
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {props.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the env file from the server. You cannot undo this.
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
