import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { computeLouvainCommunities } from '../src/ranking/louvain.js';
import { computePageRank } from '../src/ranking/pagerank.js';

describe('OGM-Slim Graph Algorithms (Louvain & PageRank)', () => {
  test('Louvain method should partition disjoint bipartite clusters', () => {
    const nodes = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'];
    const edges = [
      // Cluster A
      { source: 'A1', target: 'A2' },
      { source: 'A2', target: 'A3' },
      { source: 'A1', target: 'A3' },
      // Cluster B
      { source: 'B1', target: 'B2' },
      { source: 'B2', target: 'B3' },
      { source: 'B1', target: 'B3' },
      // Weak bridge
      { source: 'A3', target: 'B1' },
    ];

    const communities = computeLouvainCommunities(nodes, edges);
    assert.equal(communities.size, 6);

    // Nodes in Cluster A should share same community
    const commA1 = communities.get('A1');
    const commA2 = communities.get('A2');
    const commA3 = communities.get('A3');
    assert.equal(commA1, commA2);
    assert.equal(commA2, commA3);

    // Nodes in Cluster B should share same community
    const commB1 = communities.get('B1');
    const commB2 = communities.get('B2');
    const commB3 = communities.get('B3');
    assert.equal(commB1, commB2);
    assert.equal(commB2, commB3);

    // Cluster A and Cluster B must be distinct
    assert.notEqual(commA1, commB1);
  });

  test('Louvain should handle isolated nodes without crash', () => {
    const nodes = ['X1', 'X2', 'X3'];
    const edges: Array<{ source: string; target: string }> = [];

    const communities = computeLouvainCommunities(nodes, edges);
    assert.equal(communities.size, 3);
  });

  test('PageRank should rank central hubs higher', () => {
    const nodes = ['Hub', 'Leaf1', 'Leaf2', 'Leaf3'];
    const adj = new Map<string, string[]>();
    adj.set('Leaf1', ['Hub']);
    adj.set('Leaf2', ['Hub']);
    adj.set('Leaf3', ['Hub']);
    adj.set('Hub', []);

    const pr = computePageRank(nodes, adj);
    const hubScore = pr.get('Hub') || 0;
    const leafScore = pr.get('Leaf1') || 0;

    assert.ok(hubScore > leafScore, 'Hub node should have strictly higher PageRank than leaf nodes');
  });
});
