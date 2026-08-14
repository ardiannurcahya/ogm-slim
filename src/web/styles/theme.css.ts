export const themeCss = `
  :root {
    color-scheme: dark;
    --mac-bg: #131317;
    --mac-window-bg: #1c1c21;
    --mac-sidebar-bg: #16161b;
    --mac-panel-bg: #1e1e24;
    --mac-panel-hover: #26262e;
    --mac-panel-active: #2b313f;
    --mac-border: rgba(255, 255, 255, 0.08);
    --mac-border-focus: #0a84ff;
    --mac-text: #f5f5f7;
    --mac-text-secondary: #86868b;
    --mac-text-muted: #6e6e73;
    --mac-accent: #0a84ff;
    --mac-accent-subtle: rgba(10, 132, 255, 0.15);
    --mac-red: #ff453a;
    --mac-orange: #ff9f0a;
    --mac-yellow: #ffd60a;
    --mac-green: #30d158;
    --mac-teal: #64d2ff;
    --mac-blue: #0a84ff;
    --mac-indigo: #5e5ce6;
    --mac-purple: #bf5af2;
    --mac-pink: #ff375f;
    --mac-gray: #8e8e93;
    --traffic-close: #ff5f56;
    --traffic-min: #ffbd2e;
    --traffic-max: #27c93f;
    --mac-font: "SF Pro Text", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", "Geist", "Segoe UI", system-ui, sans-serif;
    --mac-mono: "SF Mono", "JetBrains Mono", Menlo, Monaco, Consolas, "Geist Mono", monospace;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font: 13px/1.4 var(--mac-font);
    background: var(--mac-bg);
    color: var(--mac-text);
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    letter-spacing: -0.01em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    user-select: none;
  }

  /* macOS Window Titlebar */
  .mac-titlebar {
    background: var(--mac-window-bg);
    border-bottom: 1px solid var(--mac-border);
    padding: 0.55rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    gap: 1rem;
    height: 42px;
  }

  .mac-title-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  /* macOS Window Traffic Lights */
  .mac-traffic-lights {
    display: flex;
    align-items: center;
    gap: 7px;
    padding-right: 0.5rem;
  }

  .traffic-btn {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 0.5px solid rgba(0, 0, 0, 0.15);
    display: inline-block;
    transition: opacity 0.15s;
  }

  .traffic-close { background: var(--traffic-close); }
  .traffic-min { background: var(--traffic-min); }
  .traffic-max { background: var(--traffic-max); }
  .mac-traffic-lights:hover .traffic-btn { opacity: 0.9; }

  .mac-window-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--mac-text);
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .mac-title-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* macOS Push Buttons & Segmented Controls */
  .mac-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid var(--mac-border);
    color: var(--mac-text);
    font-size: 0.8rem;
    font-weight: 500;
    padding: 0.3rem 0.75rem;
    border-radius: 6px;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    transition: all 0.15s ease;
    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }

  .mac-btn:hover {
    background: rgba(255, 255, 255, 0.14);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .mac-btn:active {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(0.5px);
  }

  .mac-btn-primary {
    background: var(--mac-blue);
    border-color: #0071e3;
    color: #ffffff;
    font-weight: 600;
  }

  .mac-btn-primary:hover {
    background: #0077ed;
  }

  /* macOS Sub-Toolbar / Status Bar */
  .mac-toolbar {
    background: #18181d;
    border-bottom: 1px solid var(--mac-border);
    padding: 0.4rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.8rem;
    color: var(--mac-text-secondary);
    flex-shrink: 0;
  }

  .mac-status-pills {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .mac-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }

  .mac-pill-val {
    font-weight: 600;
    color: var(--mac-text);
    background: rgba(255, 255, 255, 0.07);
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    font-size: 0.78rem;
  }

  /* Main 3-Column macOS Layout */
  .mac-layout {
    display: grid;
    grid-template-columns: 300px 1fr 360px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .mac-col {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    border-right: 1px solid var(--mac-border);
    background: var(--mac-sidebar-bg);
  }

  .mac-col:last-child {
    border-right: none;
    background: var(--mac-window-bg);
  }

  .mac-col-header {
    padding: 0.75rem 0.9rem 0.6rem 0.9rem;
    border-bottom: 1px solid var(--mac-border);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background: var(--mac-sidebar-bg);
    flex-shrink: 0;
  }

  .mac-section-title {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--mac-text-muted);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* macOS Native Search & Inputs */
  .mac-search-box {
    position: relative;
    display: flex;
    align-items: center;
  }

  .mac-input {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--mac-border);
    color: var(--mac-text);
    padding: 0.35rem 0.6rem 0.35rem 1.6rem;
    border-radius: 6px;
    font-size: 0.82rem;
    width: 100%;
    outline: none;
    transition: all 0.15s ease;
  }

  .mac-search-icon {
    position: absolute;
    left: 0.5rem;
    color: var(--mac-text-muted);
    font-size: 0.75rem;
    pointer-events: none;
  }

  .mac-input:focus {
    border-color: var(--mac-accent);
    box-shadow: 0 0 0 2px var(--mac-accent-subtle);
    background: rgba(0, 0, 0, 0.45);
  }

  .mac-select {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--mac-border);
    color: var(--mac-text);
    padding: 0.3rem 0.5rem;
    border-radius: 6px;
    font-size: 0.8rem;
    outline: none;
    cursor: pointer;
  }

  .mac-select:focus {
    border-color: var(--mac-accent);
  }

  /* Symbol List Sidebar */
  .mac-symbol-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.4rem;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .mac-sym-item {
    padding: 0.45rem 0.65rem;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 2px;
    transition: all 0.12s ease;
  }

  .mac-sym-item:hover {
    background: var(--mac-panel-hover);
  }

  .mac-sym-item.active {
    background: var(--mac-accent);
    color: #ffffff;
  }

  .mac-sym-top {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .mac-sym-name {
    font-weight: 600;
    font-family: var(--mac-mono);
    font-size: 0.85rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .mac-sym-file {
    font-size: 0.72rem;
    color: var(--mac-text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mac-sym-item.active .mac-sym-file {
    color: rgba(255, 255, 255, 0.75);
  }

  .mac-badge {
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    display: inline-block;
  }

  .mac-badge-fn { background: rgba(48, 209, 88, 0.2); color: var(--mac-green); }
  .mac-badge-method { background: rgba(100, 210, 255, 0.2); color: var(--mac-teal); }
  .mac-badge-struct { background: rgba(255, 69, 58, 0.2); color: var(--mac-red); }
  .mac-badge-iface { background: rgba(255, 214, 10, 0.2); color: var(--mac-yellow); }
  .mac-badge-type { background: rgba(191, 90, 242, 0.2); color: var(--mac-purple); }
  .mac-badge-class { background: rgba(255, 55, 95, 0.2); color: var(--mac-pink); }

  .mac-sym-item.active .mac-badge {
    background: rgba(255, 255, 255, 0.25);
    color: #ffffff;
  }

  /* Center Graph Canvas */
  .mac-graph-view {
    position: relative;
    background: #0f0f13;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  #networkContainer {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  /* macOS Floating Glass HUD */
  .mac-floating-hud {
    position: absolute;
    top: 0.9rem;
    left: 0.9rem;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    background: rgba(30, 30, 36, 0.85);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    padding: 0.3rem 0.5rem;
    border-radius: 8px;
    border: 1px solid var(--mac-border);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  }

  .mac-hud-btn {
    background: rgba(255, 255, 255, 0.08);
    color: var(--mac-text);
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 0.25rem 0.55rem;
    border-radius: 5px;
    font-size: 0.78rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .mac-hud-btn:hover {
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .mac-legend-hud {
    position: absolute;
    bottom: 0.9rem;
    left: 0.9rem;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 0.7rem;
    background: rgba(30, 30, 36, 0.85);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    padding: 0.35rem 0.75rem;
    border-radius: 8px;
    border: 1px solid var(--mac-border);
    font-size: 0.75rem;
    color: var(--mac-text-secondary);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  }

  .mac-legend-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 0.25rem;
  }

  /* Right Column: macOS Inspector */
  .mac-inspector-body {
    flex: 1;
    overflow-y: auto;
    padding: 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    background: var(--mac-window-bg);
  }

  .mac-meta-card {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--mac-border);
    border-radius: 8px;
    padding: 0.65rem 0.8rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }

  .mac-meta-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .mac-meta-title {
    font-size: 0.7rem;
    color: var(--mac-text-muted);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .mac-meta-value {
    font-size: 0.82rem;
    font-weight: 600;
    font-family: var(--mac-mono);
    color: var(--mac-text);
  }

  .mac-code-panel {
    background: #0d0d10;
    border: 1px solid var(--mac-border);
    border-radius: 8px;
    padding: 0.75rem;
    font-family: var(--mac-mono);
    font-size: 0.8rem;
    color: var(--mac-teal);
    white-space: pre-wrap;
    word-break: break-all;
    line-height: 1.45;
  }

  .mac-doc-panel {
    background: rgba(0, 0, 0, 0.2);
    border-left: 3px solid var(--mac-blue);
    border-radius: 4px;
    padding: 0.65rem 0.75rem;
    font-size: 0.82rem;
    color: var(--mac-text-secondary);
    line-height: 1.45;
  }

  .mac-chip {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid var(--mac-border);
    padding: 0.25rem 0.5rem;
    border-radius: 5px;
    font-family: var(--mac-mono);
    font-size: 0.78rem;
    color: var(--mac-text);
    margin: 2px;
    cursor: pointer;
    transition: all 0.12s;
  }

  .mac-chip:hover {
    background: var(--mac-blue);
    color: #ffffff;
    border-color: #0071e3;
  }

  @media (max-width: 64rem) {
    .mac-layout { grid-template-columns: 1fr; height: auto; }
    #networkContainer { min-height: 50vh; position: relative; }
  }
`;
