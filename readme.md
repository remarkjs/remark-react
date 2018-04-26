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

*   [Programmatic](#programmatic)

    *   [remark.use(react, options)](#remarkusereact-options)

*   [Configuration](#configuration)

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
                {remark().use(reactRenderer).processSync(this.state.text).contents}
            </div>
        </div>);
    }
});

React.render(<App />, document.getElementById('app'));
```

## Configuration

All options, including the `options` object itself, are optional:

*   `sanitize` (`object` or `boolean`, default: `undefined`)
    — Sanitation schema to use. Passed to
    [hast-util-sanitize](https://github.com/wooorm/hast-util-sanitize).
    The default schema, if none or `true` is passed, adheres to GitHub’s
    sanitation rules.

    **This means that non-standard HAST nodes and many
    HTML elements are *by default* santized out.** If you want to be more
    permissive, you should provide a value for `sanitize`.

    If `false` is passed, it does not sanitize input.

*   `prefix` (`string`, default: `h-`)
    — React key.

*   `createElement` (`Function`, default: `require('react').createElement`)
    — Function to use to create elements.

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

*   `toHast` (`object`, default: `{}`)
    — Provides options for transforming MDAST document to HAST.
    See [mdast-util-to-hast](https://github.com/wooorm/mdast-util-to-hast#api)
    for settings.

These can passed to `remark.use()` as a second argument.

## Integrations

**remark-react** works great with:

*   [**remark-toc**](https://github.com/wooorm/remark-toc), which generates
    tables of contents;

*   [**remark-github**](https://github.com/wooorm/remark-github), which
    generates references to GitHub issues, PRs, users, and more;

*   ...and [more](https://github.com/wooorm/remark/blob/master/doc/plugins.md#list-of-plugins).

All [**remark** nodes](https://github.com/wooorm/mdast)
can be compiled to HTML.  In addition, **remark-react** looks for an
`attributes` object on each node it compiles and adds the found properties
as HTML attributes on the compiled tag.

Additionally, syntax highlighting can be included (completely virtual) with
[`remark-react-lowlight`](https://github.com/bebraw/remark-react-lowlight).

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com), modified by [Tom MacWright](http://www.macwright.org/) and [Mapbox](https://www.mapbox.com/)
