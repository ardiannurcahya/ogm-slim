import Database from 'better-sqlite3';
import path from 'node:path';
import os from 'node:os';

const db = new Database(path.join(os.homedir(), '.config', 'ogm-slim', 'memory.db'));
const datasets = db.prepare('SELECT * FROM datasets').all();

console.log('===============================================================');
console.log('   📊 GRAPH CONNECTIVITY & RELATION DENSITY AUDIT');
console.log('===============================================================');

for (const ds of datasets) {
  const total = db.prepare('SELECT count(*) as c FROM symbols WHERE dataset_id = ?').get(ds.id).c;
  const connected = db.prepare('SELECT count(*) as c FROM symbols WHERE dataset_id = ? AND degree > 0').get(ds.id).c;
  const isolated = total - connected;
  const connPct = total > 0 ? ((connected / total) * 100).toFixed(1) : '0.0';
  const totalEdges = db.prepare('SELECT count(*) as c FROM symbol_edges WHERE dataset_id = ?').get(ds.id).c;
  const edgeDensity = total > 0 ? (totalEdges / total).toFixed(2) : '0.00';

  console.log(`\n• Dataset: [${ds.name}]`);
  console.log(`  Total Symbols:   ${total}`);
  console.log(`  Connected Hubs:  ${connected} (${connPct}%)`);
  console.log(`  Isolated Nodes:  ${isolated} (${(100 - Number(connPct)).toFixed(1)}%)`);
  console.log(`  Total Edges:     ${totalEdges}`);
  console.log(`  Edges / Symbol:  ${edgeDensity}x`);
}

db.close();
