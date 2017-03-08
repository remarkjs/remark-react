'use strict';

module.exports = remarkReact;

var toHAST = require('mdast-util-to-hast');
var sanitize = require('hast-util-sanitize');
var toH = require('hast-to-hyperscript');
var xtend = require('xtend');

var globalCreateElement;

try {
  globalCreateElement = require('react').createElement;
} catch (err) {}

var own = {}.hasOwnProperty;

var TABLE_ELEMENTS = ['table', 'thead', 'tbody', 'tfoot', 'tr'];

/**
 * Attach a react compiler.
 *
 * @param {Unified} processor - Instance.
 * @param {Object?} [options]
 * @param {Object?} [options.sanitize]
 *   - Sanitation schema.
 * @param {Object?} [options.remarkReactComponents]
 *   - Components.
 * @param {string?} [options.prefix]
 *   - Key prefix.
 * @param {Function?} [options.createElement]
 *   - `h()`.
 */
function remarkReact(options) {
  var settings = options || {};
  var createElement = settings.createElement || globalCreateElement;
  var clean = settings.sanitize !== false;
  var scheme = clean && (typeof settings.sanitize !== 'boolean') ? settings.sanitize : null;
  var toHastOptions = settings.toHast || {};
  var components = xtend({
    td: createTableCellComponent('td'),
    th: createTableCellComponent('th')
  }, settings.remarkReactComponents);

  this.Compiler = compile;

  /**
   * Wrapper around `createElement` to pass
   * components in.
   *
   * @param {string} name - Element name.
   * @param {Object} props - Attributes.
   * @return {ReactElement} - React element.
   */
  function h(name, props, children) {
    var component = own.call(components, name) ? components[name] : name;

    /*
     * Currently, a warning is triggered by react for
     * *any* white-space in tables.  So we remove the
     * pretty lines for now:
     * https://github.com/facebook/react/pull/7081
     */
    if (children && TABLE_ELEMENTS.indexOf(component) !== -1) {
      children = children.filter(function (child) {
        return child !== '\n';
      });
    }

    return createElement(component, props, children);
  }

  /**
   * Compile MDAST to React.
   *
   * @param {Node} node - MDAST node.
   * @return {ReactElement} - React element.
   */
  function compile(node) {
    var hast = {
      type: 'element',
      tagName: 'div',
      properties: {},
      children: toHAST(node, toHastOptions).children
    };

    if (clean) {
      hast = sanitize(hast, scheme);
    }

    return toH(h, hast, settings.prefix);
  }

  /**
   * Create a functional React component for a cell.
   * We need this because GFM uses `align`, whereas React
   * forbids that and wants `style.textAlign` instead.
   */
  function createTableCellComponent(tagName) {
    return TableCell;

    function TableCell(props) {
      var fixedProps = xtend(props, {
        children: undefined,
        style: {textAlign: props.align}
      });
      delete fixedProps.align;
      return createElement(tagName, fixedProps, props.children);
    }
  }
}
