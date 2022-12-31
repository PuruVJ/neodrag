import { join } from 'path';

import { CacheStrategy, clearCache, tsconfigResolverSync } from '..';

const processCwd = jest.spyOn(process, 'cwd');
const fixtures = (...paths: string[]) =>
  join(__dirname, '__fixtures__', ...paths);

afterEach(clearCache);

describe('resolver', () => {
  beforeEach(() => {
    processCwd.mockReturnValue(fixtures('basic'));
  });

  it('resolves the tsconfig by default', () => {
    const { exists, config, path } = tsconfigResolverSync();

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

  it('resolves from a sub directory', () => {
    processCwd.mockReturnValue(fixtures('basic', 'subdir'));

    const { exists, config, path } = tsconfigResolverSync();

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

  it('resolves with a custom `searchName`', () => {
    const { exists, config, path } = tsconfigResolverSync({
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

  it('appends `tsconfig.json` when `searchName` is a directory', () => {
    const result = tsconfigResolverSync({ searchName: 'cachedir' });

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

  it('properly resolves invalid json', () => {
    const { exists, reason } = tsconfigResolverSync({
      searchName: 'tsconfig.invalid.json',
    });

    expect(exists).toBe(false);
    expect(reason).toBe('invalid-config');
  });

  it('properly resolves missing config', () => {
    const { exists, reason } = tsconfigResolverSync({
      searchName: 'tsconfig.missing.json',
    });

    expect(exists).toBe(false);
    expect(reason).toBe('not-found');
  });

  it('returns the config found by a custom `filePath`', () => {
    const result = tsconfigResolverSync({
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

  it('defaults to `tsconfig.json` when `filePath` is a directory', () => {
    const result = tsconfigResolverSync({
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

  it('allows `filePath` to be prefixed with `npm:` for npm packages', () => {
    const result = tsconfigResolverSync({
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

  it('extends a base config', () => {
    const { config } = tsconfigResolverSync();

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

  it('extends and resolves paths', () => {
    const { config, extendedPaths } = tsconfigResolverSync({
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

  it('extends from npm', () => {
    const { config, extendedPaths } = tsconfigResolverSync({
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

  it('can ignore extends', () => {
    const { config, extendedPaths } = tsconfigResolverSync({
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

  it('supports nested extends', () => {
    const { config, extendedPaths } = tsconfigResolverSync({
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

  it('handles `circular` extends', () => {
    const { config, extendedPaths, isCircular } = tsconfigResolverSync({
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

  it('supports searchName caching', () => {
    const result1 = tsconfigResolverSync({
      cache: CacheStrategy.Always,
    });
    const result2 = tsconfigResolverSync({
      cwd: fixtures('basic', 'cachedir'),
      cache: CacheStrategy.Always,
    });
    const result3 = tsconfigResolverSync({
      cache: CacheStrategy.Always,
      searchName: 'fake',
    });
    expect(result1).toBe(result2);
    expect(result3).not.toBe(result2);
  });

  it('support directory caching', () => {
    const result1 = tsconfigResolverSync({
      cache: CacheStrategy.Directory,
    });
    const result2 = tsconfigResolverSync({
      cwd: fixtures('basic', 'subdir'),
      cache: CacheStrategy.Directory,
    });
    const result3 = tsconfigResolverSync({
      cache: CacheStrategy.Directory,
    });
    const result4 = tsconfigResolverSync({
      cache: CacheStrategy.Directory,
      searchName: 'fake',
    });

    expect(result1).not.toBe(result2);
    expect(result3).toBe(result1);
    expect(result4).not.toBe(result1);
  });

  it('caches by default when using a filePath', () => {
    const result1 = tsconfigResolverSync({
      filePath: 'cachedir/tsconfig.json',
    });
    const result2 = tsconfigResolverSync({
      cwd: fixtures('basic', 'subdir'),
      filePath: 'cachedir/tsconfig.json',
    });

    expect(result1).toBe(result2);
  });

  it('separates cache by `ignoreExtends` property', () => {
    const result1 = tsconfigResolverSync({
      cache: CacheStrategy.Always,
    });

    const result2 = tsconfigResolverSync({
      ignoreExtends: true,
      cache: CacheStrategy.Always,
    });

    expect(result1).not.toBe(result2);
  });

  it('supports clearing the cache', () => {
    const result1 = tsconfigResolverSync({
      cache: CacheStrategy.Always,
    });

    clearCache();

    const result2 = tsconfigResolverSync({
      cache: CacheStrategy.Always,
    });

    expect(result1).not.toBe(result2);
    expect(result1).toEqual(result2);
  });
});
