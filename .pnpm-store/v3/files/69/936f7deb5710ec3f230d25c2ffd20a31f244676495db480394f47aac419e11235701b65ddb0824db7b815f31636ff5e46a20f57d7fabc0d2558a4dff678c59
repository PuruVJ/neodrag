# Astro Service Worker

<blockquote>An Astro integration that generates a Service Worker. Powered by Workbox.</blockquote>

<br />

<a href="https://www.npmjs.com/package/astrojs-service-worker">
  <img src="https://img.shields.io/npm/v/astrojs-service-worker.svg">
</a>
<a href="https://github.com/tatethurston/astrojs-service-worker/blob/main/LICENSE">
  <img src="https://img.shields.io/npm/l/astrojs-service-worker.svg">
</a>
<a href="https://bundlephobia.com/result?p=astrojs-service-worker">
  <img src="https://img.shields.io/bundlephobia/minzip/astrojs-service-worker">
</a>
<a href="https://www.npmjs.com/package/astrojs-service-worker">
  <img src="https://img.shields.io/npm/dy/astrojs-service-worker.svg">
</a>
<a href="https://github.com/tatethurston/astrojs-service-worker/actions/workflows/ci.yml">
  <img src="https://github.com/tatethurston/astrojs-service-worker/actions/workflows/ci.yml/badge.svg">
</a>
<a href="https://codecov.io/gh/tatethurston/astrojs-service-worker">
  <img src="https://img.shields.io/codecov/c/github/tatethurston/astrojs-service-worker/main.svg?style=flat-square">
</a>

## What is this? 🧐

A minimal wrapper around [Workbox](https://developers.google.com/web/tools/workbox) to quickly add a [service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) to your [Astro](https://astro.build/) static site. Get precached pages and offline support out of the box.

## Installation & Usage 📦

1. Add this package to your project:
   - `npm install astrojs-service-worker` or `yarn add astrojs-service-worker`
2. Add `astrojs-service-worker` to your [astro.config.mjs](https://docs.astro.build/en/reference/configuration-reference/) integrations:

```diff
import { defineConfig } from "astro/config";
+ import serviceWorker from "astrojs-service-worker";

export default defineConfig({
+  integrations: [serviceWorker()],
});
```

3. That's it! A service worker that precaches all of your build's static assets will be generated. Page navigations will be served from the service worker's cache instead of making network calls, speeding up your page views and enabling offline viewing 🙌.

_Note that in local development a no-op service worker is generated, otherwise service workers interfere with hot module reloading (because they intercept the request for the updated asset)._

## API Overview 🛠

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
  <td>enableInDevelopment</td>
<td>

Enable the service worker in local development.

The service worker's precaching of static files will prevent hot module reloading during development.

If `false` then the service worker will not be registered and any previously installed service workers will be cleared.

Defaults to `false`. Recommended: `false` for general development, `true` when testing or debugging your application's service worker.

</td>
</td>
  <td>boolean | undefined</td>
</tr>

<tr>
  <td>registration.autoRegister</td>
<td>

Autoregister the service worker.

If `false`, then the application must initialize the service worker by invoking `register`. Set this to `false` if you'd like to take control over when you service worker is initialized. You'll then need to add something like the following to your application:

```javascript
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js");
}
```

Defaults to `true`. Recommended: `true`.

</td>
</td>
  <td>boolean | undefined</td>
</tr>

<tr>
  <td>workbox</td>
<td>
Options passed to `worbox-build`. See all available configuration options [here](https://developer.chrome.com/docs/workbox/modules/workbox-build/)

Defaults to `GenerateSW` which will generate a service worker.

Note: `injectManifest` is not supported at this time. If you would like it to be supported, please [open an issue](https://github.com/tatethurston/astrojs-service-worker/issues/new")

</td>
  <td>InjectManifestOptions | GenerateSWOptions</td>
</tr>
  </tbody>
</table>

## Common Service Worker Pitfalls ⚠️

You must serve your application over HTTPS in production environments. [Service Workers must be served from the site's origin over HTTPS](https://developers.google.com/web/fundamentals/primers/service-workers).

Some browsers special case `localhost`, so this is may not necessary during local development. HTTPS is _not_ handled by this library.

The service worker origin constraint means that service workers can not control pages on a different subdomain. Eg `mysite.com` can not be controlled by a service worker if that was served from a subdomain such as `mycdn.mysite.com`.

## Contributing 👫

PR's and issues welcomed! For more guidance check out [CONTRIBUTING.md](https://github.com/tatethurston/astrojs-service-worker/blob/main/CONTRIBUTING.md)

## Licensing 📃

See the project's [MIT License](https://github.com/tatethurston/astrojs-service-worker/blob/main/LICENSE).
