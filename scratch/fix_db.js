const { db, setting } = require('../src/db');

// Remove GSTIN
setting.set('gstin', '');

// Get the current about-us page
const aboutPage = db.prepare("SELECT body FROM pages WHERE slug = 'about-us'").get();
if (aboutPage) {
  let body = aboutPage.body;
  
  // Remove lowest price guaranteed section
  body = body.replace(/<h3>1\. Lowest price, guaranteed<\/h3>\s*<p>If you find a lower price anywhere for the same quality, tell us and we will match it\. We would rather keep the account than win the invoice\.<\/p>/s, '');
  
  // Remove no-hassle returns section
  body = body.replace(/<h3>3\. No-hassle returns<\/h3>\s*<p>If it is not right, send it back\. Ask us for a return authorisation first so we can track it, and that is the whole process\.<\/p>/s, '');

  // Update the numbering since we removed 1 and 3. Wait, let's just make sure they are removed.
  // "2. A real person answers" -> "A real person answers"
  body = body.replace(/<h3>2\. A real person answers<\/h3>/, '<h3>A real person answers</h3>');
  body = body.replace(/<h3>4\. Satisfaction, or we fix it<\/h3>/, '<h3>Satisfaction, or we fix it</h3>');

  // Update the phone number text
  body = body.replace(/WhatsApp is our primary channel because it keeps a written record both sides can refer back to — message <strong>[^<]+<\/strong> and you will hear from us within one business day\./, 'WhatsApp is our primary channel because it keeps a written record both sides can refer back to. Message us and you will hear from us within one business day.');

  db.prepare("UPDATE pages SET body = ? WHERE slug = 'about-us'").run(body);
}

console.log("Database fixed.");
