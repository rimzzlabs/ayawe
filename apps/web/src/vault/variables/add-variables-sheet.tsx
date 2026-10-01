import { FloppyDiskIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react"
import type { ClipboardEvent } from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { ENV_KEY_PATTERN, type Entry, isDotenvPaste, mergeEntries, parseDotenv } from "@/lib/dotenv"
import { useUnsavedChanges } from "@/lib/unsaved-changes"
import { SecretValueInput } from "@/vault/secret-value-input"
import { DiscardConfirmation, useDiscardGuard } from "@/vault/variables/discard-guard"

interface AddVariablesFormValues {
  entries: Entry[]
}

interface AddVariablesSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingKeys: string[]
  /** Saves the new variables. Returns `true` on success. */
  onSubmit: (entries: Entry[]) => Promise<boolean>
}

const BLANK_ENTRY: Entry = { key: "", value: "" }

function filledEntries(entries: Entry[]) {
  return entries
    .map((entry) => ({ key: entry.key.trim(), value: entry.value }))
    .filter((entry) => entry.key !== "" || entry.value !== "")
}

export function AddVariablesSheet(props: AddVariablesSheetProps) {
  const form = useForm<AddVariablesFormValues>({ defaultValues: { entries: [BLANK_ENTRY] } })
  const entries = useFieldArray({ control: form.control, name: "entries" })
  const watchedEntries = useWatch({ control: form.control, name: "entries" })
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

  function handleKeyPaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text")
    if (!isDotenvPaste(text)) return

    const pasted = parseDotenv(text)
    if (pasted.length === 0) return

    event.preventDefault()
    const others = filledEntries(form.getValues("entries").filter((_entry, i) => i !== index))
    entries.replace(mergeEntries(others, pasted))
    toast.add({ title: `Added ${pasted.length} rows from the paste`, type: "success" })
  }

  async function handleSave(values: AddVariablesFormValues) {
    const existingKeys = new Set(props.existingKeys)
    const seenKeys = new Set<string>()
    for (const [index, entry] of values.entries.entries()) {
      const key = entry.key.trim()
      if (key === "") continue
      if (existingKeys.has(key)) {
        form.setError(`entries.${index}.key`, {
          message: "This key is already in the folder. Edit it there",
        })
        return
      }
      if (seenKeys.has(key)) {
        form.setError(`entries.${index}.key`, { message: "This key is already in the list" })
        return
      }
      seenKeys.add(key)
    }

    const filled = filledEntries(values.entries)
    if (filled.length === 0) {
      form.setError("entries.0.key", { message: "Enter a key" })
      return
    }

    const saved = await props.onSubmit(filled)
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
              <ResponsiveSheetTitle>Add variables</ResponsiveSheetTitle>
              <ResponsiveSheetDescription>
                Paste a whole .env file into a key field to add many variables at once.
              </ResponsiveSheetDescription>
            </ResponsiveSheetHeader>

            <ResponsiveSheetBody className="flex flex-col gap-4">
              <div
                className="hidden gap-2 text-muted-foreground text-xs uppercase tracking-wider lg:flex"
                aria-hidden="true"
              >
                <span className="w-2/5">Key</span>
                <span className="flex-1">Value</span>
                <span className="w-9" />
              </div>

              <ul className="flex flex-col gap-3">
                {entries.fields.map((row, index) => (
                  // A labelled card on phones and tablets. A single compact line on desktop.
                  <li
                    key={row.id}
                    className="relative flex flex-col gap-4 border bg-card p-4 lg:flex-row lg:items-start lg:gap-2 lg:border-0 lg:bg-transparent lg:p-0"
                  >
                    <span
                      aria-hidden="true"
                      className="pr-10 font-semibold text-muted-foreground text-xs uppercase tracking-wider lg:hidden"
                    >
                      Variable {index + 1}
                    </span>
                    <Controller
                      control={form.control}
                      name={`entries.${index}.key`}
                      rules={{
                        validate: (key) => {
                          const value = form.getValues(`entries.${index}.value`)
                          if (key.trim() === "" && value === "") return true
                          if (key.trim() === "") return "Enter a key"
                          if (!ENV_KEY_PATTERN.test(key.trim())) {
                            return "Use letters, digits, and underscores. Do not start with a digit"
                          }
                          return true
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid || undefined} className="lg:w-2/5">
                          <FieldLabel htmlFor={`${row.id}-key`} className="lg:sr-only">
                            Key<span className="sr-only"> {index + 1}</span>
                          </FieldLabel>
                          <Input
                            {...field}
                            id={`${row.id}-key`}
                            placeholder="DATABASE_URL"
                            autoComplete="off"
                            autoFocus={index === 0}
                            spellCheck={false}
                            className="font-mono"
                            aria-invalid={fieldState.invalid || undefined}
                            aria-describedby={fieldState.error ? `${row.id}-key-error` : undefined}
                            onPaste={(event) => handleKeyPaste(index, event)}
                          />
                          <FieldError id={`${row.id}-key-error`} errors={[fieldState.error]} />
                        </Field>
                      )}
                    />
                    <Controller
                      control={form.control}
                      name={`entries.${index}.value`}
                      render={({ field }) => (
                        <Field className="lg:flex-1">
                          <FieldLabel htmlFor={`${row.id}-value`} className="lg:sr-only">
                            Value<span className="sr-only"> {index + 1}</span>
                          </FieldLabel>
                          <SecretValueInput {...field} id={`${row.id}-value`} placeholder="value" />
                        </Field>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute top-2 right-2 lg:static"
                      aria-label={`Remove ${watchedEntries[index]?.key.trim() || `row ${index + 1}`}`}
                      onClick={() =>
                        entries.fields.length === 1
                          ? entries.replace([BLANK_ENTRY])
                          : entries.remove(index)
                      }
                    >
                      <TrashIcon />
                    </Button>
                  </li>
                ))}
              </ul>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-dashed lg:w-auto lg:self-start"
                onClick={() => entries.append(BLANK_ENTRY)}
              >
                <PlusIcon data-icon="inline-start" />
                Add another variable
              </Button>
            </ResponsiveSheetBody>

            <ResponsiveSheetFooter>
              <ResponsiveSheetClose render={<Button type="button" variant="outline" />}>
                Cancel
              </ResponsiveSheetClose>
              <Button type="submit" disabled={isSubmitting} focusableWhenDisabled>
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
