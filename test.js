import assert from 'node:assert/strict'
import test from 'node:test'
import {sitemap} from './index.js'

test('sitemap', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('./index.js')).sort(), [
      'sitemap'
    ])
  })

  await t.test('should support no entries', async function () {
    assert.deepEqual(sitemap(), {
      type: 'root',
      children: [
        {
          type: 'instruction',
          name: 'xml',
          value: 'version="1.0" encoding="utf-8"'
        },
        {
          type: 'element',
          name: 'urlset',
          attributes: {xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'},
          children: []
        }
      ]
    })
  })

  await t.test('should support an entry (string)', async function () {
    assert.deepEqual(sitemap(['https://example.com']).children[1], {
      type: 'element',
      name: 'urlset',
      attributes: {xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'},
      children: [
        {
          type: 'element',
          name: 'url',
          attributes: {},
          children: [
            {
              type: 'element',
              name: 'loc',
              attributes: {},
              children: [{type: 'text', value: 'https://example.com/'}]
            }
          ]
        }
      ]
    })
  })

  await t.test('should support an entry (object)', async function () {
    assert.deepEqual(
      sitemap([
        {
          url: 'https://example.com',
          modified: new Date('05 October 2011 14:48 UTC')
        }
      ]).children[1],
      {
        type: 'element',
        name: 'urlset',
        attributes: {xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'},
        children: [
          {
            type: 'element',
            name: 'url',
            attributes: {},
            children: [
              {
                type: 'element',
                name: 'loc',
                attributes: {},
                children: [{type: 'text', value: 'https://example.com/'}]
              },
              {
                type: 'element',
                name: 'lastmod',
                attributes: {},
                children: [{type: 'text', value: '2011-10-05T14:48:00.000Z'}]
              }
            ]
          }
        ]
      }
    )
  })

  await t.test('should crash w/o `url`', async function () {
    assert.throws(function () {
      // @ts-expect-error: check how the runtime handles no `url`.
      sitemap([{}])
    }, /Invalid URL/)
  })

  await t.test('should crash w/ incorrect `url`', async function () {
    assert.throws(function () {
      sitemap(['example.com'])
    }, /Invalid URL/)
  })

  await t.test('should encode URLs', async function () {
    assert.deepEqual(sitemap(['https://example.com/🤔 🤷‍♂️']).children[1], {
      type: 'element',
      name: 'urlset',
      attributes: {xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'},
      children: [
        {
          type: 'element',
          name: 'url',
          attributes: {},
          children: [
            {
              type: 'element',
              name: 'loc',
              attributes: {},
              children: [
                {
                  type: 'text',
                  value:
                    'https://example.com/%F0%9F%A4%94%20%F0%9F%A4%B7%E2%80%8D%E2%99%82%EF%B8%8F'
                }
              ]
            }
          ]
        }
      ]
    })
  })

  await t.test('should support `modified` (string)', async function () {
    assert.deepEqual(
      sitemap([
        {url: 'https://example.com', modified: '05 October 2011 14:48 UTC'}
      ]).children[1],
      {
        type: 'element',
        name: 'urlset',
        attributes: {xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'},
        children: [
          {
            type: 'element',
            name: 'url',
            attributes: {},
            children: [
              {
                type: 'element',
                name: 'loc',
                attributes: {},
                children: [{type: 'text', value: 'https://example.com/'}]
              },
              {
                type: 'element',
                name: 'lastmod',
                attributes: {},
                children: [{type: 'text', value: '2011-10-05T14:48:00.000Z'}]
              }
            ]
          }
        ]
      }
    )
  })

  await t.test('should support `modified` (date)', async function () {
    assert.deepEqual(
      sitemap([
        {
          url: 'https://example.com',
          modified: new Date('05 October 2011 14:48 UTC')
        }
      ]).children[1],
      {
        type: 'element',
        name: 'urlset',
        attributes: {xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'},
        children: [
          {
            type: 'element',
            name: 'url',
            attributes: {},
            children: [
              {
                type: 'element',
                name: 'loc',
                attributes: {},
                children: [{type: 'text', value: 'https://example.com/'}]
              },
              {
                type: 'element',
                name: 'lastmod',
                attributes: {},
                children: [{type: 'text', value: '2011-10-05T14:48:00.000Z'}]
              }
            ]
          }
        ]
      }
    )
  })

  await t.test('should crash w/ incorrect `modified`', async function () {
    assert.throws(function () {
      sitemap([{url: 'https://example.com', modified: new Date('asd')}])
    }, /Error: Unexpected incorrect date `Invalid Date`/)
  })

  await t.test('should ignore `lang` w/o `alternate`', async function () {
    assert.deepEqual(
      sitemap([{url: 'https://example.com', lang: 'en'}]).children[1],
      {
        type: 'element',
        name: 'urlset',
        attributes: {
          xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
        },
        children: [
          {
            type: 'element',
            name: 'url',
            attributes: {},
            children: [
              {
                type: 'element',
                name: 'loc',
                attributes: {},
                children: [{type: 'text', value: 'https://example.com/'}]
              }
            ]
          }
        ]
      }
    )
  })

  await t.test('should support `alternate`s', async function () {
    assert.deepEqual(
      sitemap([
        {
          url: 'https://example.com',
          lang: 'en',
          alternate: {nl: 'https://example.nl'}
        }
      ]).children[1],
      {
        type: 'element',
        name: 'urlset',
        attributes: {
          xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
          'xmlns:xhtml': 'http://www.w3.org/1999/xhtml'
        },
        children: [
          {
            type: 'element',
            name: 'url',
            attributes: {},
            children: [
              {
                type: 'element',
                name: 'loc',
                attributes: {},
                children: [{type: 'text', value: 'https://example.com/'}]
              },
              {
                type: 'element',
                name: 'xhtml:link',
                attributes: {
                  rel: 'alternate',
                  hreflang: 'en',
                  href: 'https://example.com/'
                },
                children: []
              },
              {
                type: 'element',
                name: 'xhtml:link',
                attributes: {
                  rel: 'alternate',
                  hreflang: 'nl',
                  href: 'https://example.nl/'
                },
                children: []
              }
            ]
          },
          {
            type: 'element',
            name: 'url',
            attributes: {},
            children: [
              {
                type: 'element',
                name: 'loc',
                attributes: {},
                children: [{type: 'text', value: 'https://example.nl/'}]
              },
              {
                type: 'element',
                name: 'xhtml:link',
                attributes: {
                  rel: 'alternate',
                  hreflang: 'en',
                  href: 'https://example.com/'
                },
                children: []
              },
              {
                type: 'element',
                name: 'xhtml:link',
                attributes: {
                  rel: 'alternate',
                  hreflang: 'nl',
                  href: 'https://example.nl/'
                },
                children: []
              }
            ]
          }
        ]
      }
    )
  })

  await t.test(
    'should support `alternate`s as full entry objects',
    async function () {
      assert.deepEqual(
        sitemap([
          {
            url: 'https://example.com/',
            lang: 'en',
            alternate: {nl: 'https://example.nl/'}
          }
        ]).children[1],
        {
          type: 'element',
          name: 'urlset',
          attributes: {
            xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
            'xmlns:xhtml': 'http://www.w3.org/1999/xhtml'
          },
          children: [
            {
              type: 'element',
              name: 'url',
              attributes: {},
              children: [
                {
                  type: 'element',
                  name: 'loc',
                  attributes: {},
                  children: [{type: 'text', value: 'https://example.com/'}]
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'en',
                    href: 'https://example.com/'
                  },
                  children: []
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'nl',
                    href: 'https://example.nl/'
                  },
                  children: []
                }
              ]
            },
            {
              type: 'element',
              name: 'url',
              attributes: {},
              children: [
                {
                  type: 'element',
                  name: 'loc',
                  attributes: {},
                  children: [{type: 'text', value: 'https://example.nl/'}]
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'en',
                    href: 'https://example.com/'
                  },
                  children: []
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'nl',
                    href: 'https://example.nl/'
                  },
                  children: []
                }
              ]
            }
          ]
        }
      )
    }
  )

  await t.test('should crash w/ `alternate` w/o `lang`', async function () {
    assert.throws(function () {
      sitemap([{url: 'https://example.com', alternate: {}}])
    }, /Expected `lang` in entry with `alternate` `\[object Object]` \(`0`\)/)
  })

  await t.test(
    'should support alternates inheriting fields',
    async function () {
      assert.deepEqual(
        sitemap([
          {
            url: 'https://example.com',
            lang: 'en',
            modified: new Date(1_234_567_890_123),
            alternate: {nl: 'https://example.nl'}
          }
        ]).children[1],
        {
          type: 'element',
          name: 'urlset',
          attributes: {
            xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
            'xmlns:xhtml': 'http://www.w3.org/1999/xhtml'
          },
          children: [
            {
              type: 'element',
              name: 'url',
              attributes: {},
              children: [
                {
                  type: 'element',
                  name: 'loc',
                  attributes: {},
                  children: [{type: 'text', value: 'https://example.com/'}]
                },
                {
                  type: 'element',
                  name: 'lastmod',
                  attributes: {},
                  children: [{type: 'text', value: '2009-02-13T23:31:30.123Z'}]
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'en',
                    href: 'https://example.com/'
                  },
                  children: []
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'nl',
                    href: 'https://example.nl/'
                  },
                  children: []
                }
              ]
            },
            {
              type: 'element',
              name: 'url',
              attributes: {},
              children: [
                {
                  type: 'element',
                  name: 'loc',
                  attributes: {},
                  children: [{type: 'text', value: 'https://example.nl/'}]
                },
                {
                  type: 'element',
                  name: 'lastmod',
                  attributes: {},
                  children: [{type: 'text', value: '2009-02-13T23:31:30.123Z'}]
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'en',
                    href: 'https://example.com/'
                  },
                  children: []
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'nl',
                    href: 'https://example.nl/'
                  },
                  children: []
                }
              ]
            }
          ]
        }
      )
    }
  )

  await t.test(
    'should support alternates w/ fields defined separately',
    async function () {
      assert.deepEqual(
        sitemap([
          {
            url: 'https://example.com',
            lang: 'en',
            modified: new Date(1_234_567_890_123),
            alternate: {nl: 'https://example.nl'}
          },
          {
            url: 'https://example.nl',
            lang: 'nl',
            modified: new Date(1_231_111_111_111)
          }
        ]).children[1],
        {
          type: 'element',
          name: 'urlset',
          attributes: {
            xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
            'xmlns:xhtml': 'http://www.w3.org/1999/xhtml'
          },
          children: [
            {
              type: 'element',
              name: 'url',
              attributes: {},
              children: [
                {
                  type: 'element',
                  name: 'loc',
                  attributes: {},
                  children: [{type: 'text', value: 'https://example.com/'}]
                },
                {
                  type: 'element',
                  name: 'lastmod',
                  attributes: {},
                  children: [{type: 'text', value: '2009-02-13T23:31:30.123Z'}]
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'en',
                    href: 'https://example.com/'
                  },
                  children: []
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'nl',
                    href: 'https://example.nl/'
                  },
                  children: []
                }
              ]
            },
            {
              type: 'element',
              name: 'url',
              attributes: {},
              children: [
                {
                  type: 'element',
                  name: 'loc',
                  attributes: {},
                  children: [{type: 'text', value: 'https://example.nl/'}]
                },
                {
                  type: 'element',
                  name: 'lastmod',
                  attributes: {},
                  children: [{type: 'text', value: '2009-01-04T23:18:31.111Z'}]
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'en',
                    href: 'https://example.com/'
                  },
                  children: []
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'nl',
                    href: 'https://example.nl/'
                  },
                  children: []
                }
              ]
            }
          ]
        }
      )
    }
  )

  await t.test(
    'should support alternates smartly merging groupings together (a ref b, b ref c, so they each reference each other)',
    async function () {
      assert.deepEqual(
        sitemap([
          {
            url: 'https://example.com',
            lang: 'en',
            alternate: {nl: 'https://example.nl'}
          },
          {
            url: 'https://example.nl',
            lang: 'nl',
            alternate: {fr: 'https://example.fr'}
          }
        ]).children[1],
        {
          type: 'element',
          name: 'urlset',
          attributes: {
            xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
            'xmlns:xhtml': 'http://www.w3.org/1999/xhtml'
          },
          children: [
            {
              type: 'element',
              name: 'url',
              attributes: {},
              children: [
                {
                  type: 'element',
                  name: 'loc',
                  attributes: {},
                  children: [{type: 'text', value: 'https://example.com/'}]
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'en',
                    href: 'https://example.com/'
                  },
                  children: []
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'nl',
                    href: 'https://example.nl/'
                  },
                  children: []
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'fr',
                    href: 'https://example.fr/'
                  },
                  children: []
                }
              ]
            },
            {
              type: 'element',
              name: 'url',
              attributes: {},
              children: [
                {
                  type: 'element',
                  name: 'loc',
                  attributes: {},
                  children: [{type: 'text', value: 'https://example.nl/'}]
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'en',
                    href: 'https://example.com/'
                  },
                  children: []
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'nl',
                    href: 'https://example.nl/'
                  },
                  children: []
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'fr',
                    href: 'https://example.fr/'
                  },
                  children: []
                }
              ]
            },
            {
              type: 'element',
              name: 'url',
              attributes: {},
              children: [
                {
                  type: 'element',
                  name: 'loc',
                  attributes: {},
                  children: [{type: 'text', value: 'https://example.fr/'}]
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'en',
                    href: 'https://example.com/'
                  },
                  children: []
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'nl',
                    href: 'https://example.nl/'
                  },
                  children: []
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'fr',
                    href: 'https://example.fr/'
                  },
                  children: []
                }
              ]
            }
          ]
        }
      )
    }
  )

  await t.test(
    'should support alternates smartly merge groupings together (a ref b, c ref b, so they each reference each other)',
    async function () {
      assert.deepEqual(
        sitemap([
          {
            url: 'https://example.com',
            lang: 'en',
            alternate: {nl: 'https://example.nl'}
          },
          {
            url: 'https://example.fr',
            lang: 'fr',
            alternate: {nl: 'https://example.nl'}
          }
        ]).children[1],
        {
          type: 'element',
          name: 'urlset',
          attributes: {
            xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
            'xmlns:xhtml': 'http://www.w3.org/1999/xhtml'
          },
          children: [
            {
              type: 'element',
              name: 'url',
              attributes: {},
              children: [
                {
                  type: 'element',
                  name: 'loc',
                  attributes: {},
                  children: [{type: 'text', value: 'https://example.com/'}]
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'en',
                    href: 'https://example.com/'
                  },
                  children: []
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'nl',
                    href: 'https://example.nl/'
                  },
                  children: []
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'fr',
                    href: 'https://example.fr/'
                  },
                  children: []
                }
              ]
            },
            {
              type: 'element',
              name: 'url',
              attributes: {},
              children: [
                {
                  type: 'element',
                  name: 'loc',
                  attributes: {},
                  children: [{type: 'text', value: 'https://example.nl/'}]
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'en',
                    href: 'https://example.com/'
                  },
                  children: []
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'nl',
                    href: 'https://example.nl/'
                  },
                  children: []
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'fr',
                    href: 'https://example.fr/'
                  },
                  children: []
                }
              ]
            },
            {
              type: 'element',
              name: 'url',
              attributes: {},
              children: [
                {
                  type: 'element',
                  name: 'loc',
                  attributes: {},
                  children: [{type: 'text', value: 'https://example.fr/'}]
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'en',
                    href: 'https://example.com/'
                  },
                  children: []
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'nl',
                    href: 'https://example.nl/'
                  },
                  children: []
                },
                {
                  type: 'element',
                  name: 'xhtml:link',
                  attributes: {
                    rel: 'alternate',
                    hreflang: 'fr',
                    href: 'https://example.fr/'
                  },
                  children: []
                }
              ]
            }
          ]
        }
      )
    }
  )
})
