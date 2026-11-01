const fs = require('fs');

const css = fs.readFileSync('src/app/admin/courses/page.module.css', 'utf8');
const lines = css.split('\n');

lines.forEach((l, i) => {
  if (l.includes(':hover') || l.includes('opacity') || l.includes('display: none') || l.includes('visibility')) {
    console.log(`Line ${i + 1}: ${l.trim()}`);
  }
});
