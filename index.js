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
    function HTMLCompilerPrototype() {}

    HTMLCompilerPrototype.prototype = ancestor;

    proto = new HTMLCompilerPrototype();

    proto.options.xhtml = false;
    proto.options.sanitize = false;
    proto.options.entities = 'true';

    /**
     * Extensible constructor.
     */
    function HTMLCompiler(file) {
        file.extension = 'html';

        MarkdownCompiler.apply(this, [file, options]);
    }

    HTMLCompiler.prototype = proto;

    /*
     * Expose compilers.
     */

    for (key in compilers) {
        proto[key] = compilers[key];
    }

    mdast.Compiler = HTMLCompiler;
}

/*
 * Expose `plugin`.
 */

module.exports = plugin;
