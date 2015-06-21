'use strict';

/*
 * Constants.
 */

var LINE = '\n';
var EMPTY = '';
var SPACE = ' ';
var GT = '>';
var LT = '<';
var SLASH = '/';
var QUOTE = '"';
var EQUALS = '=';

/*
 * List of self-closing tags.
 */

var CLOSING = ['hr', 'img', 'br'];

/**
 * Compile attributes.
 *
 * @param {Object?} attributes - Map of attributes.
 * @param {function(string): string} encode - Strategy
 *   to use.
 * @param {Node} node - mdast node currently being
 *   compiled.
 * @return {string} - HTML attributes.
 */
function toAttributes(attributes, encode, node) {
    var parameters = [];
    var key;
    var value;

    if (attributes) {
        for (key in attributes) {
            value = attributes[key];

            if (value !== null && value !== undefined) {
                value = encode(String(value || EMPTY), node);
                parameters.push(key + EQUALS + QUOTE + value + QUOTE);
            }
        }
    }

    return parameters.length ? parameters.join(SPACE) : EMPTY;
}

/**
 * Compile a `node`, in `context`, into HTML.
 *
 * @param {HTMLCompiler} context
 * @param {Node} node - mdast node.  If `node` has an
 *   `attributes` hash, its properties are also stringified
 *   as HTML attributes on the resulting node.
 * @param {string} name - Tag name to compile as.
 * @param {Object?} [attributes] - Attributes to add to the
 *   resulting node.
 * @param {string?} [children] - HTML to insert inside
 *   the resulting node.
 * @param {boolean} [loose] - Whether to add an initial and
 *   a trailing newline character inside the opening and
 *   closing tags.
 * @return {string} - HTML representation of `node`, based
 *   on the given options.
 */
function h(context, node, name, attributes, children, loose) {
    var closing = CLOSING.indexOf(name) !== -1;
    var value;
    var parameters;

    if (typeof children !== 'string' && typeof attributes === 'string') {
        loose = children;
        children = attributes;
        attributes = null;
    }

    parameters = toAttributes(attributes, context.encode, node);

    value = LT + name + (parameters ? SPACE + parameters : EMPTY);

    parameters = node && toAttributes(node.attributes, context.encode, node);

    value += parameters ? SPACE + parameters : EMPTY;

    if (closing) {
        return value + (context.options.xhtml ? SPACE + SLASH : EMPTY) + GT;
    }

    return value + GT +
        (loose ? LINE : EMPTY) +
        (children || EMPTY) +
        (loose && children ? LINE : EMPTY) +
        LT + SLASH + name + GT;
}

/*
 * Expose.
 */

module.exports = h;
