/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('hast-util-sanitize').Schema} Schema
 * @typedef {import('mdast-util-to-hast').Options} ToHastOptions
 * @typedef {import('react').ReactNode} ReactNode
 * @typedef {import('react').ReactElement<unknown>} ReactElement
 *
 * @callback CreateElementLike
 * @param {any} name
 * @param {any} props
 * @param {...ReactNode} children
 * @returns {ReactNode}
 *
 * @typedef Options
 * @property {CreateElementLike} createElement
 *   How to create elements or components.
 *   You should typically pass `React.createElement`.
 * @property {((props: any) => ReactNode)|undefined} [Fragment]
 *   Create fragments instead of an outer `<div>` if available.
 *   You should typically pass `React.Fragment`.
 * @property {string|undefined} [prefix='h-']
 *   React key prefix
 * @property {boolean|Schema} [sanitize]
 *   Options for `hast-util-sanitize`.
 * @property {ToHastOptions} [toHast={}]
 *   Options for `mdast-util-to-hast`.
 * @property {Partial<{[TagName in keyof JSX.IntrinsicElements]: string|((props: JSX.IntrinsicElements[TagName]) => ReactNode)}>} [remarkReactComponents]
 *   Override default elements (such as `<a>`, `<p>`, etcetera) by passing an
 *   object mapping tag names to components.
 */

import {toHast} from 'mdast-util-to-hast'
import {sanitize} from 'hast-util-sanitize'
import {toH} from 'hast-to-hyperscript'
// @ts-expect-error: untyped.
import tableCellStyle from '@mapbox/hast-util-table-cell-style'

const own = {}.hasOwnProperty
const tableElements = new Set(['table', 'thead', 'tbody', 'tfoot', 'tr'])

/**
 * Plugin to transform markdown to React.
 *
 * @type {import('unified').Plugin<[Options], Root, ReactElement>}
 */
export default function remarkReact(options) {
  if (!options || !options.createElement) {
    throw new Error('Missing `createElement` in `options`')
  }

  const createElement = options.createElement
  /** @type {Options['Fragment']} */
  // @ts-expect-error: to do: deprecate `fragment`.
  const Fragment = options.Fragment || options.fragment
  const clean = options.sanitize !== false
  const scheme =
    clean && typeof options.sanitize !== 'boolean' ? options.sanitize : null
  const toHastOptions = options.toHast || {}
  const components = options.remarkReactComponents || {}

  Object.assign(this, {Compiler: compile})

  /**
   * @param {keyof JSX.IntrinsicElements} name
   * @param {Record<string, unknown>} props
   * @param {unknown[]} [children]
   * @returns {ReactNode}
   */
  function h(name, props, children) {
    // Currently, React issues a warning for *any* white space in tables.
    // So we remove the pretty lines for now.
    // See: <https://github.com/facebook/react/pull/7081>.
    // See: <https://github.com/facebook/react/pull/7515>.
    // See: <https://github.com/remarkjs/remark-react/issues/64>.
    /* istanbul ignore next - still works but need to publish `remark-gfm`
     * first. */
    if (children && tableElements.has(name)) {
      children = children.filter((child) => child !== '\n')
    }

    return createElement(
      own.call(components, name) ? components[name] : name,
      props,
      children
    )
  }

  // Compile mdast to React.
  /** @type {import('unified').CompilerFunction<Root, ReactNode>} */
  function compile(node) {
    let tree = toHast(node, toHastOptions)

    if (clean && tree) {
      tree = sanitize(tree, scheme || undefined)
    }

    /** @type {ReactNode} */
    // @ts-expect-error: assume `name` is a known element.
    let result = toH(h, tableCellStyle(tree), options.prefix)

    // If this compiled to a `<div>`, but fragment are possible, use those.
    if (
      result &&
      typeof result === 'object' &&
      'type' in result &&
      result.type === 'div' &&
      'props' in result &&
      Fragment
    ) {
      // `children` does exist.
      // type-coverage:ignore-next-line
      result = createElement(Fragment, {}, result.props.children)
    }

    return result
  }
}
