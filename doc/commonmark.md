# CommonMark

This document highlights the current differences from CommonMark:

*   Entities without a final semi-colon, such as `&amp`, are not
    required by [**CommonMark**](http://spec.commonmark.org/0.20/#example-248),
    but are valid HTML. The argument given in the spec, “because it makes
    the grammar too ambiguous”, seems quite a weird reason for me
    to build extra code which removes this functionality from the excellent
    entity parser **mdast** uses: [he](https://github.com/mathiasbynens/he).

*   **mdast-html** adds two extra entities when compiling to HTML,
    namely, `` ` `` (tick) and `'` (single quote), which are rendered
    as `&grave;` and `&apos;`. The first has to do with better support
    for IE8 (a tick can break out of an attribute or comment), the second
    for an optional future option to use single quotes as attribute
    quotes.
