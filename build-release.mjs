#!/usr/bin/env node

import esbuild from 'esbuild';

const config = {
  entryPoints:  ['src/action.mjs'],
  format:       'esm',
  outdir:       'dist',
  outExtension: { '.js': '.mjs' },
  bundle:       true,
  platform:     'node',
  target:       ['node20'],
  minify:       true,
};

const ctx = await esbuild.context(config);
await ctx.rebuild();
ctx.dispose();
