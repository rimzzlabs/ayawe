import { type ReactElement, useState } from "react"
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/responsive-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { readField, useFormAction } from "@/lib/use-form-action"

interface FolderNameDialogProps {
  /** The button that opens the dialog. Leave it out and pass `open` to open it from code. */
  trigger?: ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description: string
  submitLabel: string
  defaultName?: string
  /** Returns an error message, or `undefined` when the name was saved. */
  onSubmit: (name: string) => Promise<string | undefined>
}

export function FolderNameDialog(props: FolderNameDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = props.open ?? internalOpen
  const [name, setName] = useState(props.defaultName ?? "")
  const [confirmingDiscard, setConfirmingDiscard] = useState(false)
  const isDirty = name !== (props.defaultName ?? "")

  const form = useFormAction(async (formData) => {
    const name = readField(formData, "name")
    if (!name) return "Enter a name"

    const error = await props.onSubmit(name)
    if (!error) setOpen(false)
    return error
  })

  function setOpen(nextOpen: boolean) {
    setInternalOpen(nextOpen)
    props.onOpenChange?.(nextOpen)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setName(props.defaultName ?? "")
      setConfirmingDiscard(false)
      setOpen(true)
      return
    }
    // Esc on the confirmation means "keep editing", not "close everything".
    if (confirmingDiscard) {
      setConfirmingDiscard(false)
      return
    }
    if (isDirty && !form.pending) {
      setConfirmingDiscard(true)
      return
    }
    setOpen(false)
  }

  // The confirmation replaces the form inside the same dialog. A second, stacked dialog
  // gets no backdrop of its own, so the parent dialog showed through around it.
  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      {props.trigger && <ResponsiveDialogTrigger render={props.trigger} />}
      <ResponsiveDialogContent>
        {confirmingDiscard ? (
          <div className="flex flex-col gap-6">
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>Discard unsaved changes?</ResponsiveDialogTitle>
              <ResponsiveDialogDescription id="discard-description">
                You typed a name that isn't saved yet. If you leave now, it's gone.
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
            <ResponsiveDialogFooter>
              <Button
                type="button"
                variant="outline"
                autoFocus
                aria-describedby="discard-description"
                onClick={() => setConfirmingDiscard(false)}
              >
                Keep editing
              </Button>
              <Button type="button" variant="destructive" onClick={() => setOpen(false)}>
                Discard
              </Button>
            </ResponsiveDialogFooter>
          </div>
        ) : (
          <form className="flex flex-col gap-6" onSubmit={form.onSubmit}>
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>{props.title}</ResponsiveDialogTitle>
              <ResponsiveDialogDescription>{props.description}</ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
            <FieldGroup>
              <Field data-invalid={form.error ? true : undefined}>
                <FieldLabel htmlFor="folder-name">Name</FieldLabel>
                <Input
                  id="folder-name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="my-app"
                  autoComplete="off"
                  maxLength={64}
                  autoFocus
                  aria-invalid={form.error ? true : undefined}
                  aria-describedby={form.error ? "folder-name-error" : undefined}
                />
                <FieldError id="folder-name-error">{form.error}</FieldError>
              </Field>
            </FieldGroup>
            <ResponsiveDialogFooter>
              <ResponsiveDialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </ResponsiveDialogClose>
              <Button type="submit" disabled={form.pending} focusableWhenDisabled>
                {form.pending && <Spinner data-icon="inline-start" />}
                {props.submitLabel}
              </Button>
            </ResponsiveDialogFooter>
          </form>
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
