import { defineConfig } from 'tsup';

export default defineConfig({
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['esm'],
  entryPoints: ['src/index.ts'],
  minify: true,

  target: 'es2018',
});
