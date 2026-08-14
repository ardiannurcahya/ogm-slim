export function renderContractInspector(): string {
  return `
  <div class="mac-col">
    <div class="mac-col-header">
      <div class="mac-section-title">Inspector</div>
    </div>
    <div class="mac-inspector-body" id="inspectorBox">
      <div>
        <div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.4rem">
          <span class="mac-badge" id="insKind" style="background:#0a84ff;color:#ffffff">SELECT SYMBOL</span>
          <span class="mac-badge" id="insComm" style="background:#2c2c34;color:#ffffff">CLUSTER -</span>
        </div>
        <h2 id="insName" style="margin:0.2rem 0;font-size:1.05rem;font-family:var(--mac-mono);font-weight:700;word-break:break-all;color:var(--mac-text)">Click any node in graph</h2>
        <div id="insFile" style="font-size:0.75rem;color:var(--mac-text-muted)">Location will show here</div>
      </div>

      <div class="mac-meta-card">
        <div class="mac-meta-cell">
          <span class="mac-meta-title">Louvain Cluster</span>
          <span class="mac-meta-value" id="metaComm" style="color:var(--mac-teal)">-</span>
        </div>
        <div class="mac-meta-cell">
          <span class="mac-meta-title">PageRank Centrality</span>
          <span class="mac-meta-value" id="metaPR" style="color:var(--mac-yellow)">-</span>
        </div>
        <div class="mac-meta-cell">
          <span class="mac-meta-title">Degree (In+Out)</span>
          <span class="mac-meta-value" id="metaDeg" style="color:var(--mac-green)">-</span>
        </div>
        <div class="mac-meta-cell">
          <span class="mac-meta-title">Package Scope</span>
          <span class="mac-meta-value" id="metaPkg" style="color:var(--mac-orange)">-</span>
        </div>
      </div>

      <div>
        <div style="font-size:0.72rem;color:var(--mac-text-muted);margin-bottom:0.35rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Type Signature</div>
        <pre class="mac-code-panel" id="insSig">// Select a symbol to view signature</pre>
      </div>

      <div>
        <div style="font-size:0.72rem;color:var(--mac-text-muted);margin-bottom:0.35rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Contract & Comments</div>
        <div class="mac-doc-panel" id="insDoc">No symbol selected.</div>
      </div>

      <div>
        <div style="font-size:0.72rem;color:var(--mac-text-muted);margin-bottom:0.35rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Outgoing Callees</div>
        <div id="insCalls" style="font-size:0.8rem;color:var(--mac-text);margin-top:0.2rem">-</div>
      </div>
    </div>
  </div>`;
}
