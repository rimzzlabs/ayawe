import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react"
import { type ComponentProps, useState } from "react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

interface PasswordInputProps extends Omit<ComponentProps<typeof InputGroupInput>, "type"> {
  toggleLabel?: string
}

export function PasswordInput(props: PasswordInputProps) {
  const { toggleLabel = "Show password", ...inputProps } = props
  const [visible, setVisible] = useState(false)

  return (
    <InputGroup>
      <InputGroupInput {...inputProps} type={visible ? "text" : "password"} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          aria-label={toggleLabel}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeSlashIcon /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
