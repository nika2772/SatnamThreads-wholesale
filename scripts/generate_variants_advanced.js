const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.join(__dirname, '../data/satnam.db'));

const products = db.prepare(`
  SELECT id, name, sku, slug, description, category_id, price 
  FROM products 
  WHERE parent_id IS NULL AND (opts IS NULL OR opts = '{}')
`).all();

let totalInserted = 0;

for (const p of products) {
  if (!p.description) continue;
  
  let dims = {};
  let validCombinations = [];
  
  // 1. Needles logic: System and Sizes(System)
  const systemMatch = p.description.match(/<b>Available Systems?:<\/b>\s*([^<]+)<\/li>/i);
  if (systemMatch) {
    const systems = systemMatch[1].split(/,| and |&amp;/).map(s => s.trim()).filter(Boolean);
    dims['System'] = systems;
    
    // For each system, try to find sizes
    let allSizesFound = new Set();
    let anySystemHadSizes = false;
    
    for (const sys of systems) {
      const sysRegex = new RegExp(`<b>Sizes?\\s*\\(${sys}\\):<\\/b>\\s*([^<]+)<\\/li>`, 'i');
      const sysSizeMatch = p.description.match(sysRegex);
      if (sysSizeMatch) {
        anySystemHadSizes = true;
        const sizes = sysSizeMatch[1].split(/,| and |&amp;/).map(s => s.trim()).filter(Boolean);
        sizes.forEach(sz => {
          allSizesFound.add(sz);
          validCombinations.push({ System: sys, Size: sz });
        });
      } else {
        validCombinations.push({ System: sys }); // just the system if no sizes specified
      }
    }
    
    if (anySystemHadSizes) {
      dims['Size'] = Array.from(allSizesFound);
    }
  } else {
    // 2. Generic Sizes, Colors, Lengths
    const sizeMatch = p.description.match(/<b>Sizes?:<\/b>\s*([^<]+)<\/li>/i);
    if (sizeMatch) {
      const sizes = sizeMatch[1].split(/,| and |&amp;/).map(s => s.trim().replace(/"/g, "''").replace(/''/g, '"')).filter(Boolean);
      if (sizes.length > 1) dims['Size'] = sizes;
    }
    
    const colorMatch = p.description.match(/<b>Colors?:<\/b>\s*([^<]+)<\/li>/i);
    if (colorMatch) {
      const colorStr = colorMatch[1].toLowerCase();
      if (!colorStr.includes('multiple') && !colorStr.includes('assorted') && !colorStr.includes('available in')) {
        let colors = colorMatch[1].split(/,| and |&amp;/).map(s => s.trim()).filter(Boolean);
        if (colors.length > 1) dims['Color'] = colors;
      }
    }
    
    const lengthMatch = p.description.match(/<b>Lengths?:<\/b>\s*([^<]+)<\/li>/i);
    if (lengthMatch) {
      const lengths = lengthMatch[1].split(/,| and |&amp;/).map(s => s.trim()).filter(Boolean);
      if (lengths.length > 1) dims['Length'] = lengths;
    }
    
    // Generate cross-product combinations for generic dims
    const dimKeys = Object.keys(dims);
    if (dimKeys.length > 0) {
      const helper = (idx, currentCombo) => {
        if (idx === dimKeys.length) {
          validCombinations.push({ ...currentCombo });
          return;
        }
        const dim = dimKeys[idx];
        for (const val of dims[dim]) {
          currentCombo[dim] = val;
          helper(idx + 1, currentCombo);
        }
      };
      helper(0, {});
    }
  }
  
  if (validCombinations.length > 0) {
    console.log(`Generating variants for [${p.id}] ${p.name}...`);
    
    // Determine the final dimensions used by the combinations
    const usedDims = new Set();
    validCombinations.forEach(c => Object.keys(c).forEach(k => usedDims.add(k)));
    const dimKeys = Array.from(usedDims);
    
    // Clean up existing variants if any
    db.prepare('DELETE FROM products WHERE parent_id = ?').run(p.id);
    
    // Update parent opts
    db.prepare('UPDATE products SET opts = ? WHERE id = ?').run(JSON.stringify({dimensions: dimKeys}), p.id);
    
    // Insert combinations
    let varCount = 1;
    for (const combo of validCombinations) {
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
    console.log(`  -> Inserted ${validCombinations.length} variants`);
    totalInserted += validCombinations.length;
  }
}

console.log(`\nFinished! Generated ${totalInserted} total variants.`);
