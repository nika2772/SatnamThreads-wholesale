const db = new (require('node:sqlite').DatabaseSync)('data/satnam.db');
db.exec("PRAGMA page_size = 8192; VACUUM;");
