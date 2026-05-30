import fs from 'fs';
import path from 'path';

function searchFilesByName(dir: string, keyword: string, depth = 0): void {
  if (depth > 5) return;
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.npm' || file === 'proc' || file === 'sys' || file === 'dev') continue;
      const fullPath = path.join(dir, file);
      if (file.toLowerCase().includes(keyword.toLowerCase())) {
        console.log('Match:', fullPath, 'size:', fs.statSync(fullPath).size);
      }
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          searchFilesByName(fullPath, keyword, depth + 1);
        }
      } catch (e) {}
    }
  } catch (e) {}
}

console.log('Searching for logo:');
searchFilesByName('.', 'logo');
searchFilesByName('/app', 'logo');

console.log('Searching for goat:');
searchFilesByName('.', 'goat');
searchFilesByName('/app', 'goat');

console.log('Searching for text-logo:');
searchFilesByName('.', 'text-logo');
searchFilesByName('/app', 'text-logo');
