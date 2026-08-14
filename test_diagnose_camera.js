import puppeteer from 'puppeteer';

async function diagnoseCamera() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:8080/admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const debug = await page.evaluate(() => {
    return {
      windowKeys: Object.keys(window),
      sampleNode: (window as any).graph ? (window as any).graph.getNodeAttributes((window as any).graph.nodes()[0]) : null,
    };
  });

  console.log('Camera debug:', debug);
  await browser.close();
}

diagnoseCamera().catch(console.error);
