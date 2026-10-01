import { createFileRoute } from "@tanstack/react-router"
import { LandingScreen } from "@/landing/landing-screen"
import { loadMe } from "@/lib/session"

export const Route = createFileRoute("/")({
  loader: async () => {
    const me = await loadMe()
    // A route loader must throw. The root error component then shows the message.
    if (!me.ok) throw me.error
    return { signedIn: me.value !== null }
  },
  component: LandingRoute,
})

function LandingRoute() {
  const data = Route.useLoaderData()
  return <LandingScreen signedIn={data.signedIn} />
}
