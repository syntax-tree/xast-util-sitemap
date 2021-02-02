import {sitemap} from 'xast-util-sitemap'

sitemap() // $ExpectError
sitemap([
  'https://example.com',
  {url: 'https://example.com'},
  {url: 'https://example.com', modified: new Date()},
  {url: 'https://example.com', modified: Date.now()},
  {url: 'https://example.com', modified: '01-02-2021'},
  {url: 'https://example.com', lang: 'en-GB'},
  {
    url: 'https://example.com',
    lang: 'en-GB',
    alternate: {'de-AT': 'https://example.at'}
  },
  {
    url: 'https://example.com',
    lang: 'en-GB',
    alternate: {'de-AT': {url: 'https://example.at', modified: Date.now()}}
  }
])
