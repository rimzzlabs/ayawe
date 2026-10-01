import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { createServer, type Plugin } from "vite"

// A self-hosted copy sets SITE_URL, so its canonical URL and sitemap point at its own domain.
const DEFAULT_SITE_URL = "https://ayawe.rimzzlabs.com"

/** The only page for search results. Every other page is private or a sign-in step. */
const INDEXED_PATHS = ["/"]

/** Crawlers skip these. The app pages also send a `noindex` tag, for crawlers that ignore robots.txt. */
const PRIVATE_PATHS = [
  "/api/",
  "/sign-in",
  "/sign-out",
  "/setup",
  "/unlock",
  "/recover",
  "/lock",
  "/vault",
]

const ROOT_PLACEHOLDER = '<div id="root"></div>'

function robotsTxt(siteUrl: string) {
  const disallowed = PRIVATE_PATHS.map((path) => `Disallow: ${path}`).join("\n")
  return `User-agent: *\nAllow: /\n${disallowed}\n\nSitemap: ${siteUrl}/sitemap.xml\n`
}

function sitemapXml(siteUrl: string) {
  const urls = INDEXED_PATHS.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`).join("\n")
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

/** Renders the landing page with a short-lived dev server, so the build needs no second step. */
async function renderLanding(root: string) {
  const server = await createServer({
    root,
    appType: "custom",
    logLevel: "error",
    server: { middlewareMode: true, hmr: false, ws: false },
  })
  try {
    const entry = (await server.ssrLoadModule("/src/prerender.tsx")) as {
      renderLanding: () => string
    }
    // The page heading renders a <title>. The static <title> in index.html already covers it.
    return entry.renderLanding().replace(/<title>.*?<\/title>/gs, "")
  } finally {
    await server.close()
  }
}

/**
 * SEO for a client-only app: fills `%SITE_URL%` in index.html, emits robots.txt and
 * sitemap.xml, and puts the prerendered landing page into `dist/index.html`.
 */
export function seo(): Plugin {
  // `||`, not `??`: an unset GitHub Actions variable arrives as an empty string.
  const siteUrl = (process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "")
  let root = ""
  let outDir = ""
  let isBuild = false

  return {
    name: "ayawe-seo",
    configResolved(config) {
      root = config.root
      outDir = resolve(config.root, config.build.outDir)
      isBuild = config.command === "build"
    },
    transformIndexHtml(html) {
      return html.replaceAll("%SITE_URL%", siteUrl)
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robotsTxt(siteUrl) })
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemapXml(siteUrl) })
    },
    async closeBundle() {
      // A dev server also calls closeBundle when it stops, including the one in renderLanding.
      if (!isBuild) return
      const file = resolve(outDir, "index.html")
      const html = await readFile(file, "utf8")
      if (!html.includes(ROOT_PLACEHOLDER)) {
        throw new Error(`The prerender needs ${ROOT_PLACEHOLDER} in index.html`)
      }
      const markup = await renderLanding(root)
      await writeFile(file, html.replace(ROOT_PLACEHOLDER, `<div id="root">${markup}</div>`))
    },
  }
}
