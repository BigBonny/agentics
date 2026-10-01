// Usage: node scripts/make-zip.js <src_dir> <out_zip> <top_folder_name>
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const [srcDir, outZip, topName] = process.argv.slice(2);
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = d + '/' + f;
    if (fs.statSync(p).isDirectory()) walk(p); else files.push(p);
  }
})(srcDir);

const crcTable = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
const crc = (buf) => { let c = 0xFFFFFFFF; for (const b of buf) c = crcTable[(c ^ b) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };

const chunks = [], cd = [];
let offset = 0;
for (const fp of files) {
  const name = topName + '/' + path.relative(srcDir, fp).split(path.sep).join('/');
  const data = fs.readFileSync(fp);
  const comp = zlib.deflateRawSync(data);
  const nb = Buffer.from(name);
  const c = crc(data);

  const lh = Buffer.alloc(30);
  lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(8, 8);
  lh.writeUInt16LE(0, 10); lh.writeUInt16LE(0, 12); lh.writeUInt32LE(c, 14);
  lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(nb.length, 26); lh.writeUInt16LE(0, 28);
  chunks.push(lh, nb, comp);

  const ce = Buffer.alloc(46);
  ce.writeUInt32LE(0x02014b50, 0); ce.writeUInt16LE(20, 4); ce.writeUInt16LE(20, 6); ce.writeUInt16LE(0x0800, 8);
  ce.writeUInt16LE(8, 10); ce.writeUInt16LE(0, 12); ce.writeUInt16LE(0, 14); ce.writeUInt32LE(c, 16);
  ce.writeUInt32LE(comp.length, 20); ce.writeUInt32LE(data.length, 24); ce.writeUInt16LE(nb.length, 28);
  cd.push({ buf: ce, name: nb, offset });
  offset += lh.length + nb.length + comp.length;
}

const cdStart = offset; let cdSize = 0;
for (const e of cd) { e.buf.writeUInt32LE(e.offset, 42); chunks.push(e.buf, e.name); cdSize += e.buf.length + e.name.length; }
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(cdSize, 12); end.writeUInt32LE(cdStart, 16); chunks.push(end);
fs.writeFileSync(outZip, Buffer.concat(chunks));
console.log('OK:', files.length, 'files');
files.forEach(f => console.log(' ', topName + '/' + path.relative(srcDir, f).split(path.sep).join('/')));
