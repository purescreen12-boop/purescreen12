const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'Film');
const destDir = path.join(root, 'public', 'films');

if (!fs.existsSync(srcDir)) {
  console.error('Source Film directory not found:', srcDir);
  process.exit(1);
}
fs.mkdirSync(destDir, { recursive: true });

const exts = new Set(['.jpg', '.jpeg', '.png']);
const files = fs.readdirSync(srcDir).filter(f => exts.has(path.extname(f).toLowerCase()));
if (files.length === 0) {
  console.log('NO_IMAGES_FOUND');
  process.exit(0);
}

files.forEach(file => {
  const src = path.join(srcDir, file);
  const dst = path.join(destDir, file);
  try {
    fs.copyFileSync(src, dst);
    console.log('COPIED', file);
  } catch (err) {
    console.error('FAILED', file, err.message);
  }
});
console.log('DONE', files.length, 'files');
