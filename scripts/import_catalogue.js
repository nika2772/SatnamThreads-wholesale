const fs = require('fs');
const path = require('path');
const { db } = require('../src/db');
const { slugify } = require('../src/helpers');

const CATALOGUE_DIR = 'C:\\Users\\singh\\.gemini\\antigravity\\scratch\\threads-catalogue';
const DATA_FILE = path.join(CATALOGUE_DIR, 'data.js');
const PUBLIC_IMG_DIR = path.join(__dirname, '..', 'public', 'img', 'products');

if (!fs.existsSync(PUBLIC_IMG_DIR)) {
  fs.mkdirSync(PUBLIC_IMG_DIR, { recursive: true });
}

// 1. Delete previously imported products (mrp = 0 AND price = 0)
const delRes = db.prepare('DELETE FROM products WHERE price = 0 AND mrp = 0').run();
console.log(`Deleted ${delRes.changes} botched products.`);

// 2. Read and parse data.js
let dataStr = fs.readFileSync(DATA_FILE, 'utf-8');
dataStr += '\nreturn { categories, products };';
const { products } = (new Function(dataStr))();

// Fetch categories from DB to get their IDs
const dbCategories = db.prepare('SELECT id, name FROM categories').all();
const getCatId = (name) => {
  const cat = dbCategories.find(c => c.name === name);
  return cat ? cat.id : dbCategories[0].id;
};

const insertProduct = db.prepare(`
  INSERT INTO products (name, slug, category_id, short_desc, description, images, is_active, price, mrp)
  VALUES (@name, @slug, @cat_id, @short_desc, @description, @images, 1, 0, 0)
`);

let importedCount = 0;

const processItem = (item, baseCategory) => {
  const name = item.title;
  let slug = slugify(name);
  const catId = getCatId(item.category || baseCategory);
  
  // Build description from specs
  let htmlDesc = '';
  if (item.specs) {
    htmlDesc = '<ul>' + Object.entries(item.specs).map(([k, v]) => `<li><b>${k}:</b> ${v}</li>`).join('') + '</ul>';
  }

  const imagesToCopy = item.images || (item.image ? [item.image] : []);
  const newImages = [];

  imagesToCopy.forEach((relPath, index) => {
    // relPath looks like "assets/images/vardhman overlock 10000m.png?v=2"
    // Remove query params
    const cleanRelPath = relPath.split('?')[0];
    const src = path.join(CATALOGUE_DIR, cleanRelPath);
    
    if (fs.existsSync(src)) {
      const ext = path.extname(cleanRelPath);
      const newFilename = `${slug}-${index + 1}${ext}`;
      const dest = path.join(PUBLIC_IMG_DIR, newFilename);
      fs.copyFileSync(src, dest);
      newImages.push(`/static/img/products/${newFilename}`);
    } else {
      console.warn(`Warning: Image not found: ${src}`);
    }
  });

  try {
    insertProduct.run({
      name: name,
      slug: slug,
      cat_id: catId,
      short_desc: item.desc || '',
      description: htmlDesc,
      images: JSON.stringify(newImages)
    });
    importedCount++;
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      slug = slug + '-' + Math.random().toString(36).substring(2, 6);
      insertProduct.run({
        name: name,
        slug: slug,
        cat_id: catId,
        short_desc: item.desc || '',
        description: htmlDesc,
        images: JSON.stringify(newImages)
      });
      importedCount++;
    } else {
      console.error('Error inserting', name, e.message);
    }
  }
};

for (const p of products) {
  if (p.variants) {
    for (const v of p.variants) {
      processItem(v, p.category);
    }
  } else {
    processItem(p, p.category);
  }
}

console.log(`Successfully imported ${importedCount} products from data.js!`);
