# @spectershell/dsh-grid-panel

[English](<README.md>) · [简体中文](<README.zh.md>)

Ein Plugin für DeepSeek Harness, das die Panel-Starter der globalen Seitenleiste in einem responsiven Raster anordnet.

![Geöffnete Seitenleiste mit Logozeile in einem englischen DSH-0.2.2-rc.1-Profil](<docs/images/sidebar-expanded.en.png>)

## Installation

Erfordert Node.js 22.23.0 oder neuer, pnpm und DSH `>=0.2.1-rc.5 <0.3.0-0`.

```bash
dsh plugin --profile web add @spectershell/dsh-grid-panel
```

Verwende das Profil, das deine Weboberfläche bereitstellt, falls es nicht `web` heißt. Lade die Webseite nach der Installation neu.

## Konfiguration

Auf der Detailseite des Plugins im Plugins-Panel befindet sich ein Einstellungsformular. Änderungen werden beim nächsten Laden der Seite wirksam.

- `minTileSize` (Standard `76`): minimale Kachelbreite in Pixeln, 48 bis 160.
- `compactTileSize` (Standard `68`): minimale Kachelbreite bei Ansichtsbreiten bis 720 px.
- `gap` (Standard `4`): Abstand zwischen den Kacheln in Pixeln, 0 bis 16.
- `labelAlign` (Standard `middle`): vertikale Ausrichtung des Textes. `middle` zentriert den Text im Raum unter dem Symbol, sodass die Textmitten auf einer Linie liegen; `top` hält die ersten Zeilen ausgerichtet.

## Entwicklung

Einmal `pnpm install` ausführen, dann mit `pnpm run check` Typprüfung, Build und Tests laufen lassen, bevor Layout-Änderungen in einem laufenden DSH-Host geprüft werden.

## Lizenz

[MIT](<LICENSE>)
