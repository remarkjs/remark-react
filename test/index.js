/**
 * @typedef {import('mdast').Image} Image
 * @typedef {import('react').ReactNode} ReactNode
 * @typedef {import('react').ReactElement<unknown>} ReactElement
 */

import path from 'path'
import fs from 'fs'
import test from 'tape'
import {remark} from 'remark'
import {VFile} from 'vfile'
import {isHidden} from 'is-hidden'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import remarkFootnotes from 'remark-footnotes'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server.js'
import remarkReact from '../index.js'

test('React ' + React.version, (t) => {
  t.throws(
    () => {
      // @ts-expect-error: Options missing.
      remark().use(remarkReact).freeze()
    },
    /Missing `createElement` in `options`/,
    'should throw if not passed options'
  )

  t.test('should use consistent keys on multiple renders', (st) => {
    const markdown = '# A **bold** heading'

    st.deepEqual(reactKeys(markdown), reactKeys(markdown))

    st.end()

    /**
     * @param {string} text
     */
    function reactKeys(text) {
      return extractKeys(
        remark()
          .use(remarkReact, {createElement: React.createElement})
          .processSync(text).result
      )
    }

    /**
     * @param {ReactElement} reactElement
     * @returns {Array.<string|number>}
     */
    function extractKeys(reactElement) {
      /** @type {Array.<string|number>} */
      const keys = []

      if (reactElement.key !== undefined && reactElement.key !== null) {
        keys.push(reactElement.key)
      }

      if (
        reactElement.props &&
        typeof reactElement.props === 'object' &&
        // `children` does exist.
        // @ts-expect-error
        // type-coverage:ignore-next-line
        reactElement.props.children
      ) {
        // `children` does exist.
        // @ts-expect-error
        // type-coverage:ignore-next-line
        React.Children.forEach(reactElement.props.children, (child) => {
          keys.push(...extractKeys(child))
        })
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
            h1(props) {
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
          toHast: {
            handlers: {
              image(_, /** @type {Image} */ node) {
                return {type: 'text', value: node.alt || ''}
              }
            }
          }
        })
        .processSync('![a]()').result
    ),
    '<p>a</p>',
    'passes toHast options to inner toHast() function'
  )

  const root = path.join('test', 'fixtures')
  const fixtures = fs.readdirSync(root)
  let index = -1

  while (++index < fixtures.length) {
    const name = fixtures[index]

    if (isHidden(name)) continue

    const base = path.join(root, name)
    const input = fs.readFileSync(path.join(base, 'input.md'))
    const expected = fs.readFileSync(path.join(base, 'output.html'), 'utf8')
    let config = {}

    try {
      config = JSON.parse(
        String(fs.readFileSync(path.join(base, 'config.json')))
      )
    } catch {}

    config.createElement = React.createElement

    const actual = renderToStaticMarkup(
      remark()
        .data('settings', config)
        .use(remarkGfm)
        .use(remarkFrontmatter)
        .use(remarkFootnotes, {inlineNotes: true})
        .use(remarkReact, config)
        .processSync(new VFile({path: name + '.md', value: input})).result
    )

    if (process.env.UPDATE) {
      fs.writeFileSync(path.join(root, name, 'output.html'), actual + '\n')
    }

    t.equal(actual.trim(), expected.trim(), name)
  }

  t.end()
})
