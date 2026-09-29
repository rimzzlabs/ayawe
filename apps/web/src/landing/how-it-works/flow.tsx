import { ArrowRightIcon, type Icon } from "@phosphor-icons/react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FlowProps {
  /** Screen readers read this sentence instead of the individual boxes. */
  label: string
  children: ReactNode
}

export function Flow(props: FlowProps) {
  return (
    <div
      role="img"
      aria-label={props.label}
      className="flex flex-wrap items-center gap-2 border bg-muted/40 p-4"
    >
      {props.children}
    </div>
  )
}

interface FlowNodeProps {
  icon: Icon
  children: ReactNode
  /** Monospace for data, such as a password or ciphertext. */
  data?: boolean
}

export function FlowNode(props: FlowNodeProps) {
  const NodeIcon = props.icon
  return (
    <span
      className={cn(
        "flex min-w-0 items-center gap-1.5 border bg-background px-2.5 py-1.5 text-xs",
        props.data && "font-mono",
      )}
    >
      <NodeIcon className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{props.children}</span>
    </span>
  )
}

interface FlowArrowProps {
  children?: ReactNode
}

export function FlowArrow(props: FlowArrowProps) {
  return (
    <span className="flex items-center gap-1 text-[0.7rem] text-muted-foreground uppercase tracking-wider">
      {props.children}
      <ArrowRightIcon className="size-3.5" />
    </span>
  )
}
