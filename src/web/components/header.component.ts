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
        <span>OGM-Slim &mdash; Codebase Knowledge Graph</span>
      </div>
    </div>
    <div class="mac-title-right">
      <a href="/admin" class="mac-btn">&larr; Dashboard</a>
      <a href="javascript:location.reload()" class="mac-btn">Refresh</a>
    </div>
  </header>`;
}
