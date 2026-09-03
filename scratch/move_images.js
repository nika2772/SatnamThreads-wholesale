const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync(path.join(__dirname, '..', 'data', 'satnam.db'));

const categories = db.prepare('SELECT id, slug FROM categories').all();
const targetDir = path.join(__dirname, '..', 'public', 'img', 'categories');
fs.mkdirSync(targetDir, { recursive: true });

const brainDir = 'C:\\Users\\singh\\.gemini\\antigravity-ide\\brain\\5e47b9d2-0a26-4f94-97f7-8bdc93985ca1';

const fileMap = {
  'threads': 'cat_threads',
  'elastic': 'cat_elastic',
  'buttons': 'cat_buttons',
  'zippers-sliders': 'cat_zippers',
  'stationary': 'cat_stationary',
  'needles': 'cat_needles',
  'interlings': 'cat_interlings',
  'cotton-niwars': 'cat_niwars',
  'dories': 'cat_dories',
  'cutters-and-blades': 'cat_cutters',
  'accessories': 'cat_accessories'
};

const artifacts = fs.readdirSync(brainDir);

categories.forEach(cat => {
  const prefix = fileMap[cat.slug];
  if (!prefix) return;
  const match = artifacts.find(f => f.startsWith(prefix) && f.endsWith('.png'));
  if (match) {
    fs.copyFileSync(path.join(brainDir, match), path.join(targetDir, cat.slug + '.png'));
    db.prepare('UPDATE categories SET image = ? WHERE id = ?').run(`/static/img/categories/${cat.slug}.png`, cat.id);
  }
});
console.log('Images moved and database updated.');
