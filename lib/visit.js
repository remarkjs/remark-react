'use strict';

/**
 * Visit.
 *
 * @param {Node} tree - Node to search.
 * @param {string} type - Type of nodes to search invoke
 *   `callback` with.
 * @param {function(node)} callback - Callback invoked
 *   with nodes matching `type`.
 * @param {Object} context - Object to call `callback`
 *   with.
 */
function visit(tree, type, callback, context) {
    /**
     * Visit a single node.
     */
    function one(node) {
        if (node.type === type) {
            callback.call(context, node);
        }

        var children = node.children;
        var index = -1;
        var length = children ? children.length : 0;

        while (++index < length) {
            one(children[index]);
        }
    }

    one(tree);
}

/*
 * Expose.
 */

module.exports = visit;
