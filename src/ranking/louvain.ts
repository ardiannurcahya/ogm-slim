import { GraphEdge } from './centrality.js';

/**
 * Computes community partitions using the Louvain Modularity Optimization method (Blondel et al. 2008).
 * Symmetrizes directional code calls and maximizes network modularity Q.
 *
 * @param nodeKeys Array of symbol unique identifiers
 * @param edges Array of directed/undirected graph edges
 * @returns Map of nodeKey -> community_id (1-indexed, ordered by cluster size descending)
 */
export function computeLouvainCommunities(
  nodeKeys: string[],
  edges: GraphEdge[]
): Map<string, number> {
  const n = nodeKeys.length;
  if (n === 0) return new Map();

  const keyToIndex = new Map<string, number>();
  nodeKeys.forEach((k, i) => keyToIndex.set(k, i));

  // Build symmetric adjacency weights
  const adj: Map<number, number>[] = Array.from({ length: n }, () => new Map<number, number>());
  const degree = new Float64Array(n);
  let totalWeight2M = 0;

  for (const e of edges) {
    const u = keyToIndex.get(e.source);
    const v = keyToIndex.get(e.target);
    if (u !== undefined && v !== undefined && u !== v) {
      const curW = adj[u].get(v) || 0;
      adj[u].set(v, curW + 1);
      adj[v].set(u, curW + 1);
      degree[u] += 1;
      degree[v] += 1;
      totalWeight2M += 2;
    }
  }

  // Handle graph with no internal edges
  if (totalWeight2M === 0) {
    const fallback = new Map<string, number>();
    nodeKeys.forEach((k, i) => fallback.set(k, i + 1));
    return fallback;
  }

  // Phase 1: Local modularity optimization
  const community = new Int32Array(n);
  for (let i = 0; i < n; i++) community[i] = i;

  const communityTotDegree = new Float64Array(n);
  for (let i = 0; i < n; i++) communityTotDegree[i] = degree[i];

  let improved = true;
  let maxPasses = 25;

  while (improved && maxPasses-- > 0) {
    improved = false;

    for (let i = 0; i < n; i++) {
      const curComm = community[i];
      const k_i = degree[i];
      if (k_i === 0) continue;

      // Find neighbor communities and link weights
      const neighborComms = new Map<number, number>();
      for (const [neighbor, weight] of adj[i].entries()) {
        const comm = community[neighbor];
        neighborComms.set(comm, (neighborComms.get(comm) || 0) + weight);
      }

      // Remove node i from its current community
      communityTotDegree[curComm] -= k_i;

      // Evaluate best community to join based on modularity gain
      let bestComm = curComm;
      let bestGain = 0;

      for (const [targetComm, weightToComm] of neighborComms.entries()) {
        const totDegree = communityTotDegree[targetComm];
        // deltaQ = weightToComm - (totDegree * k_i) / (2m)
        const gain = weightToComm - (totDegree * k_i) / totalWeight2M;
        if (gain > bestGain) {
          bestGain = gain;
          bestComm = targetComm;
        }
      }

      // Put node into best community
      community[i] = bestComm;
      communityTotDegree[bestComm] += k_i;

      if (bestComm !== curComm) {
        improved = true;
      }
    }
  }

  // Normalize community IDs to contiguous 1..K sorted by community size descending
  const counts = new Map<number, number>();
  for (let i = 0; i < n; i++) {
    counts.set(community[i], (counts.get(community[i]) || 0) + 1);
  }

  const sortedComms = Array.from(counts.keys()).sort(
    (a, b) => (counts.get(b) || 0) - (counts.get(a) || 0)
  );

  const commRankMap = new Map<number, number>();
  sortedComms.forEach((c, idx) => commRankMap.set(c, idx + 1));

  const result = new Map<string, number>();
  for (let i = 0; i < n; i++) {
    result.set(nodeKeys[i], commRankMap.get(community[i]) || 1);
  }

  return result;
}
