const fs = require('fs');
const path = require('path');

const replacements = {
  'ðŸ§­': '🧭',
  'ðŸ¥¾': '🎒',
  'ðŸ” ': '🔍',
  'ðŸ“ ': '📍',
  'ðŸ’¼': '💼',
  'â ±': '⏱️',
  'ðŸ“…': '📅',
  'ðŸ›°ï¸ ': '🛰️',
  'ðŸŽŸï¸ ': '🎫',
  'ðŸ“‹': '📋',
  'ðŸ’³': '💳',
  'ðŸ“±': '📱',
  'ðŸ—ºï¸ ': '🗺️',
  'ðŸ””': '🔔',
  'ðŸŽ’': '🎒',
  'ðŸŒ¤ï¸ ': '🌤️',
  'ðŸ‘¤': '👤',
  'ðŸ“ž': '📞',
  'ðŸ’¬': '💬',
  'ðŸ”—': '🔗',
  'ðŸ“¢': '📢'
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedFiles = 0;
walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    for (const [bad, good] of Object.entries(replacements)) {
      newContent = newContent.split(bad).join(good);
    }
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Fixed mojibake in ${filePath}`);
      modifiedFiles++;
    }
  }
});

console.log(`Done. Modified ${modifiedFiles} files.`);
