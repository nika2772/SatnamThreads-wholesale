'use strict';
/* Minimal EJS-compatible template engine. No dependencies. */
const fs = require('fs');
const path = require('path');

const VIEWS = path.join(__dirname, '..', 'views');
const cache = new Map();
const DEV = process.env.NODE_ENV !== 'production';

function esc(v) {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function compile(src, filename) {
  let code = "let __o='';\n";
  let i = 0;
  while (i < src.length) {
    const open = src.indexOf('<%', i);
    if (open === -1) { code += '__o+=' + JSON.stringify(src.slice(i)) + ';\n'; break; }
    if (open > i) code += '__o+=' + JSON.stringify(src.slice(i, open)) + ';\n';
    let close = src.indexOf('%>', open);
    if (close === -1) throw new Error('Unclosed <% in ' + filename);
    let tag = src.slice(open + 2, close);
    let trimNl = false;
    if (tag.endsWith('-')) { tag = tag.slice(0, -1); trimNl = true; }
    if (tag[0] === '=') code += '__o+=__esc(' + tag.slice(1) + ');\n';
    else if (tag[0] === '-') code += '__o+=(' + tag.slice(1) + ')??"";\n';
    else if (tag[0] === '#') { /* comment */ }
    else code += tag + '\n';
    i = close + 2;
    if (trimNl && src[i] === '\n') i++;
  }
  code += 'return __o;';
  // eslint-disable-next-line no-new-func
  const fn = new Function('__data', '__esc', '__include', 'with(__data){' + code + '}');
  return (data, include) => fn(data, esc, include);
}

function load(view) {
  const file = path.join(VIEWS, view.endsWith('.ejs') ? view : view + '.ejs');
  if (!DEV && cache.has(file)) return cache.get(file);
  if (DEV && cache.has(file)) {
    const st = fs.statSync(file);
    const c = cache.get(file);
    if (c.mtime === st.mtimeMs) return c;
  }
  const src = fs.readFileSync(file, 'utf8');
  const entry = { render: compile(src, file), mtime: fs.statSync(file).mtimeMs };
  cache.set(file, entry);
  return entry;
}

function render(view, data = {}) {
  const include = (v, extra) => render(v, Object.assign({}, data, extra || {}));
  return load(view).render(Object.assign({ include }, data), include);
}

module.exports = { render, esc };
