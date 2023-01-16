/**
 * @typedef {import('xast').Root} Root
 * @typedef {import('xast').Element} Element
 */

/**
 * @typedef {string | Omit<Entry, 'lang' | 'alternate'>} Alternate
 *   Alternative content, typically a translation.
 *
 *   To define different fields, either use a full entry object:
 *
 *   ```js
 *   [
 *     {
 *       url: 'https://example.com/delta/',
 *       modified: '05 October 2011 14:48 UTC',
 *       lang: 'en',
 *       alternate: {nl: {url: 'https://example.com/dirk/', modified: '20 January 2020 00:00 UTC'}}
 *     }
 *   ]
 *   ```
 *
 *   …or define them separately:
 *
 *   ```js
 *   [
 *     {
 *       url: 'https://example.com/delta/',
 *       modified: '05 October 2011 14:48 UTC',
 *       lang: 'en',
 *       alternate: {nl: 'https://example.com/dirk/'}
 *     },
 *     {
 *       url: 'https://example.com/dirk/',
 *       modified: '20 January 2020 00:00 UTC',
 *       // `xast-util-sitemap` is smart enough to know about the next two already,
 *       // but they’re shown here for clarity.
 *       lang: 'nl',
 *       alternate: {en: 'https://example.com/delta/'}
 *     }
 *   ]
 *   ```
 *
 * @typedef Entry
 *   Entries represent a single URL and describe them with metadata.
 * @property {string} url
 *   Full URL (`<loc>`, example: `'https://example.org/'`).
 * @property {number | string | Date | null | undefined} [modified]
 *   Value indicating when the page last changed (`<lastmod>`).
 * @property {string | null | undefined} [lang]
 *   BCP 47 tag indicating the language of the page (example: `'en-GB'`).
 * @property {Record<string, Alternate> | null | undefined} [alternate]
 *   Translations of the page, where each key is a BCP 47 tag and each value an
 *   entry (example: `{nl: 'https://example.nl/'}`).
 *
 *   Alternate resources inherit fields from the entry they are described in.
 */

import {URL} from 'node:url'
import {bcp47Normalize as normalize} from 'bcp-47-normalize'
import {u} from 'unist-builder'
import {x} from 'xastscript'

const own = {}.hasOwnProperty

/**
 * Build a sitemap.
 *
 * @param {Array<string | Entry> | null | undefined} [data]
 *   Entries to build a sitemap for.
 * @returns {Root}
 *   Sitemap.
 */
export function sitemap(data) {
  /** @type {Array<Element>} */
  const nodes = []
  /** @type {Record<string, Entry>} */
  const urls = {}
  /** @type {Record<string, Array<string>>} */
  const groupings = {}
  /** @type {boolean} */
  let i18n = false

  if (data) {
    let index = -1

    while (++index < data.length) {
      const entry = toEntry(data[index])

      if (own.call(urls, entry.url)) {
        Object.assign(urls[entry.url], entry)
      } else {
        urls[entry.url] = entry
      }

      if (entry.alternate) {
        i18n = true

        if (!entry.lang) {
          throw new Error(
            'Expected `lang` in entry with `alternate` `' +
              entry +
              '` (`' +
              index +
              '`)'
          )
        }

        /** @type {Array<string>} */
        let grouping

        // Find an already defined grouping.
        // Maybe the entry was references before?
        if (own.call(groupings, entry.url)) {
          grouping = groupings[entry.url]
        } else {
          grouping = []

          /** @type {string} */
          let key

          // Maybe one of the `alternates` was references before, if so: use
          // that group.
          for (key in entry.alternate) {
            if (own.call(entry.alternate, key)) {
              const alt = toEntry(entry.alternate[key])

              if (own.call(groupings, alt.url)) {
                grouping = groupings[alt.url]
                break
              }
            }
          }
        }

        if (!own.call(groupings, entry.url)) groupings[entry.url] = grouping
        if (!grouping.includes(entry.url)) grouping.push(entry.url)

        /** @type {string} */
        let key

        for (key in entry.alternate) {
          if (own.call(entry.alternate, key)) {
            const alt = toEntry(entry.alternate[key])
            if (!alt.lang) alt.lang = normalize(key)

            if (!own.call(urls, alt.url)) {
              urls[alt.url] = Object.assign({}, entry, alt)
            }

            if (!own.call(groupings, alt.url)) groupings[alt.url] = grouping
            if (!grouping.includes(alt.url)) grouping.push(alt.url)
          }
        }
      }
    }
  }

  /** @type {string} */
  let key

  for (key in urls) {
    if (own.call(urls, key)) {
      const node = x('url', [x('loc', key)])
      const entry = urls[key]

      nodes.push(node)

      if (entry.modified !== undefined && entry.modified !== null) {
        const modified = toDate(entry.modified)

        if (Number.isNaN(modified.valueOf())) {
          throw new TypeError(
            'Unexpected incorrect date `' + entry.modified + '`'
          )
        }

        node.children.push(x('lastmod', modified.toISOString()))
      }

      if (own.call(groupings, key)) {
        const grouping = groupings[key]
        let index = -1

        while (++index < grouping.length) {
          node.children.push(
            x('xhtml:link', {
              rel: 'alternate',
              hreflang: urls[grouping[index]].lang,
              href: grouping[index]
            })
          )
        }
      }
    }
  }

  return u('root', [
    u('instruction', {name: 'xml'}, 'version="1.0" encoding="utf-8"'),
    x(
      'urlset',
      {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
        'xmlns:xhtml': i18n ? 'http://www.w3.org/1999/xhtml' : undefined
      },
      nodes
    )
  ])
}

/**
 * @param {string | Entry} d
 */
function toEntry(d) {
  /** @type {Entry} */
  const entry = {}
  /** @type {string} */
  let url

  if (typeof d === 'string') {
    url = d
  } else {
    url = d.url
    if (d.lang !== undefined && d.lang !== null) entry.lang = normalize(d.lang)
    if (d.modified !== undefined && d.modified !== null)
      entry.modified = d.modified
    if (d.alternate !== undefined && d.alternate !== null)
      entry.alternate = d.alternate
  }

  entry.url = new URL(url).href
  return entry
}

/**
 * @param {Date | string | number} value
 * @returns {Date}
 */
export function toDate(value) {
  return typeof value === 'object' ? value : new Date(value)
}
