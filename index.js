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

    return toH(h, tableCellStyle(hast), settings.prefix)
  }
}
