const { db } = require('../src/db');
const patterns = ['%groz flat needle%', '%groz needle%', '%organ needle%', '%schemetz needle%', '%schmetz needle%', '%flying tiger needle%'];

let totalChanges = 0;
for (const pat of patterns) {
  const stmt = db.prepare(`UPDATE products SET hsn = '8452' WHERE name LIKE ?`);
  const result = stmt.run(pat);
  totalChanges += result.changes;
}

console.log(`Updated ${totalChanges} products.`);

const updated = db.prepare(`SELECT id, name, hsn FROM products WHERE hsn = '8452'`).all();
console.log(updated);
