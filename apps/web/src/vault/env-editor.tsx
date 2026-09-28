import { seal } from "@ayawe/crypto/seal"
import { ArrowLeftIcon, CopyIcon, FloppyDiskIcon } from "@phosphor-icons/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { ENV_NAME_PATTERN, saveEnv } from "@/lib/api"
import { copyText } from "@/lib/clipboard"
import type { Session } from "@/lib/screen"
import { readField, useFormAction } from "@/lib/use-form-action"
import { DeleteEnvButton } from "@/vault/delete-env-button"

interface EnvEditorProps {
  session: Session
  /** `null` creates a new env file. */
  name: string | null
  existingNames: string[]
  initialContent: string
  onSaved: (name: string, content: string) => void
  onDeleted: (name: string) => void
  onClose: () => void
}

export function EnvEditor(props: EnvEditorProps) {
  const [content, setContent] = useState(props.initialContent)
  const isNew = props.name === null

  const form = useFormAction(async (formData) => {
    const name = props.name ?? readField(formData, "name")
    if (!ENV_NAME_PATTERN.test(name)) return "Use letters, digits, dots, dashes, or underscores for the name"
    if (isNew && props.existingNames.includes(name)) return "An env file with this name exists"

    const sealed = await seal(props.session.dataKey, content)
    const saved = await saveEnv({ token: props.session.token, name, sealed })
    if (!saved.ok) return saved.error.message

    toast.add({ title: `Saved ${name}`, type: "success" })
    props.onSaved(name, content)
    return undefined
  })

  async function handleCopy() {
    const copied = await copyText(content)
    if (!copied.ok) {
      toast.add({ title: copied.error.message, type: "error" })
      return
    }
    toast.add({ title: "Copied to the clipboard", type: "success" })
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={form.onSubmit}>
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Back to the list" onClick={props.onClose}>
          <ArrowLeftIcon />
        </Button>
        <h1 className="truncate font-heading text-2xl">{props.name ?? "New env file"}</h1>
      </div>

      <FieldGroup>
        {isNew && (
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input id="name" name="name" placeholder="my-app.dev" autoComplete="off" spellCheck={false} autoFocus />
            <FieldDescription>For example the project name and the stage.</FieldDescription>
          </Field>
        )}
        <Field data-invalid={form.error ? true : undefined}>
          <FieldLabel htmlFor="content">Content</FieldLabel>
          <Textarea
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={"DATABASE_URL=postgres://localhost/app\nAPI_KEY=..."}
            spellCheck={false}
            autoComplete="off"
            className="min-h-64 font-mono"
            aria-invalid={form.error ? true : undefined}
          />
          <FieldError>{form.error}</FieldError>
        </Field>
      </FieldGroup>

      <div className="flex flex-wrap items-center justify-between gap-2">
        {props.name === null ? (
          <span />
        ) : (
          <DeleteEnvButton session={props.session} name={props.name} onDeleted={props.onDeleted} />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleCopy} disabled={!content}>
            <CopyIcon data-icon="inline-start" />
            Copy
          </Button>
          <Button type="submit" disabled={form.pending}>
            {form.pending ? <Spinner data-icon="inline-start" /> : <FloppyDiskIcon data-icon="inline-start" />}
            Save
          </Button>
        </div>
      </div>
    </form>
  )
}
