export function renderContractInspector(): string {
  return `
  <div class="col">
    <div class="col-header">
      <div class="col-title">Symbol Contract Inspector</div>
    </div>
    <div class="inspector-body" id="inspectorBox">
      <div>
        <span class="sym-kind" id="insKind" style="background:#0284c7;color:white">SELECT SYMBOL</span>
        <span class="comm-badge" id="insComm" style="background:#334155;color:white">COMMUNITY -</span>
        <h2 id="insName" style="margin:0.4rem 0;font-size:1.1rem;font-family:ui-monospace,monospace;word-break:break-all">Click any node in graph</h2>
        <div id="insFile" style="font-size:0.8rem;color:var(--muted)">Location will show here</div>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <div class="meta-label">Louvain Cluster</div>
          <div class="meta-val" id="metaComm">-</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">PageRank Centrality</div>
          <div class="meta-val" id="metaPR">-</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Degree (In+Out)</div>
          <div class="meta-val" id="metaDeg">-</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Package Scope</div>
          <div class="meta-val" id="metaPkg">-</div>
        </div>
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
  </div>`;
}
