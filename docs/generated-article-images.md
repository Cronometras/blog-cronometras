# Generated article covers

17 editorial covers were created with the built-in image generation tool for articles that had no image. Each cover is shared by the Spanish article and its English translation. The existing image stored in `coverImage` for the salary-incentives article was recovered without replacing it.

Files: `public/images/blog/generated/`. Full prompts and their source article IDs are recorded in `docs/generated-article-images.json`. Original generated PNG files are retained privately in the task workspace; only optimized WebP assets are published.

Each cover has 480, 800 and 1200 pixel variants at 16:9. Images are resized with Lanczos, encoded as WebP and stripped of source metadata. Every variant is under 120 KB. Article heroes load eagerly with high priority; listing cards and related posts use responsive `srcset` and lazy loading.

Validation: set `FIRESTORE_ARTICLES_SNAPSHOT_PATH` to a private reviewed article snapshot, run `npm run build`, then `node scripts/verify-article-images.cjs`. The check validates all 51 files, dimensions, format, size budget, the 34 translated article heroes, social images, and responsive listing markup.

`scripts/publish-article-images.cjs` accepts a reviewed private patch bundle and defaults to review only. Passing `--execute` updates only `imageUrl`, rejects concurrent image changes, and verifies every article field after publishing. It never replaces article content or publication dates.
