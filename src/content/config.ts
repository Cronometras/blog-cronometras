import type { Testimonial } from "@/components/Testimonial.astro";
import type { Section } from "@/components/core/Section.astro";
import type { LinkButton, PageType } from "@/content/page.types";
import { defineCollection, z } from "astro:content";

const zodPageConfig = z.custom<PageType>();

// Pages collection schema
const pagesCollection = defineCollection({
  type: "content",
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
  type: "content",
  schema: featuresSchema,
});

const indexSchema = z.object({
  type: z.literal("page"),
  banner: z.custom<Section>(),
  sections: z.array(z.custom<Section>()).optional(),
  features: z.object({
    title: z.string(),
    description: z.string(),
    feature_list: z.array(
      z.object({
        title: z.string(),
        content: z.string(),
        icon: z.string(),
      }),
    ),
  }),
  testimonial: z.custom<Testimonial>(),
  call_to_action: z.object({
    title: z.string(),
    description: z.string(),
    button: z.custom<LinkButton>(),
  }),
});

const homepageCollection = defineCollection({
  type: "content",
  schema: zodPageConfig,
});

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
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
  type: "content",
  schema: privacySchema,
});

// Export collections
export const collections = {
  about: pagesCollection,
  blog: blogCollection,
  changelog: pagesCollection,
  contact: pagesCollection,
  features: featuresCollection,
  homepage: homepageCollection,
  pages: pagesCollection,
  privacy: privacyCollection,
};
