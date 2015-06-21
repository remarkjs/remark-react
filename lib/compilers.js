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
