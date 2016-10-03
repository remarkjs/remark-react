'use strict';

/*
 * Dependencies.
 */

var toHAST = require('mdast-util-to-hast');
var sanitize = require('hast-util-sanitize');
var toH = require('hast-to-hyperscript');

try {
    var globalCreateElement = require('react').createElement;
} catch (e) { }

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
function plugin(processor, options) {
    var settings = options || {};
    var createElement = settings.createElement || globalCreateElement;
    var components = settings.remarkReactComponents || {};
    var clean = settings.sanitize !== false;
    var scheme = clean && (typeof settings.sanitize !== 'boolean') ? settings.sanitize : null;

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
     * Extensible constructor.
     */
    function Compiler() {}

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
            children: toHAST(node).children
        };

        if (clean) {
            hast = sanitize(hast, scheme);
        }

        return toH(h, hast, settings.prefix);
    }

    Compiler.prototype.compile = compile;

    processor.Compiler = Compiler;
}

/*
 * Expose `plugin`.
 */

module.exports = plugin;
