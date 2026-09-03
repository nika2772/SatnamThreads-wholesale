const { db } = require('../src/db');
db.prepare("UPDATE products SET price = 200, mrp = 200, tiers = '[]'").run();
console.log('Prices updated successfully on the correct database.');
