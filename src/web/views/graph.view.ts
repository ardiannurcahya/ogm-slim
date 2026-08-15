import { themeCss } from '../styles/theme.css.js';
import { renderHeader } from '../components/header.component.js';
import { renderToolbar } from '../components/toolbar.component.js';
import { renderSymbolExplorer } from '../components/explorer.component.js';
import { renderGraphCanvas } from '../components/canvas.component.js';
import { renderContractInspector } from '../components/inspector.component.js';
import { renderClientScript } from '../client/graph-app.client.js';

/**
 * Renders the interactive Codebase & Agent Memory Knowledge Graph Explorer.
 */
export function renderGraphPage(projectId: string, authEnabled: boolean = false): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>OGM-Slim &mdash; Agent Memory & Codebase Graph</title>
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

  <!-- Login Modal Overlay (Active when auth is enabled and unauthenticated) -->
  <div id="loginModalOverlay" class="mac-login-overlay" style="display:none">
    <div class="mac-login-card">
      <div class="mac-login-title">
        <span>🔐</span>
        <span>OGM-Slim Authentication</span>
      </div>
      <p style="font-size:0.8rem;color:var(--mac-text-secondary);line-height:1.4">
        Protected operational memory service. Enter your admin password or API key to access.
      </p>
      <div id="loginErrorMsg" class="mac-login-error"></div>
      <form onsubmit="handleLoginSubmit(event)" style="display:flex;flex-direction:column;gap:0.8rem">
        <div>
          <label style="font-size:0.75rem;color:var(--mac-text-muted);display:block;margin-bottom:0.35rem;font-weight:600">Password / API Key</label>
          <input type="password" id="loginKeyInput" class="mac-input" placeholder="Enter API key or password" autofocus required style="padding:0.5rem 0.75rem;font-size:0.9rem">
        </div>
        <button type="submit" class="mac-btn mac-btn-primary" style="padding:0.5rem;font-size:0.88rem;justify-content:center">
          Unlock Dashboard &rarr;
        </button>
      </form>
    </div>
  </div>

  ${renderClientScript(projectId, authEnabled)}
</body>
</html>`;
}
