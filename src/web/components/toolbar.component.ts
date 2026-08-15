export function renderToolbar(projectId: string): string {
  return `
  <div class="mac-toolbar">
    <!-- Codebase Mode Status -->
    <div class="mac-status-pills" id="codebaseStatusPills">
      <div class="mac-pill">
        <span style="color:var(--mac-text-muted)">Dataset:</span>
        <select id="datasetSelect" class="mac-select" onchange="switchDataset(this.value)" style="font-weight:600;padding:0.15rem 0.5rem;background:rgba(255,255,255,0.08)">
          <option value="">Loading datasets...</option>
        </select>
      </div>
      <div class="mac-pill">Project: <span class="mac-pill-val" id="projId">${projectId}</span></div>
      <div class="mac-pill">Symbols: <span class="mac-pill-val" id="nodeCount">-</span></div>
      <div class="mac-pill">Relations: <span class="mac-pill-val" id="edgeCount">-</span></div>
      <div class="mac-pill">Clusters: <span class="mac-pill-val" id="commCount">-</span></div>
    </div>

    <!-- Memory Mode Status -->
    <div class="mac-status-pills" id="memoryStatusPills" style="display:none">
      <div class="mac-pill">Project: <span class="mac-pill-val">${projectId}</span></div>
      <div class="mac-pill">Memories: <span class="mac-pill-val" id="memCount">-</span></div>
      <div class="mac-pill">Episodes: <span class="mac-pill-val" id="epCount">-</span></div>
      <div class="mac-pill">Citations: <span class="mac-pill-val" id="memEdgeCount">-</span></div>
    </div>

    <!-- Codebase Actions -->
    <div id="codebaseActions" style="display:flex;gap:0.4rem">
      <button class="mac-btn" onclick="deleteCurrentDataset()" style="color:var(--mac-red);border-color:rgba(255,69,58,0.3)">Delete Dataset</button>
    </div>
  </div>`;
}
