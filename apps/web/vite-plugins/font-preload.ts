import type { HtmlTagDescriptor, Plugin } from "vite"

/**
 * The Latin subsets of the two variable fonts. They cover the landing page, and the heading
 * font draws the largest text, so loading them early stops the layout shift when they swap in.
 */
const PRELOADED_FONTS = ["noto-sans-latin-wght-normal", "playfair-display-latin-wght-normal"]

/** Adds `<link rel="preload">` for the fonts. Their file names get a hash at build time. */
export function fontPreload(): Plugin {
  return {
    name: "ayawe-font-preload",
    apply: "build",
    transformIndexHtml: {
      // "post" runs after bundling, so `context.bundle` has the hashed file names.
      order: "post",
      handler(_html, context) {
        const files = Object.keys(context.bundle ?? {})
        return PRELOADED_FONTS.map((font): HtmlTagDescriptor => {
          const file = files.find((name) => name.includes(`${font}-`) && name.endsWith(".woff2"))
          if (!file) throw new Error(`The font ${font} is missing from the build`)
          return {
            tag: "link",
            attrs: {
              rel: "preload",
              href: `/${file}`,
              as: "font",
              type: "font/woff2",
              // Fonts always load in CORS mode. Without this, the browser downloads them twice.
              crossorigin: "",
            },
            injectTo: "head-prepend",
          }
        })
      },
    },
  }
}
