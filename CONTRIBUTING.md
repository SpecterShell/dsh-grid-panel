# Contributing

[简体中文](<CONTRIBUTING.zh.md>)

For a bug report, include the plugin and DSH versions, browser, reproduction steps and relevant configuration. Screenshots help with layout issues. Remove private session content and credentials before sharing logs. See [the security policy](<SECURITY.md>) for vulnerability reports.

For a larger change, open an issue to discuss the intended behavior before writing it. Keep pull requests focused and describe how you checked the result.

## Development

Use a Node.js version allowed by [the package manifest](<package.json>) and pnpm 12.18.0, matching CI. Install dependencies with `pnpm install --frozen-lockfile`, then run `pnpm run check` before submitting a pull request. This runs typechecking, builds the plugin and runs the tests. CI checks Node.js 22 and 24 and validates the package archive.

The browser plugin entry is [src/index.ts](<src/index.ts>). Build output goes to `lib/`. Edit source files and rebuild instead of editing generated files.

## Layout and locale changes

The host’s CSS-module class names are generated. Locate panel navigation through its structure, accessibility attributes and geometry. Grid styles belong only in the expanded sidebar. The collapsed 56 px rail must keep the host layout.

For a layout change, check expanded and collapsed states, narrow viewports, active and pinned panels, keyboard navigation and focus. Include screenshots and the DSH version you used. Automated tests do not replace checking the plugin in DSH.

Manage the local installation through `dsh plugin`, following [the README](<README.md#install>). Do not edit a profile’s package manifest manually.

Keep the English and Chinese docs aligned when behavior changes. Locale dictionaries live in `locale/`; add new keys to every language and rebuild, since the browser bundle carries them.

## Release artifacts

The [release workflow](<.github/workflows/release.yml>) reuses [CI](<.github/workflows/ci.yml>) for a `v*` tag or a manual run. It uploads the validated package archive as a GitHub Actions artifact retained for 14 days, attests its build provenance, and attaches the archive, the Sigstore bundle and its DSSE envelope to the GitHub release for offline verification. A tag must match the package version exactly, such as `v0.2.0` for version `0.2.0`. On a tag, the workflow also publishes the archive to npm with provenance through trusted publishing, which requires the package to be linked to this repository and workflow on npmjs.com. Manual runs validate and attest without publishing. Update the version and validate the changes before tagging.
