import { CopyIcon, WarningIcon } from "@phosphor-icons/react"
import { AuthLayout } from "@/auth/auth-layout"
import { PageHeading } from "@/components/page-heading"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import type { Me } from "@/lib/api"
import { copyText } from "@/lib/clipboard"

interface RecoveryCodeScreenProps {
  me: Me
  recoveryCode: string
  onContinue: () => void
}

export function RecoveryCodeScreen(props: RecoveryCodeScreenProps) {
  async function handleCopy() {
    const copied = await copyText(props.recoveryCode)
    if (!copied.ok) {
      toast.add({ title: copied.error.message, type: "error" })
      return
    }
    toast.add({ title: "Recovery code copied", type: "success" })
  }

  return (
    <AuthLayout me={props.me}>
      <Card>
        <CardHeader>
          <CardTitle>
            <PageHeading className="outline-none">Save your recovery code</PageHeading>
          </CardTitle>
          <CardDescription>
            If you forget the vault password, this code opens the vault.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <code className="break-all bg-muted p-4 font-mono text-sm leading-relaxed">
            {props.recoveryCode}
          </code>
          <Alert>
            <WarningIcon />
            <AlertTitle>You see this code only once</AlertTitle>
            <AlertDescription>
              Keep it in a password manager or on paper. If you lose the password and this code,
              nobody can decrypt your data.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleCopy}>
            <CopyIcon data-icon="inline-start" />
            Copy
          </Button>
          <Button className="flex-1" onClick={props.onContinue}>
            I saved it
          </Button>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
