const fs = require('fs');
const file = 'app/admin/(protected)/article-design/SectionEditor.tsx';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/<button\b(?!\s+type=)/g, '<button type="button"');
fs.writeFileSync(file, c);
console.log('Fixed buttons');
