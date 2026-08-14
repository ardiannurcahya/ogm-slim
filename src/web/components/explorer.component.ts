export function renderSymbolExplorer(): string {
  return `
  <div class="col">
    <div class="col-header">
      <div class="col-title">
        <span>Symbol Explorer</span>
        <span id="symFilteredCount" style="color:var(--accent)">-</span>
      </div>
      <input type="text" id="symFilter" placeholder="Search symbols, files..." oninput="filterSymbols()">
      <div style="display:flex;gap:0.3rem;flex-wrap:wrap">
        <select id="kindFilter" onchange="filterSymbols()" style="flex:1">
          <option value="">All Kinds</option>
          <option value="function">Function</option>
          <option value="method">Method</option>
          <option value="struct">Struct</option>
          <option value="interface">Interface</option>
          <option value="class">Class</option>
          <option value="type">Type</option>
        </select>
        <select id="commFilter" onchange="filterSymbols()" style="flex:1">
          <option value="">All Communities</option>
        </select>
      </div>
    </div>
    <div class="symbol-list" id="symbolList">
      <p style="color:var(--muted);padding:1rem">Loading symbols...</p>
    </div>
  </div>`;
}
