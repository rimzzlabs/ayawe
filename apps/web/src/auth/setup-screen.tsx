import { createKeyring } from "@ayawe/crypto/keyring"
import { AuthLayout } from "@/auth/auth-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { type Me, saveKeyring } from "@/lib/api"
import type { Session } from "@/lib/screen"
import { readField, useFormAction } from "@/lib/use-form-action"

export const MIN_PASSWORD_LENGTH = 10

interface SetupScreenProps {
  me: Me
  onCreated: (session: Session, recoveryCode: string) => void
  onSignOut: () => void
}

export function SetupScreen(props: SetupScreenProps) {
  const form = useFormAction(async (formData) => {
    const password = readField(formData, "password")
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `Use ${MIN_PASSWORD_LENGTH} or more characters`
    }
    if (password !== readField(formData, "confirm")) return "The passwords are not the same"

    const created = await createKeyring(password)
    const saved = await saveKeyring(created.keyring)
    if (!saved.ok) return saved.error.message

    const me = { ...props.me, hasKeyring: true }
    props.onCreated(
      { me, keyring: created.keyring, dataKey: created.dataKey },
      created.recoveryCode,
    )
    return undefined
  })

  return (
    <AuthLayout me={props.me} onSignOut={props.onSignOut}>
      <Card>
        <CardHeader>
          <CardTitle>Set your vault password</CardTitle>
          <CardDescription>
            GitHub signed you in. This password encrypts your secrets in the browser. The server
            never sees it, so nobody can reset it for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="setup-form" onSubmit={form.onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">Vault password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  autoFocus
                />
                <FieldDescription>Use {MIN_PASSWORD_LENGTH} or more characters.</FieldDescription>
              </Field>
              <Field data-invalid={form.error ? true : undefined}>
                <FieldLabel htmlFor="confirm">Type it again</FieldLabel>
                <Input
                  id="confirm"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={form.error ? true : undefined}
                />
                <FieldError>{form.error}</FieldError>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" form="setup-form" className="w-full" disabled={form.pending}>
            {form.pending && <Spinner data-icon="inline-start" />}
            Create my vault
          </Button>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
