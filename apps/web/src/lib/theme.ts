// Keep the storage key in sync with the inline script in index.html.
const THEME_KEY = "ayawe:theme"

export type Theme = "light" | "dark"

export function toggleTheme(): Theme {
  const root = document.documentElement
  const next: Theme = root.classList.contains("dark") ? "light" : "dark"
  root.classList.toggle("dark", next === "dark")
  try {
    localStorage.setItem(THEME_KEY, next)
  } catch {
    // Private mode can block storage. The theme still changes for this visit.
  }
  return next
}
