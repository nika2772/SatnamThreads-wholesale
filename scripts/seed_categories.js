const { db } = require('../src/db');
const { slugify } = require('../src/helpers');

const categories = [
    "Threads",
    "Elastic",
    "Buttons",
    "Zippers & sliders",
    "Stationary",
    "Needles",
    "Interlings",
    "Cotton niwars",
    "Dories",
    "Cutters and Blades",
    "Accessories"
];

try {
    db.exec('BEGIN TRANSACTION');
    
    // Clear existing categories
    db.prepare('DELETE FROM categories').run();

    let sort = 10;
    const insert = db.prepare('INSERT INTO categories (name, slug, sort, is_active) VALUES (?, ?, ?, 1)');
    
    for (const name of categories) {
        const slug = slugify(name);
        insert.run(name, slug, sort);
        sort += 10;
    }

    db.exec('COMMIT');
    console.log(`Successfully seeded ${categories.length} categories.`);
} catch (error) {
    db.exec('ROLLBACK');
    console.error('Error seeding categories:', error);
}
