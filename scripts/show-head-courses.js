const { execSync } = require('child_process');
const headContent = execSync('git show HEAD:src/app/admin/courses/AdminCoursesClient.tsx', { encoding: 'utf8' });
const cardStart = headContent.indexOf('filteredCourses.map');
console.log(headContent.slice(cardStart, cardStart + 2500));
