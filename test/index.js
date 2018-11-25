'use strict';

/* eslint-env mocha */

var path = require('path');
var fs = require('fs');
var assert = require('assert');
var remark = require('remark');
var frontmatter = require('remark-frontmatter');
var vfile = require('vfile');
var reactRenderer = require('..');

var read = fs.readFileSync;
var write = fs.writeFileSync;
var exists = fs.existsSync;
var join = path.join;

/**
 * Check if `filePath` is hidden.
 *
 * @param {string} filePath - Path to file
 * @return {boolean} - Whether or not `filePath` is hidden.
 */
function isHidden(filePath) {
  return filePath.indexOf('.') !== 0;
}

['v16'].forEach(function (reactVersion) {
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
   * @param {File} file - Virtual file
   * @param {File} config - Processing configuration
   * @return {string} - Rendered HTML
   */
  function processSync(file, config) {
    var vdom = remark().data('settings', config)
      .use(frontmatter)
      .use(reactRenderer, config)
      .processSync(file).contents;
    return React.renderToStaticMarkup(vdom);
  }

  /**
   * Assert two strings.
   *
   * @param {string} actual - Actual fixture
   * @param {string} expected - Expected fixture
   * @param {boolean?} [silent] - Don’t throw error
   * @return {Error?} - When silent and not equal.
   * @throws {Error} - When not silent and not equal.
   */
  function assertion(actual, expected, silent) {
    try {
      assert(actual === expected);
    } catch (error) {
      error.expected = expected;
      error.actual = actual;

      if (silent) {
        return error;
      }

      throw error;
    }
  }

  /*
   * Tests.
   */

  describe('on React ' + reactVersion, function () {
    describe('remark-react()', function () {
      it('should be a function', function () {
        assert(typeof reactRenderer === 'function');
      });

      it('should not throw if not passed options', function () {
        assert.doesNotThrow(function () {
          remark().use(reactRenderer).freeze();
        });
      });

      it('should use consistent React keys on multiple renders', function () {
        function extractKeys(reactElement) {
          var keys = [];

          if (reactElement.key != null) {
            keys = keys.concat(reactElement.key);
          }

          if (reactElement.props != null) {
            var childKeys = [];

            React.Children.forEach(reactElement.props.children, function (child) {
              childKeys = childKeys.concat(extractKeys(child));
            });

            keys = keys.concat(childKeys);
          }

          return keys;
        }

        function reactKeys(text) {
          var vdom = remark().use(reactRenderer, {createElement: React.createElement}).processSync(text).contents;
          return extractKeys(vdom);
        }

        var markdown = '# A **bold** heading';
        var keys1 = reactKeys(markdown);
        var keys2 = reactKeys(markdown);

        assert.deepStrictEqual(keys1, keys2);
      });

      it('should use custom components', function () {
        var markdown = '# Foo';

        var vdom = remark().use(reactRenderer, {
          createElement: React.createElement,
          remarkReactComponents: {
            h1: function (props) {
              return React.createElement('h2', props);
            }
          }
        }).processSync(markdown).contents;

        assert.strictEqual(React.renderToStaticMarkup(vdom), '<div><h2>Foo</h2></div>');
      });

      it('does not sanitize input when `sanitize` option is set to false', function () {
        var markdown = '```empty\n```';
        var vdom = remark().use(reactRenderer, {
          createElement: React.createElement,
          sanitize: false
        }).processSync(markdown).contents;

        // If sanitation were done, 'class' property should be removed.
        assert.strictEqual(React.renderToStaticMarkup(vdom), '<div><pre><code class="language-empty"></code></pre></div>');
      });

      it('passes toHast options to inner toHAST() function', function () {
        var markdown = '# Foo';

        var vdom = remark().use(reactRenderer, {
          createElement: React.createElement,
          toHast: {allowDangerousHTML: true}
        }).processSync(markdown).contents;

        assert.strictEqual(React.renderToStaticMarkup(vdom), '<div><h1>Foo</h1></div>');
      });
    });

    /**
     * Describe a fixture.
     *
     * @param {string} fixture - Name for fixture
     */
    function describeFixture(fixture) {
      it('should work on `' + fixture + '`', function () {
        var filepath = join(FIXTURE_ROOT, fixture);
        var output = read(join(filepath, 'output.html'), 'utf-8');
        var input = read(join(filepath, 'input.md'), 'utf-8');
        var config = join(filepath, 'config.json');
        var file = vfile({path: fixture + '.md', contents: input});
        var result;

        config = exists(config) ? JSON.parse(read(config, 'utf-8')) : {};
        config.createElement = React.createElement;
        result = processSync(file, config);

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
