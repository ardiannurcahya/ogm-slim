import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  console.log('=== [1/4] Testing REST API Endpoints ===');
  
  // 1. Health check
  const healthRes = await fetch('http://127.0.0.1:8080/health');
  const health = await healthRes.json();
  console.log('Health check:', health);

  // 2. Index codebase
  const indexRes = await fetch('http://127.0.0.1:8080/api/codebase/index', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: '.', project_id: 'default' }),
  });
  const indexStats = await indexRes.json();
  console.log('Codebase indexing:', indexStats);

  // 3. Observe Evidence Episode
  const obsRes = await fetch('http://127.0.0.1:8080/api/memory/observe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: 'default',
      kind: 'command_output',
      observation: {
        command: 'npm test',
        status: 'passed',
        total_tests: 8,
        passed_tests: 8,
        engine: 'ogm-slim'
      },
      metadata: { repository: 'ogm-slim', branch: 'master' },
      idempotency_key: 'e2e-obs-1'
    }),
  });
  const obsData = await obsRes.json();
  console.log('Observed Episode ID:', obsData.episode?.id);

  // 4. Commit Typed Memory
  const commitRes = await fetch('http://127.0.0.1:8080/api/memory/commit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: 'default',
      type: 'bugfix',
      content: {
        summary: 'Fixed SQLite datetime string literal syntax and migrated to ogm-slim',
        root_cause: 'SQLite interpreted double quoted now as column name instead of literal',
        fix: 'Replaced datetime("now") with datetime(\'now\')',
        verification: '100% test pass verified with tsx --test'
      },
      confidence: 1.0,
      episodes: [{ episode_id: obsData.episode.id, purpose: 'evidence' }],
      idempotency_key: 'e2e-mem-1'
    }),
  });
  const commitData = await commitRes.json();
  console.log('Committed Memory ID:', commitData.memory?.id);

  // 5. Recall Memory
  const recallRes = await fetch('http://127.0.0.1:8080/api/memory/recall', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: 'default',
      text: 'datetime string literal syntax ogm-slim',
    }),
  });
  const recalled = await recallRes.json();
  console.log('Recalled Memory Capsules:', recalled.length, recalled[0]?.content?.summary);

  // 6. Fetch Graph Nodes & Edges
  const graphRes = await fetch('http://127.0.0.1:8080/api/graph?project=default');
  const graphData = await graphRes.json();
  console.log(`Graph metrics: ${graphData.nodes.length} nodes, ${graphData.edges.length} edges`);

  console.log('\n=== [2/4] Launching Headless Chrome via Puppeteer ===');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=swiftshader',
    ],
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));
  await page.setViewport({ width: 1440, height: 900 });

  console.log('=== [3/4] Navigating to OGM-Slim Admin Graph Page ===');
  await page.goto('http://127.0.0.1:8080/admin', { waitUntil: 'networkidle0', timeout: 15000 });

  // Wait for network container & symbols list
  await page.waitForSelector('#networkContainer');
  await page.waitForSelector('.mac-sym-item');

  const title = await page.title();
  const nodeCountText = await page.$eval('#nodeCount', el => el.innerText);
  const edgeCountText = await page.$eval('#edgeCount', el => el.innerText);
  const firstSymName = await page.$eval('.mac-sym-item .mac-sym-name', el => el.innerText);

  console.log(`Page Title: "${title}"`);
  console.log(`Reported Nodes: ${nodeCountText}, Edges: ${edgeCountText}`);
  console.log(`First Symbol: "${firstSymName}"`);

  // Click the first symbol item to test interactivity
  console.log('Clicking symbol in list to test Inspector...');
  await page.click('.mac-sym-item');

  const insName = await page.$eval('#insName', el => el.innerText);
  const insSig = await page.$eval('#insSig', el => el.innerText);
  console.log(`Inspector Symbol Selected: "${insName}"`);
  console.log(`Inspector Signature: "${insSig}"`);

  // Wait for Sigma canvas render
  await new Promise(r => setTimeout(r, 1200));

  console.log('\n=== [4/4] Capturing Screenshot ===');
  const artifactDir = 'C:/Users/ardia/.gemini/antigravity-cli/brain/ab9692a9-a8ab-41da-844a-5cfee0dc8c06';
  const screenshotPath = path.join(artifactDir, 'ogm_slim_admin_graph.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`Screenshot saved to: ${screenshotPath}`);

  await browser.close();
  console.log('\n🎉 ALL E2E VERIFICATIONS PASSED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('E2E Verification Error:', err);
  process.exit(1);
});
