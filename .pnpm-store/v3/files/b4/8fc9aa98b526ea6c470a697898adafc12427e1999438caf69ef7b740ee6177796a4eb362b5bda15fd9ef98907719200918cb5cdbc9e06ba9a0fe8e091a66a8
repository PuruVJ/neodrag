![Astro SEO Logo](https://user-images.githubusercontent.com/5182256/131216951-8f74f425-f775-463d-a11b-0e01ad9fce8d.png)

# 🚀 Astro SEO

This [Astro](https://astro.build/) component makes it easy to add tags that are
relevant for search engine optimization (SEO) to your pages.

The ultimate goal is to make this the one-stop shop for most of your SEO needs when developing Astro sites.

Pull requests and/or feature requests are very welcome!

## How To Use

In any of your Astro pages, import Astro SEO and then use the component inside
the `<head>` section of your HTML:

```astro
---
import { SEO } from "astro-seo";
---

<html lang="en">
  <head>
    <SEO
      title="A Very Descriptive Title"
      description="A heavily optimized description full of well-researched keywords."
      openGraph={{
        basic: {
          title="A Very Descriptive Title"
        }
      }}
      twitter={{
        creator: "@jonasmerlins1"
      }}
      extend={{
        // extending the default link tags
        link: [{ rel: "icon", href: "/favicon.ico" }],
        // extending the default meta tags
        meta: [
          {
            name: "twitter:image",
            content: "https://user-images.githubusercontent.com/5182256/131216951-8f74f425-f775-463d-a11b-0e01ad9fce8d.png",
          },
          { name: "twitter:title", content: "Tinker Tailor Soldier Spy" },
          { name: "twitter:description", content: "Agent" },
        ],
      }}
    />
  </head>
  // ... rest of <head>
    <body> // ... body </body>
  </head></html>
```

## Supported Props

Propname | Type | Description
------------ | ------------- | -------------
title | string | The title of the page.
description | string | Text that gives a concise description of what your page is about.
canonical | string | Prevent duplicate content issues by specifying the "canonical" or "preferred" url of a web page. If you don't define this, `Astro.request.url.href` will be used as the default value.
noindex | boolean | Set this to true if you don't want search engines to index your page. Since this is an SEO component, this gets set to `false` by default. This way, indexing is strictly opt-out.
nofollow | boolean | Set this to true if you don't want search engines to follow links on your page. Since this is an SEO component, this gets set to `false` by default. This way, following links is strictly opt-out.
charset | string | Set the charset of the document. In almost all cases this should be UTF-8.
openGraph.basic.title | string | Set the title Open Graph should use. __In most situations, this should be _different_ from the value of the `title` prop.__ See [this tweet](https://twitter.com/jon_neal/status/1428721238071988237) to gain an understanding of the difference between the two. If you define this, you must define two other OG basic properties as well: `type` and `image`. ([Learn more.](https://ogp.me/#metadata))
openGraph.basic.type | string | Set the [type](https://ogp.me/#types) Open Graph should use. If you define this, you must define two other OG basic properties as well: `title` and `image`. ([Learn more.](https://ogp.me/#metadata))
openGraph.basic.image | string | URL of the image that should be used in social media previews. If you define this, you must define two other OG basic properties as well: `title` and `type`. ([Learn more.](https://ogp.me/#metadata))
openGraph.basic.url | string | The canonical URL of your object that will be used as its permanent ID in the graph. Most likely either the url of the page or its canonical url (see above). If you define this, you must define the other 3 OG basic properties as well: `title`, `type` and `image`. ([Learn more.](https://ogp.me/#metadata)). If you define the other 3 OG basic properties but don't define this, `Astro.request.url.href` will be used as the default value.
openGraph.optional.audio | string | A URL to an audio file to accompany this object.
openGraph.optional.description | string | A one to two sentence description of your object.
openGraph.optional.determiner | string | The word that appears before this object's title in a sentence. An enum of (a, an, the, "", auto). If auto is chosen, the consumer of your data should chose between "a" or "an". Default is "" (blank).
openGraph.optional.locale | string | The locale these tags are marked up in. Of the format language_TERRITORY. Default is en_US.
openGraph.optional.localeAlternate | Array<string> | An array of other locales this page is available in.
openGraph.optional.siteName | string | If your object is part of a larger web site, the name which should be displayed for the overall site. e.g., "IMDb".
openGraph.optional.video | string | A URL to a video file that complements this object.
openGraph.image.url | string | For now, setting this is ignored. This is done because `og:image:url` is supposed to be identical to `og:image`. If you have a use case where it makes sense for these to be different, please feel free to contact me, and tell me about it and I will consider adding it. Until then, in the interest of enforcing best practices, the value of this property will be ignored and `og:image:url` set to the value of `openGraph.basic.image`.
openGraph.image.secureUrl | string | Sets `og:image:secure_url`: An alternate url to use if the webpage requires HTTPS.
openGraph.image.type | string | Sets `og:image:type`. A MIME type for the image. e.g. "image/jpeg"
openGraph.image.width | number | Sets `og:image:width`. The number of pixels wide.
openGraph.image.height | number | Sets `og:image:height`. The number of pixels high.
openGraph.image.alt | string | Sets `og:image:alt`. A description of what is in the image (not a caption). __If the page specifies `openGraph.basic.image` it should specify `openGraph.image.alt`__.
openGraph.article.publishedTime | string | Sets `article:published_time`. The date the article was published. Must be a ISO 8601 DateTime string.
openGraph.article.modifiedTime | string | Sets `article:modified_time`. The date the article was last modified. Must be a ISO 8601 DateTime string.
openGraph.article.expirationTime | string | Sets `article:expiration_time`. The date the article will no longer be relevant. Must be a ISO 8601 DateTime string.
openGraph.article.author | string[] | Sets `article:author`. The author(s) of the article, if it's only one, pass an array with one entry. If there are multiple, multiple tags with descending relevance will be created.
openGraph.article.section | string | Sets `article:section`. A high-level section name. E.g. Technology
openGraph.article.tags | string[] | Sets `article:tag`. Tag words associated with this article. If it's only one, pass an array with one entry. If there are multiple, multiple tags with descending relevance will be created.
twitter.card | string | Sets `twitter:card`. The card type, which will be one of “summary”, “summary_large_image”, “app”, or “player”.
twitter.site | string | Sets `twitter:site`. (Twitter) @username for the website used in the card footer.
twitter.creator | string | Sets `twitter:creator`. (Twitter) @username for the content creator / author.
extend.link | Array<Link extends HTMLLinkElement { prefetch: boolean; }> | An array of free-form `<link>` you'd like to define.
extend.meta | Array<Meta extends HTMLMetaElement { property: string; }> | An array of free-form `<meta>` tags you'd like to define.

## Extending Astro SEO

With the `v0.3.14` release, you can now define any `<meta>` and `<link>` tag you want using the `extend` prop. For example :

```js
<SEO
  extend={{
    // extending the default link tags
    link: [{ rel: "icon", href: "/favicon.ico" }],
    // extending the default meta tags
    meta: [
      {
        name: "twitter:image",
        content:
          "https://user-images.githubusercontent.com/5182256/131216951-8f74f425-f775-463d-a11b-0e01ad9fce8d.png",
      },
      { name: "twitter:title", content: "Tinker Tailor Soldier Spy" },
      { name: "twitter:description", content: "Agent" },
    ],
  }}
/>
```

## Open Graph

Open Graph properties are passed as one object to the prop `openGraph`. The structure of this object is modeled after the [Open Graph documentation](https://ogp.me/) itself. That means it uses nested objects to differentiate between basic and optional properties, as well as object specific ones. __If you pass an openGraph config, you _must_ define all 4 of the basic properties (`title`, `type`, `image` and `url`).__ The optional properties are all ... well, optional.

```typescript
// TypeScript interface of openGraph prop
openGraph?: {
  basic: {
    title: string;
    type: string;
    image: string;
    url: string;
  },
  optional?: {
    audio?: string;
    description?: string;
    determiner?: string;
    locale?: string;
    localeAlternate?: Array<string>;
    siteName?: string;
    video?: string;
  }
}
```

## Goals

Our first goal for this project is to support the most-used tags that are
relevant for SEO. That includes the most-used open graph tags.

After that comes feature-parity with Next SEO. After _that_ ... we'll see.

## What does this component do, exactly?

There's certainly no magic to what Astro SEO does. Basically, it bundles the
creation of regular SEO-relevant HTML tags inside one component that you can
then use inside your page's `<head>` tag.

The translation between props and tags is pretty direct and almost 1:1. After
building, there probably won't be anything you wouldn't have written yourself.
The idea is to surface the options that exist in a central place and adhere to
best practices where it's theoretically possible not to. __If you want to see
how the sausage gets made, there's only one place you will have to check__:
`/src/SEO.astro`

If you want, you can view Astro SEO as a checklist, so you don't forget a tag.
Or maybe also as an educational tool, to see which options exist in the first
place.

## Acknowledgements

Astro SEO is _heavily_ inspired by [Next SEO](https://github.com/garmeeh/next-seo)
and all the amazing work Gary is doing developing it. Thanks Gary! ❤️
