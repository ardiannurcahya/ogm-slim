import { themeCss } from '../styles/theme.css.js';
import { renderHeader } from '../components/header.component.js';
import { renderToolbar } from '../components/toolbar.component.js';
import { renderSymbolExplorer } from '../components/explorer.component.js';
import { renderGraphCanvas } from '../components/canvas.component.js';
import { renderContractInspector } from '../components/inspector.component.js';
import { renderClientScript } from '../client/graph-app.client.js';

/**
 * Renders the authentic macOS styled Codebase Knowledge Graph Explorer with professional typography.
 */
export function renderGraphPage(projectId: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>OGM-Slim &mdash; Codebase Knowledge Graph</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
  <style>
    ${themeCss}
  </style>
</head>
<body>
  ${renderHeader()}
  ${renderToolbar(projectId)}
  <div class="mac-layout">
    ${renderSymbolExplorer()}
    ${renderGraphCanvas()}
    ${renderContractInspector()}
  </div>
  ${renderClientScript(projectId)}
</body>
</html>`;
}
