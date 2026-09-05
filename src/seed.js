'use strict';
const { db, setting } = require('./db');
const { hashPassword, slugify } = require('./helpers');

const CATS = [
  ['Eyebrow Threading Thread', null, 'Antiseptic cotton threading thread for salons and beauty distributors.'],
  ['Tag Guns & Accessories', null, 'Tagging guns, needles and barbs for garment labelling lines.'],
  ['Tag Guns', 'Tag Guns & Accessories', 'Standard and fine tagging guns built for high-volume floors.'],
  ['Tag Gun Needles', 'Tag Guns & Accessories', 'Replacement needles for standard and fine tagging guns.'],
  ['Standard Barbs (Tag Pins)', 'Tag Guns & Accessories', 'Standard tag pins in every common length.'],
  ['Fine Barbs (Tag Pins)', 'Tag Guns & Accessories', 'Fine-gauge tag pins for delicate knitwear and hosiery.'],
  ['Tags & Labels', null, 'Paper, PVC, nylon and tear-proof tags for garment identification.'],
  ['Paper Price Tags', 'Tags & Labels', 'Plain and printed one-part and two-part paper price tags.'],
  ['Nylon Hang Tags', 'Tags & Labels', 'Durable nylon hang tags for export-grade garments.'],
  ['Plastic PVC Tags', 'Tags & Labels', 'Waterproof PVC tags in small and large sizes.'],
  ['Thread String Tags', 'Tags & Labels', 'Pre-strung thread tags ready for immediate attachment.'],
  ['Tear Proof Tags', 'Tags & Labels', 'Synthetic tear-resistant tags for heavy handling.'],
  ['Price Label Rolls', 'Tags & Labels', 'Self-adhesive label rolls for pricing guns and printers.'],
  ['Pins & Fasteners', null, 'Safety pins, shirt pins, clips and security loop pins.'],
  ['Safety Pins', 'Pins & Fasteners', 'Nickel-plated safety pins in all trade sizes.'],
  ['Shirt Pins & Clips', 'Pins & Fasteners', 'Shirt pins, collar clips and transparent garment clips.'],
  ['Loop Pins', 'Pins & Fasteners', 'Plastic loop pins for socks, gloves and paired items.'],
  ['Security Loop Pins', 'Pins & Fasteners', 'Adjustable, tamper-evident security loop pins.'],
  ['Packing & Finishing', null, 'Everything the packing table needs, from glue to organza pouches.'],
  ['Glue Sticks', 'Packing & Finishing', 'Hot-melt glue sticks for 20W and 40W glue guns.'],
  ['Thread Cutters', 'Packing & Finishing', 'Sharp, long-life thread cutters and nippers.'],
  ['Wash Care Labels', 'Packing & Finishing', 'Printed wash care and content labels.'],
  ['Taffeta Rolls', 'Packing & Finishing', 'Taffeta ribbon rolls for printed labels.'],
  ['Jewellery Organza Pouches', 'Packing & Finishing', 'Organza drawstring pouches for jewellery and accessories.']
];

/* name, category, mrp, price, tiers[[minqty,price]], pack, moq, unit, weight, stock, flags, short, long */
const PRODUCTS = [
  ['Griffin Eyebrow Threading Thread — Pack of 15 Spools', 'Eyebrow Threading Thread', 630, 465, [[6, 440], [24, 415], [60, 392]], '15 spools × 300 m', 1, 'pack', 320, 640, { featured: 1, new: 1 },
    'Antiseptic 100% cotton threading thread. The salon standard — smooth glide, no snapping.',
    'Griffin threading thread is spun from long-staple cotton and treated with a skin-safe antiseptic finish. Each spool carries a full 300 metres, so a busy salon gets roughly 90–110 brow sessions per spool. The twist is engineered to grip fine hair without shredding, which is what stops the mid-session snap that costs you time and client confidence.\n\nSupplied in shrink-wrapped packs of 15 spools. Bulk cartons of 24 packs available on enquiry.'],
  ['Bella Organica Eyebrow Thread — Pack of 8 Spools', 'Eyebrow Threading Thread', 550, 325, [[6, 308], [24, 292], [60, 276]], '8 spools × 300 m', 1, 'pack', 180, 480, { featured: 1 },
    'Organic-cotton threading thread for sensitive skin. Unbleached, fragrance free.',
    'Bella Organica is our unbleached line — no optical brighteners, no fragrance, no dye. Salons serving clients with reactive skin ask for this one by name. Same 300 m spool length and the same tight twist as Griffin, in an 8-spool retail-ready pack.'],
  ['Vanity Pink Eyebrow Thread — Pack of 10 Spools', 'Eyebrow Threading Thread', 410, 350, [[6, 332], [24, 315], [60, 298]], '10 spools × 300 m', 1, 'pack', 210, 360, {},
    'Antiseptic cotton threading thread, 300 m per spool, in signature pink.',
    'Vanity Pink is the volume workhorse — a dependable antiseptic cotton thread at a price that works for salon chains buying by the carton. Ten spools per pack, colour-coded pink for easy stock separation from the purple line.'],
  ['Vanity Purple Eyebrow Thread — Pack of 10 Spools', 'Eyebrow Threading Thread', 480, 360, [[6, 342], [24, 324], [60, 306]], '10 spools × 300 m', 1, 'pack', 210, 340, {},
    'Antiseptic cotton threading thread, 300 m per spool, in signature purple.',
    'Identical construction to Vanity Pink with a purple dye lot. Salons commonly run pink at the front desk and purple in the back room so stock counts stay honest.'],
  ['Organica Eyebrow Thread — Pack of 8 Spools', 'Eyebrow Threading Thread', 470, 335, [[6, 318], [24, 302], [60, 286]], '8 spools × 300 m', 1, 'pack', 180, 300, { new: 1 },
    'Everyday organic cotton threading thread at distributor pricing.',
    'Our entry organic line. Unbleached cotton, 300 m spools, packed eight to a sleeve. Popular with distributors who need an organic SKU on the shelf without the Bella price point.'],

  ['Standard Tagging Gun — Heavy Duty Steel Needle', 'Tag Guns', 599, 385, [[6, 365], [24, 345], [50, 325]], '1 gun + 1 spare needle', 1, 'piece', 240, 220, { featured: 1 },
    'All-day tagging gun with steel needle and reinforced trigger return.',
    'Built for floors that fire 3,000+ tags a shift. The trigger return spring is rated to 500,000 cycles and the needle seat is steel, not moulded plastic — which is the part that fails first on cheap guns. Takes all standard 15–75 mm barbs. One spare needle in the box.'],
  ['Fine Fabric Tagging Gun — Micro Needle', 'Tag Guns', 750, 520, [[6, 494], [24, 468], [50, 442]], '1 gun + 2 spare needles', 1, 'piece', 250, 140, { new: 1 },
    'Micro-needle gun for knitwear, hosiery and fine woven fabric.',
    'A fine gun leaves a hole you cannot see on a 40-gauge knit. This one pairs a 0.65 mm micro needle with a shallow-throw trigger so the barb seats without dragging the yarn. Use only with fine barbs. Two spare needles included because fine needles are consumables.'],
  ['Standard Tag Gun Needles — Pack of 5', 'Tag Gun Needles', 250, 165, [[10, 156], [40, 148], [100, 140]], '5 needles', 1, 'pack', 40, 500, {},
    'Replacement steel needles for all standard tagging guns.',
    'Hardened steel, precision-ground tip. Fits every standard-gauge gun on the market including ours. Sold in fives — a needle is a consumable and a blunt one tears fabric.'],
  ['Fine Tag Gun Needles — Pack of 5', 'Tag Gun Needles', 320, 210, [[10, 199], [40, 189], [100, 179]], '5 needles', 1, 'pack', 35, 380, {},
    'Micro needles for fine-fabric tagging guns.',
    '0.65 mm hardened micro needles for fine guns. Replace at the first sign of drag — a worn fine needle will pull a run in knitwear long before it looks blunt to the eye.'],
  ['Standard Barbs 25 mm — 5,000 Pcs', 'Standard Barbs (Tag Pins)', 690, 470, [[5, 446], [20, 423], [50, 399]], '5,000 pcs (50 clips × 100)', 1, 'box', 900, 260, { featured: 1 },
    'Standard 25 mm tag pins. The size most garment floors run by default.',
    'Moulded nylon barbs on 100-pin clips, 50 clips to the box. 25 mm is the default for shirting, denim and most woven outerwear. Consistent gate cut means no ragged tail left on the garment.'],
  ['Standard Barbs 40 mm — 5,000 Pcs', 'Standard Barbs (Tag Pins)', 760, 525, [[5, 499], [20, 473], [50, 446]], '5,000 pcs (50 clips × 100)', 1, 'box', 1150, 190, {},
    'Standard 40 mm tag pins for thicker garments and multi-layer tagging.',
    'The longer barb for jackets, towelling and anywhere you are tagging through a folded hem plus a card. Same nylon and same clip format as the 25 mm.'],
  ['Fine Barbs 25 mm — 5,000 Pcs', 'Fine Barbs (Tag Pins)', 850, 610, [[5, 580], [20, 549], [50, 518]], '5,000 pcs (50 clips × 100)', 1, 'box', 780, 170, {},
    'Fine-gauge 25 mm barbs for knitwear, hosiery and lingerie.',
    'Roughly half the shaft diameter of a standard barb. Required for fine guns. If your QC is rejecting garments for visible tag holes, this is the fix.'],

  ['1-Part Plain Paper Price Tags — 1,000 Pcs (White)', 'Paper Price Tags', 590, 370, [[10, 351], [40, 333], [100, 314]], '1,000 tags', 1, 'pack', 520, 700, {},
    'Blank white price tags, 300 gsm board, pre-punched.',
    '300 gsm coated board that takes both thermal transfer and standard pen without feathering. Pre-punched 3 mm eyelet hole, square cut. Blank on both sides so you can print your own brand and barcode.'],
  ['1-Part Printed Paper Price Tags — 1,000 Pcs (Blue)', 'Paper Price Tags', 590, 390, [[10, 370], [40, 351], [100, 331]], '1,000 tags', 1, 'pack', 520, 540, {},
    'Pre-printed price grid tags in blue, ready to fill and attach.',
    'Comes printed with the standard MRP / size / colour grid used across Indian retail. Saves the print run if you are a small retailer who just needs to write and hang.'],
  ['Nylon Hang Tags — 1,000 Pcs (White)', 'Nylon Hang Tags', 890, 640, [[10, 608], [40, 576], [100, 544]], '1,000 tags', 1, 'pack', 610, 280, { new: 1 },
    'Export-grade nylon tags that survive shipping, humidity and handling.',
    'Where paper softens and PVC cracks, nylon does neither. Standard on export orders to EU and US buyers who specify a tag that will still be legible after a sea container crossing.'],
  ['Plastic PVC Tags Small 3.2 × 5 cm — 1,000 Pcs', 'Plastic PVC Tags', 699, 550, [[10, 522], [40, 495], [100, 467]], '1,000 tags', 1, 'pack', 700, 420, {},
    'Waterproof PVC tags, small format, pre-punched.',
    '250 micron PVC, tear proof and fully waterproof. The small format is standard for hosiery, accessories and inner wear.'],
  ['Plastic PVC Tags Large 4.5 × 8 cm — 1,000 Pcs', 'Plastic PVC Tags', 750, 650, [[10, 617], [40, 585], [100, 552]], '1,000 tags', 1, 'pack', 1200, 380, {},
    'Waterproof PVC tags, large format, pre-punched.',
    'Same 250 micron stock in the larger format used for outerwear, home textiles and anything that needs a full care panel printed on the reverse.'],
  ['Thread String Tags — 1,000 Pcs Pre-Strung', 'Thread String Tags', 820, 595, [[10, 565], [40, 536], [100, 505]], '1,000 tags', 1, 'pack', 800, 240, {},
    'Tags arrive pre-strung with cotton loop. No threading step on your line.',
    'Every tag ships with the cotton loop already knotted through the eyelet. On a 2,000-piece order that removes roughly four hours of manual threading from your packing table.'],
  ['Tear Proof Synthetic Tags — 1,000 Pcs', 'Tear Proof Tags', 990, 720, [[10, 684], [40, 648], [100, 612]], '1,000 tags', 1, 'pack', 640, 160, {},
    'Synthetic paper tags that will not tear at the punch hole.',
    'Made from a polypropylene-based synthetic paper. Prints like paper, tears like fabric — which is to say, it does not. Specified for workwear, industrial laundry and rental garments.'],
  ['Thermal Price Label Roll 50 × 25 mm — 1,000 Labels', 'Price Label Rolls', 320, 235, [[12, 223], [48, 212], [120, 200]], '1 roll × 1,000 labels', 1, 'roll', 190, 900, {},
    'Direct thermal self-adhesive labels for standard barcode printers.',
    '50 × 25 mm direct thermal labels on a 25 mm core. Permanent acrylic adhesive that holds on polybag, carton and fabric-backed card. Fits every desktop thermal printer we have tested.'],

  ['Steel Safety Pins No. 2 — 1,440 Pcs (1 Gross Box)', 'Safety Pins', 480, 330, [[10, 313], [40, 297], [100, 280]], '1,440 pcs', 1, 'box', 950, 520, {},
    'Nickel-plated steel safety pins, size 2. The trade default.',
    'Nickel-plated hardened steel with a coiled spring that keeps tension after repeated use. Size 2 (32 mm) is the general-purpose garment size. Twelve dozen to the box.'],
  ['Transparent Plastic Shirt Clips — 1,000 Pcs', 'Shirt Pins & Clips', 599, 350, [[10, 333], [40, 315], [100, 298]], '1,000 pcs', 1, 'pack', 400, 610, { featured: 1 },
    'Clear collar and placket clips for shirt folding and presentation.',
    'The clip that holds a folded shirt collar square in the polybag. Moulded from clear polypropylene so it disappears against the fabric. Standard in every shirting packing line.'],
  ['Plastic Loop Pins 3 inch — 5,000 Pcs', 'Loop Pins', 780, 545, [[5, 518], [20, 490], [50, 463]], '5,000 pcs', 1, 'box', 820, 300, {},
    'Loop pins for pairing socks, gloves and two-piece sets.',
    'The T-end loop that pairs items without piercing them twice. Three-inch length suits socks, gloves and slipper pairs. Snaps clean off at the head when the customer removes it.'],
  ['Adjustable Security Loop Pins — 1,000 Pcs', 'Security Loop Pins', 1150, 850, [[5, 808], [20, 765], [50, 723]], '1,000 pcs', 1, 'pack', 560, 150, { new: 1 },
    'Tamper-evident adjustable loops for high-value garments and footwear.',
    'A ratcheting loop that tightens but will not loosen — to remove it you must cut it, and the cut is visible. Used on footwear pairs, leather goods and anywhere shrinkage on the shop floor is a live concern.'],

  ['Hot Melt Glue Sticks 8.5" for 20W Gun — Pack of 36', 'Glue Sticks', 500, 330, [[10, 313], [40, 297], [100, 280]], '36 sticks × 8.5 inch', 1, 'pack', 900, 480, { featured: 1 },
    'Clear hot-melt sticks for 20W glue guns. Fast tack, low stringing.',
    'Standard 11 mm diameter, 8.5 inch length, for 20W craft and packing guns. Formulated for a fast set with minimal stringing — which matters when you are gluing tag cards onto polybags at speed.'],
  ['Thread Cutters — Pack of 12 Pcs', 'Thread Cutters', 399, 250, [[10, 238], [40, 225], [100, 213]], '12 cutters', 1, 'pack', 320, 560, {},
    'Sharp stainless thread nippers for the finishing table.',
    'Spring-loaded stainless nippers with a ground bevel edge. Sold by the dozen because on a finishing line they walk. Comfortable enough for an eight-hour shift.'],
  ['Printed Wash Care Labels — 1,000 Pcs', 'Wash Care Labels', 620, 430, [[10, 409], [40, 387], [100, 366]], '1,000 labels', 1, 'pack', 280, 260, {},
    'Standard symbol wash care labels on satin tape.',
    'Woven-edge satin tape printed with the ISO care symbol set. Standard fibre-content variants stocked; custom composition printing available on enquiry with a 5,000-piece minimum.'],
  ['Taffeta Ribbon Roll 25 mm × 200 m', 'Taffeta Rolls', 480, 340, [[12, 323], [48, 306], [120, 289]], '1 roll × 200 m', 1, 'roll', 240, 320, {},
    'Blank taffeta tape for in-house label printing.',
    'Smooth 25 mm taffeta on a 200 metre roll, ready for thermal transfer printing. If you print your own care and brand labels, this is the base stock.'],
  ['Organza Drawstring Pouches 10 × 12 cm — 100 Pcs', 'Jewellery Organza Pouches', 650, 445, [[10, 423], [40, 401], [100, 378]], '100 pouches', 1, 'pack', 220, 290, { new: 1 },
    'Sheer organza gift pouches for jewellery, accessories and samples.',
    'Double-drawstring organza pouches with a clean serged edge. Popular with jewellery exporters and D2C accessory brands who want the unboxing to feel considered. Assorted colours; single-colour lots on enquiry.']
];

const PAGES = [
  ['about-us', 'About Satnam Threads', `<p class="lead">Satnam Threads was founded in 1993 as a wholesaler of threads and garment accessories to small and medium garment exporters in Delhi.</p>
<p>Three decades later we still do the same thing, for a lot more people. We supply tagging guns, barbs, tags, labels, pins, threading thread and packing consumables to garment exporters, manufacturers, salons, distributors and independent retailers across India.</p>
<h2>How we work</h2>
<p>Our philosophy has not changed since the first year: <strong>take care of the customer every time, without hesitation.</strong> In practice that means four commitments.</p>
<h3>1. Lowest price, guaranteed</h3>
<p>If you find a lower price anywhere for the same quality, tell us and we will match it. We would rather keep the account than win the invoice.</p>
<h3>2. A real person answers</h3>
<p>No IVR, no ticket queue. WhatsApp is our primary channel because it keeps a written record both sides can refer back to — message <strong>+91 84594 55595</strong> and you will hear from us within one business day.</p>
<h3>3. No-hassle returns</h3>
<p>If it is not right, send it back. Ask us for a return authorisation first so we can track it, and that is the whole process.</p>
<h3>4. Satisfaction, or we fix it</h3>
<p>If you are not completely satisfied, neither are we. Tell us and we will make it right.</p>
<h2>Who buys from us</h2>
<p>Garment exporters running tagging lines. Manufacturers who need barbs and needles on standing order. Salon chains buying threading thread by the carton. Distributors stocking a full accessory range. And independent retailers who need a hundred pieces, not a thousand — we serve them at the same counter.</p>`],
  ['shipping-delivery', 'Shipping & Delivery', `<h2>Dispatch</h2>
<p>Orders confirmed before 2:00 PM on a working day are dispatched the same day. Orders after that go the next working day. We are closed on Sundays and national holidays.</p>
<h2>Delivery time</h2>
<table><thead><tr><th>Destination</th><th>Typical transit</th></tr></thead><tbody>
<tr><td>Delhi NCR</td><td>1–2 working days</td></tr>
<tr><td>North India</td><td>2–4 working days</td></tr>
<tr><td>Rest of India</td><td>3–7 working days</td></tr>
<tr><td>North-East &amp; J&amp;K</td><td>5–10 working days</td></tr>
</tbody></table>
<h2>Shipping charges</h2>
<p>A flat shipping rate of ₹150 applies to all orders. Bulk and palletised consignments are quoted separately — heavy freight is charged at actuals and we will always tell you the number before we book it.</p>

<h2>Tracking</h2>
<p>Every dispatched order gets a tracking reference by WhatsApp and email. You can also check status any time from <a href="/track">Track Order</a>.</p>`],
  ['returns-exchanges', 'Returns & Exchanges', `<h2>The short version</h2>
<p>If it is not right, send it back. No questions asked. Please request a return authorisation first so the consignment is traceable.</p>
<h2>Window</h2>
<p>Seven days from delivery for stock items. Report transit damage or shortage within 48 hours of delivery with photographs — that is a hard deadline set by our carriers, not by us.</p>
<h2>How to start a return</h2>
<ol><li>WhatsApp <strong>+91 84594 55595</strong> with your order number and what is wrong.</li>
<li>We issue a return authorisation number the same working day.</li>
<li>Ship the goods back with the RA number written on the outer carton.</li>
<li>Refund or replacement is processed within 3 working days of receipt.</li></ol>
<h2>What we cannot take back</h2>
<p>Custom-printed labels, custom-composition wash care tapes and any item printed to your artwork. These are made to your specification and have no resale value to us. We will always confirm artwork in writing before production for exactly this reason.</p>
<h2>Refunds</h2>
<p>Prepaid orders are refunded to the original payment method. Wholesale accounts can take the value as a credit note against the next invoice, which is usually faster.</p>`],
  ['terms-conditions', 'Terms & Conditions', `<h2>1. About these terms</h2><p>These terms govern your use of this website and any order placed through it with Satnam Threads (Golden India Enterprises), New Delhi.</p>
<h2>2. Pricing</h2><p>All prices are in Indian Rupees. Retail prices shown include applicable GST unless stated otherwise. Wholesale slab pricing is visible only to approved wholesale accounts and is confidential to that account.</p>
<h2>3. Orders</h2><p>An order is a request to buy. It becomes a contract when we confirm dispatch. We may decline any order — for example where stock has sold out between your order and our confirmation.</p>
<h2>4. Enquiries and quotations</h2><p>An enquiry submitted through this site is not an order and creates no obligation on either side.</p>
<h2>5. Payment</h2><p>Retail orders are payable at checkout. Wholesale orders must be paid before dispatch.</p>
<h2>6. Product information</h2><p>We describe our products as accurately as we can. Colours may vary slightly between dye lots and between your screen and the physical item. Where an exact shade match matters, ask us for a physical sample before ordering.</p>
<h2>7. Liability</h2><p>Our liability for any order is limited to the invoice value of that order.</p>
<h2>8. Governing law</h2><p>These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the courts of Delhi.</p>`],
  ['privacy-policy', 'Privacy Policy', `<h2>What we collect</h2><p>Your name, business name, email, phone number, delivery address and GSTIN where you supply it. For wholesale applications we also record the city and nature of your business so we can set the right price slab.</p>
<h2>Why we collect it</h2><p>To process orders, quote enquiries, arrange delivery, raise GST-compliant invoices and answer your questions. Nothing else.</p>
<h2>What we do not do</h2><p>We do not sell your data. We do not share it with advertisers. We do not send marketing messages to anyone who has not asked for them.</p>
<h2>Payments</h2><p>Card and UPI details are handled entirely by our payment gateway. They never reach our servers and we never store them.</p>
<h2>Cookies</h2><p>We use one essential cookie to keep your cart and login session working. That is it. No advertising or cross-site tracking cookies are set by us.</p>
<h2>Your rights</h2><p>Email <strong>sales@satnamthreads.com</strong> to see, correct or delete the data we hold about you. We will respond within seven working days. Note that GST law requires us to retain invoice records for eight years, so transaction records cannot be deleted on request.</p>`]
];

function run() {
  const catCount = db.prepare('SELECT COUNT(*) c FROM categories').get().c;
  if (catCount > 0) { console.log('Database already seeded. Use `npm run reset` to rebuild.'); return; }

  const insCat = db.prepare('INSERT INTO categories(parent_id,name,slug,description,image,sort) VALUES(?,?,?,?,?,?)');
  const ids = {};
  CATS.forEach(([name, parent, desc], i) => {
    const slug = slugify(name);
    const r = insCat.run(parent ? ids[parent] : null, name, slug, desc, `/static/img/cat/${slug}.svg`, i);
    ids[name] = Number(r.lastInsertRowid);
  });

  const insProd = db.prepare(`INSERT INTO products
    (sku,name,slug,category_id,short_desc,description,mrp,price,tiers,moq,unit,pack_size,weight_g,stock,images,hsn,gst_rate,is_featured,is_new,rating,review_count)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  PRODUCTS.forEach(([name, cat, mrp, price, tiers, pack, moq, unit, wt, stock, flags, short, long], i) => {
    const slug = slugify(name);
    insProd.run(
      'ST-' + String(1001 + i), name, slug, ids[cat] || null, short, long,
      mrp, price, JSON.stringify(tiers.map(([min_qty, p]) => ({ min_qty, price: p }))),
      moq, unit, pack, wt, stock,
      JSON.stringify([`/static/img/catalog/${slug}.svg`]),
      '5807', 18, flags.featured ? 1 : 0, flags.new ? 1 : 0,
      Math.round((4.2 + Math.random() * 0.7) * 10) / 10, 3 + (i % 17)
    );
  });

  const insPage = db.prepare('INSERT INTO pages(slug,title,body) VALUES(?,?,?)');
  PAGES.forEach(([s, t, b]) => insPage.run(s, t, b));

  db.prepare('INSERT INTO users(name,email,phone,password_hash,role,account_type,company,status) VALUES(?,?,?,?,?,?,?,?)')
    .run('Store Administrator', 'admin@satnamthreads.com', '8459455595',
      hashPassword(process.env.ADMIN_PASSWORD || 'satnam@2026'), 'admin', 'wholesale', 'Satnam Threads', 'active');

  db.prepare('INSERT INTO users(name,email,phone,password_hash,role,account_type,company,gstin,city,status) VALUES(?,?,?,?,?,?,?,?,?,?)')
    .run('Demo Wholesale Buyer', 'buyer@example.com', '9810000000',
      hashPassword('demo1234'), 'customer', 'wholesale', 'Kapoor Garments Pvt Ltd', '07AABCU9603R1ZX', 'New Delhi', 'active');


  const S = {
    site_name: 'Satnam Threads',
    tagline: 'Garment accessories, wholesale since 1993',
    phone: '+91 84594 55595',
    whatsapp: '918459455595',
    email: 'sales@satnamthreads.com',
    address: 'Janakpuri, New Delhi 110058, India',
    hours: 'Mon – Sat, 10:00 AM – 6:00 PM',
    gstin: '07AAAFG0000A1Z5',
    free_shipping_over: '5000',
    shipping_flat: '150',
    currency: '₹',
    announcement: 'Wholesale slab pricing for approved accounts',
    razorpay_key_id: '',
    razorpay_key_secret: '',
    payments_live: '0',
    bank_details: 'Golden India Enterprises\nA/c 000000000000 · IFSC XXXX0000000\nBank name, Janakpuri branch, New Delhi'
  };
  for (const [k, v] of Object.entries(S)) setting.set(k, v);

  console.log(`Seeded ${CATS.length} categories, ${PRODUCTS.length} products, ${PAGES.length} pages.`);
  console.log('Admin login: admin@satnamthreads.com / ' + (process.env.ADMIN_PASSWORD || 'satnam@2026'));
}

if (require.main === module) run();
module.exports = { run };
