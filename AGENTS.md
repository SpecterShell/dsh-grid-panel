- The core sidebar uses generated CSS-module class names, so locate the panel navigation by structure and geometry instead of class selectors.
- Apply the grid only in the expanded sidebar; the 56 px rail must retain the host layout.
- Install through `dsh plugin` and never edit the profile package file manually. Remove old installations once, then install the root package from the checkout root. The repository directory intentionally keeps its old name.

```bash
dsh plugin --profile web remove dsh-sidebar-grid
dsh plugin --profile web remove dsh-grid-panel
dsh plugin --profile web remove dsh-grid-panel-core
dsh plugin --profile web remove dsh-grid-panel-client
dsh plugin --profile web remove @spectershell/dsh-grid-panel
dsh plugin --profile web add "file:$(pwd)"
```
