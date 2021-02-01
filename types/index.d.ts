// Minimum TypeScript Version: 3.5

import {Root} from 'xast'

/**
 * Entries represent a single URL and describe them with metadata.
 */
export interface Entry {
  /**
   * Full URL.
   *
   * @see  https://www.sitemaps.org/protocol.html#locdef
   *
   * @example 'https://example.org/'
   */
  url: string

  /**
   * Value indicating when the page last changed.
   */
  modified?: Date | string | number

  /**
   * BCP 47 tag indicating the language of the page.
   *
   * @see https://github.com/wooorm/bcp-47
   *
   * @example 'en-GB'
   */
  lang?: string

  /**
   * Translations of the page, where each key is a BCP 47 tag and each value an entry.
   *
   * Alternate resources inherit fields from the entry they are described in.
   *
   * @see https://github.com/wooorm/bcp-47
   */
  alternate?: Record<
    string,
    string | Omit<Entry, 'lang' | 'alternate'> // eslint-disable-line @typescript-eslint/ban-types
  >
}

/**
 * Build a sitemap.
 *
 * @param data URLs to build a sitemap for.
 */
export function sitemap(data: Array<string | Entry>): Root
