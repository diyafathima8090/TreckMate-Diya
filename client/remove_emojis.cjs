const fs = require('fs');
const path = require('path');

// List of all known mojibake and actual emojis to remove
const toRemove = [
  'ðŸ§­', '🧭',
  'ðŸ¥¾', '🎒',
  'ðŸ” ', '🔍',
  'ðŸ“ ', '📍',
  'ðŸ’¼', '💼',
  'â ±', '⏱️',
  'ðŸ“…', '📅',
  'ðŸ›°ï¸ ', '🛰️',
  'ðŸŽŸï¸ ', '🎫',
  'ðŸ“‹', '📋',
  'ðŸ’³', '💳',
  'ðŸ“±', '📱',
  'ðŸ—ºï¸ ', '🗺️',
  'ðŸ””', '🔔',
  'ðŸŽ’', '🎒',
  'ðŸŒ¤ï¸ ', '🌤️',
  'ðŸ‘¤', '👤',
  'ðŸ“ž', '📞',
  'ðŸ’¬', '💬',
  'ðŸ”—', '🔗',
  'ðŸ“¢', '📢',
  '⭐', 'â­'
];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedFiles = 0;
walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.match(/\.(tsx|ts|jsx|js)$/)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    
    // First, remove the exact strings
    for (const bad of toRemove) {
      newContent = newContent.split(bad).join('');
    }
    
    // Also strip any residual 'ðŸ' or 'ï¸ ' or other typical mojibake artifacts globally
    newContent = newContent.replace(/ðŸ[^\s<"']*/g, '');
    newContent = newContent.replace(/ï¸/g, '');
    newContent = newContent.replace(/â±/g, '');
    
    // Some emojis might have been missed, let's use a regex for emojis
    // This removes typical emojis
    newContent = newContent.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
    newContent = newContent.replace(/[\u{2600}-\u{26FF}]/gu, '');
    newContent = newContent.replace(/[\u{2700}-\u{27BF}]/gu, '');
    
    // Clean up multiple spaces left behind, but only within text text, not everywhere. 
    // Actually, simple string replace is safer to not break code formatting.
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Cleaned emojis/mojibake in ${filePath}`);
      modifiedFiles++;
    }
  }
});

console.log(`Done. Cleaned ${modifiedFiles} files.`);
