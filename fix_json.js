const fs = require('fs');

function mergeJson(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // I will just parse it, but standard JSON.parse overrides duplicate keys!
  // Oh wait, if I use a custom parser, it's hard.
  // Instead, I'll just use regex to remove the duplicates and merge them.
}
