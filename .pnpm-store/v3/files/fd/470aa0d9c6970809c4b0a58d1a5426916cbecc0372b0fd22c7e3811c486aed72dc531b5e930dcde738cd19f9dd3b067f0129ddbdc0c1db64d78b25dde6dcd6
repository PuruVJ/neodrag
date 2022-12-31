# @vscode/l10n

Library used for loading the translations into subprocesses of your extension. These usages also get picked up by [l10n-dev](https://github.com/microsoft/vscode-l10n/tree/main/l10n-dev) string extraction tooling.

> **Note**
>
> You should _NOT_ use this library in your extension's main process. The translations are loaded into the main process by VS Code itself.

## Usage

```typescript
import { l10n } from '@vscode/l10n';

// Load the translations for the current locale
l10n.config({
    uri: process.env.BUNDLE_URI_FROM_EXTENSION
});

// returns the translated string or the original string if no translation is available
l10n.t('Hello World');

// supports arguments just like the vscode API
l10n.t('Hello {0}', 'John');

// supports comments for translators
l10n.t({
    message: 'Hello {0}',
    args: ['John'],
    comment: ['This is a comment']
});
```
