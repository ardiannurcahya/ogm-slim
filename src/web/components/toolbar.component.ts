export function renderToolbar(projectId: string): string {
  return `
  <div class="toolbar">
    <div class="stats-bar">
      <div>Project: <strong style="color:var(--text)" id="projId">${projectId}</strong></div>
      <div>Nodes: <span class="stat-badge" id="nodeCount">-</span></div>
      <div>Edges: <span class="stat-badge" id="edgeCount">-</span></div>
      <div>Louvain Communities: <span class="stat-badge" id="commCount">-</span></div>
    </div>
    <div class="controls">
      <button onclick="triggerReindex()">⚡ Re-Index Codebase Now</button>
    </div>
  </div>`;
}
