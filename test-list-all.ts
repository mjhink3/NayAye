import fs from 'fs';
import path from 'path';

function listRecursive(dir: string): void {
  try {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (f === 'node_modules' || f === '.git' || f === 'dist' || f === '.npm') continue;
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        console.log('Dir:', full);
        listRecursive(full);
      } else {
        console.log('File:', full, 'size:', stat.size);
      }
    }
  } catch (e) {}
}

console.log('Listing everything in current dir:');
listRecursive('.');
