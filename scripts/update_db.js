const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('data/satnam.db');
console.log(db.prepare('SELECT value FROM settings WHERE key = ?').all('phone'));
console.log(db.prepare('PRAGMA table_info(pages)').all());

try {
  // Update pages body column
  db.prepare('UPDATE pages SET body = REPLACE(body, ?, ?)').run('98210 08088', '84594 55595');
  console.log('Pages updated');
} catch (err) {
  console.error('Error updating pages:', err.message);
}
