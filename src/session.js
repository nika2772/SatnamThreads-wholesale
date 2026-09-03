'use strict';
const { db } = require('./db');
const { token } = require('./helpers');

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function cleanup() {
  db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now());
}
setInterval(cleanup, 60 * 60 * 1000).unref?.();

function attach(req, res) {
  let sid = req.cookies.sid;
  let row = sid ? db.prepare('SELECT * FROM sessions WHERE sid=? AND expires>?').get(sid, Date.now()) : null;
  if (!row) {
    sid = token(18);
    db.prepare('INSERT INTO sessions(sid,data,expires) VALUES(?,?,?)')
      .run(sid, '{}', Date.now() + MAX_AGE * 1000);
    row = { sid, data: '{}' };
    res.cookie('sid', sid, { maxAge: MAX_AGE });
  }
  let data;
  try { data = JSON.parse(row.data) || {}; } catch { data = {}; }
  req.sid = sid;
  req.session = data;
  req.saveSession = () => {
    db.prepare('UPDATE sessions SET data=?, expires=? WHERE sid=?')
      .run(JSON.stringify(req.session), Date.now() + MAX_AGE * 1000, sid);
  };
  req.flash = (type, msg) => { (req.session.flash ||= []).push({ type, msg }); req.saveSession(); };
  req.regenerate = () => {
    db.prepare('DELETE FROM sessions WHERE sid=?').run(sid);
    const nsid = token(18);
    db.prepare('INSERT INTO sessions(sid,data,expires) VALUES(?,?,?)')
      .run(nsid, JSON.stringify(req.session), Date.now() + MAX_AGE * 1000);
    req.sid = nsid;
    res.cookie('sid', nsid, { maxAge: MAX_AGE });
  };
}

module.exports = { attach };
