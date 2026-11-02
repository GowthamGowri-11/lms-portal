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
    } else if (file.endsWith('.css') || file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('./src/app/admin');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.css')) {
    const matches = content.match(/([^{}]+:hover[^{}]*)\{([^}]+)\}/g);
    if (matches) {
      matches.forEach(m => {
        console.log(`[CSS] ${file}:\n   ${m.replace(/\s+/g, ' ').trim()}`);
      });
    }
  } else if (file.endsWith('.tsx')) {
    const lines = content.split('\n');
    lines.forEach((l, idx) => {
      if (l.includes('hover') || l.includes('opacity') || l.includes('hidden') || l.includes('onMouseEnter')) {
        if (!l.includes('whileHover') && !l.includes('import')) {
          console.log(`[TSX] ${file}:${idx + 1} -> ${l.trim()}`);
        }
      }
    });
  }
});
