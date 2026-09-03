# Satnam Threads — website

A complete, self-hosted online store for **Satnam Threads (Golden India Enterprises)** — garment accessories wholesaler, Janakpuri, New Delhi, est. 1993.

It runs the two sides of the business at once:

* **Retail** — customers browse, add to cart, pay online and track their order.
* **Wholesale / B2B** — approved trade accounts see quantity slab pricing, build an enquiry list, and you send them a written quote.

Everything is managed from a built-in admin panel. No developer needed for day-to-day running.

---

## Starting the site

**Requirement:** Node.js version 22.5 or newer — download from [nodejs.org](https://nodejs.org). That is the only thing to install.

**Mac:** double-click `start.command`. The site opens in your browser automatically.

**Any computer, from a terminal:**

```bash
cd satnam-threads
npm start
```

Then open **http://localhost:3000**

There is no `npm install` step. The site uses zero external libraries — it will not break because a package updated.

### Your logins

| | |
|---|---|
| Admin panel | http://localhost:3000/admin |
| Email | `admin@satnamthreads.com` |
| Password | `satnam@2026` |

**Change this password immediately** in *Admin → Settings*.

A demo wholesale customer is also created so you can see slab pricing in action: `buyer@example.com` / `demo1234`. Delete it before you go live (*Admin → Customers*).

---

## What's in the box

### Storefront

| Feature | Notes |
|---|---|
| Home page | Hero, category grid, best sellers, new arrivals, wholesale pitch |
| Catalogue | Filter by category, price, stock, offers, new, pack weight · sort 6 ways · pagination |
| Search | Searches name, SKU and description |
| Product pages | Image gallery, slab pricing table, specs, tabs, related products |
| Cart | Quantity editing, coupon codes, live delivery-charge calculation |
| Checkout | Full delivery form, GSTIN capture, three payment methods |
| Enquiry list | The B2B flow — a separate basket that submits a quote request instead of an order |
| Wishlist | Saves without needing an account |
| Accounts | Register as retail or wholesale, order history, enquiry history with your quotes |
| Order tracking | Public — order number plus email or phone |
| Content pages | About, Shipping, Returns, Terms, Privacy — all editable |
| Contact | Form plus WhatsApp-first contact throughout |
| SEO | Per-page titles and descriptions, canonical tags, Open Graph, Product and Organization structured data, `sitemap.xml`, `robots.txt` |
| Mobile | Fully responsive, with a bottom navigation bar and a floating WhatsApp button |

### Admin panel

* **Dashboard** — revenue, orders, open enquiries, customers, low stock, best sellers
* **Products** — full add/edit/delete, image upload, wholesale slab pricing, stock, MOQ, HSN and GST
* **Categories** — nested two levels, images, sort order
* **Orders** — filter, update status and payment, add tracking, printable GST invoice, CSV export
* **Enquiries** — the quoting screen: enter your price per line, save, then send by WhatsApp or email in one click
* **Customers** — approve wholesale applications, convert retail accounts to wholesale, block accounts
* **Coupons** — percentage or flat, with minimum-order rules
* **Pages** — edit any content page
* **Messages & subscribers** — contact form inbox and newsletter list with CSV export
* **Settings** — business details, shipping thresholds, payment keys, your own login

---

## How the two order flows differ

**Retail** — browse → *Add to cart* → checkout → pay → you fulfil.

**Wholesale** — browse → *Add to enquiry* → submit with quantities → you quote in the admin panel → customer sees the quote on their account → you convert it to an order.

Both are always available. A wholesale customer can still check out and pay online at their slab price; the enquiry route exists for large or mixed baskets where freight needs quoting.

### Slab pricing

Each product can carry any number of quantity slabs (e.g. 6+ at ₹440, 24+ at ₹415, 60+ at ₹392). These are **only visible to wholesale accounts you have approved**. Retail customers see the normal price. Set them under *Admin → Products → Pricing*.

---

## Taking online payments

Out of the box, orders are placed as **awaiting payment** and you settle by bank transfer, UPI or cash on delivery. That works from day one.

To accept cards and UPI automatically:

1. Open a [Razorpay](https://razorpay.com) account (or any Indian gateway).
2. Copy your **Key ID** and **Key Secret**.
3. Paste them into *Admin → Settings → Payments* and tick **Payments are live**.

Bank transfer and cash on delivery keep working alongside.

---

## Going live on a real domain

1. Point your domain at a small Node host — Railway, Render, Fly.io, DigitalOcean or any VPS all work. Around ₹400–800 a month.
2. Set two environment variables on the host:
   * `SITE_URL=https://satnamthreads.com`
   * `ADMIN_PASSWORD=` *(your own password)*
3. Deploy the folder. The host runs `npm start`.
4. Make sure the `data/` folder is on persistent storage — that is where your database lives.

Copy `.env.example` to `.env` to set these locally.

**Before launch:** change the admin password, delete the demo customer, replace the placeholder GSTIN and bank details in Settings, and swap the generated product artwork for real photographs.

---

## Product images

Every product and category ships with clean generated artwork so the site never looks unfinished. Replace them with real photographs at your own pace — *Admin → Products → Images*, upload or paste a URL. Square images look best.

To regenerate the artwork after adding products: `npm run images`

---

## Your data

Everything lives in one file: `data/satnam.db` (SQLite).

**Back it up by copying that file.** That is your entire store — products, orders, customers, enquiries, settings. Uploaded images live in `public/uploads/`; back that up too.

To wipe everything and start over with the sample catalogue: `npm run reset`

### A note on where you put the folder

Keep the site in a normal folder on your hard drive — for example `Documents/satnam-threads`. Databases don't work reliably inside Dropbox, OneDrive, Google Drive or network drives. If you do put it in one of those, the site will still start but will warn you on screen and store the database elsewhere, which risks losing data. Back up by copying the folder yourself instead of relying on cloud sync.


---

## Folder map

```
satnam-threads/
├── server.js              start here — the web server
├── start.command          double-click to run (Mac)
├── package.json
├── .env.example           optional configuration
├── src/
│   ├── db.js              database structure
│   ├── seed.js            the starting catalogue — edit to change sample data
│   ├── gen-images.js      generates product artwork
│   ├── helpers.js         pricing, formatting, passwords
│   ├── store.js           catalogue, cart and totals logic
│   ├── session.js         logins and baskets
│   ├── http.js            routing, forms, file uploads
│   ├── template.js        page rendering
│   └── routes/            shop · cart · account · admin
├── views/                 every page's HTML
├── public/                styles, scripts, images, uploads
└── data/                  your database (created on first run)
```

---

## Sample catalogue

24 categories in 5 ranges, with 29 sample products carrying real pricing, slab tiers, pack sizes and descriptions:

Eyebrow Threading Thread · Tag Guns & Accessories (guns, needles, standard barbs, fine barbs) · Tags & Labels (paper, nylon, PVC, thread string, tear proof, label rolls) · Pins & Fasteners (safety pins, shirt clips, loop pins, security loops) · Packing & Finishing (glue sticks, thread cutters, wash care, taffeta, organza pouches)

Add the rest of your range through the admin panel, or bulk-edit `src/seed.js` and run `npm run reset`.

---

## Testing

The build was verified with 108 automated end-to-end checks covering every page, both order flows, accounts, and every admin create/edit/delete operation — plus a full crawl of 67 pages and 47 assets with no broken links.
