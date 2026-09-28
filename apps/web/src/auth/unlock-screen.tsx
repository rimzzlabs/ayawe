import { type Keyring, unlockWithPassword } from "@ayawe/crypto/keyring"
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { listEnvs } from "@/lib/api"
import type { Session } from "@/lib/screen"
import { readField, useFormAction } from "@/lib/use-form-action"

interface UnlockScreenProps {
  token: string
  keyring: Keyring
  onUnlocked: (session: Session) => void
  onForgot: () => void
  onDisconnect: () => void
}

export function UnlockScreen(props: UnlockScreenProps) {
  const form = useFormAction(async (formData) => {
    const unlocked = await unlockWithPassword(props.keyring, readField(formData, "password"))
    if (!unlocked.ok) return "The password is wrong"

    const names = await listEnvs(props.token)
    if (!names.ok) return names.error.message

    props.onUnlocked({
      token: props.token,
      keyring: props.keyring,
      dataKey: unlocked.value,
      names: names.value,
    })
    return undefined
  })

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>Unlock</CardTitle>
          <CardDescription>Enter your password to decrypt your env files.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="unlock-form" onSubmit={form.onSubmit}>
            <FieldGroup>
              <Field data-invalid={form.error ? true : undefined}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  aria-invalid={form.error ? true : undefined}
                />
                <FieldError>{form.error}</FieldError>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button type="submit" form="unlock-form" className="w-full" disabled={form.pending}>
            {form.pending && <Spinner data-icon="inline-start" />}
            Unlock
          </Button>
          <div className="flex w-full justify-between">
            <Button variant="link" size="sm" onClick={props.onForgot}>
              Forgot password
            </Button>
            <Button variant="link" size="sm" onClick={props.onDisconnect}>
              Disconnect
            </Button>
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
