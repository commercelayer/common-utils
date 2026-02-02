import { defineConfig } from 'tsup'

const env = process.env.NODE_ENV

export default defineConfig(() => ({
  sourcemap: true,
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  minify: true,
  bundle: true,
  watch: env === 'development',
  target: 'es2022',
  entry: ['src/index.ts']
}))
