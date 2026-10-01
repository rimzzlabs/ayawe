import { type Keyring, unlockWithPassword } from "@ayawe/crypto/keyring"
import { AuthLayout } from "@/auth/auth-layout"
import { PageHeading } from "@/components/page-heading"
import { PasswordInput } from "@/components/password-input"
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
import { Spinner } from "@/components/ui/spinner"
import type { Me } from "@/lib/api"
import { openVault, type Screen } from "@/lib/screen"
import { readField, useFormAction } from "@/lib/use-form-action"

interface UnlockScreenProps {
  me: Me
  keyring: Keyring
  onUnlocked: (screen: Screen) => void
  onForgot: () => void
  onSignOut: () => void
}

export function UnlockScreen(props: UnlockScreenProps) {
  const form = useFormAction(async (formData) => {
    const unlocked = await unlockWithPassword(props.keyring, readField(formData, "password"))
    if (!unlocked.ok) return "The vault password is wrong"

    const vault = await openVault({ me: props.me, keyring: props.keyring, dataKey: unlocked.value })
    if (!vault.ok) return vault.error.message
    props.onUnlocked(vault.value)
    return undefined
  })

  return (
    <AuthLayout me={props.me} onSignOut={props.onSignOut}>
      <Card>
        <CardHeader>
          <CardTitle>
            <PageHeading className="outline-none" focusOnMount={false}>
              Unlock your vault
            </PageHeading>
          </CardTitle>
          <CardDescription>Enter your vault password to decrypt your secrets.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="unlock-form" onSubmit={form.onSubmit}>
            <FieldGroup>
              <Field data-invalid={form.error ? true : undefined}>
                <FieldLabel htmlFor="password">Vault password</FieldLabel>
                <PasswordInput
                  id="password"
                  name="password"
                  autoComplete="off"
                  autoFocus
                  aria-invalid={form.error ? true : undefined}
                  aria-describedby={form.error ? "unlock-error" : undefined}
                />
                <FieldError id="unlock-error">{form.error}</FieldError>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            type="submit"
            form="unlock-form"
            className="w-full"
            disabled={form.pending}
            focusableWhenDisabled
          >
            {form.pending && <Spinner data-icon="inline-start" />}
            Unlock
          </Button>
          <Button variant="link" size="sm" onClick={props.onForgot}>
            Forgot the vault password
          </Button>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
