export function renderGraphHtml(projectId: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>OGM-Slim Codebase Knowledge Graph</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #090d16;
      --panel: #0f172a;
      --panel-hover: #1e293b;
      --panel-active: #1e3a5f;
      --border: #1e293b;
      --border-focus: #38bdf8;
      --text: #f8fafc;
      --muted: #94a3b8;
      --accent: #38bdf8;
      --accent-glow: rgba(56, 189, 248, 0.2);
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
      background: #060911;
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
      background: #111827;
      border: 1px solid var(--border);
      transition: all 0.15s ease;
    }
    header nav a:hover { background: var(--panel-hover); border-color: var(--accent); }
    .toolbar {
      background: #0b1120;
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
      background: #111827;
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
      background: #080d1a;
    }
    .col:last-child { border-right: none; }
    .col-header {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border);
      background: #0b1120;
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
      background: #0f172a;
      border: 1px solid #1e293b;
      cursor: pointer;
      transition: all 0.15s;
    }
    .sym-item:hover { background: var(--panel-hover); border-color: var(--accent); }
    .sym-item.active { background: var(--panel-active); border-color: var(--accent); box-shadow: 0 0 8px var(--accent-glow); }
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
      background: radial-gradient(circle at 50% 50%, #0d1527 0%, #060911 100%);
      display: flex;
      flex-direction: column;
    }
    #sigmaContainer {
      flex: 1;
      width: 100%;
      height: 100%;
      position: relative;
    }
    .graph-toolbar {
      position: absolute;
      top: 1rem;
      left: 1rem;
      z-index: 10;
      display: flex;
      gap: 0.4rem;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(8px);
      padding: 0.35rem 0.5rem;
      border-radius: 0.5rem;
      border: 1px solid var(--border);
    }
    .graph-btn {
      background: #1e293b;
      color: var(--text);
      padding: 0.35rem 0.65rem;
      border-radius: 0.3rem;
      font-size: 0.8rem;
      cursor: pointer;
      border: 1px solid #334155;
      transition: all 0.15s;
    }
    .graph-btn:hover { background: #334155; border-color: var(--accent); }
    .graph-legend {
      position: absolute;
      bottom: 1rem;
      left: 1rem;
      z-index: 10;
      display: flex;
      gap: 0.6rem;
      background: rgba(15, 23, 42, 0.85);
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
      background: #060911;
      padding: 0.75rem;
      border-radius: 0.375rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.82rem;
      overflow-x: auto;
      border: 1px solid #1e293b;
      white-space: pre-wrap;
      color: #38bdf8;
      line-height: 1.45;
    }
    .doc-box {
      background: #0f172a;
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
      background: #0f172a;
      border: 1px solid #334155;
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
      #sigmaContainer { min-height: 50vh; }
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

    <!-- Center Column: Sigma.js Canvas -->
    <div class="col graph-view">
      <div class="graph-toolbar">
        <button class="graph-btn" id="btnZoomIn" title="Zoom In">+</button>
        <button class="graph-btn" id="btnZoomOut" title="Zoom Out">-</button>
        <button class="graph-btn" id="btnReset" title="Reset Camera">Fit View</button>
        <button class="graph-btn" id="btnLayout" title="Relayout">⚡ Relayout</button>
      </div>
      <div id="sigmaContainer"></div>
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
    let globalSymbols = [];
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
        document.getElementById('insCalls').innerHTML = callList.map(c => '<span class="node-chip" onclick="if(window.jumpToNode)window.jumpToNode(\\'' + c + '\\')">' + c + '</span>').join(' ');
      } else {
        document.getElementById('insCalls').innerHTML = '<span style="color:var(--muted)">No downstream callees detected</span>';
      }
      if (window.highlightGraphNode) {
        window.highlightGraphNode(name);
      }
    }
  </script>

  <script type="module">
    import { Graph } from 'https://cdn.jsdelivr.net/npm/graphology@0.25.4/+esm';
    import Sigma from 'https://cdn.jsdelivr.net/npm/sigma@3.0.3/+esm';

    const container = document.getElementById('sigmaContainer');
    if (container) {
      let raw = { nodes: [], edges: [] };
      try {
        const response = await fetch('/api/graph?project=${encodeURIComponent(projectId)}');
        raw = await response.json();
      } catch (e) {
        raw = { nodes: [], edges: [] };
      }

      const kindColor = {
        function: '#22c55e',
        method: '#38bdf8',
        struct: '#f43f5e',
        interface: '#eab308',
        type: '#a855f7',
        class: '#ec4899',
        package: '#fb923c',
        default: '#94a3b8'
      };

      const degree = {};
      raw.edges.forEach(e => {
        degree[e.source] = (degree[e.source] || 0) + 1;
        degree[e.target] = (degree[e.target] || 0) + 1;
      });

      document.getElementById('nodeCount').innerText = raw.nodes.length;
      document.getElementById('edgeCount').innerText = raw.edges.length;
      document.getElementById('symFilteredCount').innerText = raw.nodes.length;

      // Populate left symbol list
      const symListContainer = document.getElementById('symbolList');
      if (raw.nodes.length > 0) {
        symListContainer.innerHTML = raw.nodes.map(n => \`
          <div class="sym-item" data-name="\${n.label}" data-kind="\${n.kind}" data-file="\${n.file}" onclick="selectSymbol('\${n.label}', '\${n.kind}', '\${n.file}', '\${n.signature.replace(/'/g, "\\\\'")}', '\${(n.doc||'').replace(/'/g, "\\\\'")}', \${JSON.stringify(n.calls||[])})">
            <span class="sym-kind kind-\${n.kind}">\${n.kind}</span>
            <span class="sym-name">\${n.label}</span>
            <div class="sym-file">\${n.file}</div>
          </div>
        \`).join('');
      } else {
        symListContainer.innerHTML = '<p style="color:var(--muted);padding:1rem">No symbols indexed yet. Click "Re-Index Codebase Now".</p>';
      }

      const graph = new Graph();
      const nodeKeyMap = {};

      raw.nodes.forEach(n => {
        nodeKeyMap[n.label] = n.key;
        const deg = degree[n.key] || n.degree || 0;
        graph.addNode(n.key, {
          label: n.label,
          x: 0,
          y: 0,
          size: Math.min(24, Math.max(5, 5 + Math.sqrt(deg) * 3.5)),
          color: kindColor[n.kind] || kindColor.default,
          originalColor: kindColor[n.kind] || kindColor.default,
          kind: n.kind,
          file: n.file,
          signature: n.signature,
          doc: n.doc,
          calls: n.calls || []
        });
      });

      raw.edges.forEach(e => {
        if (graph.hasNode(e.source) && graph.hasNode(e.target)) {
          if (!graph.hasEdge(e.source, e.target)) {
            graph.addEdge(e.source, e.target, { color: '#1e293b', size: 1.2, originalColor: '#1e293b' });
          }
        }
      });

      function runLayout() {
        const keys = graph.nodes();
        const len = keys.length;
        if (len === 0) return;
        const pos = {};
        keys.forEach((k, i) => {
          const a = (i / len) * Math.PI * 2;
          const r = 80 + Math.sqrt(len) * 28;
          pos[k] = { x: Math.cos(a) * r, y: Math.sin(a) * r };
        });

        const adj = {};
        graph.edges().forEach(e => {
          const s = graph.source(e);
          const t = graph.target(e);
          (adj[s] = adj[s] || []).push(t);
          (adj[t] = adj[t] || []).push(s);
        });

        for (let it = 0; it < 120; it++) {
          const cool = 0.15 * (1 - it / 120);
          keys.forEach(k => {
            const p = pos[k];
            for (let s = 0; s < 10; s++) {
              const o = keys[Math.floor(Math.random() * len)];
              if (o === k) continue;
              const q = pos[o];
              const dx = p.x - q.x;
              const dy = p.y - q.y;
              const d = Math.max(20, Math.sqrt(dx * dx + dy * dy));
              const f = (8000 / (d * d)) * cool;
              p.x += (dx / d) * f;
              p.y += (dy / d) * f;
            }
            (adj[k] || []).forEach(nb => {
              const q = pos[nb];
              const dx = q.x - p.x;
              const dy = q.y - p.y;
              const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
              const f = (d - 60) * 0.003 * (it / 120 + 0.2);
              p.x += (dx / d) * f;
              p.y += (dy / d) * f;
            });
          });
        }

        keys.forEach(k => {
          graph.setNodeAttribute(k, 'x', pos[k].x);
          graph.setNodeAttribute(k, 'y', pos[k].y);
        });
      }

      runLayout();

      const renderer = new Sigma(graph, container, {
        renderEdgeLabels: false,
        labelColor: { color: '#e2e8f0' },
        labelSize: 11,
        labelFont: 'ui-monospace, monospace',
        defaultDrawNodeHover: (context, data, settings) => {
          context.beginPath();
          context.arc(data.x, data.y, data.size + 4, 0, Math.PI * 2);
          context.fillStyle = 'rgba(56, 189, 248, 0.3)';
          context.fill();
        }
      });

      function fitView() {
        const keys = graph.nodes();
        if (keys.length === 0) return;
        let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
        keys.forEach(k => {
          const x = graph.getNodeAttribute(k, 'x');
          const y = graph.getNodeAttribute(k, 'y');
          minX = Math.min(minX, x); maxX = Math.max(maxX, x);
          minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        });
        const w = container.clientWidth || 600;
        const h = container.clientHeight || 400;
        const ratio = Math.min(1.2, Math.max(0.2, Math.max((maxX - minX + 100) / w, (maxY - minY + 100) / h)));
        renderer.getCamera().animate({ x: (minX + maxX) / 2, y: (minY + maxY) / 2, ratio: ratio }, { duration: 300 });
      }

      fitView();

      window.highlightGraphNode = function(nodeNameOrKey) {
        let key = graph.hasNode(nodeNameOrKey) ? nodeNameOrKey : nodeKeyMap[nodeNameOrKey];
        if (!key) return;
        const neighbors = new Set(graph.neighbors(key));
        neighbors.add(key);

        graph.forEachNode((k, attrs) => {
          if (neighbors.has(k)) {
            graph.setNodeAttribute(k, 'color', attrs.originalColor);
          } else {
            graph.setNodeAttribute(k, 'color', '#1e293b');
          }
        });

        graph.forEachEdge((edge, attrs, source, target) => {
          if (source === key || target === key) {
            graph.setEdgeAttribute(edge, 'color', '#38bdf8');
            graph.setEdgeAttribute(edge, 'size', 2.5);
          } else {
            graph.setEdgeAttribute(edge, 'color', '#0f172a');
            graph.setEdgeAttribute(edge, 'size', 0.5);
          }
        });

        renderer.refresh();
      };

      window.jumpToNode = function(nodeLabel) {
        const key = nodeKeyMap[nodeLabel];
        if (key && graph.hasNode(key)) {
          const attrs = graph.getNodeAttributes(key);
          selectSymbol(attrs.label, attrs.kind, attrs.file, attrs.signature, attrs.doc, attrs.calls || []);
          renderer.getCamera().animate({ x: attrs.x, y: attrs.y, ratio: 0.4 }, { duration: 300 });
        }
      };

      let dragged = null;
      renderer.on('downNode', e => {
        dragged = e.node;
        renderer.getCamera().disable();
      });

      renderer.getMouseCaptor().on('mousemove', e => {
        if (dragged) {
          const p = renderer.viewportToGraph({ x: e.x, y: e.y });
          graph.setNodeAttribute(dragged, 'x', p.x);
          graph.setNodeAttribute(dragged, 'y', p.y);
          renderer.refresh();
        }
      });

      renderer.getMouseCaptor().on('mouseup', () => {
        if (dragged) {
          dragged = null;
          renderer.getCamera().enable();
        }
      });

      renderer.on('clickNode', e => {
        const n = graph.getNodeAttributes(e.node);
        selectSymbol(n.label, n.kind, n.file, n.signature, n.doc, n.calls || []);
      });

      renderer.on('clickStage', () => {
        graph.forEachNode((k, attrs) => {
          graph.setNodeAttribute(k, 'color', attrs.originalColor);
        });
        graph.forEachEdge((edge, attrs) => {
          graph.setEdgeAttribute(edge, 'color', attrs.originalColor || '#1e293b');
          graph.setEdgeAttribute(edge, 'size', 1.2);
        });
        renderer.refresh();
      });

      document.getElementById('btnZoomIn').addEventListener('click', () => {
        renderer.getCamera().animatedZoom({ factor: 1.4, duration: 200 });
      });
      document.getElementById('btnZoomOut').addEventListener('click', () => {
        renderer.getCamera().animatedUnzoom({ factor: 1.4, duration: 200 });
      });
      document.getElementById('btnReset').addEventListener('click', fitView);
      document.getElementById('btnLayout').addEventListener('click', () => {
        runLayout();
        fitView();
        renderer.refresh();
      });

      const filterInput = document.getElementById('symFilter');
      if (filterInput) {
        filterInput.addEventListener('input', () => {
          const q = filterInput.value.toLowerCase();
          graph.forEachNode((k, attrs) => {
            const hit = !q || (attrs.label || '').toLowerCase().includes(q) || (attrs.file || '').toLowerCase().includes(q);
            graph.setNodeAttribute(k, 'color', hit ? attrs.originalColor : '#1e293b');
            graph.setNodeAttribute(k, 'size', hit ? Math.min(24, Math.max(5, 5 + Math.sqrt(degree[k] || 0) * 3.5)) : 2);
          });
          renderer.refresh();
        });
      }
    }
  </script>
</body>
</html>`;
}
