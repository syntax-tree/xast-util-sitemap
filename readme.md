# xast-util-sitemap

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

**[xast][]** utility to build a [`sitemap.xml`][sitemap].
Supports localization as suggested by [Google][].

This package focusses on a small set of widely used parts of sitemaps.
It has a few good options instead of overwhelming with everything that *could*
be done.
If you do need more things, well: this utility gives you a syntax tree, which
you can change.

Intended for sites with up to 50k URLs and a resulting serialized contents of
up to 50MB.
Wrapping this project into something that generates sitemap index files is left
as an exercise to the reader.

[See Google’s recommendations for whether you need a
sitemap](https://developers.google.com/search/docs/advanced/sitemaps/overview)

You should place sitemaps in the root of your site and reference them in
`robots.txt`.
You might also [report](https://support.google.com/webmasters/answer/7451001)
sitemap changes to Google.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install xast-util-sitemap
```

## Use

Say we have the following module, `example.js`

```js
import {sitemap} from 'xast-util-sitemap'
import {toXml} from 'xast-util-to-xml'

const tree = sitemap([
  'https://example.com/alpha/',
  {url: 'https://example.com/bravo/'},
  {url: 'https://example.com/charlie/', modified: new Date(2018, 1, 2, 3)},
  {
    url: 'https://example.com/delta/',
    lang: 'en',
    alternate: {
      nl: 'https://example.com/dirk/',
      'fr-BE': 'https://example.com/désiré/'
    }
  }
])

console.log(toXml(tree))
```

Now, running `node example.js` yields (pretty printed):

```xml
<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://example.com/alpha/</loc>
  </url>
  <url>
    <loc>https://example.com/bravo/</loc>
  </url>
  <url>
    <loc>https://example.com/charlie/</loc>
    <lastmod>2018-02-02T02:00:00.000Z</lastmod>
  </url>
  <url>
    <loc>https://example.com/delta/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://example.com/delta/" />
    <xhtml:link rel="alternate" hreflang="nl" href="https://example.com/dirk/" />
    <xhtml:link rel="alternate" hreflang="fr-BE" href="https://example.com/d%C3%A9sir%C3%A9/" />
  </url>
  <url>
    <loc>https://example.com/dirk/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://example.com/delta/" />
    <xhtml:link rel="alternate" hreflang="nl" href="https://example.com/dirk/" />
    <xhtml:link rel="alternate" hreflang="fr-BE" href="https://example.com/d%C3%A9sir%C3%A9/" />
  </url>
  <url>
    <loc>https://example.com/d%C3%A9sir%C3%A9/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://example.com/delta/" />
    <xhtml:link rel="alternate" hreflang="nl" href="https://example.com/dirk/" />
    <xhtml:link rel="alternate" hreflang="fr-BE" href="https://example.com/d%C3%A9sir%C3%A9/" />
  </url>
</urlset>
```

## API

This package exports the following identifiers: `sitemap`.
There is no default export.

### `sitemap(data)`

Build a sitemap.

###### `data`

URLs to build a sitemap for.
`data` is an `Array.<url | Entry>`.
`url` is `string` and equivalent to an `{url: url}` entry.

###### Returns

[`Root`][root] — [xast][] root.

### `Entry`

Entries represent a single URL and describe them with metadata.

###### `entry.url`

Full URL ([`<loc>`][loc]; `string`, required, example: `https://example.org/`)

###### `entry.modified`

Value indicating when the page last changed ([`<lastmod>`][lastmod]; `Date` or
value for `new Date(x)`, optional).

###### `entry.lang`

[BCP 47][bcp47] tag indicating the language of the page (`string`, required w/
`alternate`, example: `'en-GB'`).

###### `entry.alternate`

Translations of the page, where each key is a [BCP 47][bcp47] tag and each value
an entry (`Object<url | Entry>`, optional, example: `{nl:
'https://example.nl/'}`).

Alternate resources “inherit” fields (`modified`) from the entry they are
described in.
To define different fields, either use a full entry object:

```js
[
  {
    url: 'https://example.com/delta/',
    modified: '05 October 2011 14:48 UTC',
    lang: 'en',
    alternate: {nl: {url: 'https://example.com/dirk/', modified: '20 January 2020 00:00 UTC'}}
  }
]
```

Or define them separately:

```js
[
  {
    url: 'https://example.com/delta/',
    modified: '05 October 2011 14:48 UTC',
    lang: 'en',
    alternate: {nl: 'https://example.com/dirk/'}
  },
  {
    url: 'https://example.com/dirk/',
    modified: '20 January 2020 00:00 UTC',
    // `xast-util-sitemap` is smart enough to know about the next two already,
    // but they’re shown here for clarity.
    lang: 'nl',
    alternate: {en: 'https://example.com/delta/'}
  }
]
```

## Security

XML can be a dangerous language: don’t trust user-provided data.
Sitemaps also indicate “ownership” of URLs: crawlers assume that the origin
of the `sitemap.xml` file is also an owner

## Related

*   [`xast-util-to-xml`](https://github.com/syntax-tree/xast-util-to-xml)
    — serialize xast to XML
*   [`xast-util-feed`](https://github.com/syntax-tree/xast-util-feed)
    — build feeds (RSS, Atom)
*   [`xastscript`](https://github.com/syntax-tree/xastscript)
    — create xast trees

## Contribute

See [`contributing.md` in `syntax-tree/.github`][contributing] for ways to get
started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/syntax-tree/xast-util-sitemap/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/xast-util-sitemap/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/xast-util-sitemap.svg

[coverage]: https://codecov.io/github/syntax-tree/xast-util-sitemap

[downloads-badge]: https://img.shields.io/npm/dm/xast-util-sitemap.svg

[downloads]: https://www.npmjs.com/package/xast-util-sitemap

[size-badge]: https://img.shields.io/bundlephobia/minzip/xast-util-sitemap.svg

[size]: https://bundlephobia.com/result?p=xast-util-sitemap

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/syntax-tree/unist/discussions

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[author]: https://wooorm.com

[contributing]: https://github.com/syntax-tree/.github/blob/HEAD/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/HEAD/support.md

[coc]: https://github.com/syntax-tree/.github/blob/HEAD/code-of-conduct.md

[xast]: https://github.com/syntax-tree/xast

[root]: https://github.com/syntax-tree/xast#root

[sitemap]: https://www.sitemaps.org

[loc]: https://www.sitemaps.org/protocol.html#locdef

[lastmod]: https://www.sitemaps.org/protocol.html#lastmoddef

[bcp47]: https://github.com/wooorm/bcp-47

[google]: https://developers.google.com/search/docs/advanced/crawling/localized-versions#expandable-3
