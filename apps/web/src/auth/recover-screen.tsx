import { changePassword, type Keyring, unlockWithRecoveryCode } from "@ayawe/crypto/keyring"
import { AuthLayout } from "@/auth/auth-layout"
import { MIN_PASSWORD_LENGTH } from "@/auth/setup-screen"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { listEnvs, saveKeyring } from "@/lib/api"
import type { Session } from "@/lib/screen"
import { readField, useFormAction } from "@/lib/use-form-action"

interface RecoverScreenProps {
  token: string
  keyring: Keyring
  onRecovered: (session: Session) => void
  onBack: () => void
}

export function RecoverScreen(props: RecoverScreenProps) {
  const form = useFormAction(async (formData) => {
    const password = readField(formData, "password")
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `Use ${MIN_PASSWORD_LENGTH} or more characters for the new password`
    }

    const unlocked = await unlockWithRecoveryCode(props.keyring, readField(formData, "code"))
    if (!unlocked.ok) return "The recovery code is wrong"

    const keyring = await changePassword({
      keyring: props.keyring,
      dataKey: unlocked.value,
      password,
    })
    const saved = await saveKeyring(props.token, keyring)
    if (!saved.ok) return saved.error.message

    const names = await listEnvs(props.token)
    if (!names.ok) return names.error.message

    props.onRecovered({ token: props.token, keyring, dataKey: unlocked.value, names: names.value })
    return undefined
  })

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>Recover</CardTitle>
          <CardDescription>Use your recovery code to set a new password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="recover-form" onSubmit={form.onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="code">Recovery code</FieldLabel>
                <Input
                  id="code"
                  name="code"
                  autoComplete="off"
                  spellCheck={false}
                  className="font-mono"
                />
              </Field>
              <Field data-invalid={form.error ? true : undefined}>
                <FieldLabel htmlFor="password">New password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={form.error ? true : undefined}
                />
                <FieldError>{form.error}</FieldError>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button type="submit" form="recover-form" className="w-full" disabled={form.pending}>
            {form.pending && <Spinner data-icon="inline-start" />}
            Set new password
          </Button>
          <Button variant="link" size="sm" onClick={props.onBack}>
            Back to unlock
          </Button>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
