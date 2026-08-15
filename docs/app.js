// Copy install command to clipboard
function copyInstallCmd() {
  const text = document.getElementById('npmInstallCmd').innerText;
  navigator.clipboard.writeText(text).then(() => {
    const copyText = document.getElementById('copyText');
    const btn = document.getElementById('btnCopyInstall');
    copyText.innerText = 'Copied!';
    btn.style.borderColor = '#30d158';
    btn.style.color = '#30d158';
    setTimeout(() => {
      copyText.innerText = 'Copy';
      btn.style.borderColor = '';
      btn.style.color = '';
    }, 2000);
  });
}

// Switch quickstart code tabs
function switchCodeTab(tabId, btn) {
  document.querySelectorAll('.code-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.code-tab-content').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  const target = document.getElementById('tabContent_' + tabId);
  if (target) target.classList.add('active');
}

// Switch hero window mockup mode
const mockupData = {
  codebase: {
    hud: '<span class="hud-pill">Dataset: <strong>default</strong></span><span class="hud-pill"><strong>129</strong> symbols</span><span class="hud-pill"><strong>210</strong> relations</span><span class="hud-pill"><strong>10</strong> clusters</span>',
    title: 'ParallelASTParser.parseDirectory()',
    loc: 'src/ast/parallel-parser.ts:42',
    meta: '<div class="meta-item"><span class="meta-k">Centrality</span><span class="meta-v highlight-yellow">0.0842</span></div><div class="meta-item"><span class="meta-k">Degree</span><span class="meta-v highlight-green">14</span></div>',
    sig: 'async parseDirectory(dir: string, opts?: ParseOptions): Promise<ASTGraph>',
    doc: 'Worker thread pool parallel AST analysis with SHA-256 incremental hashing cache.'
  },
  memory: {
    hud: '<span class="hud-pill">Project: <strong>default</strong></span><span class="hud-pill"><strong>7</strong> memories</span><span class="hud-pill"><strong>8</strong> episodes</span><span class="hud-pill"><strong>9</strong> citations</span>',
    title: 'WASM WebAssembly.Instance Null Dereference',
    loc: 'ID: mem_wasm_lifecycle | 2026-08-16',
    meta: '<div class="meta-item"><span class="meta-k">Confidence</span><span class="meta-v highlight-green">0.98</span></div><div class="meta-item"><span class="meta-k">Kind</span><span class="meta-v" style="color:#ff6961">BUGFIX</span></div>',
    sig: 'Root Cause: Tree-sitter WASM instance disposed before AST traversal completed.',
    doc: 'Solution Fix: Implement per-thread ParserPool lifecycle manager with explicit cleanup.'
  }
};

function switchHeroMockup(mode, btn) {
  document.querySelectorAll('.mockup-tab-pill .tab-switch').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  const d = mockupData[mode];
  if (!d) return;

  document.querySelector('.mockup-grid-hud').innerHTML = d.hud;
  document.getElementById('mockupSidebarTitle').innerText = d.title;
  document.getElementById('mockupSidebarLoc').innerText = d.loc;
  document.querySelector('.sidebar-meta-grid').innerHTML = d.meta;
  document.getElementById('mockupSidebarCode').innerText = d.sig;
  document.getElementById('mockupSidebarDoc').innerText = d.doc;
  
  currentHeroMode = mode;
  initHeroNodes(mode);
}

// Canvas Animated Nodes Simulation
let currentHeroMode = 'codebase';
const container = document.getElementById('canvasNodesDemo');

function initHeroNodes(mode) {
  if (!container) return;
  container.innerHTML = '';

  const nodes = mode === 'codebase' ? [
    { label: 'ParallelParser', x: 25, y: 35, color: '#30d158' },
    { label: 'WorkerPool', x: 60, y: 25, color: '#64d2ff' },
    { label: 'LouvainCluster', x: 45, y: 70, color: '#bf5af2' },
    { label: 'SymbolTable', x: 75, y: 65, color: '#ffd60a' },
    { label: 'MemoryRepo', x: 20, y: 80, color: '#ff375f' },
  ] : [
    { label: 'WASM Lifecycle', x: 30, y: 30, color: '#ff453a' },
    { label: 'Episode: Worker Trace', x: 65, y: 30, color: '#38bdf8' },
    { label: 'SQLite WAL Decision', x: 45, y: 70, color: '#0a84ff' },
    { label: 'BM25 Hybrid Formula', x: 75, y: 65, color: '#30d158' },
  ];

  // Draw simple SVG edges
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('style', 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;');
  
  const edges = mode === 'codebase' ? [
    [0, 1], [0, 2], [1, 3], [2, 3], [0, 4]
  ] : [
    [0, 1], [0, 2], [2, 3]
  ];

  edges.forEach(([i1, i2]) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', `${nodes[i1].x}%`);
    line.setAttribute('y1', `${nodes[i1].y}%`);
    line.setAttribute('x2', `${nodes[i2].x}%`);
    line.setAttribute('y2', `${nodes[i2].y}%`);
    line.setAttribute('stroke', 'rgba(255, 255, 255, 0.12)');
    line.setAttribute('stroke-width', '1.5');
    svg.appendChild(line);
  });

  container.appendChild(svg);

  // Draw node elements
  nodes.forEach((n, idx) => {
    const el = document.createElement('div');
    el.style.cssText = `
      position: absolute;
      left: ${n.x}%;
      top: ${n.y}%;
      transform: translate(-50%, -50%);
      background: rgba(18, 20, 28, 0.95);
      border: 1.5px solid ${n.color};
      color: #f8fafc;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 0.72rem;
      font-family: var(--font-mono);
      box-shadow: 0 4px 14px rgba(0,0,0,0.5);
      cursor: pointer;
      transition: all 0.2s;
      z-index: 5;
    `;
    el.innerHTML = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${n.color};margin-right:6px"></span>${n.label}`;
    
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'translate(-50%, -50%) scale(1.08)';
      el.style.boxShadow = `0 6px 20px ${n.color}40`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(-50%, -50%) scale(1)';
      el.style.boxShadow = '0 4px 14px rgba(0,0,0,0.5)';
    });

    container.appendChild(el);
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initHeroNodes('codebase');
});
