export function renderGraphHtml(projectId: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>OGM-Slim Codebase Knowledge Graph</title>
  <script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
  <style>
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
  </style>
</head>
<body>
  <header>
    <h1>🧠 OGM-Slim Codebase Knowledge Graph</h1>
    <nav>
      <a href="/admin">&larr; Dashboard</a>
      <a href="javascript:location.reload()">Refresh Graph</a>
    </nav>
  </header>
  <div class="toolbar">
    <div class="stats-bar">
      <div>Project: <strong style="color:var(--text)" id="projId">${projectId}</strong></div>
      <div>Nodes: <span class="stat-badge" id="nodeCount">-</span></div>
      <div>Edges: <span class="stat-badge" id="edgeCount">-</span></div>
    </div>
    <div class="controls">
      <button onclick="triggerReindex()">⚡ Re-Index Codebase Now</button>
    </div>
  </div>
  <div class="layout">
    <!-- Left Column: Symbol Explorer -->
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
        </div>
      </div>
      <div class="symbol-list" id="symbolList">
        <p style="color:var(--muted);padding:1rem">Loading symbols...</p>
      </div>
    </div>

    <!-- Center Column: Graph Canvas -->
    <div class="col graph-view">
      <div class="graph-toolbar">
        <button class="graph-btn" id="btnZoomIn" title="Zoom In">+</button>
        <button class="graph-btn" id="btnZoomOut" title="Zoom Out">-</button>
        <button class="graph-btn" id="btnReset" title="Fit View">Fit View</button>
        <button class="graph-btn" id="btnRelayout" title="Relayout">⚡ Relayout</button>
      </div>
      <div id="networkContainer"></div>
      <div class="graph-legend">
        <span><span class="legend-dot" style="background:var(--fn)"></span>Function</span>
        <span><span class="legend-dot" style="background:var(--method)"></span>Method</span>
        <span><span class="legend-dot" style="background:var(--struct)"></span>Struct</span>
        <span><span class="legend-dot" style="background:var(--class)"></span>Class</span>
        <span><span class="legend-dot" style="background:var(--iface)"></span>Interface</span>
        <span><span class="legend-dot" style="background:var(--type)"></span>Type</span>
      </div>
    </div>

    <!-- Right Column: Inspector -->
    <div class="col">
      <div class="col-header">
        <div class="col-title">Symbol Contract Inspector</div>
      </div>
      <div class="inspector-body" id="inspectorBox">
        <div>
          <span class="sym-kind" id="insKind" style="background:#0284c7;color:white">SELECT SYMBOL</span>
          <h2 id="insName" style="margin:0.4rem 0;font-size:1.1rem;font-family:ui-monospace,monospace;word-break:break-all">Click any node in graph</h2>
          <div id="insFile" style="font-size:0.8rem;color:var(--muted)">Location will show here</div>
        </div>
        <div>
          <div style="font-size:0.8rem;color:var(--muted);margin-bottom:0.3rem;font-weight:600">Type Signature</div>
          <pre class="code-block" id="insSig">// Select a function, method, or struct</pre>
        </div>
        <div>
          <div style="font-size:0.8rem;color:var(--muted);margin-bottom:0.3rem;font-weight:600">Contract & Docstrings</div>
          <div class="doc-box" id="insDoc">No symbol selected.</div>
        </div>
        <div>
          <div style="font-size:0.8rem;color:var(--muted);margin-bottom:0.3rem;font-weight:600">Outgoing Callees</div>
          <div id="insCalls" style="font-size:0.85rem;color:var(--text)">-</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    let networkInstance = null;
    let nodeDataSet = null;
    let edgeDataSet = null;
    const nodeDataMap = new Map();

    async function triggerReindex() {
      const btn = event.target;
      btn.innerText = '⏳ Indexing...';
      btn.disabled = true;
      try {
        const res = await fetch('/api/codebase/index', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: '.' }) });
        const data = await res.json();
        alert('Indexing complete: ' + data.filesIndexed + ' files, ' + data.symbolsCount + ' symbols in ' + data.durationMs + 'ms');
        location.reload();
      } catch (err) {
        alert('Indexing error: ' + err.message);
      } finally {
        btn.innerText = '⚡ Re-Index Codebase Now';
        btn.disabled = false;
      }
    }

    function filterSymbols() {
      const q = (document.getElementById('symFilter').value || '').toLowerCase();
      const k = (document.getElementById('kindFilter').value || '').toLowerCase();
      let count = 0;
      document.querySelectorAll('.sym-item').forEach(el => {
        const name = el.getAttribute('data-name').toLowerCase();
        const file = el.getAttribute('data-file').toLowerCase();
        const kind = el.getAttribute('data-kind').toLowerCase();
        const matchQ = !q || name.includes(q) || file.includes(q);
        const matchK = !k || kind === k;
        if (matchQ && matchK) {
          el.style.display = '';
          count++;
        } else {
          el.style.display = 'none';
        }
      });
      const counter = document.getElementById('symFilteredCount');
      if (counter) counter.innerText = count;
    }

    function selectSymbol(name, kind, file, sig, doc, calls) {
      document.querySelectorAll('.sym-item').forEach(el => el.classList.remove('active'));
      const target = Array.from(document.querySelectorAll('.sym-item')).find(el => el.getAttribute('data-name') === name);
      if (target) {
        target.classList.add('active');
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      document.getElementById('insName').innerText = name;
      document.getElementById('insKind').innerText = kind;
      document.getElementById('insKind').className = 'sym-kind kind-' + kind;
      document.getElementById('insFile').innerText = file;
      document.getElementById('insSig').innerText = sig || name;
      document.getElementById('insDoc').innerText = doc || 'No docstring comment provided.';
      const callList = Array.isArray(calls) ? calls : (calls ? calls.split(',').filter(Boolean) : []);
      if (callList.length > 0) {
        document.getElementById('insCalls').innerHTML = callList.map(c => '<span class="node-chip" onclick="jumpToNode(\\'' + c + '\\')">' + c + '</span>').join(' ');
      } else {
        document.getElementById('insCalls').innerHTML = '<span style="color:var(--muted)">No downstream callees detected</span>';
      }
    }

    window.jumpToNode = function(nodeLabelOrKey) {
      let targetNode = nodeDataMap.get(nodeLabelOrKey);
      if (!targetNode) {
        for (const [k, v] of nodeDataMap.entries()) {
          if (v.label === nodeLabelOrKey) {
            targetNode = v;
            break;
          }
        }
      }
      if (targetNode && networkInstance) {
        selectSymbol(targetNode.label, targetNode.kind, targetNode.file, targetNode.signature, targetNode.doc, targetNode.calls);
        networkInstance.selectNodes([targetNode.key]);
        networkInstance.focus(targetNode.key, {
          scale: 1.2,
          animation: { duration: 400, easingFunction: 'easeInOutQuad' }
        });
      }
    };

    async function initGraph() {
      const container = document.getElementById('networkContainer');
      let raw = { nodes: [], edges: [] };
      try {
        const response = await fetch('/api/graph?project=${encodeURIComponent(projectId)}');
        raw = await response.json();
      } catch (e) {
        raw = { nodes: [], edges: [] };
      }

      const kindColor = {
        function: { background: '#22c55e', border: '#16a34a', highlight: '#4ade80' },
        method: { background: '#38bdf8', border: '#0284c7', highlight: '#7dd3fc' },
        struct: { background: '#f43f5e', border: '#e11d48', highlight: '#fb7185' },
        interface: { background: '#eab308', border: '#ca8a04', highlight: '#fde047' },
        type: { background: '#a855f7', border: '#9333ea', highlight: '#c084fc' },
        class: { background: '#ec4899', border: '#db2777', highlight: '#f472b6' },
        package: { background: '#fb923c', border: '#ea580c', highlight: '#fdba74' },
        default: { background: '#64748b', border: '#475569', highlight: '#94a3b8' }
      };

      const degree = {};
      raw.edges.forEach(e => {
        degree[e.source] = (degree[e.source] || 0) + 1;
        degree[e.target] = (degree[e.target] || 0) + 1;
      });

      document.getElementById('nodeCount').innerText = raw.nodes.length;
      document.getElementById('edgeCount').innerText = raw.edges.length;
      document.getElementById('symFilteredCount').innerText = raw.nodes.length;

      nodeDataMap.clear();
      raw.nodes.forEach(n => nodeDataMap.set(n.key, n));

      // Populate left symbol list
      const symListContainer = document.getElementById('symbolList');
      if (raw.nodes.length > 0) {
        symListContainer.innerHTML = raw.nodes.map(n => \`
          <div class="sym-item" data-key="\${n.key}" data-name="\${n.label}" data-kind="\${n.kind}" data-file="\${n.file}">
            <span class="sym-kind kind-\${n.kind}">\${n.kind}</span>
            <span class="sym-name">\${n.label}</span>
            <div class="sym-file">\${n.file}</div>
          </div>
        \`).join('');

        symListContainer.querySelectorAll('.sym-item').forEach(el => {
          el.addEventListener('click', () => {
            const key = el.getAttribute('data-key');
            jumpToNode(key);
          });
        });
      } else {
        symListContainer.innerHTML = '<p style="color:var(--muted);padding:1rem">No symbols indexed yet. Click "Re-Index Codebase Now".</p>';
      }

      if (typeof vis === 'undefined') {
        container.innerHTML = '<div style="color:var(--muted);padding:2rem;text-align:center">Loading visualizer...</div>';
        return;
      }

      const visNodes = raw.nodes.map(n => {
        const deg = degree[n.key] || n.degree || 0;
        const col = kindColor[n.kind] || kindColor.default;
        return {
          id: n.key,
          label: n.label,
          title: n.label + ' (' + n.kind + ' in ' + n.file + ')',
          shape: 'dot',
          size: Math.min(30, Math.max(12, 12 + Math.sqrt(deg) * 3)),
          color: {
            background: col.background,
            border: col.border,
            highlight: { background: col.highlight, border: '#ffffff' },
            hover: { background: col.highlight, border: '#ffffff' }
          },
          font: { color: '#f8fafc', size: 12, face: 'ui-monospace, monospace' },
          borderWidth: 2,
          shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', size: 5, x: 2, y: 2 }
        };
      });

      const visEdges = raw.edges.map(e => ({
        from: e.source,
        to: e.target,
        arrows: 'to',
        color: { color: '#1e3a5f', highlight: '#38bdf8', hover: '#38bdf8' },
        width: 1.2,
        smooth: { type: 'continuous' }
      }));

      nodeDataSet = new vis.DataSet(visNodes);
      edgeDataSet = new vis.DataSet(visEdges);

      const options = {
        interaction: {
          hover: true,
          tooltipDelay: 100,
          hideEdgesOnDrag: false,
          zoomView: true,
          dragView: true
        },
        physics: {
          solver: 'forceAtlas2Based',
          forceAtlas2Based: {
            gravitationalConstant: -50,
            centralGravity: 0.01,
            springLength: 90,
            springConstant: 0.08,
            damping: 0.4
          },
          stabilization: {
            enabled: true,
            iterations: 150,
            updateInterval: 25
          }
        }
      };

      networkInstance = new vis.Network(container, { nodes: nodeDataSet, edges: edgeDataSet }, options);

      networkInstance.on('click', function(params) {
        if (params.nodes.length > 0) {
          const selectedId = params.nodes[0];
          const nodeData = nodeDataMap.get(selectedId);
          if (nodeData) {
            selectSymbol(nodeData.label, nodeData.kind, nodeData.file, nodeData.signature, nodeData.doc, nodeData.calls);
          }
        }
      });

      document.getElementById('btnZoomIn').addEventListener('click', () => {
        networkInstance.moveTo({ scale: networkInstance.getScale() * 1.3 });
      });
      document.getElementById('btnZoomOut').addEventListener('click', () => {
        networkInstance.moveTo({ scale: networkInstance.getScale() * 0.7 });
      });
      document.getElementById('btnReset').addEventListener('click', () => {
        networkInstance.fit({ animation: { duration: 400 } });
      });
      document.getElementById('btnRelayout').addEventListener('click', () => {
        networkInstance.stabilize(100);
        networkInstance.fit({ animation: { duration: 400 } });
      });
    }

    window.addEventListener('DOMContentLoaded', initGraph);
  </script>
</body>
</html>`;
}
