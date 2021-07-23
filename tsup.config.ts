import { defineConfig } from 'tsup';

export default defineConfig({
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['esm', 'cjs'],
  external: [],
  entryPoints: ['src/index.ts'],
  minify: false,
  target: 'es2018',
});
