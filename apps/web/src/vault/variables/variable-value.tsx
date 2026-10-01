import { CheckIcon, CopyIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react"
import { cn } from "cn"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { copyText } from "@/lib/clipboard"
import type { Entry } from "@/lib/dotenv"

interface VariableValueProps {
  entry: Entry
  className?: string
}

/** Shows a masked value with buttons to reveal and copy it. */
export function VariableValue(props: VariableValueProps) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const result = await copyText(props.entry.value)
    if (!result.ok) {
      toast.add({ title: result.error.message, type: "error" })
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const [firstLine = "", ...otherLines] = props.entry.value.split(/\r?\n/)

  return (
    <div className={cn("flex min-w-0 items-center gap-1", props.className)}>
      <span className="flex min-w-0 flex-1 items-baseline gap-2 font-mono text-sm">
        {revealed ? (
          <>
            {/* Only the first line shows, so a long PEM key does not stretch the row. */}
            <span className="min-w-0 truncate">
              {props.entry.value ? (
                firstLine
              ) : (
                <span className="text-muted-foreground italic">empty</span>
              )}
            </span>
            {otherLines.length > 0 && (
              <span className="shrink-0 font-sans text-muted-foreground text-xs">
                +{otherLines.length} {otherLines.length === 1 ? "line" : "lines"}
              </span>
            )}
          </>
        ) : (
          <>
            {/* A fixed length, so the dots do not tell how long the value is. */}
            <span aria-hidden="true" className="text-muted-foreground tracking-[0.2em]">
              ••••••••••••
            </span>
            <span className="sr-only">Hidden value</span>
          </>
        )}
      </span>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={`Show ${props.entry.key}`}
        aria-pressed={revealed}
        onClick={() => setRevealed((current) => !current)}
      >
        {revealed ? <EyeSlashIcon /> : <EyeIcon />}
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={copied ? `Copied ${props.entry.key}` : `Copy ${props.entry.key}`}
        onClick={handleCopy}
      >
        {copied ? <CheckIcon className="text-foreground" /> : <CopyIcon />}
      </Button>
    </div>
  )
}
