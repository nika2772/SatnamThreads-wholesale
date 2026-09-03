const db = require('../src/db').db;
const changes = db.prepare(`
  UPDATE orders 
  SET user_id = (SELECT id FROM users WHERE LOWER(users.email) = LOWER(orders.email) LIMIT 1) 
  WHERE user_id IS NULL 
    AND email IS NOT NULL 
    AND email != '' 
    AND EXISTS (SELECT 1 FROM users WHERE LOWER(users.email) = LOWER(orders.email))
`).run();
console.log('Updated orders:', changes.changes);
