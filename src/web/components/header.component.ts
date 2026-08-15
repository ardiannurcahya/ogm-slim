export function renderHeader(): string {
  return `
  <header class="mac-titlebar">
    <div class="mac-title-left">
      <div class="mac-traffic-lights">
        <span class="traffic-btn traffic-close" title="Close"></span>
        <span class="traffic-btn traffic-min" title="Minimize"></span>
        <span class="traffic-btn traffic-max" title="Zoom"></span>
      </div>
      <div class="mac-window-title">
        <span class="mac-brand-mark">OGM</span>
        <span>Slim</span>
      </div>
      <div class="mac-tabs">
        <button class="mac-tab-btn active" id="tabCodebase" onclick="switchGraphMode('codebase')">Codebase Graph</button>
        <button class="mac-tab-btn" id="tabMemory" onclick="switchGraphMode('memory')">Memory Graph</button>
      </div>
    </div>
    <div class="mac-title-right">
      <button class="mac-btn mac-panel-toggle active" id="btnToggleExplorer" onclick="toggleSidebar('explorer')" title="Toggle Explorer Sidebar">Explorer</button>
      <button class="mac-btn mac-panel-toggle active" id="btnToggleInspector" onclick="toggleSidebar('inspector')" title="Toggle Details Panel">Details</button>
      <button id="authLogoutBtn" class="mac-btn" onclick="handleLogout()" style="display:none">Logout</button>
      <a href="javascript:location.reload()" class="mac-btn" title="Reload Page">Refresh</a>
    </div>
  </header>`;
}
