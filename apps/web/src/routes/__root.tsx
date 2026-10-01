import { WarningIcon } from "@phosphor-icons/react"
import { createRootRoute, type ErrorComponentProps, Link, Outlet } from "@tanstack/react-router"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Toaster } from "@/components/ui/toast"

export const Route = createRootRoute({
  component: RootLayout,
  pendingComponent: PagePending,
  errorComponent: PageError,
  notFoundComponent: PageNotFound,
})

function RootLayout() {
  return (
    <Toaster>
      <Outlet />
    </Toaster>
  )
}

/** Shows while a route checks the session or loads its data. */
export function PagePending() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Spinner className="size-6" />
    </div>
  )
}

function PageError(props: ErrorComponentProps) {
  const message = props.error instanceof Error ? props.error.message : "The page failed to load"

  return (
    <main className="mx-auto flex min-h-svh max-w-md items-center p-4">
      <title>Something went wrong · ayawe</title>
      <Alert variant="destructive">
        <WarningIcon />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>{message}. Reload the page to try again.</AlertDescription>
      </Alert>
    </main>
  )
}

function PageNotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-start justify-center gap-4 p-4">
      <title>Page not found · ayawe</title>
      <h1 className="font-heading text-2xl">Page not found</h1>
      <p className="text-muted-foreground text-sm">This page does not exist.</p>
      <Button nativeButton={false} render={<Link to="/" />}>
        Go to the home page
      </Button>
    </main>
  )
}
