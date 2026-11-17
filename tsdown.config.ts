// Two builds: `index` is the host entry with the settings schema and
// config route, and `client` is the CJS bundle wrapped in the
// ModuleLoader.load call that DSH executes in the page.
import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: { index: 'src/host.ts' },
    outDir: 'lib',
    format: 'esm',
    platform: 'node',
    dts: true,
    sourcemap: false,
    clean: true,
    outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  },
  {
    // The installed client entry adds the settings form, whose React and
    // ui-primitives imports resolve from the browser module table.
    entry: { client: 'src/client.ts' },
    outDir: 'lib',
    format: 'cjs',
    inputOptions: { platform: 'browser' },
    external: ['react', 'react/jsx-runtime', '@deepseek-ai/dsh-client-ui-primitives'],
    target: 'chrome120',
    dts: false,
    sourcemap: false,
    clean: false,
    outExtensions: () => ({ js: '.js' }),
    outputOptions: {
      // DSH reconciles this registration against the package name, so the
      // id must match `name` in package.json. A stale id fails client
      // activation with "loaded without registering".
      banner: 'window.__ModuleLoader__.load({ id: "@spectershell/dsh-grid-panel", factory: (require) => {',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
      footer: 'return module.exports; } });',
    },
  },
])
