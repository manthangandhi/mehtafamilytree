const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /text-accent(?!\w)/g, to: 'text-primary' },
  { from: /bg-accent(?!\w)/g, to: 'bg-primary' },
  { from: /border-accent(?!\w)/g, to: 'border-primary' },
  { from: /text-muted(?!\w)/g, to: 'text-on-surface-variant' },
  { from: /text-foreground(?!\w)/g, to: 'text-on-surface' },
  { from: /bg-background(?!\w)/g, to: 'bg-surface' },
  { from: /bg-surface-hover(?!\w)/g, to: 'bg-surface-container-high' },
  { from: /border-border(?!\w)/g, to: 'border-outline-variant' },
  { from: /bg-surface(?!\w)/g, to: 'bg-surface-container' }, // bg-surface was surface, now surface-container
  { from: /font-display(?!\w)/g, to: 'font-serif' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      for (const r of replacements) {
        content = content.replace(r.from, r.to);
      }
      // Also fix any nested replacements if any overlap happened
      content = content.replace(/bg-surface-container-container/g, 'bg-surface-container');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'app'));
processDirectory(path.join(__dirname, 'components'));
console.log("Cleanup complete!");
