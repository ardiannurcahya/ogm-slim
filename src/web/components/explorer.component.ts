export function renderSymbolExplorer(): string {
  return `
  <div class="mac-col mac-col-left" id="explorerCol">
    <div class="mac-col-header">
      <div class="mac-section-title">
        <span id="explorerTitle">Symbols</span>
        <div style="display:flex;align-items:center;gap:0.4rem">
          <span id="symFilteredCount" style="color:var(--mac-accent);font-family:var(--mac-mono);font-size:0.75rem">-</span>
          <button class="mac-drawer-close" onclick="toggleSidebar('explorer')" title="Close Drawer">&times;</button>
        </div>
      </div>
      <div class="mac-search-box">
        <span class="mac-search-icon">🔍</span>
        <input type="text" id="symFilter" class="mac-input" placeholder="Search symbols, memories..." oninput="filterExplorerItems()">
      </div>

      <!-- Codebase Filters -->
      <div id="codebaseFilters" style="display:flex;gap:0.3rem">
        <select id="kindFilter" class="mac-select" onchange="filterExplorerItems()" style="flex:1">
          <option value="">All Kinds</option>
          <option value="function">Function</option>
          <option value="method">Method</option>
          <option value="struct">Struct</option>
          <option value="interface">Interface</option>
          <option value="class">Class</option>
          <option value="type">Type</option>
        </select>
        <select id="commFilter" class="mac-select" onchange="filterExplorerItems()" style="flex:1">
          <option value="">All Clusters</option>
        </select>
      </div>

      <!-- Memory Filters -->
      <div id="memoryFilters" style="display:none;gap:0.3rem">
        <select id="memKindFilter" class="mac-select" onchange="filterExplorerItems()" style="flex:1">
          <option value="">All Types</option>
          <option value="bugfix">Bugfix</option>
          <option value="decision">Decision</option>
          <option value="procedure">Procedure</option>
          <option value="research">Research</option>
          <option value="learning">Learning</option>
          <option value="preference">Preference</option>
          <option value="episode">Episode</option>
        </select>
        <select id="memStatusFilter" class="mac-select" onchange="filterExplorerItems()" style="flex:1">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="stale">Stale</option>
          <option value="archived">Archived</option>
        </select>
      </div>
    </div>
    <div class="mac-symbol-list" id="symbolList">
      <p style="color:var(--mac-text-muted);padding:1rem;font-size:0.8rem">Loading...</p>
    </div>
  </div>`;
}
