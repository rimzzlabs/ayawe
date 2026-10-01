import { useCallback } from "react"

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
  // A stable callback runs only when the heading mounts. An inline one runs again on every
  // render, so it took focus away from any field the user typed in.
  const focusHeading = useCallback(
    (node: HTMLHeadingElement | null) => {
      if (focusOnMount) node?.focus({ preventScroll: true })
    },
    [focusOnMount],
  )

  return (
    <>
      <title>{`${props.children} · ayawe`}</title>
      <h1
        tabIndex={-1}
        className={props.className ?? "font-heading text-2xl outline-none"}
        ref={focusHeading}
      >
        {props.children}
      </h1>
    </>
  )
}
