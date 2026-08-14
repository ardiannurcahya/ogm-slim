export function renderClientScript(projectId: string): string {
  return `
  <script>
    let networkInstance = null;
    let nodeDataSet = null;
    let edgeDataSet = null;
    const nodeDataMap = new Map();
    let currentRawData = { nodes: [], edges: [] };
    let activeColorMode = 'kind';

    // Apple System Color Palettes (macOS Dark Vibrancy)
    const macCommunityPalette = [
      { background: '#0a84ff', border: '#0071e3', highlight: '#64d2ff' }, // Apple Blue
      { background: '#30d158', border: '#24a148', highlight: '#6be585' }, // Apple Green
      { background: '#bf5af2', border: '#9e3fe0', highlight: '#da8fff' }, // Apple Purple
      { background: '#ff9f0a', border: '#cc7a00', highlight: '#ffb340' }, // Apple Orange
      { background: '#64d2ff', border: '#33b1e6', highlight: '#99e0ff' }, // Apple Teal
      { background: '#ff375f', border: '#d62045', highlight: '#ff6685' }, // Apple Pink
      { background: '#ffd60a', border: '#cca700', highlight: '#ffe047' }, // Apple Yellow
      { background: '#ff453a', border: '#d62d24', highlight: '#ff6961' }, // Apple Red
      { background: '#5e5ce6', border: '#4644cc', highlight: '#8382eb' }, // Apple Indigo
      { background: '#8e8e93', border: '#636366', highlight: '#aeaeb2' }, // Apple Gray
    ];

    const macKindColor = {
      function: { background: '#30d158', border: '#24a148', highlight: '#6be585' },
      method: { background: '#64d2ff', border: '#33b1e6', highlight: '#99e0ff' },
      struct: { background: '#ff453a', border: '#d62d24', highlight: '#ff6961' },
      interface: { background: '#ffd60a', border: '#cca700', highlight: '#ffe047' },
      type: { background: '#bf5af2', border: '#9e3fe0', highlight: '#da8fff' },
      class: { background: '#ff375f', border: '#d62045', highlight: '#ff6685' },
      package: { background: '#ff9f0a', border: '#cc7a00', highlight: '#ffb340' },
      default: { background: '#8e8e93', border: '#636366', highlight: '#aeaeb2' }
    };

    function getCommunityColor(commId) {
      const idx = ((commId || 1) - 1) % macCommunityPalette.length;
      return macCommunityPalette[idx];
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
        btn.innerText = '⚡ Re-Index Codebase';
        btn.disabled = false;
      }
    }

    function filterSymbols() {
      const q = (document.getElementById('symFilter').value || '').toLowerCase();
      const k = (document.getElementById('kindFilter').value || '').toLowerCase();
      const c = document.getElementById('commFilter').value;
      let count = 0;

      document.querySelectorAll('.mac-sym-item').forEach(el => {
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
      document.querySelectorAll('.mac-sym-item').forEach(el => el.classList.remove('active'));
      const target = Array.from(document.querySelectorAll('.mac-sym-item')).find(el => el.getAttribute('data-name') === name);
      if (target) {
        target.classList.add('active');
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      document.getElementById('insName').innerText = name;
      document.getElementById('insKind').innerText = kind;
      document.getElementById('insKind').className = 'mac-badge mac-badge-' + kind;
      
      const cCol = getCommunityColor(commId);
      const commEl = document.getElementById('insComm');
      commEl.innerText = 'CLUSTER #' + (commId || 1);
      commEl.style.background = cCol.background;
      commEl.style.color = '#ffffff';

      document.getElementById('insFile').innerText = file;
      document.getElementById('metaComm').innerText = '#' + (commId || 1);
      document.getElementById('metaPR').innerText = pr !== undefined ? pr : '-';
      document.getElementById('metaDeg').innerText = deg !== undefined ? deg : '-';
      document.getElementById('metaPkg').innerText = pkg || 'root';

      document.getElementById('insSig').innerText = sig || name;
      document.getElementById('insDoc').innerText = doc || 'No docstring comment provided.';

      const callList = Array.isArray(calls) ? calls : (calls ? calls.split(',').filter(Boolean) : []);
      if (callList.length > 0) {
        document.getElementById('insCalls').innerHTML = callList.map(c => '<span class="mac-chip" onclick="jumpToNode(\\'' + c + '\\')">' + c + '</span>').join(' ');
      } else {
        document.getElementById('insCalls').innerHTML = '<span style="color:var(--mac-text-muted)">No downstream callees</span>';
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
          animation: { duration: 350, easingFunction: 'easeInOutQuad' }
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
          col = macKindColor[n.kind] || macKindColor.default;
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

      // Update Legend HUD
      const legend = document.getElementById('graphLegend');
      if (mode === 'louvain') {
        legend.innerHTML = macCommunityPalette.slice(0, 6).map((c, i) => \`
          <span><span class="mac-legend-dot" style="background:\${c.background}"></span>Cluster #\${i+1}</span>
        \`).join('');
      } else {
        legend.innerHTML = \`
          <span><span class="mac-legend-dot" style="background:var(--mac-green)"></span>Function</span>
          <span><span class="mac-legend-dot" style="background:var(--mac-teal)"></span>Method</span>
          <span><span class="mac-legend-dot" style="background:var(--mac-red)"></span>Struct</span>
          <span><span class="mac-legend-dot" style="background:var(--mac-pink)"></span>Class</span>
          <span><span class="mac-legend-dot" style="background:var(--mac-yellow)"></span>Interface</span>
          <span><span class="mac-legend-dot" style="background:var(--mac-purple)"></span>Type</span>
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

      const distinctComms = new Set(raw.nodes.map(n => n.community_id || 1));
      document.getElementById('nodeCount').innerText = raw.nodes.length;
      document.getElementById('edgeCount').innerText = raw.edges.length;
      document.getElementById('commCount').innerText = distinctComms.size;
      document.getElementById('symFilteredCount').innerText = raw.nodes.length;

      // Populate Community Filter
      const commFilterSelect = document.getElementById('commFilter');
      const commListSorted = Array.from(distinctComms).sort((a, b) => a - b);
      commFilterSelect.innerHTML = '<option value="">All Clusters</option>' + 
        commListSorted.map(c => \`<option value="\${c}">Cluster #\${c}</option>\`).join('');

      nodeDataMap.clear();
      raw.nodes.forEach(n => nodeDataMap.set(n.key, n));

      // Populate left symbol list (macOS Style)
      const symListContainer = document.getElementById('symbolList');
      if (raw.nodes.length > 0) {
        symListContainer.innerHTML = raw.nodes.map(n => \`
          <div class="mac-sym-item" data-key="\${n.key}" data-name="\${n.label}" data-kind="\${n.kind}" data-comm="\${n.community_id || 1}" data-file="\${n.file}">
            <div class="mac-sym-top">
              <span class="mac-badge mac-badge-\${n.kind}">\${n.kind}</span>
              <span class="mac-sym-name">\${n.label}</span>
            </div>
            <div class="mac-sym-file">\${n.file}</div>
          </div>
        \`).join('');

        symListContainer.querySelectorAll('.mac-sym-item').forEach(el => {
          el.addEventListener('click', () => {
            const key = el.getAttribute('data-key');
            jumpToNode(key);
          });
        });
      } else {
        symListContainer.innerHTML = '<p style="color:var(--mac-text-muted);padding:1rem;font-size:0.8rem">No symbols indexed yet.</p>';
      }

      if (typeof vis === 'undefined') {
        container.innerHTML = '<div style="color:var(--mac-text-muted);padding:2rem;text-align:center">Loading visualizer...</div>';
        return;
      }

      const visNodes = raw.nodes.map(n => {
        const deg = degree[n.key] || n.degree || 0;
        const col = macKindColor[n.kind] || macKindColor.default;
        return {
          id: n.key,
          label: n.label,
          title: n.label + ' (' + n.kind + ')',
          shape: 'dot',
          size: Math.min(26, Math.max(10, 10 + Math.sqrt(deg) * 2.8)),
          color: {
            background: col.background,
            border: col.border,
            highlight: { background: col.highlight, border: '#ffffff' },
            hover: { background: col.highlight, border: '#ffffff' }
          },
          font: { color: '#f5f5f7', size: 11, face: '"SF Mono", monospace' },
          borderWidth: 1.5,
          shadow: { enabled: true, color: 'rgba(0,0,0,0.4)', size: 4, x: 1, y: 1 }
        };
      });

      const visEdges = raw.edges.map(e => ({
        from: e.source,
        to: e.target,
        arrows: 'to',
        color: { color: 'rgba(255, 255, 255, 0.12)', highlight: '#0a84ff', hover: '#0a84ff' },
        width: 1.1,
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
            gravitationalConstant: -40,
            centralGravity: 0.008,
            springLength: 85,
            springConstant: 0.08,
            damping: 0.45
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
        networkInstance.fit({ animation: { duration: 350 } });
      });
      document.getElementById('btnRelayout').addEventListener('click', () => {
        networkInstance.stabilize(100);
        networkInstance.fit({ animation: { duration: 350 } });
      });
    }

    window.addEventListener('DOMContentLoaded', initGraph);
  </script>`;
}
