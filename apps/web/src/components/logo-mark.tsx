interface LogoMarkProps {
  className?: string
}

// Same shape as public/favicon.svg: a location pin ("aya wé" means "it's somewhere")
// with a keyhole cut out. The keyhole is a hole, so the page background shows through.
export function LogoMark(props: LogoMarkProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={props.className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M32 4C19.3 4 9 14 9 26.6 9 42 32 60 32 60s23-18 23-33.4C55 14 44.7 4 32 4Zm0 13a6.5 6.5 0 0 0-3 12.3L27 39h10l-2-9.7A6.5 6.5 0 0 0 32 17Z"
      />
    </svg>
  )
}
