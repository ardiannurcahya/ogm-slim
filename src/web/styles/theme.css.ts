export const themeCss = `
  :root {
    color-scheme: dark;
    --bg: #070b14;
    --panel: #0d1527;
    --panel-hover: #17233f;
    --panel-active: #1e3a5f;
    --border: #1a2744;
    --border-focus: #38bdf8;
    --text: #f8fafc;
    --muted: #8493a8;
    --accent: #38bdf8;
    --accent-glow: rgba(56, 189, 248, 0.25);
    --accent-bg: #0284c7;
    --fn: #22c55e;
    --method: #38bdf8;
    --struct: #f43f5e;
    --iface: #eab308;
    --type: #a855f7;
    --class: #ec4899;
    --pkg: #fb923c;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font: 13px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  header {
    background: #050810;
    border-bottom: 1px solid var(--border);
    padding: 0.6rem 1.2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;
  }
  header h1 {
    font-size: 1.1rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    letter-spacing: -0.01em;
  }
  header nav { display: flex; gap: 0.5rem; }
  header nav a {
    color: var(--text);
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 500;
    padding: 0.35rem 0.75rem;
    border-radius: 0.375rem;
    background: #111b2e;
    border: 1px solid var(--border);
    transition: all 0.15s ease;
  }
  header nav a:hover { background: var(--panel-hover); border-color: var(--accent); }
  .toolbar {
    background: #09101d;
    border-bottom: 1px solid var(--border);
    padding: 0.5rem 1.2rem;
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    flex-shrink: 0;
  }
  .stats-bar {
    display: flex;
    gap: 1.2rem;
    font-size: 0.82rem;
    color: var(--muted);
    align-items: center;
  }
  .stat-badge { color: var(--accent); font-weight: 700; }
  .controls { display: flex; gap: 0.5rem; align-items: center; }
  input, select, button {
    background: #0d1527;
    color: var(--text);
    border: 1px solid var(--border);
    padding: 0.4rem 0.7rem;
    border-radius: 0.375rem;
    font: inherit;
    font-size: 0.85rem;
  }
  input:focus, select:focus { outline: 2px solid var(--accent); border-color: transparent; }
  button {
    background: var(--accent-bg);
    color: white;
    cursor: pointer;
    font-weight: 600;
    border: none;
    transition: opacity 0.15s;
  }
  button:hover { opacity: 0.9; }
  .layout {
    display: grid;
    grid-template-columns: 320px 1fr 380px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  .col {
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: #070b14;
  }
  .col:last-child { border-right: none; }
  .col-header {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border);
    background: #09101d;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex-shrink: 0;
  }
  .col-title {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
    font-weight: 700;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .symbol-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  .sym-item {
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    background: #0d1527;
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all 0.15s;
  }
  .sym-item:hover { background: var(--panel-hover); border-color: var(--accent); }
  .sym-item.active { background: var(--panel-active); border-color: var(--accent); box-shadow: 0 0 10px var(--accent-glow); }
  .sym-kind {
    font-size: 0.65rem;
    text-transform: uppercase;
    padding: 0.15rem 0.4rem;
    border-radius: 0.25rem;
    font-weight: 700;
    display: inline-block;
    margin-right: 0.4rem;
    letter-spacing: 0.04em;
  }
  .kind-function { background: rgba(34, 197, 94, 0.2); color: var(--fn); border: 1px solid rgba(34, 197, 94, 0.4); }
  .kind-method { background: rgba(56, 189, 248, 0.2); color: var(--method); border: 1px solid rgba(56, 189, 248, 0.4); }
  .kind-struct { background: rgba(244, 63, 94, 0.2); color: var(--struct); border: 1px solid rgba(244, 63, 94, 0.4); }
  .kind-interface { background: rgba(234, 179, 8, 0.2); color: var(--iface); border: 1px solid rgba(234, 179, 8, 0.4); }
  .kind-type { background: rgba(168, 85, 247, 0.2); color: var(--type); border: 1px solid rgba(168, 85, 247, 0.4); }
  .kind-class { background: rgba(236, 72, 153, 0.2); color: var(--class); border: 1px solid rgba(236, 72, 153, 0.4); }
  .comm-badge {
    font-size: 0.65rem;
    padding: 0.15rem 0.4rem;
    border-radius: 0.25rem;
    font-weight: 700;
    display: inline-block;
    margin-right: 0.3rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  .sym-name { font-weight: 600; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.88rem; }
  .sym-file { font-size: 0.72rem; color: var(--muted); margin-top: 0.2rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .graph-view {
    position: relative;
    background: radial-gradient(circle at 50% 50%, #0d1629 0%, #050811 100%);
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
  .graph-toolbar {
    position: absolute;
    top: 1rem;
    left: 1rem;
    z-index: 10;
    display: flex;
    gap: 0.4rem;
    background: rgba(13, 21, 39, 0.85);
    backdrop-filter: blur(8px);
    padding: 0.35rem 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border);
    align-items: center;
  }
  .graph-btn {
    background: #17233f;
    color: var(--text);
    padding: 0.35rem 0.65rem;
    border-radius: 0.3rem;
    font-size: 0.8rem;
    cursor: pointer;
    border: 1px solid #24355a;
    transition: all 0.15s;
  }
  .graph-btn:hover { background: #24355a; border-color: var(--accent); }
  .graph-legend {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    z-index: 10;
    display: flex;
    gap: 0.6rem;
    background: rgba(13, 21, 39, 0.85);
    backdrop-filter: blur(8px);
    padding: 0.4rem 0.8rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border);
    font-size: 0.75rem;
    flex-wrap: wrap;
  }
  .legend-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 0.3rem;
  }
  .inspector-body {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    background: #09101d;
    padding: 0.6rem;
    border-radius: 0.375rem;
    border: 1px solid var(--border);
  }
  .meta-item { font-size: 0.78rem; }
  .meta-label { color: var(--muted); margin-bottom: 0.1rem; }
  .meta-val { font-weight: 700; color: var(--accent); font-family: ui-monospace, monospace; }
  .code-block {
    background: #050810;
    padding: 0.75rem;
    border-radius: 0.375rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.82rem;
    overflow-x: auto;
    border: 1px solid var(--border);
    white-space: pre-wrap;
    color: #38bdf8;
    line-height: 1.45;
  }
  .doc-box {
    background: #0d1527;
    padding: 0.75rem;
    border-left: 3px solid var(--accent);
    border-radius: 0.25rem;
    font-size: 0.82rem;
    color: #cbd5e1;
    line-height: 1.45;
  }
  .node-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    background: #0d1527;
    border: 1px solid #24355a;
    padding: 0.25rem 0.5rem;
    border-radius: 0.3rem;
    font-family: ui-monospace, monospace;
    font-size: 0.78rem;
    margin: 0.15rem;
    cursor: pointer;
    transition: all 0.15s;
  }
  .node-chip:hover { border-color: var(--accent); background: var(--panel-hover); color: var(--accent); }
  @media (max-width: 64rem) {
    .layout { grid-template-columns: 1fr; height: auto; }
    #networkContainer { min-height: 50vh; position: relative; }
  }
`;
