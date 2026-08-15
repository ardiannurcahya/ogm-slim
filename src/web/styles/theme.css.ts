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

  ::selection {
    background: #0a84ff;
    color: #ffffff;
  }
  ::-moz-selection {
    background: #0a84ff;
    color: #ffffff;
  }

  html, body {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  body {
    font: 13px/1.5 var(--mac-font);
    background: var(--mac-bg);
    color: var(--mac-text);
    display: flex;
    flex-direction: column;
    letter-spacing: -0.01em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
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
    gap: 0.4rem;
    white-space: nowrap;
  }

  .mac-brand-mark {
    background: var(--mac-accent);
    color: #ffffff;
    font-size: 0.65rem;
    font-weight: 800;
    padding: 0.15rem 0.38rem;
    border-radius: 4px;
    letter-spacing: 0.04em;
    font-family: var(--mac-mono);
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

  /* Panel Toggle Buttons in Titlebar */
  .mac-panel-toggle {
    font-size: 0.76rem;
    color: var(--mac-text-secondary);
  }

  .mac-panel-toggle.active {
    background: rgba(10, 132, 255, 0.2);
    border-color: var(--mac-blue);
    color: #ffffff;
  }

  /* Hide / Close Button inside Sidebar Header */
  .mac-panel-close-btn {
    background: transparent;
    border: none;
    color: var(--mac-text-muted);
    font-size: 1.15rem;
    cursor: pointer;
    line-height: 1;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .mac-panel-close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--mac-text);
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

  /* Main Flexbox Layout (Seamless Sidebar Collapsing on Desktop/Tablet) */
  .mac-layout {
    display: flex;
    flex-direction: row;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    position: relative;
    width: 100%;
    height: 100%;
  }

  .mac-col {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    background: var(--mac-sidebar-bg);
    transition: width 0.22s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.18s ease;
  }

  .mac-col-left {
    width: 280px;
    min-width: 280px;
    border-right: 1px solid var(--mac-border);
    flex-shrink: 0;
  }

  .mac-col-left.collapsed {
    width: 0 !important;
    min-width: 0 !important;
    opacity: 0;
    pointer-events: none;
    border-right: none;
    overflow: hidden;
  }

  .mac-col-right {
    width: 340px;
    min-width: 340px;
    border-left: 1px solid var(--mac-border);
    background: var(--mac-window-bg);
    flex-shrink: 0;
  }

  .mac-col-right.collapsed {
    width: 0 !important;
    min-width: 0 !important;
    opacity: 0;
    pointer-events: none;
    border-left: none;
    overflow: hidden;
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
    background: rgba(10, 132, 255, 0.18);
    border-color: rgba(10, 132, 255, 0.7);
    border-left: 3.5px solid #0a84ff;
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
    color: #f1f5f9;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }

  .mac-sym-item.active .mac-sym-name {
    color: #ffffff;
    font-weight: 700;
  }

  .mac-sym-file {
    font-size: 0.73rem;
    color: #94a3b8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-left: 2px;
  }

  .mac-sym-item.active .mac-sym-file {
    color: #cbd5e1;
  }

  .mac-badge {
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.12rem 0.4rem;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    display: inline-block;
    flex-shrink: 0;
  }

  .mac-badge-fn { background: rgba(48, 209, 88, 0.25); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.3); }
  .mac-badge-method { background: rgba(56, 189, 248, 0.25); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
  .mac-badge-struct { background: rgba(248, 113, 113, 0.25); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.3); }
  .mac-badge-iface { background: rgba(250, 204, 21, 0.25); color: #facc15; border: 1px solid rgba(250, 204, 21, 0.3); }
  .mac-badge-type { background: rgba(192, 132, 252, 0.25); color: #c084fc; border: 1px solid rgba(192, 132, 252, 0.3); }
  .mac-badge-class { background: rgba(251, 113, 133, 0.25); color: #fb7185; border: 1px solid rgba(251, 113, 133, 0.3); }
  .mac-badge-bugfix { background: rgba(239, 68, 68, 0.25); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.3); }
  .mac-badge-decision { background: rgba(14, 165, 233, 0.25); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
  .mac-badge-procedure { background: rgba(34, 197, 94, 0.25); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.3); }
  .mac-badge-learning { background: rgba(234, 179, 8, 0.25); color: #facc15; border: 1px solid rgba(250, 204, 21, 0.3); }
  .mac-badge-research { background: rgba(168, 85, 247, 0.25); color: #c084fc; border: 1px solid rgba(192, 132, 252, 0.3); }
  .mac-badge-preference { background: rgba(244, 63, 94, 0.25); color: #fb7185; border: 1px solid rgba(251, 113, 133, 0.3); }
  .mac-badge-episode { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px dashed rgba(56, 189, 248, 0.4); }
  .mac-badge-episode-error { background: rgba(239, 68, 68, 0.25); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.4); font-weight: 700; }
  .mac-badge-episode-diff { background: rgba(168, 85, 247, 0.25); color: #c084fc; border: 1px solid rgba(192, 132, 252, 0.4); font-weight: 700; }
  .mac-badge-evidence { background: #38bdf8; color: #0b0f19; font-weight: 800; border: 1px solid #0284c7; }
  .mac-badge-status-active { background: rgba(48, 209, 88, 0.25); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.35); }
  .mac-badge-status-archived { background: rgba(255, 159, 10, 0.25); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.35); }
  .mac-badge-neutral,
  #inspectorBox .mac-badge {
    background: rgba(255, 255, 255, 0.08) !important;
    color: #e2e8f0 !important;
    border: 1px solid rgba(255, 255, 255, 0.15) !important;
    font-weight: 700;
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
    flex: 1;
    min-width: 0;
  }

  /* Sidebar Edge Handle Arrow Tabs */
  .mac-edge-handle {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 25;
    width: 22px;
    height: 48px;
    background: rgba(26, 26, 34, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--mac-border);
    color: var(--mac-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
    touch-action: manipulation;
  }

  .mac-edge-handle:hover {
    background: var(--mac-blue);
    border-color: #0071e3;
    color: #ffffff;
    width: 26px;
    box-shadow: 0 0 12px rgba(10, 132, 255, 0.4);
  }

  .mac-edge-left {
    left: 0;
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
    border-left: none;
  }

  .mac-edge-right {
    right: 0;
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
    border-right: none;
  }

  .mac-chevron-icon {
    transition: transform 0.22s ease;
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
    background: #090a0f;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    padding: 0.75rem 0.85rem;
    font-family: var(--mac-mono);
    font-size: 0.82rem;
    color: #7dd3fc;
    white-space: pre-wrap;
    word-break: break-all;
    overflow-wrap: anywhere;
    line-height: 1.55;
    max-height: 240px;
    overflow-y: auto;
    overflow-x: auto;
    user-select: text;
  }

  .mac-doc-panel {
    background: rgba(18, 20, 29, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-left: 3.5px solid #0a84ff;
    border-radius: 6px;
    padding: 0.75rem 0.85rem;
    font-size: 0.84rem;
    color: #f1f5f9;
    line-height: 1.6;
    word-break: break-word;
    overflow-wrap: anywhere;
    max-height: 200px;
    overflow-y: auto;
    user-select: text;
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

  /* Mobile Screens (<= 960px) */
  @media (max-width: 960px) {
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
      min-width: unset;
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
      min-width: unset;
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
      min-height: 38px;
    }

    .mac-tab-btn {
      padding: 0.2rem 0.45rem;
      font-size: 0.72rem;
    }

    .mac-toolbar {
      padding: 0.25rem 0.5rem;
      font-size: 0.72rem;
      flex-wrap: nowrap;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .mac-toolbar::-webkit-scrollbar { display: none; }

    /* Hide non-essential status pills on mobile to avoid clutter */
    #codebaseStatusPills .mac-pill:nth-child(2),
    #codebaseStatusPills .mac-pill:nth-child(4),
    #codebaseStatusPills .mac-pill:nth-child(5),
    #memoryStatusPills .mac-pill:nth-child(1),
    #memoryStatusPills .mac-pill:nth-child(4) {
      display: none;
    }

    /* Minimal Floating HUD on mobile: keep only Fit & Palette */
    #btnZoomIn,
    #btnZoomOut,
    #btnRelayout,
    #btnExportPng {
      display: none;
    }

    .mac-floating-hud {
      top: 0.4rem;
      left: 0.4rem;
      padding: 0.2rem 0.35rem;
      gap: 0.25rem;
    }

    .mac-hud-btn {
      padding: 0.2rem 0.45rem;
      font-size: 0.72rem;
    }

    /* Hide bottom legend on small mobile to maximize clean visual area */
    .mac-legend-hud {
      display: none;
    }

    /* Sleek compact edge handles on mobile */
    .mac-edge-handle {
      width: 18px;
      height: 40px;
    }
    .mac-edge-handle:hover {
      width: 20px;
    }

    .mac-meta-card {
      grid-template-columns: 1fr;
    }
  }
`;
