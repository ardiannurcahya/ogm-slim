import puppeteer from 'puppeteer';
import path from 'node:path';

async function capture() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://127.0.0.1:8080/admin', { waitUntil: 'networkidle0' });
  await page.waitForSelector('#datasetSelect');
  await new Promise(r => setTimeout(r, 2500));

  const outDir = 'C:\\Users\\ardia\\.gemini\\antigravity-cli\\brain\\ab9692a9-a8ab-41da-844a-5cfee0dc8c06';
  await page.screenshot({ path: path.join(outDir, 'ogm_slim_rich_connected_graph.png'), fullPage: false });
  console.log('Captured rich graph screenshot');

  await browser.close();
}

capture().catch(console.error);
