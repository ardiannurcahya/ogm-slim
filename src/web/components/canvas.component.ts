export function renderGraphCanvas(): string {
  return `
  <div class="mac-graph-view">
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
