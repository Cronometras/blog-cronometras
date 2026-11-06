import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getLanguagePaths } from '../src/lib/blogLanguagePaths.mjs';

const pairs = [{ es: '/es/blog/medir-el-trabajo/', en: '/en/blog/measuring-work/' }];
test('articles use the real translation slug in both directions', () => {
  assert.deepEqual(getLanguagePaths('/es/blog/medir-el-trabajo', pairs), pairs[0]);
  assert.deepEqual(getLanguagePaths('/en/blog/measuring-work/', pairs), pairs[0]);
});
test('untranslated articles never advertise a nonexistent alternate', () => {
  assert.deepEqual(getLanguagePaths('/es/blog/new-article/', pairs), { es: '/es/blog/new-article/' });
});
test('standard pages and the blog index keep language navigation', () => {
  assert.deepEqual(getLanguagePaths('/en/blog/', pairs), { es: '/es/blog/', en: '/en/blog/' });
  assert.deepEqual(getLanguagePaths('/es/features/', pairs), { es: '/es/features/', en: '/en/features/' });
});
