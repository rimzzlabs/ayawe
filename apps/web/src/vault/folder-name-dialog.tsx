import { type ReactElement, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { readField, useFormAction } from "@/lib/use-form-action"

interface FolderNameDialogProps {
  trigger: ReactElement
  title: string
  description: string
  submitLabel: string
  defaultName?: string
  /** Returns an error message, or `undefined` when the name was saved. */
  onSubmit: (name: string) => Promise<string | undefined>
}

export function FolderNameDialog(props: FolderNameDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useFormAction(async (formData) => {
    const name = readField(formData, "name")
    if (!name) return "Enter a name"

    const error = await props.onSubmit(name)
    if (!error) setOpen(false)
    return error
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={props.trigger} />
      <DialogContent>
        <form className="flex flex-col gap-6" onSubmit={form.onSubmit}>
          <DialogHeader>
            <DialogTitle>{props.title}</DialogTitle>
            <DialogDescription>{props.description}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field data-invalid={form.error ? true : undefined}>
              <FieldLabel htmlFor="folder-name">Name</FieldLabel>
              <Input
                id="folder-name"
                name="name"
                defaultValue={props.defaultName}
                placeholder="my-app"
                autoComplete="off"
                maxLength={64}
                autoFocus
                aria-invalid={form.error ? true : undefined}
              />
              <FieldError>{form.error}</FieldError>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={form.pending}>
              {form.pending && <Spinner data-icon="inline-start" />}
              {props.submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
