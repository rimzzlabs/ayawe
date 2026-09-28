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
import { saveKeyring } from "@/lib/api"
import type { Session } from "@/lib/screen"
import { readField, useFormAction } from "@/lib/use-form-action"

export const MIN_PASSWORD_LENGTH = 10

interface SetupScreenProps {
  token: string
  onCreated: (session: Session, recoveryCode: string) => void
}

export function SetupScreen(props: SetupScreenProps) {
  const form = useFormAction(async (formData) => {
    const password = readField(formData, "password")
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `Use ${MIN_PASSWORD_LENGTH} or more characters`
    }
    if (password !== readField(formData, "confirm")) return "The passwords are not the same"

    const created = await createKeyring(password)
    const saved = await saveKeyring(props.token, created.keyring)
    if (!saved.ok) return saved.error.message

    const session = {
      token: props.token,
      keyring: created.keyring,
      dataKey: created.dataKey,
      names: [],
    }
    props.onCreated(session, created.recoveryCode)
    return undefined
  })

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>Set a password</CardTitle>
          <CardDescription>
            The password encrypts your env files in this browser. The server never sees it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="setup-form" onSubmit={form.onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" name="password" type="password" autoComplete="new-password" />
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
            Create vault
          </Button>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
