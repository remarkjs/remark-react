import path from 'path'
import fs from 'fs'
import test from 'tape'
import remark from 'remark'
import vfile from 'vfile'
import hidden from 'is-hidden'
import negate from 'negate'
import gfm from 'remark-gfm'
import frontmatter from 'remark-frontmatter'
import footnotes from 'remark-footnotes'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server.js'
import remarkReact from '../index.js'

var root = path.join('test', 'fixtures')
var fixtures = fs.readdirSync(root)

fixtures = fixtures.filter(negate(hidden))

test('React ' + React.version, function (t) {
  t.doesNotThrow(function () {
    remark().use(remarkReact).freeze()
  }, 'should not throw if not passed options')

  t.test('should use consistent keys on multiple renders', function (st) {
    var markdown = '# A **bold** heading'

    st.deepEqual(reactKeys(markdown), reactKeys(markdown))

    st.end()

    function reactKeys(text) {
      return extractKeys(
        remark()
          .use(remarkReact, {createElement: React.createElement})
          .processSync(text).result
      )
    }

    function extractKeys(reactElement) {
      var keys = []

      if (reactElement.key != null) {
        keys = keys.concat(reactElement.key)
      }

      if (reactElement.props != null) {
        var childKeys = []

        React.Children.forEach(reactElement.props.children, function (child) {
          childKeys = childKeys.concat(extractKeys(child))
        })

        keys = keys.concat(childKeys)
      }

      return keys
    }
  })

  t.equal(
    renderToStaticMarkup(
      remark()
        .use(remarkReact, {
          createElement: React.createElement,
          remarkReactComponents: {
            h1: function (props) {
              return React.createElement('h2', props)
            }
          }
        })
        .processSync('# Foo').result
    ),
    '<h2>Foo</h2>',
    'should use custom components'
  )

  // If sanitation were done, 'class' property should be removed.
  t.equal(
    renderToStaticMarkup(
      remark()
        .use(remarkReact, {
          createElement: React.createElement,
          sanitize: false
        })
        .processSync('```empty\n```').result
    ),
    '<pre><code class="language-empty"></code></pre>',
    'does not sanitize input when `sanitize` option is set to false'
  )

  t.equal(
    renderToStaticMarkup(
      remark()
        .use(remarkReact, {
          createElement: React.createElement,
          Fragment: React.Fragment
        })
        .processSync('# Hello\nWorld').result
    ),
    '<h1>Hello</h1>\n<p>World</p>',
    'should support given fragments'
  )

  t.equal(
    renderToStaticMarkup(
      remark()
        .use(remarkReact, {
          createElement: React.createElement,
          toHast: {commonmark: true}
        })
        .processSync('[reference]\n\n[reference]: a.com\n[reference]: b.com')
        .result
    ),
    '<p><a href="a.com">reference</a></p>',
    'passes toHast options to inner toHast() function'
  )

  fixtures.forEach(function (name) {
    var base = path.join(root, name)
    var input = fs.readFileSync(path.join(base, 'input.md'))
    var expected = fs.readFileSync(path.join(base, 'output.html'), 'utf8')
    var config
    var actual

    try {
      config = JSON.parse(fs.readFileSync(path.join(base, 'config.json')))
    } catch (_) {
      config = {}
    }

    config.createElement = React.createElement

    actual = renderToStaticMarkup(
      remark()
        .data('settings', config)
        .use(gfm)
        .use(frontmatter)
        .use(footnotes, {inlineNotes: true})
        .use(remarkReact, config)
        .processSync(vfile({path: name + '.md', contents: input})).result
    )

    if (global.process.env.UPDATE) {
      fs.writeFileSync(path.join(root, name, 'output.html'), actual + '\n')
    }

    t.equal(actual.trim(), expected.trim(), name)
  })

  t.end()
})
