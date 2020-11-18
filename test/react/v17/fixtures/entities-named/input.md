# Entities

Plain text:

AT&amp;T with entity, AT&#x26;T with numeric entity, AT&T without entity.

Fenced code language flags:

```AT&amp;T
Something in the AT&amp;T language
```

```AT&#x26;T
Something in the AT&#x26;T language
```

```AT&T
Something in the AT&T language
```

Automatic links:

<http://at&amp;t.com>, <http://at&#x26;t.com>, and <http://at&t.com>.

Link `href`:

[With entity](http://at&amp;t.com), [numeric entity](http://at&#x26;t.com), [without entity](http://at&t.com).

Link `title`:

[With entity](http://att.com "AT&amp;T"), [numeric entity](http://att.com "AT&#x26;T"), [without entity](http://example.com "AT&T").

Image `src`:

![With entity](http://at&amp;t.com/fav.ico), ![numeric entity](http://at&#x26;t.com/fav.ico), ![without entity](http://at&t.com/fav.ico).

Image `alt`:

![AT&amp;T with entity](http://att.com/fav.ico), ![AT&#x26;T with numeric entity](http://att.com/fav.ico), ![AT&T without entity](http://att.com/fav.ico).

Image `title`:

![With entity](http://att.com/fav.ico "AT&amp;T"), ![numeric entity](http://att.com/fav.ico "AT&#x26;T"), ![without entity](http://att.com/fav.ico "AT&T").

Reference `link`:

[Entity][entity], [Numeric entity][numeric-entity], [Literal][literal].

![Entity][entity], ![Numeric entity][numeric-entity], ![Literal][literal].

Reference `title`:

[Entity][title-entity], [Numeric entity][title-numeric-entity], [Literal][title-literal].

![Entity][title-entity], ![Numeric entity][title-numeric-entity], ![Literal][title-literal].

Image Reference `alt`:

![AT&amp;T with entity][reference], ![AT&#x26;T with numeric entity][reference], ![AT&T without entity][reference].

Definitions:

[reference]: http://at&t.com/fav.ico "AT&T favicon"

[entity]: http://at&amp;t.com/fav.ico "ATT favicon"
[numeric-entity]: http://at&#x26;t.com/fav.ico "ATT favicon"
[literal]: http://at&t.com/fav.ico "ATT favicon"

[title-entity]: http://at&t.com/fav.ico "AT&amp;T favicon"
[title-numeric-entity]: http://at&t.com/fav.ico "AT&#x26;T favicon"
[title-literal]: http://at&t.com/fav.ico "AT&T favicon"
