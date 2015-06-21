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
