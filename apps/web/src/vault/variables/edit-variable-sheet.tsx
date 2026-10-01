import { FloppyDiskIcon } from "@phosphor-icons/react"
import { Controller, useForm } from "react-hook-form"
import {
  ResponsiveSheet,
  ResponsiveSheetBody,
  ResponsiveSheetClose,
  ResponsiveSheetContent,
  ResponsiveSheetDescription,
  ResponsiveSheetFooter,
  ResponsiveSheetFrame,
  ResponsiveSheetHeader,
  ResponsiveSheetTitle,
} from "@/components/responsive-sheet"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { ENV_KEY_PATTERN, type Entry } from "@/lib/dotenv"
import { useUnsavedChanges } from "@/lib/unsaved-changes"
import { SecretValueTextarea } from "@/vault/secret-value-textarea"
import { DiscardConfirmation, useDiscardGuard } from "@/vault/variables/discard-guard"

interface EditVariableSheetProps {
  entry: Entry
  /** The keys of the other variables in the folder. */
  otherKeys: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Saves the changed variable. Returns `true` on success. */
  onSubmit: (entry: Entry) => Promise<boolean>
}

export function EditVariableSheet(props: EditVariableSheetProps) {
  const form = useForm<Entry>({ defaultValues: props.entry })
  const { isDirty, isSubmitting } = form.formState
  useUnsavedChanges(isDirty)

  const guard = useDiscardGuard({
    isDirty,
    isPending: isSubmitting,
    onClose: () => {
      form.reset()
      props.onOpenChange(false)
    },
  })

  async function handleSave(values: Entry) {
    const saved = await props.onSubmit({ key: values.key.trim(), value: values.value })
    if (!saved) return
    form.reset(values)
    props.onOpenChange(false)
  }

  return (
    <ResponsiveSheet open={props.open} onOpenChange={guard.handleOpenChange}>
      <ResponsiveSheetContent>
        {guard.confirming ? (
          <DiscardConfirmation onKeepEditing={guard.keepEditing} onDiscard={guard.discard} />
        ) : (
          <ResponsiveSheetFrame render={<form onSubmit={form.handleSubmit(handleSave)} />}>
            <ResponsiveSheetHeader>
              <ResponsiveSheetTitle>Edit variable</ResponsiveSheetTitle>
              <ResponsiveSheetDescription>
                Rotate the value, or rename the key.
              </ResponsiveSheetDescription>
            </ResponsiveSheetHeader>

            <ResponsiveSheetBody>
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="key"
                  rules={{
                    validate: (key) => {
                      const trimmed = key.trim()
                      if (trimmed === "") return "Enter a key"
                      if (!ENV_KEY_PATTERN.test(trimmed)) {
                        return "Use letters, digits, and underscores. Do not start with a digit"
                      }
                      if (props.otherKeys.includes(trimmed)) {
                        return "This key is already in the folder"
                      }
                      return true
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid || undefined}>
                      <FieldLabel htmlFor="edit-variable-key">Key</FieldLabel>
                      <Input
                        {...field}
                        id="edit-variable-key"
                        autoComplete="off"
                        spellCheck={false}
                        className="font-mono"
                        aria-invalid={fieldState.invalid || undefined}
                        aria-describedby={fieldState.error ? "edit-variable-key-error" : undefined}
                      />
                      <FieldError id="edit-variable-key-error" errors={[fieldState.error]} />
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="edit-variable-value">Value</FieldLabel>
                      <SecretValueTextarea
                        {...field}
                        id="edit-variable-value"
                        placeholder="value"
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
            </ResponsiveSheetBody>

            <ResponsiveSheetFooter>
              <ResponsiveSheetClose render={<Button type="button" variant="outline" />}>
                Cancel
              </ResponsiveSheetClose>
              <Button type="submit" disabled={!isDirty || isSubmitting} focusableWhenDisabled>
                {isSubmitting ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <FloppyDiskIcon data-icon="inline-start" />
                )}
                Save
              </Button>
            </ResponsiveSheetFooter>
          </ResponsiveSheetFrame>
        )}
      </ResponsiveSheetContent>
    </ResponsiveSheet>
  )
}
