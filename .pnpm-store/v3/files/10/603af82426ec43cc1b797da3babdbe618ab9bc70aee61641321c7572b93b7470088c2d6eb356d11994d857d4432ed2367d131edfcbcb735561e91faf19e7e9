# remark-custom-container

<p align="center">
  <a href="https://github.com/koka831/remark-custom-container/actions" target="_blank">
    <img src="https://badgen.net/github/checks/koka831/remark-custom-container" alt="ci status" height="18">
  </a>
  <a href="https://badge.fury.io/js/remark-custom-container" target="_blank">
    <img src="https://badge.fury.io/js/remark-custom-container.svg" alt="npm version" height="18">
  </a>
  <a href="https://github.com/koka831/remark-custom-container/blob/master/LICENSE" target="_blank">
    <img src="https://badgen.net/github/license/koka831/remark-custom-container" alt="license" height="18">
  </a>

</p>

[remarkjs][remarkjs] parser plugin for custom directive (compatible with new parser in remark. see [#536][536])

> **Note**
> This plugin is highly inspired by [vuepress-plugin-container][vuepress-plugin-container].

This package is ESM only: Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

## Syntax

Container described with `:::[space]{class name}[space]{container title}` and `:::`.

example:

```markdown
::: className Custom Title

Container Body

:::
```

will be rendered as follows

```html
<div class="remark-container className">
  <div class="remark-container__title">
    Custom Title
  </div>
  Container Body
</div>
```

## Install

```shell
$ npm install remark-custom-container
```

## Usage

```javascript
import remark from "remark";
import remark2rehype from "remark-rehype";
import stringify from "rehype-stringify";

import container from "remark-custom-container";

const html = await remark()
  .use(container)
  .use(remark2rehype)
  .use(stringify);
```

## Options

```javascript
use(container, {
  className: string, // optional, default to "remark-container",
  containerTag: string, // optional, default to "div"
  titleElement: Record<string, unknown> | null, // optional, default to { className: string[] }
  additionalProperties: (className?: string, title?: string) => Record<string, unknown>, // optional, default to undefined
})
```

**`className`** is an option to provide custom className other than `remark-container`.

**`containerTag`** is an option to provide custom HTML tag for the container other than `div`.

**`titleElement`** is an option to construct custom _inner title div element_. The default is pre-defined `{ className: string[] }`, so the plugin is going to add an _inner title div element_ as a default. You can provide an object in order to set additional properties for the _inner title div element_. If you set `null`, the plugin is going to remove the _inner title div element_ like below.

```html
<div class="remark-container className">
  Container Body
</div>
```

**`additionalProperties`** is an option to set additional properties for the custom container. It is a callback function that takes the `className` and the `title` as optional arguments and returns the object which is going to be used for adding additional properties into the container.

example:

```markdown
::: warning My Custom Title

my paragraph

:::
```

```javascript
use(container, {
  className: "remark-custom-classname",
  containerTag: "article",
  titleElement: null,
  additionalProperties: (className, title) => {
    title,
    ["data-type"]: className?.toLowerCase(),
  }
})
```

is going to produce the container below:

```html
<article class="remark-custom-classname warning" title="My Custom Title" data-type="warning">
  <p>my paragraph</p>
</article>
```

**Note :** The `containerTag` is not prefered to be a `span` or similar, if there is an inner title `div` element. This may cause a problem because of a `div` element under a `span` element.

[remarkjs]: https://github.com/remarkjs/remark
[536]: https://github.com/remarkjs/remark/pull/536
[vuepress-plugin-container]: https://github.com/vuepress/vuepress-community/tree/main/packages/vuepress-plugin-container
