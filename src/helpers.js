'use strict';
const crypto = require('node:crypto');

const slugify = s => String(s).toLowerCase().trim()
  .replace(/["'’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);

const money = n => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const moneyShort = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const json = (s, fallback) => { try { const v = JSON.parse(s); return v ?? fallback; } catch { return fallback; } };

function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = crypto.scryptSync(String(pw), salt, 64).toString('hex');
  return `scrypt$${salt}$${key}`;
}
function verifyPassword(pw, stored) {
  if (!stored) return false;
  const [alg, salt, key] = String(stored).split('$');
  if (alg !== 'scrypt' || !salt || !key) return false;
  const test = crypto.scryptSync(String(pw), salt, 64);
  const ref = Buffer.from(key, 'hex');
  return ref.length === test.length && crypto.timingSafeEqual(ref, test);
}

const token = (n = 24) => crypto.randomBytes(n).toString('base64url');

/* Effective unit price given account type and quantity. */
function priceFor(product, qty = 1, user = null) {
  const tiers = json(product.tiers, []) || [];
  const wholesale = user && user.account_type === 'wholesale' && user.status === 'active';
  if (wholesale && tiers.length) {
    const eligible = tiers.filter(t => qty >= Number(t.min_qty || 1))
      .sort((a, b) => Number(b.min_qty) - Number(a.min_qty));
    if (eligible.length) return Number(eligible[0].price);
    const lowest = tiers.slice().sort((a, b) => Number(a.min_qty) - Number(b.min_qty))[0];
    if (lowest) return Number(lowest.price);
  }
  return Number(product.price || 0);
}

function discountPct(p) {
  const mrp = Number(p.mrp || 0), price = Number(p.price || 0);
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

function firstImage(p) {
  const imgs = json(p.images, []) || [];
  if (imgs.length) return imgs[0];
  return '/static/img/placeholder.svg';
}

function paginate(total, page, per) {
  const pages = Math.max(1, Math.ceil(total / per));
  page = Math.min(Math.max(1, page), pages);
  return { page, pages, per, total, offset: (page - 1) * per, hasPrev: page > 1, hasNext: page < pages };
}

function nextNumber(db, table, col, prefix) {
  const row = db.prepare(`SELECT ${col} AS n FROM ${table} ORDER BY id DESC LIMIT 1`).get();
  let seq = 1000;
  if (row && row.n) {
    const m = /(\d+)$/.exec(row.n);
    if (m) seq = parseInt(m[1], 10);
  }
  return `${prefix}${seq + 1}`;
}

const timeAgo = iso => {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  if (s < 2592000) return Math.floor(s / 86400) + 'd ago';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const fmtDate = iso => iso ? new Date(iso.replace(' ', 'T') + 'Z')
  .toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

const highlightText = (text, query) => {
  if (!query || !text) return text;
  const terms = query.split(/\s+/).filter(t => t.length > 0)
    .sort((a, b) => b.length - a.length)
    .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (terms.length === 0) return text;
  const combinedRegex = new RegExp('(^|\\W)(' + terms.join('|') + ')', 'gi');
  return String(text).replace(combinedRegex, '$1<mark style="background-color: var(--gold); color: #fff; padding: 0 2px; border-radius: 2px;">$2</mark>');
};

module.exports = {
  slugify, money, moneyShort, json, hashPassword, verifyPassword, token,
  priceFor, discountPct, firstImage, paginate, nextNumber, timeAgo, fmtDate, highlightText
};
