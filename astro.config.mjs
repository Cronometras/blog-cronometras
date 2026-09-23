import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig, sharpImageService } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import config from "./src/config/config.json";
import AutoImport from "astro-auto-import";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// https://astro.build/config
export default defineConfig({
  site: config.site.base_url ? config.site.base_url : "http://astrotemplatesitey.com",
  base: config.site.base_path ? config.site.base_path : "/",
  trailingSlash: "ignore",
  output: "static",
  // Conserva el manejo de espacios/HTML de v6 (el default de v7 es 'jsx')
  compressHTML: true,
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler"
        }
      }
    },
    resolve: {
      alias: {
        '@': '/src'
      }
    }
  },
  // Image optimization service
  image: {
    service: sharpImageService(),
  },
  integrations: [
    react(),
    sitemap(),
    // AutoImport removed - using explicit imports in MDX files
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    })
  ],
  markdown: {
    // Mantiene el pipeline unified() para remark-math / rehype-katex (Sätteri no los portaría)
    processor: unified(),
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true,
    }
  }
});
