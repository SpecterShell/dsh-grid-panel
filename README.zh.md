# @spectershell/dsh-grid-panel

[English](<README.md>) · [Deutsch](<README.de.md>)

一个把 DeepSeek Harness 全局侧边栏的面板入口排成响应式网格的插件。

![全新 DSH 0.2.2-rc.1 配置环境中包含徽标行的展开侧边栏](<docs/images/sidebar-expanded.png>)

## 安装

需要 Node.js 22.23.0 或更高版本、pnpm，以及 DSH `>=0.2.1-rc.5 <0.3.0-0`。

```bash
dsh plugin --profile web add @spectershell/dsh-grid-panel
```

如果 Web 界面使用的配置环境不叫 `web`，请替换该名称。安装后刷新页面即可生效。

## 配置

插件安装后，在插件面板打开本插件的详情页即可看到设置表单，改动将在下次加载页面时生效。

- `minTileSize`（默认 `76`）：最小单元宽度，48 至 160，单位为像素。
- `compactTileSize`（默认 `68`）：视口宽度不超过 720 px 时的最小单元宽度。
- `gap`（默认 `4`）：单元间距，0 至 16，单位为像素。
- `labelAlign`（默认 `middle`）：标签对齐方式。`middle` 让标签在图标下方的空间里居中，各单元的文字中线对齐；`top` 保持首行对齐。

## 开发

先运行一次 `pnpm install`，之后用 `pnpm run check` 完成类型检查、构建和测试，布局改动还需在运行中的 DSH 宿主里验证。

## 许可证

[MIT](<LICENSE>)
