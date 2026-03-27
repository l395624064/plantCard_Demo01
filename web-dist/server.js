const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.bin': 'application/octet-stream',
  '.txt': 'text/plain',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
};

// Binary files that cannot be uploaded directly are served from base64 encoded .b64.txt files
const BINARY_ROUTES = {
  '/cocos-js/assets/spine-17c81aa0.wasm': { file: 'cocos-js/assets/spine-17c81aa0.wasm.b64.txt', mime: 'application/wasm' },
  '/cocos-js/assets/spine.js.mem-dc937d48.bin': { file: 'cocos-js/assets/spine.js.mem-dc937d48.bin.b64.txt', mime: 'application/octet-stream' },
  '/src/effect.bin': { file: 'src/effect.bin.b64.txt', mime: 'application/octet-stream' },
};

http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (BINARY_ROUTES[url]) {
    const { file, mime } = BINARY_ROUTES[url];
    const b64Path = path.join(__dirname, file);
    fs.readFile(b64Path, 'utf8', (err, data) => {
      if (err) { res.writeHead(404); res.end('Not Found'); return; }
      const buf = Buffer.from(data.trim(), 'base64');
      res.writeHead(200, {
        'Content-Type': mime,
        'Access-Control-Allow-Origin': '*',
        'Content-Length': buf.length,
      });
      res.end(buf);
    });
    return;
  }

  let filePath = path.join(__dirname, url === '/' ? 'index.html' : url);
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404); res.end('Not Found'); return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': mime,
      'Access-Control-Allow-Origin': '*',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}).listen(8080, () => console.log('Server running on port 8080'));
