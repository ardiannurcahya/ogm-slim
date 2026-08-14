import { CodeSymbol } from '../types/domain.js';
import { computeLouvainCommunities } from './louvain.js';
import { computePageRank } from './pagerank.js';

export interface GraphEdge {
  source: string;
  target: string;
}

/**
 * Computes full graph analytics on extracted code symbols:
 * 1. In/Out Degree Centrality
 * 2. PageRank Symbol Importance
 * 3. Louvain Modularity Community Detection
 */
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

  // 2. Compute PageRank
  const nodeKeys = symbols.map((s) => s.key);
  const prMap = computePageRank(nodeKeys, adj);
  symbols.forEach((s) => {
    s.pagerank = prMap.get(s.key) || 0;
  });

  // 3. Compute Louvain Modularity Communities
  const louvainMap = computeLouvainCommunities(nodeKeys, edges);
  symbols.forEach((s) => {
    s.community_id = louvainMap.get(s.key) || 1;
  });
}

export { computeLouvainCommunities } from './louvain.js';
export { computePageRank } from './pagerank.js';
