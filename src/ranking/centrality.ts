import { CodeSymbol } from '../types/domain.js';

export interface GraphEdge {
  source: string;
  target: string;
}

export function computeGraphAnalytics(
  symbols: CodeSymbol[],
  edges: GraphEdge[]
): void {
  const nodeCount = symbols.length;
  if (nodeCount === 0) return;

  const nodeMap = new Map<string, CodeSymbol>();
  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  symbols.forEach((s) => {
    nodeMap.set(s.key, s);
    inDegree.set(s.key, 0);
    outDegree.set(s.key, 0);
    adj.set(s.key, []);
  });

  edges.forEach((e) => {
    if (nodeMap.has(e.source) && nodeMap.has(e.target)) {
      outDegree.set(e.source, (outDegree.get(e.source) || 0) + 1);
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
      adj.get(e.source)!.push(e.target);
    }
  });

  // 1. Calculate Degree Centrality
  symbols.forEach((s) => {
    const deg = (inDegree.get(s.key) || 0) + (outDegree.get(s.key) || 0);
    s.degree = deg;
  });

  // 2. Simplified PageRank (20 iterations)
  const d = 0.85;
  let pr = new Map<string, number>();
  symbols.forEach((s) => pr.set(s.key, 1.0 / nodeCount));

  for (let it = 0; it < 20; it++) {
    const nextPr = new Map<string, number>();
    symbols.forEach((s) => nextPr.set(s.key, (1 - d) / nodeCount));

    symbols.forEach((s) => {
      const neighbors = adj.get(s.key) || [];
      const rank = pr.get(s.key) || 0;
      if (neighbors.length > 0) {
        const share = (rank * d) / neighbors.length;
        neighbors.forEach((targetKey) => {
          nextPr.set(targetKey, (nextPr.get(targetKey) || 0) + share);
        });
      }
    });

    pr = nextPr;
  }

  symbols.forEach((s) => {
    s.pagerank = parseFloat((pr.get(s.key) || 0).toFixed(6));
  });

  // 3. Simple Community Clustering (by Package / Directory Component)
  const pkgMap = new Map<string, number>();
  let nextCommunityId = 1;

  symbols.forEach((s) => {
    const pkg = s.package_name || 'root';
    if (!pkgMap.has(pkg)) {
      pkgMap.set(pkg, nextCommunityId++);
    }
    s.community_id = pkgMap.get(pkg);
  });
}
