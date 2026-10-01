import { createFileRoute } from "@tanstack/react-router"
import { LandingScreen } from "@/landing/landing-screen"
import { loadMe } from "@/lib/session"

export const Route = createFileRoute("/")({
  // Not awaited: the page renders at once, the same as its prerendered HTML. The answer only
  // updates the `data-signed-in` flag, which picks "Sign in" or "Open vault" with CSS.
  loader: () => {
    void loadMe()
  },
  component: LandingScreen,
})
