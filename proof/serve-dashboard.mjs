import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = Number.parseInt(process.env.FOCUS_DASHBOARD_PORT || '3000', 10);
const htmlPath = path.join(__dirname, 'focus-dashboard.html');

const server = http.createServer((req, res) => {
  const reqPath = String(req.url || '/').split('?')[0];
  if (reqPath === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, service: 'focus-dashboard' }));
    return;
  }
  if (reqPath !== '/' && reqPath !== '/focus-dashboard.html') {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  try {
    const html = fs.readFileSync(htmlPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Failed to read dashboard: ${err?.message || err}`);
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Focus dashboard running at http://127.0.0.1:${port}`);
});
