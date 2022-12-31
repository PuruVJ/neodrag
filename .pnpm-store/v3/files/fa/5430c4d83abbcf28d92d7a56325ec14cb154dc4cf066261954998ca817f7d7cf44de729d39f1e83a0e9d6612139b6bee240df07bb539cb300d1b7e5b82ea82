# [files-pipeline] 🧪

## Installation

First, install the `files-pipeline` component like so:

```
npm install -D -E files-pipeline
```

Then, create a new pipeline from this component:

**`index.ts`**

```ts
import { pipeline } from "files-pipeline";

new pipeline({
	path: "./input/",
});
```

or with the files object:

```ts
import { files } from "files-pipeline";

await new files().in("./input/");
```

## Getting started

The pipeline will now provide you with a process method which you can use to
call the callback on each file from the pipeline.

**`index.ts`**

```ts
import { pipeline } from "files-pipeline";

await new pipeline({
	path: "./input/",
	files: "**/*.md",
	pipeline: {
		// Prepend some content to all of the text files
		wrote: (current) => (current.buffer += "LICENSE [MIT]"),
	},
}).process();
```

or with the files object:

```ts
import { files } from "files-pipeline";
import * as fs from "fs";

await (
	await (await new files().in("./input/")).by("**/*.md")
).pipeline({
	wrote: async (current) => current.buffer,
	read: async (current) =>
		await fs.promises.readFile(current.inputPath, "utf-8"),
	passed: async () => true,
	failed: async (current) =>
		`Error: Cannot process file ${current.inputPath}!`,
	accomplished: async (current) =>
		`Processed ${current.inputPath} in ${current.outputPath}.`,
	fulfilled: async (pipe) =>
		`Successfully processed a total of ${pipe.files} ${
			pipe.files === 1 ? "file" : "files"
		}.`,
	changed: async (pipe) => pipe,
});
```

These are the defaults for each callback.

```ts
import { pipeline } from "files-pipeline";
import * as fs from "fs";

await new pipeline({
	pipeline: {
		wrote: async (current) => current.buffer,
		read: async (current) =>
			await fs.promises.readFile(current.inputPath, "utf-8"),
		passed: async () => true,
		failed: async (inputPath) => `Error: Cannot process file ${inputPath}!`,
		accomplished: async (current) =>
			`Processed ${current.inputPath} in ${current.outputPath}.`,
		fulfilled: async (pipe) =>
			`Successfully processed a total of ${pipe.files} ${
				pipe.files === 1 ? "file" : "files"
			}.`,
		changed: async (pipe) => pipe,
	},
});
```

or with the files object:

```ts
import { files } from "files-pipeline";

await new files().pipeline({
	wrote: async (current) => current.buffer,
	read: async (current) =>
		await fs.promises.readFile(current.inputPath, "utf-8"),
	passed: async () => true,
	failed: async (inputPath) => `Error: Cannot process file ${inputPath}!`,
	accomplished: async (current) =>
		`Processed ${current.inputPath} in ${current.outputPath}.`,
	fulfilled: async (pipe) =>
		`Successfully processed a total of ${pipe.files} ${
			pipe.files === 1 ? "file" : "files"
		}.`,
	changed: async (pipe) => pipe,
});
```

You can add multiple paths to your pipeline by specifying an array as the `path`
variable.

**`index.ts`**

```ts
import { pipeline } from "files-pipeline";

new pipeline({
	path: ["./input/", "./input2/"],
});
```

or with the files object:

```ts
import { files } from "files-pipeline";

await new files().in(["./input/", "./input2/"]);
```

You can also provide a map of paths for different input output directories.

**`index.ts`**

```ts
import { pipeline } from "files-pipeline";

new pipeline({
	path: new Map([["./input", "./output"]]),
});
```

Or an array of the two.

**`index.ts`**

```ts
import { pipeline } from "files-pipeline";

new pipeline({
	path: ["./input", new Map([["./input", "./output"]])],
});
```

or with the files object:

```ts
import { files } from "files-pipeline";

new files().in(["./input", new Map([["./input", "./output"]])]);
```

You can provide a filter to exclude files from your pipeline. A filter can be an
array of regexes or a single match. You can use functions, as well to match on
file names.

**`index.ts`**

```ts
import { pipeline } from "files-pipeline";

new pipeline({
	exclude: [
		"my-awesome.file",
		(file: string) =>
			file === "./input/this-file-will-not-be-processed.txt",
	],
});
```

or with the files object:

```ts
import { files } from "files-pipeline";

await new files().not([
	"my-awesome.file",
	(file: string) => file === "./input/this-file-will-not-be-processed.txt",
]);
```

Set `logger` to `0` if you do not want to see debug messages. Default is `2`.

**`index.ts`**

```ts
import { pipeline } from "files-pipeline";

new pipeline({
	logger: 0,
});
```

or with the files object:

```ts
import { files } from "files-pipeline";

new files(0);
```

[files-pipeline]: https://npmjs.org/files-pipeline

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a history of changes to this component.

[![Lightrix logo](https://raw.githubusercontent.com/Lightrix/npm/main/.github/img/favicon.png "Built with Lightrix/npm")](https://github.com/Lightrix/npm)
