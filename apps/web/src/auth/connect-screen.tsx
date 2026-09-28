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
import { type Screen, screenForToken } from "@/lib/screen"
import { saveToken } from "@/lib/token-storage"
import { readField, useFormAction } from "@/lib/use-form-action"

interface ConnectScreenProps {
  error?: string
  onConnected: (screen: Screen) => void
}

export function ConnectScreen(props: ConnectScreenProps) {
  const form = useFormAction(async (formData) => {
    const token = readField(formData, "token")
    if (!token) return "Enter the access token"

    const next = await screenForToken(token)
    if (next.kind === "connect") return next.error

    saveToken(token)
    props.onConnected(next)
    return undefined
  }, props.error)

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <CardTitle>Connect</CardTitle>
          <CardDescription>
            Enter the access token of your server. You do this once on each device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="connect-form" onSubmit={form.onSubmit}>
            <FieldGroup>
              <Field data-invalid={form.error ? true : undefined}>
                <FieldLabel htmlFor="token">Access token</FieldLabel>
                <Input
                  id="token"
                  name="token"
                  type="password"
                  autoComplete="off"
                  aria-invalid={form.error ? true : undefined}
                />
                <FieldError>{form.error}</FieldError>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" form="connect-form" className="w-full" disabled={form.pending}>
            {form.pending && <Spinner data-icon="inline-start" />}
            Connect
          </Button>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
