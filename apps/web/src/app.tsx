import { Suspense, use } from "react"
import { checkHealth } from "./api"

const healthPromise = checkHealth()

export function App() {
  return (
    <main>
      <h1>ayawe</h1>
      <p>Your env files, somewhere.</p>
      <Suspense fallback={<p>Checking the API…</p>}>
        <HealthStatus />
      </Suspense>
    </main>
  )
}

function HealthStatus() {
  const result = use(healthPromise)
  if (!result.ok) return <p role="alert">{result.error.message}</p>
  return <p>API is online.</p>
}
