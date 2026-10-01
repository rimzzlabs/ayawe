import { createMemoryHistory, createRouter, RouterContextProvider } from "@tanstack/react-router"
import { renderToString } from "react-dom/server"
import { LandingScreen } from "@/landing/landing-screen"
import { routeTree } from "@/routeTree.gen"

/**
 * Renders the landing page to HTML at build time (see `vite-plugins/seo.ts`). Crawlers and
 * link previews then see the content without running JavaScript.
 */
export function renderLanding() {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  })
  return renderToString(
    <RouterContextProvider router={router}>
      <LandingScreen />
    </RouterContextProvider>,
  )
}
