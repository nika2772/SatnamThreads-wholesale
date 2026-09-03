const { db } = require('../src/db');
const { slugify } = require('../src/helpers');

try {
  db.exec('BEGIN TRANSACTION');

  const variants = db.prepare(`SELECT * FROM products WHERE name LIKE 'Apsara Glass Marking Pencil - %'`).all();
  if (variants.length === 0) {
    console.log('No variants found.');
    db.exec('ROLLBACK');
    process.exit(0);
  }

  // Check if parent already exists
  let parent = db.prepare(`SELECT * FROM products WHERE slug='apsara-glass-marking-pencil'`).get();

  if (!parent) {
    const base = variants[0];
    const info = db.prepare(`INSERT INTO products 
      (sku, name, slug, category_id, short_desc, description, mrp, price, tiers, moq, unit, pack_size, weight_g, stock, images, hsn, gst_rate, is_active, is_featured, is_new, rating, review_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'APSARA-GLASS-PARENT',
      'Apsara Glass Marking Pencil',
      'apsara-glass-marking-pencil',
      base.category_id,
      base.short_desc,
      base.description,
      base.mrp,
      base.price,
      base.tiers,
      base.moq,
      base.unit,
      base.pack_size,
      base.weight_g,
      0, // Parent doesn't need stock directly if it's just a shell, or can show 0
      base.images,
      base.hsn,
      base.gst_rate,
      1,
      base.is_featured,
      base.is_new,
      base.rating,
      base.review_count
    );
    parent = { id: Number(info.lastInsertRowid) };
    console.log('Created parent product, ID:', parent.id);
  } else {
    console.log('Parent product already exists, ID:', parent.id);
  }

  // Update variants
  const update = db.prepare(`UPDATE products SET parent_id=? WHERE id=?`);
  for (const v of variants) {
    update.run(parent.id, v.id);
    console.log(`Updated variant ${v.id} (${v.name}) to parent ${parent.id}`);
  }

  db.exec('COMMIT');
  console.log('Migration completed successfully.');
} catch (error) {
  db.exec('ROLLBACK');
  console.error('Migration failed:', error);
}
