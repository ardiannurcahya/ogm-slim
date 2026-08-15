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
        <span>🧠</span>
        <span>OGM-Slim</span>
      </div>
      <div class="mac-tabs">
        <button class="mac-tab-btn active" id="tabCodebase" onclick="switchGraphMode('codebase')">🌳 Codebase</button>
        <button class="mac-tab-btn" id="tabMemory" onclick="switchGraphMode('memory')">🧠 Memory</button>
      </div>
    </div>
    <div class="mac-title-right">
      <button class="mac-btn mac-mobile-drawer-toggle" id="btnToggleExplorer" onclick="toggleSidebar('explorer')" title="Toggle Explorer">📁 Explorer</button>
      <button class="mac-btn mac-mobile-drawer-toggle" id="btnToggleInspector" onclick="toggleSidebar('inspector')" title="Toggle Inspector Details">ℹ️ Details</button>
      <button id="authLogoutBtn" class="mac-btn" onclick="handleLogout()" style="display:none">Logout</button>
      <a href="javascript:location.reload()" class="mac-btn" title="Reload Page">⟳</a>
    </div>
  </header>`;
}
