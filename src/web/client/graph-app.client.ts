export function renderClientScript(projectId: string): string {
  return `
  <script>
    // Global State Management
    let networkInstance = null;
    let nodeDataSet = null;
    let edgeDataSet = null;
    const nodeDataMap = new Map();
    let currentRawData = { nodes: [], edges: [] };
    let activeColorMode = 'kind';

    const communityPalette = [
      { background: '#38bdf8', border: '#0284c7', highlight: '#7dd3fc' }, // Sky
      { background: '#ec4899', border: '#db2777', highlight: '#f472b6' }, // Pink
      { background: '#22c55e', border: '#16a34a', highlight: '#4ade80' }, // Green
      { background: '#eab308', border: '#ca8a04', highlight: '#fde047' }, // Yellow
      { background: '#a855f7', border: '#9333ea', highlight: '#c084fc' }, // Purple
      { background: '#f97316', border: '#ea580c', highlight: '#fdba74' }, // Orange
      { background: '#06b6d4', border: '#0891b2', highlight: '#67e8f9' }, // Cyan
      { background: '#f43f5e', border: '#e11d48', highlight: '#fb7185' }, // Rose
      { background: '#14b8a6', border: '#0d9488', highlight: '#5eead4' }, // Teal
      { background: '#8b5cf6', border: '#7c3aed', highlight: '#a78bfa' }, // Violet
    ];

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

    function getCommunityColor(commId) {
      const idx = ((commId || 1) - 1) % communityPalette.length;
      return communityPalette[idx];
    }

    async function triggerReindex() {
      const btn = event.target;
      btn.innerText = '⏳ Indexing...';
      btn.disabled = true;
      try {
        const res = await fetch('/api/codebase/index', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '.' })
        });
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
      const c = document.getElementById('commFilter').value;
      let count = 0;

      document.querySelectorAll('.sym-item').forEach(el => {
        const name = el.getAttribute('data-name').toLowerCase();
        const file = el.getAttribute('data-file').toLowerCase();
        const kind = el.getAttribute('data-kind').toLowerCase();
        const comm = el.getAttribute('data-comm');

        const matchQ = !q || name.includes(q) || file.includes(q);
        const matchK = !k || kind === k;
        const matchC = !c || comm === c;

        if (matchQ && matchK && matchC) {
          el.style.display = '';
          count++;
        } else {
          el.style.display = 'none';
        }
      });
      const counter = document.getElementById('symFilteredCount');
      if (counter) counter.innerText = count;
    }

    function selectSymbol(name, kind, file, sig, doc, calls, commId, pr, deg, pkg) {
      document.querySelectorAll('.sym-item').forEach(el => el.classList.remove('active'));
      const target = Array.from(document.querySelectorAll('.sym-item')).find(el => el.getAttribute('data-name') === name);
      if (target) {
        target.classList.add('active');
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      document.getElementById('insName').innerText = name;
      document.getElementById('insKind').innerText = kind;
      document.getElementById('insKind').className = 'sym-kind kind-' + kind;
      
      const cCol = getCommunityColor(commId);
      const commEl = document.getElementById('insComm');
      commEl.innerText = 'COMMUNITY #' + (commId || 1);
      commEl.style.background = cCol.background;
      commEl.style.color = '#000000';
      commEl.style.fontWeight = '700';

      document.getElementById('insFile').innerText = file;
      document.getElementById('metaComm').innerText = '#' + (commId || 1);
      document.getElementById('metaPR').innerText = pr !== undefined ? pr : '-';
      document.getElementById('metaDeg').innerText = deg !== undefined ? deg : '-';
      document.getElementById('metaPkg').innerText = pkg || 'root';

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
        selectSymbol(
          targetNode.label,
          targetNode.kind,
          targetNode.file,
          targetNode.signature,
          targetNode.doc,
          targetNode.calls,
          targetNode.community_id,
          targetNode.pagerank,
          targetNode.degree,
          targetNode.package
        );
        networkInstance.selectNodes([targetNode.key]);
        networkInstance.focus(targetNode.key, {
          scale: 1.2,
          animation: { duration: 400, easingFunction: 'easeInOutQuad' }
        });
      }
    };

    function changeColorMode(mode) {
      activeColorMode = mode;
      if (!nodeDataSet) return;

      const updates = currentRawData.nodes.map(n => {
        let col;
        if (mode === 'louvain') {
          col = getCommunityColor(n.community_id);
        } else {
          col = kindColor[n.kind] || kindColor.default;
        }
        return {
          id: n.key,
          color: {
            background: col.background,
            border: col.border,
            highlight: { background: col.highlight, border: '#ffffff' },
            hover: { background: col.highlight, border: '#ffffff' }
          }
        };
      });

      nodeDataSet.update(updates);

      // Update Legend
      const legend = document.getElementById('graphLegend');
      if (mode === 'louvain') {
        legend.innerHTML = communityPalette.slice(0, 6).map((c, i) => \`
          <span><span class="legend-dot" style="background:\${c.background}"></span>Cluster #\${i+1}</span>
        \`).join('');
      } else {
        legend.innerHTML = \`
          <span><span class="legend-dot" style="background:var(--fn)"></span>Function</span>
          <span><span class="legend-dot" style="background:var(--method)"></span>Method</span>
          <span><span class="legend-dot" style="background:var(--struct)"></span>Struct</span>
          <span><span class="legend-dot" style="background:var(--class)"></span>Class</span>
          <span><span class="legend-dot" style="background:var(--iface)"></span>Interface</span>
          <span><span class="legend-dot" style="background:var(--type)"></span>Type</span>
        \`;
      }
    }

    async function initGraph() {
      const container = document.getElementById('networkContainer');
      try {
        const response = await fetch('/api/graph?project=${encodeURIComponent(projectId)}');
        currentRawData = await response.json();
      } catch (e) {
        currentRawData = { nodes: [], edges: [] };
      }

      const raw = currentRawData;
      const degree = {};
      raw.edges.forEach(e => {
        degree[e.source] = (degree[e.source] || 0) + 1;
        degree[e.target] = (degree[e.target] || 0) + 1;
      });

      // Count distinct Louvain communities
      const distinctComms = new Set(raw.nodes.map(n => n.community_id || 1));
      document.getElementById('nodeCount').innerText = raw.nodes.length;
      document.getElementById('edgeCount').innerText = raw.edges.length;
      document.getElementById('commCount').innerText = distinctComms.size;
      document.getElementById('symFilteredCount').innerText = raw.nodes.length;

      // Populate Community Filter
      const commFilterSelect = document.getElementById('commFilter');
      const commListSorted = Array.from(distinctComms).sort((a, b) => a - b);
      commFilterSelect.innerHTML = '<option value="">All Communities</option>' + 
        commListSorted.map(c => \`<option value="\${c}">Cluster #\${c}</option>\`).join('');

      nodeDataMap.clear();
      raw.nodes.forEach(n => nodeDataMap.set(n.key, n));

      // Populate left symbol list
      const symListContainer = document.getElementById('symbolList');
      if (raw.nodes.length > 0) {
        symListContainer.innerHTML = raw.nodes.map(n => \`
          <div class="sym-item" data-key="\${n.key}" data-name="\${n.label}" data-kind="\${n.kind}" data-comm="\${n.community_id || 1}" data-file="\${n.file}">
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
          title: n.label + ' (' + n.kind + ' in ' + n.file + ') | Louvain Cluster #' + (n.community_id || 1),
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
            selectSymbol(
              nodeData.label,
              nodeData.kind,
              nodeData.file,
              nodeData.signature,
              nodeData.doc,
              nodeData.calls,
              nodeData.community_id,
              nodeData.pagerank,
              nodeData.degree,
              nodeData.package
            );
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
  </script>`;
}
