import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { onUnauthorized } from "./lib/api"
import { clearSession } from "./lib/session"
import { PagePending } from "./routes/__root"
import { routeTree } from "./routeTree.gen"
import "./index.css"

const router = createRouter({
  routeTree,
  defaultPendingComponent: PagePending,
  // Show the spinner only when a page takes a moment, so quick navigations do not flash it.
  defaultPendingMs: 150,
  scrollRestoration: true,
})

// An expired session cookie: forget the session and ask the user to sign in again.
onUnauthorized(() => {
  clearSession()
  router.navigate({
    to: "/sign-in",
    search: { error: "Your session expired. Sign in again" },
  })
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

async function start(root: HTMLElement) {
  if (document.documentElement.dataset.appShell === undefined) {
    // "/" has prerendered HTML. Load the route first, so React replaces it with the same page
    // and no empty frame shows in between.
    await router.load()
  } else {
    root.replaceChildren()
    delete document.documentElement.dataset.appShell
  }
  createRoot(root).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}

const root = document.getElementById("root")
if (root) start(root)
