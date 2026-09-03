const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync(path.join(__dirname, '..', 'data', 'satnam.db'));
try {
  db.exec("ALTER TABLE orders ADD COLUMN carrier TEXT DEFAULT ''");
  console.log("Added carrier column to orders");
} catch(e) {
  console.log("Column might already exist", e.message);
}
