import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./prisma/dev.db');

db.all('SELECT id, email, role FROM User', [], (err, rows) => {
  if (err) throw err;
  console.log("=== USERS ===");
  rows.forEach(r => console.log(`${r.id} | ${r.email} | ${r.role}`));
});

db.all('SELECT id, name, subdomain, ownerId FROM Store', [], (err, rows) => {
  if (err) throw err;
  console.log("=== STORES ===");
  rows.forEach(r => console.log(`${r.id} | ${r.name} | ${r.subdomain} | owner: ${r.ownerId}`));
  db.close();
});
