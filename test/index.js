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
var File = require('vfile');
var reactRenderer = require('..');

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
var write = fs.writeFileSync;
var exists = fs.existsSync;
var join = path.join;
var basename = path.basename;
var extname = path.extname;
var dirname = path.dirname;
var relative = path.relative;

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

/**
 * Check if `filePath` is hidden.
 *
 * @param {string} filePath
 * @return {boolean} - Whether or not `filePath` is hidden.
 */
function isHidden(filePath) {
    return filePath.indexOf('.') !== 0;
}

['v0.13', 'v0.14'].forEach(function (reactVersion) {
    var React = require(path.join(__dirname, 'react', reactVersion));

    /*
     * Fixtures.
     */

    var FIXTURE_ROOT = join(__dirname, 'react', reactVersion, 'fixtures');
    var fixtures = fs.readdirSync(FIXTURE_ROOT);
    fixtures = fixtures.filter(isHidden);


    /**
     * Shortcut to process.
     *
     * @param {File} file
     * @return {string}
     */
    function process(file, config) {
        var vdom = mdast.use(reactRenderer, config).process(file, config);
        return React.renderToStaticMarkup(vdom);
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
        actual = actual;
        expected = expected;
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

    describe('on React ' + reactVersion, function () {
        describe('mdast-react()', function () {
            it('should be a function', function () {
                assert(typeof reactRenderer === 'function');
            });

            it('should not throw if not passed options', function () {
                assert.doesNotThrow(function () {
                    reactRenderer(mdast());
                });
            });

            it('should use consistent React keys on multiple renders', function() {
                function extractKeys(reactElement) {
                    var keys = [];
                    if (reactElement.key != null) {
                        keys = keys.concat(reactElement.key);
                    }

                    if (reactElement.props != null) {
                        var childKeys = [];
                        React.Children.forEach(reactElement.props.children, function(child) {
                            childKeys = childKeys.concat(extractKeys(child));
                        });

                        keys = keys.concat(childKeys);
                    }

                    return keys;
                }

                function reactKeys(text) {
                    var vdom = mdast.use(reactRenderer, {createElement: React.createElement}).process(markdown, {});
                    return extractKeys(vdom);
                }

                var markdown = '# A **bold** heading';
                var keys1 = reactKeys(markdown);
                var keys2 = reactKeys(markdown);

                assert.deepEqual(keys1, keys2);
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
                config.createElement = React.createElement;
                result = process(file, config);

                if (global.process.env.UPDATE) {
                    write(join(filepath, 'output.html'), result);
                }

                assertion(result, output);
            });
        }


        /*
         * Assert fixtures.
         */

        describe('Fixtures', function () {
            fixtures.forEach(describeFixture);
        });
    });
});
