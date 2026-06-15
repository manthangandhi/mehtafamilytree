const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, 'app'),
  path.join(__dirname, 'components')
];

const replacements = [
  { from: /\bbg-white\b/g, to: 'bg-surface' },
  { from: /\bbg-\[\#fafaf9\]\b/g, to: 'bg-background' },
  { from: /\bbg-stone-50\b/g, to: 'bg-surface-hover' },
  { from: /\btext-stone-900\b/g, to: 'text-foreground' },
  { from: /\btext-stone-800\b/g, to: 'text-foreground' },
  { from: /\btext-stone-500\b/g, to: 'text-muted' },
  { from: /\btext-stone-400\b/g, to: 'text-muted' },
  { from: /\bborder-stone-200\b/g, to: 'border-border' },
  { from: /\bborder-stone-100\b/g, to: 'border-border' },
  { from: /\btext-amber-700\b/g, to: 'text-accent' },
  { from: /\bbg-amber-700\b/g, to: 'bg-accent' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const { from, to } of replacements) {
        content = content.replace(from, to);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

targetDirs.forEach(processDirectory);
console.log('Mass consistency purge complete.');
