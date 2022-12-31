# Iconify icon sets in JSON format

This is collection of SVG icons created by various authors, released under various free licenses. Some collections require attribution when used for commercial purposes. See [collections.md](./collections.md) for list of collections and their licenses.

All icons have been normalized:

- Cleaned up, removing anything that is not needed to show icon.
- Colors for monotone icons have been replaced with `currentColor`, making it easy to change icon color by changing text color.
- Icon content has been optimised to reduce its size.

Repository is updated 3 times a week by fully automated script, so it always contains latest icons from various sources.

## Format and usage

Icon sets are stored in `IconifyJSON` format. TypeScript definition is available in `@iconify/types` package. Documentation is [available on Iconify Documentation website](https://docs.iconify.design/types/iconify-json.html).

To work with icon sets, use [Iconify Utils](https://docs.iconify.design/tools/utils/). Utils package works in any JavaScript environment: Node.js, Deno, browsers, isolated JavaScript environments. For PHP applications use [Iconify JSON Tools](https://docs.iconify.design/tools/json/).

To create icon sets, use [Iconify Tools](https://docs.iconify.design/tools/tools2/). Tools package works in Node.js, it can import icons from various sources, do cleanup, optimisation, export it in `IconifyJSON` format and generate NPM packages.

## How to get this repository

Instructions below are for Node.js and PHP projects.

### Node.js

Run this command to add icons to your project:

```bash
npm install --save @iconify/json
```

Icons will be available in node_modules/@iconify/json

To resolve filename for any json file, use this if you are using CommonJS syntax:

```js
import { locate } from '@iconify/json';

// returns location of mdi-light.json
const mdiLightFilename = locate('mdi-light');
```

### PHP

Install and initialize Composer project. See documentation at [https://getcomposer.org](https://getcomposer.org)

Then open composer.json and add following code:

```json
"require": {
    "php": ">=5.6",
    "iconify/json": "*"
}
```

then run:

```bash
composer install
```

Icons will be available in vendor/iconify/json/

If you don't use Composer, clone GitHub repository and add necessary autoload code.

To resolve filename for any json file, use this:

```php
// Returns location of mdi-light.json
$mdiLightLocation = \Iconify\IconsJSON\Finder::locate('mdi-light');
```

## Data format

Icons used by Iconify are in directory json, in Iconify JSON format.

Why JSON instead of SVG? There are several reasons for that:

- Easy to store images in bulk.
- Contains only content of icon without SVG element, making it easy to manipulate content without doing complex parsing. It also makes it easier to create components, such as React icon component, allowing to use framework native SVG element.
- Data can contain additional content: aliases for icons, icon set information, categories/tags/themes.

Why not XML?

- JSON is much easier to parse without additional tools. All languages support it.

Format of json file is very simple:

```json
{
  "prefix": "mdi-light",
  "icons": {
    "icon-name": {
      "body": "<g />",
      "width": 24,
      "height": 24
    }
  },
  "aliases": {
    "icon-alias": {
      "parent": "icon-name"
    }
  }
}
```

"icons" object contains list of all icons.

Each icon has following properties:

- body: icon body.
- left, top: left and top coordinates of viewBox, default is 0.
- width, height: dimensions of viewBox, default is 16.
- rotate: rotation. Default = 0. Values: 0 = 0deg, 1 = 90deg, 2 = 180deg, 3 = 270deg.
- hFlip: horizontal flip. Boolean value, default = false.
- vFlip: vertical flip. Boolean value, default = false.
- hidden: if set to true, icon is hidden. That means icon was removed from collection for some reason, but it is kept in JSON file to prevent applications that rely on old icon from breaking.

Optional "aliases" object contains list of aliases for icons. Format is similar to "icons" object, but without "body" property and with additional property "parent" that points to parent icon. Transformation properties (rotate, hFlip, vFlip) are merged with parent icon's properties. Any other properties overwrite properties of parent icon.

When multiple icons have the same value, it is moved to root object to reduce duplication:

```json
{
  "prefix": "mdi-light",
  "icons": {
    "icon1": {
      "body": "<g />"
    },
    "icon2": {
      "body": "<g />"
    },
    "icon-20": {
      "body": "<g />",
      "width": 20,
      "height": 20
    }
  },
  "width": 24,
  "height": 24
}
```

In example above, "icon1" and "icon2" are 24x24, "icon-20" is 20x20.

For more information see developer documentation on [https://docs.iconify.design/types/iconify-json.html](https://docs.iconify.design/types/iconify-json.html)

## Extracting individual SVG icons

For PHP use [Iconify JSON Tools](https://docs.iconify.design/tools/json/).

For JavaScript use [Iconify Utils](https://docs.iconify.design/tools/utils/), though Iconify JSON Tools are also available (but deprecated).

Example using Iconify Utils (TypeScript):

```ts
import { promises as fs } from 'fs';

// Function to locate JSON file
import { locate } from '@iconify/json';

// Various functions from Iconify Utils
import { parseIconSet } from '@iconify/utils/lib/icon-set/parse';
import { iconToSVG } from '@iconify/utils/lib/svg/build';
import { defaults } from '@iconify/utils/lib/customisations';

(async () => {
  // Locate icons
  const filename = locate('mdi');

  // Load icon set
  const icons = JSON.parse(await fs.readFile(filename, 'utf8'));

  // Parse all icons
  const exportedSVG: Record<string, string> = Object.create(null);
  parseIconSet(icons, (iconName, iconData) => {
    if (!iconData) {
      // Invalid icon
      console.error(`Error parsing icon ${iconName}`);
      return;
    }

    // Render icon
    const renderData = iconToSVG(iconData, {
      ...defaults,
      height: 'auto',
    });

    // Generate attributes for SVG element
    const svgAttributes: Record<string, string> = {
      'xmlns': 'http://www.w3.org/2000/svg',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
      ...renderData.attributes,
    };
    const svgAttributesStr = Object.keys(svgAttributes)
      .map(
        (attr) =>
          // No need to check attributes for special characters, such as quotes,
          // they cannot contain anything that needs escaping.
          `${attr}="${svgAttributes[attr as keyof typeof svgAttributes]}"`
      )
      .join(' ');

    // Generate SVG
    const svg = `<svg ${svgAttributesStr}>${renderData.body}</svg>`;
    exportedSVG[iconName] = svg;
  });

  // Output directory
  const outputDir = 'mdi-export';
  try {
    await fs.mkdir(outputDir, {
      recursive: true,
    });
  } catch (err) {
    //
  }

  // Save all files
  const filenames = Object.keys(exportedSVG);
  for (let i = 0; i < filenames.length; i++) {
    const filename = filenames[i];
    const svg = exportedSVG[filename];
    await fs.writeFile(outputDir + '/' + filename + '.svg', svg, 'utf8');
  }
})();
```

Example using Iconify JSON Tools:

```js
const fs = require('fs');
const { SVG, Collection } = require('@iconify/json-tools');

const outputDir = 'mdi-export';
try {
  fs.mkdirSync(outputDir, {
    recursive: true,
  });
} catch (err) {
  //
}

const collection = new Collection();
collection.loadIconifyCollection('mdi');
collection.listIcons(true).forEach((icon) => {
  let svg = new SVG(collection.getIconData(icon));
  fs.writeFileSync(
    outputDir + '/' + icon + '.svg',
    svg.getSVG({
      height: 'auto',
    })
  );
});
```

```php
use \Iconify\JSONTools\Collection;
use \Iconify\JSONTools\SVG;

$outputDir = 'mdi-export';
@mkdir($outputDir, 0777, true);

$collection = new Collection();
$collection->loadIconifyCollection('mdi');
foreach ($collection->listIcons(true) as $icon) {
    $svg = new SVG($collection->getIconData($icon));
    file_put_contents($outputDir . '/' . $icon . '.svg', $svg->getSVG([
        'height'    => 'auto'
    ]));
}
```

## License

This is collection of works by various authors, not original collection.

See [collections.md](./collections.md) for list of collections and their licenses.
