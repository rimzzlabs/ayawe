import { LogoMark } from "@/components/logo-mark"

export function Wordmark() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark className="size-7" />
      <span className="font-heading text-3xl tracking-tight">ayawe</span>
    </span>
  )
}
