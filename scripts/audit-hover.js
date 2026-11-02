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

const files = walk('./src');
console.log('Searching', files.length, 'files...');

const hoverRules = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.css')) {
    // Regex for css selectors with :hover
    const matches = content.match(/([^{}]+:hover[^{}]*)\{([^}]+)\}/g);
    if (matches) {
      matches.forEach(m => {
        if (m.includes('opacity') || m.includes('visibility') || m.includes('color') || m.includes('display')) {
          hoverRules.push({ file, rule: m.replace(/\s+/g, ' ').trim() });
        }
      });
    }
  } else if (file.endsWith('.tsx')) {
    // Check for Tailwind hover:opacity, group-hover, onMouseEnter/Leave etc.
    const twMatches = content.match(/([a-zA-Z0-9_\-:]*hover:[a-zA-Z0-9_\-]+)/g);
    if (twMatches) {
      hoverRules.push({ file, rule: [...new Set(twMatches)].join(', ') });
    }
  }
});

console.log('Found', hoverRules.length, 'suspicious hover rules:');
hoverRules.forEach((h, i) => {
  console.log(`[${i}] ${h.file}:\n   ${h.rule.slice(0, 180)}`);
});
