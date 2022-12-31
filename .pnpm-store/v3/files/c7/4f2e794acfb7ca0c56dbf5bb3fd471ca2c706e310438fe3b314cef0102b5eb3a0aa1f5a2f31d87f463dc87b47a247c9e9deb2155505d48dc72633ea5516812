import { join } from 'path';

import { CacheStrategy, clearCache, tsconfigResolver } from '..';

const processCwd = jest.spyOn(process, 'cwd');
const fixtures = (...paths: string[]) =>
  join(__dirname, '__fixtures__', ...paths);

afterEach(clearCache);

describe('resolver', () => {
  beforeEach(() => {
    processCwd.mockReturnValue(fixtures('basic'));
  });

  it('resolves the tsconfig by default', async () => {
    const { exists, config, path } = await tsconfigResolver();

    expect(path?.endsWith('__fixtures__/basic/tsconfig.json')).toBe(true);
    expect(exists).toBe(true);
    expect(config).toMatchInlineSnapshot(`
          Object {
            "compilerOptions": Object {
              "jsx": "preserve",
            },
          }
      `);
  });

  it('resolves from a sub directory', async () => {
    processCwd.mockReturnValue(fixtures('basic', 'subdir'));

    const { exists, config, path } = await tsconfigResolver();

    expect(path?.endsWith('__fixtures__/basic/tsconfig.json')).toBe(true);
    expect(exists).toBe(true);
    expect(config).toMatchInlineSnapshot(`
          Object {
            "compilerOptions": Object {
              "jsx": "preserve",
            },
          }
      `);
  });

  it('resolves with a custom `searchName`', async () => {
    const { exists, config, path } = await tsconfigResolver({
      searchName: 'tsconfig.alt.json',
    });

    expect(path?.endsWith('__fixtures__/basic/tsconfig.alt.json')).toBe(true);
    expect(exists).toBe(true);
    expect(config).toMatchInlineSnapshot(`
      Object {
        "compilerOptions": Object {
          "jsx": "react",
        },
      }
    `);
  });

  it('appends `tsconfig.json` when `searchName` is a directory', async () => {
    const result = await tsconfigResolver({ searchName: 'cachedir' });

    expect(
      result.path?.endsWith('__fixtures__/basic/cachedir/tsconfig.json'),
    ).toBe(true);
    expect(result.config).toMatchInlineSnapshot(`
      Object {
        "compilerOptions": Object {
          "alwaysStrict": true,
        },
      }
    `);
  });

  it('properly resolves invalid json', async () => {
    const { exists, reason } = await tsconfigResolver({
      searchName: 'tsconfig.invalid.json',
    });

    expect(exists).toBe(false);
    expect(reason).toBe('invalid-config');
  });

  it('properly resolves missing config', async () => {
    const { exists, reason } = await tsconfigResolver({
      searchName: 'tsconfig.missing.json',
    });

    expect(exists).toBe(false);
    expect(reason).toBe('not-found');
  });

  it('returns the config found by a custom `filePath`', async () => {
    const result = await tsconfigResolver({
      filePath: 'specific/custom.json',
    });

    expect(
      result.path?.endsWith('__fixtures__/basic/specific/custom.json'),
    ).toBe(true);
    expect(result.config).toMatchInlineSnapshot(`
      Object {
        "custom": "yes",
      }
    `);
  });

  it('defaults to `tsconfig.json` when `filePath` is a directory', async () => {
    const result = await tsconfigResolver({
      filePath: './specific',
    });

    expect(
      result.path?.endsWith('__fixtures__/basic/specific/tsconfig.json'),
    ).toBe(true);
    expect(result.config).toMatchInlineSnapshot(`
      Object {
        "compilerOptions": Object {
          "baseUrl": "specific",
        },
      }
    `);
  });

  it('allows `filePath` to be prefixed with `npm:` for npm packages', async () => {
    const result = await tsconfigResolver({
      filePath: 'npm:@sindresorhus/tsconfig',
    });

    expect(result.config).toMatchInlineSnapshot(`
      Object {
        "compilerOptions": Object {
          "declaration": true,
          "forceConsistentCasingInFileNames": true,
          "jsx": "react",
          "module": "commonjs",
          "moduleResolution": "node",
          "newLine": "lf",
          "noEmitOnError": true,
          "noFallthroughCasesInSwitch": true,
          "noImplicitReturns": true,
          "noUnusedLocals": true,
          "noUnusedParameters": true,
          "pretty": true,
          "resolveJsonModule": true,
          "skipLibCheck": true,
          "strict": true,
          "stripInternal": true,
          "target": "es2017",
        },
      }
    `);
  });
});

describe('extends', () => {
  beforeEach(() => {
    processCwd.mockReturnValue(fixtures('extends'));
  });

  it('extends a base config', async () => {
    const { config } = await tsconfigResolver();

    expect(config).toMatchInlineSnapshot(`
      Object {
        "compilerOptions": Object {
          "allowJs": false,
          "baseUrl": "./",
          "paths": Object {
            "simple": Array [
              "./simple",
            ],
          },
        },
        "extends": "./base.tsconfig.json",
      }
    `);
  });

  it('extends and resolves paths', async () => {
    const { config, extendedPaths } = await tsconfigResolver({
      searchName: 'tsconfig.paths.json',
    });

    expect(extendedPaths).toEqual([
      fixtures('extends', './base.tsconfig.json'),
    ]);

    expect(config).toMatchInlineSnapshot(`
      Object {
        "compilerOptions": Object {
          "allowJs": false,
          "baseUrl": "./",
          "paths": Object {},
        },
        "extends": "./base.tsconfig.json",
      }
    `);
  });

  it('extends from npm', async () => {
    const { config, extendedPaths } = await tsconfigResolver({
      searchName: 'tsconfig.npm.json',
    });

    expect(extendedPaths).toEqual([require.resolve('@sindresorhus/tsconfig')]);

    expect(config).toMatchInlineSnapshot(`
      Object {
        "compilerOptions": Object {
          "declaration": true,
          "forceConsistentCasingInFileNames": true,
          "jsx": "react",
          "module": "commonjs",
          "moduleResolution": "node",
          "newLine": "lf",
          "noEmitOnError": true,
          "noFallthroughCasesInSwitch": true,
          "noImplicitReturns": true,
          "noUnusedLocals": true,
          "noUnusedParameters": true,
          "pretty": true,
          "resolveJsonModule": true,
          "skipLibCheck": true,
          "strict": true,
          "stripInternal": true,
          "target": "es2017",
        },
        "extends": "@sindresorhus/tsconfig",
      }
    `);
  });

  it('can ignore extends', async () => {
    const { config, extendedPaths } = await tsconfigResolver({
      searchName: 'tsconfig.npm.json',
      ignoreExtends: true,
    });

    expect(extendedPaths).toEqual([]);

    expect(config).toMatchInlineSnapshot(`
      Object {
        "extends": "@sindresorhus/tsconfig",
      }
    `);
  });

  it('supports nested extends', async () => {
    const { config, extendedPaths } = await tsconfigResolver({
      cwd: fixtures('extends', 'nested'),
    });

    expect(extendedPaths).toEqual([
      fixtures('extends', 'tsconfig.paths.json'),
      fixtures('extends', 'base.tsconfig.json'),
    ]);

    expect(config).toMatchInlineSnapshot(`
      Object {
        "compilerOptions": Object {
          "allowJs": false,
          "baseUrl": "simple",
          "paths": Object {
            "b": Array [
              "./b",
            ],
            "g": Array [
              "./g",
            ],
          },
        },
        "extends": "../tsconfig.paths.json",
      }
    `);
  });

  it('handles `circular` extends', async () => {
    const { config, extendedPaths, isCircular } = await tsconfigResolver({
      searchName: 'circular.tsconfig.json',
    });

    expect(extendedPaths).toEqual([
      fixtures('extends', 'circular2.tsconfig.json'),
      fixtures('extends', 'circular.tsconfig.json'),
    ]);

    expect(isCircular).toBe(true);
    expect(config).toMatchInlineSnapshot(`
      Object {
        "compilerOptions": Object {
          "allowJs": true,
          "baseUrl": "oops",
        },
        "extends": "./circular2.tsconfig.json",
      }
    `);
  });
});

describe('caching', () => {
  beforeEach(() => {
    processCwd.mockReturnValue(fixtures('basic'));
  });

  it('supports searchName caching', async () => {
    const result1 = await tsconfigResolver({
      cache: CacheStrategy.Always,
    });
    const result2 = await tsconfigResolver({
      cwd: fixtures('basic', 'cachedir'),
      cache: CacheStrategy.Always,
    });
    const result3 = await tsconfigResolver({
      cache: CacheStrategy.Always,
      searchName: 'fake',
    });
    expect(result1).toBe(result2);
    expect(result3).not.toBe(result2);
  });

  it('support directory caching', async () => {
    const result1 = await tsconfigResolver({
      cache: CacheStrategy.Directory,
    });
    const result2 = await tsconfigResolver({
      cwd: fixtures('basic', 'subdir'),
      cache: CacheStrategy.Directory,
    });
    const result3 = await tsconfigResolver({
      cache: CacheStrategy.Directory,
    });
    const result4 = await tsconfigResolver({
      cache: CacheStrategy.Directory,
      searchName: 'fake',
    });

    expect(result1).not.toBe(result2);
    expect(result3).toBe(result1);
    expect(result4).not.toBe(result1);
  });

  it('caches by default when using a filePath', async () => {
    const result1 = await tsconfigResolver({
      filePath: 'cachedir/tsconfig.json',
    });
    const result2 = await tsconfigResolver({
      cwd: fixtures('basic', 'subdir'),
      filePath: 'cachedir/tsconfig.json',
    });

    expect(result1).toBe(result2);
  });

  it('separates cache by `ignoreExtends` property', async () => {
    const result1 = await tsconfigResolver({
      cache: CacheStrategy.Always,
    });

    const result2 = await tsconfigResolver({
      ignoreExtends: true,
      cache: CacheStrategy.Always,
    });

    expect(result1).not.toBe(result2);
  });

  it('supports clearing the cache', async () => {
    const result1 = await tsconfigResolver({
      cache: CacheStrategy.Always,
    });

    clearCache();

    const result2 = await tsconfigResolver({
      cache: CacheStrategy.Always,
    });

    expect(result1).not.toBe(result2);
    expect(result1).toEqual(result2);
  });
});
