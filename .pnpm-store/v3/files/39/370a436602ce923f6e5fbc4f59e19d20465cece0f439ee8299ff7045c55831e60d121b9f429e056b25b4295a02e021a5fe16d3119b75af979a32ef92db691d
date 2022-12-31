# remark-smartypants

[remark] plugin to implement [SmartyPants]. Now with 100% more ESM!

```sh
npm install remark-smartypants
```

```js
import remark from 'remark'
import smartypants from 'remakr-smartypants'

const result = await remark()
  .use(smartypants)
  .process('# <<Hello World!>>')

console.log(String(result))
// # «Hello World!»
```

I created this plugin because I wanted to add SmartyPants to [MDX]:

```js
import mdx from '@mdx-js/mdx'
import smartypants from 'remark-smartypants'

const result = await mdx('# <<Hello World!>>', {
  remarkPlugins: [
    smartypants,
  ],
})
```

This plugin uses [retext-smartypants](https://github.com/retextjs/retext-smartypants) under the hood, so it takes the same options:

```js
const result = await remark()
  .use(smartypants, { dashes: 'oldschool' })
  .process('en dash (--), em dash (---)')
```

[remark]: https://remark.js.org
[SmartyPants]: https://daringfireball.net/projects/smartypants
[MDX]: https://mdxjs.com
