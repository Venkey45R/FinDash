const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  list.forEach(file => {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('src');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = [...content.matchAll(/import.*?from\s+['"](.*?)['"]/g)];
  
  matches.forEach(match => {
    const importPath = match[1];
    if (importPath.startsWith('.')) {
      const resolved = path.resolve(path.dirname(file), importPath);
      let targetFile = resolved;
      
      if (!path.extname(resolved)) {
        if (fs.existsSync(resolved + '.js')) targetFile = resolved + '.js';
        else if (fs.existsSync(resolved + '.jsx')) targetFile = resolved + '.jsx';
        else if (fs.existsSync(path.join(resolved, 'index.js'))) targetFile = path.join(resolved, 'index.js');
        else if (fs.existsSync(path.join(resolved, 'index.jsx'))) targetFile = path.join(resolved, 'index.jsx');
      }

      if (fs.existsSync(targetFile)) {
        const dir = path.dirname(targetFile);
        const actualName = fs.readdirSync(dir).find(n => n.toLowerCase() === path.basename(targetFile).toLowerCase());
        
        if (actualName && actualName !== path.basename(targetFile)) {
          console.log(`Mismatch in ${file}: imported '${importPath}' -> expected '${actualName}' but resolved as '${path.basename(targetFile)}'`);
        }
      }
    }
  });
});
console.log('Done checking imports.');
