import type { ComponentProps } from "react"
import { PasswordInput } from "@/components/password-input"

type SecretValueInputProps = Omit<ComponentProps<typeof PasswordInput>, "toggleLabel">

export function SecretValueInput(props: SecretValueInputProps) {
  return (
    <PasswordInput
      {...props}
      toggleLabel="Show value"
      autoComplete="off"
      spellCheck={false}
      data-1p-ignore
      data-lpignore="true"
      className="font-mono"
    />
  )
}
