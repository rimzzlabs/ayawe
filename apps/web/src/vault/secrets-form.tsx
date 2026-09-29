import { CopyIcon, FloppyDiskIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react"
import type { ClipboardEvent } from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { type FolderSummary, saveSecrets } from "@/lib/api"
import { copyText } from "@/lib/clipboard"
import {
  ENV_KEY_PATTERN,
  type Entry,
  isDotenvPaste,
  mergeEntries,
  parseDotenv,
  serializeDotenv,
} from "@/lib/dotenv"
import type { Session } from "@/lib/screen"
import { sealEntries } from "@/lib/secrets"
import { SecretValueInput } from "@/vault/secret-value-input"

interface SecretsFormValues {
  entries: Entry[]
}

interface SecretsFormProps {
  session: Session
  folder: FolderSummary
  initialEntries: Entry[]
  onSaved: (updatedAt: number) => void
}

const BLANK_ENTRY: Entry = { key: "", value: "" }

function withBlankRow(entries: Entry[]) {
  return entries.length === 0 ? [BLANK_ENTRY] : entries
}

function filledEntries(entries: Entry[]) {
  return entries
    .map((entry) => ({ key: entry.key.trim(), value: entry.value }))
    .filter((entry) => entry.key !== "" || entry.value !== "")
}

export function SecretsForm(props: SecretsFormProps) {
  const form = useForm<SecretsFormValues>({
    defaultValues: { entries: withBlankRow(props.initialEntries) },
  })
  const entries = useFieldArray({ control: form.control, name: "entries" })
  const watchedEntries = useWatch({ control: form.control, name: "entries" })

  function handleKeyPaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text")
    if (!isDotenvPaste(text)) return

    const pasted = parseDotenv(text)
    if (pasted.length === 0) return

    event.preventDefault()
    const others = filledEntries(form.getValues("entries").filter((_entry, i) => i !== index))
    entries.replace(mergeEntries(others, pasted))
    toast.add({ title: `Added ${pasted.length} variables from the paste`, type: "success" })
  }

  async function handleCopy() {
    const copied = await copyText(serializeDotenv(filledEntries(form.getValues("entries"))))
    toast.add(
      copied.ok
        ? { title: "Copied as .env", type: "success" }
        : { title: copied.error.message, type: "error" },
    )
  }

  async function handleSave(values: SecretsFormValues) {
    const seenKeys = new Set<string>()
    for (const [index, entry] of values.entries.entries()) {
      const key = entry.key.trim()
      if (key === "") continue
      if (seenKeys.has(key)) {
        form.setError(`entries.${index}.key`, { message: "This key is already in the list" })
        return
      }
      seenKeys.add(key)
    }

    const filled = filledEntries(values.entries)

    const sealed = await sealEntries(props.session.dataKey, filled)
    const saved = await saveSecrets(props.folder.id, sealed)
    if (!saved.ok) {
      toast.add({ title: saved.error.message, type: "error" })
      return
    }

    form.reset({ entries: withBlankRow(filled) })
    toast.add({ title: `Saved ${props.folder.name}`, type: "success" })
    props.onSaved(saved.value.updatedAt)
  }

  const { isDirty, isSubmitting } = form.formState

  return (
    <form className="flex flex-col gap-6" onSubmit={form.handleSubmit(handleSave)}>
      <div className="flex flex-col gap-3">
        <div className="hidden gap-2 text-muted-foreground text-xs sm:flex" aria-hidden="true">
          <span className="w-2/5">Key</span>
          <span className="flex-1">Value</span>
          <span className="w-9" />
        </div>

        <ul className="flex flex-col gap-3">
          {entries.fields.map((row, index) => (
            <li key={row.id} className="flex flex-col gap-2 sm:flex-row sm:items-start">
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
                  <Field data-invalid={fieldState.invalid || undefined} className="sm:w-2/5">
                    <FieldLabel htmlFor={`${row.id}-key`} className="sr-only">
                      Key {index + 1}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={`${row.id}-key`}
                      placeholder="DATABASE_URL"
                      autoComplete="off"
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
                  <Field className="flex-1">
                    <FieldLabel htmlFor={`${row.id}-value`} className="sr-only">
                      Value {index + 1}
                    </FieldLabel>
                    <SecretValueInput {...field} id={`${row.id}-value`} placeholder="value" />
                  </Field>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="self-end sm:self-start"
                aria-label={`Remove ${watchedEntries[index]?.key.trim() || `variable ${index + 1}`}`}
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

        <FieldDescription>
          Tip: paste a whole .env file into any key field. Each line becomes a row.
        </FieldDescription>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-6">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => entries.append(BLANK_ENTRY)}
        >
          <PlusIcon data-icon="inline-start" />
          Add variable
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleCopy}>
            <CopyIcon data-icon="inline-start" />
            Copy .env
          </Button>
          <Button type="submit" disabled={!isDirty || isSubmitting} focusableWhenDisabled>
            {isSubmitting ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <FloppyDiskIcon data-icon="inline-start" />
            )}
            Save
          </Button>
        </div>
      </div>
    </form>
  )
}
