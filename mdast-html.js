(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mdastHTML = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./lib/compilers.js":2}],2:[function(require,module,exports){
'use strict';

/*
 * Dependencies.
 */

var visit = require('./visit.js');
var util = require('./util.js');
var h = require('./h.js');

/*
 * Constants.
 */

var FIRST_WORD = /^[^\ \t]+(?=[\ \t]|$)/;

/*
 * Compilers.
 */

var visitors = {};

/**
 * Return the content of a reference without definition
 * as markdown.
 *
 * @param {Node} node
 * @param {Node?} definition
 * @param {HTMLCompiler} context
 * @return {string?} - If without definition, returns a
 *   string, returns nothing otherwise.
 */
function failsafe(node, definition, context) {
    var result;

    if (node.referenceType === 'shortcut' && !definition.link) {
        result = node.children ? context.all(node).join('') : node.alt;

        return (node.type === 'imageReference' ? '!' : '') +
            '[' + result + ']';
    }

    return '';
}

/**
 * Gather a link definition.  Stores `node` on the context
 * object at `definitions`.
 *
 * @example
 *   addDefinition({
 *       'identifier': 'foo',
 *       'link': 'http://example.com',
 *       'title': 'Example Domain'
 *   });
 *
 * @param {Node} node
 * @this {HTMLCompiler}
 */
function addDefinition(node) {
    this.definitions.push(node);
}

/**
 * Gather a link definition.  Stores `node` on the context
 * object at `definitions`.
 *
 * @example
 *   addFootnoteDefinition({
 *       'identifier': 'foo',
 *       'children': [],
 *   });
 *
 * @param {Node} node
 * @this {HTMLCompiler}
 */
function addFootnoteDefinition(node) {
    this.footnotes.push(node);
}

/**
 * Stringify all footnote definitions, if any.
 *
 * @return {string}
 * @this {HTMLCompiler}
 */
function generateFootnotes() {
    var self = this;
    var definitions = self.footnotes;
    var length = definitions.length;
    var index = -1;
    var results = [];
    var def;
    var content;

    if (!length) {
        return '';
    }

    while (++index < length) {
        def = definitions[index];

        results[index] = self.listItem({
            'type': 'listItem',
            'attributes': {
                'id': 'fn-' + def.identifier
            },
            'children': def.children.concat({
                'type': 'link',
                'href': '#fnref-' + def.identifier,
                'attributes': {
                    'class': 'footnote-backref'
                },
                'children': [{
                    'type': 'text',
                    'value': '↩'
                }]
            }),
            'position': def.position
        }, {});
    }

    content = h(self, null, 'hr') + '\n' +
        h(self, null, 'ol', results.join('\n'), true);

    return h(self, null, 'div', {
        'class': 'footnotes'
    }, content, true) + '\n';
}

/**
 * Get a link definition with the same identifier as
 * `identifier`.
 *
 * @param {string} identifier
 * @return {Node?}
 * @this {HTMLCompiler}
 */
function getDefinition(identifier) {
    var definitions = this.definitions;
    var length = definitions.length;
    var index = -1;

    while (++index < length) {
        if (definitions[index].identifier === identifier) {
            return definitions[index];
        }
    }

    return {};
}

/**
 * Stringify the children of `node`.
 *
 * @param {Node} parent
 * @return {Array.<string>}
 * @this {HTMLCompiler}
 */
function all(parent) {
    var self = this;
    var nodes = parent.children;
    var values = [];
    var index = -1;
    var length = nodes.length;
    var value;

    while (++index < length) {
        value = self.visit(nodes[index], parent);

        if (value) {
            values.push(value);
        }
    }

    return values;
}

/**
 * Stringify a block.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function block(node) {
    return this.all(node).join('\n');
}

/**
 * Stringify a root object.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function root(node) {
    var self = this;

    self.definitions = [];
    self.footnotes = [];

    visit(node, 'definition', addDefinition, self);
    visit(node, 'footnoteDefinition', addFootnoteDefinition, self);

    return self.block(node) + '\n' + self.generateFootnotes();
}

/**
 * Stringify a block quote.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function blockquote(node) {
    return h(this, node, 'blockquote', this.block(node), true);
}

/**
 * Stringify an inline footnote.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function footnote(node) {
    var self = this;
    var definitions = self.footnotes;
    var index = -1;
    var length = definitions.length;
    var identifiers = [];
    var identifier;

    while (++index < length) {
        identifiers[index] = definitions[index].identifier;
    }

    index = -1;
    identifier = 1;

    while (identifiers.indexOf(String(identifier)) !== -1) {
        identifier++;
    }

    identifier = String(identifier);

    addFootnoteDefinition.call(self, {
        'type': 'footnoteDefinition',
        'identifier': identifier,
        'children': node.children,
        'position': node.position
    });

    return self.footnoteReference({
        'type': 'footnoteReference',
        'identifier': identifier,
        'position': node.position
    });
}

/**
 * Stringify a list.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function list(node) {
    return h(this, node, node.ordered ? 'ol' : 'ul', {
        'start': node.start !== 1 ? node.start : null
    }, this.all(node).join('\n'), true);
}

/**
 * Stringify a list-item.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function listItem(node, parent) {
    var item = node;
    var single;
    var result;

    single = !parent.loose &&
        node.children.length === 1 &&
        node.children[0].children;

    result = this.all(single ? item.children[0] : item)
        .join(single ? '' : '\n');

    return h(this, node, 'li', result, !single);
}

/**
 * Stringify a heading.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function heading(node) {
    return h(this, node, 'h' + node.depth, this.all(node).join(''));
}

/**
 * Stringify a paragraph.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function paragraph(node) {
    return h(this, node, 'p', util.trim(
        util.detab(this.all(node).join(''))
    ), false);
}

/**
 * Stringify a code block.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function code(node) {
    var self = this;
    var value = node.value ? util.detab(node.value + '\n') : '';
    var language = node.lang && node.lang.match(FIRST_WORD);

    return h(self, node, 'pre', h(self, node, 'code', {
        'class': language ? 'language-' + language[0] : null
    }, self.encode(value), false), false);
}

/**
 * Stringify a table.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function table(node) {
    var self = this;
    var rows = node.children;
    var index = rows.length;
    var align = node.align;
    var alignLength = align.length;
    var pos;
    var result = [];
    var row;
    var out;
    var name;

    while (index--) {
        pos = alignLength;
        row = rows[index].children;
        out = [];
        name = index === 0 ? 'th' : 'td';

        while (pos--) {
            out[pos] = h(self, row[pos], name, {
                'align': align[pos]
            }, row[pos] ? self.all(row[pos]).join('\n') : '');
        }

        result[index] = h(self, rows[index], 'tr', out.join('\n'), true);
    }

    return h(self, node, 'table',
        h(self, node, 'thead', result[0], true) + '\n' +
        h(self, node, 'tbody', result.slice(1).join('\n'), true),
        true
    );
}

/**
 * Stringify a literal HTML.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function html(node) {
    return this.options.sanitize ? this.encode(node.value) : node.value;
}

/**
 * Stringify a horizontal rule.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function rule(node) {
    return h(this, node, 'hr');
}

/**
 * Stringify inline code.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function inlineCode(node) {
    return h(this, node, 'code', util.collapse(this.encode(node.value)));
}

/**
 * Stringify strongly emphasised content.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function strong(node) {
    return h(this, node, 'strong', this.all(node).join(''));
}

/**
 * Stringify emphasised content.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function emphasis(node) {
    return h(this, node, 'em', this.all(node).join(''));
}

/**
 * Stringify an inline break.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function hardBreak(node) {
    return h(this, node, 'br') + '\n';
}

/**
 * Stringify a link.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function link(node) {
    return h(this, node, 'a', {
        'href': util.normalizeURI(node.href),
        'title': node.title
    }, this.all(node).join(''));
}

/**
 * Stringify a reference to a footnote.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function footnoteReference(node) {
    var identifier = node.identifier;

    return h(this, node, 'sup', {
        'id': 'fnref-' + identifier
    }, h(this, node, 'a', {
        'href': '#fn-' + identifier,
        'class': 'footnote-ref'
    }, identifier));
}

/**
 * Stringify a reference to a link.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function linkReference(node) {
    var self = this;
    var def = self.getDefinition(node.identifier);

    return failsafe(node, def, self) || h(self, node, 'a', {
        'href': util.normalizeURI(def.link || ''),
        'title': def.title
    }, self.all(node).join(''));
}

/**
 * Stringify a reference to an image.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function imageReference(node) {
    var self = this;
    var def = self.getDefinition(node.identifier);

    return failsafe(node, def, self) || h(self, node, 'img', {
        'src': util.normalizeURI(def.link || ''),
        'alt': node.alt || '',
        'title': def.title
    });
}

/**
 * Stringify an image.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function image(node) {
    return h(this, node, 'img', {
        'src': util.normalizeURI(node.src),
        'alt': node.alt || '',
        'title': node.title
    });
}

/**
 * Stringify a deletion.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function strikethrough(node) {
    return h(this, node, 'del', this.all(node).join(''));
}

/**
 * Stringify text.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function text(node) {
    return util.trimLines(this.encode(node.value));
}

/**
 * Stringify escaped text.
 *
 * @param {Node} node
 * @return {string}
 * @this {HTMLCompiler}
 */
function escape(node) {
    return this[node.value === '\n' ? 'break' : 'text'](node);
}

/**
 * Return an empty string for nodes which are ignored.
 *
 * @return {string}
 * @this {HTMLCompiler}
 */
function ignore() {
    return '';
}

/*
 * Helpers.
 */

visitors.all = all;
visitors.block = block;
visitors.generateFootnotes = generateFootnotes;
visitors.getDefinition = getDefinition;

/*
 * Ignored nodes.
 */

visitors.yaml = ignore;
visitors.definition = ignore;
visitors.footnoteDefinition = ignore;

/*
 * Compilers.
 */

visitors.footnote = footnote;
visitors.root = root;
visitors.blockquote = blockquote;
visitors.list = list;
visitors.listItem = listItem;
visitors.paragraph = paragraph;
visitors.heading = heading;
visitors.table = table;
visitors.code = code;
visitors.html = html;
visitors.horizontalRule = rule;
visitors.inlineCode = inlineCode;
visitors.strong = strong;
visitors.emphasis = emphasis;
visitors.break = hardBreak;
visitors.link = link;
visitors.image = image;
visitors.footnoteReference = footnoteReference;
visitors.linkReference = linkReference;
visitors.imageReference = imageReference;
visitors.delete = strikethrough;
visitors.text = text;
visitors.escape = escape;

/*
 * Expose.
 */

module.exports = visitors;

},{"./h.js":3,"./util.js":4,"./visit.js":5}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
'use strict';

/*
 * Dependencies.
 */

var repeat = require('repeat-string');

/*
 * Constants.
 */

var TAB_SIZE = 4;
var WHITE_SPACE_COLLAPSABLE_LINE = /[ \t]*\n+[ \t]*/g;
var WHITE_SPACE_COLLAPSABLE = /[ \t\n]+/g;
var WHITE_SPACE_INITIAL = /^[ \t\n]+/g;
var WHITE_SPACE_FINAL = /[ \t\n]+$/g;

/**
 * Remove initial white space from `value`.
 *
 * @param {string} value
 * @return {string}
 */
function trimLeft(value) {
    return String(value).replace(WHITE_SPACE_INITIAL, '');
}

/**
 * Remove initial white space from `value`.
 *
 * @param {string} value
 * @return {string}
 */
function trimRight(value) {
    return String(value).replace(WHITE_SPACE_FINAL, '');
}

/**
 * Remove initial and final white space from `value`.
 *
 * @param {string} value
 * @return {string}
 */
function trim(value) {
    return trimRight(trimLeft(value));
}

/**
 * Remove initial and final white space in lines from `value`.
 *
 * @param {string} value
 * @return {string}
 */
function trimLines(value) {
    return String(value).replace(WHITE_SPACE_COLLAPSABLE_LINE, '\n');
}

/**
 * Normalize `uri`.
 *
 * This only works when both `encodeURI` and `decodeURI`
 * are available.
 *
 * @param {string} uri
 * @return {string} - Normalized uri.
 */
function normalizeURI(uri) {
    try {
        uri = encodeURI(decodeURI(uri));
    } catch (exception) { /* empty */ }

    return uri;
}

/**
 * Collapse white space.
 *
 * @param {string} value
 * @return {string}
 */
function collapse(value) {
    return String(value).replace(WHITE_SPACE_COLLAPSABLE, ' ');
}

/**
 * Gets column-size of the indentation.
 *
 * @param {string} value
 * @return {Object}
 */
function detab(value) {
    var length = value.length;
    var characters = value.split('');
    var index = -1;
    var column = -1;
    var character;

    while (++index < length) {
        character = characters[index];
        column++;

        if (character === '\t') {
            column += characters[index];
            characters[index] = repeat(' ', TAB_SIZE - (column % TAB_SIZE));
        }
    }

    return characters.join('');
}

/*
 * Expose.
 */

var util = {};

util.trim = trim;
util.trimLines = trimLines;
util.collapse = collapse;
util.normalizeURI = normalizeURI;
util.detab = detab;

module.exports = util;

},{"repeat-string":6}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
/*!
 * repeat-string <https://github.com/jonschlinkert/repeat-string>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

/**
 * Expose `repeat`
 */

module.exports = repeat;

/**
 * Repeat the given `string` the specified `number`
 * of times.
 *
 * **Example:**
 *
 * ```js
 * var repeat = require('repeat-string');
 * repeat('A', 5);
 * //=> AAAAA
 * ```
 *
 * @param {String} `string` The string to repeat
 * @param {Number} `number` The number of times to repeat the string
 * @return {String} Repeated string
 * @api public
 */

function repeat(str, num) {
  if (typeof str !== 'string') {
    throw new TypeError('repeat-string expects a string.');
  }

  if (num === 1) return str;
  if (num === 2) return str + str;

  var max = str.length * num;
  if (cache !== str || typeof cache === 'undefined') {
    cache = str;
    res = '';
  }

  while (max > res.length && num > 0) {
    if (num & 1) {
      res += str;
    }

    num >>= 1;
    if (!num) break;
    str += str;
  }

  return res.substr(0, max);
}

/**
 * Results cache
 */

var res = '';
var cache;

},{}]},{},[1])(1)
});