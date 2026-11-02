const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (!full.includes('node_modules') && !full.includes('.next')) {
        results = results.concat(walk(full));
      }
    } else if (file.endsWith('.module.css') || file.endsWith('.tsx')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('./src/app/admin');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    // Check for suspicious white-on-white or low opacity or hover-revealed content
    if (
      l.includes('rgba(255, 255, 255') ||
      l.includes('rgba(255,255,255') ||
      l.includes('opacity: 0') ||
      l.includes('opacity: 0.1') ||
      l.includes('opacity: 0.2') ||
      l.includes('opacity: 0.3') ||
      l.includes('opacity: 0.4') ||
      l.includes('opacity: 0.5') ||
      (l.includes('color:') && (l.includes('#fff') || l.includes('white')) && !l.includes('background') && !l.includes('btn') && !l.includes('Badge') && !l.includes('badge'))
    ) {
      console.log(`${file}:${idx + 1} -> ${l.trim()}`);
    }
  });
});
