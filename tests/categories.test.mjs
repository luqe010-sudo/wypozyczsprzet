import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  CATEGORY_DISPLAY_MAP, DB_TO_SEO_SLUG, MARKET_CATEGORIES, RENAMED_CATEGORY_SLUGS, SEO_CATEGORIES, capitalize, subcategoryHref,
} from '../lib/categories.js';

const categories = Object.values(SEO_CATEGORIES);

test('each category has one name, slug and key, and its slug is its config key', () => {
  for (const [key, category] of Object.entries(SEO_CATEGORIES)) assert.equal(category.slug, key);
  for (const field of ['slug', 'dbKey', 'name']) {
    const values = categories.map((category) => category[field]);
    assert.equal(new Set(values).size, values.length, `duplicate ${field}`);
  }
});

test('every kind of equipment is in exactly one subcategory', () => {
  const values = categories.flatMap((category) => category.filters.map(({ value }) => value));
  assert.equal(new Set(values).size, values.length, `duplicates: ${values.filter((v, i) => values.indexOf(v) !== i)}`);
  for (const category of categories) {
    const labels = category.filters.map(({ label }) => label);
    assert.equal(new Set(labels).size, labels.length, `duplicate label in ${category.name}`);
    for (const { value, label } of category.filters) {
      assert.match(value, /^[a-z_]+$/, `${value} is not a plain key`);
      assert.equal(label, label.toLocaleLowerCase('pl'), `${label} should be lower case`);
    }
  }
});

test('menus and tiles use the category name, not a second label', () => {
  assert.deepEqual(MARKET_CATEGORIES.map(({ label }) => label), categories.map(({ name }) => name));
  for (const [key, slug] of Object.entries(DB_TO_SEO_SLUG)) assert.equal(CATEGORY_DISPLAY_MAP[key], SEO_CATEGORIES[slug].name);
});

test('tile artwork positions are unique and fit the 4 × 2 sprite', () => {
  const art = categories.map((category) => category.art).filter((position) => position != null);
  assert.equal(new Set(art).size, art.length);
  for (const position of art) assert.ok(Number.isInteger(position) && position >= 0 && position < 8);
});

test('renamed category URLs redirect and are not reused', () => {
  const config = readFileSync(new URL('../next.config.js', import.meta.url), 'utf8');
  for (const [from, to] of Object.entries(RENAMED_CATEGORY_SLUGS)) {
    assert.ok(!Object.hasOwn(SEO_CATEGORIES, from), `${from} is a live category again`);
    assert.ok(Object.hasOwn(SEO_CATEGORIES, to));
    assert.ok(config.includes(`source: '/${from}', destination: '/${to}'`), `missing redirect /${from}`);
    assert.ok(config.includes(`source: '/${from}/:path*', destination: '/${to}/:path*'`), `missing redirect /${from}/…`);
  }
});

test('subcategory links and labels', () => {
  assert.equal(subcategoryHref('roboty-ziemne', 'miniexcavators'), '/roboty-ziemne?sub=miniexcavators');
  assert.equal(capitalize('ładowarki i miniładowarki'), 'Ładowarki i miniładowarki');
  assert.equal(capitalize(''), '');
});
