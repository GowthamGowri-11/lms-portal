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
    } else if (file.endsWith('.module.css') || file.endsWith('.css')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Match :hover rules
  const regex = /([^{}]+:hover[^{}]*)\{([^}]+)\}/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const selector = match[1].trim();
    const body = match[2].trim();
    // Check if the selector targets a descendant on hover (e.g. .card:hover .btn, .row:hover .actions)
    if (selector.includes(' ') || body.includes('opacity') || body.includes('visibility') || body.includes('display')) {
      console.log(`[${file}]`);
      console.log(`   ${selector} { ${body.replace(/\s+/g, ' ')} }`);
    }
  }
});
