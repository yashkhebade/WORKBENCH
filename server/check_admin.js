const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function checkAdmin() {
  await client.connect();
  const res = await client.query("SELECT id, email, role FROM users WHERE role = 'Admin'");
  console.log(res.rows);
  await client.end();
}

checkAdmin().catch(console.error);
