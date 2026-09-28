import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  server: {
    // `wrangler dev` serves the API on port 8787.
    proxy: { "/api": "http://localhost:8787" },
  },
})
