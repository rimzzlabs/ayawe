import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react"
import { type ComponentProps, useState } from "react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

type SecretValueInputProps = Omit<ComponentProps<typeof InputGroupInput>, "type">

export function SecretValueInput(props: SecretValueInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <InputGroup>
      <InputGroupInput
        {...props}
        type={visible ? "text" : "password"}
        autoComplete="off"
        spellCheck={false}
        data-1p-ignore
        data-lpignore="true"
        className="font-mono"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          aria-label={visible ? "Hide value" : "Show value"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeSlashIcon /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
