import puppeteer from 'puppeteer';

async function diagnose() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message, err.stack));

  await page.goto('http://127.0.0.1:8080/admin', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 2000));

  const result = await page.evaluate(() => {
    const container = document.getElementById('sigmaContainer');
    const canvases = container ? container.querySelectorAll('canvas') : [];
    return {
      containerRect: container ? container.getBoundingClientRect() : null,
      canvasCount: canvases.length,
      canvasSizes: Array.from(canvases).map(c => ({ w: c.width, h: c.height, style: c.getAttribute('style') })),
      windowJumpExists: typeof window.jumpToNode === 'function',
      sigmaWindow: typeof window.highlightGraphNode === 'function'
    };
  });

  console.log('Diagnostic result:', result);
  await browser.close();
}

diagnose().catch(console.error);
