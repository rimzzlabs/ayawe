interface PageHeadingProps {
  children: string
  className?: string
  /** Moves keyboard and screen reader focus to the heading when the screen opens. */
  focusOnMount?: boolean
}

// The app swaps screens without a page load, so each screen sets the document title
// and moves focus to its heading. Screen readers then announce the new screen.
export function PageHeading(props: PageHeadingProps) {
  const focusOnMount = props.focusOnMount ?? true

  return (
    <>
      <title>{`${props.children} · ayawe`}</title>
      <h1
        tabIndex={-1}
        className={props.className ?? "font-heading text-2xl outline-none"}
        ref={(node) => {
          if (focusOnMount) node?.focus({ preventScroll: true })
        }}
      >
        {props.children}
      </h1>
    </>
  )
}
