const fs = require('fs');
const path = require('path');
const dir = path.join(process.cwd(), '.next');
try {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log('Cleared .next cache');
  } else {
    console.log('.next cache not found');
  }
} catch (e) {
  console.error('Failed to clear .next cache:', e.message);
  process.exit(1);
}
