export const themeCss = `
  :root {
    color-scheme: dark;
    --mac-bg: #0e0e12;
    --mac-window-bg: #16161c;
    --mac-sidebar-bg: #121217;
    --mac-panel-bg: #1a1a22;
    --mac-panel-hover: #22222c;
    --mac-panel-active: #2a3142;
    --mac-border: rgba(255, 255, 255, 0.08);
    --mac-border-subtle: rgba(255, 255, 255, 0.05);
    --mac-border-focus: #0a84ff;
    --mac-text: #f5f5f7;
    --mac-text-secondary: #9898a0;
    --mac-text-muted: #6c6c75;
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
    --mac-font: "Inter", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif;
    --mac-mono: "JetBrains Mono", "SF Mono", Menlo, Monaco, Consolas, monospace;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* Custom Sleek Dark Scrollbar */
  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  html, body {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  body {
    font: 13px/1.45 var(--mac-font);
    background: var(--mac-bg);
    color: var(--mac-text);
    display: flex;
    flex-direction: column;
    letter-spacing: -0.01em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    user-select: none;
  }

  /* Top Titlebar */
  .mac-titlebar {
    background: var(--mac-window-bg);
    border-bottom: 1px solid var(--mac-border);
    padding: 0.45rem 0.85rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    gap: 0.6rem;
    min-height: 44px;
    z-index: 50;
  }

  .mac-title-left {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .mac-title-left::-webkit-scrollbar { display: none; }

  .mac-traffic-lights {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-right: 0.2rem;
  }

  .traffic-btn {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    border: 0.5px solid rgba(0, 0, 0, 0.2);
    display: inline-block;
  }

  .traffic-close { background: var(--traffic-close); }
  .traffic-min { background: var(--traffic-min); }
  .traffic-max { background: var(--traffic-max); }

  .mac-window-title {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--mac-text);
    display: flex;
    align-items: center;
    gap: 0.35rem;
    white-space: nowrap;
  }

  .mac-title-right {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-shrink: 0;
  }

  /* Buttons */
  .mac-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid var(--mac-border);
    color: var(--mac-text);
    font-size: 0.78rem;
    font-weight: 500;
    padding: 0.32rem 0.65rem;
    border-radius: 6px;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    white-space: nowrap;
    transition: all 0.15s ease;
    touch-action: manipulation;
  }

  .mac-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.22);
  }

  .mac-btn:active {
    background: rgba(255, 255, 255, 0.06);
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

  /* Mobile Drawer Toggle Buttons (Visible on Mobile/Tablet) */
  .mac-mobile-drawer-toggle {
    display: none;
  }

  /* Secondary Toolbar / Metrics Bar */
  .mac-toolbar {
    background: #141419;
    border-bottom: 1px solid var(--mac-border);
    padding: 0.35rem 0.85rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.78rem;
    color: var(--mac-text-secondary);
    flex-shrink: 0;
    gap: 0.6rem;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  .mac-toolbar::-webkit-scrollbar { display: none; }

  .mac-status-pills {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    white-space: nowrap;
  }

  .mac-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }

  .mac-pill-val {
    font-weight: 600;
    color: var(--mac-text);
    background: rgba(255, 255, 255, 0.08);
    padding: 0.12rem 0.4rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-family: var(--mac-mono);
  }

  /* Main 3-Column Layout */
  .mac-layout {
    display: grid;
    grid-template-columns: minmax(260px, 280px) 1fr minmax(310px, 350px);
    flex: 1;
    min-height: 0;
    overflow: hidden;
    position: relative;
  }

  .mac-col {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    background: var(--mac-sidebar-bg);
  }

  .mac-col-left {
    border-right: 1px solid var(--mac-border);
  }

  .mac-col-right {
    border-left: 1px solid var(--mac-border);
    background: var(--mac-window-bg);
  }

  .mac-col-header {
    padding: 0.65rem 0.85rem;
    border-bottom: 1px solid var(--mac-border);
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
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

  .mac-drawer-close {
    display: none;
    background: transparent;
    border: none;
    color: var(--mac-text-muted);
    font-size: 1.25rem;
    cursor: pointer;
    line-height: 1;
    padding: 0.1rem 0.3rem;
  }
  .mac-drawer-close:hover {
    color: var(--mac-text);
  }

  /* Search & Select Inputs */
  .mac-search-box {
    position: relative;
    display: flex;
    align-items: center;
  }

  .mac-input {
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid var(--mac-border);
    color: var(--mac-text);
    padding: 0.35rem 0.6rem 0.35rem 1.65rem;
    border-radius: 6px;
    font-size: 0.8rem;
    width: 100%;
    outline: none;
    transition: all 0.15s ease;
    font-family: inherit;
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
    background: rgba(0, 0, 0, 0.5);
  }

  .mac-select {
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid var(--mac-border);
    color: var(--mac-text);
    padding: 0.3rem 0.45rem;
    border-radius: 6px;
    font-size: 0.78rem;
    outline: none;
    cursor: pointer;
    max-width: 100%;
    font-family: inherit;
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
    gap: 3px;
    min-height: 0;
  }

  .mac-sym-item {
    padding: 0.45rem 0.6rem;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 2px;
    transition: all 0.12s ease;
    border: 1px solid transparent;
  }

  .mac-sym-item:hover {
    background: var(--mac-panel-hover);
    border-color: var(--mac-border-subtle);
  }

  .mac-sym-item.active {
    background: var(--mac-accent);
    color: #ffffff;
    border-color: var(--mac-accent);
  }

  .mac-sym-top {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    min-width: 0;
  }

  .mac-sym-name {
    font-weight: 600;
    font-family: var(--mac-mono);
    font-size: 0.82rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }

  .mac-sym-file {
    font-size: 0.72rem;
    color: var(--mac-text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mac-sym-item.active .mac-sym-file {
    color: rgba(255, 255, 255, 0.8);
  }

  .mac-badge {
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    display: inline-block;
    flex-shrink: 0;
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
    background: #09090c;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
    min-height: 0;
  }

  #networkContainer {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
  }

  /* Floating HUD Controls */
  .mac-floating-hud {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    z-index: 15;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    background: rgba(22, 22, 28, 0.88);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    padding: 0.3rem 0.45rem;
    border-radius: 8px;
    border: 1px solid var(--mac-border);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    max-width: calc(100% - 1.5rem);
    overflow-x: auto;
    scrollbar-width: none;
  }
  .mac-floating-hud::-webkit-scrollbar { display: none; }

  .mac-hud-btn {
    background: rgba(255, 255, 255, 0.08);
    color: var(--mac-text);
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 0.25rem 0.5rem;
    border-radius: 5px;
    font-size: 0.76rem;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s;
    touch-action: manipulation;
  }

  .mac-hud-btn:hover {
    background: rgba(255, 255, 255, 0.16);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .mac-legend-hud {
    position: absolute;
    bottom: 0.75rem;
    left: 0.75rem;
    z-index: 15;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: rgba(22, 22, 28, 0.88);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    padding: 0.3rem 0.65rem;
    border-radius: 8px;
    border: 1px solid var(--mac-border);
    font-size: 0.72rem;
    color: var(--mac-text-secondary);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    max-width: calc(100% - 1.5rem);
    flex-wrap: wrap;
    overflow: hidden;
  }

  .mac-legend-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 0.25rem;
    flex-shrink: 0;
  }

  /* Right Column: Inspector */
  .mac-inspector-body {
    flex: 1;
    overflow-y: auto;
    padding: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    background: var(--mac-window-bg);
    min-height: 0;
  }

  .mac-meta-card {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--mac-border);
    border-radius: 8px;
    padding: 0.6rem 0.75rem;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .mac-meta-cell {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .mac-meta-title {
    font-size: 0.68rem;
    color: var(--mac-text-muted);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .mac-meta-value {
    font-size: 0.8rem;
    font-weight: 600;
    font-family: var(--mac-mono);
    color: var(--mac-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mac-code-panel {
    background: #09090c;
    border: 1px solid var(--mac-border);
    border-radius: 8px;
    padding: 0.65rem;
    font-family: var(--mac-mono);
    font-size: 0.78rem;
    color: var(--mac-teal);
    white-space: pre-wrap;
    word-break: break-all;
    overflow-wrap: anywhere;
    line-height: 1.45;
    max-height: 220px;
    overflow-y: auto;
    overflow-x: auto;
  }

  .mac-doc-panel {
    background: rgba(0, 0, 0, 0.25);
    border-left: 3px solid var(--mac-blue);
    border-radius: 4px;
    padding: 0.6rem 0.7rem;
    font-size: 0.8rem;
    color: var(--mac-text-secondary);
    line-height: 1.45;
    word-break: break-word;
    overflow-wrap: anywhere;
    max-height: 180px;
    overflow-y: auto;
  }

  .mac-chip {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid var(--mac-border);
    padding: 0.2rem 0.45rem;
    border-radius: 5px;
    font-family: var(--mac-mono);
    font-size: 0.74rem;
    color: var(--mac-text);
    margin: 2px;
    cursor: pointer;
    transition: all 0.12s;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mac-chip:hover {
    background: var(--mac-blue);
    color: #ffffff;
    border-color: #0071e3;
  }

  /* Tab Switcher */
  .mac-tabs {
    display: inline-flex;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid var(--mac-border);
    border-radius: 7px;
    padding: 2px;
    gap: 2px;
    flex-shrink: 0;
  }

  .mac-tab-btn {
    background: transparent;
    border: none;
    color: var(--mac-text-secondary);
    padding: 0.25rem 0.65rem;
    border-radius: 5px;
    font-size: 0.76rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    white-space: nowrap;
    transition: all 0.15s ease;
  }

  .mac-tab-btn:hover {
    color: var(--mac-text);
  }

  .mac-tab-btn.active {
    background: var(--mac-accent);
    color: #ffffff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  }

  /* Memory Badges */
  .mac-badge-bugfix { background: rgba(255, 69, 58, 0.25); color: var(--mac-red); }
  .mac-badge-decision { background: rgba(10, 132, 255, 0.25); color: var(--mac-blue); }
  .mac-badge-procedure { background: rgba(48, 209, 88, 0.25); color: var(--mac-green); }
  .mac-badge-research { background: rgba(191, 90, 242, 0.25); color: var(--mac-purple); }
  .mac-badge-learning { background: rgba(255, 214, 10, 0.25); color: var(--mac-yellow); }
  .mac-badge-preference { background: rgba(255, 55, 95, 0.25); color: var(--mac-pink); }
  .mac-badge-episode { background: rgba(100, 210, 255, 0.2); color: var(--mac-teal); border: 1px dashed rgba(100, 210, 255, 0.4); }

  /* Mobile Drawer Overlay Backdrop */
  .mac-drawer-backdrop {
    display: none;
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 40;
    transition: opacity 0.2s ease;
  }

  /* Login Modal */
  .mac-login-overlay {
    position: fixed;
    inset: 0;
    background: rgba(8, 8, 12, 0.88);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 1rem;
  }

  .mac-login-card {
    background: #181820;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: 1.75rem;
    width: min(380px, 100%);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .mac-login-title {
    font-size: 1.05rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.45rem;
    color: var(--mac-text);
  }

  .mac-login-error {
    background: rgba(255, 69, 58, 0.15);
    border: 1px solid var(--mac-red);
    color: var(--mac-red);
    padding: 0.45rem 0.6rem;
    border-radius: 6px;
    font-size: 0.76rem;
    display: none;
  }

  /* ==========================================================================
     RESPONSIVE MEDIA QUERIES (Mobile, Tablet, Desktop)
     ========================================================================== */

  /* Tablet & Mobile Screens (<= 960px) */
  @media (max-width: 960px) {
    .mac-mobile-drawer-toggle {
      display: inline-flex;
    }

    .mac-drawer-close {
      display: inline-block;
    }

    .mac-layout {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .mac-graph-view {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }

    .mac-col-left {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: min(320px, 85vw);
      z-index: 50;
      background: #14141a;
      transform: translateX(-105%);
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 8px 0 28px rgba(0, 0, 0, 0.6);
      border-right: 1px solid var(--mac-border);
    }

    .mac-col-left.open {
      transform: translateX(0);
    }

    .mac-col-right {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: min(360px, 90vw);
      z-index: 50;
      background: #181820;
      transform: translateX(105%);
      transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: -8px 0 28px rgba(0, 0, 0, 0.6);
      border-left: 1px solid var(--mac-border);
    }

    .mac-col-right.open {
      transform: translateX(0);
    }

    .mac-drawer-backdrop.active {
      display: block;
    }
  }

  /* Compact Mobile Screens (<= 640px) */
  @media (max-width: 640px) {
    .mac-traffic-lights {
      display: none;
    }

    .mac-titlebar {
      padding: 0.35rem 0.5rem;
      min-height: 40px;
    }

    .mac-window-title span:last-child {
      display: none;
    }

    .mac-tab-btn {
      padding: 0.2rem 0.45rem;
      font-size: 0.72rem;
    }

    .mac-toolbar {
      padding: 0.25rem 0.5rem;
      font-size: 0.72rem;
    }

    .mac-floating-hud {
      top: 0.5rem;
      left: 0.5rem;
      padding: 0.25rem 0.35rem;
      gap: 0.2rem;
    }

    .mac-hud-btn {
      padding: 0.2rem 0.4rem;
      font-size: 0.72rem;
    }

    .mac-legend-hud {
      bottom: 0.5rem;
      left: 0.5rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.68rem;
      gap: 0.4rem;
    }

    .mac-meta-card {
      grid-template-columns: 1fr;
    }
  }
`;
