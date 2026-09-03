const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.join(__dirname, '../data/satnam.db'));

const products = db.prepare('SELECT id, name, description, category_id, price FROM products WHERE parent_id IS NULL').all();

for (const p of products) {
  if (!p.description) continue;
  
  const dims = {};
  
  // Extract Sizes: 
  const sizeMatch = p.description.match(/<b>Sizes?:<\/b>\s*([^<]+)<\/li>/i);
  if (sizeMatch) {
    const sizes = sizeMatch[1].split(/,| and |&amp;/).map(s => s.trim().replace(/"/g, "''").replace(/''/g, '"')).filter(Boolean);
    if (sizes.length > 1) dims['Size'] = sizes;
  }
  
  // Extract Colors:
  const colorMatch = p.description.match(/<b>Colors?:<\/b>\s*([^<]+)<\/li>/i);
  if (colorMatch) {
    let colors = colorMatch[1].split(/,| and |&amp;/).map(s => s.trim()).filter(Boolean);
    if (colors.length > 1) dims['Color'] = colors;
  }
  
  // Extract Length:
  const lengthMatch = p.description.match(/<b>Lengths?:<\/b>\s*([^<]+)<\/li>/i);
  if (lengthMatch) {
    const lengths = lengthMatch[1].split(/,| and |&amp;/).map(s => s.trim()).filter(Boolean);
    if (lengths.length > 1) dims['Length'] = lengths;
  }

  if (Object.keys(dims).length > 0) {
    console.log(`Product [${p.id}] ${p.name}`);
    console.log(`  Dimensions found:`, dims);
  }
}
