const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /text-on-surface-variant(?!\w)/g, to: 'text-muted' },
  { from: /text-on-surface(?!\w)/g, to: 'text-foreground' },
  { from: /text-on-background(?!\w)/g, to: 'text-foreground' },
  { from: /bg-surface-container-low(?!\w)/g, to: 'bg-surface-hover' },
  { from: /bg-surface-container-high(?!\w)/g, to: 'bg-surface-hover' },
  { from: /bg-surface-container-highest(?!\w)/g, to: 'bg-surface-hover' },
  { from: /bg-surface-container(?!\w)/g, to: 'bg-surface' },
  { from: /border-outline-variant(?!\w)/g, to: 'border-border' },
  { from: /border-outline(?!\w)/g, to: 'border-border' },
  { from: /text-primary-foreground(?!\w)/g, to: 'text-white' },
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
