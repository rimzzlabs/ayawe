interface MarkerProps {
  number: number
}

/** A step number in a small square. Used on the landing page diagrams and step lists. */
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
