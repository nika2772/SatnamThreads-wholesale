const fs = require('fs');
const path = require('path');
const { db } = require('../src/db');
const { slugify } = require('../src/helpers');

const ASSETS_DIR = path.join(__dirname, '..', 'assets', 'images');
const PUBLIC_IMG_DIR = path.join(__dirname, '..', 'public', 'img', 'products');

if (!fs.existsSync(PUBLIC_IMG_DIR)) {
  fs.mkdirSync(PUBLIC_IMG_DIR, { recursive: true });
}

// Map keywords to category slugs
const categoryMapping = {
  'threads': ['thread', 'box', 'cone', 'reel', 'overlock', 'doli', 'rangoli'],
  'needles': ['needle', 'groz', 'schmetz', 'organ', 'beckret'],
  'cutters-and-blades': ['cutter', 'scissor', 'blade', 'ripper', 'knive'],
  'stationary': ['chalk', 'tape', 'pencil', 'marker', 'scale', 'calculator', 'measure'],
  'zippers-sliders': ['zip', 'ykk', 'cinc', 'conceal'],
  'elastic': ['elastic'],
  'interlings': ['fusing', 'kankan'],
  'buttons': ['button', 'snap', 'fastener'],
  'dories': ['dori'],
  'accessories': ['bobbin', 'boot', 'oil', 'thimble', 'press', 'gun', 'hook', 'pin', 'punch', 'dye', 'driver', 'stain']
};

// Fetch categories from DB
const categories = db.prepare('SELECT id, slug FROM categories').all();
const getCatId = (productName) => {
  const lower = productName.toLowerCase();
  for (const [slug, keywords] of Object.entries(categoryMapping)) {
    if (keywords.some(kw => lower.includes(kw))) {
      const cat = categories.find(c => c.slug === slug);
      if (cat) return cat.id;
    }
  }
  // Default to Accessories if nothing matched
  const acc = categories.find(c => c.slug === 'accessories');
  return acc ? acc.id : categories[0].id;
};

// Group files by product name
const files = fs.readdirSync(ASSETS_DIR);
const productsMap = {};

for (const file of files) {
  if (file === 'logo.jpeg' || file === 'ap.webp') continue; // skip irrelevant
  const ext = path.extname(file);
  let name = path.basename(file, ext);
  
  // Clean up double extensions like .png.jpg
  if (name.endsWith('.png') || name.endsWith('.jpg')) {
    name = path.basename(name, path.extname(name));
  }

  // Remove trailing numbers (01, 02, 1, 2)
  let baseName = name.replace(/\s*0?[1-9]\s*$/, '').replace(/-removebg-preview/g, '').trim();

  if (!productsMap[baseName]) {
    productsMap[baseName] = [];
  }
  productsMap[baseName].push(file);
}

const insertProduct = db.prepare(`
  INSERT INTO products (name, slug, category_id, images, is_active, price, mrp)
  VALUES (@name, @slug, @cat_id, @images, 1, 0, 0)
`);

let importedCount = 0;

for (const [baseName, images] of Object.entries(productsMap)) {
    const slug = slugify(baseName);
    const catId = getCatId(baseName);
    const newImages = [];

    // Copy images
    images.forEach((file, index) => {
      const ext = path.extname(file);
      const newFilename = `${slug}-${index + 1}${ext}`;
      const src = path.join(ASSETS_DIR, file);
      const dest = path.join(PUBLIC_IMG_DIR, newFilename);
      fs.copyFileSync(src, dest);
      newImages.push(`/img/products/${newFilename}`);
    });

    try {
      insertProduct.run({
        name: baseName,
        slug: slug,
        cat_id: catId,
        images: JSON.stringify(newImages)
      });
      importedCount++;
    } catch (e) {
      // If slug exists, append a random string
      if (e.message.includes('UNIQUE')) {
        insertProduct.run({
          name: baseName,
          slug: slug + '-' + Math.random().toString(36).substring(2, 6),
          cat_id: catId,
          images: JSON.stringify(newImages)
        });
        importedCount++;
      } else {
        console.error('Error inserting', baseName, e.message);
      }
    }
  }

console.log(`Successfully imported ${importedCount} products with their images!`);
