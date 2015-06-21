# mdast-html [![Build Status](https://img.shields.io/travis/wooorm/mdast-html.svg?style=flat)](https://travis-ci.org/wooorm/mdast-html) [![Coverage Status](https://img.shields.io/coveralls/wooorm/mdast-html.svg?style=flat)](https://coveralls.io/r/wooorm/mdast-html?branch=master)

**mdast-html** compiles markdown to HTML.  Built on [**mdast**](https://github.com/wooorm/mdast),
an extensively tested and pluggable parser.

## Installation

[npm](https://docs.npmjs.com/cli/install):

```bash
npm install mdast-html
```

**mdast-html** is also available for [bower](http://bower.io/#install-packages),
[component](https://github.com/componentjs/component), and
[duo](http://duojs.org/#getting-started), and as AMD, CommonJS, and globals
module, [uncompressed](mdast-html.js) and [compressed](mdast-html.min.js).

## Command line

Use **mdast-html** together with **mdast**:

```bash
npm install --global mdast mdast-html
```

Let’s say `example.md` looks as follows:

```md
# Hello & World

**Alpha**, _bravo_, and ~~Charlie~~.
```

Then, run **mdast-html** on `example.md`:

```bash
mdast -u mdast-html example.md -o
```

Yields (check out the newly created `example.html` file):

```html
<h1>Hello &amp; World</h1>
<p><strong>Alpha</strong>, <em>bravo</em>, and <del>Charlie</del>.</p>
```

## Programmatic

### [mdast](https://github.com/wooorm/mdast#api).[use](https://github.com/wooorm/mdast#mdastuseplugin-options)(html, [options](#configuration))

**Parameters**

*   `html` — This plugin;
*   `options` (`Object?`) — See [below](#configuration).

Let’s say `example.js` looks as follows:

```js
var mdast = require('mdast');
var html = require('mdast-html');

var doc = '# Hello & World\n' +
    '\n' +
    '**Alpha**, _bravo_, and ~~Charlie~~.\n';

var result = mdast().use(html).process(doc);

console.log(result);
/*
 * '<h1>Hello &amp; World</h1>\n<p><strong>Alpha</strong>, <em>bravo</em>, and <del>Charlie</del>.</p>'
 */
```

## Configuration

All options, including the `option` object itself, are optional:

*   `entities` (`true`, `'numbers'`, or `'escape'`, default: `true`)
    — How to encode non-ASCII and HTML-escape characters: the default
    generates named entities (`&` > `&amp;`); `'numbers'` generates
    numbered entities (`&` > `&#x26;`), and `'escape'` only encodes
    characters which are required by HTML to be escaped: `&`, `<`, `>`,
    `"`, `'`, and `` ` ``, leaving non-ASCII character untouched.

*   `xhtml` (`boolean`, default: `false`)
    — Whether or not to terminate self-closing tags (such as `img`) with a
    slash;

*   `sanitize` (`boolean`, default: `false`)
    — Whether or not to allow the use of HTML inside markdown.

These can passed to `mdast.use()` as a second argument, or on the CLI:

```bash
mdast --use 'html=sanitize:false,xhtml:false,entities:"escape"' example.md
```

You can define these in `.mdastrc` or `package.json` [files](https://github.com/wooorm/mdast/blob/master/doc/mdastrc.5.md)
too. An example `.mdastrc` file could look as follows:

```json
{
  "plugins": {
    "html": {
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

Where the object at `plugins.html` are the options for **mdast-html**.
The object at `settings` determines how **mdast** parses markdown code.
Read more about the latter on [**mdast**’s readme](https://github.com/wooorm/mdast#mdastprocessvalue-options-done).

## CommonMark

> You still need to set `commonmark: true` in
> [**mdast**’s options](https://github.com/wooorm/mdast#mdastprocessvalue-options-done)

[CommonMark](http://commonmark.org) support is a goal but not (yet) a
necessity. There are some (roughly 160 of 550, relating to inline
precedence, HTML, lists, emphasis and strongness) issues which I’d like
to cover in the future. Note that this sounds like a lot but often
have to do with obscure differences which do not often occur in the
real world.

## Integrations

**mdast-html** works great with:

*   [**mdast-toc**](https://github.com/wooorm/mdast-toc), to generate
    tables of contents;

*   [**mdast-github**](https://github.com/wooorm/mdast-github), to generate
    references to GitHub issues, PRs, and users;

*   [**mdast-comment-config**](https://github.com/wooorm/mdast-comment-config)
    and [**mdast-yaml-config**](https://github.com/wooorm/mdast-yaml-config),
    to specify how HTML is compiled in the document itself;

*   ...and [more](https://github.com/wooorm/mdast/blob/master/doc/plugins.md#list-of-plugins).

All [**mdast** nodes](https://github.com/wooorm/mdast/blob/master/doc/nodes.md)
can be compiled to HTML.  In addition, **mdast-html** looks for an
`attributes` object on each node it compiles and adds the found properties
as HTML attributes on the compiled tag.

## License

[MIT](LICENSE) © [Titus Wormer](http://wooorm.com)
