<a name="4.0.3"></a>
## [4.0.3](https://github.com/mapbox/remark-react/compare/4.0.2...v4.0.3) (2018-04-26)


### Bug Fixes

* Update hast-util-table-cell-style for browser compat ([1100c60](https://github.com/mapbox/remark-react/commit/1100c60))



<a name="4.0.2"></a>
## [4.0.2](https://github.com/mapbox/remark-react/compare/4.0.1...v4.0.2) (2018-04-26)


### Bug Fixes

* Update hast-to-hyperscript and mdast-util-to-hast ([a8231c0](https://github.com/mapbox/remark-react/commit/a8231c0))
* Use hast-util-table-cell-style to adjust align properties ([d141733](https://github.com/mapbox/remark-react/commit/d141733))



<a name="4.0.1"></a>
## [4.0.1](https://github.com/mapbox/remark-react/compare/v4.0.0...v4.0.1) (2017-05-22)


### Bug Fixes

* **output:** Update `hast-to-hyperscript` to 3.0.0 ([0aa5fa2](https://github.com/mapbox/remark-react/commit/0aa5fa2)), closes [#41](https://github.com/mapbox/remark-react/issues/41)



<a name="4.0.0"></a>
# [4.0.0](https://github.com/mapbox/remark-react/compare/v3.1.2...v4.0.0) (2017-03-11)

Re-release of 3.1.2 as 4.0.0: the previous version should have been marked as
breaking, and has now been deprecated.



<a name="3.1.2"></a>
## [3.1.2](https://github.com/mapbox/remark-react/compare/v3.1.1...v3.1.2) (2017-03-08)


### Bug Fixes

* **core:** Remove const, restore ES5 compatibility ([52ef7e0](https://github.com/mapbox/remark-react/commit/52ef7e0))



<a name="3.1.1"></a>

## [3.1.1](https://github.com/mapbox/remark-react/compare/v3.1.0...v3.1.1) (2017-03-07)

### Bug Fixes

*   **output:** Remove unknown prop 'align' ([e0462f1](https://github.com/mapbox/remark-react/commit/e0462f1))

# 3.1.0

*   Adds `toHast` option that allows customization at the [mdast-util-to-hast](https://github.com/wooorm/mdast-util-to-hast#api)
    level.

# 3.0.2

*   Fixes interpretation of the `sanitize` option, allowing users to pass
    `false` to disable sanitization.

# 2.1.0

*   Only allows `http`, `mailto`, and `https` schemes for links.

# 2.0.0

*   Update to Remark 4

# 0.3.0

*   Added `mdastReactComponents` option #[9](https://github.com/mapbox/mdast-react/pull/9)
*   React 0.14 support #[8](https://github.com/mapbox/mdast-react/pull/8)

# 0.2.0

*   Support for Markdown footnotes

# 0.1.2

*   Fix sequential key ordering so that server-side renders
    of Markdown will match client-side binding
