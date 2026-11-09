# English article versions

Article language links are defined by actual pairs in
`src/data/blog-translations.json`. Spanish and English slugs may differ.
`getLanguagePaths()` supplies the same URLs to the language picker and the head
hreflang tags. An article without a known translation advertises only its own
language, rather than inventing a URL that returns 404.

Initial inventory (6 November 2026): 155 published Spanish articles and 92
existing English counterparts. The missing 63 versions are complete English
translations, stored as new documents in `articulos_cronometras`; the Spanish
articles and the existing English versions are not overwritten.

New documents record `translationSourceId`, a SHA-256
`translationSourceHash`, `esSlug`, `translationDate` and `isFullTranslation`.
Their publication date is the creation date of the English version;
`sourcePublishedAt` retains the date of the source article separately.

## Publishing reviewed translations

Keep source snapshots, translation bundles and credentials in a private folder
outside the repository and outside `public/`.

```sh
FIREBASE_SERVICE_ACCOUNT_PATH=/private/sa.json node scripts/publish-missing-english.cjs /private/new-documents.json
# Add --execute only after reviewing the bundle and testing the build.
```

The publisher checks that every source still matches its recorded hash and that
no existing article owns the new English slug. It uses atomic document creation,
never replacement, and verifies the stored contents afterwards. A repeated run
skips identical documents and rejects conflicting changes.

The route-pair file must include each new pair when publishing. Static 301 aliases
in the marked ARTICLE LANGUAGE ALIASES section of `public/_redirects` preserve
older same-slug language links. These rules must remain above the final catch-all.
Do not redirect over another published article's canonical path.

## Build and checks

An optional `FIRESTORE_ARTICLES_SNAPSHOT_PATH` environment variable allows a
reproducible build against a private reviewed snapshot before publishing to
Firestore. Without it, builds use Firestore normally.

```sh
node --test scripts/blog-language-paths.test.mjs
npm run build
node scripts/verify-blog-translations.cjs
```

The verification checks every pair in both directions: generated page, English
or Spanish HTML language, page heading, article content, canonical, hreflang,
language picker, JSON-LD and sitemap inclusion. After deploying, check the
published pages and a selection of historical language aliases as well.
