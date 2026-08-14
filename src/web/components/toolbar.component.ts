export function renderToolbar(projectId: string): string {
  return `
  <div class="mac-toolbar">
    <div class="mac-status-pills">
      <div class="mac-pill">
        <span style="color:var(--mac-text-muted)">Dataset:</span>
        <select id="datasetSelect" class="mac-select" onchange="switchDataset(this.value)" style="font-weight:600;padding:0.15rem 0.5rem;background:rgba(255,255,255,0.08)">
          <option value="">Loading datasets...</option>
        </select>
      </div>
      <div class="mac-pill">Project: <span class="mac-pill-val" id="projId">${projectId}</span></div>
      <div class="mac-pill">Symbols: <span class="mac-pill-val" id="nodeCount">-</span></div>
      <div class="mac-pill">Relations: <span class="mac-pill-val" id="edgeCount">-</span></div>
      <div class="mac-pill">Louvain Clusters: <span class="mac-pill-val" id="commCount">-</span></div>
    </div>
    <div style="display:flex;gap:0.4rem">
      <button class="mac-btn" onclick="promptIndexNewDataset()">+ Index New Codebase</button>
      <button class="mac-btn mac-btn-primary" onclick="triggerReindex()">⚡ Re-Index Dataset</button>
    </div>
  </div>`;
}
