# mdast-react

[![Build Status](https://travis-ci.org/mapbox/mdast-react.svg?branch=master)](https://travis-ci.org/mapbox/mdast-react)

**mdast-react** compiles markdown to React.  Built on [**mdast**](https://github.com/wooorm/mdast),
an extensively tested and pluggable parser.

**Why?** Using innerHTML and [dangerouslySetInnerHTML](https://facebook.github.io/react/tips/dangerously-set-inner-html.html) in
[React.js](http://facebook.github.io/react/) is a common cause of [XSS](https://en.wikipedia.org/wiki/Cross-site_scripting)
attacks: user input can include script tags and other kinds of active
content that reaches across domains and harms security. mdast-react
builds a DOM in React, using [React.createElement](https://facebook.github.io/react/docs/top-level-api.html):
this means that you can display parsed & formatted Markdown content
in an application without using `dangerouslySetInnerHTML`.

## Installation

[npm](https://docs.npmjs.com/cli/install):

```bash
npm install mdast-react
```

## Table of Contents

*   [Command line](#command-line)

*   [Programmatic](#programmatic)

    *   [mdast.use(react, options)](#mdastusereact-options)

*   [Configuration](#configuration)

*   [CommonMark](#commonmark)

*   [Integrations](#integrations)

*   [License](#license)

## Programmatic

### [mdast](https://github.com/wooorm/mdast#api).[use](https://github.com/wooorm/mdast#mdastuseplugin-options)(react, [options](#configuration))

**Parameters**

*   `react` — This plugin;
*   `options` (`Object?`) — See [below](#configuration).

Let’s say `example.js` looks as follows:

```js
var React = require('react'),
    mdast = require('mdast'),
    reactRenderer = require('mdast-react');

var App = React.createClass({
    getInitialState() {
        return { text: '# hello world' };
    },
    onChange(e) {
        this.setState({ text: e.target.value });
    },
    render() {
        return (<div>
            <textarea
                value={this.state.text}
                onChange={this.onChange} />
            <div id='preview'>
                {mdast().use(reactRenderer).process(this.state.text)}
            </div>
        </div>);
    }
});

React.render(<App />, document.getElementById('app'));
```

## Configuration

All options, including the `options` object itself, are optional:

*   `entities` (`true`, `'numbers'`, or `'escape'`, default: `true`)
    — How to encode non-ASCII and HTML-escape characters: the default
    generates named entities (`&` > `&amp;`); `'numbers'` generates
    numbered entities (`&` > `&#x26;`), and `'escape'` only encodes
    characters which are required by HTML to be escaped: `&`, `<`, `>`,
    `"`, `'`, and `` ` ``, leaving non-ASCII characters untouched.

*   `sanitize` (`boolean`, default: `false`)
    — Whether or not to allow the use of HTML inside markdown.

*   `paragraphBlockquotes` (`boolean`, default: `true`)
    — Wraps content of `<blockquote>` in a `<p>` element.

*   `mdastReactComponents` (`object`, default: `undefined`)
    — Provides a way to override default elements (`<a>`, `<p>`, etc)
    by defining an object comprised of `element: Component` key-value
    pairs. For example, to output `<MyLink>` components instead of
    `<a>`, and `<MyParagraph>` instead of `<p>`:
    ```js
    mdastReactComponents: {
      a: MyLink,
      p: MyParagraph
    }
    ```

These can passed to `mdast.use()` as a second argument.

Options other than `mdastReactComponents` can be defined in `.mdastrc` or `package.json` [files](https://github.com/wooorm/mdast/blob/master/doc/mdastrc.5.md)
too. An example `.mdastrc` file could look as follows:

```json
{
  "plugins": {
    "react": {
        "sanitize": false,
        "xhtml": false,
        "entities": "numbers"
    }
  },
  "settings": {
    "commonmark": true
  }
}
```

Where the object at `plugins.react` are the options for **mdast-react**.
The object at `settings` determines how **mdast** parses markdown code.
Read more about the latter on [**mdast**’s readme](https://github.com/wooorm/mdast#mdastprocessvalue-options-done).

## CommonMark

> You still need to set `commonmark: true` in
> [**mdast**’s options](https://github.com/wooorm/mdast#mdastprocessvalue-options-done)

[CommonMark](http://commonmark.org) support is a goal but not (yet) a
necessity. There are some (roughly 115 of 550, relating to inline
precedence, lists, emphasis and strongness) issues which I’d like
to cover in the future. Note that this sounds like a lot, but they
have to do with obscure differences which do not often occur in the
real world. Read more on some of the reasoning in
[`doc/commonmark.md`](doc/commonmark.md).

## Integrations

**mdast-react** works great with:

*   [**mdast-toc**](https://github.com/wooorm/mdast-toc), which generates
    tables of contents;

*   [**mdast-github**](https://github.com/wooorm/mdast-github), which generates
    references to GitHub issues, PRs, users, and more;

*   [**mdast-comment-config**](https://github.com/wooorm/mdast-comment-config)
    and [**mdast-yaml-config**](https://github.com/wooorm/mdast-yaml-config),
    which specify how HTML is compiled in the document itself;

*   ...and [more](https://github.com/wooorm/mdast/blob/master/doc/plugins.md#list-of-plugins).

All [**mdast** nodes](https://github.com/wooorm/mdast/blob/master/doc/nodes.md)
can be compiled to HTML.  In addition, **mdast-react** looks for an
`attributes` object on each node it compiles and adds the found properties
as HTML attributes on the compiled tag.

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com), modified by [Tom MacWright](http://www.macwright.org/) and [Mapbox](https://www.mapbox.com/)
