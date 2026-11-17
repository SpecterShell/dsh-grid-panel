# @spectershell/dsh-grid-panel

[简体中文](<README.zh.md>) · [Deutsch](<README.de.md>)

A plugin for DeepSeek Harness that arranges global sidebar panel launchers in a responsive grid.

![Expanded sidebar with logo row in an English DSH 0.2.2-rc.1 profile](<docs/images/sidebar-expanded.en.png>)

## Install

Requires Node.js 22.23.0 or later, pnpm and DSH `>=0.2.1-rc.5 <0.3.0-0`.

```bash
dsh plugin --profile web add @spectershell/dsh-grid-panel
```

Use the profile that serves your Web UI if it is not named `web`. Refresh the Web page after installation.

## Configuration

The plugin's detail page on the Plugins panel carries a settings form while the plugin is installed. The changes apply the next time the page loads.

- `minTileSize` (default `76`): minimum tile width in pixels, 48 to 160.
- `compactTileSize` (default `68`): minimum tile width at viewport widths of 720 px or less.
- `gap` (default `4`): space between tiles in pixels, 0 to 16.
- `labelAlign` (default `middle`): label placement. `middle` centers the label in the space below the icon so text middles line up; `top` keeps first lines aligned.

## Development

Run `pnpm install` once, then `pnpm run check` to typecheck, build and test the plugin before verifying layout changes in a running DSH host.

## License

[MIT](<LICENSE>)
