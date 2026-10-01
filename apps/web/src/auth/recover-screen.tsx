import { changePassword, type Keyring, unlockWithRecoveryCode } from "@ayawe/crypto/keyring"
import { AuthLayout } from "@/auth/auth-layout"
import { MIN_PASSWORD_LENGTH } from "@/auth/setup-screen"
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
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { type Me, saveKeyring } from "@/lib/api"
import { openVault, type Screen } from "@/lib/screen"
import { readField, useFormAction } from "@/lib/use-form-action"

interface RecoverScreenProps {
  me: Me
  keyring: Keyring
  onRecovered: (screen: Screen) => void
  onBack: () => void
  onSignOut: () => void
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
    const saved = await saveKeyring(keyring)
    if (!saved.ok) return saved.error.message

    const vault = await openVault({ me: props.me, keyring, dataKey: unlocked.value })
    if (!vault.ok) return vault.error.message
    props.onRecovered(vault.value)
    return undefined
  })

  return (
    <AuthLayout me={props.me} onSignOut={props.onSignOut}>
      <Card>
        <CardHeader>
          <CardTitle>
            <PageHeading className="outline-none" focusOnMount={false}>
              Recover your vault
            </PageHeading>
          </CardTitle>
          <CardDescription>Use your recovery code to set a new vault password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="recover-form" onSubmit={form.onSubmit}>
            {/* Lets password managers save the vault password under the GitHub login. */}
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={props.me.login}
              readOnly
              hidden
            />
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="code">Recovery code</FieldLabel>
                <Input
                  id="code"
                  name="code"
                  autoComplete="off"
                  spellCheck={false}
                  className="font-mono"
                  autoFocus
                />
              </Field>
              <Field data-invalid={form.error ? true : undefined}>
                <FieldLabel htmlFor="password">New vault password</FieldLabel>
                <PasswordInput
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  aria-invalid={form.error ? true : undefined}
                  aria-describedby={form.error ? "recover-error" : undefined}
                />
                <FieldError id="recover-error">{form.error}</FieldError>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            type="submit"
            form="recover-form"
            className="w-full"
            disabled={form.pending}
            focusableWhenDisabled
          >
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
