const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('E:/WORKBENCH/server/database.sqlite');
db.all("SELECT id, email, role FROM users", [], (err, rows) => {
  if (err) throw err;
  console.log(rows);
});
