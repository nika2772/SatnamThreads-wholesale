const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('data/satnam.db');
db.exec("UPDATE settings SET value='Wholesale slab pricing for approved accounts' WHERE key='announcement'");
console.log('Updated announcement setting');
