import fs from 'fs';
console.log('Exists public:', fs.existsSync('public'));
if (fs.existsSync('public')) {
  console.log('Public contents:', fs.readdirSync('public'));
} else {
  // Let's create the public folder!
  console.log('Creating public folder');
  fs.mkdirSync('public');
}
