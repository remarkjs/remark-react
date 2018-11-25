'use strict'

module.exports = react

var toHAST = require('mdast-util-to-hast')
var sanitize = require('hast-util-sanitize')
var toH = require('hast-to-hyperscript')
var tableCellStyle = require('@mapbox/hast-util-table-cell-style')

var globalCreateElement

try {
  globalCreateElement = require('react').createElement
} catch (error) {}

var own = {}.hasOwnProperty

var tableElements = ['table', 'thead', 'tbody', 'tfoot', 'tr']

function react(options) {
  var settings = options || {}
  var createElement = settings.createElement || globalCreateElement
  var clean = settings.sanitize !== false
  var scheme =
    clean && typeof settings.sanitize !== 'boolean' ? settings.sanitize : null
  var toHastOptions = settings.toHast || {}
  var components = settings.remarkReactComponents || {}

  this.Compiler = compile

  // Wrapper around `createElement` to pass components in.
  function h(name, props, children) {
    var component = own.call(components, name) ? components[name] : name

    // Currently, a warning is triggered by react for *any* white-space in
    // tables.  So we remove the pretty lines for now:
    // https://github.com/facebook/react/pull/7081
    if (children && tableElements.indexOf(component) !== -1) {
      children = children.filter(function(child) {
        return child !== '\n'
      })
    }

    return createElement(component, props, children)
  }

  // Compile mdast to React.
  function compile(node) {
    var hast = {
      type: 'element',
      tagName: 'div',
      properties: {},
      children: toHAST(node, toHastOptions).children
    }

    if (clean) {
      hast = sanitize(hast, scheme)
    }

    hast = tableCellStyle(hast)

    return toH(h, hast, settings.prefix)
  }
}
