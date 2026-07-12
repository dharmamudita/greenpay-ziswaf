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

const files = walkSync('./app').filter(f => f.endsWith('.js'));
const results = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Ignore comments
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) return;
    if (line.includes('console.')) return;
    
    // Check for hardcoded <Text> (e.g. <Text>Some Text</Text>)
    if (line.match(/<Text[^>]*>\s*[a-zA-Z0-9_]+[^<\{]*<\/Text>/) && !line.includes('t(')) {
        results.push({ file, line: index + 1, text: line.trim(), type: '<Text>' });
    }
    
    // Check for placeholder="Text"
    if (line.match(/placeholder="[a-zA-Z]+[^"]*"/) && !line.includes('t(')) {
        results.push({ file, line: index + 1, text: line.trim(), type: 'placeholder' });
    }
    
    // Check for title="Text" in Buttons
    if (line.match(/title="[a-zA-Z]+[^"]*"/) && !line.includes('t(')) {
        results.push({ file, line: index + 1, text: line.trim(), type: 'title' });
    }
    
    // Check for Alert.alert('Text', ...)
    if (line.match(/Alert\.alert\(\s*'[^']+'/) && !line.includes('t(')) {
        results.push({ file, line: index + 1, text: line.trim(), type: 'Alert' });
    }
    
  });
});

console.log(JSON.stringify(results, null, 2));
