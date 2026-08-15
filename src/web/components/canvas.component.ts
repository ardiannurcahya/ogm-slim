export function renderGraphCanvas(): string {
  return `
  <div class="mac-graph-view">
    <!-- Left Sidebar Collapse/Expand Handle -->
    <button class="mac-edge-handle mac-edge-left" id="handleLeft" onclick="toggleSidebar('explorer')" title="Toggle Explorer Sidebar" aria-label="Toggle Explorer Sidebar">
      <svg id="iconHandleLeft" class="mac-chevron-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>

    <!-- Right Inspector Collapse/Expand Handle -->
    <button class="mac-edge-handle mac-edge-right" id="handleRight" onclick="toggleSidebar('inspector')" title="Toggle Details Panel" aria-label="Toggle Details Panel">
      <svg id="iconHandleRight" class="mac-chevron-icon" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>

    <div class="mac-floating-hud">
      <button class="mac-hud-btn" id="btnZoomIn" title="Zoom In">+</button>
      <button class="mac-hud-btn" id="btnZoomOut" title="Zoom Out">&minus;</button>
      <button class="mac-hud-btn" id="btnReset" title="Fit View">Fit</button>
      <button class="mac-hud-btn" id="btnRelayout" title="Relayout">Settle</button>
      <button class="mac-hud-btn" id="btnExportPng" onclick="exportGraphPng()" title="Export PNG Screenshot">Export PNG</button>
      <select id="colorModeSelect" class="mac-select" onchange="changeColorMode(this.value)" style="padding:0.25rem 0.4rem;font-size:0.78rem">
        <option value="kind">Palette: Symbol Kind</option>
        <option value="louvain">Palette: Louvain Modularity</option>
      </select>
    </div>
    <div id="networkContainer"></div>

    <!-- Floating Bottom Metrics Capsule -->
    <div class="mac-bottom-hud" id="bottomStatsHud">
      <div id="hudCodebaseStats" class="mac-hud-stat-row">
        <span><strong id="hudNodeCount">-</strong> symbols</span>
        <span class="mac-hud-stat-sep">•</span>
        <span><strong id="hudEdgeCount">-</strong> relations</span>
        <span class="mac-hud-stat-sep">•</span>
        <span><strong id="hudCommCount">-</strong> clusters</span>
      </div>
      <div id="hudMemoryStats" class="mac-hud-stat-row" style="display:none">
        <span><strong id="hudMemCount">-</strong> memories</span>
        <span class="mac-hud-stat-sep">•</span>
        <span><strong id="hudEpCount">-</strong> episodes</span>
        <span class="mac-hud-stat-sep">•</span>
        <span><strong id="hudMemEdgeCount">-</strong> citations</span>
      </div>
    </div>

    <div class="mac-legend-hud" id="graphLegend">
      <span><span class="mac-legend-dot" style="background:var(--mac-green)"></span>Function</span>
      <span><span class="mac-legend-dot" style="background:var(--mac-teal)"></span>Method</span>
      <span><span class="mac-legend-dot" style="background:var(--mac-red)"></span>Struct</span>
      <span><span class="mac-legend-dot" style="background:var(--mac-pink)"></span>Class</span>
      <span><span class="mac-legend-dot" style="background:var(--mac-yellow)"></span>Interface</span>
      <span><span class="mac-legend-dot" style="background:var(--mac-purple)"></span>Type</span>
    </div>
  </div>`;
}
