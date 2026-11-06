# Sourced article summaries

`src/data/article-summaries.json` contains concise editorial summaries for the four priority guides and their actual English translations. The sources distinguish general work-study definitions (FAO, with forestry context identified), the ILO reference handbook, and NIST binomial confidence intervals. Practical checks are editorial recommendations, not claims of measured gains.

The original article bodies, URLs and publication dates are preserved. No FAQ markup, invented expert, credential or reviewer is added. Team authors are represented as Organization and linked to the existing language-specific About page.

After building, run `python scripts/verify-article-summaries.py` and `node scripts/verify-blog-translations.cjs`. These verify all 310 article author records, the eight summaries and their citations, a single H1, and the real ES/EN language links.

Traffic priorities use finalized Search Console data from 9 September–6 October and 7 October–3 November 2026. Westinghouse must be aggregated across its old and new URLs: 62 clicks become 66, not a loss of 40. The four prioritized guides concern work study, work sampling, method-study stages and work-study objectives. No traffic gain or AI citation is asserted from these changes.
