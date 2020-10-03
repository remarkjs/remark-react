# remark-react

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[**remark**][remark] plugin to transform Markdown to React.

**Why?**
Using `innerHTML` and [`dangerouslySetInnerHTML`][dangerous] in [React][] is a
common cause of [XSS][] attacks: user input can include script tags and other
kinds of active content that reaches across domains and harms security.
`remark-react` builds a DOM in React, using [React.createElement][h]: this
means that you can display parsed and formatted Markdown content in an
application without using `dangerouslySetInnerHTML`.

> ⚠️ This package essentially packs [`remark-rehype`][remark-rehype] and
> [`rehype-react`][rehype-react], and although it does support some
> customization, it isn’t very pluggable.
> It’s probably better to use `remark-rehype` and `rehype-react` directly to
> benefit from the [**rehype**][rehype] ecosystem.

## Note!

This plugin is ready for the new parser in remark
([`remarkjs/remark#536`](https://github.com/remarkjs/remark/pull/536)).
No change is needed: it works exactly the same now as it did before!

## Install

[npm][]:

```sh
npm install remark-react
```

## Use

```js
import React from 'react'
import ReactDom from 'react-dom'
import unified from 'unified'
import parse from 'remark-parse'
import remark2react from 'remark-react'

class App extends React.Component {
  constructor() {
    super()
    this.state = { text: '# hello world' }
    this.onChange = this.onChange.bind(this)
  }
  onChange(e) {
    this.setState({ text: e.target.value })
  }
  render() {
    return (
      <div>
        <textarea value={this.state.text} onChange={this.onChange} />
        <div id="preview">
          {
            unified()
              .use(parse)
              .use(remark2react)
              .processSync(this.state.text).result
          }
        </div>
      </div>
    )
  }
}

ReactDom.render(<App />, document.getElementById('root'))
```

## API

### `remark().use(react[, options])`

Transform Markdown to React.

Typically, [**unified**][unified] compilers return `string`.
This compiler returns a `ReactElement`.
When using `.process` or `.processSync`, the value at `file.result` (or when
using `.stringify`, the return value), is a `ReactElement`.
When using TypeScript, cast the type on your side.

> ℹ️ In [`unified@9.0.0`][unified-9], the result of `.process` changed from
> ~~`file.contents`~~ to `file.result`.

##### `options`

###### `options.toHast`

Configure how to transform [**mdast**][mdast] to [**hast**][hast] (`object`,
default: `{}`).
Passed to [`mdast-util-to-hast`][to-hast].
Note that `toHast.allowDangerousHTML` does not work: it’s not possible to
inject raw HTML with this plugin (as it’s mean to prevent having to use
`dangerouslySetInnerHTML`).

###### `options.sanitize`

Sanitation schema to use (`object` or `boolean`, default: `undefined`).
Passed to [`hast-util-sanitize`][sanitize].
The default schema, if none or `true` is passed, adheres to GitHub’s sanitation
rules.
Setting this to `false` is just as bad as using
[`dangerouslySetInnerHTML`][dangerous].

###### `options.prefix`

React key (default: `h-`).

###### `options.createElement`

How to create elements or components (`Function`).
Default: `require('react').createElement`

###### `options.fragment`

Create fragments instead of an outer `<div>` if available (`Function`, default:
`require('react').Fragment`).

###### `options.remarkReactComponents`

Override default elements (such as `<a>`, `<p>`, etc) by defining an object
comprised of `element: Component` key-value pairs (`Object`, default:
`undefined`).
For example, to output `<MyLink>` components instead of `<a>`, and
`<MyParagraph>` instead of `<p>`:

```js
remarkReactComponents: {
  a: MyLink,
  p: MyParagraph
}
```

## Integrations

See how to integrate with other remark plugins in the [Integrations][] section
of `remark-html`.

## Security

Use of `remark-react` is *safe* by default, but changing the `sanitize` option
can open you up to a [cross-site scripting (XSS)][xss] attack if the tree is
unsafe.

## Contribute

See [`contributing.md`][contributing] in [`remarkjs/.github`][health] for ways
to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author], modified by [Tom MacWright][tom] and
[Mapbox][].

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/remarkjs/remark-react/main.svg

[build]: https://travis-ci.org/remarkjs/remark-react

[coverage-badge]: https://img.shields.io/codecov/c/github/remarkjs/remark-react.svg

[coverage]: https://codecov.io/github/remarkjs/remark-react

[downloads-badge]: https://img.shields.io/npm/dm/remark-react.svg

[downloads]: https://www.npmjs.com/package/remark-react

[size-badge]: https://img.shields.io/bundlephobia/minzip/remark-react.svg

[size]: https://bundlephobia.com/result?p=remark-react

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/remarkjs/remark/discussions

[npm]: https://docs.npmjs.com/cli/install

[health]: https://github.com/remarkjs/.github

[contributing]: https://github.com/remarkjs/.github/blob/HEAD/contributing.md

[support]: https://github.com/remarkjs/.github/blob/HEAD/support.md

[coc]: https://github.com/remarkjs/.github/blob/HEAD/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[tom]: https://macwright.org

[mapbox]: https://www.mapbox.com

[remark]: https://github.com/remarkjs/remark

[remark-rehype]: https://github.com/remarkjs/remark-rehype

[rehype]: https://github.com/rehypejs/rehype

[rehype-react]: https://github.com/rhysd/rehype-react

[mdast]: https://github.com/syntax-tree/mdast

[hast]: https://github.com/syntax-tree/hast

[to-hast]: https://github.com/syntax-tree/mdast-util-to-hast#tohastnode-options

[react]: http://facebook.github.io/react/

[dangerous]: https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml

[xss]: https://en.wikipedia.org/wiki/Cross-site_scripting

[h]: https://reactjs.org/docs/react-api.html#createelement

[sanitize]: https://github.com/syntax-tree/hast-util-sanitize

[integrations]: https://github.com/remarkjs/remark-html#integrations

[unified]: https://github.com/unifiedjs/unified

[unified-9]: https://github.com/unifiedjs/unified/releases/tag/9.0.0
