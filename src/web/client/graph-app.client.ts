export function renderClientScript(projectId: string, authEnabled: boolean = false): string {
  return `
  <script>
    let currentMode = 'codebase'; // 'codebase' | 'memory'
    let networkInstance = null;
    let nodeDataSet = null;
    let edgeDataSet = null;
    const nodeDataMap = new Map();
    let currentRawData = { nodes: [], edges: [] };
    let activeColorMode = 'kind';
    let currentDatasetId = '';
    const isAuthEnabled = ${authEnabled ? 'true' : 'false'};
    let authToken = localStorage.getItem('ogm_auth_token') || '';

    // Color Palettes
    const macCommunityPalette = [
      { background: '#0a84ff', border: '#0071e3', highlight: '#64d2ff' },
      { background: '#30d158', border: '#24a148', highlight: '#6be585' },
      { background: '#bf5af2', border: '#9e3fe0', highlight: '#da8fff' },
      { background: '#ff9f0a', border: '#cc7a00', highlight: '#ffb340' },
      { background: '#64d2ff', border: '#33b1e6', highlight: '#99e0ff' },
      { background: '#ff375f', border: '#d62045', highlight: '#ff6685' },
      { background: '#ffd60a', border: '#cca700', highlight: '#ffe047' },
      { background: '#ff453a', border: '#d62d24', highlight: '#ff6961' },
      { background: '#5e5ce6', border: '#4644cc', highlight: '#8382eb' },
      { background: '#8e8e93', border: '#636366', highlight: '#aeaeb2' },
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

    const memoryColors = {
      bugfix: { background: '#ff453a', border: '#d62d24', highlight: '#ff6961' },
      decision: { background: '#0a84ff', border: '#0071e3', highlight: '#64d2ff' },
      procedure: { background: '#30d158', border: '#24a148', highlight: '#6be585' },
      research: { background: '#bf5af2', border: '#9e3fe0', highlight: '#da8fff' },
      learning: { background: '#ffd60a', border: '#cca700', highlight: '#ffe047' },
      preference: { background: '#ff375f', border: '#d62045', highlight: '#ff6685' },
      episode: { background: '#3a3a44', border: '#64d2ff', highlight: '#99e0ff' },
      default: { background: '#8e8e93', border: '#636366', highlight: '#aeaeb2' }
    };

    function getCommunityColor(commId) {
      const idx = ((commId || 1) - 1) % macCommunityPalette.length;
      return macCommunityPalette[idx];
    }

    // Authenticated Fetch Wrapper
    async function apiFetch(url, options = {}) {
      options.headers = options.headers || {};
      if (authToken) {
        options.headers['Authorization'] = 'Bearer ' + authToken;
        options.headers['X-API-Key'] = authToken;
      }

      const res = await fetch(url, options);
      if (res.status === 401) {
        document.getElementById('loginModalOverlay').style.display = 'flex';
        throw new Error('Authentication required');
      }
      return res;
    }

    async function checkAuth() {
      if (!isAuthEnabled) return true;
      try {
        const res = await fetch('/api/auth/status');
        const data = await res.json();
        if (data.auth_enabled && !data.authenticated && !authToken) {
          document.getElementById('loginModalOverlay').style.display = 'flex';
          return false;
        }
        document.getElementById('authLogoutBtn').style.display = 'inline-flex';
        return true;
      } catch {
        return false;
      }
    }

    window.handleLoginSubmit = async function(e) {
      e.preventDefault();
      const input = document.getElementById('loginKeyInput');
      const errBox = document.getElementById('loginErrorMsg');
      const key = input.value.trim();
      if (!key) return;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          authToken = key;
          localStorage.setItem('ogm_auth_token', key);
          document.getElementById('loginModalOverlay').style.display = 'none';
          document.getElementById('authLogoutBtn').style.display = 'inline-flex';
          await initGraph();
        } else {
          errBox.innerText = data.error || 'Authentication failed';
          errBox.style.display = 'block';
        }
      } catch (err) {
        errBox.innerText = 'Login error: ' + err.message;
        errBox.style.display = 'block';
      }
    };

    window.handleLogout = async function() {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch {}
      localStorage.removeItem('ogm_auth_token');
      location.reload();
    };

    // Tab Mode Switcher
    window.switchGraphMode = async function(mode) {
      currentMode = mode;
      document.getElementById('tabCodebase').className = 'mac-tab-btn' + (mode === 'codebase' ? ' active' : '');
      document.getElementById('tabMemory').className = 'mac-tab-btn' + (mode === 'memory' ? ' active' : '');

      if (mode === 'codebase') {
        document.getElementById('codebaseStatusPills').style.display = 'flex';
        document.getElementById('memoryStatusPills').style.display = 'none';
        document.getElementById('codebaseActions').style.display = 'flex';
        document.getElementById('memoryActions').style.display = 'none';
        document.getElementById('codebaseFilters').style.display = 'flex';
        document.getElementById('memoryFilters').style.display = 'none';
        document.getElementById('explorerTitle').innerText = 'Symbols';
        document.getElementById('colorModeSelect').style.display = 'inline-block';
        updateLegendHUD('codebase');
        await loadDatasets();
        await fetchAndRenderGraph();
      } else {
        document.getElementById('codebaseStatusPills').style.display = 'none';
        document.getElementById('memoryStatusPills').style.display = 'flex';
        document.getElementById('codebaseActions').style.display = 'none';
        document.getElementById('memoryActions').style.display = 'flex';
        document.getElementById('codebaseFilters').style.display = 'none';
        document.getElementById('memoryFilters').style.display = 'flex';
        document.getElementById('explorerTitle').innerText = 'Agent Memories';
        document.getElementById('colorModeSelect').style.display = 'none';
        updateLegendHUD('memory');
        await fetchAndRenderMemoryGraph();
      }
    };

    function updateLegendHUD(mode) {
      const legend = document.getElementById('graphLegend');
      if (mode === 'memory') {
        legend.innerHTML = \`
          <span><span class="mac-legend-dot" style="background:var(--mac-red)"></span>Bugfix</span>
          <span><span class="mac-legend-dot" style="background:var(--mac-blue)"></span>Decision</span>
          <span><span class="mac-legend-dot" style="background:var(--mac-green)"></span>Procedure</span>
          <span><span class="mac-legend-dot" style="background:var(--mac-purple)"></span>Research</span>
          <span><span class="mac-legend-dot" style="background:var(--mac-yellow)"></span>Learning</span>
          <span><span class="mac-legend-dot" style="background:var(--mac-teal);border:1px dashed #fff"></span>Episode (Evidence)</span>
        \`;
      } else {
        changeColorMode(activeColorMode);
      }
    }

    async function loadDatasets() {
      try {
        const res = await apiFetch('/api/datasets?project=${encodeURIComponent(projectId)}');
        const datasets = await res.json();
        const select = document.getElementById('datasetSelect');
        if (datasets.length > 0) {
          select.innerHTML = datasets.map(d => \`
            <option value="\${d.id}">\${d.name} (\${d.symbols_count} syms)</option>
          \`).join('');
          currentDatasetId = datasets[0].id;
        } else {
          select.innerHTML = '<option value="default">default (0 syms)</option>';
          currentDatasetId = 'default';
        }
      } catch (e) {
        console.error('Failed loading datasets:', e);
      }
    }

    window.switchDataset = async function(datasetId) {
      currentDatasetId = datasetId;
      await fetchAndRenderGraph();
    };

    window.triggerReindex = async function() {
      const btn = event.target;
      btn.innerText = '⏳ Indexing...';
      btn.disabled = true;
      try {
        const res = await apiFetch('/api/codebase/index', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '.', dataset: currentDatasetId })
        });
        const data = await res.json();
        alert('Dataset indexing complete: ' + data.filesIndexed + ' files, ' + data.symbolsCount + ' symbols in ' + data.durationMs + 'ms');
        await loadDatasets();
        await fetchAndRenderGraph();
      } catch (err) {
        alert('Indexing error: ' + err.message);
      } finally {
        btn.innerText = '⚡ Re-Index Dataset';
        btn.disabled = false;
      }
    };

    window.promptIndexNewDataset = async function() {
      const datasetName = prompt('Enter a name for this codebase dataset (e.g. "auth-service", "frontend"):');
      if (!datasetName) return;
      const folderPath = prompt('Enter relative or absolute folder path to index:', '.');
      if (!folderPath) return;

      try {
        const res = await apiFetch('/api/codebase/index', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: folderPath, dataset: datasetName.trim() })
        });
        const data = await res.json();
        alert('Successfully indexed dataset "' + datasetName + '": ' + data.symbolsCount + ' symbols, ' + data.edgesCount + ' relations in ' + data.durationMs + 'ms');
        await loadDatasets();
        const select = document.getElementById('datasetSelect');
        select.value = data.datasetId;
        currentDatasetId = data.datasetId;
        await fetchAndRenderGraph();
      } catch (err) {
        alert('Failed indexing new dataset: ' + err.message);
      }
    };

    window.promptNewObservation = async function() {
      const kind = prompt('Episode Kind (command_output, error, observation, diff, tool_result):', 'observation');
      if (!kind) return;
      const obs = prompt('Observation payload / details:');
      if (!obs) return;

      try {
        const res = await apiFetch('/api/memory/observe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: '${projectId}',
            kind,
            observation: obs,
            metadata: { repository: 'ogm-slim', actor: 'user_admin' }
          })
        });
        const data = await res.json();
        alert('Logged episode: ' + data.episode?.id);
        await fetchAndRenderMemoryGraph();
      } catch (e) {
        alert('Error logging observation: ' + e.message);
      }
    };

    window.promptNewMemory = async function() {
      const type = prompt('Memory Type (bugfix, decision, procedure, research, learning):', 'bugfix');
      if (!type) return;
      const summary = prompt('Conclusion summary / title:');
      if (!summary) return;

      try {
        const res = await apiFetch('/api/memory/commit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: '${projectId}',
            type,
            content: { summary, committed_via: 'web_dashboard' },
            confidence: 1.0
          })
        });
        const data = await res.json();
        alert('Committed durable memory: ' + data.memory?.id);
        await fetchAndRenderMemoryGraph();
      } catch (e) {
        alert('Error committing memory: ' + e.message);
      }
    };

    window.filterExplorerItems = function() {
      const q = (document.getElementById('symFilter').value || '').toLowerCase();
      let count = 0;

      if (currentMode === 'codebase') {
        const k = (document.getElementById('kindFilter').value || '').toLowerCase();
        const c = document.getElementById('commFilter').value;

        document.querySelectorAll('.mac-sym-item').forEach(el => {
          const name = (el.getAttribute('data-name') || '').toLowerCase();
          const file = (el.getAttribute('data-file') || '').toLowerCase();
          const kind = (el.getAttribute('data-kind') || '').toLowerCase();
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
      } else {
        const k = (document.getElementById('memKindFilter').value || '').toLowerCase();
        const s = (document.getElementById('memStatusFilter').value || '').toLowerCase();

        document.querySelectorAll('.mac-sym-item').forEach(el => {
          const name = (el.getAttribute('data-name') || '').toLowerCase();
          const kind = (el.getAttribute('data-kind') || '').toLowerCase();
          const status = (el.getAttribute('data-status') || '').toLowerCase();

          const matchQ = !q || name.includes(q);
          const matchK = !k || kind === k || (k === 'episode' && el.getAttribute('data-node-type') === 'episode');
          const matchS = !s || status === s;

          if (matchQ && matchK && matchS) {
            el.style.display = '';
            count++;
          } else {
            el.style.display = 'none';
          }
        });
      }

      const counter = document.getElementById('symFilteredCount');
      if (counter) counter.innerText = count;
    };

    function selectNodeDetails(node) {
      document.querySelectorAll('.mac-sym-item').forEach(el => el.classList.remove('active'));
      const target = Array.from(document.querySelectorAll('.mac-sym-item')).find(el => el.getAttribute('data-key') === node.key);
      if (target) {
        target.classList.add('active');
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      if (currentMode === 'codebase') {
        document.getElementById('insName').innerText = node.label || node.name;
        document.getElementById('insKind').innerText = node.kind;
        document.getElementById('insKind').className = 'mac-badge mac-badge-' + node.kind;
        
        const cCol = getCommunityColor(node.community_id);
        const commEl = document.getElementById('insComm');
        commEl.innerText = 'CLUSTER #' + (node.community_id || 1);
        commEl.style.background = cCol.background;
        commEl.style.color = '#ffffff';

        document.getElementById('insFile').innerText = node.file || node.file_path || '-';
        document.getElementById('metaLabel1').innerText = 'Louvain Cluster';
        document.getElementById('metaComm').innerText = '#' + (node.community_id || 1);
        document.getElementById('metaLabel2').innerText = 'PageRank Centrality';
        document.getElementById('metaPR').innerText = node.pagerank !== undefined ? node.pagerank : '-';
        document.getElementById('metaLabel3').innerText = 'Degree (In+Out)';
        document.getElementById('metaDeg').innerText = node.degree !== undefined ? node.degree : '-';
        document.getElementById('metaLabel4').innerText = 'Package Scope';
        document.getElementById('metaPkg').innerText = node.package || node.package_name || 'root';

        document.getElementById('insPanelTitle1').innerText = 'Type Signature';
        document.getElementById('insSig').innerText = node.signature || node.label || '// No signature';
        document.getElementById('insPanelTitle2').innerText = 'Contract & Comments';
        document.getElementById('insDoc').innerText = node.doc || node.docstring || 'No docstring comment provided.';

        document.getElementById('insPanelTitle3').innerText = 'Outgoing Callees';
        const callList = Array.isArray(node.calls) ? node.calls : (node.calls ? node.calls.split(',').filter(Boolean) : []);
        if (callList.length > 0) {
          document.getElementById('insCalls').innerHTML = callList.map(c => '<span class="mac-chip" onclick="jumpToNode(\\'' + c + '\\')">' + c + '</span>').join(' ');
        } else {
          document.getElementById('insCalls').innerHTML = '<span style="color:var(--mac-text-muted)">No downstream callees</span>';
        }
      } else {
        // Memory Mode Inspector
        const isMem = node.node_type === 'memory';
        document.getElementById('insName').innerText = node.label;
        document.getElementById('insKind').innerText = isMem ? ('MEMORY: ' + (node.kind || 'typed').toUpperCase()) : ('EPISODE: ' + (node.kind || 'raw').toUpperCase());
        document.getElementById('insKind').className = isMem ? ('mac-badge mac-badge-' + (node.kind || 'bugfix')) : 'mac-badge mac-badge-episode';
        
        const commEl = document.getElementById('insComm');
        commEl.innerText = isMem ? ((node.status || 'ACTIVE').toUpperCase()) : 'EVIDENCE';
        commEl.style.background = isMem ? (node.status === 'active' ? '#30d158' : '#ff9f0a') : '#64d2ff';
        commEl.style.color = '#ffffff';

        document.getElementById('insFile').innerText = 'ID: ' + node.key + ' | ' + (node.created_at || node.observed_at || '');
        document.getElementById('metaLabel1').innerText = 'Node Type';
        document.getElementById('metaComm').innerText = isMem ? 'Durable Memory' : 'Evidence Episode';
        document.getElementById('metaLabel2').innerText = isMem ? 'Confidence' : 'Observed At';
        document.getElementById('metaPR').innerText = isMem ? (node.confidence || '1.0') : (node.observed_at ? node.observed_at.slice(0, 16) : '-');
        document.getElementById('metaLabel3').innerText = isMem ? 'Status' : 'Kind';
        document.getElementById('metaDeg').innerText = isMem ? (node.status || 'active') : (node.kind || 'observation');
        document.getElementById('metaLabel4').innerText = isMem ? 'Citations' : 'Metadata Repo';
        document.getElementById('metaPkg').innerText = isMem ? (node.origin_ids?.length || '0') + ' episodes' : (node.metadata?.repository || 'local');

        document.getElementById('insPanelTitle1').innerText = isMem ? 'Structured Conclusion Content' : 'Raw Observation Output';
        document.getElementById('insSig').innerText = JSON.stringify(isMem ? node.content : node.observation, null, 2);

        document.getElementById('insPanelTitle2').innerText = isMem ? 'Memory Details & Rationale' : 'Metadata & Trace Context';
        const detailText = isMem
          ? (node.content?.root_cause ? ('Root Cause: ' + node.content.root_cause + '\\nFix: ' + (node.content.fix || '')) : (node.content?.rationale || node.content?.summary || 'No extra rationale recorded.'))
          : JSON.stringify(node.metadata || {}, null, 2);
        document.getElementById('insDoc').innerText = detailText;

        document.getElementById('insPanelTitle3').innerText = isMem ? 'Supporting Evidence Episodes (Citations)' : 'Linked References';
        if (isMem && node.origin_ids && node.origin_ids.length > 0) {
          document.getElementById('insCalls').innerHTML = node.origin_ids.map(id => '<span class="mac-chip" onclick="jumpToNode(\\'' + id + '\\')">📎 ' + id.slice(0, 12) + '...</span>').join(' ');
        } else if (!isMem) {
          document.getElementById('insCalls').innerHTML = '<span style="color:var(--mac-text-muted)">Immutable provenance episode</span>';
        } else {
          document.getElementById('insCalls').innerHTML = '<span style="color:var(--mac-text-muted)">Direct observation without parent citations</span>';
        }
      }
    }

    window.jumpToNode = function(nodeLabelOrKey) {
      let targetNode = nodeDataMap.get(nodeLabelOrKey);
      if (!targetNode) {
        for (const [k, v] of nodeDataMap.entries()) {
          if (v.label === nodeLabelOrKey || v.key === nodeLabelOrKey || v.name === nodeLabelOrKey) {
            targetNode = v;
            break;
          }
        }
      }
      if (targetNode && networkInstance) {
        selectNodeDetails(targetNode);
        networkInstance.selectNodes([targetNode.key]);
        networkInstance.focus(targetNode.key, {
          scale: 1.2,
          animation: { duration: 350, easingFunction: 'easeInOutQuad' }
        });
      }
    };

    window.exportGraphPng = function() {
      const container = document.getElementById('networkContainer');
      const canvas = container ? container.querySelector('canvas') : null;
      if (!canvas) {
        alert('Visualizer canvas is not loaded yet');
        return;
      }
      const link = document.createElement('a');
      link.download = 'ogm-slim-' + currentMode + '-' + (currentDatasetId || 'default') + '.png';
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    window.changeColorMode = function(mode) {
      activeColorMode = mode;
      if (!nodeDataSet || currentMode !== 'codebase') return;

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
    };

    // Render Codebase AST Graph
    async function fetchAndRenderGraph() {
      const container = document.getElementById('networkContainer');
      const url = '/api/graph?project=${encodeURIComponent(projectId)}' + (currentDatasetId ? '&dataset=' + encodeURIComponent(currentDatasetId) : '');
      
      try {
        const response = await apiFetch(url);
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

      const commFilterSelect = document.getElementById('commFilter');
      const commListSorted = Array.from(distinctComms).sort((a, b) => a - b);
      commFilterSelect.innerHTML = '<option value="">All Clusters</option>' + 
        commListSorted.map(c => \`<option value="\${c}">Cluster #\${c}</option>\`).join('');

      nodeDataMap.clear();
      raw.nodes.forEach(n => {
        n.node_type = 'codebase';
        nodeDataMap.set(n.key, n);
      });

      // Populate left list
      const symListContainer = document.getElementById('symbolList');
      if (raw.nodes.length > 0) {
        symListContainer.innerHTML = raw.nodes.map(n => \`
          <div class="mac-sym-item" data-key="\${n.key}" data-name="\${n.label}" data-kind="\${n.kind}" data-comm="\${n.community_id || 1}" data-file="\${n.file || ''}" data-node-type="codebase">
            <div class="mac-sym-top">
              <span class="mac-badge mac-badge-\${n.kind}">\${n.kind}</span>
              <span class="mac-sym-name">\${n.label}</span>
            </div>
            <div class="mac-sym-file">\${n.file || ''}</div>
          </div>
        \`).join('');

        symListContainer.querySelectorAll('.mac-sym-item').forEach(el => {
          el.addEventListener('click', () => {
            const key = el.getAttribute('data-key');
            jumpToNode(key);
          });
        });
      } else {
        symListContainer.innerHTML = '<p style="color:var(--mac-text-muted);padding:1rem;font-size:0.8rem">No symbols in this dataset yet.</p>';
      }

      renderVisNetwork(container, raw.nodes.map(n => {
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
      }), raw.edges.map(e => ({
        from: e.source,
        to: e.target,
        arrows: 'to',
        color: { color: 'rgba(255, 255, 255, 0.14)', highlight: '#0a84ff', hover: '#0a84ff' },
        width: 1.1,
        smooth: { type: 'continuous' }
      })));
    }

    // Render Agent Memory Provenance Graph
    async function fetchAndRenderMemoryGraph() {
      const container = document.getElementById('networkContainer');
      const url = '/api/memory/graph?project=${encodeURIComponent(projectId)}';
      
      try {
        const response = await apiFetch(url);
        currentRawData = await response.json();
      } catch (e) {
        currentRawData = { nodes: [], edges: [] };
      }

      const raw = currentRawData;
      const memNodes = raw.nodes.filter(n => n.node_type === 'memory');
      const epNodes = raw.nodes.filter(n => n.node_type === 'episode');

      document.getElementById('memCount').innerText = memNodes.length;
      document.getElementById('epCount').innerText = epNodes.length;
      document.getElementById('memEdgeCount').innerText = raw.edges.length;
      document.getElementById('symFilteredCount').innerText = raw.nodes.length;

      nodeDataMap.clear();
      raw.nodes.forEach(n => nodeDataMap.set(n.key, n));

      // Populate left list for memories
      const symListContainer = document.getElementById('symbolList');
      if (raw.nodes.length > 0) {
        symListContainer.innerHTML = raw.nodes.map(n => {
          const isMem = n.node_type === 'memory';
          const badgeClass = isMem ? ('mac-badge mac-badge-' + (n.kind || 'bugfix')) : 'mac-badge mac-badge-episode';
          const badgeText = isMem ? n.kind : 'EPISODE';
          const subtitle = isMem ? (n.status || 'active') : (n.kind + ' | ' + (n.observed_at ? n.observed_at.slice(0, 10) : ''));
          return \`
            <div class="mac-sym-item" data-key="\${n.key}" data-name="\${n.label}" data-kind="\${n.kind}" data-status="\${n.status || ''}" data-node-type="\${n.node_type}">
              <div class="mac-sym-top">
                <span class="\${badgeClass}">\${badgeText}</span>
                <span class="mac-sym-name">\${n.label}</span>
              </div>
              <div class="mac-sym-file">\${subtitle}</div>
            </div>
          \`;
        }).join('');

        symListContainer.querySelectorAll('.mac-sym-item').forEach(el => {
          el.addEventListener('click', () => {
            const key = el.getAttribute('data-key');
            jumpToNode(key);
          });
        });
      } else {
        symListContainer.innerHTML = '<p style="color:var(--mac-text-muted);padding:1rem;font-size:0.8rem">No memories or episodes stored yet.</p>';
      }

      renderVisNetwork(container, raw.nodes.map(n => {
        const isMem = n.node_type === 'memory';
        const col = memoryColors[n.kind] || (isMem ? memoryColors.decision : memoryColors.episode);
        return {
          id: n.key,
          label: n.label,
          title: (isMem ? 'Memory: ' : 'Episode: ') + n.label,
          shape: isMem ? 'box' : 'ellipse',
          margin: isMem ? 8 : undefined,
          size: isMem ? 22 : 14,
          color: {
            background: col.background,
            border: col.border,
            highlight: { background: col.highlight, border: '#ffffff' },
            hover: { background: col.highlight, border: '#ffffff' }
          },
          font: { color: '#ffffff', size: isMem ? 12 : 10, face: '"SF Pro Text", system-ui, sans-serif' },
          borderWidth: isMem ? 2 : 1,
          shapeProperties: { borderDashes: !isMem },
          shadow: { enabled: true, color: 'rgba(0,0,0,0.5)', size: 6, x: 2, y: 2 }
        };
      }), raw.edges.map(e => ({
        from: e.source,
        to: e.target,
        arrows: 'to',
        label: e.relation || 'evidence',
        font: { color: 'rgba(255, 255, 255, 0.45)', size: 9, align: 'middle' },
        color: { color: 'rgba(100, 210, 255, 0.35)', highlight: '#64d2ff', hover: '#64d2ff' },
        width: 1.5,
        dashes: true,
        smooth: { type: 'cubicBezier' }
      })));
    }

    function renderVisNetwork(container, visNodes, visEdges) {
      if (typeof vis === 'undefined') {
        container.innerHTML = '<div style="color:var(--mac-text-muted);padding:2rem;text-align:center">Loading visualizer...</div>';
        return;
      }

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
            springLength: 95,
            springConstant: 0.07,
            damping: 0.45
          },
          stabilization: {
            enabled: true,
            iterations: 120,
            updateInterval: 25
          }
        }
      };

      if (networkInstance) {
        networkInstance.destroy();
      }

      networkInstance = new vis.Network(container, { nodes: nodeDataSet, edges: edgeDataSet }, options);

      networkInstance.on('click', function(params) {
        if (params.nodes.length > 0) {
          const selectedId = params.nodes[0];
          const nodeData = nodeDataMap.get(selectedId);
          if (nodeData) {
            selectNodeDetails(nodeData);
          }
        }
      });
    }

    async function initGraph() {
      const authed = await checkAuth();
      if (!authed && isAuthEnabled) return;

      await loadDatasets();
      await fetchAndRenderGraph();

      document.getElementById('btnZoomIn').addEventListener('click', () => {
        if (networkInstance) networkInstance.moveTo({ scale: networkInstance.getScale() * 1.3 });
      });
      document.getElementById('btnZoomOut').addEventListener('click', () => {
        if (networkInstance) networkInstance.moveTo({ scale: networkInstance.getScale() * 0.7 });
      });
      document.getElementById('btnReset').addEventListener('click', () => {
        if (networkInstance) networkInstance.fit({ animation: { duration: 350 } });
      });
      document.getElementById('btnRelayout').addEventListener('click', () => {
        if (networkInstance) {
          networkInstance.stabilize(100);
          networkInstance.fit({ animation: { duration: 350 } });
        }
      });
    }

    window.addEventListener('DOMContentLoaded', initGraph);
  </script>`;
}
