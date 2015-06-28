'use strict';

/* eslint-env mocha */

/*
 * Dependencies.
 */

var path = require('path');
var fs = require('fs');
var assert = require('assert');
var mdast = require('mdast');
var yamlConfig = require('mdast-yaml-config');
var toc = require('mdast-toc');
var github = require('mdast-github');
var commentConfig = require('mdast-comment-config');
var commonmark = require('commonmark.json');
var File = require('mdast/lib/file');
var html = require('..');

/*
 * By default, CommonMark failures are accepted.
 *
 * To fail on CommonMark exceptions, set the `CMARK`
 * environment variable.
 */

var ignoreCommonMarkException = !('CMARK' in global.process.env);

/*
 * Methods.
 */

var read = fs.readFileSync;
var exists = fs.existsSync;
var join = path.join;
var basename = path.basename;
var extname = path.extname;
var dirname = path.dirname;

/**
 * Create a `File` from a `filePath`.
 *
 * @param {string} filePath
 * @return {File}
 */
function toFile(filePath, contents) {
    var extension = extname(filePath);
    var directory = dirname(filePath);
    var name = basename(filePath, extension);

    return new File({
        'directory': directory,
        'filename': name,
        'extension': extension.slice(1),
        'contents': contents
    });
}

/*
 * Constants.
 */

var INTEGRATION_MAP = {
    'github': github,
    'yaml-config': yamlConfig,
    'toc': toc,
    'comment-config': commentConfig
};

var INTEGRATION_ROOT = join(__dirname, 'integrations');
var FIXTURE_ROOT = join(__dirname, 'fixtures');

var CMARK_OPTIONS = {
    'entities': 'escape',
    'commonmark': true,
    'yaml': false,
    'xhtml': true
};

/*
 * List of CommonMark tests I dissagree with.
 * For reasoning, see `doc/commonmark.md`.
 *
 * Note that these differences have to do with not
 * puting more time into features which IMHO produce
 * less quality HTML. So if you’d like to write the
 * features, I’ll gladly merge!
 */

var CMARK_IGNORE = [
    /*
     * Exception 1.
     */

    247,
    248,

    /*
     * Exception 2.
     */
    3,
    50,
    76,
    77,
    80,
    86,
    89,
    98,
    118,
    176,
    230,
    231,
    233,
    236,
    257,
    258,
    261,
    262,
    263,
    264,
    265,
    266,
    267,
    268,
    269,
    270,
    395,
    396,
    433,
    445,
    520,
    522,
    551,

    /*
     * Exception 3.
     */
    428,
    477,
    478,
    479,
    480,
    481,
    489,
    493
];

/*
 * Fixtures.
 */

var fixtures = fs.readdirSync(FIXTURE_ROOT);
var integrations = fs.readdirSync(INTEGRATION_ROOT);

/**
 * Check if `filePath` is hidden.
 *
 * @param {string} filePath
 * @return {boolean} - Whether or not `filePath` is hidden.
 */
function isHidden(filePath) {
    return filePath.indexOf('.') !== 0;
}

/*
 * Gather fixtures.
 */

fixtures = fixtures.filter(isHidden);
integrations = integrations.filter(isHidden);

/*
 * CommonMark.
 */

var section;
var start;

commonmark.forEach(function (test, position) {
    if (section !== test.section) {
        section = test.section;
        start = position;
    }

    test.relative = position - start + 1;
});

/**
 * Shortcut to process.
 *
 * @param {File} file
 * @return {string}
 */
function process(file, config) {
    return mdast.use(html, config).process(file, config);
}

/**
 * Assert two strings.
 *
 * @param {string} actual
 * @param {string} expected
 * @param {boolean?} [silent]
 * @return {Error?} - When silent and not equal.
 * @throws {Error} - When not silent and not equal.
 */
function assertion(actual, expected, silent) {
    try {
        assert(actual === expected);
    } catch (exception) {
        exception.expected = expected;
        exception.actual = actual;

        if (silent) {
            return exception;
        }

        throw exception;
    }
}

/*
 * Tests.
 */

describe('mdast-html()', function () {
    it('should be a function', function () {
        assert(typeof html === 'function');
    });

    it('should not throw if not passed options', function () {
        assert.doesNotThrow(function () {
            html(mdast());
        });
    });
});

/**
 * Describe a fixture.
 *
 * @param {string} fixture
 */
function describeFixture(fixture) {
    it('should work on `' + fixture + '`', function () {
        var filepath = join(FIXTURE_ROOT, fixture);
        var output = read(join(filepath, 'output.html'), 'utf-8');
        var input = read(join(filepath, 'input.md'), 'utf-8');
        var config = join(filepath, 'config.json');
        var file = toFile(fixture + '.md', input);
        var result;

        config = exists(config) ? JSON.parse(read(config, 'utf-8')) : {};
        result = process(file, config);

        assertion(result, output);
    });
}

/**
 * Describe an integration.
 *
 * @param {string} integration
 */
function describeIntegration(integration) {
    it('should work on `' + integration + '`', function () {
        var filepath = join(INTEGRATION_ROOT, integration);
        var output = read(join(filepath, 'output.html'), 'utf-8');
        var input = read(join(filepath, 'input.md'), 'utf-8');
        var config = join(filepath, 'config.json');
        var file = toFile(integration + '.md', input);
        var result;

        config = exists(config) ? JSON.parse(read(config, 'utf-8')) : {};

        result = mdast
            .use(html, config)
            .use(INTEGRATION_MAP[integration], config)
            .process(file, config);

        assertion(result, output);
    });
}

/**
 * Describe a CommonMark test.
 *
 * @param {string} test
 * @param {number} n
 */
function describeCommonMark(test, n) {
    var name = test.section + ' ' + test.relative;
    var file = toFile(name + '.md', test.markdown);
    var result = process(file, CMARK_OPTIONS);
    var err;
    var fn;

    n = n + 1;

    err = assertion(result, test.html, true);

    fn = it;

    if (CMARK_IGNORE.indexOf(n) !== -1 || ignoreCommonMarkException && err) {
        fn = fn.skip;
    }

    fn('(' + n + ') should work on ' + name, function () {
        if (err) {
            throw err;
        }
    });
}

/*
 * Assert fixtures.
 */

describe('Fixtures', function () {
    fixtures.forEach(describeFixture);
});

/*
 * Assert CommonMark.
 */

describe('CommonMark', function () {
    commonmark.forEach(describeCommonMark);
});

/*
 * Assert integrations.
 */

describe('Integrations', function () {
    integrations.forEach(describeIntegration);
});
