import puppeteer from 'puppeteer';

async function testVisNetwork() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const html = `
    <!doctype html>
    <html>
    <head>
      <script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
      <style>
        body { margin: 0; background: #090d16; color: white; font-family: sans-serif; }
        #network { width: 100vw; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="network"></div>
      <script>
        const nodes = new vis.DataSet([
          { id: 1, label: 'createMcpServer', color: { background: '#22c55e', border: '#16a34a' }, font: { color: '#ffffff' }, size: 25 },
          { id: 2, label: 'MemoryService', color: { background: '#ec4899', border: '#db2777' }, font: { color: '#ffffff' }, size: 30 },
          { id: 3, label: 'CodebaseService', color: { background: '#ec4899', border: '#db2777' }, font: { color: '#ffffff' }, size: 30 },
          { id: 4, label: 'DatabaseManager', color: { background: '#38bdf8', border: '#0284c7' }, font: { color: '#ffffff' }, size: 20 },
        ]);

        const edges = new vis.DataSet([
          { from: 1, to: 2, color: { color: '#38bdf8' } },
          { from: 1, to: 3, color: { color: '#38bdf8' } },
          { from: 2, to: 4, color: { color: '#38bdf8' } },
        ]);

        const container = document.getElementById('network');
        const data = { nodes: nodes, edges: edges };
        const options = {
          nodes: { shape: 'dot', font: { size: 14, face: 'monospace' } },
          physics: { stabilization: true, barnesHut: { springLength: 120 } }
        };
        const network = new vis.Network(container, data, options);
      </script>
    </body>
    </html>
  `;

  await page.setContent(html);
  await new Promise(r => setTimeout(r, 1500));

  const screenshot = await page.screenshot({ fullPage: false });
  console.log('Screenshot taken successfully, byte length:', screenshot.length);
  await browser.close();
}

testVisNetwork().catch(console.error);
