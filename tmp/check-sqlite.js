const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('prisma/dev.db');

db.serialize(() => {
  db.each("SELECT name FROM sqlite_master WHERE type='table'", (err, table) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log(`Table: ${table.name}`);
    db.get(`SELECT count(*) as count FROM "${table.name}"`, (err, row) => {
      if (!err) {
        console.log(`  Count: ${row.count}`);
      }
    });
  });
});

db.close();
