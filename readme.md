# remark-react

[![Build Status](https://travis-ci.org/mapbox/remark-react.svg?branch=master)](https://travis-ci.org/mapbox/remark-react)

**remark-react** compiles markdown to React.  Built on [**remark**](https://github.com/wooorm/remark),
an extensively tested and pluggable parser.

**Why?** Using innerHTML and [dangerouslySetInnerHTML](https://facebook.github.io/react/tips/dangerously-set-inner-html.html) in
[React.js](http://facebook.github.io/react/) is a common cause of [XSS](https://en.wikipedia.org/wiki/Cross-site_scripting)
attacks: user input can include script tags and other kinds of active
content that reaches across domains and harms security. remark-react
builds a DOM in React, using [React.createElement](https://facebook.github.io/react/docs/top-level-api.html):
this means that you can display parsed & formatted Markdown content
in an application without using `dangerouslySetInnerHTML`.

## Installation

[npm](https://docs.npmjs.com/cli/install):

```bash
npm install remark-react
```

## Table of Contents

*   [Command line](#command-line)

*   [Programmatic](#programmatic)

    *   [remark.use(react, options)](#remarkusereact-options)

*   [Configuration](#configuration)

*   [CommonMark](#commonmark)

*   [Integrations](#integrations)

*   [License](#license)

## Programmatic

### [remark](https://github.com/wooorm/remark#api).[use](https://github.com/wooorm/remark#remarkuseplugin-options)(react, [options](#configuration))

**Parameters**

*   `react` — This plugin;
*   `options` (`Object?`) — See [below](#configuration).

Let’s say `example.js` looks as follows:

```js
var React = require('react'),
    remark = require('remark'),
    reactRenderer = require('remark-react');

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
                {remark().use(reactRenderer).process(this.state.text)}
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

*   `remarkReactComponents` (`object`, default: `undefined`)
    — Provides a way to override default elements (`<a>`, `<p>`, etc)
    by defining an object comprised of `element: Component` key-value
    pairs. For example, to output `<MyLink>` components instead of
    `<a>`, and `<MyParagraph>` instead of `<p>`:
    ```js
    remarkReactComponents: {
      a: MyLink,
      p: MyParagraph
    }
    ```

These can passed to `remark.use()` as a second argument.

You can define these in `.remarkrc` or `package.json` [files](https://github.com/wooorm/remark/blob/master/doc/remarkrc.5.md)
too. An example `.remarkrc` file could look as follows:

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

Where the object at `plugins.react` are the options for **remark-react**.
The object at `settings` determines how **remark** parses markdown code.
Read more about the latter on [**remark**’s readme](https://github.com/wooorm/remark#remarkprocessvalue-options-done).

## CommonMark

> You still need to set `commonmark: true` in
> [**remark**’s options](https://github.com/wooorm/remark#remarkprocessvalue-options-done)

[CommonMark](http://commonmark.org) support is a goal but not (yet) a
necessity. There are some (roughly 115 of 550, relating to inline
precedence, lists, emphasis and strongness) issues which I’d like
to cover in the future. Note that this sounds like a lot, but they
have to do with obscure differences which do not often occur in the
real world. Read more on some of the reasoning in
[`doc/commonmark.md`](doc/commonmark.md).

## Integrations

**remark-react** works great with:

*   [**remark-toc**](https://github.com/wooorm/remark-toc), which generates
    tables of contents;

*   [**remark-github**](https://github.com/wooorm/remark-github), which generates
    references to GitHub issues, PRs, users, and more;

*   [**remark-comment-config**](https://github.com/wooorm/remark-comment-config)
    and [**remark-yaml-config**](https://github.com/wooorm/remark-yaml-config),
    which specify how HTML is compiled in the document itself;

*   ...and [more](https://github.com/wooorm/remark/blob/master/doc/plugins.md#list-of-plugins).

All [**remark** nodes](https://github.com/wooorm/remark/blob/master/doc/nodes.md)
can be compiled to HTML.  In addition, **remark-react** looks for an
`attributes` object on each node it compiles and adds the found properties
as HTML attributes on the compiled tag.

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com), modified by [Tom MacWright](http://www.macwright.org/) and [Mapbox](https://www.mapbox.com/)
