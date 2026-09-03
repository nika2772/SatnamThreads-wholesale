const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.join(__dirname, '../data/satnam.db'));

const products = db.prepare('SELECT id, name, sku, slug, description, category_id, price FROM products WHERE parent_id IS NULL').all();

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

  const dimKeys = Object.keys(dims);
  if (dimKeys.length > 0) {
    console.log(`Generating variants for [${p.id}] ${p.name}...`);
    
    // Clean up existing variants if any
    db.prepare('DELETE FROM products WHERE parent_id = ?').run(p.id);
    
    // Update parent opts
    db.prepare('UPDATE products SET opts = ? WHERE id = ?').run(JSON.stringify({dimensions: dimKeys}), p.id);
    
    // Generate all permutations
    const combinations = [];
    const helper = (idx, currentCombo) => {
      if (idx === dimKeys.length) {
        combinations.push({ ...currentCombo });
        return;
      }
      const dim = dimKeys[idx];
      for (const val of dims[dim]) {
        currentCombo[dim] = val;
        helper(idx + 1, currentCombo);
      }
    };
    helper(0, {});
    
    // Insert combinations
    let varCount = 1;
    for (const combo of combinations) {
      let varSuffix = Object.values(combo).join(' ').replace(/[^a-zA-Z0-9 ]/g, '').replace(/ +/g, '-').toLowerCase();
      let varNameSuffix = Object.values(combo).join(' ');
      
      const vSku = `${p.sku || p.id}-V${varCount}`;
      const vSlug = `${p.slug}-${varSuffix}`;
      const vName = `${p.name} - ${varNameSuffix}`;
      const vOpts = JSON.stringify({ values: combo });
      
      db.prepare('INSERT INTO products (sku, slug, name, category_id, parent_id, price, is_active, opts) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
        vSku, vSlug, vName, p.category_id, p.id, p.price, 1, vOpts
      );
      varCount++;
    }
    console.log(`  -> Inserted ${combinations.length} variants`);
  }
}
