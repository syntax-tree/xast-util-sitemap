import bcp47 from 'bcp-47-normalize'
import u from 'unist-builder'
import x from 'xastscript'

var own = {}.hasOwnProperty

export function sitemap(data) {
  var nodes = []
  var urls = {}
  var groupings = {}
  var index = -1
  var i18n
  var grouping
  var entry
  var alt
  var key
  var node
  var modified

  if (data) {
    while (++index < data.length) {
      entry = toEntry(data[index])

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

        // Find an already defined grouping.
        // Maybe the entry was references before?
        if (own.call(groupings, entry.url)) {
          grouping = groupings[entry.url]
        } else {
          grouping = []

          // Maybe one of the `alternates` was references before, if so: use
          // that group.
          for (key in entry.alternate) {
            if (own.call(entry.alternate, key)) {
              alt = toEntry(entry.alternate[key])

              if (own.call(groupings, alt.url)) {
                grouping = groupings[alt.url]
                break
              }
            }
          }
        }

        if (!own.call(groupings, entry.url)) groupings[entry.url] = grouping
        if (!grouping.includes(entry.url)) grouping.push(entry.url)

        for (key in entry.alternate) {
          if (own.call(entry.alternate, key)) {
            alt = toEntry(entry.alternate[key])
            if (!alt.lang) alt.lang = bcp47(key)

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

  for (key in urls) {
    if (own.call(urls, key)) {
      node = x('url', [x('loc', key)])
      entry = urls[key]
      modified = entry.modified

      nodes.push(node)

      if (modified != null) {
        if (typeof modified !== 'object') {
          modified = new Date(modified)
        }

        if (isNaN(modified)) {
          throw new Error('Unexpected incorrect date `' + entry.modified + '`')
        }

        node.children.push(x('lastmod', modified.toISOString()))
      }

      if (own.call(groupings, key)) {
        grouping = groupings[key]
        index = -1

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

function toEntry(d) {
  var entry = {}
  var url

  if (typeof d === 'string') {
    url = d
  } else {
    url = d.url
    if (d.lang != null) entry.lang = bcp47(d.lang)
    if (d.modified != null) entry.modified = d.modified
    if (d.alternate != null) entry.alternate = d.alternate
  }

  entry.url = new URL(url).href
  return entry
}
