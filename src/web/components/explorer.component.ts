export function renderSymbolExplorer(): string {
  return `
  <div class="mac-col">
    <div class="mac-col-header">
      <div class="mac-section-title">
        <span>Symbols</span>
        <span id="symFilteredCount" style="color:var(--mac-accent)">-</span>
      </div>
      <div class="mac-search-box">
        <span class="mac-search-icon">🔍</span>
        <input type="text" id="symFilter" class="mac-input" placeholder="Search symbols, paths..." oninput="filterSymbols()">
      </div>
      <div style="display:flex;gap:0.3rem">
        <select id="kindFilter" class="mac-select" onchange="filterSymbols()" style="flex:1">
          <option value="">All Kinds</option>
          <option value="function">Function</option>
          <option value="method">Method</option>
          <option value="struct">Struct</option>
          <option value="interface">Interface</option>
          <option value="class">Class</option>
          <option value="type">Type</option>
        </select>
        <select id="commFilter" class="mac-select" onchange="filterSymbols()" style="flex:1">
          <option value="">All Clusters</option>
        </select>
      </div>
    </div>
    <div class="mac-symbol-list" id="symbolList">
      <p style="color:var(--mac-text-muted);padding:1rem;font-size:0.8rem">Loading symbols...</p>
    </div>
  </div>`;
}
