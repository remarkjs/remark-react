'use strict'

var path = require('path')
var fs = require('fs')
var test = require('tape')
var remark = require('remark')
var frontmatter = require('remark-frontmatter')
var vfile = require('vfile')
var hidden = require('is-hidden')
var not = require('not')
var reactRenderer = require('..')

var versions = ['v16']

versions.forEach(function(reactVersion) {
  var React = require(path.join(__dirname, 'react', reactVersion))

  var root = path.join(__dirname, 'react', reactVersion, 'fixtures')
  var fixtures = fs.readdirSync(root)

  fixtures = fixtures.filter(not(hidden))

  test('React ' + reactVersion, function(t) {
    t.doesNotThrow(function() {
      remark()
        .use(reactRenderer)
        .freeze()
    }, 'should not throw if not passed options')

    t.test('should use consistent keys on multiple renders', function(st) {
      var markdown = '# A **bold** heading'

      st.deepEqual(reactKeys(markdown), reactKeys(markdown))

      st.end()

      function reactKeys(text) {
        return extractKeys(
          remark()
            .use(reactRenderer, {createElement: React.createElement})
            .processSync(text).contents
        )
      }

      function extractKeys(reactElement) {
        var keys = []

        if (reactElement.key != null) {
          keys = keys.concat(reactElement.key)
        }

        if (reactElement.props != null) {
          var childKeys = []

          React.Children.forEach(reactElement.props.children, function(child) {
            childKeys = childKeys.concat(extractKeys(child))
          })

          keys = keys.concat(childKeys)
        }

        return keys
      }
    })

    t.equal(
      React.renderToStaticMarkup(
        remark()
          .use(reactRenderer, {
            createElement: React.createElement,
            remarkReactComponents: {
              h1: function(props) {
                return React.createElement('h2', props)
              }
            }
          })
          .processSync('# Foo').contents
      ),
      '<h2>Foo</h2>',
      'should use custom components'
    )

    // If sanitation were done, 'class' property should be removed.
    t.equal(
      React.renderToStaticMarkup(
        remark()
          .use(reactRenderer, {
            createElement: React.createElement,
            sanitize: false
          })
          .processSync('```empty\n```').contents
      ),
      '<pre><code class="language-empty"></code></pre>',
      'does not sanitize input when `sanitize` option is set to false'
    )

    t.equal(
      React.renderToStaticMarkup(
        remark()
          .use(reactRenderer, {
            createElement: React.createElement,
            fragment: React.Fragment
          })
          .processSync('# Hello\nWorld').contents
      ),
      '<h1>Hello</h1>\n<p>World</p>',
      'should support given fragments'
    )

    t.equal(
      React.renderToStaticMarkup(
        remark()
          .use(reactRenderer, {
            createElement: React.createElement,
            toHast: {commonmark: true}
          })
          .processSync('[reference]\n\n[reference]: a.com\n[reference]: b.com')
          .contents
      ),
      '<p><a href="a.com">reference</a></p>',
      'passes toHast options to inner toHAST() function'
    )

    fixtures.forEach(function(name) {
      var base = path.join(root, name)
      var input = fs.readFileSync(path.join(base, 'input.md'))
      var expected = fs.readFileSync(path.join(base, 'output.html'), 'utf8')
      var config
      var actual

      try {
        config = JSON.parse(fs.readFileSync(path.join(base, 'config.json')))
      } catch (error) {
        config = {}
      }

      config.createElement = React.createElement

      actual = React.renderToStaticMarkup(
        remark()
          .data('settings', config)
          .use(frontmatter)
          .use(reactRenderer, config)
          .processSync(vfile({path: name + '.md', contents: input})).contents
      )

      if (global.process.env.UPDATE) {
        fs.writeFileSync(path.join(root, name, 'output.html'), actual)
      }

      t.equal(actual, expected, name)
    })

    t.end()
  })
})
