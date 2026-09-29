interface LogoMarkProps {
  className?: string
}

// Same shape as public/favicon.svg: the letter A with a keyhole as its counter.
// The keyhole is a hole, so the page background shows through.
export function LogoMark(props: LogoMarkProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={props.className}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M26.5 4H37.5L60 60H46.5L41.68 48H22.32L17.5 60H4ZM32 19.1a6.4 6.4 0 0 0-2.94 12.16L26.88 41h10.24l-2.18-9.74A6.4 6.4 0 0 0 32 19.1Z"
      />
    </svg>
  )
}
