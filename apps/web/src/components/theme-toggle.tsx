import { CircleHalfIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { toggleTheme } from "@/lib/theme"

export function ThemeToggle() {
  return (
    <Button variant="ghost" size="icon-sm" aria-label="Toggle dark mode" onClick={toggleTheme}>
      <CircleHalfIcon weight="fill" />
    </Button>
  )
}
