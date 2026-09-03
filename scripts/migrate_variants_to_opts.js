const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.join(__dirname, '../data/satnam.db'));

// Get all parent products that have variants
const parents = db.prepare('SELECT p.* FROM products p WHERE p.parent_id IS NULL AND EXISTS (SELECT 1 FROM products v WHERE v.parent_id = p.id)').all();

for (const parent of parents) {
  const children = db.prepare('SELECT * FROM products WHERE parent_id=?').all(parent.id);
  if (!children.length) continue;
  
  // if parent already has opts dimensions, skip
  let pOpts = parent.opts ? JSON.parse(parent.opts) : {};
  if (pOpts.dimensions && pOpts.dimensions.length > 0) continue;
  
  console.log(`Migrating ${parent.name}...`);
  
  // determine dimensions based on children names
  // Apsara Glass Marking Pencil - White -> "White"
  // If there are multiple dashes? 
  // Let's assume generic "Option" for everything
  
  pOpts.dimensions = ['Option'];
  db.prepare('UPDATE products SET opts=? WHERE id=?').run(JSON.stringify(pOpts), parent.id);
  
  for (const child of children) {
    let optVal = child.name;
    if (child.name.includes(' - ')) {
      optVal = child.name.split(' - ').pop();
    }
    const cOpts = child.opts ? JSON.parse(child.opts) : {};
    cOpts.values = { 'Option': optVal };
    db.prepare('UPDATE products SET opts=? WHERE id=?').run(JSON.stringify(cOpts), child.id);
  }
}
console.log('Done.');
