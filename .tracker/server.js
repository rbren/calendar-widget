import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const STATE_DIR = path.join(ROOT, '.state');
const ISSUES_DIR = path.join(ROOT, '.issues');
const PORT = 5111;

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };
  const meta = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx !== -1) {
      meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return { meta, body: match[2] };
}

function readState() {
  const agents = {};
  if (!fs.existsSync(STATE_DIR)) return agents;
  for (const file of fs.readdirSync(STATE_DIR)) {
    if (!file.endsWith('.json')) continue;
    const name = path.basename(file, '.json');
    agents[name] = JSON.parse(fs.readFileSync(path.join(STATE_DIR, file), 'utf-8'));
  }
  return agents;
}

function readIssues() {
  if (!fs.existsSync(ISSUES_DIR)) return [];
  return fs.readdirSync(ISSUES_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(file => {
      const content = fs.readFileSync(path.join(ISSUES_DIR, file), 'utf-8');
      const { meta, body } = parseFrontmatter(content);
      const titleMatch = body.match(/^#\s+(.+)$/m);
      return {
        id: file.replace('.md', ''),
        filename: file,
        title: titleMatch ? titleMatch[1] : file,
        tag: meta.tag || 'unknown',
        state: meta.state || 'open',
        body: body.trim(),
      };
    });
}

async function start() {
  const app = express();

  app.get('/api/state', (_req, res) => res.json(readState()));
  app.get('/api/issues', (_req, res) => res.json(readIssues()));

  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: { port: 5112 } },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(PORT, () => {
    console.log(`🚀 Tracker running at http://localhost:${PORT}`);
  });
}

start();
