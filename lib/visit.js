'use strict';

/**
 * Visit.
 *
 * @param {Node} tree
 * @param {string} type - Node type.
 * @param {function(node)} callback
 * @param {Object} context
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
