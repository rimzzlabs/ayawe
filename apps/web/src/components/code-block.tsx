import { CheckIcon, CopyIcon } from "@phosphor-icons/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { copyText } from "@/lib/clipboard"

interface CodeBlockProps {
  /** Lines of code. They are copied as one block. */
  children: string
  /** What the copy button copies, for its accessible name. */
  label: string
}

const COPIED_MS = 2000

export function CodeBlock(props: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const result = await copyText(props.children)
    if (!result.ok) {
      toast.add({ title: result.error.message, type: "error" })
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), COPIED_MS)
  }

  return (
    <div className="relative border bg-muted/40">
      <pre className="overflow-x-auto py-3 pr-12 pl-4 font-mono text-xs leading-relaxed">
        <code>{props.children}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon-xs"
        className="absolute top-2 right-2"
        aria-label={copied ? `Copied ${props.label}` : `Copy ${props.label}`}
        onClick={handleCopy}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Button>
    </div>
  )
}
