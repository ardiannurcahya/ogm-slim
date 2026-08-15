export function renderContractInspector(): string {
  return `
  <div class="mac-col mac-col-right" id="inspectorCol">
    <div class="mac-col-header">
      <div class="mac-section-title">
        <span>Inspector</span>
        <button class="mac-panel-close-btn" onclick="toggleSidebar('inspector')" title="Hide Details Panel">&times;</button>
      </div>
    </div>
    <div class="mac-inspector-body" id="inspectorBox">
      <div>
        <div style="display:flex;align-items:center;gap:0.35rem;margin-bottom:0.35rem;flex-wrap:wrap">
          <span class="mac-badge mac-badge-neutral" id="insKind">SELECT NODE</span>
          <span class="mac-badge mac-badge-neutral" id="insComm">STATUS -</span>
        </div>
        <h2 id="insName" style="margin:0.2rem 0;font-size:0.95rem;font-family:var(--mac-mono);font-weight:700;word-break:break-all;overflow-wrap:anywhere;color:var(--mac-text);line-height:1.35">Click any node in graph</h2>
        <div id="insFile" style="font-size:0.72rem;color:var(--mac-text-muted);word-break:break-all;overflow-wrap:anywhere">Location will show here</div>
      </div>

      <div class="mac-meta-card">
        <div class="mac-meta-cell">
          <span class="mac-meta-title" id="metaLabel1">Louvain Cluster</span>
          <span class="mac-meta-value" id="metaComm" style="color:var(--mac-teal)">-</span>
        </div>
        <div class="mac-meta-cell">
          <span class="mac-meta-title" id="metaLabel2">PageRank Centrality</span>
          <span class="mac-meta-value" id="metaPR" style="color:var(--mac-yellow)">-</span>
        </div>
        <div class="mac-meta-cell">
          <span class="mac-meta-title" id="metaLabel3">Degree (In+Out)</span>
          <span class="mac-meta-value" id="metaDeg" style="color:var(--mac-green)">-</span>
        </div>
        <div class="mac-meta-cell">
          <span class="mac-meta-title" id="metaLabel4">Package Scope</span>
          <span class="mac-meta-value" id="metaPkg" style="color:var(--mac-orange)">-</span>
        </div>
      </div>

      <div>
        <div id="insPanelTitle1" style="font-size:0.7rem;color:var(--mac-text-muted);margin-bottom:0.3rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Type Signature</div>
        <pre class="mac-code-panel" id="insSig">// Select a node to view details</pre>
      </div>

      <div>
        <div id="insPanelTitle2" style="font-size:0.7rem;color:var(--mac-text-muted);margin-bottom:0.3rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Contract & Comments</div>
        <div class="mac-doc-panel" id="insDoc">No node selected.</div>
      </div>

      <div>
        <div id="insPanelTitle3" style="font-size:0.7rem;color:var(--mac-text-muted);margin-bottom:0.3rem;font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Outgoing Callees / Citations</div>
        <div id="insCalls" style="font-size:0.78rem;color:var(--mac-text);margin-top:0.2rem;display:flex;flex-wrap:wrap;gap:3px">-</div>
      </div>
    </div>
  </div>`;
}
