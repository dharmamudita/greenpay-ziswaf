const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBADF') filelist.push(dirFile);
    }
  });
  return filelist;
};

const enJson = JSON.parse(fs.readFileSync('./i18n/locales/en.json', 'utf8'));

function hasKey(obj, pathParts) {
  let current = obj;
  for (let i = 0; i < pathParts.length; i++) {
    if (current[pathParts[i]] === undefined) return false;
    current = current[pathParts[i]];
  }
  return true;
}

const files = walkSync('./app').filter(f => f.endsWith('.js'));
const missing = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Regex to match t('namespace.key', { defaultValue: '...' })
  const matches = [...content.matchAll(/t\(['"]([^'"]+)['"]\s*(?:,\s*\{\s*defaultValue\s*:\s*['"`](.*?)['"`]\s*\})?/g)];
  
  matches.forEach(match => {
    const key = match[1];
    const defaultValue = match[2];
    const parts = key.split('.');
    
    if (!hasKey(enJson, parts)) {
      missing.push({ file, key, defaultValue });
    }
  });
});

console.log(JSON.stringify(missing, null, 2));
