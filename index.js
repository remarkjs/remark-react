'use strict'

module.exports = react

var toHast = require('mdast-util-to-hast')
var sanitize = require('hast-util-sanitize')
var toH = require('hast-to-hyperscript')
var tableCellStyle = require('@mapbox/hast-util-table-cell-style')

var globalReact
var globalCreateElement
var globalFragment

/* istanbul ignore next - Hard to test */
try {
  globalReact = require('react')
  globalCreateElement = globalReact.createElement
  globalFragment = globalReact.Fragment
} catch (_) {}

var own = {}.hasOwnProperty

var tableElements = ['table', 'thead', 'tbody', 'tfoot', 'tr']

function react(options) {
  var settings = options || {}
  var createElement = settings.createElement || globalCreateElement
  var Fragment = settings.fragment || globalFragment
  var clean = settings.sanitize !== false
  var scheme =
    clean && typeof settings.sanitize !== 'boolean' ? settings.sanitize : null
  var toHastOptions = settings.toHast || {}
  var components = settings.remarkReactComponents || {}

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
    if (children && tableElements.indexOf(name) !== -1) {
      children = children.filter(function (child) {
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
    var tree = toHast(node, toHastOptions)
    var root

    if (clean) {
      tree = sanitize(tree, scheme)
    }

    root = toH(h, tableCellStyle(tree), settings.prefix)

    // If this compiled to a `<div>`, but fragment are possible, use those.
    if (root.type === 'div' && Fragment) {
      root = createElement(Fragment, {}, root.props.children)
    }

    return root
  }
}
