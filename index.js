'use strict';

/*
 * Dependencies.
 */

var compilers = require('./lib/compilers.js');
try {
    var createElement = require('react').createElement;
} catch (e) { }

/**
 * Attach an HTML compiler.
 *
 * @param {Unified} remark
 * @param {Object?} [options]
 * @param {Function?} [options.createElement]
 */
function plugin(remark, options) {
    var MarkdownCompiler = remark.Compiler;
    var ancestor = MarkdownCompiler.prototype;
    var proto;
    var key;

    /**
     * Extensible prototype.
     */
    function ReactCompilerPrototype() {}

    ReactCompilerPrototype.prototype = ancestor;

    proto = new ReactCompilerPrototype();

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
    proto.createElement = options && options.createElement || createElement;

    remark.Compiler = ReactCompiler;
}

/*
 * Expose `plugin`.
 */

module.exports = plugin;
