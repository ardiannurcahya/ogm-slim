export function renderGraphCanvas(): string {
  return `
  <div class="col graph-view">
    <div class="graph-toolbar">
      <button class="graph-btn" id="btnZoomIn" title="Zoom In">+</button>
      <button class="graph-btn" id="btnZoomOut" title="Zoom Out">-</button>
      <button class="graph-btn" id="btnReset" title="Fit View">Fit View</button>
      <button class="graph-btn" id="btnRelayout" title="Relayout">⚡ Relayout</button>
      <select id="colorModeSelect" onchange="changeColorMode(this.value)" style="padding:0.3rem 0.5rem;font-size:0.8rem">
        <option value="kind">Palette: Symbol Kind</option>
        <option value="louvain">Palette: Louvain Modularity</option>
      </select>
    </div>
    <div id="networkContainer"></div>
    <div class="graph-legend" id="graphLegend">
      <span><span class="legend-dot" style="background:var(--fn)"></span>Function</span>
      <span><span class="legend-dot" style="background:var(--method)"></span>Method</span>
      <span><span class="legend-dot" style="background:var(--struct)"></span>Struct</span>
      <span><span class="legend-dot" style="background:var(--class)"></span>Class</span>
      <span><span class="legend-dot" style="background:var(--iface)"></span>Interface</span>
      <span><span class="legend-dot" style="background:var(--type)"></span>Type</span>
    </div>
  </div>`;
}
