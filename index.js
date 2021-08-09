import {toHast} from 'mdast-util-to-hast'
import {sanitize} from 'hast-util-sanitize'
import {toH} from 'hast-to-hyperscript'
import tableCellStyle from '@mapbox/hast-util-table-cell-style'

const own = {}.hasOwnProperty

const tableElements = new Set(['table', 'thead', 'tbody', 'tfoot', 'tr'])

export default function remarkReact(options) {
  const settings = options || {}
  const createElement = settings.createElement
  const Fragment = settings.Fragment || settings.fragment
  const clean = settings.sanitize !== false
  const scheme =
    clean && typeof settings.sanitize !== 'boolean' ? settings.sanitize : null
  const toHastOptions = settings.toHast || {}
  const components = settings.remarkReactComponents || {}

  this.Compiler = compile

  // Wrapper around `createElement` to pass components in.
  function h(name, props, children) {
    // Currently, React issues a warning for *any* white space in tables.
    // So we remove the pretty lines for now.
    // See: <https://github.com/facebook/react/pull/7081>.
    // See: <https://github.com/facebook/react/pull/7515>.
    // See: <https://github.com/remarkjs/remark-react/issues/64>.
    /* istanbul ignore next - still works but need to publish `remark-gfm`
     * first. */
    if (children && tableElements.has(name)) {
      children = children.filter((child) => {
        return child !== '\n'
      })
    }

    return createElement(
      own.call(components, name) ? components[name] : name,
      props,
      children
    )
  }

  // Compile mdast to React.
  function compile(node) {
    let tree = toHast(node, toHastOptions)

    if (clean) {
      tree = sanitize(tree, scheme)
    }

    let root = toH(h, tableCellStyle(tree), settings.prefix)

    // If this compiled to a `<div>`, but fragment are possible, use those.
    if (root.type === 'div' && Fragment) {
      root = createElement(Fragment, {}, root.props.children)
    }

    return root
  }
}
