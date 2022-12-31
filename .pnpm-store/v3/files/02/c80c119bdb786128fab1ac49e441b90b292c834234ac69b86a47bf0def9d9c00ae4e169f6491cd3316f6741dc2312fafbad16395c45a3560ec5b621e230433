# [Prettier](https://prettier.io/) Plugin for [Astro](https://astro.build/)

Official Prettier plugin adding support for formatting `.astro` files

## Installation

```shell
npm i --save-dev prettier-plugin-astro prettier
```

To customize formatting behavior, see the [Configuration](#configuration) section below

## Using with the Prettier CLI

When using the CLI, Prettier will automatically pick up the plugin

```shell
prettier -w .
```

### pnpm support

Due to [an upstream issue in Prettier](https://github.com/prettier/prettier/issues/8056), the `plugin-search-dir` parameter should be set to the current directory when using pnpm or Prettier won't be able to find the plugin automatically

```shell
prettier -w --plugin-search-dir=. .
```

## Using in VS Code

First install the [VS Code Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and add the following settings to your VS Code configuration so VS Code is aware that Prettier can be used for Astro files:

```json
{
  "prettier.documentSelectors": ["**/*.astro"]
}
```

Additionally, you should set Prettier as the default formatter for Astro files or VS Code will ask you to choose a formatter everytime you format since the Astro VS Code extension also includes a formatter for Astro files:

```json
{
  "[astro]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

When submitting issues about formatting in VS Code, first make sure you're actually using Prettier to format your files and not the Astro VS Code extension included formatter

### pnpm support

Due to an upstream issue, Prettier inside VS Code isn't able to automatically infer the right parser to use for Astro files when using pnpm

As such, add the following settings to your `.prettierrc.js` config file:

```js
module.exports = {
  plugins: [require.resolve('prettier-plugin-astro')],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
};
```

The `require.resolve` call can alternatively be changed to a direct path, like such: `plugins: ["./node_modules/prettier-plugin-astro"]` for usage inside a non-JS config file

## Configuration

Most [options from Prettier](https://prettier.io/docs/en/options.html) will work with the plugin and can be set in a [configuration file](https://prettier.io/docs/en/configuration.html) or through [CLI flags](https://prettier.io/docs/en/cli.html).

### Astro Allow Shorthand

Set if attributes with the same name as their expression should be formatted to the short form automatically (for example, if enabled `<element name={name} />` will become simply `<element {name} />`)

> Please note that at the time of writing, [the shorthand form is not currently supported inside the Astro VS Code extension](https://github.com/withastro/language-tools/issues/225)

| Default | CLI Override                     | API Override                  |
| ------- | -------------------------------- | ----------------------------- |
| `false` | `--astro-allow-shorthand <bool>` | `astroAllowShorthand: <bool>` |

### Example `.prettierrc.js`

```js
{
  astroAllowShorthand: false;
}
```

## Contributing

Pull requests of any size and any skill level are welcome, no contribution is too small. Changes to the Astro Prettier Plugin are subject to [Astro Governance](https://github.com/withastro/.github/blob/main/GOVERNANCE.md) and should adhere to the [Astro Style Guide](https://github.com/withastro/astro/blob/main/STYLE_GUIDE.md)

See [CONTRIBUTING.md](./CONTRIBUTING.md) for instructions on how to set up your development environment.

## Sponsors

Astro is generously supported by Netlify, Storyblok, and several other amazing organizations.

[❤️ Sponsor Astro! ❤️](https://github.com/withastro/.github/blob/main/FUNDING.md)

<p align="center">
  <a target="_blank" href="https://github.com/sponsors/withastro">
    <img alt="sponsors" src="https://astro.build/sponsors.png">
  </a>
</p>
