const { execSync } = require('child_process');
const headCSS = execSync('git show HEAD:src/app/admin/courses/page.module.css', { encoding: 'utf8' });
const lines = headCSS.split('\n');
console.log(lines.slice(25, 60).join('\n'));
