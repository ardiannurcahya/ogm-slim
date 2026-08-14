export function renderToolbar(projectId: string): string {
  return `
  <div class="mac-toolbar">
    <div class="mac-status-pills">
      <div class="mac-pill">Project: <span class="mac-pill-val" id="projId">${projectId}</span></div>
      <div class="mac-pill">Symbols: <span class="mac-pill-val" id="nodeCount">-</span></div>
      <div class="mac-pill">Relations: <span class="mac-pill-val" id="edgeCount">-</span></div>
      <div class="mac-pill">Louvain Clusters: <span class="mac-pill-val" id="commCount">-</span></div>
    </div>
    <div>
      <button class="mac-btn mac-btn-primary" onclick="triggerReindex()">⚡ Re-Index Codebase</button>
    </div>
  </div>`;
}
