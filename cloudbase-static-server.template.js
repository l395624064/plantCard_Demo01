const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.bin': 'application/octet-stream',
  '.txt': 'text/plain',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ico': 'image/x-icon',
};

// .bin / .wasm files are uploaded as .b64.txt and decoded on request.
const BINARY_ROUTES = {};
const B64_EXTS = ['.wasm', '.bin'];

function scanB64(dir, base) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      scanB64(path.join(dir, entry.name), `${base}/${entry.name}`);
      continue;
    }
    if (!entry.name.endsWith('.b64.txt')) {
      continue;
    }
    const originalName = entry.name.slice(0, -8);
    const ext = path.extname(originalName).toLowerCase();
    if (!B64_EXTS.includes(ext)) {
      continue;
    }
    const route = `${base}/${originalName}`;
    BINARY_ROUTES[route] = {
      file: path.join(dir, entry.name),
      mime: MIME[ext] || 'application/octet-stream',
    };
  }
}

scanB64(__dirname, '');

http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (BINARY_ROUTES[url]) {
    const { file, mime } = BINARY_ROUTES[url];
    fs.readFile(file, 'utf8', (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      const buffer = Buffer.from(data.trim(), 'base64');
      res.writeHead(200, {
        'Content-Type': mime,
        'Access-Control-Allow-Origin': '*',
        'Content-Length': buffer.length,
      });
      res.end(buffer);
    });
    return;
  }

  const filePath = path.join(__dirname, url === '/' ? 'index.html' : url);
  fs.stat(filePath, (error, stat) => {
    if (error || stat.isFile() === false) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const mime = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': mime,
      'Access-Control-Allow-Origin': '*',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}).listen(PORT, () => console.log(`Server running on port ${PORT}`));
