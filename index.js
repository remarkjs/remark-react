'use strict';

/*
 * Dependencies.
 */

var compilers = require('./lib/compilers.js');

/**
 * Attach an HTML compiler.
 *
 * @param {MDAST} mdast
 * @param {Object?} [options]
 */
function plugin(mdast, options) {
    var MarkdownCompiler = mdast.Compiler;
    var ancestor = MarkdownCompiler.prototype;
    var proto;
    var key;

    /**
     * Extensible prototype.
     */
    function ReactCompilerPrototype() {}

    ReactCompilerPrototype.prototype = ancestor;

    proto = new ReactCompilerPrototype();

    proto.options.xhtml = false;
    proto.options.sanitize = false;
    proto.options.entities = 'true';

    /**
     * Extensible constructor.
     */
    function ReactCompiler(file) {
        file.extension = 'html';

        MarkdownCompiler.apply(this, [file, options]);

        this.reactKeyCounter = 0;
    }

    ReactCompiler.prototype = proto;

    /*
     * Expose compilers.
     */

    for (key in compilers) {
        proto[key] = compilers[key];
    }

    mdast.Compiler = ReactCompiler;
}

/*
 * Expose `plugin`.
 */

module.exports = plugin;
