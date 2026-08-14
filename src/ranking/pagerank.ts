/**
 * Power Iteration PageRank algorithm for symbol importance ranking in call graphs.
 *
 * @param nodeKeys List of symbol keys
 * @param adj Map from nodeKey -> array of outgoing neighbor nodeKeys
 * @param damping Damping factor (default: 0.85)
 * @param iterations Maximum power iterations (default: 20)
 * @returns Map of nodeKey -> PageRank score (summing to ~1.0)
 */
export function computePageRank(
  nodeKeys: string[],
  adj: Map<string, string[]>,
  damping: number = 0.85,
  iterations: number = 20
): Map<string, number> {
  const n = nodeKeys.length;
  const result = new Map<string, number>();
  if (n === 0) return result;

  let pr = new Map<string, number>();
  const initialScore = 1.0 / n;
  nodeKeys.forEach((k) => pr.set(k, initialScore));

  const baseScore = (1.0 - damping) / n;

  for (let it = 0; it < iterations; it++) {
    const nextPr = new Map<string, number>();
    nodeKeys.forEach((k) => nextPr.set(k, baseScore));

    for (const key of nodeKeys) {
      const neighbors = adj.get(key) || [];
      const score = pr.get(key) || 0;
      if (neighbors.length > 0) {
        const share = (score * damping) / neighbors.length;
        for (const targetKey of neighbors) {
          nextPr.set(targetKey, (nextPr.get(targetKey) || 0) + share);
        }
      }
    }

    pr = nextPr;
  }

  nodeKeys.forEach((k) => {
    result.set(k, parseFloat((pr.get(k) || 0).toFixed(6)));
  });

  return result;
}
