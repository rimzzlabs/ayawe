import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react"
import { cn } from "cn"
import { type ComponentProps, useState } from "react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"

type SecretValueTextareaProps = Omit<ComponentProps<typeof InputGroupTextarea>, "className">

/** A masked value field. A textarea, not an input, so it keeps line breaks (for example a PEM key). */
export function SecretValueTextarea(props: SecretValueTextareaProps) {
  const [visible, setVisible] = useState(false)

  return (
    <InputGroup>
      <InputGroupTextarea
        {...props}
        autoComplete="off"
        spellCheck={false}
        data-1p-ignore
        data-lpignore="true"
        className={cn(
          "field-sizing-content max-h-60 min-h-10 font-mono",
          !visible && "text-masked",
        )}
      />
      <InputGroupAddon align="inline-end" className="self-start">
        <InputGroupButton
          size="icon-xs"
          aria-label="Show value"
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeSlashIcon /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
