const db = new (require('node:sqlite').DatabaseSync)('data/satnam.db');
db.exec("DELETE FROM products WHERE name LIKE 'Dummy Force Update%';");
db.exec("VACUUM;");
