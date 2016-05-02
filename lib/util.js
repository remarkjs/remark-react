'use strict';

/*
 * Dependencies.
 */

/*
 * Constants.
 */

var WHITE_SPACE_COLLAPSABLE_LINE = /[ \t]*\n+[ \t]*/g;
var WHITE_SPACE_COLLAPSABLE = /[ \t\n]+/g;
var WHITE_SPACE_INITIAL = /^[ \t\n]+/g;
var WHITE_SPACE_FINAL = /[ \t\n]+$/g;

/**
 * Remove initial white space from `value`.
 *
 * @example
 *   trimLeft(' foo'); // 'foo'
 *
 *   trimLeft('\n\tfoo'); // 'foo'
 *
 * @param {string} value - Content to trim.
 * @return {string} - Trimmed `value`.
 */
function trimLeft(value) {
    return String(value).replace(WHITE_SPACE_INITIAL, '');
}

/**
 * Remove final white space from `value`.
 *
 * @example
 *   trimRight('foo '); // 'foo'
 *
 *   trimRight('foo\t\n'); // 'foo'
 *
 * @param {string} value - Content to trim.
 * @return {string} - Trimmed `value`.
 */
function trimRight(value) {
    return String(value).replace(WHITE_SPACE_FINAL, '');
}

/**
 * Remove initial and final white space from `value`.
 *
 * @example
 *   trim(' foo '); // 'foo'
 *
 *   trim('\n foo\t\n'); // 'foo'
 *
 * @param {string} value - Content to trim.
 * @return {string} - Trimmed `value`.
 */
function trim(value) {
    return trimRight(trimLeft(value));
}

/**
 * Remove initial and final spaces and tabs in each line in
 * `value`.
 *
 * @example
 *   trimLines(' foo\n bar \nbaz'); // 'foo\nbar\nbaz'
 *
 * @param {string} value - Content to trim.
 * @return {string} - Trimmed `value`.
 */
function trimLines(value) {
    return String(value).replace(WHITE_SPACE_COLLAPSABLE_LINE, '\n');
}

/**
 * Collapse multiple spaces, tabs, and newlines.
 *
 * @example
 *   collapse(' \t\nbar \nbaz\t'); // ' bar baz '
 *
 * @param {string} value - Content to trim.
 * @return {string} - Trimmed `value`.
 */
function collapse(value) {
    return String(value).replace(WHITE_SPACE_COLLAPSABLE, ' ');
}

/**
 * Remove tabs from indented content.
 *
 * @example
 *   detab('  \tbar'); // '    bar'
 *
 * @param {string} value - Content with tabs.
 * @return {string} - Cleaned `value`.
 */
function detab(value) {
    return value;
}

var allowedSchemes = ['http', 'https', 'mailto'];
/**
 * Preven links having potentially malicious schemes, like javascript:
 * This code is from https://github.com/bevacqua/insane
 * MIT License (MIT) © 2015 Nicolas Bevacqua
 */
function testUrl (text) {
    var start = text[0];
    if (start === '#' || start === '/') {
        return true;
    }
    var colon = text.indexOf(':');
    if (colon === -1) {
        return true;
    }
    var questionmark = text.indexOf('?');
    if (questionmark !== -1 && colon > questionmark) {
        return true;
    }
    var hash = text.indexOf('#');
    if (hash !== -1 && colon > hash) {
        return true;
    }
    return allowedSchemes.some(matches);

    function matches (scheme) {
        return text.indexOf(scheme + ':') === 0;
    }
}

/**
 * Normalize `uri`.
 *
 * This only works when both `encodeURI` and `decodeURI`
 * are available.
 *
 * @example
 *   normalizeURI('foo bar'); // 'foo%20bar'
 *
 * @param {string} uri - URI to normalize.
 * @return {string} - Normalized uri.
 */
function normalizeURI(uri) {
    // sanitize potentially dangerous URLs
    if (!testUrl(uri)) return '';

    try {
        uri = encodeURI(decodeURI(uri));
    } catch (exception) { /* empty */ }

    return uri;
}

/*
 * Expose.
 */

var util = {};

util.trim = trim;
util.trimLeft = trimLeft;
util.trimLines = trimLines;
util.collapse = collapse;
util.normalizeURI = normalizeURI;
util.detab = detab;

module.exports = util;
