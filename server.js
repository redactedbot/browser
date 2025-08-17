const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
app.use(bodyParser.json({ limit: '2mb' }));

let sessions = {};

async function createBrowser() {
  return await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--remote-debugging-port=9222',
      '--window-size=1280,720'
    ]
  });
}

app.post('/session', async (req, res) => {
  try {
    const browser = await createBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    const id = Date.now().toString();
    sessions[id] = { browser, page };
    res.json({ sessionId: id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed_to_create_session' });
  }
});

app.post('/session/:id/navigate', async (req, res) => {
  const { id } = req.params;
  const { url } = req.body;
  if (!sessions[id]) return res.status(404).json({ error: 'no_session' });
  try {
    await sessions[id].page.goto(url, { waitUntil: 'domcontentloaded' });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'navigate_failed' });
  }
});

app.post('/session/:id/click', async (req, res) => {
  const { id } = req.params;
  const { x, y, posterWidth, posterHeight } = req.body;
  if (!sessions[id]) return res.status(404).json({ error: 'no_session' });
  try {
    const page = sessions[id].page;
    const metrics = await page.viewport();
    const scaleX = metrics.width / posterWidth;
    const scaleY = metrics.height / posterHeight;
    await page.mouse.click(x * scaleX, y * scaleY);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'click_failed' });
  }
});

app.post('/session/:id/:cmd', async (req, res) => {
  const { id, cmd } = req.params;
  if (!sessions[id]) return res.status(404).json({ error: 'no_session' });
  try {
    const page = sessions[id].page;
    if (cmd === 'back') await page.goBack({ waitUntil: 'domcontentloaded' });
    else if (cmd === 'reload') await page.reload({ waitUntil: 'domcontentloaded' });
    else return res.status(400).json({ error: 'unknown_cmd' });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'navcmd_failed' });
  }
});

app.get('/session/:id/screenshot', async (req, res) => {
  const { id } = req.params;
  if (!sessions[id]) return res.status(404).send('no_session');
  try {
    const buf = await sessions[id].page.screenshot({ type: 'png' });
    res.setHeader('Content-Type', 'image/png');
    res.send(buf);
  } catch (e) {
    console.error(e);
    res.status(500).send('screenshot_failed');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Browser server listening on port ' + PORT);
});
