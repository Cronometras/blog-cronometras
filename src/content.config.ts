import type { Testimonial } from "@/components/Testimonial.astro";
import type { Section } from "@/components/core/Section.astro";
import type { LinkButton, PageType } from "@/content/page.types";
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const zodPageConfig = z.custom<PageType>();

// Pages collection schema
const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/pages" }),
  schema: zodPageConfig,
});

const featuresSchema = z.object({
  type: z.literal("page"),
  document_title: z.string(),
  meta_description: z.string(),
  meta_keywords: z.string(),
  title: z.string(),
  description: z.string(),
});

const featuresCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/features" }),
  schema: featuresSchema,
});

const homepageCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/homepage" }),
  schema: zodPageConfig,
});

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    author: z.string().default('CRONOMETRAS Team'),
    draft: z.boolean().default(false),
  }),
});

// Define privacy collection schema based on the privacy content files
const privacySchema = z.object({
  document_title: z.string(),
  meta_description: z.string(),
  meta_keywords: z.string(),
  title: z.string(),
  description: z.string(),
});

const privacyCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/privacy" }),
  schema: privacySchema,
});

// Define terms collection schema based on the terms content files
const termsSchema = z.object({
  document_title: z.string(),
  meta_description: z.string(),
  meta_keywords: z.string(),
  title: z.string(),
  description: z.string(),
});

const termsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/terms" }),
  schema: termsSchema,
});

// Shared collection definitions for standard pages
const aboutCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/about" }),
  schema: zodPageConfig,
});

const changelogCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/changelog" }),
  schema: zodPageConfig,
});

const contactCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/contact" }),
  schema: zodPageConfig,
});

const faqCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/faq" }),
  schema: zodPageConfig,
});

// Export collections
export const collections = {
  about: aboutCollection,
  blog: blogCollection,
  changelog: changelogCollection,
  contact: contactCollection,
  features: featuresCollection,
  homepage: homepageCollection,
  pages: pagesCollection,
  privacy: privacyCollection,
  terms: termsCollection,
  faq: faqCollection,
};
