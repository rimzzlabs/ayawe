import { ArrowDownIcon, type Icon } from "@phosphor-icons/react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MarkerProps {
  number: number
}

/** The step number. The same marker appears on the diagram and on the step list. */
export function Marker(props: MarkerProps) {
  return (
    <span
      aria-hidden="true"
      className="flex size-5 shrink-0 items-center justify-center bg-foreground font-mono text-[0.7rem] text-background"
    >
      {props.number}
    </span>
  )
}

interface ZoneProps {
  icon: Icon
  title: string
  note: string
  /** Dashed border: the zone you do not have to trust. */
  untrusted?: boolean
  children: ReactNode
}

export function Zone(props: ZoneProps) {
  const ZoneIcon = props.icon
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border p-4 sm:p-5",
        props.untrusted ? "border-dashed bg-muted/40" : "bg-card",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <span className="flex items-center gap-2 font-medium text-sm">
          <ZoneIcon className="size-4" aria-hidden="true" />
          {props.title}
        </span>
        <span className="text-muted-foreground text-xs">{props.note}</span>
      </div>
      <div className="flex flex-col">{props.children}</div>
    </div>
  )
}

interface NodeProps {
  icon: Icon
  label: string
  /** Sample data, shown in monospace. */
  value?: string
  marker?: number
}

export function Node(props: NodeProps) {
  const NodeIcon = props.icon
  return (
    <div className="flex items-start gap-3 border bg-background px-3 py-2.5">
      <NodeIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm">{props.label}</span>
        {props.value && (
          <span className="break-all font-mono text-muted-foreground text-xs">{props.value}</span>
        )}
      </div>
      {props.marker !== undefined && <Marker number={props.marker} />}
    </div>
  )
}

interface StepDownProps {
  children: ReactNode
}

/** A vertical arrow between two nodes, with what happens on the way. */
export function StepDown(props: StepDownProps) {
  // Same box as Node (1px border, px-3, a 16px icon column, gap-3), so the arrow lines up
  // under the node icons and the text lines up under the node labels.
  return (
    <div className="flex items-center gap-3 border-transparent border-x px-3 py-1.5">
      <span className="flex w-4 shrink-0 justify-center">
        <ArrowDownIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
      </span>
      <span className="font-mono text-muted-foreground text-xs">{props.children}</span>
    </div>
  )
}

interface CrossingProps {
  marker: number
  children: ReactNode
}

/** The trip between the two zones: one centered column from the device down to the server. */
export function Crossing(props: CrossingProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-3">
      <span aria-hidden="true" className="h-4 w-px bg-border" />
      <span className="flex items-center gap-2">
        <Marker number={props.marker} />
        <span className="font-mono text-muted-foreground text-xs">{props.children}</span>
      </span>
      <ArrowDownIcon className="size-4 text-muted-foreground" aria-hidden="true" />
    </div>
  )
}
